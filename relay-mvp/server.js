import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { scoreReadiness, simulateQuery, toAgentProduct, toJsonLd, toOpenAIProduct } from "./lib/knowledge.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const publicRoot = join(root, "public");
const catalogPath = join(root, "data", "catalog.json");
const port = Number(process.env.PORT || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

async function getCatalog() {
  return JSON.parse(await readFile(catalogPath, "utf8"));
}

function sendJson(res, status, value) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*"
  });
  res.end(JSON.stringify(value, null, 2));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 2_000_000) throw new Error("Payload is larger than 2 MB");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function productOrigin(req, brand) {
  const configured = brand?.domain ? `https://${brand.domain}` : null;
  return configured || `http://${req.headers.host}`;
}

async function handleApi(req, res, url) {
  const catalog = await getCatalog();
  const origin = productOrigin(req, catalog.brand);

  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, service: "relay", version: "1.0.0" });
  }

  if (req.method === "GET" && url.pathname === "/api/catalog") {
    const products = catalog.products.map((product) => ({
      ...product,
      readiness: scoreReadiness(product)
    }));
    return sendJson(res, 200, { ...catalog, products });
  }

  if (req.method === "GET" && url.pathname === "/.well-known/agent-products.json") {
    return sendJson(res, 200, {
      schema_version: "1.0",
      brand: catalog.brand,
      generated_at: new Date().toISOString(),
      products: catalog.products.map((product) => toAgentProduct(product, origin))
    });
  }

  if (req.method === "GET" && url.pathname === "/feeds/openai-products-preview.json") {
    const marketReady = catalog.brand.country === "US";
    return sendJson(res, 200, {
      schema: "openai-agentic-commerce-stable-aligned",
      integration_status: marketReady ? "eligible_for_submission" : "market_eligibility_review_required",
      validation_warnings: marketReady ? [] : ["Verify current OpenAI Commerce country eligibility before production submission."],
      generated_at: new Date().toISOString(),
      products: catalog.products.map((product) => toOpenAIProduct(product, catalog.brand, origin))
    });
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/products/")) {
    const id = decodeURIComponent(url.pathname.split("/").pop());
    const product = catalog.products.find((item) => item.id === id);
    return product
      ? sendJson(res, 200, { product: toAgentProduct(product, origin), jsonLd: toJsonLd(product, origin) })
      : sendJson(res, 404, { error: "Product not found" });
  }

  if (req.method === "POST" && url.pathname === "/api/simulate") {
    const body = await readBody(req);
    if (!body.query || String(body.query).trim().length < 3) return sendJson(res, 400, { error: "Enter a shopping intent." });
    const products = Array.isArray(body.products) && body.products.length ? body.products.slice(0, 500) : catalog.products;
    return sendJson(res, 200, simulateQuery(String(body.query), products));
  }

  if (req.method === "POST" && url.pathname === "/api/validate") {
    const body = await readBody(req);
    const products = Array.isArray(body.products) ? body.products : [];
    const results = products.map((product) => ({ id: product.id || null, name: product.name || "Untitled product", ...scoreReadiness(product) }));
    return sendJson(res, 200, {
      valid: results.length > 0 && results.every((item) => item.score >= 55),
      averageScore: results.length ? Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length) : 0,
      results
    });
  }

  return false;
}

async function serveStatic(res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const resolved = normalize(join(publicRoot, requested));
  if (!resolved.startsWith(publicRoot)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  try {
    const content = await readFile(resolved);
    res.writeHead(200, {
      "content-type": MIME[extname(resolved)] || "application/octet-stream",
      "cache-control": "no-cache"
    });
    res.end(content);
  } catch {
    try {
      const content = await readFile(join(publicRoot, "index.html"));
      res.writeHead(200, { "content-type": MIME[".html"], "cache-control": "no-cache" });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "content-type"
      });
      return res.end();
    }
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/.well-known/") || url.pathname.startsWith("/feeds/")) {
      const handled = await handleApi(req, res, url);
      if (handled !== false) return;
      return sendJson(res, 404, { error: "Endpoint not found" });
    }
    await serveStatic(res, decodeURIComponent(url.pathname));
  } catch (error) {
    sendJson(res, error.message.includes("2 MB") ? 413 : 500, { error: error.message || "Unexpected server error" });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Relay is running at http://127.0.0.1:${port}`);
});
