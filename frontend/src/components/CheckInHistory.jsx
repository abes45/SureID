import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './CheckInHistory.css';

function CheckInHistory() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const [checkins, setCheckins] = useState([]);

  const fetchCheckins = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/checkins`);
      setCheckins(response.data);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  return (
    <div className="checkinhistory-container">
      <h2>Check-In History</h2>
      <table className="history-table">
        <thead>
          <tr>
            <th>Date/Time</th>
            <th>Guest ID</th>
            <th>Flagged</th>
            <th>Alert</th>
          </tr>
        </thead>
        <tbody>
          {checkins.length > 0 ? (
            checkins.map((record) => (
              <tr key={record.id}>
                <td>{new Date(record.check_in_time).toLocaleString()}</td>
                <td>{record.guest_id}</td>
                <td>{record.flagged ? 'Yes' : 'No'}</td>
                <td>{record.alert || '-'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>No check-in records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CheckInHistory;
