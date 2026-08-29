import { useCallback, useEffect, useMemo, useState } from "react";
import { AgentReadyStateContext } from "./AgentReadyStateContext";
import { demoProducts, goldenQueries } from "./data";
import {
  runSimulation,
  runSweep,
  structuredProduct,
  traceOutput,
  parseImportedFileContent,
  exportedLayer,
} from "./logic";

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

  const runQuery = useCallback((rawQuery) => {
    if (!rawQuery || !rawQuery.trim()) return;
    setProducts((currentProducts) => {
      const { parsed, results } = runSimulation(currentProducts, rawQuery);
      setLastParsed(parsed);
      setLastResults(results);
      if (results[0]) setSelectedProductId(results[0].product.id);
      return currentProducts;
    });
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
    setModal({
      open: true,
      title: "A product is more than a title.",
      copy: "The layer below gives an agent the context it needs to map a human intent to a product, explain the choice, and disclose uncertainty.",
      json: JSON.stringify(structuredProduct(product), null, 2),
    });
  }, []);

  const openTraceModal = useCallback(() => {
    if (!lastParsed || !lastResults.length) return;
    setModal({
      open: true,
      title: "Why this recommendation ranked #1.",
      copy: "The trace makes the agent's selection auditable: detected intent signals are matched against normalized product facts, then adjusted for readiness and hard constraints.",
      json: JSON.stringify(traceOutput(lastParsed, lastResults), null, 2),
    });
  }, [lastParsed, lastResults]);

  const closeModal = useCallback(() => {
    setModal((current) => ({ ...current, open: false }));
  }, []);

  const importFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const imported = parseImportedFileContent(file.name, text);
        setProducts(imported);
        setSelectedProductId(imported[0].id);
        setLastSweep([]);
        setLastParsed(null);
        setLastResults([]);
        showToast(`Imported ${imported.length} products`);
      } catch (error) {
        showToast(`Import failed: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }, [showToast]);

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
    defaultQuery: DEFAULT_QUERY,
    setKnowledgeTab,
    selectProduct,
    runQuery,
    runSweepAction,
    openSchemaModal,
    openTraceModal,
    closeModal,
    importFile,
    exportLayer,
  }), [
    products,
    selectedProductId,
    lastParsed,
    lastResults,
    lastSweep,
    lastSweepAt,
    knowledgeTab,
    modal,
    toast,
    selectProduct,
    runQuery,
    runSweepAction,
    openSchemaModal,
    openTraceModal,
    closeModal,
    importFile,
    exportLayer,
  ]);

  return <AgentReadyStateContext.Provider value={value}>{children}</AgentReadyStateContext.Provider>;
}
