import React from "react";
import { FiRefreshCw } from "react-icons/fi";
import { PageHeader } from "../ui";

export default function DashboardHeader({ refresh }) {
  return (
    <PageHeader
      eyebrow="Business Overview"
      title="Dashboard"
      description="Monitor inventory, receiving, damages and stock movement from one operational workspace."
      actions={
        <button className="btn btn-primary" onClick={refresh}>
          <FiRefreshCw /> Refresh
        </button>
      }
    />
  );
}
