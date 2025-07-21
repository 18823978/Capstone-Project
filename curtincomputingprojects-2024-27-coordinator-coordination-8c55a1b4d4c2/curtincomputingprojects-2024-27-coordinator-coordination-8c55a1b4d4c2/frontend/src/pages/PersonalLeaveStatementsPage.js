import React, { useEffect, useState } from 'react';
import './PersonalLeaveStatementsPage.css';
import HeaderBar from '../components/HeaderBar';

const PersonalLeaveStatementsPage = () => {
  const [leaveStatements, setLeaveStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    if (!token || !storedUser) {
      console.warn('Missing token or user in localStorage');
      setLoading(false);
      return;
    }
    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      console.error('Failed to parse currentUser:', err);
      setLoading(false);
      return;
    }
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/leaves/coordinator/${user.staff_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.data?.leaveRequests)) {
          setLeaveStatements(data.data.leaveRequests);
        } else {
          console.error('Unexpected response:', data);
          setLeaveStatements([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching leave statements:', err);
        setLeaveStatements([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="personal-leave-statements-page">
      <HeaderBar showUser={true} />
      <h2>Personal Leave Statements</h2>
      {loading ? (
        <p>Loading...</p>
      ) : leaveStatements.length === 0 ? (
        <p>No leave statements available.</p>
      ) : (
        <div className="leave-cards-container">
          {leaveStatements.map((statement, index) => (
            <div key={index} className="leave-card">
              <p className="leave-date">
                <strong>Period:</strong> {statement.start_date} to {statement.end_date}
              </p>
              <p><strong>Course:</strong> {statement.course_code}</p>
              <p><strong>Nominated staff ID:</strong> {statement.deputy_id}</p>
              <p><strong>Reason:</strong> {statement.duties}</p>
              <span className="status-badge">{statement.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default PersonalLeaveStatementsPage;