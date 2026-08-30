// Calls the backend's AI-powered query-intent extraction endpoint. Never calls
// OpenAI directly from the browser — the API key lives only on the server.

const DEFAULT_API_BASE = "http://localhost:8080/api";
const FETCH_TIMEOUT_MS = 10000;

function apiBase() {
  return import.meta.env.VITE_API_URL || DEFAULT_API_BASE;
}

// Returns {vertical, budget, minutes, area, signalKeys} on success.
// Throws on any failure (network error, timeout, non-2xx, bad shape) — callers
// are expected to catch this and fall back to the local regex parser.
export async function fetchQueryExtraction(rawQuery) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBase()}/agentready/parse-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: rawQuery }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Query parse request failed: ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

// Returns a one-sentence AI-generated summary string on success. Throws on any
// failure — callers are expected to catch this and fall back to the local
// template-based agentSummary() from logic.js.
export async function fetchAgentSummary(product, matchedSignals = []) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBase()}/agentready/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, matchedSignals }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Summary request failed: ${response.status}`);
    }
    const data = await response.json();
    if (typeof data.summary !== "string" || !data.summary.trim()) {
      throw new Error("Summary response missing text");
    }
    return data.summary;
  } finally {
    clearTimeout(timeout);
  }
}

// Returns a map of {[productId]: {productId, relevanceScore, matched, missing}}
// covering every id in `candidateProducts` (the server fills gaps with a safe
// zero-relevance default rather than failing the whole batch). Throws only on
// a hard failure (network error, timeout, non-2xx, unparsable shape) — callers
// should catch this and fall back to the old signal-based matching.
export async function fetchRelevanceRanking(rawQuery, candidateProducts) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBase()}/agentready/rank-relevance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: rawQuery, products: candidateProducts }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Relevance ranking request failed: ${response.status}`);
    }
    const data = await response.json();
    if (!data || typeof data.results !== "object") {
      throw new Error("Relevance ranking response missing results");
    }
    return data.results;
  } finally {
    clearTimeout(timeout);
  }
}

// Returns an object like {idealFor: [...], personas: [...]} containing only
// the requested missingFields keys. Throws on any failure — callers should
// catch this and leave those fields empty (today's existing import behavior).
export async function fetchImportEnrichment(product, missingFields) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBase()}/agentready/enrich-import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, missingFields }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Enrichment request failed: ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
