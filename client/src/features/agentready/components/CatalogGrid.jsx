import { useMemo, useState } from "react";
import { useAgentReady } from "../useAgentReady";
import { formatMoney, readinessFor, verticalLabel } from "../logic";
import ProductGlyph from "./ProductGlyph";

export default function CatalogGrid() {
  const { products, selectedProductId, selectProduct } = useAgentReady();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter((product) => {
      const haystack = JSON.stringify(product).toLowerCase();
      return (!term || haystack.includes(term)) && (category === "all" || product.vertical === category);
    });
  }, [products, search, category]);

  return (
    <section className="panel catalog-list-panel">
      <div className="catalog-toolbar">
        <div className="search-wrap">
          <span>⌕</span>
          <input
            placeholder="Search products or attributes"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          <option value="running">Running</option>
          <option value="skincare">Skincare</option>
          <option value="air">Air care</option>
        </select>
      </div>
      <div className="catalog-grid">
        {filtered.length ? filtered.map((product) => {
          const readiness = readinessFor(product);
          const isSelected = product.id === selectedProductId;
          return (
            <button
              key={product.id}
              className={`catalog-card${isSelected ? " selected" : ""}`}
              onClick={() => selectProduct(product.id)}
            >
              <div className="catalog-card-top">
                <ProductGlyph product={product} mini />
                <div>
                  <h3>{product.brand} {product.name}</h3>
                  <p>{verticalLabel(product.vertical)} · {product.rating} ★</p>
                </div>
              </div>
              <div className="catalog-card-bottom">
                <div className="catalog-price">{formatMoney(product)} <span>incl. GST</span></div>
                <div className="catalog-readiness">
                  <strong>{readiness.overall}%</strong>
                  <small>readiness</small>
                </div>
              </div>
            </button>
          );
        }) : <div className="empty-state">No products found.</div>}
      </div>
    </section>
  );
}
