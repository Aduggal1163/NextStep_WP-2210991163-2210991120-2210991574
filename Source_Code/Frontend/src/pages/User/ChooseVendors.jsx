import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChooseVendors.css';

const ChooseVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchVendors();
    fetchBookings();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/v1/user/allVendors');
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/v1/booking/my-bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const toggleVendorSelection = (vendorId) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const saveVendorPreferences = async () => {
    if (!selectedBooking) {
      setMessage('Please select a booking first');
      return;
    }
    if (selectedVendors.length === 0) {
      setMessage('Please select at least one vendor');
      return;
    }
    try {
      // Save as suggested vendors (planner will see these preferences)
      const response = await axios.post('/api/v1/user/suggest-vendors', {
        bookingId: selectedBooking,
        vendorIds: selectedVendors,
        category: 'user_preference',
      });
      setMessage(response.data.message || 'Vendor preferences saved! Your planner will be notified.');
      setSelectedVendors([]);
      setSelectedBooking('');
      fetchBookings();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save preferences');
      console.error('Error saving vendor preferences:', error);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="choose-vendors">
      <h1>Choose Vendors</h1>
      <p className="subtitle">Select your preferred vendors for your wedding booking</p>

      {message && (
        <div className={`alert ${message.includes('success') || message.includes('saved') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Select Booking</label>
            <select
              className="form-select"
              value={selectedBooking}
              onChange={(e) => setSelectedBooking(e.target.value)}
            >
              <option value="">Choose a booking to assign vendors...</option>
              {bookings.map((booking) => (
                <option key={booking._id} value={booking._id}>
                  {booking.destinationId?.name || 'Destination'} - {new Date(booking.date).toLocaleDateString()} ({booking.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {vendors.length === 0 ? (
        <div className="card">
          <p>No vendors available at the moment.</p>
        </div>
      ) : (
        <div className="vendors-grid">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="vendor-card">
              <h3>{vendor.username}</h3>
              <p><strong>Email:</strong> {vendor.email}</p>
              <p><strong>Status:</strong> {vendor.status || 'approved'}</p>
              <div className="services-list">
                <strong>Services:</strong>
                {vendor.servicesOffered && vendor.servicesOffered.length > 0 ? (
                  <ul>
                    {vendor.servicesOffered.map((service, idx) => (
                      <li key={idx}>{service.type} - ₹{service.price}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No services listed</p>
                )}
              </div>
              <button
                onClick={() => toggleVendorSelection(vendor._id)}
                className={`btn ${selectedVendors.includes(vendor._id) ? 'btn-success' : 'btn-primary'}`}
                disabled={!selectedBooking}
              >
                {selectedVendors.includes(vendor._id) ? 'Selected' : 'Select Vendor'}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedVendors.length > 0 && selectedBooking && (
        <div className="selected-vendors">
          <h2>Selected Vendors ({selectedVendors.length})</h2>
          <p>Click save to notify your planner of your vendor preferences.</p>
          <button onClick={saveVendorPreferences} className="btn btn-success" style={{ marginTop: '10px' }}>
            Save Vendor Preferences
          </button>
        </div>
      )}

      {selectedVendors.length > 0 && !selectedBooking && (
        <div className="selected-vendors">
          <h2>Selected Vendors ({selectedVendors.length})</h2>
          <p>Please select a booking above to save your vendor preferences.</p>
        </div>
      )}
    </div>
  );
};

export default ChooseVendors;

