import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Inventory({ user }) {
  const [inventory, setInventory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      loadInventory();
    }
  }, [selectedLocation]);

  const loadLocations = async () => {
    try {
      const response = await api.getLocations();
      setLocations(response.data);
      if (response.data.length > 0 && !selectedLocation) {
        setSelectedLocation(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await api.getInventoryByLocation(selectedLocation);
      setInventory(response.data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const openAdjustModal = (item) => {
    setAdjustItem(item);
    setAdjustQty('');
    setAdjustNotes('');
    setShowAdjustModal(true);
  };

  const handleAdjust = async () => {
    if (!adjustQty || adjustQty === '0') {
      alert('Please enter a quantity');
      return;
    }

    try {
      await api.adjustInventory({
        item_id: adjustItem.item_id,
        location_id: selectedLocation,
        quantity_change: parseInt(adjustQty),
        transaction_type: parseInt(adjustQty) > 0 ? 'add' : 'remove',
        notes: adjustNotes
      });

      setShowAdjustModal(false);
      loadInventory();
      alert('Inventory updated successfully!');
    } catch (error) {
      alert('Error updating inventory: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { text: 'Out of Stock', class: 'status-rejected' };
    if (item.quantity <= item.reorder_point) return { text: 'Low Stock', class: 'status-pending' };
    if (item.max_stock && item.quantity > item.max_stock) return { text: 'Overstock', class: 'status-pending' };
    return { text: 'Good', class: 'status-fulfilled' };
  };

  return (
    <div>
      <div className="page-header">
        <h1>Inventory / Stock</h1>
        <p>View and manage stock levels</p>
      </div>

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px', fontWeight: '500' }}>Location:</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ width: '300px' }}
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {inventory.length === 0 ? (
          <p>No inventory items at this location.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Overstock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.sku || '-'}</td>
                    <td>{item.category || '-'}</td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>{item.overstock_quantity} {item.unit}</td>
                    <td>
                      <span className={`status-badge ${status.class}`}>{status.text}</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn-secondary"
                          onClick={() => openAdjustModal(item)}
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showAdjustModal && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Adjust Stock</h2>
            <p><strong>{adjustItem.name}</strong></p>
            <p>Current Stock: {adjustItem.quantity} {adjustItem.unit}</p>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Quantity Change (+/-)</label>
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="e.g., +10 or -5"
              />
              <small>Use positive number to add, negative to remove</small>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                placeholder="Reason for adjustment"
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowAdjustModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAdjust}>Update Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
