import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

import HeaderBar from '../components/HeaderBar';
import AppLogoImg from '../assets/AppLogo.png';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, data } = response.data;
      const user = data?.user;

      if (!token || !user) {
        alert('Login failed: Invalid response from server.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      let role = 'unknown';
      if (typeof user.role === 'string') {
        role = user.role.toLowerCase();
      } else if (user.role && typeof user.role.name === 'string') {
        role = user.role.name.toLowerCase();
      } else if (user.role_id === 1) {
        role = 'coordinator';
      } else if (user.role_id === 2) {
        role = 'admin';
      }

      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'coordinator') {
        navigate('/coordinator-dashboard');
      } else {
        alert('Login successful, but unknown role. Contact admin.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid credentials or server error.');
    }
  };

  return (
    <div className="login-page">
      <HeaderBar />
      <div className="login-content">
        <img src={AppLogoImg} alt="App Logo" className="app-logo" />
        <div className="login-box">
          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              name="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="button-wrapper">
              <button type="submit" className="login-button">Sign In</button>
            </div>
          </form>
          <div className="login-links">
            <a
              className="forgot-password"
              href="https://id.curtin.edu.au/am/XUI/?realm=%2Fcurtin&goto=https://id.curtin.edu.au/login"
              target="_blank"
              rel="noopener noreferrer"
            >
              Forgot Password?
            </a>
            <a
              className="continue-as-guest"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              Continue as Guest
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;