import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import { api } from "../api";
import {
  ActionBar,
  DataTable,
  FormCard,
  PageHeader,
  SummaryCard,
} from "../components/ui";
import "../styles/receive-stock.css";

const initialDelivery = () => ({
  invoice_number: "",
  supplier_name: "",
  delivery_date: new Date().toISOString().split("T")[0],
  recorded_by: "Manager",
  notes: "",
});

const initialItem = () => ({
  product_id: "",
  quantity: "",
  unit_cost: "",
});

export default function ReceiveStock() {
  const [products, setProducts] = useState([]);
  const [delivery, setDelivery] = useState(initialDelivery);
  const [items, setItems] = useState([initialItem()]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load products.");
    }
  }

  function handleDeliveryChange(e) {
    setDelivery({
      ...delivery,
      [e.target.name]: e.target.value,
    });
  }

  function handleItemChange(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  function addRow() {
    setItems([...items, initialItem()]);
  }

  function removeRow(index) {
    if (items.length === 1) return;
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  }

  function resetForm() {
    setDelivery(initialDelivery());
    setItems([initialItem()]);
  }

  const deliveryTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const qty = Number(item.quantity || 0);
      const cost = Number(item.unit_cost || 0);
      return total + qty * cost;
    }, 0);
  }, [items]);

  const totalProducts = useMemo(() => {
    return items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }, [items]);

  async function saveDelivery(e) {
    e.preventDefault();

    try {
      await api.createDelivery({
        ...delivery,
        items,
      });

      alert("Delivery recorded successfully.");
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Receiving"
        title="Receive Stock"
        description="Record supplier deliveries and update inventory with line-level quantities and costs."
        meta={<div className="header-pill">Delivery date: {delivery.delivery_date}</div>}
      />

      <form onSubmit={saveDelivery} className="stack">
        <div className="grid grid-3">
          <div className="stack wide-panel">
            <FormCard title="Delivery Information" description="Supplier and invoice details for this receipt.">
              <div className="form-grid">
                <div className="form-field">
                  <label>Invoice Number</label>
                  <input
                    name="invoice_number"
                    value={delivery.invoice_number}
                    onChange={handleDeliveryChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Supplier</label>
                  <input
                    name="supplier_name"
                    value={delivery.supplier_name}
                    onChange={handleDeliveryChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Delivery Date</label>
                  <input
                    type="date"
                    name="delivery_date"
                    value={delivery.delivery_date}
                    onChange={handleDeliveryChange}
                  />
                </div>

                <div className="form-field">
                  <label>Recorded By</label>
                  <input
                    name="recorded_by"
                    value={delivery.recorded_by}
                    onChange={handleDeliveryChange}
                  />
                </div>

                <div className="form-field span-2">
                  <label>Notes</label>
                  <textarea name="notes" value={delivery.notes} onChange={handleDeliveryChange} />
                </div>
              </div>
            </FormCard>
          </div>

          <SummaryCard
            title="Delivery Summary"
            rows={[
              { label: "Lines", value: items.length },
              { label: "Total Quantity", value: totalProducts },
              { label: "Supplier", value: delivery.supplier_name || "Not selected" },
            ]}
            totalLabel="Total Cost"
            totalValue={`R ${deliveryTotal.toFixed(2)}`}
          />
        </div>

        <FormCard
          title="Products Received"
          description="Add every product line received from the supplier."
          actions={
            <button type="button" className="btn btn-primary" onClick={addRow}>
              <FiPlus /> Add Product
            </button>
          }
        >
          <DataTable columns={["Product", "Quantity", "Unit Cost", "Line Total", ""]} minWidth={860}>
            {items.map((item, index) => {
              const qty = Number(item.quantity || 0);
              const cost = Number(item.unit_cost || 0);
              const total = qty * cost;

              return (
                <tr key={index}>
                  <td>
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_cost}
                      onChange={(e) => handleItemChange(index, "unit_cost", e.target.value)}
                    />
                  </td>
                  <td className="cell-strong">R {total.toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-icon btn-outline-danger"
                      onClick={() => removeRow(index)}
                      aria-label="Remove product line"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </FormCard>

        <ActionBar>
          <button type="button" className="btn btn-outline" onClick={resetForm}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <FiSave /> Save Delivery
          </button>
        </ActionBar>
      </form>
    </div>
  );
}
