import React, { useEffect, useState } from "react";
import { api } from "../api";
import { DataTable, EmptyState, LoadingState, PageHeader, Toolbar } from "../components/ui";

const today = new Date().toISOString().slice(0, 10);

export default function BusinessOverview() {
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview() {
    try {
      setLoading(true);
      setOverview(await api.getBusinessOverview(startDate, endDate));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const totals = overview?.totals ?? {};
  const items = overview?.items ?? [];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Management"
        title="Business Overview"
        description="Revenue, profit, losses, and stock value across a selected period."
      />

      <Toolbar>
        <div className="filter-panel">
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <button className="btn btn-primary" onClick={loadOverview} type="button">Refresh</button>
        </div>
      </Toolbar>

      {loading ? (
        <LoadingState label="Loading overview" />
      ) : (
        <>
          <div className="grid grid-4 mt-20">
            <div className="erp-card stat-card"><span>Revenue</span><strong>R {totals.revenue ?? 0}</strong></div>
            <div className="erp-card stat-card"><span>Gross Profit</span><strong>R {totals.gross_profit ?? 0}</strong></div>
            <div className="erp-card stat-card"><span>Damage Loss</span><strong>R {totals.damage_loss ?? 0}</strong></div>
            <div className="erp-card stat-card"><span>Margin</span><strong>{totals.overall_margin_percent ?? 0}%</strong></div>
          </div>

          <DataTable
            columns={["Date", "Product", "Sold", "Revenue", "Gross Profit", "Margin", "Stock Value"]}
            empty={
              <tr>
                <td colSpan="7">
                  <EmptyState title="No overview data found" />
                </td>
              </tr>
            }
            minWidth={980}
          >
            {items.map((item, index) => (
              <tr key={`${item.product_id}-${item.date}-${index}`}>
                <td>{item.date}</td>
                <td className="cell-strong">{item.product_name}</td>
                <td>{item.estimated_sold}</td>
                <td>R {item.revenue}</td>
                <td>R {item.gross_profit}</td>
                <td>{item.margin_percent}%</td>
                <td>R {item.stock_value}</td>
              </tr>
            ))}
          </DataTable>
        </>
      )}
    </div>
  );
}
