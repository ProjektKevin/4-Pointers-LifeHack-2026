export default function Topbar({ title }) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Northstar Demo</span>
        <span className="breadcrumb-slash">/</span>
        <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <span className="live-pill"><span className="live-dot"></span> Demo mode</span>
        <button className="icon-button" title="Help" aria-label="Help">?</button>
        <div className="user-avatar">KQ</div>
      </div>
    </header>
  );
}
