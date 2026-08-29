import { useAgentReady } from "../useAgentReady";

export default function GapPanel() {
  const { lastSweep } = useAgentReady();

  const gapCounts = {};
  lastSweep.flatMap((item) => item.gaps).forEach((gap) => {
    gapCounts[gap] = (gapCounts[gap] || 0) + 1;
  });
  const gapRows = Object.entries(gapCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <section className="panel gap-panel">
      <div className="panel-eyebrow">ENRICHMENT QUEUE</div>
      <h2>Where the agent still hesitates</h2>
      <div className="gap-summary">
        <div className="gap-summary-icon">!</div>
        <div>
          <strong>{gapRows.length} repeated signal gaps</strong>
          <span>Fix these once, improve multiple intents.</span>
        </div>
      </div>
      <div className="gap-list">
        {gapRows.length ? gapRows.map(([gap, count], index) => (
          <div className="gap-item" key={gap}>
            <span className={`gap-severity${index === 0 ? " high" : ""}`}></span>
            <div>
              <strong>{gap}</strong>
              <p>Appears in {count} simulated {count === 1 ? "query" : "queries"} where product evidence is thin.</p>
              <span className="gap-label-pill">{index === 0 ? "High leverage" : "Enrich content"}</span>
            </div>
          </div>
        )) : <div className="empty-state">No repeated gaps detected.</div>}
      </div>
    </section>
  );
}
