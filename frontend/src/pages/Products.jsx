import React, { useEffect, useMemo, useState } from "react";
import { FiMoreHorizontal, FiPlus } from "react-icons/fi";
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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showCreate, setShowCreate] = useState(false);
  const [newProduct, setNewProduct] = useState(productDefaults);

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
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && product.active) ||
          (statusFilter === "inactive" && !product.active) ||
          (statusFilter === "low" && Number(product.current_stock || 0) <= 10);

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "stock") return Number(a.current_stock || 0) - Number(b.current_stock || 0);
        if (sortBy === "selling") return Number(b.selling_price || 0) - Number(a.selling_price || 0);
        return String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? ""));
      });
  }, [products, search, categoryFilter, statusFilter, sortBy]);

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
        {filteredProducts.map((product) => {
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
                <button className="btn btn-icon btn-outline" type="button" aria-label={`Actions for ${product.name}`}>
                  <FiMoreHorizontal />
                </button>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}
