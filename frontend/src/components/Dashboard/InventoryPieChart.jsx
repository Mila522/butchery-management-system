import React from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { EmptyState } from "../ui";

const COLORS = ["#111827", "#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#9333ea", "#4f46e5", "#65a30d"];

function formatPercent(value = 0) {
  return `${Number(value).toFixed(value >= 10 ? 0 : 1)}%`;
}

function money(value = 0) {
  return `R ${Number(value || 0).toFixed(2)}`;
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <strong>{row.category ?? row.name}</strong>
      <span>Current stock: {row.stock}</span>
      <span>Share: {formatPercent(row.percent)}</span>
      <span>Stock value: {money(row.stockValue)}</span>
    </div>
  );
}

function shortLabel(value = "", max = 18) {
  const label = String(value);
  return label.length > max ? `${label.slice(0, max - 1)}...` : label;
}

function renderLegend({ payload }) {
  return (
    <div className="pie-legend">
      <div className="pie-legend__head">
        <span>Category</span>
        <span>Current Stock</span>
        <span>Percentage</span>
      </div>
      {payload?.map((entry) => {
        const row = entry.payload;
        return (
          <button
            key={row.id ?? row.category}
            className="pie-legend__row"
            type="button"
            onClick={() => row.onSelect?.(row)}
          >
            <span><i style={{ background: entry.color }} />{row.category ?? row.name}</span>
            <strong>{row.stock}</strong>
            <strong>{formatPercent(row.percent)}</strong>
          </button>
        );
      })}
    </div>
  );
}

export default function InventoryPieChart({ data = [], selectedCategory, productData = [], onSelectCategory, onBack, hideBackButton = false }) {
  const sourceRows = selectedCategory ? productData : data;
  const total = sourceRows.reduce((sum, row) => sum + Number(row.stock ?? row.value ?? 0), 0);
  const chartData = sourceRows.map((row) => {
    const stock = Number(row.stock ?? row.value ?? 0);
    return {
      ...row,
      category: row.category ?? row.name,
      stock,
      percent: total > 0 ? (stock / total) * 100 : 0,
      onSelect: selectedCategory ? undefined : onSelectCategory,
    };
  });
  const crowdedLabels =
    chartData.length > 8 || chartData.some((row) => String(row.category ?? row.name ?? "").length > 18);
  const chartHeight = selectedCategory ? Math.min(680, Math.max(440, chartData.length * 34 + 260)) : 420;
  const renderSliceLabel = ({ category, name, percent }) => {
    if (crowdedLabels || percent < 7) return "";
    return `${shortLabel(category ?? name)} ${formatPercent(percent)}`;
  };

  return (
    <div className="erp-card chart-card">
      <div className="section-header">
        <div>
          <h2>{selectedCategory ? `${selectedCategory.name} Distribution` : "Inventory Distribution"}</h2>
          <p>{selectedCategory ? "Product share within the selected category." : "Category share by current stock. Select a slice for product detail."}</p>
        </div>
        {selectedCategory && !hideBackButton && (
          <button className="btn btn-outline" type="button" onClick={onBack}>
            Back
          </button>
        )}
      </div>
      <div className="card-body">
        {chartData.length === 0 ? (
          <EmptyState title="No inventory distribution" description="Stocked categories will appear here." />
        ) : (
          <div className={selectedCategory ? "pie-chart-scroll" : undefined}>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="stock"
                  nameKey="category"
                  cx="50%"
                  cy="40%"
                  outerRadius={112}
                  innerRadius={62}
                  paddingAngle={2}
                  label={renderSliceLabel}
                  labelLine={false}
                  minAngle={4}
                  animationDuration={850}
                  onClick={(entry) => !selectedCategory && onSelectCategory?.(entry)}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.id ?? entry.category ?? index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend verticalAlign="bottom" content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
