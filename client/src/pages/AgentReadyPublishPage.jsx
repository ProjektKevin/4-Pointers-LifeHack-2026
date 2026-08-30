import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgentReady } from "../features/agentready/useAgentReady";
import { agentFeed, getProduct, openAiFeed, productJsonLd } from "../features/agentready/logic";

function downloadJSON(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const CHECKLIST = [
  ["Visible-content parity", "Structured data mirrors what's already shown in the Catalog and Command Center — nothing is added that isn't visible."],
  ["Claim provenance", "Every claim carries its evidence source, kept intact through every export."],
  ["Canonical identity", "Every product resolves to one stable ID across the app, the schema, and every feed."],
  ["Freshness controls", "Each product carries a last-updated timestamp in every feed."],
  ["No hidden instructions", "The knowledge layer is data, not disguised prompts — never invisible text on a page."],
];

export default function AgentReadyPublishPage() {
  const { products, selectedProductId } = useAgentReady();
  const navigate = useNavigate();
  const [copiedKey, setCopiedKey] = useState(null);

  const product = getProduct(products, selectedProductId);
  const jsonLd = useMemo(() => (product ? productJsonLd(product) : null), [product]);
  const jsonLdSnippet = jsonLd ? `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>` : "";

  const copy = (key, text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1800);
    });
  };

  return (
    <section aria-labelledby="publishTitle">
      <div className="page-title-row install-head">
        <div>
          <div className="section-kicker"><span className="sparkle">✦</span> Publish safely</div>
          <h1 id="publishTitle">Publish the approved product data</h1>
          <p>Structured data, feeds, and a query endpoint that all say the same thing your product pages already say.</p>
        </div>
        <span className="deployment-status"><span className="status-dot"></span> Demo environment</span>
      </div>

      <div className="install-grid">
        <div className="install-main">
          <article className="panel install-step">
            <div className="step-index">1</div>
            <div className="step-content">
              <div className="install-title">
                <div><span className="panel-eyebrow">REQUIRED</span><h2>Publish JSON-LD on product pages</h2></div>
                <span className="complete-pill">✓ Generated</span>
              </div>
              <p>Standards-based <code>Product</code> markup for <strong>{product ? `${product.brand} ${product.name}` : "the selected product"}</strong>, generated from the same record shown elsewhere in the app.</p>
              <div className="code-block">
                <div className="code-head">
                  <span>product-page.html</span>
                  <button onClick={() => copy("jsonld", jsonLdSnippet)}>{copiedKey === "jsonld" ? "Copied" : "Copy"}</button>
                </div>
                <pre><code>{jsonLdSnippet}</code></pre>
              </div>
              <button className="text-button" onClick={() => downloadJSON(`${product?.id || "product"}.jsonld.json`, jsonLd)}>Download this product's JSON-LD <span>↓</span></button>
            </div>
          </article>

          <article className="panel install-step">
            <div className="step-index">2</div>
            <div className="step-content">
              <div className="install-title">
                <div><span className="panel-eyebrow">RECOMMENDED</span><h2>Expose compatible product feeds</h2></div>
                <span className="complete-pill">✓ Ready</span>
              </div>
              <p>A neutral agent-readable feed for every approved product, plus an adapter aligned to OpenAI's current Agentic Commerce product fields.</p>
              <div className="endpoint-row">
                <span className="method">GET</span>
                <code>/.well-known/agent-products.json</code>
                <button onClick={() => copy("agent-feed", "/.well-known/agent-products.json")} aria-label="Copy feed path">{copiedKey === "agent-feed" ? "Copied" : "Copy"}</button>
              </div>
              <button className="text-button" onClick={() => downloadJSON("agent-products.json", agentFeed(products))}>Download agent feed ({products.length} products) <span>↓</span></button>
              <div className="endpoint-row adapter-row">
                <span className="method openai">OpenAI</span>
                <code>/feeds/openai-products-preview.json</code>
                <button onClick={() => copy("openai-feed", "/feeds/openai-products-preview.json")} aria-label="Copy OpenAI adapter path">{copiedKey === "openai-feed" ? "Copied" : "Copy"}</button>
              </div>
              <button className="text-button" onClick={() => downloadJSON("openai-products-preview.json", openAiFeed(products))}>Download OpenAI-aligned feed <span>↓</span></button>
            </div>
          </article>

          <article className="panel install-step">
            <div className="step-index">3</div>
            <div className="step-content">
              <div className="install-title">
                <div><span className="panel-eyebrow">LIVE</span><h2>Query the catalog directly</h2></div>
                <span className="status-pill">Available</span>
              </div>
              <p>This one is real and running — the same endpoint the Query Lab calls, ranking products by actual fit rather than keyword match.</p>
              <div className="endpoint-row">
                <span className="method post">POST</span>
                <code>/api/agentready/rank-relevance</code>
                <button onClick={() => copy("api", "/api/agentready/rank-relevance")} aria-label="Copy API path">{copiedKey === "api" ? "Copied" : "Copy"}</button>
              </div>
              <button className="button secondary compact-button" onClick={() => navigate("/")}>Try it in the Query Lab</button>
            </div>
          </article>
        </div>

        <aside className="install-aside">
          <article className="panel compliance-card">
            <span className="panel-eyebrow">TRUST CHECKLIST</span>
            <h2>Built for transparent discovery</h2>
            <div className="check-list">
              {CHECKLIST.map(([title, detail]) => (
                <div key={title}><span>✓</span><p><strong>{title}</strong><small>{detail}</small></p></div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
