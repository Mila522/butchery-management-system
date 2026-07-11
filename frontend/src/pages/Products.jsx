import React, { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiEye, FiPower, FiPlus, FiX } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import {
  DataTable,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchBar,
  Toolbar,
  FormCard,
} from "../components/ui";

const productDefaults = {
  sku: "",
  name: "",
  category_id: "",
  unit_of_measure: "KG",
  product_type: "Fresh Meat",
  purchase_price: "0",
  selling_price: "0",
  minimum_stock: "0",
  active: true,
};

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") === "low" ? "low" : "all");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newProduct, setNewProduct] = useState(productDefaults);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const [productData, categoryData] = await Promise.all([
        api.getProducts(),
        api.getCategories().catch(() => []),
      ]);
      setProducts(productData);
      setCategories(categoryData);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const categoryLookup = useMemo(() => {
    return categories.reduce((lookup, category) => {
      lookup[category.id] = category.name;
      return lookup;
    }, {});
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesSearch =
          !query ||
          product.name?.toLowerCase().includes(query) ||
          product.sku?.toLowerCase().includes(query);
        const matchesCategory =
          categoryFilter === "all" || String(product.category_id) === categoryFilter;
        const matchesUnit =
          unitFilter === "all" || product.unit_of_measure === unitFilter;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && product.active) ||
          (statusFilter === "inactive" && !product.active) ||
          (statusFilter === "low" && Number(product.current_stock || 0) <= 10);

        return matchesSearch && matchesCategory && matchesUnit && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "stock") return Number(a.current_stock || 0) - Number(b.current_stock || 0);
        if (sortBy === "selling") return Number(b.selling_price || 0) - Number(a.selling_price || 0);
        return String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? ""));
      });
  }, [products, search, categoryFilter, unitFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pageProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  const units = ["KG", "EACH", "BAG", "PACK", "TRAY", "BOX", "BOTTLE", "CAN", "LOAF"];

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, unitFilter, statusFilter, sortBy]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  async function createProduct(event) {
    event.preventDefault();
    try {
      await api.createProduct({
        ...newProduct,
        sku: newProduct.sku || null,
        category_id: Number(newProduct.category_id),
        purchase_price: newProduct.purchase_price,
        selling_price: newProduct.selling_price,
        minimum_stock: newProduct.minimum_stock,
      });
      setNewProduct(productDefaults);
      setShowCreate(false);
      await loadProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  function openEditProduct(product) {
    setEditingProduct({
      ...product,
      category_id: String(product.category_id),
      purchase_price: String(product.purchase_price ?? 0),
      selling_price: String(product.selling_price ?? 0),
      minimum_stock: String(product.minimum_stock ?? 0),
      active: Boolean(product.active),
    });
  }

  async function updateProduct(event) {
    event.preventDefault();
    try {
      await api.updateProduct(editingProduct.id, {
        sku: editingProduct.sku || null,
        name: editingProduct.name,
        category_id: Number(editingProduct.category_id),
        unit_of_measure: editingProduct.unit_of_measure,
        product_type: editingProduct.product_type,
        purchase_price: editingProduct.purchase_price,
        selling_price: editingProduct.selling_price,
        minimum_stock: editingProduct.minimum_stock,
        active: editingProduct.active,
      });
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  async function toggleProductStatus(product) {
    const action = product.active ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} ${product.name}?`)) return;

    try {
      if (product.active) {
        await api.deactivateProduct(product.id);
      } else {
        await api.activateProduct(product.id);
      }
      await loadProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Loading products" />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Inventory"
        title="Products"
        description="Search, filter and review stock status across all inventory items."
        actions={
          <button className="btn btn-primary" type="button" onClick={() => setShowCreate((value) => !value)}>
            <FiPlus /> Add Product
          </button>
        }
      />

      {showCreate && (
        <FormCard title="New Product" description="Create a product manually for daily stock control.">
          <form className="form-grid" onSubmit={createProduct}>
            <label>
              SKU
              <input
                value={newProduct.sku}
                onChange={(event) => setNewProduct({ ...newProduct, sku: event.target.value })}
                placeholder="Optional"
              />
            </label>
            <label>
              Name
              <input
                value={newProduct.name}
                onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })}
                required
              />
            </label>
            <label>
              Category
              <select
                value={newProduct.category_id}
                onChange={(event) => setNewProduct({ ...newProduct, category_id: event.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Product Type
              <select
                value={newProduct.product_type}
                onChange={(event) => setNewProduct({ ...newProduct, product_type: event.target.value })}
              >
                <option>Fresh Meat</option>
                <option>Chicken Pieces</option>
                <option>Cold Drinks</option>
                <option>Spices</option>
                <option>General</option>
              </select>
            </label>
            <label>
              Unit
              <select
                value={newProduct.unit_of_measure}
                onChange={(event) => setNewProduct({ ...newProduct, unit_of_measure: event.target.value })}
              >
                <option value="KG">KG</option>
                <option value="EACH">EACH</option>
                <option value="BAG">BAG</option>
                <option value="PACK">PACK</option>
                <option value="TRAY">TRAY</option>
                <option value="BOX">BOX</option>
                <option value="BOTTLE">BOTTLE</option>
                <option value="CAN">CAN</option>
                <option value="LOAF">LOAF</option>
              </select>
            </label>
            <label>
              Purchase Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.purchase_price}
                onChange={(event) => setNewProduct({ ...newProduct, purchase_price: event.target.value })}
              />
            </label>
            <label>
              Selling Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.selling_price}
                onChange={(event) => setNewProduct({ ...newProduct, selling_price: event.target.value })}
              />
            </label>
            <label>
              Minimum Stock
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.minimum_stock}
                onChange={(event) => setNewProduct({ ...newProduct, minimum_stock: event.target.value })}
              />
            </label>
            <label>
              Status
              <select
                value={newProduct.active ? "active" : "inactive"}
                onChange={(event) => setNewProduct({ ...newProduct, active: event.target.value === "active" })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Create Product</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </FormCard>
      )}

      <Toolbar>
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by SKU or product name"
        />
        <div className="filter-panel">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}>
            <option value="all">All Units</option>
            {units.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="low">Low Stock</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="sku">Sort by SKU</option>
            <option value="stock">Sort by Stock</option>
            <option value="selling">Sort by Selling Price</option>
          </select>
        </div>
      </Toolbar>

      <DataTable
        columns={["SKU", "Name", "Type", "Category", "Purchase", "Selling", "Stock", "Status", "Actions"]}
        empty={
          <tr>
                <td colSpan="9">
              <EmptyState title="No products found" description="Try a different search or filter." />
            </td>
          </tr>
        }
        minWidth={980}
      >
        {pageProducts.map((product) => {
          const stock = Number(product.current_stock || 0);
          const stockBadge = stock <= 0 ? "badge-danger" : stock <= 10 ? "badge-warning" : "badge-success";

          return (
            <tr key={product.id}>
              <td className="cell-muted">{product.sku}</td>
              <td className="cell-strong">{product.name}</td>
              <td>{product.product_type ?? "GENERAL"}</td>
              <td>
                <span className="badge">{categoryLookup[product.category_id] ?? `Category #${product.category_id}`}</span>
              </td>
              <td>R {product.purchase_price}</td>
              <td className="cell-strong">R {product.selling_price}</td>
              <td>
                <span className={`badge ${stockBadge}`}>{product.current_stock}</span>
              </td>
              <td>
                <span className={`badge ${product.active ? "badge-success" : "badge-danger"}`}>
                  {product.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-icon btn-outline" type="button" onClick={() => setViewingProduct(product)} aria-label={`View ${product.name}`}>
                    <FiEye />
                  </button>
                  <button className="btn btn-icon btn-outline" type="button" onClick={() => openEditProduct(product)} aria-label={`Edit ${product.name}`}>
                    <FiEdit2 />
                  </button>
                  <button
                    className={`btn btn-icon ${product.active ? "btn-outline-danger" : "btn-outline"}`}
                    type="button"
                    onClick={() => toggleProductStatus(product)}
                    aria-label={`${product.active ? "Deactivate" : "Activate"} ${product.name}`}
                  >
                    <FiPower />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <div className="pagination-bar">
        <span>
          Showing {filteredProducts.length === 0 ? 0 : (page - 1) * pageSize + 1}-
          {Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length}
        </span>
        <div>
          <button className="btn btn-outline" type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </button>
          <strong>Page {page} of {totalPages}</strong>
          <button className="btn btn-outline" type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>
            Next
          </button>
        </div>
      </div>

      {editingProduct && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h2>Edit Product</h2>
                <p>{editingProduct.name}</p>
              </div>
              <button className="btn btn-icon btn-outline" type="button" onClick={() => setEditingProduct(null)} aria-label="Close edit product">
                <FiX />
              </button>
            </div>
            <form className="form-grid" onSubmit={updateProduct}>
              <label>
                SKU
                <input value={editingProduct.sku ?? ""} onChange={(event) => setEditingProduct({ ...editingProduct, sku: event.target.value })} />
              </label>
              <label>
                Name
                <input value={editingProduct.name ?? ""} onChange={(event) => setEditingProduct({ ...editingProduct, name: event.target.value })} required />
              </label>
              <label>
                Category
                <select value={editingProduct.category_id} onChange={(event) => setEditingProduct({ ...editingProduct, category_id: event.target.value })} required>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Unit
                <select value={editingProduct.unit_of_measure} onChange={(event) => setEditingProduct({ ...editingProduct, unit_of_measure: event.target.value })}>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </label>
              <label>
                Purchase Price
                <input type="number" min="0" step="0.01" value={editingProduct.purchase_price} onChange={(event) => setEditingProduct({ ...editingProduct, purchase_price: event.target.value })} />
              </label>
              <label>
                Selling Price
                <input type="number" min="0" step="0.01" value={editingProduct.selling_price} onChange={(event) => setEditingProduct({ ...editingProduct, selling_price: event.target.value })} />
              </label>
              <label>
                Minimum Stock
                <input type="number" min="0" step="0.01" value={editingProduct.minimum_stock} onChange={(event) => setEditingProduct({ ...editingProduct, minimum_stock: event.target.value })} />
              </label>
              <label>
                Status
                <select value={editingProduct.active ? "active" : "inactive"} onChange={(event) => setEditingProduct({ ...editingProduct, active: event.target.value === "active" })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <div className="form-actions span-2">
                <button className="btn btn-primary" type="submit">Save Product</button>
                <button className="btn btn-outline" type="button" onClick={() => setEditingProduct(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingProduct && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel modal-panel--sm">
            <div className="modal-header">
              <div>
                <h2>{viewingProduct.name}</h2>
                <p>{viewingProduct.sku || "No SKU"}</p>
              </div>
              <button className="btn btn-icon btn-outline" type="button" onClick={() => setViewingProduct(null)} aria-label="Close product details">
                <FiX />
              </button>
            </div>
            <div className="detail-list">
              <div><span>Category</span><strong>{categoryLookup[viewingProduct.category_id] ?? `Category #${viewingProduct.category_id}`}</strong></div>
              <div><span>Unit</span><strong>{viewingProduct.unit_of_measure}</strong></div>
              <div><span>Purchase Price</span><strong>R {viewingProduct.purchase_price}</strong></div>
              <div><span>Selling Price</span><strong>R {viewingProduct.selling_price}</strong></div>
              <div><span>Minimum Stock</span><strong>{viewingProduct.minimum_stock}</strong></div>
              <div><span>Current Stock</span><strong>{viewingProduct.current_stock}</strong></div>
              <div><span>Status</span><strong>{viewingProduct.active ? "Active" : "Inactive"}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
