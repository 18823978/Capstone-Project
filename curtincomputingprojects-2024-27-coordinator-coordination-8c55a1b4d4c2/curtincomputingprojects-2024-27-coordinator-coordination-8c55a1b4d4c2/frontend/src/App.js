import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import GuestPage from './pages/GuestPage';
import CoordinatorDashboardPage from './pages/CoordinatorDashboardPage';
import MakeSuggestionsPage from './pages/MakeSuggestionsPage';
import PersonalDetailsPage from './pages/PersonalDetailsPage';
import PersonalLeaveStatementPage from './pages/PersonalLeaveStatementsPage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GuestPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/coordinator-dashboard" element={<CoordinatorDashboardPage />} />
        <Route path="/coordinator-dashboard/make-suggestions" element={<MakeSuggestionsPage />} />
        <Route path="/coordinator-dashboard/personal-details" element={<PersonalDetailsPage />} />
        <Route path="/coordinator-dashboard/personal-leave-statements" element={<PersonalLeaveStatementPage />} />
        <Route path="/coordinator-dashboard/leave-requests" element={<LeaveRequestsPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </Router>
  );
}
export default App;
