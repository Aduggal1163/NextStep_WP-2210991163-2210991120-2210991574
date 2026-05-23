import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ViewBookings from './ViewBookings';
import CreatePackage from './CreatePackage';
import AssignVendors from './AssignVendors';
import './PlannerDashboard.css';

const PlannerDashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-sidebar" >
        <h2 style={{
    background: "linear-gradient(to right, #e11d48, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
  }}>Planner Dashboard</h2>
        <nav className="dashboard-nav">
          <NavLink to="/planner/bookings" className={({ isActive }) => isActive ? 'active' : ''}>
            📋 View Bookings
          </NavLink>
          <NavLink to="/planner/packages" className={({ isActive }) => isActive ? 'active' : ''}>
            📦 Create Packages
          </NavLink>
          <NavLink to="/planner/vendors" className={({ isActive }) => isActive ? 'active' : ''}>
            👥 Assign Vendors
          </NavLink>
        </nav>
      </div>
      <div className="dashboard-content">
        <Routes>
          <Route path="bookings" element={<ViewBookings />} />
          <Route path="packages" element={<CreatePackage />} />
          <Route path="vendors" element={<AssignVendors />} />
          <Route path="*" element={<ViewBookings />} />
        </Routes>
      </div>
    </div>
  );
};

export default PlannerDashboard;

