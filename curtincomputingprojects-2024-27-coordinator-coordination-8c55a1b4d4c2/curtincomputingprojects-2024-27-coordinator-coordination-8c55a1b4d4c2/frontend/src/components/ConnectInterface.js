import React, { useState } from 'react';
import './ConnectInterface.css';
import Button from './Button';
import axios from 'axios';

const ConnectInterface = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/courses/search`,
        {
          params: { query: query },
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );
      setResults(response.data.data.courses || []);
    } catch (err) {
      setError('Error fetching course data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="connect-interface-container">
      <h2 className="connect-title">Connect Interface</h2>
      <p className="connect-subtitle">Search for a course to find its coordinator.</p>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter course code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Button label="Search" size="small" onClick={handleSearch} />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="data-table">
        <div className="search-results">
          {results.length === 0 && hasSearched && !loading && !error && (
            <p>No results found.</p>
          )}
          {results.map((course, index) => (
            <div key={index} className="coordinator-box">
              <div className="coordinator-info">
                <span className="coordinator-name">
                  {course.coordinator
                    ? `${course.coordinator.first_name} ${course.coordinator.last_name}`
                    : 'N/A'}
                </span>
                <div className="coordinator-details">
                  <span>Course Code: {course.course_code}</span>
                  <span>Course Name: {course.course_name}</span>
                  <span>Phone: {course.coordinator?.phone}</span>
                  <span>Email: {course.coordinator?.email}</span>
                </div>  
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ConnectInterface;