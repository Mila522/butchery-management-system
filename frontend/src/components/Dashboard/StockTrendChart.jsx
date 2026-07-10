import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../../api";

export default function StockTrendChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadChart();
  }, []);

  async function loadChart() {
    try {
      const result = await api.getStockTrend();
      setData(result);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="erp-card chart-card">
      <div className="section-header">
        <div>
          <h2>Stock Trend</h2>
          <p>Last 7 days of stock movement.</p>
        </div>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="stock"
              stroke="#111111"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
