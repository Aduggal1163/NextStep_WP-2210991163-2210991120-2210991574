import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../User/Reviews.css';

const CreatePackage = () => {
  const [formData, setFormData] = useState({
    title: '',
    basePrice: '',
    description: '',
    customizable: true,
    destinationId: '',
  });
  const [destinations, setDestinations] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await axios.get('/api/v1/destination/all');
      setDestinations(response.data.destinations || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/planner/create-package', formData);
      setMessage('Package created successfully!');
      setFormData({ title: '', basePrice: '', description: '', customizable: true, destinationId: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create package');
    }
  };

  return (
    <div className="reviews-page">
      <h1>Create Package</h1>
      <div className="card">
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Package Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Base Price</label>
            <input
              type="number"
              className="form-input"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Destination (Optional)</label>
            <select
              className="form-select"
              value={formData.destinationId}
              onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
            >
              <option value="">Available for all destinations</option>
              {destinations.map((dest) => (
                <option key={dest._id} value={dest._id}>
                  {dest.name} - {dest.location}
                </option>
              ))}
            </select>
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              Leave empty to make this package available for all destinations
            </small>
          </div>
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={formData.customizable}
                onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                style={{ marginRight: '8px' }}
              />
              Customizable
            </label>
          </div>
          <button type="submit" className="btn btn-primary">
            Create Package
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePackage;

