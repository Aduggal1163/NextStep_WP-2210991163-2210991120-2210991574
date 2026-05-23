import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ManageDestinations from './ManageDestinations';
import ManageUsers from './ManageUsers';
import Analytics from './Analytics';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <h2 style={{
    background: "linear-gradient(to right, #e11d48, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
  }}>Admin Panel</h2>
        <nav className="dashboard-nav">
          <NavLink to="/admin/destinations" className={({ isActive }) => isActive ? 'active' : ''}>
            📍 Destinations
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
            👥 Manage Users
          </NavLink>
          <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
            📊 Analytics
          </NavLink>
        </nav>
      </div>
      <div className="dashboard-content">
        <Routes>
          <Route path="destinations" element={<ManageDestinations />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<ManageDestinations />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;

