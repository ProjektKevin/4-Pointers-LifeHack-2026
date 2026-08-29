import { useAgentReady } from "../useAgentReady";

export default function SweepList() {
  const { lastSweep } = useAgentReady();

  return (
    <div className="sweep-list">
      {lastSweep.map((item, index) => (
        <div className="sweep-row" key={item.query}>
          <div className="sweep-number">{String(index + 1).padStart(2, "0")}</div>
          <div className="sweep-query">
            {item.query}
            <small>{item.label} · {item.topProduct || "No confident product"}</small>
          </div>
          <div className={`coverage-meter${item.success ? "" : " warn"}`}>
            <span style={{ width: `${item.topScore}%` }}></span>
          </div>
          <div className={`sweep-score${item.success ? "" : " warn"}`}>{item.topScore}%</div>
        </div>
      ))}
    </div>
  );
}
