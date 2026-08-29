import { useNavigate } from "react-router-dom";
import { useAgentReady } from "../useAgentReady";
import { readinessFor, verticalLabel } from "../logic";
import ProductGlyph from "./ProductGlyph";

export default function ReadinessTable() {
  const { products, selectProduct } = useAgentReady();
  const navigate = useNavigate();

  const ranked = [...products]
    .map((product) => ({ product, readiness: readinessFor(product) }))
    .sort((a, b) => b.readiness.overall - a.readiness.overall)
    .slice(0, 6);

  const openProduct = (id) => {
    selectProduct(id);
    navigate("/catalog");
  };

  return (
    <section className="panel readiness-panel">
      <div className="panel-heading compact-heading">
        <div>
          <div className="panel-eyebrow">CATALOG HEALTH</div>
          <h2>Readiness by product</h2>
        </div>
        <button className="text-button" onClick={() => navigate("/catalog")}>View catalog <span>→</span></button>
      </div>
      <div className="readiness-table-wrap">
        <table className="readiness-table">
          <thead>
            <tr><th>Product</th><th>Category</th><th>Readiness</th><th>Biggest gap</th><th></th></tr>
          </thead>
          <tbody>
            {ranked.map(({ product, readiness }) => (
              <tr key={product.id}>
                <td>
                  <div className="table-product">
                    <ProductGlyph product={product} mini />
                    <span>{product.brand} {product.name}</span>
                  </div>
                </td>
                <td><span className="category-label">{verticalLabel(product.vertical)}</span></td>
                <td>
                  <div className="table-score">
                    <div className="score-bar"><span style={{ width: `${readiness.overall}%` }}></span></div>
                    <strong>{readiness.overall}%</strong>
                  </div>
                </td>
                <td><span className="gap-label">{readiness.biggestGap}</span></td>
                <td><button className="arrow-link" aria-label="Open product" onClick={() => openProduct(product.id)}>→</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
