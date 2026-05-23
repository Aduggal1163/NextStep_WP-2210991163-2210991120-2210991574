import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/v1/booking/my-bookings');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (bookingId) => {
    try {
      await axios.put(`/api/v1/user/booking/${bookingId}/confirm`);
      fetchBookings();
      alert('Booking confirmed successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm booking');
    }
  };

  const viewProgress = async (bookingId) => {
    try {
      const response = await axios.get(`/api/v1/user/booking/${bookingId}/progress`);
      setSelectedBooking(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="my-bookings">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>My Bookings</h1>
        <button 
          onClick={() => window.location.href = '/user/create-booking'} 
          className="btn btn-primary"
        >
          ➕ Create New Booking
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="card">
          <p>No bookings yet. Start by browsing destinations or create a new booking!</p>
          <button 
            onClick={() => window.location.href = '/user/create-booking'} 
            className="btn btn-primary"
            style={{ marginTop: '15px' }}
          >
            Create Your First Booking
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <h3>
                  {booking.destinationId?.name || 'Destination'} - {booking.packageId?.title || 'Package'}
                </h3>
                <span className={`badge badge-${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Planner:</strong> {booking.plannerId?.plannerName || 'Not assigned'}</p>
              <p><strong>Vendors:</strong> {booking.vendors?.length || 0} assigned</p>
              <div className="booking-actions">
                {booking.status === 'pending' && (
                  <button
                    onClick={() => confirmBooking(booking._id)}
                    className="btn btn-success"
                  >
                    Confirm Booking
                  </button>
                )}
                <button
                  onClick={() => viewProgress(booking._id)}
                  className="btn btn-primary"
                >
                  View Progress
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <div className="progress-modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedBooking(null)}>&times;</span>
            <h2>Booking Progress</h2>
            <div className="progress-timeline">
              {selectedBooking.progress.steps.map((step, idx) => (
                <div key={idx} className={`timeline-step ${step.status}`}>
                  <div className="step-indicator"></div>
                  <div className="step-content">
                    <h4>{step.name}</h4>
                    <p>{step.status === 'completed' ? 'Completed' : 'Pending'}</p>
                    {step.date && <p className="step-date">{new Date(step.date).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

