import React from 'react';
import './HeaderBar.css';
import AppNameImg from '../assets/AppName.png';

const HeaderBar = ({
  showUser = false,
  username = "",
  profileImage = ""
}) => {
  let currentUsername = username;

  if (!currentUsername) {
    try {
      const stored = localStorage.getItem('currentUser');
      const parsed = stored ? JSON.parse(stored) : null;
      currentUsername = parsed?.first_name || 'Guest';
    } catch {
      currentUsername = 'Guest';
    }
  }

  return (
    <header className="header-bar">
      <div className="header-left">
        <img src={AppNameImg} alt="App Name" className="app-name" />
      </div>
      {showUser && (
        <div className="header-right">
          <span className="welcome-msg">Welcome, {currentUsername}</span>
          {profileImage && (
            <img src={profileImage} alt="User Profile" className="profile-pic" />
          )}
        </div>
      )}
    </header>
  );
};
export default HeaderBar;