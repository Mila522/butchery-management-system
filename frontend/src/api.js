const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

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
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      // Keep the HTTP status message when the API does not return JSON.
    }
    throw new Error(Array.isArray(message) ? message.map((item) => item.msg).join(", ") : message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getProducts: () => request("/products?limit=200"),
  getDeliveries: () => request("/deliveries?limit=100"),
  createDelivery: (payload) => request("/deliveries", { method: "POST", body: JSON.stringify(payload) }),
  getDamages: () => request("/damages?limit=100"),
  createDamage: (payload) => request("/damages", { method: "POST", body: JSON.stringify(payload) }),
  getAdjustments: () => request("/inventory-adjustments?limit=100"),
  createAdjustment: (payload) =>
    request("/inventory-adjustments", { method: "POST", body: JSON.stringify(payload) }),
};
