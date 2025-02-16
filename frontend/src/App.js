import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ProviderDashboard from './components/ProviderDashboard';
import CheckIn from './components/CheckIn';
import GuestList from './components/GuestList';
import CheckInHistory from './components/CheckInHistory';
import SecurityDashboard from './components/SecurityDashboard';
import ManualSearch from './components/ManualSearch';
import AdminUserManagement from './components/AdminUserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Provider routes (accessible by provider and admin) */}
        <Route path="/provider/*" element={
          <ProtectedRoute>
            <ProviderDashboard />
          </ProtectedRoute>
        }>
          <Route path="checkin" element={<CheckIn />} />
          <Route path="guestlist" element={<GuestList />} />
          <Route path="checkinhistory" element={<CheckInHistory />} />
          <Route index element={<CheckIn />} />
        </Route>

        {/* Security routes (accessible by security and admin) */}
        <Route path="/security/*" element={
          <ProtectedRoute>
            <SecurityDashboard />
          </ProtectedRoute>
        }/>

        {/* Manual routes (accessible by security and admin) */}
        <Route path="/manual/*" element={
          <ProtectedRoute>
            <ManualSearch />
          </ProtectedRoute>
        }/>

        {/* Admin routes (accessible by admin only) */}
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <AdminUserManagement />
          </ProtectedRoute>
        }/>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
