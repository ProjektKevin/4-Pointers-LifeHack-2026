import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgentReady } from "../useAgentReady";
import { agentSummary, factRowsFor, getProduct, readinessFor, verticalLabel } from "../logic";
import { fetchAgentSummary } from "../llmQuery";
import ProductGlyph from "./ProductGlyph";

export default function SelectedProductPanel() {
  const { products, selectedProductId, lastResults, lastParsed } = useAgentReady();
  const navigate = useNavigate();
  const product = getProduct(products, selectedProductId);
  const result = lastResults.find((item) => item.product?.id === product?.id);

  const [summary, setSummary] = useState(() => product ? agentSummary(product, lastParsed) : "");
  const [summarySource, setSummarySource] = useState("fallback");

  useEffect(() => {
    if (!product) return undefined;
    let cancelled = false;

    // Show the fallback template immediately so the panel never looks empty,
    // then swap in the real AI-written sentence if/when it arrives.
    setSummary(agentSummary(product, lastParsed));
    setSummarySource("fallback");

    fetchAgentSummary(product, result?.matchedSignals || [])
      .then((aiSummary) => {
        if (!cancelled) {
          setSummary(aiSummary);
          setSummarySource("ai");
        }
      })
      .catch((error) => {
        console.warn("AI summary unavailable, keeping template summary:", error.message);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, lastParsed]);

  if (!product) return <aside className="panel selected-panel" />;

  const readiness = readinessFor(product);
  const score = result?.score ?? readiness.overall;
  const scoreLabel = result ? "Intent fit" : "Readiness";

  return (
    <aside className="panel selected-panel">
      <div className="selected-top">
        <div className="selected-product-id">
          <ProductGlyph product={product} className="selected-glyph" />
          <div>
            <h3>{product.brand} {product.name}</h3>
            <p>{verticalLabel(product.vertical)} · {product.status}</p>
          </div>
        </div>
        <div className="score-ring" style={{ "--score": `${score}%` }}>
          <strong>{score}%</strong>
          <span>{scoreLabel}</span>
        </div>
      </div>
      <div className="agent-summary">
        <div className="agent-summary-label">
          <span>✦</span> Agent-ready recommendation
          <span className={`parse-source-badge ${summarySource}`}>{summarySource === "ai" ? "AI-written" : "Template"}</span>
        </div>
        {summary}
      </div>
      <div className="fact-list">
        {factRowsFor(product).map(([label, value]) => (
          <div className="fact-row" key={label}>
            <span className="fact-label">{label}</span>
            <span className="fact-value">{value}</span>
          </div>
        ))}
      </div>
      <div className="tradeoff-box">
        <strong>Honest trade-off</strong>
        <p>{product.tradeoffs[0]}</p>
      </div>
      <div className="panel-footer-action">
        <button className="text-button" onClick={() => navigate("/catalog")}>
          Open full knowledge card <span>↗</span>
        </button>
      </div>
    </aside>
  );
}
