import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get API URL from environment variable or use localhost as fallback
// For cloud deployment, set EXPO_PUBLIC_API_URL environment variable
const API_URL = Constants.expoConfig?.extra?.apiUrl ||
                process.env.EXPO_PUBLIC_API_URL ||
                'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
  }
  return response;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

// Items
export const getItems = () => api.get('/items');
export const createItem = (data) => api.post('/items', data);

// Inventory
export const getInventory = () => api.get('/inventory');
export const updateInventory = (id, data) => api.put(`/inventory/${id}`, data);

// Locations
export const getLocations = () => api.get('/locations');

// Requests
export const getRequests = () => api.get('/requests');
export const createRequest = (data) => api.post('/requests', data);

// Maintenance Tickets
export const maintenanceLogin = (username, password) =>
  api.post('/maintenance/login', { username, password });

export const getMaintenanceAuthStatus = () =>
  api.get('/maintenance/auth/status');

export const getMaintenanceTickets = () =>
  api.get('/maintenance/tickets');

export const getMaintenanceTicketDetails = (ticketId) =>
  api.get(`/maintenance/tickets/${ticketId}`);

export const respondToMaintenanceTicket = (ticketId, message) =>
  api.post(`/maintenance/tickets/${ticketId}/respond`, { message });

export default {
  login,
  logout,
  getItems,
  createItem,
  getInventory,
  updateInventory,
  getLocations,
  getRequests,
  createRequest,
  maintenanceLogin,
  getMaintenanceAuthStatus,
  getMaintenanceTickets,
  getMaintenanceTicketDetails,
  respondToMaintenanceTicket,
};
