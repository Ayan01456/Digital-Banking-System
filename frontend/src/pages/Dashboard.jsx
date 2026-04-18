import React from "react";
import { useNavigate } from "react-router-dom";
import ClaudeBadge from "../components/ClaudeBadge";

export default function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="dashboard-wrapper">
      <nav className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon small">D</div>
          <span className="brand-name">Digital Banking System</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-username">{username}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-body">
        <div className="dashboard-grid">

          {/* Account Services */}
          <div
            className="dashboard-card dashboard-card--active"
            onClick={() => navigate("/account-service")}
          >
            <div className="dashboard-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <div className="dashboard-card-body">
              <h2>Account Services</h2>
              <p>Check balance, receive & send money, and view transactions.</p>
            </div>
            <span className="dashboard-card-cta">Open →</span>
          </div>

          {/* More Services Coming Soon */}
          <div className="dashboard-card dashboard-card--soon">
            <div className="dashboard-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="dashboard-card-body">
              <h2>More Services</h2>
              <p>Loans, investments, fixed deposits and more are on the way.</p>
            </div>
            <span className="dashboard-soon-badge">Coming Soon</span>
          </div>

        </div>
      </div>

      <ClaudeBadge />
    </div>
  );
}