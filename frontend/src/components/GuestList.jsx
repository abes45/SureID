import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './GuestList.css';

function GuestList() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const [guests, setGuests] = useState([]);

  const fetchGuests = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/guests`);
      setGuests(response.data);
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  return (
    <div className="guestlist-container">
      <h2>Guest List</h2>
      <ul className="guest-list">
        {guests.length > 0 ? (
          guests.map((guest) => (
            <li key={guest.id} className="guest-list-item">
              <strong>{guest.name}</strong> - {guest.friendly_id} ({guest.document_type})
              {guest.flagged && <span className="flagged"> [Flagged]</span>}
            </li>
          ))
        ) : (
          <li className="guest-list-item">No guests found.</li>
        )}
      </ul>
    </div>
  );
}

export default GuestList;
