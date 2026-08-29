const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do",
  "for", "from", "i", "in", "is", "it", "me", "my", "of", "on", "or",
  "that", "the", "this", "to", "under", "want", "with"
]);

export function tokenize(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9$]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export function scoreReadiness(product) {
  const checks = [
    ["Core identity", product.id && product.name && product.category, 9],
    ["Commercial data", Number.isFinite(product.price) && product.currency && product.availability, 11],
    ["Resolvable page", Boolean(product.url), 6],
    ["Agent-readable description", String(product.description || "").length >= 120, 10],
    ["Features", Array.isArray(product.features) && product.features.length >= 3, 8],
    ["Use cases", Array.isArray(product.useCases) && product.useCases.length >= 2, 10],
    ["Audience/personas", Array.isArray(product.personas) && product.personas.length >= 2, 7],
    ["Materials", Array.isArray(product.materials) && product.materials.length >= 2, 5],
    ["Evidence-backed claims", Array.isArray(product.proof) && product.proof.some((item) => item.verified && item.source), 8],
    ["Freshness", Boolean(product.updatedAt), 3],
    ["Care or sustainability", Boolean(product.care || product.sustainability), 3],
    ["Operating conditions", Array.isArray(product.useCases) && product.useCases.some((item) => /humid|hot|warm|wet|cold|dry|weather|climate/i.test(item)), 5],
    ["Unsuitable scenarios", Array.isArray(product.exclusions) && product.exclusions.length > 0, 5],
    ["Comparison guidance", Array.isArray(product.comparisons) && product.comparisons.length > 0, 5],
    ["Global identifiers", Boolean(product.gtin || product.mpn), 5]
  ];

  const earned = checks.reduce((sum, [, passed, weight]) => sum + (passed ? weight : 0), 0);
  return {
    score: earned,
    grade: earned >= 90 ? "Excellent" : earned >= 75 ? "Ready" : earned >= 55 ? "Developing" : "At risk",
    checks: checks.map(([label, passed, weight]) => ({ label, passed: Boolean(passed), weight }))
  };
}

function extractBudget(query) {
  const match = String(query).match(/(?:under|below|less than|max(?:imum)?|budget(?: of)?)[^0-9]{0,8}(?:s\$|sgd|\$)?\s*([0-9]+(?:\.[0-9]+)?)/i);
  return match ? Number(match[1]) : null;
}

function productText(product) {
  return [
    product.name,
    product.category,
    product.description,
    ...(product.features || []),
    ...(product.useCases || []),
    ...(product.personas || []),
    ...(product.materials || []),
    product.sustainability,
    product.care
  ].join(" ").toLowerCase();
}

const CONCEPTS = {
  humid: ["humid", "tropical", "warm", "breathable", "airflow", "fast-drying", "drainage"],
  lightweight: ["lightweight", "ultralight", "light", "weight", "196", "228"],
  "half marathon": ["half marathon", "half-marathon", "tempo", "road racing", "long road"],
  sustainable: ["sustainable", "recycled", "reusable", "recyclable"],
  comfort: ["comfort", "comfortable", "plush", "soft", "cushioning"],
  wet: ["wet", "rain", "monsoon", "wet-grip", "traction", "drainage"],
  beginner: ["beginner", "new runners", "run-walk", "stable"],
  trail: ["trail", "trails", "hiking", "lugs", "technical"]
};

function hasSignal(text, signal) {
  const escaped = String(signal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "i").test(String(text));
}

export function simulateQuery(query, products, { limit = 3 } = {}) {
  const normalizedQuery = String(query || "").trim();
  const queryTokens = tokenize(normalizedQuery);
  const budget = extractBudget(normalizedQuery);
  const lowered = normalizedQuery.toLowerCase();

  const ranked = products.map((product) => {
    const text = productText(product);
    const matched = [];
    let raw = 0;

    for (const token of queryTokens) {
      if (text.includes(token)) {
        raw += 4;
        matched.push(token);
      }
    }

    for (const [intent, signals] of Object.entries(CONCEPTS)) {
      if (hasSignal(lowered, intent) || signals.some((signal) => hasSignal(lowered, signal))) {
        const hits = signals.filter((signal) => hasSignal(text, signal));
        if (hits.length) {
          raw += Math.min(14, 6 + hits.length * 2);
          matched.push(intent);
        }
      }
    }

    const constraints = [];
    if (budget !== null) {
      if (product.price <= budget) {
        raw += 18;
        constraints.push(`Within S$${budget} budget`);
      } else {
        raw -= 34;
        constraints.push(`Exceeds S$${budget} budget`);
      }
    }

    if (/size\s*(?:us\s*)?([0-9]{1,2})/i.test(normalizedQuery)) {
      const requestedSize = normalizedQuery.match(/size\s*(?:us\s*)?([0-9]{1,2})/i)[1];
      if ((product.sizes || []).includes(requestedSize)) {
        raw += 12;
        constraints.push(`Size ${requestedSize} listed`);
      } else {
        raw -= 18;
        constraints.push(`Size ${requestedSize} not listed`);
      }
    }

    if (product.availability === "InStock") raw += 5;
    if (product.availability === "OutOfStock") raw -= 30;

    const readiness = scoreReadiness(product).score;
    raw += readiness / 10;
    const confidence = Math.max(18, Math.min(98, Math.round(47 + raw * 0.5)));

    return {
      product,
      confidence,
      raw,
      matched: [...new Set(matched)].slice(0, 5),
      constraints,
      evidence: buildEvidence(product, normalizedQuery, budget)
    };
  }).sort((a, b) => b.raw - a.raw);

  return {
    query: normalizedQuery,
    budget,
    parsedIntents: parseIntents(normalizedQuery),
    results: ranked.slice(0, limit)
  };
}

function parseIntents(query) {
  const lowered = query.toLowerCase();
  const intents = [];
  const budget = extractBudget(query);
  if (budget !== null) intents.push({ label: "Budget", value: `≤ S$${budget}` });
  const size = query.match(/size\s*(?:us\s*)?([0-9]{1,2})/i);
  if (size) intents.push({ label: "Size", value: size[1] });
  for (const concept of Object.keys(CONCEPTS)) {
    if (hasSignal(lowered, concept) || CONCEPTS[concept].some((signal) => hasSignal(lowered, signal))) {
      intents.push({ label: "Need", value: concept.replace(/^./, (char) => char.toUpperCase()) });
    }
  }
  return intents.slice(0, 6);
}

function buildEvidence(product, query, budget) {
  const lowered = query.toLowerCase();
  const evidence = [];
  if (budget !== null) evidence.push({ label: `S$${product.price}`, source: "catalog.price" });
  if (/humid|hot|singapore|tropical/.test(lowered)) {
    const feature = (product.features || []).find((item) => /airflow|dry|breath|drain/i.test(item));
    if (feature) evidence.push({ label: feature, source: "catalog.features" });
  }
  if (/light/.test(lowered) && product.weightGrams) evidence.push({ label: `${product.weightGrams} g`, source: "catalog.weightGrams" });
  if (/half|marathon|training|tempo/.test(lowered)) {
    const useCase = (product.useCases || []).find((item) => /half|marathon|training|tempo|road/i.test(item));
    if (useCase) evidence.push({ label: useCase, source: "catalog.useCases" });
  }
  if (/sustain|recycl/.test(lowered) && product.sustainability) evidence.push({ label: product.sustainability, source: "catalog.sustainability" });
  if (!evidence.length && product.features?.[0]) evidence.push({ label: product.features[0], source: "catalog.features" });
  return evidence.slice(0, 4);
}

export function toJsonLd(product, origin = "https://northstar.example") {
  const absoluteUrl = product.url?.startsWith("http") ? product.url : `${origin}${product.url || ""}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluteUrl}#product`,
    name: product.name,
    sku: product.id,
    description: product.description,
    category: product.category,
    image: product.image ? [product.image] : undefined,
    color: product.color,
    material: product.materials,
    audience: (product.personas || []).map((persona) => ({ "@type": "Audience", audienceType: persona })),
    additionalProperty: [
      product.weightGrams && { "@type": "PropertyValue", name: "Weight", value: product.weightGrams, unitCode: "GRM" },
      product.heelDropMm && { "@type": "PropertyValue", name: "Heel-to-toe drop", value: product.heelDropMm, unitCode: "MMT" },
      ...(product.useCases || []).map((item) => ({ "@type": "PropertyValue", name: "Suitable for", value: item }))
    ].filter(Boolean),
    offers: {
      "@type": "Offer",
      url: absoluteUrl,
      priceCurrency: product.currency,
      price: product.price,
      availability: `https://schema.org/${product.availability}`,
      itemCondition: "https://schema.org/NewCondition"
    },
    dateModified: product.updatedAt
  };
}

export function toAgentProduct(product, origin = "https://northstar.example") {
  return {
    id: product.id,
    canonical_url: product.url?.startsWith("http") ? product.url : `${origin}${product.url || ""}`,
    name: product.name,
    category: product.category,
    description: product.description,
    commercial: {
      price: product.price,
      currency: product.currency,
      availability: product.availability,
      sizes: product.sizes || []
    },
    suitability: {
      use_cases: product.useCases || [],
      audiences: product.personas || [],
      features: product.features || [],
      exclusions: []
    },
    specifications: {
      weight_grams: product.weightGrams,
      heel_drop_mm: product.heelDropMm,
      materials: product.materials || []
    },
    substantiation: product.proof || [],
    provenance: {
      source: "brand_catalog",
      approved: true,
      updated_at: product.updatedAt
    }
  };
}

export function toOpenAIProduct(product, brand = {}, origin = "https://northstar.example") {
  const availability = {
    InStock: "in_stock",
    OutOfStock: "out_of_stock",
    PreOrder: "pre_order",
    BackOrder: "backorder",
    LowStock: "in_stock"
  }[product.availability] || "unknown";
  const absoluteUrl = product.url?.startsWith("http") ? product.url : `${origin}${product.url || ""}`;
  return {
    is_eligible_search: true,
    item_id: product.id,
    title: product.name,
    description: product.description,
    url: absoluteUrl,
    brand: brand.name || "Unknown brand",
    condition: "new",
    product_category: product.category,
    material: (product.materials || []).join(", "),
    image_url: product.image,
    price: `${product.price} ${product.currency}`,
    availability,
    seller_name: brand.name || "Unknown seller",
    target_countries: [brand.country || "SG"]
  };
}
