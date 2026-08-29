import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAgentReady } from "../useAgentReady";

const COLLAPSE_STORAGE_KEY = "agentready.sidebarCollapsed";

function getInitialCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function Sidebar() {
  const { products, importFile, exportLayer } = useAgentReady();
  const fileInputRef = useRef(null);
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) importFile(file);
    event.target.value = "";
  };

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors (private browsing, etc.)
      }
      return next;
    });
  };

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <button
        className="sidebar-toggle"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "›" : "‹"}
      </button>
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <div>
          <div className="brand-name">AgentReady</div>
          <div className="brand-subtitle">commerce intelligence</div>
        </div>
      </div>

      <div className="workspace-switcher">
        <div className="workspace-avatar">N</div>
        <div className="workspace-copy">
          <span className="eyebrow">Workspace</span>
          <strong>Northstar Demo</strong>
        </div>
        <span className="chevron">⌄</span>
      </div>

      <nav className="nav-stack" aria-label="Main navigation">
        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="nav-icon">⌂</span>
          <span>Command center</span>
        </NavLink>
        <NavLink to="/catalog" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="nav-icon">◫</span>
          <span>Product knowledge</span>
          <span className="nav-count">{products.length}</span>
        </NavLink>
        <NavLink to="/insights" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
          <span className="nav-icon">⌁</span>
          <span>Intent insights</span>
        </NavLink>
      </nav>

      <div className="sidebar-divider"></div>
      <div className="sidebar-section-label">WORKSPACE</div>
      <button className="sidebar-link" onClick={() => fileInputRef.current?.click()}>
        <span className="nav-icon">↥</span>
        <span>Import catalog</span>
      </button>
      <input ref={fileInputRef} type="file" accept=".json,.csv,.tsv" hidden onChange={handleFileChange} />
      <button className="sidebar-link" onClick={exportLayer}>
        <span className="nav-icon">⇩</span>
        <span>Export knowledge layer</span>
      </button>

      <div className="sidebar-spacer"></div>
      <div className="agent-principles">
        <div className="principles-icon">✦</div>
        <div>
          <strong>Decision-complete content</strong>
          <p>Facts + context + proof + trade-offs.</p>
        </div>
      </div>
      <div className="sidebar-footer">
        <span className="status-dot"></span>
        <span>Knowledge layer synced</span>
        <span className="footer-time">2m</span>
      </div>
    </aside>
  );
}
