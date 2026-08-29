import { useAgentReady } from "../features/agentready/useAgentReady";
import { getProduct } from "../features/agentready/logic";
import StatGrid from "../features/agentready/components/StatGrid";
import QueryPanel from "../features/agentready/components/QueryPanel";
import SelectedProductPanel from "../features/agentready/components/SelectedProductPanel";
import ReadinessTable from "../features/agentready/components/ReadinessTable";
import AgentCardPanel from "../features/agentready/components/AgentCardPanel";

export default function AgentReadyOverviewPage() {
  const { products, selectedProductId, openSchemaModal, exportLayer } = useAgentReady();

  return (
    <section aria-labelledby="overviewTitle">
      <div className="hero-row">
        <div>
          <div className="section-kicker"><span className="sparkle">✦</span> AI commerce readiness</div>
          <h1 id="overviewTitle">Turn catalogs into decisions<br /><span>agents can trust.</span></h1>
          <p className="hero-copy">Transform product data into contextual, evidence-backed knowledge that conversational shoppers can understand, compare, and confidently recommend.</p>
        </div>
        <div className="hero-actions">
          <button className="button secondary" onClick={() => openSchemaModal(getProduct(products, selectedProductId))}><span>⌘</span> View schema</button>
          <button className="button primary" onClick={exportLayer}><span>⇩</span> Export layer</button>
        </div>
      </div>

      <StatGrid />

      <div className="workspace-grid">
        <QueryPanel />
        <SelectedProductPanel />
      </div>

      <div className="lower-grid">
        <ReadinessTable />
        <AgentCardPanel />
      </div>
    </section>
  );
}
