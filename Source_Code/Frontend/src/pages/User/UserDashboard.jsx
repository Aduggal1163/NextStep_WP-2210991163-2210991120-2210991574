import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import BrowseDestinations from './BrowseDestinations';
import MyBookings from './MyBookings';
import CreateBooking from './CreateBooking';
import ChooseVendors from './ChooseVendors';
import Reviews from './Reviews';
import Profile from './Profile';
import './UserDashboard.css';

const UserDashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
      <h2
  style={{
    background: "linear-gradient(to right, #e11d48, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
  }}
>
  User Dashboard
</h2>

        <nav className="dashboard-nav">
          <NavLink to="/user/destinations" className={({ isActive }) => isActive ? 'active' : ''} >
            🔎 Browse Destinations
          </NavLink>
          <NavLink to="/user/create-booking" className={({ isActive }) => isActive ? 'active' : ''}>
            ➕ Create Booking
          </NavLink>
          <NavLink to="/user/bookings" className={({ isActive }) => isActive ? 'active' : ''}>
            📦 My Bookings
          </NavLink>
          <NavLink to="/user/vendors" className={({ isActive }) => isActive ? 'active' : ''}>
            👥 Choose Vendors
          </NavLink>
          <NavLink to="/user/reviews" className={({ isActive }) => isActive ? 'active' : ''}>
            ⭐ Reviews
          </NavLink>
          <NavLink to="/user/profile" className={({ isActive }) => isActive ? 'active' : ''}>
            👤 Profile
          </NavLink>
        </nav>
      </div>
      <div className="dashboard-content">
        <Routes>
          <Route path="destinations" element={<BrowseDestinations />} />
          <Route path="create-booking" element={<CreateBooking />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="vendors" element={<ChooseVendors />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<BrowseDestinations />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserDashboard;

