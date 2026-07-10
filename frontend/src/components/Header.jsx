import React from "react";
export default function Header() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="header">
      <div>
        <h2>Eyethu Butchery Management System</h2>
        <p>Inventory, receiving and stock control</p>
      </div>
      <div className="header-pill">{today}</div>
    </header>
  );
}
