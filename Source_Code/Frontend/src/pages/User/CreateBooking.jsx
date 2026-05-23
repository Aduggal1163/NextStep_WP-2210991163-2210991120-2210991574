import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../User/Reviews.css';

const CreateBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    packageId: '',
    destinationId: '',
    date: '',
    customRequests: '',
    guestDetailsId: '',
  });
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDestinations();
    fetchPackages();
  }, []);

  useEffect(() => {
    // Refetch packages when destination changes
    if (formData.destinationId) {
      fetchPackages(formData.destinationId);
    } else {
      fetchPackages();
    }
  }, [formData.destinationId]);

  const fetchDestinations = async () => {
    try {
      const response = await axios.get('/api/v1/destination/all');
      setDestinations(response.data.destinations || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const fetchPackages = async (destinationId = null) => {
    try {
      const url = destinationId 
        ? `/api/v1/package/all?destinationId=${destinationId}`
        : '/api/v1/package/all';
      const response = await axios.get(url);
      setPackages(response.data.packages || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!formData.packageId || !formData.destinationId || !formData.date) {
      setMessage('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/v1/booking/create', formData);
      setMessage('Booking created successfully!');
      setTimeout(() => {
        navigate('/user/bookings');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Packages are already filtered by backend, but also show packages with no destination
  const filteredPackages = packages;

  return (
    <div className="reviews-page">
      <h1>Create New Booking</h1>
      <div className="card">
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Destination *</label>
            <select
              name="destinationId"
              className="form-select"
              value={formData.destinationId}
              onChange={handleChange}
              required
            >
              <option value="">Select a destination...</option>
              {destinations.map((dest) => (
                <option key={dest._id} value={dest._id}>
                  {dest.name} - {dest.location} ({dest.style})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Package *</label>
            <select
              name="packageId"
              className="form-select"
              value={formData.packageId}
              onChange={handleChange}
              required
              disabled={!formData.destinationId}
            >
              <option value="">
                {formData.destinationId ? 'Select a package...' : 'Select destination first...'}
              </option>
            {filteredPackages.map((pkg) => (
              <option key={pkg._id} value={pkg._id}>
                {pkg.title} - ₹{pkg.basePrice}
                {pkg.destinationId ? ` (${pkg.destinationId.name || 'Specific'})` : ' (Available for all)'}
              </option>
            ))}
            </select>
            {formData.destinationId && filteredPackages.length === 0 && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '5px' }}>
                <small style={{ color: '#856404' }}>
                  No packages available for this destination. A planner can create packages for this destination.
                </small>
              </div>
            )}
            {filteredPackages.length > 0 && (
              <small style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>
                {filteredPackages.length} package(s) available
              </small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Wedding Date *</label>
            <input
              type="date"
              name="date"
              className="form-input"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Requests</label>
            <textarea
              name="customRequests"
              className="form-textarea"
              value={formData.customRequests}
              onChange={handleChange}
              placeholder="Any special requests or customization needs..."
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBooking;

