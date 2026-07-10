import React, { useEffect, useState } from "react";
import { api } from "../../api";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#111111", "#3f4652", "#6d7480", "#a3a9b3", "#d1d5db"];

export default function InventoryPieChart() {
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
          <h2>Inventory Distribution</h2>
          <p>Current stock distribution by category.</p>
        </div>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={330}>
          <PieChart>
            <Pie
              data={data}
              dataKey="stock"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={118}
              innerRadius={68}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.category ?? index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
