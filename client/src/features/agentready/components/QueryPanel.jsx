import { useState } from "react";
import { useAgentReady } from "../useAgentReady";
import ResultsList from "./ResultsList";

const PROMPT_CHIPS = [
  "I'm training for a half marathon in Singapore's humid weather and need lightweight shoes under S$200.",
  "Find me a sustainable skincare routine for oily skin that takes less than 5 minutes every morning.",
  "I need a quiet air purifier for a small bedroom under S$300.",
];

const CHIP_LABELS = ["Half marathon · humid · under S$200", "Sustainable oily-skin routine", "Quiet purifier · small bedroom"];

const STATUS_COPY = {
  ai: { label: "AI-parsed", className: "ai" },
  fallback: { label: "Fallback parser", className: "fallback" },
};

export default function QueryPanel() {
  const { defaultQuery, lastResults, products, runQuery, openTraceModal, isQuerying, queryStatus } = useAgentReady();
  const [query, setQuery] = useState(defaultQuery);

  const handleRun = () => {
    if (query.trim()) runQuery(query);
  };

  const status = queryStatus ? STATUS_COPY[queryStatus] : null;

  return (
    <section className="panel query-panel">
      <div className="panel-heading query-heading">
        <div>
          <div className="panel-eyebrow">QUERY LAB <span className="beta-label">LIVE</span></div>
          <h2>Can your catalog answer the real question?</h2>
        </div>
        <div className="query-status">
          <span className="status-dot"></span>
          <span>
            {isQuerying ? "Thinking…" : `${lastResults.length} products ranked from ${products.length}`}
          </span>
          {!isQuerying && status && (
            <span className={`parse-source-badge ${status.className}`}>{status.label}</span>
          )}
        </div>
      </div>

      <div className="prompt-input-wrap">
        <span className="prompt-icon">⌕</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") handleRun(); }}
          aria-label="Shopping intent query"
          disabled={isQuerying}
        />
        <button className="run-button" onClick={handleRun} disabled={isQuerying}>
          {isQuerying ? "Running…" : "Run simulation"} <span>↗</span>
        </button>
      </div>
      <div className="prompt-meta">
        <span className="signal-pulse"></span>
        <span>Detects category, constraints, use case, budget, and trade-offs</span>
      </div>
      <div className="prompt-chips">
        {PROMPT_CHIPS.map((chip, index) => (
          <button key={chip} disabled={isQuerying} onClick={() => { setQuery(chip); runQuery(chip); }}>{CHIP_LABELS[index]}</button>
        ))}
      </div>

      <div className="results-toolbar">
        <div><strong>{lastResults.length}</strong> recommended matches <span className="toolbar-muted">· ranked by intent fit</span></div>
        <button className="text-button" onClick={openTraceModal}>Show reasoning trace <span>↗</span></button>
      </div>
      <ResultsList />
    </section>
  );
}
