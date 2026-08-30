import { useAgentReady } from "../useAgentReady";
import { resultReason, verticalLabel } from "../logic";
import ProductGlyph from "./ProductGlyph";

export default function ResultsList() {
  const { lastResults, selectedProductId, selectProduct } = useAgentReady();

  if (!lastResults.length) {
    return (
      <div className="results-list">
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">⌕</div>
          <strong className="empty-state-title">No confident match in this catalog</strong>
          <p className="empty-state-copy">This query doesn't clearly match running, skincare, or air-care products. Try rephrasing, or ask about one of those categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-list">
      {lastResults.map((result) => {
        const product = result.product;
        const isSelected = product.id === selectedProductId;
        return (
          <button
            key={product.id}
            className={`result-card${isSelected ? " selected" : ""}`}
            onClick={() => selectProduct(product.id)}
          >
            <ProductGlyph product={product} />
            <div className="result-main">
              <div className="result-name-row">
                <span className="result-name">{product.brand} {product.name}</span>
                <span className="result-brand">{verticalLabel(product.vertical)}</span>
              </div>
              <p className="result-reason">{resultReason(result)}</p>
              <div className="match-chips">
                {result.matchedSignals.slice(0, 3).map((label) => <span className="match-chip" key={label}>✓ {label}</span>)}
                {result.missing.length
                  ? result.missing.slice(0, 1).map((label) => <span className="match-chip miss" key={label}>○ {label}</span>)
                  : (!result.matchedSignals.length && <span className="match-chip miss">○ Add intent evidence</span>)}
              </div>
            </div>
            <div className="result-score">
              <strong>{result.score}%</strong>
              <span>intent fit</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
