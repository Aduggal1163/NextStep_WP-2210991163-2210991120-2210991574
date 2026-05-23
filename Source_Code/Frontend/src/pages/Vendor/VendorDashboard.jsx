import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import MyAssignments from './MyAssignments';
import MyServices from './MyServices';
import AssignmentDetails from './AssignmentDetails';
import './VendorDashboard.css';

const VendorDashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <h2 style={{
    background: "linear-gradient(to right, #e11d48, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
  }}>Vendor Dashboard</h2>
        <nav className="dashboard-nav">
          <NavLink to="/vendor/assignments" className={({ isActive }) => isActive ? 'active' : ''}>
            📋 My Assignments
          </NavLink>
          <NavLink to="/vendor/services" className={({ isActive }) => isActive ? 'active' : ''}>
            📦 My Services
          </NavLink>
        </nav>
      </div>
      <div className="dashboard-content">
        <Routes>
          <Route path="assignments" element={<MyAssignments />} />
          <Route path="assignment/:bookingId" element={<AssignmentDetails />} />
          <Route path="services" element={<MyServices />} />
          <Route path="*" element={<MyAssignments />} />
        </Routes>
      </div>
    </div>
  );
};

export default VendorDashboard;

