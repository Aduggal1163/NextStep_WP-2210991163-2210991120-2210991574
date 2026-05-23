import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BrowseDestinations.css';

const BrowseDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    style: '',
    minPrice: '',
    maxPrice: '',
    minCapacity: '',
    maxCapacity: '',
  });
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    fetchDestinations();
    fetchPackages();
  }, []);

  const fetchDestinations = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.style) params.append('style', filters.style);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);
      if (filters.maxCapacity) params.append('maxCapacity', filters.maxCapacity);

      const response = await axios.get(`/api/v1/destination/all?${params}`);
      setDestinations(response.data.destinations || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await axios.get('/api/v1/package/all');
      setPackages(response.data.packages || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const applyFilters = () => {
    setLoading(true);
    fetchDestinations();
  };

  const viewDestination = async (destinationId) => {
    try {
      const response = await axios.get(`/api/v1/destination/${destinationId}`);
      setSelectedDestination(response.data.destination);
    } catch (error) {
      console.error('Error fetching destination details:', error);
    }
  };

  if (loading && destinations.length === 0) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="browse-destinations">
      <h1   style={{
    background: "linear-gradient(to right, #e11d48, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 700,
  }}>Browse Destinations</h1>

      <div className="filters-section">
        <h2>Filters</h2>
        <div className="grid grid-3">
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              className="form-input"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Enter location"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Style</label>
            <select
              name="style"
              className="form-select"
              value={filters.style}
              onChange={handleFilterChange}
            >
              <option value="">All Styles</option>
              <option value="beach">Beach</option>
              <option value="palace">Palace</option>
              <option value="hill station">Hill Station</option>
              <option value="traditional">Traditional</option>
              <option value="modern">Modern</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Min Price</label>
            <input
              type="number"
              name="minPrice"
              className="form-input"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min price"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max Price</label>
            <input
              type="number"
              name="maxPrice"
              className="form-input"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max price"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Min Capacity</label>
            <input
              type="number"
              name="minCapacity"
              className="form-input"
              value={filters.minCapacity}
              onChange={handleFilterChange}
              placeholder="Min guests"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max Capacity</label>
            <input
              type="number"
              name="maxCapacity"
              className="form-input"
              value={filters.maxCapacity}
              onChange={handleFilterChange}
              placeholder="Max guests"
            />
          </div>
        </div>
        <button onClick={applyFilters} className="btn btn-primary">
          Apply Filters
        </button>
      </div>

      <div className="destinations-grid">
        {destinations.map((dest) => (
          <div key={dest._id} className="destination-card">
            <h3>{dest.name}</h3>
            <p><strong>Location:</strong> {dest.location}</p>
            <p><strong>Style:</strong> {dest.style}</p>
            <p><strong>Price Range:</strong> ₹{dest.priceRange?.min} - ₹{dest.priceRange?.max}</p>
            <p><strong>Capacity:</strong> {dest.guestCapacity?.min} - {dest.guestCapacity?.max} guests</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={() => viewDestination(dest._id)}
                className="btn btn-primary"
              >
                View Details
              </button>
              <button
                onClick={() => window.location.href = '/user/create-booking'}
                className="btn btn-success"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedDestination && (
        <div className="destination-modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedDestination(null)}>&times;</span>
            <h2>{selectedDestination.name}</h2>
            <p><strong>Location:</strong> {selectedDestination.location}</p>
            <p><strong>Style:</strong> {selectedDestination.style}</p>
            <p><strong>Description:</strong> {selectedDestination.description}</p>
            <div>
              <h3>Available Packages</h3>
              {packages
                .filter(pkg => pkg.destinationId?._id === selectedDestination._id)
                .map(pkg => (
                  <div key={pkg._id} className="package-item">
                    <h4>{pkg.title}</h4>
                    <p>Price: ₹{pkg.basePrice}</p>
                    <p>{pkg.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseDestinations;

