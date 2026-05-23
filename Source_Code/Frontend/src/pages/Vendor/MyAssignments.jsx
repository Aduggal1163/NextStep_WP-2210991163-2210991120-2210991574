import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../User/MyBookings.css';

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/api/v1/vendor/my-assignments');
      setAssignments(response.data.bookings || []);
      if (response.data.bookings && response.data.bookings.length === 0) {
        console.log('No assignments found for this vendor');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="my-bookings">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{
    background: "linear-gradient(to right, #e11d48, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
  }}> My Assignments</h1>
        <button 
          onClick={handleRefresh} 
          className="btn btn-primary"
          disabled={refreshing}
          style={{ minWidth: '120px' }}
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>
      
      {assignments.length === 0 ? (
        <div className="card">
          <p>No assignments yet. You will see bookings here once a planner assigns you to a wedding.</p>
          <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
            Make sure you are logged in as a vendor and that a planner has assigned you to a booking.
          </p>
          <button onClick={handleRefresh} className="btn btn-secondary" style={{ marginTop: '15px' }}>
            Check for New Assignments
          </button>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: '20px', background: '#d4edda', color: '#155724' }}>
            <p><strong>You have {assignments.length} assignment(s)</strong></p>
          </div>
          <div className="bookings-list">
            {assignments.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.destinationId?.name || 'Destination'}</h3>
                  <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                </div>
                <p><strong>User:</strong> {booking.userId?.username || booking.userId?.email || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Planner:</strong> {booking.plannerId?.plannerName || booking.plannerId?.email || 'Not assigned'}</p>
                <p><strong>Package:</strong> {booking.packageId?.title || 'N/A'}</p>
                {booking.customRequests && (
                  <p><strong>Special Requests:</strong> {booking.customRequests}</p>
                )}
                {booking.customizationRequests && (
                  <p><strong>Customization:</strong> {booking.customizationRequests}</p>
                )}
                <div className="booking-actions" style={{ marginTop: '15px' }}>
                  <button
                    onClick={() => window.location.href = `/vendor/assignment/${booking._id}`}
                    className="btn btn-primary"
                  >
                    View Details & Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyAssignments;

