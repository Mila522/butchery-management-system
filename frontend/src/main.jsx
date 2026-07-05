import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { api } from "./api";
import "./styles.css";

const nowForInput = () => new Date().toISOString().slice(0, 16);
const toApiDateTime = (value) => new Date(value).toISOString();

function Notice({ notice, onClose }) {
  if (!notice) return null;
  return (
    <div className={`notice ${notice.type}`} role="status">
      <span>{notice.message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification">
        x
      </button>
    </div>
  );
}

function ProductSelect({ products, value, onChange }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} required>
      <option value="">Select product</option>
      {products.map((product) => (
        <option key={product.id} value={product.id}>
          {product.name} ({product.current_stock} {product.unit_of_measure})
        </option>
      ))}
    </select>
  );
}

function DeliveriesPage({ products, notify }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    invoice_number: "",
    supplier_name: "",
    delivery_date: nowForInput(),
    recorded_by: "",
    notes: "",
    product_id: "",
    quantity: "",
    unit_cost: "",
  });

  async function load() {
    setLoading(true);
    try {
      setRows(await api.getDeliveries());
    } catch (error) {
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.createDelivery({
        invoice_number: form.invoice_number,
        supplier_name: form.supplier_name,
        delivery_date: toApiDateTime(form.delivery_date),
        recorded_by: form.recorded_by,
        notes: form.notes || null,
        items: [
          {
            product_id: Number(form.product_id),
            quantity: Number(form.quantity),
            unit_cost: Number(form.unit_cost),
          },
        ],
      });
      notify("success", "Delivery recorded and stock increased.");
      setForm({ ...form, invoice_number: "", quantity: "", unit_cost: "", notes: "" });
      load();
    } catch (error) {
      notify("error", error.message);
    }
  }

  return (
    <section className="module">
      <form onSubmit={submit} className="panel">
        <h2>New Delivery</h2>
        <div className="grid">
          <label>
            Invoice number
            <input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} required />
          </label>
          <label>
            Supplier
            <input value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} required />
          </label>
          <label>
            Delivery date
            <input type="datetime-local" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} required />
          </label>
          <label>
            Recorded by
            <input value={form.recorded_by} onChange={(e) => setForm({ ...form, recorded_by: e.target.value })} required />
          </label>
          <label>
            Product
            <ProductSelect products={products} value={form.product_id} onChange={(value) => setForm({ ...form, product_id: value })} />
          </label>
          <label>
            Quantity
            <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          </label>
          <label>
            Unit cost
            <input type="number" min="0" step="0.01" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} required />
          </label>
          <label>
            Notes
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
        </div>
        <button type="submit">Record delivery</button>
      </form>
      <TransactionTable title="Deliveries" rows={rows} loading={loading} columns={["invoice_number", "supplier_name", "delivery_date", "recorded_by"]} />
    </section>
  );
}

function DamagesPage({ products, notify }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    product_id: "",
    quantity_damaged: "",
    reason: "",
    description: "",
    damage_date: nowForInput(),
    reported_by: "",
  });

  async function load() {
    setLoading(true);
    try {
      setRows(await api.getDamages());
    } catch (error) {
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.createDamage({
        ...form,
        product_id: Number(form.product_id),
        quantity_damaged: Number(form.quantity_damaged),
        damage_date: toApiDateTime(form.damage_date),
        description: form.description || null,
        reported_by: form.reported_by || null,
      });
      notify("success", "Damage recorded and stock decreased.");
      setForm({ ...form, quantity_damaged: "", reason: "", description: "" });
      load();
    } catch (error) {
      notify("error", error.message);
    }
  }

  return (
    <section className="module">
      <form onSubmit={submit} className="panel">
        <h2>Record Damage</h2>
        <div className="grid">
          <label>
            Product
            <ProductSelect products={products} value={form.product_id} onChange={(value) => setForm({ ...form, product_id: value })} />
          </label>
          <label>
            Quantity damaged
            <input type="number" min="0.01" step="0.01" value={form.quantity_damaged} onChange={(e) => setForm({ ...form, quantity_damaged: e.target.value })} required />
          </label>
          <label>
            Reason
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
          </label>
          <label>
            Damage date
            <input type="datetime-local" value={form.damage_date} onChange={(e) => setForm({ ...form, damage_date: e.target.value })} required />
          </label>
          <label>
            Reported by
            <input value={form.reported_by} onChange={(e) => setForm({ ...form, reported_by: e.target.value })} />
          </label>
          <label>
            Description
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
        </div>
        <button type="submit">Record damage</button>
      </form>
      <TransactionTable title="Damages" rows={rows} loading={loading} columns={["product_id", "quantity_damaged", "reason", "damage_date"]} />
    </section>
  );
}

function AdjustmentsPage({ products, notify }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    product_id: "",
    adjustment_type: "increase",
    quantity_adjusted: "",
    reason: "Correction",
    notes: "",
    adjusted_by: "",
    adjustment_date: nowForInput(),
  });

  async function load() {
    setLoading(true);
    try {
      setRows(await api.getAdjustments());
    } catch (error) {
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.createAdjustment({
        ...form,
        product_id: Number(form.product_id),
        quantity_adjusted: Number(form.quantity_adjusted),
        adjustment_date: toApiDateTime(form.adjustment_date),
        notes: form.notes || null,
        adjusted_by: form.adjusted_by || null,
      });
      notify("success", "Inventory adjustment recorded.");
      setForm({ ...form, quantity_adjusted: "", notes: "" });
      load();
    } catch (error) {
      notify("error", error.message);
    }
  }

  return (
    <section className="module">
      <form onSubmit={submit} className="panel">
        <h2>Inventory Adjustment</h2>
        <div className="grid">
          <label>
            Product
            <ProductSelect products={products} value={form.product_id} onChange={(value) => setForm({ ...form, product_id: value })} />
          </label>
          <label>
            Type
            <select value={form.adjustment_type} onChange={(e) => setForm({ ...form, adjustment_type: e.target.value })}>
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          </label>
          <label>
            Quantity
            <input type="number" min="0.01" step="0.01" value={form.quantity_adjusted} onChange={(e) => setForm({ ...form, quantity_adjusted: e.target.value })} required />
          </label>
          <label>
            Reason
            <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
              <option>Stock Count</option>
              <option>Theft</option>
              <option>Correction</option>
              <option>Transfer</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Adjustment date
            <input type="datetime-local" value={form.adjustment_date} onChange={(e) => setForm({ ...form, adjustment_date: e.target.value })} required />
          </label>
          <label>
            Adjusted by
            <input value={form.adjusted_by} onChange={(e) => setForm({ ...form, adjusted_by: e.target.value })} />
          </label>
          <label className="wide">
            Notes
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
        </div>
        <button type="submit">Record adjustment</button>
      </form>
      <TransactionTable title="Inventory Adjustments" rows={rows} loading={loading} columns={["product_id", "adjustment_type", "quantity_adjusted", "reason", "adjustment_date"]} />
    </section>
  );
}

function TransactionTable({ title, rows, loading, columns }) {
  return (
    <div className="panel">
      <h2>{title}</h2>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column.replaceAll("_", " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column}>{String(row[column] ?? "")}</td>
                  ))}
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={columns.length} className="muted">
                    No records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeModule, setActiveModule] = useState("deliveries");
  const [products, setProducts] = useState([]);
  const [notice, setNotice] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");

  const notify = (type, message) => setNotice({ type, message });

  useEffect(() => {
    api.getProducts().then(setProducts).catch((error) => notify("error", error.message));
  }, []);

  const page = useMemo(() => {
    if (activeModule === "damages") return <DamagesPage products={products} notify={notify} />;
    if (activeModule === "adjustments") return <AdjustmentsPage products={products} notify={notify} />;
    return <DeliveriesPage products={products} notify={notify} />;
  }, [activeModule, products]);

  function saveToken(value) {
    setToken(value);
    if (value) localStorage.setItem("access_token", value);
    else localStorage.removeItem("access_token");
  }

  return (
    <main>
      <header>
        <div>
          <h1>Eyethu Butchery Inventory</h1>
          <p>Deliveries, damages, and manual stock corrections</p>
        </div>
        <label className="token">
          API token
          <input value={token} onChange={(event) => saveToken(event.target.value)} placeholder="Paste JWT for protected actions" />
        </label>
      </header>
      <nav>
        <button className={activeModule === "deliveries" ? "active" : ""} onClick={() => setActiveModule("deliveries")}>
          Deliveries
        </button>
        <button className={activeModule === "damages" ? "active" : ""} onClick={() => setActiveModule("damages")}>
          Damages
        </button>
        <button className={activeModule === "adjustments" ? "active" : ""} onClick={() => setActiveModule("adjustments")}>
          Adjustments
        </button>
      </nav>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      {page}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);