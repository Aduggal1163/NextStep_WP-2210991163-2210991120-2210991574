import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../User/ChooseVendors.css';

const AssignVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedBookingData, setSelectedBookingData] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [assignMessage, setAssignMessage] = useState('');

  useEffect(() => {
    fetchVendors();
    fetchBookings();
    
    // Check if booking ID is in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking');
    if (bookingId) {
      setSelectedBooking(bookingId);
    }
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      const booking = bookings.find(b => b._id === selectedBooking);
      setSelectedBookingData(booking);
      if (booking?.suggestedVendors && booking.suggestedVendors.length > 0) {
        // Pre-select user's suggested vendors
        const suggestedIds = booking.suggestedVendors.map(v => {
          // Handle both populated objects and IDs
          return v._id ? v._id.toString() : v.toString();
        });
        setSelectedVendors(suggestedIds);
      } else {
        // Clear selection if no suggestions
        setSelectedVendors([]);
      }
    } else {
      setSelectedBookingData(null);
      setSelectedVendors([]);
    }
  }, [selectedBooking, bookings]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/v1/planner/vendors');
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      // Fetch all bookings including unassigned ones
      const response = await axios.get('/api/v1/planner/my-bookings?showAll=true');
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const assignVendors = async () => {
    if (!selectedBooking) {
      setAssignMessage('Please select a booking first');
      setTimeout(() => setAssignMessage(''), 3000);
      return;
    }
    
    if (selectedVendors.length === 0) {
      setAssignMessage('Please select at least one vendor');
      setTimeout(() => setAssignMessage(''), 3000);
      return;
    }

    setAssigning(true);
    setAssignMessage('');

    try {
      console.log('Assigning vendors:', {
        bookingId: selectedBooking,
        vendorIds: selectedVendors,
        vendorCount: selectedVendors.length
      });

      // Validate vendor IDs before sending
      const validVendorIds = selectedVendors.filter(id => {
        // Basic validation - should be a string and not empty
        return id && typeof id === 'string' && id.length > 0;
      });

      if (validVendorIds.length !== selectedVendors.length) {
        setAssignMessage('Error: Some vendor IDs are invalid');
        setAssigning(false);
        return;
      }

      const response = await axios.put(`/api/v1/planner/${selectedBooking}/assign-vendors`, {
        vendorIds: validVendorIds,
      });

      if (response.data && response.data.message) {
        setAssignMessage(response.data.message);
      } else {
        setAssignMessage(`Successfully assigned ${validVendorIds.length} vendor(s)!`);
      }

      // Refresh data after successful assignment
      setTimeout(() => {
        setAssignMessage('');
        fetchBookings();
        fetchVendors();
        // Keep selection for now so user can see the result
        // setSelectedBooking('');
        // setSelectedVendors([]);
        // setSelectedBookingData(null);
      }, 2000);
    } catch (error) {
      console.error('Error assigning vendors:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to assign vendors';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAssignMessage(`Error: ${errorMessage}`);
      
      // Show more details in console for debugging
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="choose-vendors">
      <h1>Assign Vendors</h1>
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label className="form-label">Select Booking</label>
          <select
            className="form-select"
            value={selectedBooking}
            onChange={(e) => setSelectedBooking(e.target.value)}
          >
            <option value="">Choose a booking...</option>
            {bookings.filter(b => b.plannerId && b.plannerId.toString()).map((booking) => (
              <option key={booking._id} value={booking._id}>
                {booking.destinationId?.name} - {new Date(booking.date).toLocaleDateString()} 
                {booking.suggestedVendors?.length > 0 && ` (${booking.suggestedVendors.length} suggestions)`}
                {booking.vendors?.length > 0 && ` [${booking.vendors.length} assigned]`}
              </option>
            ))}
          </select>
          {bookings.filter(b => !b.plannerId || !b.plannerId.toString()).length > 0 && (
            <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '5px' }}>
              <small style={{ color: '#856404' }}>
                ⚠️ {bookings.filter(b => !b.plannerId || !b.plannerId.toString()).length} booking(s) need to be claimed first. 
                Go to "View Bookings" to claim them.
              </small>
            </div>
          )}
        </div>
        {selectedBookingData && selectedBookingData.suggestedVendors && selectedBookingData.suggestedVendors.length > 0 && (
          <div style={{ marginTop: '15px', padding: '15px', background: '#e7f3ff', borderRadius: '8px' }}>
            <p><strong>💡 User's Vendor Preferences:</strong></p>
            <p>The user has suggested {selectedBookingData.suggestedVendors.length} vendor(s). 
            They are pre-selected below. You can modify the selection as needed.</p>
          </div>
        )}
      </div>

      {vendors.length === 0 ? (
        <div className="card">
          <p>No approved vendors available. Vendors need to be approved by admin first.</p>
        </div>
      ) : (
        <div className="vendors-grid">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="vendor-card">
              <h3>{vendor.username}</h3>
              <p><strong>Email:</strong> {vendor.email}</p>
              <p><strong>Status:</strong> {vendor.status || 'approved'}</p>
              {vendor.servicesOffered && vendor.servicesOffered.length > 0 && (
                <div className="services-list" style={{ marginTop: '10px' }}>
                  <strong>Services:</strong>
                  <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    {vendor.servicesOffered.slice(0, 3).map((service, idx) => (
                      <li key={idx}>{service.type} - ₹{service.price}</li>
                    ))}
                    {vendor.servicesOffered.length > 3 && (
                      <li>+{vendor.servicesOffered.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedVendors(prev =>
                    prev.includes(vendor._id)
                      ? prev.filter(id => id !== vendor._id)
                      : [...prev, vendor._id]
                  );
                }}
                className={`btn ${selectedVendors.includes(vendor._id) ? 'btn-success' : 'btn-primary'}`}
                style={{ marginTop: '10px', width: '100%' }}
              >
                {selectedVendors.includes(vendor._id) ? '✓ Selected' : 'Select Vendor'}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedVendors.length > 0 && selectedBooking && selectedBookingData && selectedBookingData.plannerId && (
        <div className="selected-vendors" style={{ 
          position: 'sticky', 
          bottom: 0, 
          background: 'white', 
          padding: '20px', 
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          marginTop: '30px',
          zIndex: 100,
          border: '2px solid #28a745',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#28a745', marginTop: 0 }}>✅ Ready to Assign ({selectedVendors.length} vendors)</h3>
          {assignMessage && (
            <div className={`alert ${assignMessage.includes('success') || assignMessage.includes('Successfully') || assignMessage.includes('assigned') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '10px' }}>
              {assignMessage}
            </div>
          )}
          <div style={{ marginTop: '10px', padding: '10px', background: '#e7f3ff', borderRadius: '5px' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>Booking:</strong> {selectedBookingData?.destinationId?.name || 'N/A'} - {selectedBookingData ? new Date(selectedBookingData.date).toLocaleDateString() : ''}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
              <strong>Vendors Selected:</strong> {selectedVendors.length}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={assignVendors} 
              className="btn btn-success" 
              style={{ flex: 1, minWidth: '200px', fontSize: '16px', padding: '12px 24px' }}
              disabled={assigning || !selectedBooking || selectedVendors.length === 0}
            >
              {assigning ? (
                <>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '3px solid #f3f3f3', borderTop: '3px solid #28a745', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' }}></span>
                  Assigning...
                </>
              ) : (
                `✅ Assign ${selectedVendors.length} Vendor(s) to Booking`
              )}
            </button>
            <button 
              onClick={() => {
                setSelectedVendors([]);
                setAssignMessage('');
              }} 
              className="btn btn-secondary"
              disabled={assigning}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {selectedVendors.length > 0 && (!selectedBooking || (selectedBookingData && !selectedBookingData.plannerId)) && (
        <div className="selected-vendors" style={{ 
          background: '#fff3cd', 
          padding: '20px', 
          borderRadius: '8px',
          marginTop: '30px',
          border: '2px solid #ffc107'
        }}>
          <h3>⚠️ Selected Vendors ({selectedVendors.length})</h3>
          {!selectedBooking ? (
            <p style={{ color: '#856404', marginTop: '10px' }}>
              Please select a booking above to assign these vendors.
            </p>
          ) : selectedBookingData && !selectedBookingData.plannerId ? (
            <div style={{ marginTop: '10px', padding: '10px', background: '#f8d7da', borderRadius: '5px' }}>
              <p style={{ color: '#721c24', margin: 0, fontSize: '14px' }}>
                ⚠️ This booking is not assigned to you. Please claim it first from the "View Bookings" page.
              </p>
              <button
                onClick={() => window.location.href = '/planner/bookings'}
                className="btn btn-primary"
                style={{ marginTop: '10px' }}
              >
                Go to View Bookings
              </button>
            </div>
          ) : null}
          <button 
            onClick={() => setSelectedVendors([])} 
            className="btn btn-secondary"
            style={{ marginTop: '10px' }}
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default AssignVendors;

