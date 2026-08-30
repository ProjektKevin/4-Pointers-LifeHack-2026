import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgentReadyStateContext } from "./AgentReadyStateContext";
import { demoProducts, goldenQueries } from "./data";
import {
  parseQuery,
  rankProducts,
  rankByRelevance,
  buildParsedFromExtraction,
  runSweep,
  structuredProduct,
  traceOutput,
  parseImportedFileContent,
  missingEnrichableFields,
  ENRICHABLE_FIELDS,
  exportedLayer,
} from "./logic";
import { fetchQueryExtraction, fetchRelevanceRanking, fetchAgentSummary, fetchImportEnrichment } from "./llmQuery";

const DEFAULT_QUERY = "I'm training for a half marathon in Singapore's humid weather and need lightweight shoes under S$200.";

export function AgentReadyProvider({ children }) {
  const [products, setProducts] = useState(() => demoProducts.map((product) => ({ ...product })));
  const [selectedProductId, setSelectedProductId] = useState(demoProducts[0].id);
  const [lastParsed, setLastParsed] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [lastSweep, setLastSweep] = useState([]);
  const [lastSweepAt, setLastSweepAt] = useState(null);
  const [knowledgeTab, setKnowledgeTab] = useState("facts");
  const [modal, setModal] = useState({ open: false, title: "", copy: "", json: "" });
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryStatus, setQueryStatus] = useState(null); // "ai" | "fallback" | null
  const [importSummary, setImportSummary] = useState(null); // { totalProducts, productsEnriched, byField } | null

  // Kept in a ref (rather than a dependency) so runQuery can always read the
  // latest catalog without needing to be recreated every time products change.
  const productsRef = useRef(products);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Guards against a stale AI response overwriting a modal the user has since
  // closed or reopened for something else (e.g. clicking a different product's
  // "view schema" before the first request finishes).
  const modalRequestRef = useRef(0);

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
  }, []);

  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = setTimeout(() => setToast((current) => ({ ...current, visible: false })), 2600);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  const selectProduct = useCallback((id) => {
    setSelectedProductId(id);
  }, []);

  const runQuery = useCallback(async (rawQuery) => {
    if (!rawQuery || !rawQuery.trim()) return;
    setIsQuerying(true);

    // Tier 1: understand the query (vertical + budget, still needed as hard
    // constraints regardless of how fit-ranking goes below). Falls back to
    // local regex parsing if the extraction call fails.
    let parsed;
    let extractionSource = "ai";
    try {
      const extraction = await fetchQueryExtraction(rawQuery);
      parsed = buildParsedFromExtraction(rawQuery, extraction);
    } catch (error) {
      console.warn("AI query parsing unavailable, falling back to local parsing:", error.message);
      parsed = parseQuery(rawQuery);
      extractionSource = "fallback";
    }

    // Tier 2: rank candidates by how well their OWN real content (including
    // idealFor/personas/useCases — never checked by the hardcoded signal
    // registry) fits the query, via a single batched AI call. Falls back to
    // the old fixed-vocabulary signal matching if that call fails — the
    // demo can degrade, but never hard-fails.
    let results = [];
    let source = extractionSource;
    if (parsed.vertical) {
      const candidates = productsRef.current.filter((product) => product.vertical === parsed.vertical);
      try {
        const relevanceById = await fetchRelevanceRanking(rawQuery, candidates);
        results = rankByRelevance(candidates, relevanceById, parsed.budget);
        // source stays whatever extraction achieved — "ai" only when both tiers used real AI
      } catch (error) {
        console.warn("AI relevance ranking unavailable, falling back to signal-based matching:", error.message);
        results = rankProducts(productsRef.current, parsed);
        source = "fallback";
      }
    }

    setLastParsed(parsed);
    setLastResults(results);
    setQueryStatus(source);
    setIsQuerying(false);
    if (results[0]) setSelectedProductId(results[0].product.id);
  }, []);

  const runSweepAction = useCallback((options = {}) => {
    setProducts((currentProducts) => {
      const sweep = runSweep(currentProducts, goldenQueries);
      setLastSweep(sweep);
      setLastSweepAt(new Date());
      if (!options.silent) {
        showToast(`Sweep complete · ${sweep.filter((item) => item.success).length}/${sweep.length} intents covered`);
      }
      return currentProducts;
    });
  }, [showToast]);

  const openSchemaModal = useCallback((product) => {
    const structured = structuredProduct(product); // agent_summary starts as the template fallback
    const requestId = ++modalRequestRef.current;
    setModal({
      open: true,
      title: "A product is more than a title.",
      copy: "The layer below gives an agent the context it needs to map a human intent to a product, explain the choice, and disclose uncertainty.",
      json: JSON.stringify(structured, null, 2),
    });

    fetchAgentSummary(product, [])
      .then((aiSummary) => {
        if (modalRequestRef.current !== requestId) return; // a newer modal was opened meanwhile
        const updated = { ...structured, agent_summary: aiSummary };
        setModal((current) => (current.open ? { ...current, json: JSON.stringify(updated, null, 2) } : current));
      })
      .catch((error) => {
        console.warn("AI schema summary unavailable, keeping template:", error.message);
      });
  }, []);

  const openTraceModal = useCallback(() => {
    if (!lastParsed || !lastResults.length) return;
    const trace = traceOutput(lastParsed, lastResults); // top_reason starts as the template fallback
    const requestId = ++modalRequestRef.current;
    setModal({
      open: true,
      title: "Why this recommendation ranked #1.",
      copy: "The trace makes the agent's selection auditable: detected intent signals are matched against normalized product facts, then adjusted for readiness and hard constraints.",
      json: JSON.stringify(trace, null, 2),
    });

    const top = lastResults[0];
    if (top) {
      fetchAgentSummary(top.product, top.matchedSignals || [])
        .then((aiSummary) => {
          if (modalRequestRef.current !== requestId) return;
          const updated = { ...trace, top_reason: aiSummary };
          setModal((current) => (current.open ? { ...current, json: JSON.stringify(updated, null, 2) } : current));
        })
        .catch((error) => {
          console.warn("AI trace reason unavailable, keeping template:", error.message);
        });
    }
  }, [lastParsed, lastResults]);

  const closeModal = useCallback(() => {
    setModal((current) => ({ ...current, open: false }));
  }, []);

  const importFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = String(reader.result || "");
        const imported = parseImportedFileContent(file.name, text);

        // Every field in ENRICHABLE_FIELDS (logic.js) can get AI-drafted —
        // includes claims/sustainability/tradeoffs/faqs per the user's
        // explicit request for this demo catalog (see logic.js comment).
        const byField = Object.fromEntries(ENRICHABLE_FIELDS.map((field) => [field, []]));
        let productsEnrichedCount = 0;

        const enrichedProducts = await Promise.all(imported.map(async (product) => {
          const missing = missingEnrichableFields(product);
          if (!missing.length || !product.description) return product;

          try {
            const enrichment = await fetchImportEnrichment(product, missing);
            const updated = { ...product };
            let touchedAny = false;
            for (const field of missing) {
              const value = enrichment[field];
              const isFilled = field === "sustainability"
                ? value && typeof value.score === "number"
                : Array.isArray(value) && value.length;
              if (isFilled) {
                updated[field] = value;
                byField[field].push({ productId: product.id, productName: `${product.brand} ${product.name}` });
                touchedAny = true;
              }
            }
            if (touchedAny) productsEnrichedCount += 1;
            return updated;
          } catch (error) {
            console.warn(`AI import enrichment unavailable for "${product.name}", leaving fields empty:`, error.message);
            return product;
          }
        }));

        setProducts(enrichedProducts);
        setSelectedProductId(enrichedProducts[0].id);
        setLastSweep([]);
        setLastParsed(null);
        setLastResults([]);

        const totalFilled = Object.values(byField).reduce((sum, list) => sum + list.length, 0);
        if (totalFilled > 0) {
          setImportSummary({ totalProducts: enrichedProducts.length, productsEnriched: productsEnrichedCount, byField });
        } else {
          showToast(`Imported ${enrichedProducts.length} products`);
        }
      } catch (error) {
        showToast(`Import failed: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }, [showToast]);

  const closeImportSummary = useCallback(() => setImportSummary(null), []);

  // Edits made in the import review table apply live to the real product —
  // importSummary itself is left untouched, since it's only ever used as the
  // "which product/field pairs were AI-touched" manifest, not a copy of the data.
  const updateProductField = useCallback((productId, field, values) => {
    setProducts((current) => current.map((product) => (
      product.id === productId ? { ...product, [field]: values } : product
    )));
  }, []);

  const clearAllImportSuggestions = useCallback(() => {
    if (!importSummary) return;
    const clearsByProduct = {};
    for (const [field, entries] of Object.entries(importSummary.byField)) {
      for (const entry of entries) {
        (clearsByProduct[entry.productId] ||= []).push(field);
      }
    }
    setProducts((currentProducts) => currentProducts.map((product) => {
      const fieldsToClear = clearsByProduct[product.id];
      if (!fieldsToClear) return product;
      const cleared = { ...product };
      fieldsToClear.forEach((field) => {
        cleared[field] = field === "sustainability"
          ? { score: 40, detail: "No sustainability context imported." }
          : [];
      });
      return cleared;
    }));
    setImportSummary(null);
  }, [importSummary]);

  const exportLayer = useCallback(() => {
    const payload = exportedLayer(products);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "agentready-knowledge-layer.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Exported agentready-knowledge-layer.json");
  }, [products, showToast]);

  // Seed an initial query + sweep once, mirroring the original prototype's
  // behavior on first load.
  useEffect(() => {
    runQuery(DEFAULT_QUERY);
    runSweepAction({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({
    products,
    selectedProductId,
    lastParsed,
    lastResults,
    lastSweep,
    lastSweepAt,
    knowledgeTab,
    modal,
    toast,
    isQuerying,
    queryStatus,
    importSummary,
    defaultQuery: DEFAULT_QUERY,
    setKnowledgeTab,
    selectProduct,
    runQuery,
    runSweepAction,
    openSchemaModal,
    openTraceModal,
    closeModal,
    importFile,
    closeImportSummary,
    updateProductField,
    clearAllImportSuggestions,
    exportLayer,
  }), [
    products,
    selectedProductId,
    lastParsed,
    lastResults,
    lastSweep,
    lastSweepAt,
    knowledgeTab,
    isQuerying,
    queryStatus,
    importSummary,
    modal,
    toast,
    selectProduct,
    runQuery,
    runSweepAction,
    openSchemaModal,
    openTraceModal,
    closeModal,
    importFile,
    closeImportSummary,
    updateProductField,
    clearAllImportSuggestions,
    exportLayer,
  ]);

  return <AgentReadyStateContext.Provider value={value}>{children}</AgentReadyStateContext.Provider>;
}
