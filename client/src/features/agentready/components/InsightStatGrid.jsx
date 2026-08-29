import { useAgentReady } from "../useAgentReady";

export default function InsightStatGrid() {
  const { lastSweep } = useAgentReady();

  const successful = lastSweep.filter((item) => item.success).length;
  const avg = Math.round(lastSweep.reduce((sum, item) => sum + item.topScore, 0) / Math.max(1, lastSweep.length));
  const gaps = lastSweep.reduce((sum, item) => sum + item.gaps.length, 0);

  const stats = [
    ["Queries simulated", lastSweep.length, "natural-language intents"],
    ["Confident matches", `${successful}/${lastSweep.length}`, "top result clears 75% fit"],
    ["Average intent fit", `${avg}%`, "across top results"],
    ["Content gaps found", gaps, "prioritized for enrichment"],
  ];

  return (
    <div className="insight-stat-grid">
      {stats.map(([label, value, detail], index) => (
        <div className="insight-stat" key={label}>
          <div className="insight-stat-label">{label}</div>
          <div className={`insight-stat-value${index === 1 ? " teal" : ""}`}>{value}</div>
          <div className="insight-stat-detail">{detail}</div>
        </div>
      ))}
    </div>
  );
}
