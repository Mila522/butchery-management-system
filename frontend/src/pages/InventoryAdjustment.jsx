import React, { useEffect, useMemo, useState } from "react";
import { FiSave } from "react-icons/fi";
import { api } from "../api";
import {
  ActionBar,
  DataTable,
  EmptyState,
  FormCard,
  LoadingState,
  PageHeader,
  SummaryCard,
} from "../components/ui";

export default function InventoryAdjustment() {
  const [products, setProducts] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [adjustment, setAdjustment] = useState({
    product_id: "",
    adjustment_type: "increase",
    quantity_change: "",
    reason: "",
    adjustment_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const [productData, adjustmentData] = await Promise.all([
        api.getProducts(),
        api.getAdjustments().catch(() => []),
      ]);
      setProducts(productData);
      setAdjustments(adjustmentData);
    } catch (err) {
      console.error(err);
      alert("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setAdjustment({
      ...adjustment,
      [e.target.name]: e.target.value,
    });
  }

  async function saveAdjustment(e) {
    e.preventDefault();

    try {
      await api.createAdjustment(adjustment);

      alert("Inventory adjustment recorded successfully.");

      setAdjustment({
        product_id: "",
        adjustment_type: "increase",
        quantity_change: "",
        reason: "",
        adjustment_date: new Date().toISOString().split("T")[0],
      });
      loadProducts();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  const selectedProduct = useMemo(() => {
    return products.find((product) => String(product.id) === String(adjustment.product_id));
  }, [products, adjustment.product_id]);

  const quantity = Number(adjustment.quantity_change || 0);
  const projectedStock = selectedProduct
    ? Number(selectedProduct.current_stock || 0) +
      (adjustment.adjustment_type === "increase" ? quantity : -quantity)
    : 0;

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Loading adjustment screen" />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Inventory Control"
        title="Inventory Adjustment"
        description="Record controlled stock corrections without changing receiving or damage workflows."
      />

      <form onSubmit={saveAdjustment} className="stack">
        <div className="grid grid-3">
          <div className="wide-panel">
            <FormCard title="Adjustment Details" description="Select the product, direction and reason for this stock movement.">
              <div className="form-grid">
                <div className="form-field span-2">
                  <label>Product</label>
                  <select
                    name="product_id"
                    value={adjustment.product_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Adjustment Type</label>
                  <select name="adjustment_type" value={adjustment.adjustment_type} onChange={handleChange}>
                    <option value="increase">Increase Stock</option>
                    <option value="decrease">Decrease Stock</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    name="quantity_change"
                    value={adjustment.quantity_change}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Reason</label>
                  <select name="reason" value={adjustment.reason} onChange={handleChange} required>
                    <option value="">Select Reason</option>
                    <option value="Stock Count">Stock Count</option>
                    <option value="Correction">Correction</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Theft">Theft</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Adjustment Date</label>
                  <input
                    type="date"
                    name="adjustment_date"
                    value={adjustment.adjustment_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </FormCard>
          </div>

          <SummaryCard
            title="Adjustment Summary"
            rows={[
              { label: "Current Stock", value: selectedProduct?.current_stock ?? "Select product" },
              { label: "Adjustment", value: adjustment.quantity_change || 0 },
              { label: "Direction", value: adjustment.adjustment_type },
            ]}
            totalLabel="Projected Stock"
            totalValue={selectedProduct ? projectedStock : "-"}
            tone={projectedStock < 0 ? "danger" : "success"}
          />
        </div>

        {selectedProduct && projectedStock < 0 && (
          <div className="alert-strip">Projected stock is below zero. Review the quantity before saving.</div>
        )}

        <ActionBar>
          <button className="btn btn-primary" type="submit">
            <FiSave /> Save Adjustment
          </button>
        </ActionBar>
      </form>

      <div className="erp-card mt-20">
        <div className="section-header">
          <div>
            <h2>Adjustment History</h2>
            <p>Recent manual stock corrections.</p>
          </div>
        </div>
        <DataTable
          columns={["Product", "Type", "Quantity", "Reason", "Date"]}
          empty={
            <tr>
              <td colSpan="5">
                <EmptyState title="No adjustments recorded" />
              </td>
            </tr>
          }
          minWidth={760}
        >
          {adjustments.slice(0, 12).map((row) => (
            <tr key={row.id}>
              <td className="cell-strong">{row.product_name ?? `Product #${row.product_id}`}</td>
              <td>
                <span className={`badge ${row.adjustment_type === "increase" ? "badge-success" : "badge-danger"}`}>
                  {row.adjustment_type}
                </span>
              </td>
              <td>{row.quantity_change}</td>
              <td>{row.reason}</td>
              <td className="cell-muted">{new Date(row.adjustment_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
