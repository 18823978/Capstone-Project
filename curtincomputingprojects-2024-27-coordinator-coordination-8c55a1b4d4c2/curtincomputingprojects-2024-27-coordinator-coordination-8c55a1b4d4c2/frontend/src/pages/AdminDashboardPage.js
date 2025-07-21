import React, { useEffect, useState } from 'react';
import './AdminDashboardPage.css';
import HeaderBar from '../components/HeaderBar';
import ConnectInterface from '../components/ConnectInterface';
import Button from '../components/Button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const [dashboardStats, setDashboardStats] = useState({
    openedSuggestions: 0,
    leaveRequestsThisWeek: 0,
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/leaves/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const leaves = res.data?.data?.leaveRequests || [];
        setLeaveRequests(leaves);
        setDashboardStats(prev => ({
          ...prev,
          leaveRequestsThisWeek: leaves.length,
        }));
      })
      .catch(err => console.error('Leave error:', err));
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/suggestions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const suggestions = res.data?.data?.suggestions || [];
        setSuggestions(suggestions);
        const open = suggestions.length;
        setDashboardStats(prev => ({
          ...prev,
          openedSuggestions: open
        }));
      })
      .catch(err => console.error('Suggestions error:', err));
  }, []);
    const navigate = useNavigate();
    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      navigate('/');
    };
  const handleLeave = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/leaves/${id}/${action}`;
      await axios.patch(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLeaveRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.error(`Failed to ${action} leave request:`, error);
      alert(`Error: Could not ${action} leave request.`);
    }
  };
    function handleSuggestion(id, action) {
    const token = localStorage.getItem('token');
    axios.patch(
      `${process.env.REACT_APP_BACKEND_URL}/api/suggestions/${id}/${action}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then(() => alert(`Suggestion ${action}d`))
      .catch((err) => alert(`Failed to ${action} suggestion: ` + err.message));
  }

  return (
    <div className="admin-dashboard">
      <HeaderBar showUser={true} />
      <div className="summary-cards">
        <div className="card">
          <div>{dashboardStats.openedSuggestions}</div>
          <span>Pending Suggestions</span>
        </div>
        <div className="card">
          <div>{dashboardStats.leaveRequestsThisWeek}</div>
          <span>Pending Leave Requests</span>
        </div>
      </div>
      <div className="dashboard-content">
        <div className="left-panels">
          <div className="panel">
            <h2>Leave Requests</h2>
            <div className="data-table">
              {leaveRequests.map((req) => (
                <div key={req.id}>
                  {req.coordinator_name} → {req.start_date} to {req.end_date}
                  <br />
                  Reason: {req.reason}
                  <div className="actions">
                    <Button
                      label="Approve"
                      size="small"
                      onClick={() => handleLeave(req.id, 'approve')}
                    />
                    <Button
                      label="Reject"
                      size="small"
                      onClick={() => handleLeave(req.id, 'reject')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h2>Suggestions</h2>
            <div className="data-table">
              {suggestions.map((sugg) => (
                <div key={sugg.id}>
                  {sugg.title}: {sugg.suggestion_text}
                  <div className="actions">
                    <Button
                      label="Approve"
                      size="small"
                      onClick={() => handleSuggestion(sugg.id, 'approve')}
                    />
                    <Button
                      label="Reject"
                      size="small"
                      onClick={() => handleSuggestion(sugg.id, 'reject')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel connect-interface-wrapper">
          <ConnectInterface />
        </div>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};
export default AdminDashboardPage;