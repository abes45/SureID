import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import './SecurityDashboard.css';

function SecurityDashboard() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/checkins`);
      // Filter for records with a non-empty alert message
      const alertRecords = response.data.filter(record => record.alert && record.alert.trim() !== "");
      setAlerts(alertRecords);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAlerts();
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return (
    <div className="security-dashboard">
      <header className="security-header">
        <h1>SureID - Security Agencies Interface</h1>
      </header>
      <nav className="security-nav">
        <NavLink 
          to="/security/current" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          Current Alerts
        </NavLink>
        <NavLink 
          to="/security/resolved" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          Resolved Cases
        </NavLink>
        <NavLink 
          to="/security/audit" 
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          Audit Logs
        </NavLink>
      </nav>
      <div className="security-content">
        <h2>Current Alerts</h2>
        {alerts.length > 0 ? (
          <table className="alert-table">
            <thead>
              <tr>
                <th>Guest Friendly ID</th>
                <th>Check-In Time</th>
                <th>Alert</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((record) => (
                <tr key={record.id}>
                  <td>{record.guest_id}</td>
                  <td>{new Date(record.check_in_time).toLocaleString()}</td>
                  <td>{record.alert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No current alerts.</p>
        )}
      </div>
      <footer className="security-footer">
        <p>&copy; 2025 SureID Security. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default SecurityDashboard;
