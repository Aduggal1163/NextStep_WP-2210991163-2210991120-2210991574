import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Planner/CreatePackage.css';

const MyServices = () => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    type: 'photography',
    name: '',
    description: '',
    price: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/v1/vendor/services');
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('/api/v1/vendor/service', formData);
      setMessage('Service added successfully!');
      setFormData({ type: 'photography', name: '', description: '', price: '' });
      fetchServices();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add service');
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    try {
      await axios.delete(`/api/v1/vendor/service/${serviceId}`);
      setMessage('Service deleted successfully!');
      fetchServices();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete service');
    }
  };

  return (
    <div className="reviews-page">
      <h1>Manage Services</h1>
      <div className="card">
        <h2>Add New Service</h2>
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Service Type</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="photography">Photography</option>
              <option value="decor">Decoration</option>
              <option value="makeup">Makeup</option>
              <option value="food">Food</option>
              <option value="music">Music</option>
              <option value="transport">Transport</option>
              <option value="lighting">Lighting</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Service Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-input"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add Service
          </button>
        </form>
      </div>

      <div className="card">
        <h2>My Services</h2>
        {services.length === 0 ? (
          <p>No services added yet.</p>
        ) : (
          <div className="services-list">
            {services.map((service) => (
              <div key={service._id} className="service-item" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginTop: 0 }}>{service.name}</h3>
                  <p><strong>Type:</strong> {service.type}</p>
                  <p><strong>Price:</strong> ₹{service.price}</p>
                  <p><strong>Description:</strong> {service.description}</p>
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      color: service.availability !== false ? '#28a745' : '#dc3545',
                      marginLeft: '8px'
                    }}>
                      {service.availability !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="btn btn-danger"
                  style={{ marginLeft: '15px' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServices;

