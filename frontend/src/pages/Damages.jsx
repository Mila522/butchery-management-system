import React, { useEffect, useMemo, useState } from "react";
import { FiAlertTriangle, FiSave } from "react-icons/fi";
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

export default function Damages() {
  const [products, setProducts] = useState([]);
  const [damages, setDamages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [damage, setDamage] = useState({
    product_id: "",
    quantity: "",
    reason: "",
    damage_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const [productData, damageData] = await Promise.all([
        api.getProducts(),
        api.getDamages().catch(() => []),
      ]);
      setProducts(productData);
      setDamages(damageData);
    } catch (err) {
      console.error(err);
      alert("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setDamage({
      ...damage,
      [e.target.name]: e.target.value,
    });
  }

  async function saveDamage(e) {
    e.preventDefault();

    try {
      await api.createDamage(damage);

      alert("Damage recorded successfully.");

      setDamage({
        product_id: "",
        quantity: "",
        reason: "",
        damage_date: new Date().toISOString().split("T")[0],
      });
      loadProducts();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  const selectedProduct = useMemo(() => {
    return products.find((product) => String(product.id) === String(damage.product_id));
  }, [products, damage.product_id]);

  const quantity = Number(damage.quantity || 0);
  const remainingStock = selectedProduct ? Number(selectedProduct.current_stock || 0) - quantity : 0;

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Loading damage screen" />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Inventory Control"
        title="Record Damage"
        description="Write off damaged, expired or unusable stock with a clear reason and audit trail."
      />

      <form onSubmit={saveDamage} className="stack">
        <div className="grid grid-3">
          <div className="wide-panel">
            <FormCard title="Damage Details" description="Capture the product, quantity, reason and date for this stock loss.">
              <div className="form-grid">
                <div className="form-field span-2">
                  <label>Product</label>
                  <select name="product_id" value={damage.product_id} onChange={handleChange} required>
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Quantity Damaged</label>
                  <input
                    type="number"
                    step="0.01"
                    name="quantity"
                    value={damage.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Reason</label>
                  <select name="reason" value={damage.reason} onChange={handleChange} required>
                    <option value="">Select Reason</option>
                    <option value="Spoiled">Spoiled</option>
                    <option value="Expired">Expired</option>
                    <option value="Burnt">Burnt</option>
                    <option value="Theft">Theft</option>
                    <option value="Handling Damage">Handling Damage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Damage Date</label>
                  <input
                    type="date"
                    name="damage_date"
                    value={damage.damage_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </FormCard>
          </div>

          <SummaryCard
            title="Damage Summary"
            rows={[
              { label: "Current Stock", value: selectedProduct?.current_stock ?? "Select product" },
              { label: "Quantity Damaged", value: damage.quantity || 0 },
              { label: "Reason", value: damage.reason || "Not selected" },
            ]}
            totalLabel="Remaining Stock"
            totalValue={selectedProduct ? remainingStock : "-"}
            tone={remainingStock < 0 ? "danger" : "success"}
          />
        </div>

        {selectedProduct && remainingStock < 0 && (
          <div className="alert-strip">
            <FiAlertTriangle /> Damage quantity is greater than current stock. Review before saving.
          </div>
        )}

        <ActionBar>
          <button className="btn btn-danger" type="submit">
            <FiSave /> Record Damage
          </button>
        </ActionBar>
      </form>

      <div className="erp-card mt-20">
        <div className="section-header">
          <div>
            <h2>Damage History</h2>
            <p>Recent damaged stock records.</p>
          </div>
        </div>
        <DataTable
          columns={["Product", "Quantity", "Reason", "Date"]}
          empty={
            <tr>
              <td colSpan="4">
                <EmptyState title="No damages recorded" />
              </td>
            </tr>
          }
          minWidth={680}
        >
          {damages.slice(0, 12).map((row) => (
            <tr key={row.id}>
              <td className="cell-strong">{row.product_name ?? `Product #${row.product_id}`}</td>
              <td>
                <span className="badge badge-danger">{row.quantity}</span>
              </td>
              <td>{row.reason}</td>
              <td className="cell-muted">{new Date(row.damage_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
