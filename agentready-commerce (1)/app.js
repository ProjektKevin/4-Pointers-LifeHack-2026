/* AgentReady Commerce — dependency-free demo logic. */

const demoProducts = [
  {
    id: "strideflow-aero-2",
    brand: "StrideFlow",
    name: "Aero 2",
    category: "Running shoes",
    vertical: "running",
    icon: "↗",
    price: 179,
    currency: "S$",
    rating: 4.8,
    reviews: 642,
    status: "Published",
    lastUpdated: "2026-07-14",
    description: "A breathable daily trainer for runners building distance in warm, wet climates.",
    idealFor: ["half-marathon training", "daily tempo runs", "humid-climate runners"],
    personas: ["performance-minded beginner", "busy city runner", "humid-climate athlete"],
    useCases: ["half marathon", "daily training", "humid weather", "long runs", "road running"],
    specs: {
      weightG: 218,
      dropMm: 8,
      stackMm: 32,
      climate: "humid and warm",
      breathability: "high",
      support: "neutral",
      width: "standard",
      durabilityKm: 700,
    },
    attributes: [
      ["Weight", "218 g"], ["Drop", "8 mm"], ["Upper", "Engineered mesh"], ["Ride", "Responsive neutral"], ["Climate", "Warm / humid"], ["Expected life", "Up to 700 km"],
    ],
    benefits: ["Moves heat and moisture away from the foot", "Light enough for tempo work without a harsh ride", "Stable neutral platform for everyday mileage"],
    claims: [
      { label: "Breathable upper", detail: "Engineered mesh supports airflow across the forefoot.", evidence: "Internal airflow bench test · 2026-02", verified: true },
      { label: "Lightweight build", detail: "218 g in a men's US 9 sample.", evidence: "Size-weight test · 2026-01", verified: true },
      { label: "Distance ready", detail: "Foam tuned for repeated road mileage.", evidence: "Wear-test panel · 2025-11", verified: true },
    ],
    tradeoffs: ["Standard width only", "Neutral support; not designed for strong overpronation"],
    sustainability: { score: 74, detail: "20% recycled mesh by weight; repairable insole." },
    faqs: ["Is it suitable for humid weather?", "How does the Aero 2 fit?", "What distance is it designed for?"],
    contentGaps: ["No independent wet-grip test published yet"],
  },
  {
    id: "harborstride-tempo",
    brand: "HarborStride",
    name: "Tempo Knit",
    category: "Running shoes",
    vertical: "running",
    icon: "↗",
    price: 149,
    currency: "S$",
    rating: 4.6,
    reviews: 284,
    status: "Needs enrichment",
    lastUpdated: "2026-05-04",
    description: "An easygoing knit trainer with a soft landing for city mileage.",
    idealFor: ["easy runs", "new runners"],
    personas: ["first-time runner", "comfort seeker"],
    useCases: ["daily training", "road running", "easy runs"],
    specs: { weightG: 276, dropMm: 10, stackMm: 30, climate: "warm", breathability: "medium", support: "neutral", width: "standard" },
    attributes: [["Weight", "276 g"], ["Drop", "10 mm"], ["Upper", "Knit textile"], ["Ride", "Soft neutral"], ["Climate", "Warm"], ["Width", "Standard"]],
    benefits: ["Soft cushioning for lower-intensity runs", "Stretch knit upper feels accommodating", "Accessible price for a first daily trainer"],
    claims: [{ label: "Soft landing", detail: "Dual-density foam balances step-in comfort and stability.", evidence: "Compression test · 2025-08", verified: true }],
    tradeoffs: ["Heavier than a race-oriented trainer", "Humidity breathability is not independently verified"],
    sustainability: { score: 61, detail: "Blended knit upper; packaging is FSC-certified." },
    faqs: ["Is the knit upper breathable?"],
    contentGaps: ["No measured durability range", "No climate-specific performance evidence"],
  },
  {
    id: "volt-carbon-racer",
    brand: "Volt Athletics",
    name: "Carbon Racer X",
    category: "Running shoes",
    vertical: "running",
    icon: "↗",
    price: 239,
    currency: "S$",
    rating: 4.7,
    reviews: 198,
    status: "Published",
    lastUpdated: "2026-06-21",
    description: "A highly propulsive race-day shoe for experienced runners chasing a faster split.",
    idealFor: ["race day", "half-marathon racing", "speed sessions"],
    personas: ["experienced racer", "time-focused athlete"],
    useCases: ["half marathon", "race day", "speed work", "road running"],
    specs: { weightG: 198, dropMm: 6, stackMm: 38, climate: "warm", breathability: "high", support: "neutral", width: "standard", durabilityKm: 450 },
    attributes: [["Weight", "198 g"], ["Drop", "6 mm"], ["Plate", "Carbon composite"], ["Ride", "Propulsive"], ["Climate", "Warm"], ["Expected life", "Up to 450 km"]],
    benefits: ["Very low weight for race efforts", "High energy return at faster paces", "Secure upper for a locked-in fit"],
    claims: [{ label: "Race-oriented", detail: "Carbon-composite plate and high-return foam are tuned for speed.", evidence: "Materials specification · 2026-03", verified: true }, { label: "Lightweight build", detail: "198 g in a men's US 9 sample.", evidence: "Size-weight test · 2026-03", verified: true }],
    tradeoffs: ["Above the S$200 budget in this query", "Less forgiving for slow daily mileage", "Shorter expected life than a daily trainer"],
    sustainability: { score: 52, detail: "Limited recycled content; replaceable insole." },
    faqs: ["Is it suitable for beginners?", "How long does the foam last?"],
    contentGaps: ["No humid-climate test data"],
  },
  {
    id: "purekind-oil-balance",
    brand: "PureKind",
    name: "Oil Balance 3-Step",
    category: "Skincare routine",
    vertical: "skincare",
    icon: "✦",
    price: 78,
    currency: "S$",
    rating: 4.7,
    reviews: 511,
    status: "Published",
    lastUpdated: "2026-07-30",
    description: "A simple morning routine with cleanser, niacinamide serum, and lightweight SPF for oily skin.",
    idealFor: ["oily and combination skin", "five-minute mornings", "first skincare routine"],
    personas: ["time-poor professional", "ingredient-conscious beginner", "humid-climate commuter"],
    useCases: ["oily skin", "morning routine", "humid weather", "under five minutes", "sustainable skincare"],
    specs: { steps: 3, minutes: 4, skinType: "oily / combination", climate: "humid and warm", spf: 30, fragrance: "fragrance-free", refillable: true },
    attributes: [["Steps", "3"], ["Time", "4 min"], ["Skin type", "Oily / combination"], ["SPF", "30"], ["Scent", "Fragrance-free"], ["Packaging", "Refillable serum"]],
    benefits: ["Cleans without a tight after-feel", "Lightweight hydration that layers under SPF", "Refill format reduces packaging for the serum step"],
    claims: [{ label: "Fragrance-free", detail: "No added fragrance in the three products.", evidence: "INCI review · 2026-04", verified: true }, { label: "Refillable serum", detail: "The 30 ml serum has a mail-back refill format.", evidence: "Packaging specification · 2026-05", verified: true }, { label: "Four-minute routine", detail: "Three steps with a recommended 45-second cleanse.", evidence: "Routine timing study · 2026-02", verified: true }],
    tradeoffs: ["SPF 30 may be insufficient for prolonged midday sun; reapply as directed", "Routine is optimized for oil control, not rich barrier repair"],
    sustainability: { score: 92, detail: "Refillable serum, 80% post-consumer recycled cartons, no outer plastic." },
    faqs: ["Is it suitable for oily skin?", "How long does the routine take?", "Which step is refillable?", "Is it fragrance-free?"],
    contentGaps: ["No public third-party sustainability audit"],
  },
  {
    id: "dewform-gel-routine",
    brand: "Dewform",
    name: "Daily Gel Set",
    category: "Skincare routine",
    vertical: "skincare",
    icon: "✦",
    price: 52,
    currency: "S$",
    rating: 4.5,
    reviews: 329,
    status: "Published",
    lastUpdated: "2026-06-17",
    description: "A compact gel cleanser and moisturizer duo for low-effort daily hydration.",
    idealFor: ["simple routines", "oily and combination skin", "budget-conscious shoppers"],
    personas: ["minimalist", "student", "routine beginner"],
    useCases: ["oily skin", "morning routine", "under five minutes", "travel skincare"],
    specs: { steps: 2, minutes: 3, skinType: "oily / combination", climate: "warm", spf: 0, fragrance: "lightly scented", refillable: false },
    attributes: [["Steps", "2"], ["Time", "3 min"], ["Skin type", "Oily / combination"], ["SPF", "None"], ["Scent", "Lightly scented"], ["Packaging", "Recyclable tube"]],
    benefits: ["Two steps for a quick morning reset", "Gel textures feel light in warm weather", "Lower entry price for a basic routine"],
    claims: [{ label: "Three-minute routine", detail: "Two-step sequence designed for quick mornings.", evidence: "Routine timing study · 2025-12", verified: true }],
    tradeoffs: ["No SPF included", "Lightly scented", "No refill option"],
    sustainability: { score: 68, detail: "Recyclable mono-material tubes; no refill system." },
    faqs: ["Does it include SPF?", "Is it fragrance-free?"],
    contentGaps: ["No ingredient-level oil-control evidence", "Sustainability claim lacks packaging weight"],
  },
  {
    id: "clearleaf-balance-system",
    brand: "ClearLeaf",
    name: "Balance + Shield",
    category: "Skincare routine",
    vertical: "skincare",
    icon: "✦",
    price: 119,
    currency: "S$",
    rating: 4.8,
    reviews: 176,
    status: "Needs enrichment",
    lastUpdated: "2026-03-08",
    description: "A four-product routine pairing gentle cleansing, balancing serum, moisturizer, and SPF.",
    idealFor: ["oily skin", "layered routines", "daily sun protection"],
    personas: ["skincare enthusiast", "urban commuter"],
    useCases: ["oily skin", "morning routine", "sun protection"],
    specs: { steps: 4, minutes: 7, skinType: "oily", climate: "warm", spf: 50, fragrance: "fragrance-free", refillable: false },
    attributes: [["Steps", "4"], ["Time", "7 min"], ["Skin type", "Oily"], ["SPF", "50"], ["Scent", "Fragrance-free"], ["Packaging", "Glass jars"]],
    benefits: ["Higher SPF for daily outdoor exposure", "Four-step sequence supports a complete routine", "Fragrance-free formula family"],
    claims: [{ label: "SPF 50", detail: "Broad-spectrum SPF 50 in the final step.", evidence: "Product label review · 2026-01", verified: true }],
    tradeoffs: ["Takes longer than five minutes", "Heavier glass packaging", "Above the stated budget if bundled with refills"],
    sustainability: { score: 58, detail: "Glass jars, but no refill pathway currently published." },
    faqs: ["How many steps are there?", "Is it suitable for oily skin?"],
    contentGaps: ["No routine timing evidence", "No refill or end-of-life guidance"],
  },
  {
    id: "quietair-mini",
    brand: "QuietAir",
    name: "Mini HEPA 20",
    category: "Air purifier",
    vertical: "air",
    icon: "≈",
    price: 229,
    currency: "S$",
    rating: 4.6,
    reviews: 403,
    status: "Published",
    lastUpdated: "2026-07-02",
    description: "A compact HEPA purifier with a low-noise sleep mode for bedrooms and study spaces.",
    idealFor: ["small bedrooms", "sleeping", "study desks", "rental apartments"],
    personas: ["light sleeper", "city renter", "allergy-aware household"],
    useCases: ["small bedroom", "quiet sleep", "air quality", "under S$300", "compact spaces"],
    specs: { coverageM2: 20, noiseDb: 24, filter: "True HEPA H13 + carbon", cadrM3H: 170, sleepMode: true, energyW: 6 },
    attributes: [["Coverage", "20 m²"], ["Sleep noise", "24 dB"], ["Filter", "HEPA H13 + carbon"], ["CADR", "170 m³/h"], ["Sleep mode", "Yes"], ["Power", "6 W"]],
    benefits: ["Quiet enough for sleep and focused work", "Compact footprint for bedside tables", "Carbon layer helps with common household odors"],
    claims: [{ label: "24 dB sleep mode", detail: "Measured at one meter in the lowest fan mode.", evidence: "Acoustic test · 2026-02", verified: true }, { label: "20 m² coverage", detail: "Recommended room size at the published air-change target.", evidence: "CADR calculation · 2026-02", verified: true }, { label: "HEPA H13", detail: "True HEPA H13 filter media in the replacement cartridge.", evidence: "Filter specification · 2026-01", verified: true }],
    tradeoffs: ["Designed for rooms up to 20 m²", "Filter replacement recommended every 6–9 months", "No app or remote control"],
    sustainability: { score: 71, detail: "Low-power sleep mode; filter cartridge is not yet take-back enabled." },
    faqs: ["Is it quiet enough for sleep?", "How large a room can it cover?", "How often should I replace the filter?"],
    contentGaps: ["No independent clean-air delivery verification"],
  },
  {
    id: "breezesense-bedroom-pro",
    brand: "BreezeSense",
    name: "Bedroom Pro",
    category: "Air purifier",
    vertical: "air",
    icon: "≈",
    price: 299,
    currency: "S$",
    rating: 4.7,
    reviews: 226,
    status: "Published",
    lastUpdated: "2026-06-11",
    description: "A connected purifier for medium bedrooms with automatic particle sensing and quiet night mode.",
    idealFor: ["medium bedrooms", "connected homes", "high-traffic rooms"],
    personas: ["data-minded homeowner", "pet household", "medium-room sleeper"],
    useCases: ["bedroom", "quiet sleep", "air quality", "pet odors", "smart home"],
    specs: { coverageM2: 35, noiseDb: 29, filter: "HEPA H12 + carbon", cadrM3H: 260, sleepMode: true, energyW: 11 },
    attributes: [["Coverage", "35 m²"], ["Sleep noise", "29 dB"], ["Filter", "HEPA H12 + carbon"], ["CADR", "260 m³/h"], ["Sleep mode", "Yes"], ["Power", "11 W"]],
    benefits: ["More airflow for larger bedrooms", "Automatic sensing adjusts to changes in particle levels", "App provides filter-life reminders"],
    claims: [{ label: "35 m² coverage", detail: "Recommended room size at the published air-change target.", evidence: "CADR calculation · 2025-10", verified: true }, { label: "Connected monitoring", detail: "App reports PM2.5 trends and filter life.", evidence: "Feature specification · 2025-10", verified: true }],
    tradeoffs: ["At the upper edge of the S$300 budget", "29 dB sleep mode is audible in very quiet rooms", "Higher power draw than a compact model"],
    sustainability: { score: 66, detail: "Replaceable filter and auto-sleep mode; no take-back program." },
    faqs: ["Can it cover a large bedroom?", "Does it have an app?"],
    contentGaps: ["No independently measured sleep-mode noise evidence"],
  },
];

const goldenQueries = [
  { query: "I'm training for a half marathon in Singapore's humid weather and need lightweight shoes under S$200.", label: "Performance + climate + budget", vertical: "running" },
  { query: "Find me a sustainable skincare routine for oily skin that takes less than 5 minutes every morning.", label: "Persona + sustainability + time", vertical: "skincare" },
  { query: "I need a quiet air purifier for a small bedroom under S$300.", label: "Room size + noise + budget", vertical: "air" },
  { query: "Which running shoes are best for a beginner's easy runs under S$160?", label: "Experience level + use case + budget", vertical: "running" },
  { query: "What is the fastest fragrance-free morning skincare routine for oily skin?", label: "Time + ingredient preference", vertical: "skincare" },
  { query: "Which purifier has the lowest sleep noise for a 20 square meter bedroom?", label: "Numeric comparison + room size", vertical: "air" },
];

const state = {
  products: demoProducts.map((product) => ({ ...product })),
  selectedProductId: "strideflow-aero-2",
  activeView: "overview",
  lastParsed: null,
  lastResults: [],
  lastSweep: [],
  knowledgeTab: "facts",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function getProduct(id) {
  return state.products.find((product) => product.id === id) || state.products[0];
}

function verticalLabel(vertical) {
  return ({ running: "Running", skincare: "Skincare", air: "Air care" }[vertical] || vertical);
}

function glyphClass(product) {
  return `glyph-${product.vertical}`;
}

function productGlyph(product, mini = false) {
  return `<span class="${mini ? "mini-glyph" : "product-glyph"} ${glyphClass(product)}" aria-hidden="true">${escapeHtml(product.icon)}</span>`;
}

function pathValue(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);
}

function readinessFor(product) {
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
  const overall = Math.round(completeness * .28 + intentCoverage * .25 + machineReadability * .19 + evidence * .18 + freshness * .1);
  const biggestGap = product.contentGaps?.[0] || (evidence < 75 ? "Add claim-level proof" : "Add more comparison context");
  return { overall, completeness, intentCoverage, machineReadability, evidence, freshness, biggestGap };
}

function formatMoney(product) {
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

function parseQuery(rawQuery) {
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

function queryResult(product, parsed) {
  const readiness = readinessFor(product);
  const categoryMatch = !parsed.vertical || product.vertical === parsed.vertical;
  const signalResults = parsed.signals.map((signal) => ({ ...signal, matched: Boolean(signal.test(product)) }));
  const matched = signalResults.filter((signal) => signal.matched).reduce((sum, signal) => sum + signal.priority, 0);
  const possible = signalResults.reduce((sum, signal) => sum + signal.priority, 0) || 1;
  const intentFit = Math.round((matched / possible) * 100);
  const budgetMatch = parsed.budget === null || product.price <= parsed.budget;
  let score = (categoryMatch ? 39 : 0) + intentFit * .44 + (budgetMatch ? 8 : -20) + readiness.overall * .09;
  if (!categoryMatch) score -= 40;
  score = Math.max(0, Math.min(99, Math.round(score)));
  const missing = signalResults.filter((signal) => !signal.matched).map((signal) => signal.label);
  const matchedSignals = signalResults.filter((signal) => signal.matched).map((signal) => signal.label);
  return { product, readiness, score, intentFit, categoryMatch, budgetMatch, signalResults, missing, matchedSignals };
}

function runSimulation(rawQuery, options = {}) {
  const parsed = parseQuery(rawQuery);
  const candidates = state.products
    .map((product) => queryResult(product, parsed))
    .filter((result) => !parsed.vertical || result.product.vertical === parsed.vertical)
    .sort((a, b) => b.score - a.score || b.readiness.overall - a.readiness.overall);
  const results = candidates.slice(0, 3);
  state.lastParsed = parsed;
  state.lastResults = results;
  if (!options.silent) {
    renderQuery(parsed, results);
    if (results[0]) selectProduct(results[0].product.id, { rerun: false });
  }
  return { parsed, results };
}

function resultReason(result, parsed) {
  const p = result.product;
  if (p.vertical === "running") return `${p.specs.weightG} g with ${p.specs.breathability.toLowerCase()} breathability and an ${p.specs.dropMm} mm drop.`;
  if (p.vertical === "skincare") return `${p.specs.steps} steps in ${p.specs.minutes} minutes for ${p.specs.skinType.toLowerCase()} skin.`;
  return `${p.specs.noiseDb} dB sleep mode with ${p.specs.coverageM2} m² published coverage.`;
}

function renderQuery(parsed = state.lastParsed, results = state.lastResults) {
  if (!parsed) return;
  const signalText = parsed.signals.length ? parsed.signals.map((signal) => signal.label).join(" · ") : "No high-confidence intent signals detected";
  $("#parsedSignals").textContent = `${parsed.vertical ? verticalLabel(parsed.vertical) : "General"} · ${signalText}`;
  $("#queryStatusText").textContent = `${results.length} products ranked from ${state.products.length}`;
  $("#resultCount").textContent = results.length;
  $("#resultsList").innerHTML = results.length ? results.map((result, index) => {
    const product = result.product;
    const chips = [
      ...result.matchedSignals.slice(0, 3).map((label) => `<span class="match-chip">✓ ${escapeHtml(label)}</span>`),
      ...result.missing.slice(0, 1).map((label) => `<span class="match-chip miss">○ ${escapeHtml(label)}</span>`),
    ].join("");
    return `<article class="result-card ${index === 0 ? "selected" : ""}" data-product-id="${escapeHtml(product.id)}">
      ${productGlyph(product)}
      <div class="result-main"><div class="result-name-row"><span class="result-name">${escapeHtml(product.brand)} ${escapeHtml(product.name)}</span><span class="result-brand">${escapeHtml(verticalLabel(product.vertical))}</span></div>
      <p class="result-reason">${escapeHtml(resultReason(result, parsed))}</p><div class="match-chips">${chips || `<span class="match-chip miss">○ Add intent evidence</span>`}</div></div>
      <div class="result-score"><strong>${result.score}%</strong><span>intent fit</span></div>
    </article>`;
  }).join("") : `<div class="empty-state">No products match this category yet. Import a catalog or try a broader query.</div>`;
  $$(".result-card").forEach((card) => card.addEventListener("click", () => selectProduct(card.dataset.productId)));
}

function agentSummary(product, parsed = state.lastParsed) {
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

function renderSelectedProduct(product) {
  if (!product) return;
  const readiness = readinessFor(product);
  const result = state.lastResults.find((item) => item.product.id === product.id);
  const score = result?.score || readiness.overall;
  const scoreLabel = result ? "Intent fit" : "Readiness";
  const factRows = product.vertical === "running"
    ? [["Price", formatMoney(product)], ["Best for", product.idealFor[0]], ["Proof points", `${product.claims.length} verified claims`], ["Sustainability", `${product.sustainability.score}/100 context score`]]
    : product.vertical === "skincare"
      ? [["Price", formatMoney(product)], ["Routine", `${product.specs.steps} steps · ${product.specs.minutes} min`], ["Skin type", product.specs.skinType], ["Sustainability", `${product.sustainability.score}/100 context score`]]
      : [["Price", formatMoney(product)], ["Coverage", `${product.specs.coverageM2} m²`], ["Sleep mode", `${product.specs.noiseDb} dB`], ["Filter", product.specs.filter]];
  $("#selectedProductPanel").innerHTML = `<div class="selected-top"><div class="selected-product-id">${productGlyph(product).replace("product-glyph", "selected-glyph product-glyph")}<div><h3>${escapeHtml(product.brand)} ${escapeHtml(product.name)}</h3><p>${escapeHtml(verticalLabel(product.vertical))} · ${escapeHtml(product.status)}</p></div></div><div class="score-ring" style="--score:${score}%"><strong>${score}%</strong><span>${scoreLabel}</span></div></div>
    <div class="agent-summary"><div class="agent-summary-label"><span>✦</span> Agent-ready recommendation</div>${escapeHtml(agentSummary(product))}</div>
    <div class="fact-list">${factRows.map(([label, value]) => `<div class="fact-row"><span class="fact-label">${escapeHtml(label)}</span><span class="fact-value">${escapeHtml(value)}</span></div>`).join("")}</div>
    <div class="tradeoff-box"><strong>Honest trade-off</strong><p>${escapeHtml(product.tradeoffs[0])}</p></div>
    <div class="panel-footer-action"><button class="text-button" id="openProductKnowledge">Open full knowledge card <span>↗</span></button></div>`;
  $("#openProductKnowledge").addEventListener("click", () => {
    showView("catalog");
    renderCatalog();
  });
}

function selectProduct(id, options = {}) {
  const product = getProduct(id);
  state.selectedProductId = product.id;
  renderSelectedProduct(product);
  renderAgentCard(product);
  if (!options.rerun && state.lastResults.length) {
    $$(".result-card").forEach((card) => card.classList.toggle("selected", card.dataset.productId === product.id));
  }
  $$(".catalog-card").forEach((card) => card.classList.toggle("selected", card.dataset.productId === product.id));
  renderKnowledgePanel(product);
}

function renderAgentCard(product) {
  const readiness = readinessFor(product);
  $("#agentCardPanel").innerHTML = `<div class="panel-eyebrow">WHY AGENTS CAN USE IT</div><h2>Decision context, not just description.</h2><p class="card-intro">The knowledge layer turns ${escapeHtml(product.brand)} ${escapeHtml(product.name)} into four retrievable blocks an agent can reason over.</p><div class="layer-stack"><div class="layer-row"><span>01 · Identity</span><strong>${escapeHtml(product.category)} <span class="layer-check">✓</span></strong></div><div class="layer-row"><span>02 · Intent facets</span><strong>${product.useCases.length} mapped uses <span class="layer-check">✓</span></strong></div><div class="layer-row"><span>03 · Evidence</span><strong>${product.claims.filter((claim) => claim.verified).length} proof points <span class="layer-check">✓</span></strong></div><div class="layer-row"><span>04 · Trade-offs</span><strong>${product.tradeoffs.length} disclosed <span class="layer-check">✓</span></strong></div></div><button class="text-button" id="agentJsonButton">View structured output ↗</button>`;
  $("#agentJsonButton").addEventListener("click", () => openSchemaModal(product));
}

function renderReadinessTable() {
  const products = [...state.products].sort((a, b) => readinessFor(b).overall - readinessFor(a).overall).slice(0, 6);
  $("#readinessTableBody").innerHTML = products.map((product) => {
    const readiness = readinessFor(product);
    return `<tr><td><div class="table-product">${productGlyph(product, true)}<span>${escapeHtml(product.brand)} ${escapeHtml(product.name)}</span></div></td><td><span class="category-label">${escapeHtml(verticalLabel(product.vertical))}</span></td><td><div class="table-score"><div class="score-bar"><span style="width:${readiness.overall}%"></span></div><strong>${readiness.overall}%</strong></div></td><td><span class="gap-label">${escapeHtml(readiness.biggestGap)}</span></td><td><button class="arrow-link" data-product-id="${escapeHtml(product.id)}" aria-label="Open product">→</button></td></tr>`;
  }).join("");
  $$(".arrow-link").forEach((button) => button.addEventListener("click", () => { selectProduct(button.dataset.productId); showView("catalog"); renderCatalog(); }));
}

function renderStats() {
  const scores = state.products.map((product) => readinessFor(product));
  const average = Math.round(scores.reduce((sum, score) => sum + score.overall, 0) / Math.max(1, scores.length));
  const intent = Math.round(scores.reduce((sum, score) => sum + score.intentCoverage, 0) / Math.max(1, scores.length));
  const sweep = state.lastSweep.length ? Math.round(state.lastSweep.filter((item) => item.success).length / state.lastSweep.length * 100) : 83;
  $("#statGrid").innerHTML = [
    ["Products enriched", state.products.length, "of catalog", "▦", ""],
    ["Avg. readiness", `${average}%`, "↑ 8% this week", "✦", "up"],
    ["Intent coverage", `${intent}%`, "across 6 golden queries", "⌁", "up"],
    ["Agent confidence", `${sweep}%`, "recommendations pass", "✓", "up"],
  ].map(([label, value, sub, icon, trend]) => `<div class="stat-card"><div class="stat-label"><span class="stat-icon">${icon}</span>${label}</div><div class="stat-value">${value}${trend ? `<small>↗</small>` : ""}</div><div class="stat-sub">${sub}</div></div>`).join("");
  $("#navProductCount").textContent = state.products.length;
}

function renderCatalog() {
  const search = $("#catalogSearch")?.value.toLowerCase().trim() || "";
  const category = $("#categoryFilter")?.value || "all";
  const products = state.products.filter((product) => {
    const haystack = JSON.stringify(product).toLowerCase();
    return (!search || haystack.includes(search)) && (category === "all" || product.vertical === category);
  });
  $("#catalogGrid").innerHTML = products.length ? products.map((product) => {
    const readiness = readinessFor(product);
    return `<article class="catalog-card ${product.id === state.selectedProductId ? "selected" : ""}" data-product-id="${escapeHtml(product.id)}"><div class="catalog-card-top">${productGlyph(product, true)}<div><h3>${escapeHtml(product.brand)} ${escapeHtml(product.name)}</h3><p>${escapeHtml(verticalLabel(product.vertical))} · ${product.rating} ★</p></div></div><div class="catalog-card-bottom"><div class="catalog-price">${formatMoney(product)} <span>incl. GST</span></div><div class="catalog-readiness"><strong>${readiness.overall}%</strong><small>readiness</small></div></div></article>`;
  }).join("") : `<div class="empty-state">No products found.</div>`;
  $$(".catalog-card").forEach((card) => card.addEventListener("click", () => { selectProduct(card.dataset.productId); renderCatalog(); }));
  renderKnowledgePanel(getProduct(state.selectedProductId));
}

function renderKnowledgePanel(product) {
  if (!product || !$("#knowledgePanel")) return;
  const readiness = readinessFor(product);
  const content = state.knowledgeTab === "facts"
    ? `<div class="attribute-grid">${product.attributes.map(([label, value]) => `<div class="attribute-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`
    : state.knowledgeTab === "intent"
      ? `<ul class="bullet-list">${[...product.idealFor.map((item) => `Best for ${item}`), ...product.useCases.map((item) => `Use case: ${item}`)].slice(0, 8).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : `<ul class="bullet-list">${product.claims.map((claim) => `<li>${escapeHtml(claim.label)} — ${escapeHtml(claim.evidence)}</li>`).join("")}</ul>`;
  $("#knowledgePanel").innerHTML = `<div class="panel-eyebrow">SELECTED KNOWLEDGE CARD</div><div class="selected-product-id" style="margin-top:10px">${productGlyph(product).replace("product-glyph", "selected-glyph product-glyph")}<div><h3>${escapeHtml(product.brand)} ${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description)}</p></div></div><div class="knowledge-title-copy">${readiness.overall}% ready · ${readiness.biggestGap}</div><div class="knowledge-tabs"><button class="knowledge-tab ${state.knowledgeTab === "facts" ? "active" : ""}" data-tab="facts">Facts</button><button class="knowledge-tab ${state.knowledgeTab === "intent" ? "active" : ""}" data-tab="intent">Intent facets</button><button class="knowledge-tab ${state.knowledgeTab === "proof" ? "active" : ""}" data-tab="proof">Proof</button></div><div class="knowledge-tab-content">${content}</div><button class="button secondary json-button" id="knowledgeJsonButton">View JSON output ↗</button>`;
  $$(".knowledge-tab").forEach((tab) => tab.addEventListener("click", () => { state.knowledgeTab = tab.dataset.tab; renderKnowledgePanel(product); }));
  $("#knowledgeJsonButton").addEventListener("click", () => openSchemaModal(product));
}

function structuredProduct(product) {
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

function openSchemaModal(product = getProduct(state.selectedProductId)) {
  $("#schemaTitle").textContent = "A product is more than a title.";
  $(".modal-copy").textContent = "The layer below gives an agent the context it needs to map a human intent to a product, explain the choice, and disclose uncertainty.";
  $("#schemaPreview").textContent = JSON.stringify(structuredProduct(product), null, 2);
  $("#schemaModal").classList.add("open");
  $("#schemaModal").setAttribute("aria-hidden", "false");
}

function openTraceModal() {
  const parsed = state.lastParsed;
  const top = state.lastResults[0];
  if (!parsed || !top) return;
  $("#schemaTitle").textContent = "Why this recommendation ranked #1.";
  $(".modal-copy").textContent = "The trace makes the agent's selection auditable: detected intent signals are matched against normalized product facts, then adjusted for readiness and hard constraints.";
  $("#schemaPreview").textContent = JSON.stringify({
    query: parsed.raw,
    detected_intent: {
      category: parsed.vertical,
      budget: parsed.budget ? `S$${parsed.budget}` : null,
      constraints: parsed.signals.map((signal) => signal.label),
    },
    ranking: state.lastResults.map((result, index) => ({
      rank: index + 1,
      product: `${result.product.brand} ${result.product.name}`,
      intent_fit: `${result.score}%`,
      matched_signals: result.matchedSignals,
      missing_signals: result.missing,
      readiness: `${result.readiness.overall}%`,
    })),
    top_reason: agentSummary(top.product, parsed),
  }, null, 2);
  $("#schemaModal").classList.add("open");
  $("#schemaModal").setAttribute("aria-hidden", "false");
}

function closeSchemaModal() {
  $("#schemaModal").classList.remove("open");
  $("#schemaModal").setAttribute("aria-hidden", "true");
}

function downloadJSON(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`Exported ${filename}`);
}

function exportLayer() {
  downloadJSON("agentready-knowledge-layer.json", { schema: "agentready.catalog.v1", generated_at: new Date().toISOString(), products: state.products.map(structuredProduct) });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function showView(viewName) {
  state.activeView = viewName;
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${viewName}`));
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  const title = ({ overview: "Command center", catalog: "Product knowledge", insights: "Intent insights" }[viewName] || "Command center");
  $("#breadcrumbTitle").textContent = title;
  if (viewName === "catalog") renderCatalog();
  if (viewName === "insights") renderInsights();
}

function renderInsights() {
  if (!state.lastSweep.length) runSweep(true);
  const successful = state.lastSweep.filter((item) => item.success).length;
  const avg = Math.round(state.lastSweep.reduce((sum, item) => sum + item.topScore, 0) / Math.max(1, state.lastSweep.length));
  const gaps = state.lastSweep.reduce((sum, item) => sum + item.gaps.length, 0);
  $("#insightStatGrid").innerHTML = [["Queries simulated", state.lastSweep.length, "natural-language intents"], ["Confident matches", `${successful}/${state.lastSweep.length}`, "top result clears 75% fit"], ["Average intent fit", `${avg}%`, "across top results"], ["Content gaps found", gaps, "prioritized for enrichment"]].map(([label, value, detail], index) => `<div class="insight-stat"><div class="insight-stat-label">${label}</div><div class="insight-stat-value ${index === 1 ? "teal" : ""}">${value}</div><div class="insight-stat-detail">${detail}</div></div>`).join("");
  $("#sweepList").innerHTML = state.lastSweep.map((item, index) => `<div class="sweep-row"><div class="sweep-number">${String(index + 1).padStart(2, "0")}</div><div class="sweep-query">${escapeHtml(item.query)}<small>${escapeHtml(item.label)} · ${item.topProduct ? escapeHtml(item.topProduct) : "No confident product"}</small></div><div class="coverage-meter ${item.success ? "" : "warn"}"><span style="width:${item.topScore}%"></span></div><div class="sweep-score ${item.success ? "" : "warn"}">${item.topScore}%</div></div>`).join("");
  const gapCounts = {};
  state.lastSweep.flatMap((item) => item.gaps).forEach((gap) => { gapCounts[gap] = (gapCounts[gap] || 0) + 1; });
  const gapRows = Object.entries(gapCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  $("#gapPanel").innerHTML = `<div class="panel-eyebrow">ENRICHMENT QUEUE</div><h2>Where the agent still hesitates</h2><div class="gap-summary"><div class="gap-summary-icon">!</div><div><strong>${gapRows.length || 0} repeated signal gaps</strong><span>Fix these once, improve multiple intents.</span></div></div><div class="gap-list">${gapRows.length ? gapRows.map(([gap, count], index) => `<div class="gap-item"><span class="gap-severity ${index === 0 ? "high" : ""}"></span><div><strong>${escapeHtml(gap)}</strong><p>Appears in ${count} simulated ${count === 1 ? "query" : "queries"} where product evidence is thin.</p><span class="gap-label-pill">${index === 0 ? "High leverage" : "Enrich content"}</span></div></div>`).join("") : `<div class="empty-state">No repeated gaps detected.</div>`}</div>`;
  $("#lastRunLabel").textContent = `Last run ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function runSweep(silent = false) {
  const savedParsed = state.lastParsed;
  const savedResults = state.lastResults;
  state.lastSweep = goldenQueries.map((item) => {
    const result = runSimulation(item.query, { silent: true });
    const top = result.results[0];
    const gaps = result.results.slice(0, 2).flatMap((candidate) => candidate.missing.length ? candidate.missing : candidate.product.contentGaps.slice(0, 1));
    return { ...item, topScore: top?.score || 0, topProduct: top ? `${top.product.brand} ${top.product.name}` : null, success: Boolean(top && top.score >= 75), gaps: [...new Set(gaps)] };
  });
  state.lastParsed = savedParsed;
  state.lastResults = savedResults;
  renderStats();
  if (!silent) { renderInsights(); showToast(`Sweep complete · ${state.lastSweep.filter((item) => item.success).length}/${state.lastSweep.length} intents covered`); }
}

function coerceImportedProduct(raw, index) {
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

function safeJSON(value, fallback) { try { return JSON.parse(value); } catch { return fallback; } }

function parseCSV(text) {
  const rows = text.trim().split(/\r?\n/).filter(Boolean).map((line) => line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map((cell) => cell.trim().replace(/^\"|\"$/g, "")));
  if (!rows.length) return [];
  const headers = rows.shift();
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
}

function importFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      const raw = /\.json$/i.test(file.name) ? JSON.parse(text) : parseCSV(text);
      const list = Array.isArray(raw) ? raw : raw.products || raw.items || [];
      if (!list.length) throw new Error("No products found");
      state.products = list.map(coerceImportedProduct);
      state.selectedProductId = state.products[0].id;
      state.lastSweep = [];
      renderAll();
      showToast(`Imported ${state.products.length} products`);
    } catch (error) {
      showToast(`Import failed: ${error.message}`);
    }
  };
  reader.readAsText(file);
}

function renderAll() {
  renderStats();
  renderReadinessTable();
  renderCatalog();
  selectProduct(state.selectedProductId);
  if (state.lastParsed) renderQuery(state.lastParsed, state.lastResults);
}

function wireEvents() {
  $$(".nav-item").forEach((item) => item.addEventListener("click", () => showView(item.dataset.view)));
  $$('[data-view-link="catalog"]').forEach((item) => item.addEventListener("click", () => showView("catalog")));
  $("#runQueryButton").addEventListener("click", () => { const query = $("#queryInput").value.trim(); if (!query) return; runSimulation(query); });
  $("#queryInput").addEventListener("keydown", (event) => { if (event.key === "Enter") $("#runQueryButton").click(); });
  $$("#promptChips button").forEach((chip) => chip.addEventListener("click", () => { $("#queryInput").value = chip.dataset.query; runSimulation(chip.dataset.query); }));
  $("#showTraceButton").addEventListener("click", openTraceModal);
  ["#exportHeroButton", "#catalogExportButton", "#exportLayerButton"].forEach((selector) => $(selector).addEventListener("click", exportLayer));
  $("#viewSchemaButton").addEventListener("click", () => openSchemaModal());
  $("#modalExportButton").addEventListener("click", exportLayer);
  $("#closeSchemaButton").addEventListener("click", closeSchemaModal);
  $("#schemaModal").addEventListener("click", (event) => { if (event.target.id === "schemaModal") closeSchemaModal(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeSchemaModal(); });
  $("#runSweepButton").addEventListener("click", () => runSweep(false));
  $("#importCatalogButton").addEventListener("click", () => $("#catalogFileInput").click());
  $("#catalogFileInput").addEventListener("change", (event) => { if (event.target.files[0]) importFile(event.target.files[0]); event.target.value = ""; });
  $("#catalogSearch").addEventListener("input", renderCatalog);
  $("#categoryFilter").addEventListener("change", renderCatalog);
}

document.addEventListener("DOMContentLoaded", () => {
  wireEvents();
  renderAll();
  runSimulation($("#queryInput").value);
  runSweep(true);
});
