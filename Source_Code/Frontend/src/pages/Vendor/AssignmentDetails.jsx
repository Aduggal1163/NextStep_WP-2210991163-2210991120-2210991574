import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../User/MyBookings.css';

const AssignmentDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliverables, setDeliverables] = useState({
    deliverables: [],
    notes: '',
  });
  const [invoice, setInvoice] = useState({
    amount: '',
    description: '',
    invoiceUrl: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssignment();
  }, [bookingId]);

  const fetchAssignment = async () => {
    try {
      const response = await axios.get(`/api/v1/vendor/assignment/${bookingId}`);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      setMessage('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverablesSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/v1/vendor/${bookingId}/deliverables`, {
        deliverables: deliverables.deliverables.filter(d => d.trim() !== ''),
        status: 'completed',
        notes: deliverables.notes,
      });
      setMessage('Deliverables uploaded successfully!');
      setDeliverables({ deliverables: [], notes: '' });
      fetchAssignment();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to upload deliverables');
    }
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/v1/vendor/${bookingId}/invoice`, invoice);
      setMessage('Invoice submitted successfully!');
      setInvoice({ amount: '', description: '', invoiceUrl: '' });
      fetchAssignment();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit invoice');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!booking) {
    return (
      <div className="my-bookings">
        <div className="card">
          <p>Assignment not found or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <h1>Assignment Details</h1>
      
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="booking-card">
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
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Upload Deliverables</h2>
        <form onSubmit={handleDeliverablesSubmit}>
          <div className="form-group">
            <label className="form-label">Deliverables (one per line)</label>
            <textarea
              className="form-textarea"
              value={deliverables.deliverables.join('\n')}
              onChange={(e) => setDeliverables({
                ...deliverables,
                deliverables: e.target.value.split('\n')
              })}
              placeholder="Enter deliverables, one per line..."
              rows="5"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              value={deliverables.notes}
              onChange={(e) => setDeliverables({ ...deliverables, notes: e.target.value })}
              placeholder="Additional notes..."
              rows="3"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Upload Deliverables
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Submit Invoice</h2>
        <form onSubmit={handleInvoiceSubmit}>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-input"
              value={invoice.amount}
              onChange={(e) => setInvoice({ ...invoice, amount: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={invoice.description}
              onChange={(e) => setInvoice({ ...invoice, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Invoice URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              value={invoice.invoiceUrl}
              onChange={(e) => setInvoice({ ...invoice, invoiceUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <button type="submit" className="btn btn-success">
            Submit Invoice
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignmentDetails;

