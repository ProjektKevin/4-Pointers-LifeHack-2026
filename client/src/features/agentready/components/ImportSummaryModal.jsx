import { useEffect, useMemo, useRef, useState } from "react";
import { useAgentReady } from "../useAgentReady";

// Order matters here — it's the column order in the table.
const FIELDS = ["idealFor", "personas", "useCases", "benefits", "tradeoffs", "faqs", "claims", "sustainability"];
const FIELD_LABELS = {
  idealFor: "Ideal for",
  personas: "Personas",
  useCases: "Use cases",
  benefits: "Benefits",
  tradeoffs: "Trade-offs",
  faqs: "FAQs",
  claims: "Claims",
  sustainability: "Sustainability",
};
// claims/sustainability are objects, not simple string arrays — shown, but
// not editable via the plain one-line-per-value textarea the other fields use.
const EDITABLE_FIELDS = new Set(["idealFor", "personas", "useCases", "benefits", "tradeoffs", "faqs"]);

function renderCellContent(field, value) {
  if (field === "sustainability") {
    if (!value || typeof value.score !== "number") return null;
    return <p className="enrichment-note">{value.score}/100 — {value.detail}</p>;
  }
  if (field === "claims") {
    const claims = Array.isArray(value) ? value : [];
    return <ul>{claims.map((claim) => <li key={claim.label}>{claim.label} — {claim.evidence}</li>)}</ul>;
  }
  const values = Array.isArray(value) ? value : [];
  return <ul>{values.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function ImportSummaryModal() {
  const { importSummary, products, closeImportSummary, updateProductField, clearAllImportSuggestions } = useAgentReady();
  const [editingCell, setEditingCell] = useState(null); // `${productId}:${field}` or null
  const [draftText, setDraftText] = useState("");
  const [editedCells, setEditedCells] = useState(() => new Set());
  // Removing a focused textarea from the DOM (e.g. via Escape below) also
  // fires a native blur event — this guards against that blur silently
  // re-committing the edit the user just asked to cancel.
  const cancelingRef = useRef(false);

  // A fresh import means a fresh review — don't carry "edited" highlights
  // over from a previous import batch.
  useEffect(() => {
    setEditedCells(new Set());
    setEditingCell(null);
  }, [importSummary]);

  // Pivot the {field: [{productId, productName}]} manifest into one row per
  // AI-touched product, each carrying which fields to show as columns.
  const rows = useMemo(() => {
    if (!importSummary) return [];
    const byProduct = new Map();
    for (const field of FIELDS) {
      for (const entry of importSummary.byField[field] || []) {
        if (!byProduct.has(entry.productId)) {
          byProduct.set(entry.productId, { productId: entry.productId, productName: entry.productName, fields: [] });
        }
        byProduct.get(entry.productId).fields.push(field);
      }
    }
    return [...byProduct.values()];
  }, [importSummary]);

  if (!importSummary) return null;

  const totalFilled = Object.values(importSummary.byField).reduce((sum, list) => sum + list.length, 0);

  const startEdit = (productId, field, currentValues) => {
    setEditingCell(`${productId}:${field}`);
    setDraftText(currentValues.join("\n"));
  };

  const commitEdit = (productId, field) => {
    const values = draftText.split("\n").map((line) => line.trim()).filter(Boolean);
    updateProductField(productId, field, values);
    setEditedCells((current) => new Set(current).add(`${productId}:${field}`));
    setEditingCell(null);
  };

  const cancelEdit = () => {
    cancelingRef.current = true;
    setEditingCell(null);
  };

  return (
    <div
      className="modal-backdrop open"
      onClick={(event) => { if (event.target === event.currentTarget) closeImportSummary(); }}
    >
      <div className="schema-modal wide" role="dialog" aria-modal="true" aria-labelledby="importSummaryTitle">
        <div className="modal-header">
          <div>
            <div className="panel-eyebrow">IMPORT COMPLETE</div>
            <h2 id="importSummaryTitle">AI filled {totalFilled} field{totalFilled === 1 ? "" : "s"} across {importSummary.productsEnriched} of {importSummary.totalProducts} products</h2>
          </div>
          <button className="close-button" aria-label="Close" onClick={closeImportSummary}>×</button>
        </div>
        <p className="modal-copy">
          Amber cells are AI-drafted from each product's own description — this is demo/hackathon content, not verified real-world evidence. Double-click a text-list cell to edit it directly; Claims and Sustainability aren't inline-editable here (different shape) but can be cleared below.
        </p>
        <div className="enrichment-table-wrap">
          <table className="enrichment-table">
            <thead>
              <tr>
                <th>Product</th>
                {FIELDS.map((field) => <th key={field}>{FIELD_LABELS[field]}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const product = products.find((p) => p.id === row.productId);
                return (
                  <tr key={row.productId}>
                    <td className="enrichment-product-name">{row.productName}</td>
                    {FIELDS.map((field) => {
                      if (!row.fields.includes(field)) return <td key={field}></td>;
                      const cellKey = `${row.productId}:${field}`;
                      const value = product?.[field];
                      const isEditable = EDITABLE_FIELDS.has(field);
                      const isEditing = editingCell === cellKey;
                      const isEdited = editedCells.has(cellKey);
                      return (
                        <td
                          key={field}
                          className={`enrichment-cell ${isEditing ? "editing" : isEdited ? "edited" : "ai"}`}
                          onDoubleClick={() => isEditable && !isEditing && startEdit(row.productId, field, value || [])}
                        >
                          {isEditing ? (
                            <textarea
                              autoFocus
                              value={draftText}
                              onChange={(event) => setDraftText(event.target.value)}
                              onBlur={() => {
                                if (cancelingRef.current) { cancelingRef.current = false; return; }
                                commitEdit(row.productId, field);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); commitEdit(row.productId, field); }
                                if (event.key === "Escape") cancelEdit();
                              }}
                            />
                          ) : renderCellContent(field, value)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button className="text-button" onClick={clearAllImportSuggestions}>Clear all suggestions</button>
          <button className="button primary" onClick={closeImportSummary}>Done</button>
        </div>
      </div>
    </div>
  );
}
