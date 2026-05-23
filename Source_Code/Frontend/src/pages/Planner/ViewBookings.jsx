import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../User/MyBookings.css';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [unassignedBookings, setUnassignedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [showAll]);

  const fetchBookings = async () => {
    try {
      const url = showAll 
        ? '/api/v1/planner/my-bookings?showAll=true'
        : '/api/v1/planner/my-bookings';
      const response = await axios.get(url);
      const allBookings = response.data.bookings || [];
      
      // Separate assigned and unassigned
      const assigned = allBookings.filter(b => b.plannerId);
      const unassigned = allBookings.filter(b => !b.plannerId);
      
      setBookings(allBookings);
      setAssignedBookings(assigned);
      setUnassignedBookings(unassigned);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimBooking = async (bookingId) => {
    try {
      await axios.put(`/api/v1/booking/${bookingId}/assign-planner`);
      alert('Booking claimed successfully!');
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to claim booking');
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/v1/booking/${bookingId}/status`, { status });
      fetchBookings();
      alert('Status updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="my-bookings">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1  style={{
    background: "linear-gradient(to right, #e11d48, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
  }}>Booking Requests</h1>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <span>Show unassigned bookings</span>
        </label>
      </div>

      {unassignedBookings.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', background: '#fff3cd', border: '2px solid #ffc107' }}>
          <h2 style={{ marginTop: 0 }}>📋 Unassigned Bookings ({unassignedBookings.length})</h2>
          <p>These bookings need a planner. Click "Claim Booking" to assign yourself.</p>
        </div>
      )}

      {assignedBookings.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', background: '#d4edda', border: '2px solid #28a745' }}>
          <h2 style={{ marginTop: 0 }}>✅ My Assigned Bookings ({assignedBookings.length})</h2>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="card">
          <p>No bookings available.</p>
          {!showAll && (
            <p style={{ marginTop: '10px' }}>
              <button onClick={() => setShowAll(true)} className="btn btn-primary">
                Show Unassigned Bookings
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card" style={{ 
              borderLeft: booking.plannerId ? '4px solid #28a745' : '4px solid #ffc107' 
            }}>
              <div className="booking-header">
                <h3>{booking.destinationId?.name} - {booking.packageId?.title}</h3>
                <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                {!booking.plannerId && (
                  <span className="badge" style={{ background: '#ffc107', color: '#856404', marginLeft: '10px' }}>
                    Unassigned
                  </span>
                )}
              </div>
              <p><strong>User:</strong> {booking.userId?.username || booking.userId?.email}</p>
              <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Custom Requests:</strong> {booking.customRequests || 'None'}</p>
              {booking.suggestedVendors && booking.suggestedVendors.length > 0 && (
                <p style={{ color: '#667eea', fontWeight: 'bold' }}>
                  👤 User has suggested {booking.suggestedVendors.length} vendor(s)
                </p>
              )}
              <p><strong>Assigned Vendors:</strong> {booking.vendors?.length || 0}</p>
              <div className="booking-actions">
                {!booking.plannerId ? (
                  <button
                    onClick={() => claimBooking(booking._id)}
                    className="btn btn-success"
                  >
                    ✅ Claim This Booking
                  </button>
                ) : (
                  <>
                    <select
                      value={booking.status}
                      onChange={(e) => updateStatus(booking._id, e.target.value)}
                      className="form-select"
                      style={{ width: 'auto', marginRight: '10px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => window.location.href = `/planner/vendors?booking=${booking._id}`}
                      className="btn btn-primary"
                    >
                      Assign Vendors
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewBookings;

