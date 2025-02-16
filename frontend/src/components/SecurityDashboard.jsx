import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import LogoutButton from './LogoutButton';
import ManualSearch from './ManualSearch';
import './SecurityDashboard.css';

function SecurityDashboard() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/alerts`);
      setAlerts(response.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="security-dashboard">
      <header className="security-header">
        <h1>SureID - Security Dashboard</h1>
        <LogoutButton />
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
        <button className="manual-search-btn" onClick={openModal}>
          Open Manual Search
        </button>
      </nav>
      <div className="security-content">
        <h2>Your Alerts</h2>
        {loading ? (
          <p>Loading alerts...</p>
        ) : alerts.length > 0 ? (
          <table className="alert-table">
            <thead>
              <tr>
                <th>Guest Friendly ID</th>
                <th>Guest Name</th>
                <th>Provider</th>
                <th>Flagged By</th>
                <th>Alert Time</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.guest_id}</td>
                  <td>{alert.guest_name}</td>
                  <td>{alert.provider_username}</td>
                  <td>{alert.flagged_by}</td>
                  <td>{new Date(alert.alert_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No alerts found.</p>
        )}
      </div>
      <footer className="security-footer">
        <p>&copy; 2025 SureID Security. All rights reserved.</p>
      </footer>

      {/* Manual Search Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeModal}>
              &times;
            </button>
            <ManualSearch onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityDashboard;
