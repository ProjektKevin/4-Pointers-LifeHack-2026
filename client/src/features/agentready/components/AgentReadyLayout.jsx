import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import SchemaModal from "./SchemaModal";
import Toast from "./Toast";
import "../agentready.css";

const TITLES = {
  "/": "Command center",
  "/catalog": "Product knowledge",
  "/insights": "Intent insights",
};

export default function AgentReadyLayout() {
  const location = useLocation();
  const title = TITLES[location.pathname] || "Command center";

  return (
    <div className="agentready-shell">
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Topbar title={title} />
          <div className="page-content">
            <div className="view active">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      <Toast />
      <SchemaModal />
    </div>
  );
}
