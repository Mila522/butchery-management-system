import React from "react";
import { StatCard } from "../ui";

export default function KPICard({ title, value, icon, color = "primary" }) {
  const tone = color === "danger" || color === "warning" ? "danger" : "neutral";
  return <StatCard label={title} value={value} tone={tone} icon={icon} />;
}
