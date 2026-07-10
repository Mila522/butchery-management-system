const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {}

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // Products
  getProducts: () => request("/products/?limit=200"),
  createProduct: (payload) =>
    request("/products/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Categories
  getCategories: () => request("/categories/?limit=200"),

  // Deliveries
  getDeliveries: () => request("/deliveries/?limit=200"),
  getDashboard: () =>
  request("/dashboard"),


  createDelivery: (payload) =>
    request("/deliveries", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Inventory
  getAdjustments: () =>
    request("/inventory/adjustments?limit=200"),

  createAdjustment: (payload) =>
    request("/inventory/adjustments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getDamages: () =>
    request("/inventory/damages?limit=200"),

  createDamage: (payload) =>
    request("/inventory/damages", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createDailySnapshot: () =>
    request("/inventory/daily-snapshot", {
      method: "POST",
    }),

    getCategoryStock: () =>
  request("/dashboard/category-stock"),

  getInventoryDistribution: () =>
    request("/dashboard/inventory-distribution"),

  getStockTrend: () =>
    request("/dashboard/stock-trend"),

  getLowStock: () =>
    request("/dashboard/low-stock"),

  // Business day
  getTodayBusinessDay: () => request("/business-days/today"),
  openTodayBusinessDay: () =>
    request("/business-days/today/open", {
      method: "POST",
    }),
  closeTodayBusinessDay: (payload = {}) =>
    request("/business-days/today/close", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  reopenTodayBusinessDay: (payload = {}) =>
    request("/business-days/today/reopen", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Daily stock
  getTodayDailyStock: () => request("/daily-stock/today"),
  closeDailyStock: (payload) =>
    request("/daily-stock/close", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Reports
  getDailyReport: (reportDate) =>
    request(`/analytics/reports/daily?report_date=${reportDate}`),
  getWeeklyReport: (reportDate) =>
    request(`/analytics/reports/weekly?report_date=${reportDate}`),
  getMonthlyReport: (reportDate) =>
    request(`/analytics/reports/monthly?report_date=${reportDate}`),
  getProfitReport: (startDate, endDate) =>
    request(`/analytics/reports/profit?start_date=${startDate}&end_date=${endDate}`),
  getDamageReport: (startDate, endDate) =>
    request(`/analytics/reports/damage?start_date=${startDate}&end_date=${endDate}`),
  getStockValuation: (reportDate) =>
    request(`/analytics/reports/stock-valuation?report_date=${reportDate}`),
  getBusinessOverview: (startDate, endDate) =>
    request(`/analytics/reports/business-overview?start_date=${startDate}&end_date=${endDate}`),
};
