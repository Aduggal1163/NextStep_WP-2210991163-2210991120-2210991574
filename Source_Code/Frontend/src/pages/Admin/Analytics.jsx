import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../User/MyBookings.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/v1/admin/analytics');
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!analytics) {
    return <div className="card">No analytics data available</div>;
  }

  return (
    <div className="my-bookings">
      <h1 style={{color:'black'}}>Analytics Dashboard</h1>
      <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3>Bookings</h3>
          <p><strong>Total:</strong> {analytics.bookings.total}</p>
          <p><strong>Confirmed:</strong> {analytics.bookings.confirmed}</p>
          <p><strong>Pending:</strong> {analytics.bookings.pending}</p>
          <p><strong>Completed:</strong> {analytics.bookings.completed}</p>
          <p><strong>Conversion Rate:</strong> {analytics.bookings.conversionRate}</p>
        </div>
        <div className="card">
          <h3>Top Destinations</h3>
          {analytics.topDestinations.map((item, idx) => (
            <p key={idx}>
              {item.destination.name} - {item.bookingCount} bookings
            </p>
          ))}
        </div>
        <div className="card">
          <h3>Top Packages</h3>
          {analytics.topPackages.map((item, idx) => (
            <p key={idx}>
              {item.package.title} - {item.bookingCount} bookings
            </p>
          ))}
        </div>
        <div className="card">
          <h3>Top Vendors</h3>
          {analytics.topVendors.map((item, idx) => (
            <p key={idx}>
              {item.vendor.username} - Rating: {item.avgRating} ({item.reviewCount} reviews)
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

