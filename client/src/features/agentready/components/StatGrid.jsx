import { useAgentReady } from "../useAgentReady";
import { readinessFor } from "../logic";

export default function StatGrid() {
  const { products, lastSweep } = useAgentReady();

  const scores = products.map((product) => readinessFor(product));
  const average = Math.round(scores.reduce((sum, score) => sum + score.overall, 0) / Math.max(1, scores.length));
  const intent = Math.round(scores.reduce((sum, score) => sum + score.intentCoverage, 0) / Math.max(1, scores.length));
  const sweepConfidence = lastSweep.length
    ? Math.round((lastSweep.filter((item) => item.success).length / lastSweep.length) * 100)
    : 83;

  const stats = [
    ["Products enriched", products.length, "of catalog", "▦", ""],
    ["Avg. readiness", `${average}%`, "↑ 8% this week", "✦", "up"],
    ["Intent coverage", `${intent}%`, "across 6 golden queries", "⌁", "up"],
    ["Agent confidence", `${sweepConfidence}%`, "recommendations pass", "✓", "up"],
  ];

  return (
    <div className="stat-grid">
      {stats.map(([label, value, sub, icon, trend]) => (
        <div className="stat-card" key={label}>
          <div className="stat-label"><span className="stat-icon">{icon}</span>{label}</div>
          <div className="stat-value">{value}{trend ? <small>↗</small> : null}</div>
          <div className="stat-sub">{sub}</div>
        </div>
      ))}
    </div>
  );
}
