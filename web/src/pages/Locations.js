import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Locations({ user }) {
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: ''
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await api.getLocations();
      setLocations(response.data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createLocation(formData);
      setShowModal(false);
      loadLocations();
      setFormData({ name: '', address: '', type: '' });
      alert('Location created successfully!');
    } catch (error) {
      alert('Error creating location: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Locations</h1>
            <p>Manage warehouse and office locations</p>
          </div>
          {user.role === 'admin' && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add Location
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {locations.length === 0 ? (
          <p>No locations found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Type</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td><strong>{location.name}</strong></td>
                  <td>{location.address || '-'}</td>
                  <td>{location.type || '-'}</td>
                  <td>{new Date(location.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Location</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Location Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Warehouse, Office Storage"
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                  placeholder="Full address"
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="">Select type</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="office">Office</option>
                  <option value="storage">Storage</option>
                  <option value="retail">Retail</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Locations;
