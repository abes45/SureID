import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './GuestList.css';

function GuestList() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch only the check-ins for the current provider (those not yet checked out)
  const fetchCheckins = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/provider/checkins`);
      setCheckins(response.data);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  const handleCheckout = async (checkinId) => {
    try {
      const response = await axios.put(`${backendUrl}/api/checkin/${checkinId}/checkout`);
      // Remove the checked-out record from the list or refresh the list
      setCheckins(prev => prev.filter(item => item.id !== checkinId));
    } catch (error) {
      console.error("Error checking out guest:", error);
      alert("Failed to check out guest.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="guestlist-container">
      <h2>My Checked-In Guests</h2>
      {checkins.length > 0 ? (
        <table className="guestlist-table">
          <thead>
            <tr>
              <th>Guest Friendly ID</th>
              <th>Check-In Time</th>
              <th>Flagged</th>
              <th>Alert</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {checkins.map((checkin) => (
              <tr key={checkin.id}>
                <td>{checkin.guest_id}</td>
                <td>{new Date(checkin.check_in_time).toLocaleString()}</td>
                <td>{checkin.flagged ? 'Yes' : 'No'}</td>
                <td>{checkin.alert || '-'}</td>
                <td>
                  <button className="checkout-button" onClick={() => handleCheckout(checkin.id)}>
                    Check Out
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No guests are currently checked in.</p>
      )}
    </div>
  );
}

export default GuestList;
