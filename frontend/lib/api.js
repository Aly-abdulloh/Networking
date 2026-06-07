const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "So'rovda xatolik");
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}

const body = (value) => JSON.stringify(value);

export const api = {
  login: (data) => request("/auth/login", { method: "POST", body: body(data) }),
  register: (data) =>
    request("/auth/register", { method: "POST", body: body(data) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  getMe: () => request("/auth/me"),
  changePassword: (data) =>
    request("/auth/change-password", { method: "POST", body: body(data) }),
  getProfile: () => request("/profile"),
  updateProfile: (data) =>
    request("/profile", { method: "PUT", body: body(data) }),

  getDashboard: () => request("/dashboard"),

  getCustomers: (query = "") => request(`/customers${query}`),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) =>
    request("/customers", { method: "POST", body: body(data) }),
  updateCustomer: (id, data) =>
    request(`/customers/${id}`, { method: "PUT", body: body(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),
  createCustomerAccount: (id, data) =>
    request(`/customers/${id}/account`, {
      method: "POST",
      body: body(data),
    }),

  getProducts: (query = "") => request(`/products${query}`),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) =>
    request("/products", { method: "POST", body: body(data) }),
  updateProduct: (id, data) =>
    request(`/products/${id}`, { method: "PUT", body: body(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  getOrders: (query = "") => request(`/orders${query}`),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) =>
    request("/orders", { method: "POST", body: body(data) }),
  updateOrder: (id, data) =>
    request(`/orders/${id}`, { method: "PUT", body: body(data) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: "DELETE" }),

  getEmployees: (query = "") => request(`/employees${query}`),
  getEmployee: (id) => request(`/employees/${id}`),
  createEmployee: (data) =>
    request("/employees", { method: "POST", body: body(data) }),
  updateEmployee: (id, data) =>
    request(`/employees/${id}`, { method: "PUT", body: body(data) }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: "DELETE" }),

  getMyOrders: (query = "") => request(`/account/orders${query}`),
  getMyOrder: (id) => request(`/account/orders/${id}`),
  getPurchases: () => request("/account/purchases"),
};
