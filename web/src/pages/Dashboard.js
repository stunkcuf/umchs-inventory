import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    pendingRequests: 0,
    pendingPOs: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [itemsRes, lowStockRes, requestsRes, posRes] = await Promise.all([
        api.getItems(),
        api.getLowStock(),
        api.getRequests({ status: 'pending' }),
        api.getPurchaseOrders({ status: 'pending' })
      ]);

      setStats({
        totalItems: itemsRes.data.length,
        lowStock: lowStockRes.data.length,
        pendingRequests: requestsRes.data.length,
        pendingPOs: posRes.data.length
      });

      setLowStockItems(lowStockRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.username}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Total Items</h3>
          <div className="stat-value">{stats.totalItems}</div>
          <p>Items in catalog</p>
        </div>

        <div className="stat-card orange">
          <h3>Low Stock</h3>
          <div className="stat-value">{stats.lowStock}</div>
          <p>Items need reordering</p>
        </div>

        <div className="stat-card green">
          <h3>Pending Requests</h3>
          <div className="stat-value">{stats.pendingRequests}</div>
          <p>Awaiting approval</p>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <div className="stat-value">{stats.pendingPOs}</div>
          <p>Purchase orders</p>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: '15px' }}>⚠️ Low Stock Alerts</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Location</th>
                <th>Current Stock</th>
                <th>Reorder Point</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.location_name}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>{item.reorder_point} {item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
