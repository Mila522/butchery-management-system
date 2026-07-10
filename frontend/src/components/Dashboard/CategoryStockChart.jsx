import React, { useEffect, useState } from "react";
import { api } from "../../api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#111111", "#3f4652", "#6d7480", "#a3a9b3", "#d1d5db"];

export default function CategoryStockChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadChart();
  }, []);

  async function loadChart() {
    try {
      const response = await api.getCategoryStock();
      setData(response);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="erp-card chart-card">
      <div className="section-header">
        <div>
          <h2>Stock by Category</h2>
          <p>Current units grouped by category.</p>
        </div>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stock" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.category ?? index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
