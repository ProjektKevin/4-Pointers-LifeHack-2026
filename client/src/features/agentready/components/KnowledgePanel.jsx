import { useAgentReady } from "../useAgentReady";
import { getProduct, readinessFor } from "../logic";
import ProductGlyph from "./ProductGlyph";

const TABS = [
  { key: "facts", label: "Facts" },
  { key: "intent", label: "Intent facets" },
  { key: "proof", label: "Proof" },
];

export default function KnowledgePanel() {
  const { products, selectedProductId, knowledgeTab, setKnowledgeTab, openSchemaModal } = useAgentReady();
  const product = getProduct(products, selectedProductId);
  if (!product) return <aside className="panel knowledge-panel" />;

  const readiness = readinessFor(product);

  return (
    <aside className="panel knowledge-panel">
      <div className="panel-eyebrow">SELECTED KNOWLEDGE CARD</div>
      <div className="selected-product-id" style={{ marginTop: 10 }}>
        <ProductGlyph product={product} className="selected-glyph" />
        <div>
          <h3>{product.brand} {product.name}</h3>
          <p>{product.description}</p>
        </div>
      </div>
      <div className="knowledge-title-copy">{readiness.overall}% ready · {readiness.biggestGap}</div>
      <div className="knowledge-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`knowledge-tab${knowledgeTab === tab.key ? " active" : ""}`}
            onClick={() => setKnowledgeTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="knowledge-tab-content">
        {knowledgeTab === "facts" && (
          <div className="attribute-grid">
            {product.attributes.map(([label, value]) => (
              <div className="attribute-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        )}
        {knowledgeTab === "intent" && (
          <ul className="bullet-list">
            {[...product.idealFor.map((item) => `Best for ${item}`), ...product.useCases.map((item) => `Use case: ${item}`)]
              .slice(0, 8)
              .map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
        {knowledgeTab === "proof" && (
          <ul className="bullet-list">
            {product.claims.map((claim) => <li key={claim.label}>{claim.label} — {claim.evidence}</li>)}
          </ul>
        )}
      </div>
      <button className="button secondary json-button" onClick={() => openSchemaModal(product)}>View JSON output ↗</button>
    </aside>
  );
}
