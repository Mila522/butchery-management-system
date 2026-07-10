import React, { useEffect, useState } from "react";
import { api } from "../api";
import { DataTable, EmptyState, LoadingState, PageHeader, Toolbar } from "../components/ui";

const today = new Date().toISOString().slice(0, 10);

export default function Reports() {
  const [reportType, setReportType] = useState("daily");
  const [reportDate, setReportDate] = useState(today);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      setLoading(true);
      const loaders = {
        daily: () => api.getDailyReport(reportDate),
        weekly: () => api.getWeeklyReport(reportDate),
        monthly: () => api.getMonthlyReport(reportDate),
        profit: () => api.getProfitReport(startDate, endDate),
        damage: () => api.getDamageReport(startDate, endDate),
        valuation: () => api.getStockValuation(reportDate),
      };
      setReport(await loaders[reportType]());
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const items = report?.items ?? [];
  const totals = report?.totals ?? {};

  return (
    <div className="page">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Daily, weekly, monthly, profit, damage, and valuation reports."
      />

      <Toolbar>
        <div className="filter-panel">
          <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="profit">Profit</option>
            <option value="damage">Damage</option>
            <option value="valuation">Stock Valuation</option>
          </select>
          {["profit", "damage"].includes(reportType) ? (
            <>
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </>
          ) : (
            <input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} />
          )}
          <button className="btn btn-primary" onClick={loadReport} type="button">Run Report</button>
        </div>
      </Toolbar>

      {loading ? (
        <LoadingState label="Loading report" />
      ) : (
        <>
          <div className="grid grid-4 mt-20">
            <div className="erp-card stat-card"><span>Revenue</span><strong>R {totals.revenue ?? 0}</strong></div>
            <div className="erp-card stat-card"><span>Profit</span><strong>R {totals.gross_profit ?? 0}</strong></div>
            <div className="erp-card stat-card"><span>Damage Loss</span><strong>R {totals.damage_loss ?? 0}</strong></div>
            <div className="erp-card stat-card"><span>Stock Value</span><strong>R {report?.total_stock_value ?? totals.stock_value ?? 0}</strong></div>
          </div>

          <DataTable
            columns={["Date", "Product", "Sold", "Revenue", "Profit", "Damage", "Stock Value"]}
            empty={
              <tr>
                <td colSpan="7">
                  <EmptyState title="No analytics found" />
                </td>
              </tr>
            }
            minWidth={980}
          >
            {items.map((item, index) => (
              <tr key={`${item.product_id}-${item.date ?? index}`}>
                <td>{item.date ?? report?.report_date ?? ""}</td>
                <td className="cell-strong">{item.product_name}</td>
                <td>{item.estimated_sold ?? item.remaining_stock ?? 0}</td>
                <td>R {item.revenue ?? 0}</td>
                <td>R {item.gross_profit ?? 0}</td>
                <td>R {item.damage_loss ?? 0}</td>
                <td>R {item.stock_value ?? 0}</td>
              </tr>
            ))}
          </DataTable>
        </>
      )}
    </div>
  );
}
