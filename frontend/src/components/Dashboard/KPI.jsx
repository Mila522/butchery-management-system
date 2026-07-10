import React from "react";

export default function KPI({ title, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        borderLeft: `6px solid ${color}`,
      }}
    >
      <h4
        style={{
          margin: 0,
          color: "#666",
          fontWeight: 500,
        }}
      >
        {title}
      </h4>

      <h1
        style={{
          marginTop: 15,
          marginBottom: 0,
          color: "#222",
        }}
      >
        {value}
      </h1>
    </div>
  );
}