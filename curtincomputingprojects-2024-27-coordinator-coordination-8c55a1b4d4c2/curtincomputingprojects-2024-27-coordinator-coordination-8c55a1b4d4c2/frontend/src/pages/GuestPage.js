import React from 'react';
import './GuestPage.css';
import HeaderBar from '../components/HeaderBar';
import ConnectInterface from '../components/ConnectInterface';
import { Link } from 'react-router-dom';

const GuestPage = () => {
  return (
    <div className="guest-page">
      <HeaderBar showUser={false} />
      <div className="guest-page-content">
        <div className="login-top-right">
          <Link to="/login" className="text-link">Not a Guest?</Link>
        </div>
        <ConnectInterface />
      </div>
    </div>
  );
};
export default GuestPage;