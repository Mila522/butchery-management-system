import React, { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import { api } from "../api";
import { DataTable, EmptyState, LoadingState, PageHeader } from "../components/ui";

export default function DailyStock() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStock();
  }, []);

  async function loadStock() {
    try {
      const data = await api.getTodayDailyStock();
      setRows(data.map((row) => ({ ...row, closing_stock: String(row.closing_stock ?? "") })));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateRow(productId, field, value) {
    setRows((current) =>
      current.map((row) =>
        row.product_id === productId ? { ...row, [field]: value } : row
      )
    );
  }

  async function closeDay() {
    try {
      setSaving(true);
      await api.closeDailyStock({
        items: rows.map((row) => ({
          product_id: row.product_id,
          closing_stock: row.closing_stock,
          notes: row.notes || null,
        })),
      });
      alert("Business day closed.");
      await loadStock();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Loading daily stock" />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Closing"
        title="Daily Stock"
        description="Enter closing stock only. Received and damaged quantities are calculated automatically."
        actions={
          <button className="btn btn-primary" onClick={closeDay} disabled={saving || rows.length === 0}>
            <FiSave /> Close Business Day
          </button>
        }
      />

      <DataTable
        columns={["Product", "Opening", "Received", "Damaged", "Closing", "Notes"]}
        empty={
          <tr>
            <td colSpan="6">
              <EmptyState title="No stock rows prepared" />
            </td>
          </tr>
        }
        minWidth={920}
      >
        {rows.map((row) => (
          <tr key={row.product_id}>
            <td className="cell-strong">{row.product_name}</td>
            <td>{row.opening_stock}</td>
            <td>{row.received_today}</td>
            <td>{row.damaged_today}</td>
            <td>
              <input
                value={row.closing_stock}
                onChange={(event) => updateRow(row.product_id, "closing_stock", event.target.value)}
                type="number"
                min="0"
                step="0.01"
              />
            </td>
            <td>
              <input
                value={row.notes ?? ""}
                onChange={(event) => updateRow(row.product_id, "notes", event.target.value)}
                placeholder="Optional"
              />
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
