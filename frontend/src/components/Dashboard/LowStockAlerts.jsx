import React, { useEffect, useState } from "react";
import { api } from "../../api";
import { EmptyState } from "../ui";

export default function LowStockAlerts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const data = await api.getLowStock();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="erp-card">
      <div className="section-header">
        <div>
          <h2>Low Stock Alerts</h2>
          <p>Products that need attention.</p>
        </div>
      </div>
      {products.length === 0 ? (
        <EmptyState
          title="No low stock items"
          description="Inventory levels are currently healthy."
        />
      ) : (
        <div className="activity-list">
          {products.map((product) => (
            <div key={product.id} className="activity-item">
              <strong>{product.name}</strong>
              <span className="badge badge-danger">{product.current_stock}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
