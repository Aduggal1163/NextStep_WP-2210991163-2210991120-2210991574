import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Planner/CreatePackage.css';

const ManageDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    style: 'beach',
    minPrice: '',
    maxPrice: '',
    minCapacity: '',
    maxCapacity: '',
    description: '',
  });
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
      await axios.post('/api/v1/destination/create', {
        name: formData.name,
        location: formData.location,
        style: formData.style,
        priceRange: {
          min: parseInt(formData.minPrice),
          max: parseInt(formData.maxPrice),
        },
        guestCapacity: {
          min: parseInt(formData.minCapacity),
          max: parseInt(formData.maxCapacity),
        },
        description: formData.description,
      });
      setMessage('Destination created successfully!');
      setFormData({
        name: '',
        location: '',
        style: 'beach',
        minPrice: '',
        maxPrice: '',
        minCapacity: '',
        maxCapacity: '',
        description: '',
      });
      fetchDestinations();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create destination');
    }
  };

  return (
    <div className="reviews-page">
      <h1 style={{
    background: "linear-gradient(to right, #e11d48, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
  }}>Manage Destinations</h1>
      <div className="card">
        <h2>Create Destination</h2>
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Style</label>
              <select
                className="form-select"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              >
                <option value="beach">Beach</option>
                <option value="palace">Palace</option>
                <option value="hill station">Hill Station</option>
                <option value="traditional">Traditional</option>
                <option value="modern">Modern</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Min Price</label>
              <input
                type="number"
                className="form-input"
                value={formData.minPrice}
                onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Price</label>
              <input
                type="number"
                className="form-input"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Capacity</label>
              <input
                type="number"
                className="form-input"
                value={formData.minCapacity}
                onChange={(e) => setFormData({ ...formData, minCapacity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Capacity</label>
              <input
                type="number"
                className="form-input"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Create Destination
          </button>
        </form>
      </div>

      <div className="card">
        <h2>All Destinations</h2>
        <div className="destinations-list">
          {destinations.map((dest) => (
            <div key={dest._id} className="destination-item">
              <h3>{dest.name}</h3>
              <p><strong>Location:</strong> {dest.location}</p>
              <p><strong>Style:</strong> {dest.style}</p>
              <p><strong>Price Range:</strong> ₹{dest.priceRange?.min} - ₹{dest.priceRange?.max}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageDestinations;

