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
import RoleProtectedRoute from './components/RoleProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Provider routes: only provider and admin */}
        <Route 
          path="/provider/*" 
          element={
            <RoleProtectedRoute allowedRoles={["provider", "admin"]}>
              <ProviderDashboard />
            </RoleProtectedRoute>
          }
        >
          <Route path="checkin" element={<CheckIn />} />
          <Route path="guestlist" element={<GuestList />} />
          <Route path="checkinhistory" element={<CheckInHistory />} />
          <Route index element={<CheckIn />} />
        </Route>

        {/* Security routes: only security and admin */}
        <Route 
          path="/security/*" 
          element={
            <RoleProtectedRoute allowedRoles={["security", "admin"]}>
              <SecurityDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Manual routes: only security and admin */}
        <Route 
          path="/manual/*" 
          element={
            <RoleProtectedRoute allowedRoles={["security", "admin"]}>
              <ManualSearch />
            </RoleProtectedRoute>
          }
        />

        {/* Admin route: only admin */}
        <Route 
          path="/admin/users" 
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminUserManagement />
            </RoleProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
