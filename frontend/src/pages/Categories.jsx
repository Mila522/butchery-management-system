import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import {
  DataTable,
  EmptyState,
  LoadingState,
  PageHeader,
  SearchBar,
  StatCard,
  Toolbar,
} from "../components/ui";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const [categoryData, productData] = await Promise.all([
        api.getCategories(),
        api.getProducts().catch(() => []),
      ]);
      setCategories(categoryData);
      setProducts(productData);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const categoryStats = useMemo(() => {
    return categories.map((category) => {
      const categoryProducts = products.filter((product) => product.category_id === category.id);
      const stock = categoryProducts.reduce(
        (total, product) => total + Number(product.current_stock || 0),
        0
      );

      return {
        ...category,
        productCount: categoryProducts.length,
        stock,
        activeCount: categoryProducts.filter((product) => product.active).length,
      };
    });
  }, [categories, products]);

  const filteredCategories = categoryStats.filter((category) =>
    category.name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Loading categories" />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Inventory"
        title="Categories"
        description="Review product groupings and stock totals by category."
      />

      <div className="grid grid-3 mb-20">
        <StatCard label="Categories" value={categories.length} />
        <StatCard label="Mapped Products" value={products.length} />
        <StatCard
          label="Total Stock"
          value={products.reduce((total, product) => total + Number(product.current_stock || 0), 0)}
        />
      </div>

      <Toolbar>
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories"
        />
      </Toolbar>

      <DataTable
        columns={["Category", "Products", "Active Products", "Current Stock"]}
        empty={
          <tr>
            <td colSpan="4">
              <EmptyState title="No categories found" />
            </td>
          </tr>
        }
        minWidth={680}
      >
        {filteredCategories.map((category) => (
          <tr key={category.id}>
            <td className="cell-strong">{category.name}</td>
            <td>{category.productCount}</td>
            <td>{category.activeCount}</td>
            <td>
              <span className="badge">{category.stock}</span>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
