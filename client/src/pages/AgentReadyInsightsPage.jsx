import { useAgentReady } from "../features/agentready/useAgentReady";
import InsightStatGrid from "../features/agentready/components/InsightStatGrid";
import SweepList from "../features/agentready/components/SweepList";
import GapPanel from "../features/agentready/components/GapPanel";

export default function AgentReadyInsightsPage() {
  const { lastSweepAt, runSweepAction } = useAgentReady();

  const lastRunLabel = lastSweepAt
    ? `Last run ${lastSweepAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Not run yet";

  return (
    <section aria-labelledby="insightsTitle">
      <div className="page-title-row">
        <div>
          <div className="section-kicker"><span className="sparkle">✦</span> Intent coverage simulator</div>
          <h1 id="insightsTitle">Intent insights</h1>
          <p>Run a golden-query sweep to see where agents can confidently select, compare, and explain products.</p>
        </div>
        <button className="button primary" onClick={() => runSweepAction()}><span>↻</span> Run query sweep</button>
      </div>
      <InsightStatGrid />
      <div className="insights-layout">
        <section className="panel sweep-panel">
          <div className="panel-heading compact-heading">
            <div>
              <div className="panel-eyebrow">GOLDEN QUERY SWEEP</div>
              <h2>Coverage by shopping intent</h2>
            </div>
            <span className="last-run">{lastRunLabel}</span>
          </div>
          <SweepList />
        </section>
        <GapPanel />
      </div>
    </section>
  );
}
