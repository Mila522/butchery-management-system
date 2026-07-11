import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft, FiBox, FiCalendar, FiDollarSign, FiPackage, FiSliders, FiTrendingUp } from "react-icons/fi";
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
  const [categoryStock, setCategoryStock] = useState([]);
  const [inventoryDistribution, setInventoryDistribution] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [recentDamages, setRecentDamages] = useState([]);
  const [recentAdjustments, setRecentAdjustments] = useState([]);
  const [businessDay, setBusinessDay] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [data, categoryData, distributionData, productData, categoryList, deliveries, damages, adjustments, todayBusinessDay] = await Promise.all([
        api.getDashboard(),
        api.getCategoryStock().catch(() => []),
        api.getInventoryDistribution().catch(() => []),
        api.getProducts().catch(() => []),
        api.getCategories().catch(() => []),
        api.getDeliveries().catch(() => []),
        api.getDamages().catch(() => []),
        api.getAdjustments().catch(() => []),
        api.getTodayBusinessDay().catch(() => null),
      ]);
      setDashboard(data);
      setCategoryStock(categoryData);
      setInventoryDistribution(distributionData);
      setProducts(productData);
      setCategories(categoryList);
      setRecentDeliveries(deliveries.slice(0, 6));
      setRecentDamages(damages.slice(0, 6));
      setRecentAdjustments(adjustments.slice(0, 6));
      setBusinessDay(todayBusinessDay);
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

  const categoryLookup = categories.reduce((lookup, category) => {
    lookup[category.id] = category.name;
    return lookup;
  }, {});
  const productValueByCategory = products.reduce((lookup, product) => {
    const category = categoryLookup[product.category_id] ?? "Uncategorised";
    const stockValue = Number(product.current_stock || 0) * Number(product.purchase_price || 0);
    lookup[category] = (lookup[category] ?? 0) + stockValue;
    return lookup;
  }, {});
  const categoryRows = categoryStock.map((row) => ({
    id: row.id ?? row.category,
    category: row.category ?? row.name,
    name: row.category ?? row.name,
    stock: Number(row.stock ?? row.value ?? 0),
    stockValue: productValueByCategory[row.category ?? row.name] ?? 0,
  }));
  const distributionRows = inventoryDistribution.map((row) => {
    const stock = Number(row.stock ?? row.value ?? 0);
    const category = row.category ?? row.name;
    return {
      id: row.id ?? category,
      category,
      name: category,
      stock,
      stockValue: productValueByCategory[category] ?? 0,
    };
  });
  const productBreakdown = selectedCategory
    ? products
        .filter((product) => categoryLookup[product.category_id] === selectedCategory.name)
        .map((product) => ({
          id: product.id,
          name: product.name,
          stock: Number(product.current_stock ?? 0),
          stockValue: Number(product.current_stock || 0) * Number(product.purchase_price || 0),
          unit: product.unit_of_measure,
        }))
        .sort((a, b) => b.stock - a.stock)
    : [];
  const productSearchQuery = productSearch.trim().toLowerCase();
  const filteredProductBreakdown = productSearchQuery
    ? productBreakdown.filter((product) => product.name.toLowerCase().includes(productSearchQuery))
    : productBreakdown;
  const selectedCategorySummary = {
    products: productBreakdown.length,
    stock: productBreakdown.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    stockValue: productBreakdown.reduce((sum, product) => sum + Number(product.stockValue || 0), 0),
  };
  const deliveryProductNames = (delivery) =>
    (delivery.items ?? [])
      .map((item) => item.product_name)
      .filter(Boolean)
      .join(", ");
  const adjustmentType = (adjustment) =>
    adjustment.adjustment_type ?? (Number(adjustment.quantity_change) >= 0 ? "increase" : "decrease");
  const latestActivity = [
    ...recentDeliveries.slice(0, 3).map((delivery) => ({
      id: `delivery-${delivery.id}`,
      icon: <FiBox />,
      label: "Delivery Created",
      detail: `${deliveryProductNames(delivery) || "Products received"} from ${delivery.supplier_name}`,
      date: delivery.delivery_date,
    })),
    ...recentDamages.slice(0, 3).map((damage) => ({
      id: `damage-${damage.id}`,
      icon: <FiAlertTriangle />,
      label: "Damage Recorded",
      detail: `${damage.product_name ?? "Product"} - ${damage.quantity} damaged: ${damage.reason}`,
      date: damage.damage_date,
    })),
    ...recentAdjustments.slice(0, 3).map((adjustment) => ({
      id: `adjustment-${adjustment.id}`,
      icon: <FiSliders />,
      label: "Stock Adjustment",
      detail: `${adjustment.product_name ?? "Product"} - ${adjustmentType(adjustment)} ${Math.abs(Number(adjustment.quantity_change || 0))}: ${adjustment.reason}`,
      date: adjustment.adjustment_date,
    })),
    ...(businessDay?.closed_at
      ? [{
          id: `business-day-${businessDay.id}`,
          icon: <FiCalendar />,
          label: "Business Day Closed",
          detail: businessDay.notes || `Closed for ${businessDay.business_date}`,
          date: businessDay.closed_at,
        }]
      : []),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  const openReport = (report) => navigate(`/reports?view=${report}`);
  const openCategoryPanel = (row) => {
    setSelectedCategory({ name: row.category ?? row.name });
    setProductSearch("");
  };
  const closeCategoryPanel = () => {
    setSelectedCategory(null);
    setProductSearch("");
  };

  return (
    <div className="page">
      <DashboardHeader refresh={loadDashboard} />

      <div className="grid grid-4">
        <KPICard title="Today's Revenue" value={`R ${dashboard.today_revenue ?? 0}`} icon={<FiDollarSign />} onClick={() => openReport("revenue")} />
        <KPICard title="Today's Profit" value={`R ${dashboard.today_profit ?? 0}`} icon={<FiTrendingUp />} onClick={() => openReport("profit")} />
        <KPICard title="Damage Loss" value={`R ${dashboard.today_damage_loss ?? 0}`} icon={<FiAlertTriangle />} color="danger" onClick={() => openReport("damage")} />
        <KPICard title="Estimated Sales" value={dashboard.today_estimated_sales ?? 0} icon={<FiPackage />} onClick={() => openReport("sales")} />
      </div>

      <div className="grid grid-4 mt-20">
        <KPICard title="Low Stock" value={dashboard.low_stock} icon={<FiAlertTriangle />} color="danger" onClick={() => navigate("/products?status=low")} />
        <KPICard title="Products Sold" value={dashboard.products_sold_today ?? 0} icon={<FiBox />} onClick={() => openReport("sold-products")} />
        <KPICard title="Stock Value" value={`R ${dashboard.remaining_stock_value ?? dashboard.stock_value ?? 0}`} icon={<FiPackage />} onClick={() => openReport("stock-valuation")} />
        <KPICard title="Adjustments" value={dashboard.adjustments_today ?? 0} icon={<FiSliders />} onClick={() => navigate("/inventory-adjustment")} />
      </div>

      <div className={`dashboard-workspace mt-20 ${selectedCategory ? "dashboard-workspace--panel-open" : ""}`}>
        <div className="dashboard-main">
          {selectedCategory ? (
            <>
              <div className="grid grid-2">
                <CategoryStockChart
                  data={categoryRows}
                  onSelectCategory={openCategoryPanel}
                />
                <InventoryPieChart
                  data={distributionRows}
                  onSelectCategory={openCategoryPanel}
                />
              </div>

              <section className="erp-card category-drilldown-panel" aria-label={`${selectedCategory.name} product drill-down`}>
                <div className="category-drilldown-panel__header">
                  <div>
                    <span className="eyebrow">Category Drill-Down</span>
                    <h2>{selectedCategory.name}</h2>
                  </div>
                  <button className="btn btn-outline" type="button" onClick={closeCategoryPanel}>
                    <FiArrowLeft /> Back
                  </button>
                </div>

                <div className="category-drilldown-panel__body">
                  <div className="category-summary-grid">
                    <div>
                      <span>Total Products</span>
                      <strong>{selectedCategorySummary.products}</strong>
                    </div>
                    <div>
                      <span>Total Stock</span>
                      <strong>{selectedCategorySummary.stock}</strong>
                    </div>
                    <div>
                      <span>Stock Value</span>
                      <strong>R {selectedCategorySummary.stockValue.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="grid grid-2 category-drilldown-panel__charts">
                    <CategoryStockChart
                      data={productBreakdown}
                      selectedCategory={selectedCategory}
                      hideBackButton
                    />

                    <InventoryPieChart
                      data={distributionRows}
                      selectedCategory={selectedCategory}
                      productData={productBreakdown}
                      hideBackButton
                    />
                  </div>

                  <div className="erp-card">
                    <SectionHeader title="Products" description="Search and review products in this category." />
                    <div className="card-body">
                      <div className="search-bar drilldown-search">
                        <input
                          value={productSearch}
                          onChange={(event) => setProductSearch(event.target.value)}
                          placeholder="Search products"
                        />
                      </div>
                      <DataTable
                        columns={["Product", "Current Stock", "Stock Value", "Unit"]}
                        empty={
                          <tr>
                            <td colSpan="4">
                              <EmptyState title="No products found" />
                            </td>
                          </tr>
                        }
                        minWidth={560}
                      >
                        {filteredProductBreakdown.map((product) => (
                          <tr key={product.id}>
                            <td className="cell-strong">{product.name}</td>
                            <td>{product.stock}</td>
                            <td>R {product.stockValue.toFixed(2)}</td>
                            <td className="cell-muted">{product.unit}</td>
                          </tr>
                        ))}
                      </DataTable>
                    </div>
                  </div>
                </div>
              </section>

              <div className="dashboard-grid">
                <div className="stack">
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
                    <SectionHeader title="Latest Activity" description="Recent deliveries, damages, adjustments, and business-day events." />
                    {latestActivity.length === 0 ? (
                      <EmptyState title="No recent activity" description="New deliveries and damage records will appear here." />
                    ) : (
                      <div className="activity-list">
                        {latestActivity.slice(0, 6).map((activity) => (
                          <div key={activity.id} className="activity-item">
                            <span className="activity-icon">{activity.icon}</span>
                            <div>
                              <strong>{activity.label}</strong>
                              <span>{activity.detail}</span>
                            </div>
                            <small>{new Date(activity.date).toLocaleString()}</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="dashboard-grid">
              <div className="stack">
                <div className="grid grid-2">
                  <CategoryStockChart
                    data={categoryRows}
                    onSelectCategory={openCategoryPanel}
                  />
                  <InventoryPieChart
                    data={distributionRows}
                    onSelectCategory={openCategoryPanel}
                  />
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
                  <SectionHeader title="Latest Activity" description="Recent deliveries, damages, adjustments, and business-day events." />
                  {latestActivity.length === 0 ? (
                    <EmptyState title="No recent activity" description="New deliveries and damage records will appear here." />
                  ) : (
                    <div className="activity-list">
                      {latestActivity.slice(0, 6).map((activity) => (
                        <div key={activity.id} className="activity-item">
                          <span className="activity-icon">{activity.icon}</span>
                          <div>
                            <strong>{activity.label}</strong>
                            <span>{activity.detail}</span>
                          </div>
                          <small>{new Date(activity.date).toLocaleString()}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-3 mt-20">
            <div className="erp-card">
              <SectionHeader title="Recent Deliveries" description="Latest supplier receipts." />
              <DataTable
                columns={["Invoice", "Supplier", "Products", "Quantity", "Date", "Total Cost"]}
                empty={
                  <tr>
                    <td colSpan="6">
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
                    <td>{deliveryProductNames(delivery) || "No products listed"}</td>
                    <td>{(delivery.items ?? []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)}</td>
                    <td className="cell-muted">{new Date(delivery.delivery_date).toLocaleString()}</td>
                    <td className="cell-strong">
                      R {(delivery.items ?? []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost || 0), 0).toFixed(2)}
                    </td>
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
                    <td className="cell-strong">{damage.product_name ?? "Unknown product"}</td>
                    <td>{damage.quantity}</td>
                    <td>{damage.reason}</td>
                    <td className="cell-muted">{new Date(damage.damage_date).toLocaleString()}</td>
                  </tr>
                ))}
              </DataTable>
            </div>

            <div className="erp-card">
              <SectionHeader title="Recent Adjustments" description="Latest manual stock corrections." />
              <DataTable
                columns={["Product", "Type", "Quantity", "Date"]}
                empty={
                  <tr>
                    <td colSpan="4">
                      <EmptyState title="No adjustments recorded" />
                    </td>
                  </tr>
                }
                minWidth={560}
              >
                {recentAdjustments.map((adjustment) => {
                  const type = adjustmentType(adjustment);
                  return (
                    <tr key={adjustment.id}>
                      <td className="cell-strong">{adjustment.product_name ?? "Unknown product"}</td>
                      <td>
                        <span className={`badge ${type === "increase" ? "badge-success" : "badge-danger"}`}>
                          {type}
                        </span>
                      </td>
                      <td>{Math.abs(Number(adjustment.quantity_change || 0))}</td>
                      <td className="cell-muted">{new Date(adjustment.adjustment_date).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </DataTable>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
