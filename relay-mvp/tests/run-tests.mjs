import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { scoreReadiness, simulateQuery, toAgentProduct, toJsonLd, toOpenAIProduct, tokenize } from "../lib/knowledge.js";

const catalog = JSON.parse(await readFile(new URL("../data/catalog.json", import.meta.url), "utf8"));
const [aeroSwift] = catalog.products;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("tokenizer removes filler words and punctuation", () => {
  assert.deepEqual(tokenize("I need lightweight shoes, in Singapore!"), ["need", "lightweight", "shoes", "singapore"]);
});

test("readiness score is bounded and explains every point", () => {
  const result = scoreReadiness(aeroSwift);
  assert.ok(result.score >= 75 && result.score <= 100);
  assert.equal(result.checks.reduce((sum, item) => sum + item.weight, 0), 100);
  assert.equal(result.checks.every((item) => typeof item.passed === "boolean"), true);
});

test("live-demo intent ranks the grounded, in-budget product first", () => {
  const result = simulateQuery("I'm training for a half marathon in Singapore's humid weather and need lightweight shoes under S$200, size 10.", catalog.products);
  assert.equal(result.results[0].product.id, "NS-RN-204");
  assert.equal(result.results[0].constraints.includes("Within S$200 budget"), true);
  assert.equal(result.results[0].evidence.some((item) => item.source === "catalog.weightGrams"), true);
  assert.equal(result.results.find((item) => item.product.id === "NS-RN-165").constraints.includes("Exceeds S$200 budget"), true);
});

test("trail intent ranks wet-trail product first", () => {
  const result = simulateQuery("I need grippy shoes for wet tropical trails, size 10.", catalog.products);
  assert.equal(result.results[0].product.id, "NS-RN-231");
});

test("JSON-LD keeps commercial claims aligned", () => {
  const jsonLd = toJsonLd(aeroSwift, "https://northstar.example");
  assert.equal(jsonLd["@type"], "Product");
  assert.equal(jsonLd.sku, aeroSwift.id);
  assert.equal(jsonLd.description, aeroSwift.description);
  assert.equal(jsonLd.offers.price, aeroSwift.price);
  assert.equal(jsonLd.offers.availability, "https://schema.org/InStock");
});

test("agent feed includes provenance and substantiation", () => {
  const agentProduct = toAgentProduct(aeroSwift, "https://northstar.example");
  assert.equal(agentProduct.provenance.approved, true);
  assert.ok(agentProduct.substantiation.length > 0);
  assert.equal(agentProduct.commercial.currency, "SGD");
});

test("OpenAI commerce adapter contains the required flat product fields", () => {
  const row = toOpenAIProduct(aeroSwift, catalog.brand, "https://northstar.example");
  for (const field of ["item_id", "title", "description", "url", "image_url", "availability", "price", "brand", "seller_name", "target_countries"]) {
    assert.ok(row[field], `${field} is required`);
  }
  assert.equal(row.availability, "in_stock");
  assert.equal(row.price, "179 SGD");
});

const testPort = 4197;
const child = spawn(process.execPath, ["server.js"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, PORT: String(testPort) },
  stdio: ["ignore", "pipe", "pipe"]
});

try {
  let ready = false;
  for (let attempt = 0; attempt < 25; attempt += 1) {
    try {
      const health = await fetch(`http://127.0.0.1:${testPort}/api/health`);
      if (health.ok) { ready = true; break; }
    } catch {}
    await delay(80);
  }
  assert.equal(ready, true, "test server did not start");

  const feed = await fetch(`http://127.0.0.1:${testPort}/.well-known/agent-products.json`).then((response) => response.json());
  assert.equal(feed.products.length, catalog.products.length);
  assert.equal(feed.products[0].provenance.approved, true);
  console.log("✓ agent feed endpoint returns approved product records");

  const openAiFeed = await fetch(`http://127.0.0.1:${testPort}/feeds/openai-products-preview.json`).then((response) => response.json());
  assert.equal(openAiFeed.products[0].item_id, "NS-RN-204");
  assert.equal(openAiFeed.integration_status, "market_eligibility_review_required");
  console.log("✓ OpenAI commerce adapter reports fields and market eligibility");

  const simulationResponse = await fetch(`http://127.0.0.1:${testPort}/api/simulate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "lightweight half marathon shoes under S$200" })
  });
  assert.equal(simulationResponse.ok, true);
  const simulation = await simulationResponse.json();
  assert.equal(simulation.results[0].product.id, "NS-RN-204");
  console.log("✓ simulation API enforces grounded ranking");

  const home = await fetch(`http://127.0.0.1:${testPort}/`).then((response) => response.text());
  assert.ok(home.includes("Make your products easier for AI to recommend."));
  console.log("✓ web application is served");
} finally {
  child.kill("SIGTERM");
}

console.log("\nAll Relay checks passed.");
