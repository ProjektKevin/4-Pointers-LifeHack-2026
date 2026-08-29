import { useEffect } from "react";
import { useAgentReady } from "../useAgentReady";

export default function SchemaModal() {
  const { modal, closeModal, exportLayer } = useAgentReady();

  useEffect(() => {
    if (!modal.open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modal.open, closeModal]);

  return (
    <div
      className={`modal-backdrop${modal.open ? " open" : ""}`}
      aria-hidden={!modal.open}
      onClick={(event) => { if (event.target === event.currentTarget) closeModal(); }}
    >
      <div className="schema-modal" role="dialog" aria-modal="true" aria-labelledby="schemaTitle">
        <div className="modal-header">
          <div>
            <div className="panel-eyebrow">AGENTREADY SCHEMA</div>
            <h2 id="schemaTitle">{modal.title}</h2>
          </div>
          <button className="close-button" aria-label="Close schema" onClick={closeModal}>×</button>
        </div>
        <p className="modal-copy">{modal.copy}</p>
        <pre>{modal.json}</pre>
        <div className="modal-footer">
          <span className="schema-version">agentready.product.v1</span>
          <button className="button primary" onClick={exportLayer}>⇩ Download sample</button>
        </div>
      </div>
    </div>
  );
}
