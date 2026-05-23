import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    role: 'user',
    email: '',
    password: '',
    contactDetails: '',
    username: '',
    plannerName: '',
    adminName: '',
    servicesOffered: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const submitData = {
      role: formData.role,
      email: formData.email,
      password: formData.password,
      contactDetails: formData.contactDetails,
    };

    if (formData.role === 'user') {
      submitData.username = formData.username;
    } else if (formData.role === 'planner') {
      submitData.plannerName = formData.plannerName;
    } else if (formData.role === 'admin') {
      submitData.adminName = formData.adminName;
    } else if (formData.role === 'vendor') {
      submitData.username = formData.username;
    }

    const result = await signup(submitData);

    if (result.success) {
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign Up</h1>
        <p>Create your account to get started.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="planner">Planner</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              {formData.role === 'user' || formData.role === 'vendor'
                ? 'Username'
                : formData.role === 'planner'
                ? 'Planner Name'
                : 'Admin Name'}
            </label>
            <input
              type="text"
              name={
                formData.role === 'user' || formData.role === 'vendor'
                  ? 'username'
                  : formData.role === 'planner'
                  ? 'plannerName'
                  : 'adminName'
              }
              className="form-input"
              value={
                formData.role === 'user' || formData.role === 'vendor'
                  ? formData.username
                  : formData.role === 'planner'
                  ? formData.plannerName
                  : formData.adminName
              }
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            <small>Password must be at least 8 characters long</small>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input
              type="tel"
              name="contactDetails"
              className="form-input"
              value={formData.contactDetails}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

