import React from 'react';
import HeaderBar from '../components/HeaderBar';
import ConnectInterface from '../components/ConnectInterface';
import './CoordinatorDashboardPage.css';
import { useNavigate } from 'react-router-dom';

const CoordinatorDashboardPage = () => {
  const username = localStorage.getItem('currentUser') || 'Guest';
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div className="coordinator-dashboard-page">
      <HeaderBar showUser={true} />
      <div className="coordinator-dashboard-contents">
        <div className="coordinator-dashboard-buttons">
          <button onClick={() => navigate('/coordinator-dashboard/personal-details')}>Personal Details</button>
          <button onClick={() => navigate('/coordinator-dashboard/make-suggestions')}>Make Suggestions</button>
          <button onClick={() => navigate('/coordinator-dashboard/leave-requests')}>Leave Requests</button>
          <button onClick={() => navigate('/coordinator-dashboard/personal-leave-statements')}>Personal Leave Statements</button>
        </div>
        <div className="connect-interface-section">
        <ConnectInterface />
        </div>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};
export default CoordinatorDashboardPage;