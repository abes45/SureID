import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import './ProviderDashboard.css';

function ProviderDashboard() {
  return (
    <div className="provider-dashboard">
      <header className="provider-header">
        <h1>SureID - Accommodation Provider Interface</h1>
        <LogoutButton />
      </header>
      <nav className="provider-nav">
        <NavLink 
          to="checkin" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          Check-In
        </NavLink>
        <NavLink 
          to="guestlist" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          Guest List
        </NavLink>
        <NavLink 
          to="checkinhistory" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          Check-In History
        </NavLink>
      </nav>
      <div className="provider-content">
        <Outlet />
      </div>
      <footer className="provider-footer">
        <p>&copy; 2025 SureID. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ProviderDashboard;
