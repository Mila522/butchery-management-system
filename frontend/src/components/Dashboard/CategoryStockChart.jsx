import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "../ui";

const COLORS = ["#111827", "#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#9333ea", "#4f46e5", "#65a30d"];

function shortLabel(value = "", max = 16) {
  const label = String(value);
  return label.length > max ? `${label.slice(0, max - 1)}...` : label;
}

function money(value = 0) {
  return `R ${Number(value || 0).toFixed(2)}`;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  return (
    <div className="chart-tooltip">
      <strong>{row.name ?? row.category ?? label}</strong>
      <span>Current stock: {row.stock}</span>
      {row.stockValue !== undefined && <span>Stock value: {money(row.stockValue)}</span>}
      {row.unit && <span>Unit: {row.unit}</span>}
    </div>
  );
}

export default function CategoryStockChart({
  data = [],
  selectedCategory,
  onSelectCategory,
  onBack,
  hideBackButton = false,
}) {
  const title = selectedCategory
    ? `${selectedCategory.name} Product Performance`
    : "Stock by Category";
  const description = selectedCategory
    ? "Current stock and value for each product in this category."
    : "Current units grouped by category. Select a bar for product detail.";
  const xKey = selectedCategory ? "name" : "category";
  const shouldRotateLabels =
    !selectedCategory &&
    (data.length > 7 || data.some((row) => String(row[xKey] ?? "").length > 14));
  const chartHeight = selectedCategory ? Math.max(390, data.length * 42 + 90) : 390;

  return (
    <div className="erp-card chart-card">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {selectedCategory && !hideBackButton && (
          <button className="btn btn-outline" type="button" onClick={onBack}>
            Back
          </button>
        )}
      </div>
      <div className="card-body">
        {data.length === 0 ? (
          <EmptyState title="No stock to display" description="Categories and products will appear here once available." />
        ) : selectedCategory ? (
          <div className="product-performance-scroll">
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 8, right: 74, left: 16, bottom: 8 }}
                barCategoryGap={10}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={170}
                  interval={0}
                  tickFormatter={(value) => shortLabel(value, 24)}
                  tick={{ fontSize: 12, fill: "#454b55" }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="stock" radius={[0, 8, 8, 0]} animationDuration={760}>
                  <LabelList dataKey="stock" position="right" className="bar-value-label" />
                  {data.map((entry, index) => (
                    <Cell key={entry.id ?? entry.name ?? index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: shouldRotateLabels ? 58 : 18 }} barCategoryGap="22%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey={xKey}
                interval={0}
                angle={shouldRotateLabels ? -28 : 0}
                textAnchor={shouldRotateLabels ? "end" : "middle"}
                height={shouldRotateLabels ? 72 : 36}
                tickFormatter={(value) => shortLabel(value, shouldRotateLabels ? 14 : 18)}
                tick={{ fontSize: 12, fill: "#454b55" }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#68707d" }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="stock"
                radius={[8, 8, 0, 0]}
                animationDuration={700}
                cursor={selectedCategory ? "default" : "pointer"}
                onClick={(entry) => !selectedCategory && onSelectCategory?.(entry)}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.id ?? entry.category ?? index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
