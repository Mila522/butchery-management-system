import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiActivity,
  FiAlertTriangle,
  FiArchive,
  FiBox,
  FiBarChart2,
  FiCalendar,
  FiGrid,
  FiLogOut,
  FiPackage,
  FiSliders,
} from "react-icons/fi";

export default function Sidebar() {
  const primaryLinks = [
    { to: "/", label: "Dashboard", icon: FiGrid, end: true },
    { to: "/products", label: "Products", icon: FiPackage },
    { to: "/categories", label: "Categories", icon: FiArchive },
  ];

  const operationsLinks = [
    { to: "/business-day", label: "Business Day", icon: FiCalendar },
    { to: "/receive-stock", label: "Receive Stock", icon: FiBox },
    { to: "/damages", label: "Record Damage", icon: FiAlertTriangle },
    { to: "/inventory-adjustment", label: "Adjustments", icon: FiSliders },
    { to: "/daily-stock", label: "Daily Stock", icon: FiActivity },
    { to: "/reports", label: "Reports", icon: FiBarChart2 },
    { to: "/business-overview", label: "Overview", icon: FiGrid },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark">E</div>
        <h2>EYETHU</h2>
        <p>Inventory ERP</p>
      </div>

      <nav className="nav-section" aria-label="Main navigation">
        <div className="nav-label">Workspace</div>
        {primaryLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon className="nav-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      <nav className="nav-section" aria-label="Operations navigation">
        <div className="nav-label">Operations</div>
        {operationsLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}>
            <Icon className="nav-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        className="logout"
        onClick={() => {
          localStorage.removeItem("access_token");
          window.location = "/login";
        }}
      >
        <FiLogOut className="nav-icon" />
        Logout
      </button>

    </aside>
  );
}
