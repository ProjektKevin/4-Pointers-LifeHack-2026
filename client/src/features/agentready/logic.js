// Pure business logic for the AgentReady Commerce feature: readiness scoring,
// natural-language query parsing, ranking, and catalog import/export helpers.
// Ported from the original prototype's app.js, with all DOM/rendering code
// stripped out — every function here is pure (no globals, no side effects)
// so it can be used directly from React components/context.

export function getProduct(products, id) {
  return products.find((product) => product.id === id) || products[0];
}

export function verticalLabel(vertical) {
  return { running: "Running", skincare: "Skincare", air: "Air care" }[vertical] || vertical;
}

function pathValue(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);
}

export function readinessFor(product) {
  const requirements = {
    running: ["price", "description", "useCases", "idealFor", "personas", "specs.weightG", "specs.dropMm", "specs.climate", "claims", "faqs"],
    skincare: ["price", "description", "useCases", "idealFor", "personas", "specs.steps", "specs.minutes", "specs.skinType", "sustainability", "claims"],
    air: ["price", "description", "useCases", "idealFor", "personas", "specs.coverageM2", "specs.noiseDb", "specs.filter", "specs.cadrM3H", "claims"],
  }[product.vertical];
  const completeness = Math.round((requirements.filter((path) => hasValue(pathValue(product, path))).length / requirements.length) * 100);
  const intentSignals = [product.useCases?.length >= 4, product.idealFor?.length >= 3, product.personas?.length >= 3, product.tradeoffs?.length >= 2, product.faqs?.length >= 3];
  const intentCoverage = Math.round((intentSignals.filter(Boolean).length / intentSignals.length) * 100);
  const machineFields = product.attributes?.length || 0;
  const machineReadability = Math.min(100, 50 + machineFields * 8);
  const evidenceCount = product.claims?.filter((claim) => claim.verified && claim.evidence).length || 0;
  const evidence = Math.min(100, evidenceCount * 25 + (product.sustainability?.score >= 80 ? 5 : 0));
  const ageDays = Math.max(0, (Date.now() - new Date(product.lastUpdated).getTime()) / 86400000);
  const freshness = ageDays < 120 ? 100 : ageDays < 240 ? 88 : 74;
  const overall = Math.round(completeness * 0.28 + intentCoverage * 0.25 + machineReadability * 0.19 + evidence * 0.18 + freshness * 0.1);
  const biggestGap = product.contentGaps?.[0] || (evidence < 75 ? "Add claim-level proof" : "Add more comparison context");
  return { overall, completeness, intentCoverage, machineReadability, evidence, freshness, biggestGap };
}

export function formatMoney(product) {
  return `${product.currency || "S$"}${product.price}`;
}

function parseBudget(text) {
  const match = text.match(/(?:under|below|less than|up to|max(?:imum)?(?: of)?)\s*(?:s\s*\$|\$)?\s*(\d{2,4})/i);
  return match ? Number(match[1]) : null;
}

function parseMinutes(text) {
  const match = text.match(/(?:less than|under|within|in)\s*(\d+)\s*(?:minutes?|mins?)/i) || text.match(/(\d+)\s*(?:minutes?|mins?)/i);
  return match ? Number(match[1]) : null;
}

function parseArea(text) {
  const match = text.match(/(\d+)\s*(?:m2|m²|square\s*meters?)/i);
  return match ? Number(match[1]) : null;
}

export function parseQuery(rawQuery) {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();
  let vertical = null;
  if (/(running|shoes?|half[- ]marathon|easy runs?|tempo)/i.test(lower)) vertical = "running";
  if (/(skincare|skin|routine|oily|serum|spf|fragrance[- ]free)/i.test(lower)) vertical = "skincare";
  if (/(air purifier|purifier|bedroom|sleep noise|pm2\.5|air quality)/i.test(lower)) vertical = "air";
  const budget = parseBudget(lower);
  const minutes = parseMinutes(lower);
  const area = parseArea(lower);
  const signals = [];
  const addSignal = (key, label, detail, test, priority = 1) => signals.push({ key, label, detail, test, priority });

  if (vertical === "running") {
    if (/half[- ]marathon/i.test(lower)) addSignal("halfMarathon", "Half marathon", "Built for half-marathon training or race day", (p) => p.useCases.includes("half marathon"), 2);
    if (/humid|singapore|warm|tropical|heat/i.test(lower)) addSignal("humid", "Humid weather", "Climate-specific breathability signal", (p) => /humid|warm/i.test(p.specs.climate) || p.useCases.includes("humid weather"), 2);
    if (/lightweight|light weight|light shoe|low weight/i.test(lower)) addSignal("lightweight", "Lightweight", "Measured shoe weight below 230 g", (p) => p.specs.weightG <= 230, 2);
    if (/beginner|new runner|first/i.test(lower)) addSignal("beginner", "Beginner-friendly", "Content is mapped to first-time runners", (p) => p.personas.some((item) => /beginner|first-time/i.test(item)), 1);
    if (/easy run|easy runs|daily/i.test(lower)) addSignal("easyRuns", "Easy runs", "Mapped to comfortable daily mileage", (p) => p.useCases.some((item) => /daily|easy/i.test(item)), 1);
  }
  if (vertical === "skincare") {
    if (/oily|oil[- ]control|combination/i.test(lower)) addSignal("oilySkin", "Oily skin", "Routine is labeled for oily or combination skin", (p) => /oily|combination/i.test(p.specs.skinType), 2);
    if (/sustainable|eco|refill|low[- ]waste|planet/i.test(lower)) addSignal("sustainable", "Sustainable", "Refill, packaging, and sustainability context present", (p) => p.sustainability.score >= 80 || p.specs.refillable, 2);
    if (/fragrance[- ]free|unscented|no fragrance/i.test(lower)) addSignal("fragranceFree", "Fragrance-free", "No added fragrance signal", (p) => /fragrance-free/i.test(p.specs.fragrance), 1);
    if (minutes !== null) addSignal("time", `${minutes}-min morning`, `Routine is documented at ${minutes} minutes or less`, (p) => p.specs.minutes <= minutes, 2);
  }
  if (vertical === "air") {
    if (/quiet|silent|sleep|noise|light sleeper/i.test(lower)) addSignal("quiet", "Quiet sleep", "Measured sleep-mode noise at or below 28 dB", (p) => p.specs.noiseDb <= 28, 2);
    if (/small bedroom|small room|20\s*m|compact/i.test(lower)) addSignal("smallRoom", "Small bedroom", "Coverage fits a compact room without oversizing", (p) => p.specs.coverageM2 >= (area || 12) && p.specs.coverageM2 <= 25, 2);
    if (area !== null) addSignal("area", `${area} m² coverage`, `Published coverage meets a ${area} m² room`, (p) => p.specs.coverageM2 >= area, 2);
  }
  if (budget !== null) addSignal("budget", `Under ${query.match(/s\s*\$\s*\d+/i)?.[0] || `$${budget}`}`, `Price is at or below ${formatMoney({ currency: "S$", price: budget })}`, (p) => p.price <= budget, 2);

  return { raw: query, vertical, budget, minutes, area, signals };
}

export function queryResult(product, parsed) {
  const readiness = readinessFor(product);
  const categoryMatch = !parsed.vertical || product.vertical === parsed.vertical;
  const signalResults = parsed.signals.map((signal) => ({ ...signal, matched: Boolean(signal.test(product)) }));
  const matched = signalResults.filter((signal) => signal.matched).reduce((sum, signal) => sum + signal.priority, 0);
  const possible = signalResults.reduce((sum, signal) => sum + signal.priority, 0) || 1;
  const intentFit = Math.round((matched / possible) * 100);
  const budgetMatch = parsed.budget === null || product.price <= parsed.budget;
  let score = (categoryMatch ? 39 : 0) + intentFit * 0.44 + (budgetMatch ? 8 : -20) + readiness.overall * 0.09;
  if (!categoryMatch) score -= 40;
  score = Math.max(0, Math.min(99, Math.round(score)));
  const missing = signalResults.filter((signal) => !signal.matched).map((signal) => signal.label);
  const matchedSignals = signalResults.filter((signal) => signal.matched).map((signal) => signal.label);
  return { product, readiness, score, intentFit, categoryMatch, budgetMatch, signalResults, missing, matchedSignals };
}

export function runSimulation(products, rawQuery) {
  const parsed = parseQuery(rawQuery);
  const candidates = products
    .map((product) => queryResult(product, parsed))
    .filter((result) => !parsed.vertical || result.product.vertical === parsed.vertical)
    .sort((a, b) => b.score - a.score || b.readiness.overall - a.readiness.overall);
  const results = candidates.slice(0, 3);
  return { parsed, results };
}

export function factRowsFor(product) {
  if (product.vertical === "running") {
    return [["Price", formatMoney(product)], ["Best for", product.idealFor[0]], ["Proof points", `${product.claims.length} verified claims`], ["Sustainability", `${product.sustainability.score}/100 context score`]];
  }
  if (product.vertical === "skincare") {
    return [["Price", formatMoney(product)], ["Routine", `${product.specs.steps} steps · ${product.specs.minutes} min`], ["Skin type", product.specs.skinType], ["Sustainability", `${product.sustainability.score}/100 context score`]];
  }
  return [["Price", formatMoney(product)], ["Coverage", `${product.specs.coverageM2} m²`], ["Sleep mode", `${product.specs.noiseDb} dB`], ["Filter", product.specs.filter]];
}

export function resultReason(result) {
  const p = result.product;
  if (p.vertical === "running") return `${p.specs.weightG} g with ${p.specs.breathability.toLowerCase()} breathability and an ${p.specs.dropMm} mm drop.`;
  if (p.vertical === "skincare") return `${p.specs.steps} steps in ${p.specs.minutes} minutes for ${p.specs.skinType.toLowerCase()} skin.`;
  return `${p.specs.noiseDb} dB sleep mode with ${p.specs.coverageM2} m² published coverage.`;
}

export function agentSummary(product, parsed = null) {
  const p = product;
  if (p.vertical === "running") {
    if (parsed?.vertical === "running") return `${p.brand} ${p.name} is a strong match for runners building toward a half marathon in warm, humid conditions: its ${p.specs.weightG} g build and high-breathability mesh keep the recommendation grounded in measurable product facts.`;
    return `${p.brand} ${p.name} is a breathable daily trainer for runners who want a light, responsive ride for everyday road mileage.`;
  }
  if (p.vertical === "skincare") {
    return `${p.brand} ${p.name} is a ${p.specs.minutes}-minute, ${p.specs.steps}-step morning routine for ${p.specs.skinType.toLowerCase()} skin, with ${p.sustainability.score >= 80 ? "strong refill and packaging signals" : "documented product-level details"}.`;
  }
  return `${p.brand} ${p.name} is a compact bedroom purifier with ${p.specs.noiseDb} dB sleep mode, ${p.specs.coverageM2} m² published coverage, and a HEPA-based filter specification.`;
}

export function structuredProduct(product) {
  const readiness = readinessFor(product);
  return {
    schema: "agentready.product.v1",
    identity: { id: product.id, brand: product.brand, name: product.name, category: product.category, price: `${product.currency}${product.price}` },
    agent_summary: agentSummary(product),
    ideal_for: product.idealFor,
    use_cases: product.useCases,
    personas: product.personas,
    normalized_attributes: product.specs,
    benefits: product.benefits,
    evidence: product.claims,
    tradeoffs: product.tradeoffs,
    sustainability_context: product.sustainability,
    faqs: product.faqs,
    readiness: { overall: readiness.overall, completeness: readiness.completeness, intent_coverage: readiness.intentCoverage, evidence: readiness.evidence, biggest_gap: readiness.biggestGap },
    last_updated: product.lastUpdated,
  };
}

export function traceOutput(parsed, results) {
  const top = results[0];
  return {
    query: parsed.raw,
    detected_intent: {
      category: parsed.vertical,
      budget: parsed.budget ? `S$${parsed.budget}` : null,
      constraints: parsed.signals.map((signal) => signal.label),
    },
    ranking: results.map((result, index) => ({
      rank: index + 1,
      product: `${result.product.brand} ${result.product.name}`,
      intent_fit: `${result.score}%`,
      matched_signals: result.matchedSignals,
      missing_signals: result.missing,
      readiness: `${result.readiness.overall}%`,
    })),
    top_reason: top ? agentSummary(top.product, parsed) : null,
  };
}

export function runSweep(products, goldenQueries) {
  return goldenQueries.map((item) => {
    const { results } = runSimulation(products, item.query);
    const top = results[0];
    const gaps = results.slice(0, 2).flatMap((candidate) => candidate.missing.length ? candidate.missing : candidate.product.contentGaps.slice(0, 1));
    return { ...item, topScore: top?.score || 0, topProduct: top ? `${top.product.brand} ${top.product.name}` : null, success: Boolean(top && top.score >= 75), gaps: [...new Set(gaps)] };
  });
}

function safeJSON(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function coerceImportedProduct(raw, index) {
  const product = { ...raw };
  product.id = product.id || `imported-${index + 1}`;
  product.brand = product.brand || "Imported brand";
  product.name = product.name || `Imported product ${index + 1}`;
  product.category = product.category || "Product";
  product.vertical = product.vertical || (/(skin|serum|routine)/i.test(product.category) ? "skincare" : /(air|purifier)/i.test(product.category) ? "air" : "running");
  product.icon = product.icon || ({ running: "↗", skincare: "✦", air: "≈" }[product.vertical] || "•");
  product.currency = product.currency || "S$";
  product.price = Number(product.price || product.priceSGD || 0);
  product.description = product.description || "Imported product awaiting enrichment.";
  const listValue = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    const parsed = typeof value === "string" ? safeJSON(value, null) : null;
    return Array.isArray(parsed) ? parsed : String(value).split(/[|,]/).map((item) => item.trim()).filter(Boolean);
  };
  product.idealFor = listValue(product.idealFor);
  product.personas = listValue(product.personas);
  product.useCases = listValue(product.useCases);
  const flatSpecKeys = ["weightG", "dropMm", "stackMm", "coverageM2", "noiseDb", "cadrM3H", "minutes", "steps", "skinType", "climate", "filter", "breathability", "support", "refillable"];
  const flatSpecs = Object.fromEntries(flatSpecKeys.filter((key) => hasValue(product[key])).map((key) => [key, product[key]]));
  product.specs = typeof product.specs === "string" ? safeJSON(product.specs, flatSpecs) : { ...flatSpecs, ...(product.specs || {}) };
  product.attributes = Array.isArray(product.attributes) ? product.attributes : Object.entries(product.specs).slice(0, 8).map(([key, value]) => [key, String(value)]);
  product.claims = Array.isArray(product.claims) ? product.claims : [];
  product.tradeoffs = Array.isArray(product.tradeoffs) ? product.tradeoffs : [];
  product.contentGaps = Array.isArray(product.contentGaps) ? product.contentGaps : ["Add intent-specific context", "Add claim-level evidence"];
  if (typeof product.sustainability === "string") product.sustainability = { score: Number(product.sustainability) || 40, detail: "Imported sustainability signal; add source context." };
  product.sustainability = product.sustainability || { score: 40, detail: "No sustainability context imported." };
  product.faqs = Array.isArray(product.faqs) ? product.faqs : [];
  product.rating = Number(product.rating || 0);
  product.reviews = Number(product.reviews || 0);
  product.status = product.status || "Needs enrichment";
  product.lastUpdated = product.lastUpdated || new Date().toISOString().slice(0, 10);
  return product;
}

export function parseCSV(text) {
  const rows = text.trim().split(/\r?\n/).filter(Boolean).map((line) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((cell) => cell.trim().replace(/^"|"$/g, "")));
  if (!rows.length) return [];
  const headers = rows.shift();
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
}

export function parseImportedFileContent(filename, text) {
  const raw = /\.json$/i.test(filename) ? JSON.parse(text) : parseCSV(text);
  const list = Array.isArray(raw) ? raw : raw.products || raw.items || [];
  if (!list.length) throw new Error("No products found");
  return list.map(coerceImportedProduct);
}

export function exportedLayer(products) {
  return { schema: "agentready.catalog.v1", generated_at: new Date().toISOString(), products: products.map(structuredProduct) };
}
