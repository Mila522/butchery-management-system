import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import ReceiveStock from "./pages/ReceiveStock";
import Damages from "./pages/Damages";
import InventoryAdjustment from "./pages/InventoryAdjustment";
import BusinessDay from "./pages/BusinessDay";
import DailyStock from "./pages/DailyStock";
import Reports from "./pages/Reports";
import BusinessOverview from "./pages/BusinessOverview";


function PrivateRoute({ children }) {
  const token = localStorage.getItem("access_token");

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />  
        <Route path="receive-stock" element={<ReceiveStock />} />
        <Route path="damages" element={<Damages />} />
        <Route path="inventory-adjustment" element={<InventoryAdjustment />} />
        <Route path="business-day" element={<BusinessDay />} />
        <Route path="daily-stock" element={<DailyStock />} />
        <Route path="reports" element={<Reports />} />
        <Route path="business-overview" element={<BusinessOverview />} />
      </Route>
    </Routes>
  );
}
