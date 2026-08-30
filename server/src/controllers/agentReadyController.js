import { callOpenAIJSON } from "../services/openai.js";
import { SIGNAL_KEYS_BY_VERTICAL, VERTICALS } from "../services/intentSignals.js";

function buildSystemPrompt() {
  const signalDescriptions = VERTICALS.map((vertical) => {
    const keys = SIGNAL_KEYS_BY_VERTICAL[vertical];
    const lines = Object.entries(keys).map(([key, description]) => `      - "${key}": ${description}`).join("\n");
    return `    ${vertical}:\n${lines}`;
  }).join("\n");

  return `You are an intent-extraction engine for a shopping assistant. Given a natural-language shopping query, extract structured intent as JSON.

Respond with ONLY a JSON object, no prose, matching exactly this shape:
{
  "vertical": one of "running", "skincare", "air", or null if the category is unclear,
  "budget": a number (Singapore dollars) if a price limit is mentioned, else null,
  "minutes": a number if a time limit (e.g. "under 5 minutes") is mentioned, else null,
  "area": a number if a room size in square meters is mentioned, else null,
  "signalKeys": an array of zero or more signal keys that clearly apply, chosen ONLY from the list for the detected vertical below. Never invent a new key. Never include a key from a vertical other than the detected one. If nothing applies, use an empty array.

Signal keys by vertical:
${signalDescriptions}`;
}

function isValidExtraction(extraction) {
  if (!extraction || typeof extraction !== "object") return false;
  const { vertical, budget, minutes, area, signalKeys } = extraction;
  if (vertical !== null && !VERTICALS.includes(vertical)) return false;
  if (budget !== null && typeof budget !== "number") return false;
  if (minutes !== null && typeof minutes !== "number") return false;
  if (area !== null && typeof area !== "number") return false;
  if (!Array.isArray(signalKeys)) return false;
  return true;
}

// Never trust the model's output blindly, even after the shape check above:
// drop any vertical that isn't one of the three known ones, and drop any
// signal key that isn't actually in that vertical's approved list.
function sanitizeExtraction(extraction) {
  const vertical = VERTICALS.includes(extraction.vertical) ? extraction.vertical : null;
  const validKeys = vertical ? Object.keys(SIGNAL_KEYS_BY_VERTICAL[vertical]) : [];
  const signalKeys = (extraction.signalKeys || []).filter((key) => validKeys.includes(key));
  return {
    vertical,
    budget: typeof extraction.budget === "number" ? extraction.budget : null,
    minutes: typeof extraction.minutes === "number" ? extraction.minutes : null,
    area: typeof extraction.area === "number" ? extraction.area : null,
    signalKeys,
  };
}

export const parseQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      res.status(400).json({ error: "Bad Request: Missing query" });
      return;
    }

    const extraction = await callOpenAIJSON({
      systemPrompt: buildSystemPrompt(),
      userPrompt: query,
    });

    if (!isValidExtraction(extraction)) {
      console.error("Invalid extraction shape from OpenAI:", extraction);
      res.status(502).json({ error: "Invalid extraction from model" });
      return;
    }

    res.status(200).json(sanitizeExtraction(extraction));
  } catch (error) {
    console.error("parseQuery error:", error);
    res.status(502).json({ error: "Failed to parse query via AI" });
  }
};

function buildSummaryPrompt() {
  return `You are writing a one-sentence "agent summary" for a shopping assistant to show a customer. You will be given real, verified facts about ONE product, and optionally a list of shopping-intent signals it was matched against.

Write exactly one sentence recommending the product, using ONLY the facts provided. Do not invent any claim, benefit, spec, or piece of evidence that is not present in the given data — if you are unsure whether something is true, leave it out. The sentence should read naturally, the way a helpful shopping assistant would explain a recommendation.

Respond with ONLY a JSON object: {"summary": "..."}`;
}

function isValidProductPayload(product) {
  return Boolean(
    product &&
    typeof product === "object" &&
    typeof product.brand === "string" &&
    typeof product.name === "string" &&
    typeof product.vertical === "string"
  );
}

// Only send the fields the summary is allowed to draw from — keeps the prompt
// small and makes the "don't invent anything" instruction easy for the model
// to actually follow, since everything it's given is fair game to mention.
function productFactsForPrompt(product) {
  return {
    brand: product.brand,
    name: product.name,
    category: product.category,
    vertical: product.vertical,
    description: product.description,
    specs: product.specs,
    benefits: product.benefits,
    tradeoffs: product.tradeoffs,
    sustainability: product.sustainability,
  };
}

export const summarizeProduct = async (req, res) => {
  try {
    const { product, matchedSignals } = req.body;
    if (!isValidProductPayload(product)) {
      res.status(400).json({ error: "Bad Request: Missing or invalid product" });
      return;
    }

    const userPrompt = JSON.stringify({
      product: productFactsForPrompt(product),
      matched_signals: Array.isArray(matchedSignals) ? matchedSignals : [],
    });

    const result = await callOpenAIJSON({
      systemPrompt: buildSummaryPrompt(),
      userPrompt,
    });

    if (!result || typeof result.summary !== "string" || !result.summary.trim()) {
      console.error("Invalid summary shape from OpenAI:", result);
      res.status(502).json({ error: "Invalid summary from model" });
      return;
    }

    res.status(200).json({ summary: result.summary.trim() });
  } catch (error) {
    console.error("summarizeProduct error:", error);
    res.status(502).json({ error: "Failed to generate summary via AI" });
  }
};

// Demo/hackathon mode: the brand/legal-risk guardrail that used to exclude
// claims/evidence/sustainability/tradeoffs from AI drafting has been dropped
// at the user's explicit, informed request (catalog is entirely fictional
// demo data — StrideFlow, Nimbus Trail, etc. are not real companies). Content
// generated here is illustrative for a hackathon demo, not real evidence.
const ARRAY_STRING_FIELDS = ["idealFor", "personas", "useCases", "benefits", "tradeoffs", "faqs"];
const ENRICHABLE_FIELDS = [...ARRAY_STRING_FIELDS, "claims", "sustainability"];
const MAX_ITEMS_PER_FIELD = 5;

function buildEnrichmentPrompt(missingFields) {
  return `You are drafting missing catalog fields for a shopping product (a hackathon demo catalog — illustrative content is fine), based on the real facts given about it. You will be given a product's brand, name, category, description, specs, and price, plus a list of fields to draft.

For each requested field, produce content derived from the given facts:
- "idealFor": array of up to ${MAX_ITEMS_PER_FIELD} short strings — situations this product suits
- "personas": array of up to ${MAX_ITEMS_PER_FIELD} short strings — types of shoppers it's aimed at
- "useCases": array of up to ${MAX_ITEMS_PER_FIELD} short strings — specific usage scenarios
- "benefits": array of up to ${MAX_ITEMS_PER_FIELD} short strings — advantages implied by the given specs/description
- "tradeoffs": array of up to ${MAX_ITEMS_PER_FIELD} short strings — plausible honest downsides/limitations
- "faqs": array of up to ${MAX_ITEMS_PER_FIELD} short strings — plausible customer questions about this product
- "claims": array of up to ${MAX_ITEMS_PER_FIELD} objects, each {"label": short claim title, "detail": one sentence explaining it, "evidence": a short plausible source citation e.g. "Internal lab test · 2026-01", "verified": true}
- "sustainability": ONE object {"score": integer 0-100 reflecting how sustainable this product sounds given the facts, "detail": one sentence explaining the score}

Only include the keys listed in "missingFields" below — omit every other key entirely.

missingFields: ${JSON.stringify(missingFields)}

Respond with ONLY a JSON object containing exactly the keys in missingFields, no markdown fences, no prose.`;
}

function isValidEnrichmentRequest(product, missingFields) {
  if (!isValidProductPayload(product)) return false;
  if (!Array.isArray(missingFields) || !missingFields.length) return false;
  return missingFields.every((field) => ENRICHABLE_FIELDS.includes(field));
}

function sanitizeStringArray(value) {
  return (Array.isArray(value) ? value : [])
    .filter((item) => typeof item === "string" && item.trim())
    .map((item) => item.trim())
    .slice(0, MAX_ITEMS_PER_FIELD);
}

function sanitizeEnrichment(result, missingFields) {
  const sanitized = {};
  for (const field of missingFields) {
    const value = result?.[field];
    if (field === "sustainability") {
      const scoreNumber = Number(value?.score);
      sanitized.sustainability = {
        score: Number.isFinite(scoreNumber) ? Math.max(0, Math.min(100, Math.round(scoreNumber))) : 50,
        detail: typeof value?.detail === "string" && value.detail.trim() ? value.detail.trim() : "AI-estimated sustainability context.",
      };
    } else if (field === "claims") {
      sanitized.claims = (Array.isArray(value) ? value : [])
        .filter((claim) => claim && typeof claim.label === "string" && claim.label.trim())
        .map((claim) => ({
          label: claim.label.trim(),
          detail: typeof claim.detail === "string" ? claim.detail.trim() : "",
          evidence: typeof claim.evidence === "string" && claim.evidence.trim() ? claim.evidence.trim() : "AI-generated demo claim",
          verified: true,
        }))
        .slice(0, MAX_ITEMS_PER_FIELD);
    } else {
      sanitized[field] = sanitizeStringArray(value);
    }
  }
  return sanitized;
}

export const enrichImport = async (req, res) => {
  try {
    const { product, missingFields } = req.body;
    if (!isValidEnrichmentRequest(product, missingFields)) {
      res.status(400).json({ error: "Bad Request: Missing or invalid product/missingFields" });
      return;
    }

    const userPrompt = JSON.stringify({ product: productFactsForPrompt(product) });

    const result = await callOpenAIJSON({
      systemPrompt: buildEnrichmentPrompt(missingFields),
      userPrompt,
    });

    if (!result || typeof result !== "object") {
      console.error("Invalid enrichment shape from OpenAI:", result);
      res.status(502).json({ error: "Invalid enrichment from model" });
      return;
    }

    res.status(200).json(sanitizeEnrichment(result, missingFields));
  } catch (error) {
    console.error("enrichImport error:", error);
    res.status(502).json({ error: "Failed to enrich product via AI" });
  }
};

const MAX_RELEVANCE_PRODUCTS = 25;
const MAX_PHRASES_PER_LIST = 3;

// Every field a product carries that's actually relevant to judging fit —
// notably includes idealFor/personas/useCases/benefits, which the old
// hardcoded-signal matcher never looked at. Excludes claims/evidence: the
// model is judging descriptive fit here, not re-verifying proof.
function productFactsForRelevance(product) {
  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    category: product.category,
    vertical: product.vertical,
    price: product.price,
    currency: product.currency,
    description: product.description,
    specs: product.specs,
    idealFor: product.idealFor,
    personas: product.personas,
    useCases: product.useCases,
    benefits: product.benefits,
    tradeoffs: product.tradeoffs,
    sustainability: product.sustainability,
  };
}

// This prompt is deliberately over-specified: it names the exact key names,
// exact types, exact array-length caps, forbids the most common ways a model
// breaks JSON-mode output (markdown fences, prose, partial coverage), and
// spells out what to do when it's unsure — because this endpoint's caller
// treats ANY shape deviation as a hard failure and falls back to a much
// weaker matching method, so silent format drift is expensive to get wrong.
function buildRelevancePrompt(productIds) {
  return `You are scoring how well each of several products matches a shopper's natural-language query. You will be given the query and a JSON array of products, each with real facts about it (description, specs, and any existing intent/persona/use-case data). Use ONLY the facts given for each product — never invent a fact, spec, or claim that isn't present in its data.

Score every product independently using ONLY that product's own given facts, never facts from other products in the list.

STRICT OUTPUT CONTRACT — read carefully, this is validated by code, not a human:
1. Respond with ONLY a single JSON object. No markdown code fences (no \`\`\`), no prose before or after it, no explanation — the entire response body must be valid JSON and nothing else.
2. The JSON object must have exactly one top-level key: "results".
3. "results" must be a JSON array containing EXACTLY one entry for EVERY product id in this list, in this exact order, with no omissions and no additions: ${JSON.stringify(productIds)}
4. Each entry in "results" must be an object with exactly these 4 keys, no others:
   - "productId": a string, copied EXACTLY character-for-character from the input product's "id" field.
   - "relevanceScore": an integer from 0 to 100 (0 = this product's given facts show no relation to the query, 100 = the given facts are a near-perfect fit). Always an integer, never a string, never a decimal.
   - "matched": a JSON array of 0 to ${MAX_PHRASES_PER_LIST} short strings (each under 8 words), each naming one specific thing about the product's OWN given facts that supports the query. Use an empty array [] if nothing matches — never omit the key.
   - "missing": a JSON array of 0 to ${MAX_PHRASES_PER_LIST} short strings naming things the query seems to want that this product's given facts do NOT clearly show. Use an empty array [] if nothing is missing — never omit the key.
5. If you are unsure whether a product matches, score it lower rather than guessing high — a low score with an empty "matched" array is a valid, expected answer for a poor fit.
6. Never add a 5th key to an entry. Never rename a key. Never nest "results" inside another key. Never return an object instead of an array for "results".

Example of a fully correct response shape (values illustrative only): {"results":[{"productId":"abc-123","relevanceScore":82,"matched":["built for humid climates","lightweight at 218g"],"missing":["no mention of race-day use"]}]}`;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeRelevanceEntry(entry, validIds) {
  if (!isPlainObject(entry)) return null;
  if (typeof entry.productId !== "string" || !validIds.has(entry.productId)) return null;
  const scoreNumber = Number(entry.relevanceScore);
  const relevanceScore = Number.isFinite(scoreNumber) ? Math.max(0, Math.min(100, Math.round(scoreNumber))) : 0;
  const toPhraseList = (value) => (Array.isArray(value) ? value : [])
    .filter((item) => typeof item === "string" && item.trim())
    .map((item) => item.trim())
    .slice(0, MAX_PHRASES_PER_LIST);
  return {
    productId: entry.productId,
    relevanceScore,
    matched: toPhraseList(entry.matched),
    missing: toPhraseList(entry.missing),
  };
}

export const rankRelevance = async (req, res) => {
  try {
    const { query, products } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      res.status(400).json({ error: "Bad Request: Missing query" });
      return;
    }
    if (!Array.isArray(products) || !products.length || products.length > MAX_RELEVANCE_PRODUCTS) {
      res.status(400).json({ error: "Bad Request: products must be a non-empty array within the size limit" });
      return;
    }
    if (!products.every((product) => isValidProductPayload(product) && typeof product.id === "string")) {
      res.status(400).json({ error: "Bad Request: every product needs a valid id/brand/name/vertical" });
      return;
    }

    const productIds = products.map((product) => product.id);
    const validIds = new Set(productIds);
    const userPrompt = JSON.stringify({ query, products: products.map(productFactsForRelevance) });

    const result = await callOpenAIJSON({
      systemPrompt: buildRelevancePrompt(productIds),
      userPrompt,
    });

    if (!isPlainObject(result) || !Array.isArray(result.results)) {
      console.error("Invalid relevance shape from OpenAI (not {results: [...]}): ", result);
      res.status(502).json({ error: "Invalid relevance ranking from model" });
      return;
    }

    // Validate what came back, but don't fail the whole batch over one bad
    // entry — anything malformed or simply missing gets a safe zero-relevance
    // default so one model slip doesn't force the caller into a full fallback.
    const byProductId = {};
    for (const rawEntry of result.results) {
      const sanitized = sanitizeRelevanceEntry(rawEntry, validIds);
      if (sanitized) byProductId[sanitized.productId] = sanitized;
    }
    for (const id of productIds) {
      if (!byProductId[id]) {
        byProductId[id] = { productId: id, relevanceScore: 0, matched: [], missing: [] };
      }
    }

    res.status(200).json({ results: byProductId });
  } catch (error) {
    console.error("rankRelevance error:", error);
    res.status(502).json({ error: "Failed to rank products via AI" });
  }
};
