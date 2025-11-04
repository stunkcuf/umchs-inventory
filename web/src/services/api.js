import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = {
  // Auth
  login: (username, password) =>
    axios.post(`${API_URL}/auth/login`, { username, password }),

  register: (userData) =>
    axios.post(`${API_URL}/auth/register`, userData),

  // Items
  getItems: (params) =>
    axios.get(`${API_URL}/items`, { headers: getAuthHeader(), params }),

  createItem: (itemData) =>
    axios.post(`${API_URL}/items`, itemData, { headers: getAuthHeader() }),

  updateItem: (id, itemData) =>
    axios.put(`${API_URL}/items/${id}`, itemData, { headers: getAuthHeader() }),

  deleteItem: (id) =>
    axios.delete(`${API_URL}/items/${id}`, { headers: getAuthHeader() }),

  // Inventory
  getInventory: (params) =>
    axios.get(`${API_URL}/inventory`, { headers: getAuthHeader(), params }),

  getInventoryByLocation: (locationId) =>
    axios.get(`${API_URL}/inventory/location/${locationId}`, { headers: getAuthHeader() }),

  updateInventory: (data) =>
    axios.post(`${API_URL}/inventory/update`, data, { headers: getAuthHeader() }),

  adjustInventory: (data) =>
    axios.post(`${API_URL}/inventory/adjust`, data, { headers: getAuthHeader() }),

  getLowStock: (params) =>
    axios.get(`${API_URL}/inventory/low-stock`, { headers: getAuthHeader(), params }),

  getOverstock: (params) =>
    axios.get(`${API_URL}/inventory/overstock`, { headers: getAuthHeader(), params }),

  // Locations
  getLocations: () =>
    axios.get(`${API_URL}/locations`, { headers: getAuthHeader() }),

  createLocation: (locationData) =>
    axios.post(`${API_URL}/locations`, locationData, { headers: getAuthHeader() }),

  // Budgets
  getBudgets: (params) =>
    axios.get(`${API_URL}/budgets`, { headers: getAuthHeader(), params }),

  createBudget: (budgetData) =>
    axios.post(`${API_URL}/budgets`, budgetData, { headers: getAuthHeader() }),

  // Purchase Orders
  getPurchaseOrders: (params) =>
    axios.get(`${API_URL}/purchase-orders`, { headers: getAuthHeader(), params }),

  getPurchaseOrder: (id) =>
    axios.get(`${API_URL}/purchase-orders/${id}`, { headers: getAuthHeader() }),

  createPurchaseOrder: (poData) =>
    axios.post(`${API_URL}/purchase-orders`, poData, { headers: getAuthHeader() }),

  updatePOStatus: (id, data) =>
    axios.patch(`${API_URL}/purchase-orders/${id}/status`, data, { headers: getAuthHeader() }),

  // Requests
  getRequests: (params) =>
    axios.get(`${API_URL}/requests`, { headers: getAuthHeader(), params }),

  createRequest: (requestData) =>
    axios.post(`${API_URL}/requests`, requestData, { headers: getAuthHeader() }),

  updateRequestStatus: (id, data) =>
    axios.patch(`${API_URL}/requests/${id}/status`, data, { headers: getAuthHeader() }),

  fulfillRequest: (id, data) =>
    axios.post(`${API_URL}/requests/${id}/fulfill`, data, { headers: getAuthHeader() }),
};

export default api;
