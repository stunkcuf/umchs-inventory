import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Items({ user }) {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    unit: 'unit',
    min_stock: 0,
    max_stock: '',
    reorder_point: 10,
    unit_price: 0
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await api.getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createItem(formData);
      setShowModal(false);
      loadItems();
      resetForm();
      alert('Item created successfully!');
    } catch (error) {
      alert('Error creating item: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      category: '',
      unit: 'unit',
      min_stock: 0,
      max_stock: '',
      reorder_point: 10,
      unit_price: 0
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Items</h1>
            <p>Manage your inventory items</p>
          </div>
          {(user.role === 'admin' || user.role === 'manager') && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add Item
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {items.length === 0 ? (
          <p>No items found. Add your first item to get started!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Reorder Point</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    {item.description && <br />}
                    {item.description && <small style={{ color: '#7f8c8d' }}>{item.description}</small>}
                  </td>
                  <td>{item.sku || '-'}</td>
                  <td>{item.category || '-'}</td>
                  <td>{item.unit}</td>
                  <td>{item.reorder_point}</td>
                  <td>${item.unit_price?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleChange}>
                    <option value="unit">Unit</option>
                    <option value="box">Box</option>
                    <option value="case">Case</option>
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilogram</option>
                    <option value="lbs">Pounds</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Reorder Point</label>
                  <input
                    type="number"
                    name="reorder_point"
                    value={formData.reorder_point}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="unit_price"
                    value={formData.unit_price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Items;
