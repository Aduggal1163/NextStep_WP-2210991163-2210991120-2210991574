import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Reviews.css';

const Reviews = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    targetId: '',
    targetType: 'vendor',
    rating: 5,
    comment: '',
  });
  const [message, setMessage] = useState('');
  const [vendors, setVendors] = useState([]);
  const [planners, setPlanners] = useState([]);

  useEffect(() => {
    if (user) {
      fetchVendors();
      fetchPlanners();
    }
  }, [user]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/v1/user/allVendors');
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchPlanners = async () => {
    try {
      const response = await axios.get('/api/v1/user/allPlanner');
      setPlanners(response.data.planner || []);
    } catch (error) {
      console.error('Error fetching planners:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!formData.targetId) {
      setMessage('Please select a vendor or planner');
      return;
    }

    try {
      await axios.post('/api/v1/user/review/add', {
        targetId: formData.targetId,
        targetType: formData.targetType,
        rating: formData.rating,
        comment: formData.comment,
      });
      setMessage('Review added successfully!');
      setFormData({
        targetId: '',
        targetType: 'vendor',
        rating: 5,
        comment: '',
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add review');
    }
  };

  const getTargetOptions = () => {
    if (formData.targetType === 'vendor') {
      return vendors.map(v => ({ id: v._id, name: v.username }));
    } else if (formData.targetType === 'planner') {
      return planners.map(p => ({ id: p._id, name: p.plannerName }));
    }
    return [];
  };

  return (
    <div className="reviews-page">
      <h1>Leave a Review</h1>
      <div className="card">
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Review Type</label>
            <select
              name="targetType"
              className="form-select"
              value={formData.targetType}
              onChange={(e) => setFormData({ ...formData, targetType: e.target.value, targetId: '' })}
            >
              <option value="vendor">Vendor</option>
              <option value="planner">Planner</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              {formData.targetType === 'vendor' ? 'Select Vendor' : 'Select Planner'}
            </label>
            <select
              className="form-select"
              value={formData.targetId}
              onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
              required
            >
              <option value="">Choose a {formData.targetType}...</option>
              {getTargetOptions().map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            {getTargetOptions().length === 0 && (
              <small style={{ color: '#dc3545' }}>
                No {formData.targetType}s available to review
              </small>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Rating</label>
            <select
              name="rating"
              className="form-select"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
            >
              <option value={5}>⭐⭐⭐⭐⭐ 5 - Excellent</option>
              <option value={4}>⭐⭐⭐⭐ 4 - Very Good</option>
              <option value={3}>⭐⭐⭐ 3 - Good</option>
              <option value={2}>⭐⭐ 2 - Fair</option>
              <option value={1}>⭐ 1 - Poor</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Comment</label>
            <textarea
              className="form-textarea"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Share your experience..."
              rows="5"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!formData.targetId}>
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reviews;

