import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Purchases({ user }) {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    po_number: '',
    location_id: '',
    budget_id: '',
    vendor: '',
    notes: '',
    items: [{ item_id: '', quantity: 1, unit_price: 0 }]
  });

  useEffect(() => {
    loadOrders();
    loadItems();
    loadLocations();
    loadBudgets();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.getPurchaseOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadItems = async () => {
    try {
      const response = await api.getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await api.getLocations();
      setLocations(response.data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadBudgets = async () => {
    try {
      const response = await api.getBudgets();
      setBudgets(response.data);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createPurchaseOrder(formData);
      setShowModal(false);
      loadOrders();
      alert('Purchase order created successfully!');
    } catch (error) {
      alert('Error creating purchase order: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.updatePOStatus(orderId, {
        status: newStatus,
        received_date: newStatus === 'received' ? new Date().toISOString().split('T')[0] : null
      });
      loadOrders();
      alert('Order status updated!');
    } catch (error) {
      alert('Error updating status: ' + (error.response?.data?.error || error.message));
    }
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: '', quantity: 1, unit_price: 0 }]
    });
  };

  const updateItemRow = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const getTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Purchase Orders</h1>
            <p>Manage purchasing and budgets</p>
          </div>
          {(user.role === 'admin' || user.role === 'manager') && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + New Purchase Order
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {orders.length === 0 ? (
          <p>No purchase orders yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Location</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.po_number}</strong></td>
                  <td>{order.location_name}</td>
                  <td>{order.vendor || '-'}</td>
                  <td>${order.total_amount?.toFixed(2)}</td>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </td>
                  <td>
                    {order.status === 'pending' && (user.role === 'admin' || user.role === 'manager') && (
                      <div className="actions">
                        <button
                          className="btn-secondary"
                          onClick={() => handleStatusUpdate(order.id, 'received')}
                        >
                          Mark Received
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <h2>Create Purchase Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>PO Number *</label>
                  <input
                    type="text"
                    value={formData.po_number}
                    onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <select
                    value={formData.location_id}
                    onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Budget</label>
                  <select
                    value={formData.budget_id}
                    onChange={(e) => setFormData({ ...formData, budget_id: e.target.value })}
                  >
                    <option value="">No budget</option>
                    {budgets.map(budget => (
                      <option key={budget.id} value={budget.id}>
                        {budget.department} - {budget.fiscal_year} (${budget.total_amount - budget.spent_amount} available)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Vendor</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Items</h3>
              {formData.items.map((item, index) => (
                <div key={index} className="form-grid" style={{ marginBottom: '10px' }}>
                  <div className="form-group">
                    <label>Item *</label>
                    <select
                      value={item.item_id}
                      onChange={(e) => updateItemRow(index, 'item_id', e.target.value)}
                      required
                    >
                      <option value="">Select item</option>
                      {items.map(it => (
                        <option key={it.id} value={it.id}>{it.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItemRow(index, 'quantity', parseInt(e.target.value))}
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItemRow(index, 'unit_price', parseFloat(e.target.value))}
                      required
                      min="0"
                    />
                  </div>
                </div>
              ))}

              <button type="button" onClick={addItemRow} className="btn-secondary" style={{ marginBottom: '15px' }}>
                + Add Item
              </button>

              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '5px', marginBottom: '15px' }}>
                <strong>Total Amount: ${getTotalAmount().toFixed(2)}</strong>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Purchase Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Purchases;
