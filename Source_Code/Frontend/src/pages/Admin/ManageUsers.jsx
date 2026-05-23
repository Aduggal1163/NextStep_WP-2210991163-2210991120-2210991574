import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../User/MyBookings.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [planners, setPlanners] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'users') {
        const response = await axios.get('/api/v1/admin/users');
        setUsers(response.data.users || []);
      } else if (activeTab === 'vendors') {
        const response = await axios.get('/api/v1/admin/vendors');
        setVendors(response.data.vendors || []);
      } else if (activeTab === 'planners') {
        const response = await axios.get('/api/v1/admin/planners');
        setPlanners(response.data.planners || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateStatus = async (type, id, status) => {
    try {
      if (type === 'vendor') {
        await axios.put(`/api/v1/admin/vendor/${id}/status`, { status });
      } else if (type === 'planner') {
        await axios.put(`/api/v1/admin/planner/${id}/status`, { status });
      }
      fetchData();
      alert('Status updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="my-bookings">
      <h1>Manage Users</h1>
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`btn ${activeTab === 'vendors' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('vendors')}
        >
          Vendors
        </button>
        <button
          className={`btn ${activeTab === 'planners' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('planners')}
        >
          Planners
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bookings-list">
          {users.map((user) => (
            <div key={user._id} className="booking-card">
              <h3>{user.username}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Contact:</strong> {user.contactDetails}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vendors' && (
        <div className="bookings-list">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="booking-card">
              <h3>{vendor.username}</h3>
              <p><strong>Email:</strong> {vendor.email}</p>
              <p><strong>Status:</strong> {vendor.status}</p>
              <select
                value={vendor.status}
                onChange={(e) => updateStatus('vendor', vendor._id, e.target.value)}
                className="form-select"
                style={{ width: 'auto', marginTop: '10px' }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'planners' && (
        <div className="bookings-list">
          {planners.map((planner) => (
            <div key={planner._id} className="booking-card">
              <h3>{planner.plannerName}</h3>
              <p><strong>Email:</strong> {planner.email}</p>
              <p><strong>Status:</strong> {planner.status}</p>
              <select
                value={planner.status}
                onChange={(e) => updateStatus('planner', planner._id, e.target.value)}
                className="form-select"
                style={{ width: 'auto', marginTop: '10px' }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

