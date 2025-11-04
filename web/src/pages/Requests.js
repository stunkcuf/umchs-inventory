import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Requests({ user }) {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    item_id: '',
    requesting_location_id: '',
    quantity: 1,
    priority: 'normal',
    reason: ''
  });

  useEffect(() => {
    loadRequests();
    loadItems();
    loadLocations();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await api.getRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createRequest(formData);
      setShowModal(false);
      loadRequests();
      alert('Request submitted successfully!');
    } catch (error) {
      alert('Error creating request: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await api.updateRequestStatus(requestId, { status: 'approved' });
      loadRequests();
      alert('Request approved!');
    } catch (error) {
      alert('Error approving request: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.updateRequestStatus(requestId, { status: 'rejected' });
      loadRequests();
      alert('Request rejected');
    } catch (error) {
      alert('Error rejecting request: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleFulfill = async (requestId) => {
    const sourceLocation = prompt('Enter source location ID to transfer from:');
    if (sourceLocation) {
      try {
        await api.fulfillRequest(requestId, { source_location_id: parseInt(sourceLocation) });
        loadRequests();
        alert('Request fulfilled!');
      } catch (error) {
        alert('Error fulfilling request: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Item Requests</h1>
            <p>Request items from other locations</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + New Request
          </button>
        </div>
      </div>

      <div className="card">
        {requests.length === 0 ? (
          <p>No requests yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Location</th>
                <th>Quantity</th>
                <th>Priority</th>
                <th>Requested By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.item_name}</strong></td>
                  <td>{request.location_name}</td>
                  <td>{request.quantity} {request.unit}</td>
                  <td>
                    <span className={`status-badge ${request.priority === 'urgent' ? 'status-rejected' : 'status-pending'}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td>{request.requested_by_name}</td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${request.status}`}>{request.status}</span>
                  </td>
                  <td>
                    {request.status === 'pending' && (user.role === 'admin' || user.role === 'manager') && (
                      <div className="actions">
                        <button className="btn-secondary" onClick={() => handleApprove(request.id)}>
                          Approve
                        </button>
                        <button className="btn-danger" onClick={() => handleReject(request.id)}>
                          Reject
                        </button>
                      </div>
                    )}
                    {request.status === 'approved' && (user.role === 'admin' || user.role === 'manager') && (
                      <button className="btn-primary" onClick={() => handleFulfill(request.id)}>
                        Fulfill
                      </button>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Item Request</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Item *</label>
                  <select
                    value={formData.item_id}
                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                    required
                  >
                    <option value="">Select item</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Requesting Location *</label>
                  <select
                    value={formData.requesting_location_id}
                    onChange={(e) => setFormData({ ...formData, requesting_location_id: e.target.value })}
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Reason / Notes</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="3"
                  placeholder="Why do you need this item?"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Requests;
