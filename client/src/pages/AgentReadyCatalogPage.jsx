import { useAgentReady } from "../features/agentready/useAgentReady";
import CatalogGrid from "../features/agentready/components/CatalogGrid";
import KnowledgePanel from "../features/agentready/components/KnowledgePanel";

export default function AgentReadyCatalogPage() {
  const { exportLayer } = useAgentReady();

  return (
    <section aria-labelledby="catalogTitle">
      <div className="page-title-row">
        <div>
          <div className="section-kicker"><span className="sparkle">✦</span> Structured knowledge layer</div>
          <h1 id="catalogTitle">Product knowledge</h1>
          <p>Every product gets a normalized identity, intent facets, proof, and honest trade-offs.</p>
        </div>
        <div className="hero-actions"><button className="button primary" onClick={exportLayer}>⇩ Export all products</button></div>
      </div>
      <div className="catalog-layout">
        <CatalogGrid />
        <KnowledgePanel />
      </div>
    </section>
  );
}
