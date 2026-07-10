import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiBox, FiDollarSign, FiPackage, FiSliders, FiTrendingUp } from "react-icons/fi";
import { api } from "../api";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import KPICard from "../components/Dashboard/KPICard";
import CategoryStockChart from "../components/Dashboard/CategoryStockChart";
import InventoryPieChart from "../components/Dashboard/InventoryPieChart";
import StockTrendChart from "../components/Dashboard/StockTrendChart";
import LowStockAlerts from "../components/Dashboard/LowStockAlerts";
import { DataTable, EmptyState, LoadingState, SectionHeader } from "../components/ui";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Loading dashboard" />
      </div>
    );
  }

  const recentDeliveries = dashboard.recent_deliveries ?? [];
  const recentDamages = dashboard.recent_damages ?? [];
  const latestActivity = [
    ...recentDeliveries.slice(0, 3).map((delivery) => ({
      id: `delivery-${delivery.id}`,
      label: delivery.invoice_number,
      detail: `Delivery from ${delivery.supplier_name}`,
      date: delivery.delivery_date,
    })),
    ...recentDamages.slice(0, 3).map((damage) => ({
      id: `damage-${damage.id}`,
      label: damage.product_name ?? `Product #${damage.product_id}`,
      detail: `${damage.quantity} damaged: ${damage.reason}`,
      date: damage.damage_date,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="page">
      <DashboardHeader refresh={loadDashboard} />

      <div className="grid grid-4">
        <KPICard title="Today's Revenue" value={`R ${dashboard.today_revenue ?? 0}`} icon={<FiDollarSign />} />
        <KPICard title="Today's Profit" value={`R ${dashboard.today_profit ?? 0}`} icon={<FiTrendingUp />} />
        <KPICard title="Damage Loss" value={`R ${dashboard.today_damage_loss ?? 0}`} icon={<FiAlertTriangle />} color="danger" />
        <KPICard title="Estimated Sales" value={dashboard.today_estimated_sales ?? 0} icon={<FiPackage />} />
      </div>

      <div className="grid grid-4 mt-20">
        <KPICard title="Low Stock" value={dashboard.low_stock} icon={<FiAlertTriangle />} color="danger" />
        <KPICard title="Products Sold" value={dashboard.products_sold_today ?? 0} icon={<FiBox />} />
        <KPICard title="Stock Value" value={`R ${dashboard.remaining_stock_value ?? dashboard.stock_value ?? 0}`} icon={<FiPackage />} />
        <KPICard title="Adjustments" value={dashboard.adjustments_today ?? 0} icon={<FiSliders />} />
      </div>

      <div className="dashboard-grid mt-20">
        <div className="stack">
          <div className="grid grid-2">
            <CategoryStockChart />
            <InventoryPieChart />
          </div>
          <StockTrendChart />
        </div>

        <div className="stack">
          <LowStockAlerts />

          <div className="erp-card">
            <SectionHeader title="Quick Actions" description="Common inventory workflows." />
            <div className="card-body quick-actions">
              <button className="btn btn-primary" onClick={() => navigate("/receive-stock")}>
                <FiBox /> Receive Stock
              </button>
              <button className="btn btn-outline-danger" onClick={() => navigate("/damages")}>
                <FiAlertTriangle /> Record Damage
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/inventory-adjustment")}>
                <FiSliders /> Inventory Adjustment
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/daily-stock")}>
                <FiPackage /> Daily Stock
              </button>
              <button className="btn btn-outline" onClick={() => api.createDailySnapshot().then(() => alert("Daily snapshot generated.")).catch((err) => alert(err.message))}>
                Generate Daily Snapshot
              </button>
            </div>
          </div>

          <div className="erp-card">
            <SectionHeader title="Latest Activity" description="Recent receiving and damage events." />
            {latestActivity.length === 0 ? (
              <EmptyState title="No recent activity" description="New deliveries and damage records will appear here." />
            ) : (
              <div className="activity-list">
                {latestActivity.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div>
                      <strong>{activity.label}</strong>
                      <span>{activity.detail}</span>
                    </div>
                    <small>{new Date(activity.date).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2 mt-20">
        <div className="erp-card">
          <SectionHeader title="Recent Deliveries" description="Latest supplier receipts." />
          <DataTable
            columns={["Invoice", "Supplier", "Date"]}
            empty={
              <tr>
                <td colSpan="3">
                  <EmptyState title="No deliveries recorded" />
                </td>
              </tr>
            }
            minWidth={560}
          >
            {recentDeliveries.map((delivery) => (
              <tr key={delivery.id}>
                <td className="cell-strong">{delivery.invoice_number}</td>
                <td>{delivery.supplier_name}</td>
                <td className="cell-muted">{new Date(delivery.delivery_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </DataTable>
        </div>

        <div className="erp-card">
          <SectionHeader title="Recent Damages" description="Latest stock write-offs." />
          <DataTable
            columns={["Product", "Quantity", "Reason", "Date"]}
            empty={
              <tr>
                <td colSpan="4">
                  <EmptyState title="No damages recorded" />
                </td>
              </tr>
            }
            minWidth={660}
          >
            {recentDamages.map((damage) => (
              <tr key={damage.id}>
                <td className="cell-strong">{damage.product_name ?? `Product #${damage.product_id}`}</td>
                <td>{damage.quantity}</td>
                <td>{damage.reason}</td>
                <td className="cell-muted">{new Date(damage.damage_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      </div>
    </div>
  );
}
