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

// Single source of truth for every *qualitative* signal the query engine can detect
// (as opposed to the numeric ones — budget/minutes/area — which are parsed directly
// from the query text and synthesized below). Both the regex-based fallback parser
// and the AI-based extraction path (see AgentReadyContext.jsx) build their signal
// list by choosing keys from this registry — neither one is allowed to invent a new
// signal or test function, which is what keeps an AI-driven result auditable in
// exactly the same way as the deterministic one.
export const SIGNAL_REGISTRY = {
  running: {
    halfMarathon: { label: "Half marathon", detail: "Built for half-marathon training or race day", priority: 2, test: (p) => p.useCases.includes("half marathon") },
    humid: { label: "Humid weather", detail: "Climate-specific breathability signal", priority: 2, test: (p) => /humid|warm/i.test(p.specs.climate) || p.useCases.includes("humid weather") },
    lightweight: { label: "Lightweight", detail: "Measured shoe weight below 230 g", priority: 2, test: (p) => p.specs.weightG <= 230 },
    beginner: { label: "Beginner-friendly", detail: "Content is mapped to first-time runners", priority: 1, test: (p) => p.personas.some((item) => /beginner|first-time/i.test(item)) },
    easyRuns: { label: "Easy runs", detail: "Mapped to comfortable daily mileage", priority: 1, test: (p) => p.useCases.some((item) => /daily|easy/i.test(item)) },
  },
  skincare: {
    oilySkin: { label: "Oily skin", detail: "Routine is labeled for oily or combination skin", priority: 2, test: (p) => /oily|combination/i.test(p.specs.skinType) },
    sustainable: { label: "Sustainable", detail: "Refill, packaging, and sustainability context present", priority: 2, test: (p) => p.sustainability.score >= 80 || p.specs.refillable },
    fragranceFree: { label: "Fragrance-free", detail: "No added fragrance signal", priority: 1, test: (p) => /fragrance-free/i.test(p.specs.fragrance) },
  },
  air: {
    quiet: { label: "Quiet sleep", detail: "Measured sleep-mode noise at or below 28 dB", priority: 2, test: (p) => p.specs.noiseDb <= 28 },
    smallRoom: { label: "Small bedroom", detail: "Coverage fits a compact room without oversizing", priority: 2, test: (p) => p.specs.coverageM2 >= 12 && p.specs.coverageM2 <= 25 },
  },
};

// Regex-based fallback parser — used whenever the AI extraction call fails, times
// out, or returns something invalid, so the Query Lab never hard-fails. Detects the
// same signal keys the AI path can choose from, just via keyword matching instead
// of a model call.
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
  const signalKeys = [];

  if (vertical === "running") {
    if (/half[- ]marathon/i.test(lower)) signalKeys.push("halfMarathon");
    if (/humid|singapore|warm|tropical|heat/i.test(lower)) signalKeys.push("humid");
    if (/lightweight|light weight|light shoe|low weight/i.test(lower)) signalKeys.push("lightweight");
    if (/beginner|new runner|first/i.test(lower)) signalKeys.push("beginner");
    if (/easy run|easy runs|daily/i.test(lower)) signalKeys.push("easyRuns");
  }
  if (vertical === "skincare") {
    if (/oily|oil[- ]control|combination/i.test(lower)) signalKeys.push("oilySkin");
    if (/sustainable|eco|refill|low[- ]waste|planet/i.test(lower)) signalKeys.push("sustainable");
    if (/fragrance[- ]free|unscented|no fragrance/i.test(lower)) signalKeys.push("fragranceFree");
  }
  if (vertical === "air") {
    if (/quiet|silent|sleep|noise|light sleeper/i.test(lower)) signalKeys.push("quiet");
    if (/small bedroom|small room|20\s*m|compact/i.test(lower)) signalKeys.push("smallRoom");
  }

  return buildParsedFromExtraction(query, { vertical, budget, minutes, area, signalKeys });
}

// Takes a structured intent extraction — {vertical, budget, minutes, area, signalKeys}
// — from EITHER the regex parser above or the AI extraction endpoint, and rebuilds it
// into the full `parsed` shape the rest of the app expects (with real test functions
// attached). This is what keeps queryResult()/rankProducts() identical regardless of
// which path produced the extraction.
export function buildParsedFromExtraction(rawQuery, extraction) {
  const { vertical, budget = null, minutes = null, area = null, signalKeys = [] } = extraction;
  const signals = [];

  for (const key of signalKeys) {
    const entry = vertical && SIGNAL_REGISTRY[vertical]?.[key];
    if (entry) signals.push({ key, ...entry });
  }
  if (vertical === "skincare" && minutes !== null) {
    signals.push({ key: "time", label: `${minutes}-min morning`, detail: `Routine is documented at ${minutes} minutes or less`, priority: 2, test: (p) => p.specs.minutes <= minutes });
  }
  if (vertical === "air" && area !== null) {
    signals.push({ key: "area", label: `${area} m² coverage`, detail: `Published coverage meets a ${area} m² room`, priority: 2, test: (p) => p.specs.coverageM2 >= area });
  }
  if (budget !== null) {
    signals.push({ key: "budget", label: `Under ${rawQuery.match(/s\s*\$\s*\d+/i)?.[0] || `$${budget}`}`, detail: `Price is at or below ${formatMoney({ currency: "S$", price: budget })}`, priority: 2, test: (p) => p.price <= budget });
  }

  return { raw: rawQuery, vertical, budget, minutes, area, signals };
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

// Ranks products against an already-parsed intent — shared by both the regex-only
// runSimulation() below and AgentReadyContext's AI-powered query path, so the ranking
// math itself never differs based on where the intent came from.
export function rankProducts(products, parsed) {
  // An unrecognized category means "we don't know what you're shopping for" — not
  // "everything is a match." Without this, every product got a flat category-match
  // bonus whenever `vertical` was null, which collapsed the ranking into "just
  // recommend whichever product has the highest readiness score," regardless of
  // relevance. Honest "no match" beats a confident wrong answer.
  if (!parsed.vertical) return [];

  const candidates = products
    .map((product) => queryResult(product, parsed))
    .filter((result) => result.product.vertical === parsed.vertical)
    .sort((a, b) => b.score - a.score || b.readiness.overall - a.readiness.overall);
  return candidates.slice(0, 3);
}

// Ranks products the AI-relevance way — the model has already judged, per
// product, how well its own real facts (including idealFor/personas/useCases,
// which the hardcoded SIGNAL_REGISTRY above never looks at) support the query.
// Same score formula shape as queryResult() above (39 base + up to 44 for fit
// + budget bonus/penalty + a readiness bonus) so results feel consistent
// regardless of which matching path produced them; only the "how well does
// this product fit the intent" component's source differs.
export function rankByRelevance(candidateProducts, relevanceById, budget) {
  const results = candidateProducts.map((product) => {
    const relevance = relevanceById[product.id] || { relevanceScore: 0, matched: [], missing: [] };
    const readiness = readinessFor(product);
    const budgetMatch = budget === null || budget === undefined || product.price <= budget;
    let score = 39 + relevance.relevanceScore * 0.44 + (budgetMatch ? 8 : -20) + readiness.overall * 0.09;
    score = Math.max(0, Math.min(99, Math.round(score)));
    return {
      product,
      readiness,
      score,
      budgetMatch,
      matchedSignals: relevance.matched,
      missing: relevance.missing,
    };
  });
  return results.sort((a, b) => b.score - a.score || b.readiness.overall - a.readiness.overall).slice(0, 3);
}

export function runSimulation(products, rawQuery) {
  const parsed = parseQuery(rawQuery);
  const results = rankProducts(products, parsed);
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
  // Imported/AI-enriched products won't always have every spec field a
  // hand-authored demo product has (e.g. no "breathability" or "skinType") —
  // these templates must degrade gracefully instead of crashing the render.
  if (p.vertical === "running") {
    const breathability = p.specs.breathability?.toLowerCase() || "unrated";
    const weight = p.specs.weightG ?? "unlisted";
    const drop = p.specs.dropMm ?? "unlisted";
    return `${weight} g with ${breathability} breathability and an ${drop} mm drop.`;
  }
  if (p.vertical === "skincare") {
    const skinType = p.specs.skinType?.toLowerCase() || "any";
    const steps = p.specs.steps ?? "unlisted";
    const minutes = p.specs.minutes ?? "unlisted";
    return `${steps} steps in ${minutes} minutes for ${skinType} skin.`;
  }
  const noise = p.specs.noiseDb ?? "unlisted";
  const coverage = p.specs.coverageM2 ?? "unlisted";
  return `${noise} dB sleep mode with ${coverage} m² published coverage.`;
}

export function agentSummary(product, parsed = null) {
  const p = product;
  if (p.vertical === "running") {
    const weight = p.specs.weightG ?? "a lightweight";
    if (parsed?.vertical === "running") return `${p.brand} ${p.name} is a strong match for runners building toward a half marathon in warm, humid conditions: its ${weight} g build and high-breathability mesh keep the recommendation grounded in measurable product facts.`;
    return `${p.brand} ${p.name} is a breathable daily trainer for runners who want a light, responsive ride for everyday road mileage.`;
  }
  if (p.vertical === "skincare") {
    const skinType = p.specs.skinType?.toLowerCase() || "your";
    const minutes = p.specs.minutes ?? "a few";
    const steps = p.specs.steps ?? "several";
    return `${p.brand} ${p.name} is a ${minutes}-minute, ${steps}-step morning routine for ${skinType} skin, with ${p.sustainability.score >= 80 ? "strong refill and packaging signals" : "documented product-level details"}.`;
  }
  const noise = p.specs.noiseDb ?? "a low";
  const coverage = p.specs.coverageM2 ?? "a compact";
  return `${p.brand} ${p.name} is a compact bedroom purifier with ${noise} dB sleep mode, ${coverage} m² published coverage, and a HEPA-based filter specification.`;
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

// The fields import enrichment is allowed to draft via AI. Demo/hackathon
// mode: claims/evidence/sustainability/tradeoffs are included at the user's
// explicit, informed request — this catalog is entirely fictional demo data,
// not real products, so "verified" claims here are illustrative, not real
// evidence about an actual brand.
export const ARRAY_ENRICHABLE_FIELDS = ["idealFor", "personas", "useCases", "benefits", "tradeoffs", "faqs"];
export const ENRICHABLE_FIELDS = [...ARRAY_ENRICHABLE_FIELDS, "claims", "sustainability"];

const DEFAULT_SUSTAINABILITY_DETAIL = "No sustainability context imported.";

function isDefaultSustainability(sustainability) {
  return !sustainability || (sustainability.score === 40 && sustainability.detail === DEFAULT_SUSTAINABILITY_DETAIL);
}

// Which of the enrichable fields are actually empty (or still the untouched
// default) on this product — the single source of truth for "what's missing"
// used by the import flow.
export function missingEnrichableFields(product) {
  return ENRICHABLE_FIELDS.filter((field) => {
    if (field === "sustainability") return isDefaultSustainability(product.sustainability);
    return !product[field]?.length;
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

// --- Publish: real schema.org JSON-LD + agent/OpenAI feed generation -------
// This is the compliant distribution layer discussed earlier — structured
// data that mirrors what's already visible in the app, not hidden content.
// There's no real storefront behind this demo, so `url`/`availability`/brand
// identity are demo placeholders, not a claim of a live product page.

export const DEMO_BRAND = { name: "Northstar Demo", domain: "northstar-demo.example", country: "SG", currency: "S$" };

function productUrl(product, brand) {
  return `https://${brand.domain}/products/${product.id}`;
}

export function productJsonLd(product, brand = DEMO_BRAND) {
  const url = productUrl(product, brand);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: `${product.brand} ${product.name}`,
    sku: product.id,
    category: product.category,
    description: product.description,
    additionalProperty: (product.attributes || []).map(([name, value]) => ({ "@type": "PropertyValue", name, value })),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: brand.currency,
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    dateModified: product.lastUpdated,
  };
}

function agentFeedProduct(product, brand) {
  const readiness = readinessFor(product);
  return {
    id: product.id,
    canonical_url: productUrl(product, brand),
    name: `${product.brand} ${product.name}`,
    category: product.category,
    description: product.description,
    commercial: { price: product.price, currency: product.currency || brand.currency, availability: "InStock" },
    suitability: {
      ideal_for: product.idealFor,
      use_cases: product.useCases,
      audiences: product.personas,
      benefits: product.benefits,
    },
    specifications: Object.fromEntries(product.attributes || []),
    substantiation: product.claims,
    trade_offs: product.tradeoffs,
    provenance: { source: "brand_catalog", approved: true, updated_at: product.lastUpdated, readiness: readiness.overall },
  };
}

export function agentFeed(products, brand = DEMO_BRAND) {
  return {
    schema_version: "1.0",
    brand,
    generated_at: new Date().toISOString(),
    products: products.map((product) => agentFeedProduct(product, brand)),
  };
}

function openAiFeedProduct(product, brand) {
  return {
    is_eligible_search: true,
    item_id: product.id,
    title: `${product.brand} ${product.name}`,
    description: product.description,
    url: productUrl(product, brand),
    brand: brand.name,
    condition: "new",
    product_category: product.category,
    price: `${product.price} ${brand.currency}`,
    availability: "in_stock",
    seller_name: brand.name,
    target_countries: [brand.country],
  };
}

export function openAiFeed(products, brand = DEMO_BRAND) {
  return {
    schema: "openai-agentic-commerce-stable-aligned",
    integration_status: "market_eligibility_review_required",
    validation_warnings: ["Demo catalog — verify real OpenAI Commerce country/eligibility before production submission."],
    generated_at: new Date().toISOString(),
    products: products.map((product) => openAiFeedProduct(product, brand)),
  };
}
