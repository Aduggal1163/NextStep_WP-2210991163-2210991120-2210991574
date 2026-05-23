import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [updateData, setUpdateData] = useState({
    emailOrUserName: '',
    prevData: '',
    updateData: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.post('/api/v1/user/getProfile', {
        emailOrUserName: user.email,
      });
      setProfileData(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/user/updateProfile', updateData);
      alert('Profile updated successfully!');
      fetchProfile();
      setUpdateData({ emailOrUserName: '', prevData: '', updateData: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!profileData) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      <div className="card">
        <h2>Profile Information</h2>
        <p><strong>Username:</strong> {profileData.username || 'N/A'}</p>
        <p><strong>Email:</strong> {profileData.email}</p>
        <p><strong>Contact:</strong> {profileData.contactDetails}</p>
        <p><strong>Role:</strong> {profileData.role}</p>
      </div>

      <div className="card">
        <h2>Update Profile</h2>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <input
              type="text"
              className="form-input"
              value={updateData.emailOrUserName}
              onChange={(e) => setUpdateData({ ...updateData, emailOrUserName: e.target.value })}
              placeholder={user.email}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Current Value</label>
            <input
              type="text"
              className="form-input"
              value={updateData.prevData}
              onChange={(e) => setUpdateData({ ...updateData, prevData: e.target.value })}
              placeholder="Enter current email/username/contact"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Value</label>
            <input
              type="text"
              className="form-input"
              value={updateData.updateData}
              onChange={(e) => setUpdateData({ ...updateData, updateData: e.target.value })}
              placeholder="Enter new value"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

