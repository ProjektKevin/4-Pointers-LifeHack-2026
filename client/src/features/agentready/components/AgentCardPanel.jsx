import { useAgentReady } from "../useAgentReady";
import { getProduct } from "../logic";

export default function AgentCardPanel() {
  const { products, selectedProductId, openSchemaModal } = useAgentReady();
  const product = getProduct(products, selectedProductId);
  if (!product) return <section className="agent-card-panel panel" />;

  const layers = [
    ["01 · Identity", product.category],
    ["02 · Intent facets", `${product.useCases.length} mapped uses`],
    ["03 · Evidence", `${product.claims.filter((claim) => claim.verified).length} proof points`],
    ["04 · Trade-offs", `${product.tradeoffs.length} disclosed`],
  ];

  return (
    <section className="panel agent-card-panel">
      <div className="panel-eyebrow">WHY AGENTS CAN USE IT</div>
      <h2>Decision context, not just description.</h2>
      <p className="card-intro">The knowledge layer turns {product.brand} {product.name} into four retrievable blocks an agent can reason over.</p>
      <div className="layer-stack">
        {layers.map(([label, value]) => (
          <div className="layer-row" key={label}>
            <span>{label}</span>
            <strong>{value} <span className="layer-check">✓</span></strong>
          </div>
        ))}
      </div>
      <button className="text-button" onClick={() => openSchemaModal(product)}>View structured output ↗</button>
    </section>
  );
}
