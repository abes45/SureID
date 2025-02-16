import React, { useState } from 'react';
import axios from 'axios';
import './ManualSearch.css';

function ManualSearch() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [flagStatus, setFlagStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [newGuest, setNewGuest] = useState({
    name: '',
    id_number: '',
    document_type: 'NIN'
  });
  const [createMessage, setCreateMessage] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query.');
      return;
    }
    try {
      const response = await axios.get(`${backendUrl}/api/guests/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching guest:', error);
    }
  };

  const selectGuest = (guest) => {
    setSelectedGuest(guest);
    setFlagStatus(guest.flagged || false);
    setUpdateMessage('');
  };

  const updateFlag = async () => {
    if (!selectedGuest) {
      alert('Please select a guest first.');
      return;
    }
    try {
      const response = await axios.put(`${backendUrl}/api/guests/${selectedGuest.id}/flag`, { flagged: flagStatus });
      setUpdateMessage(`Guest ${response.data.name} flag status updated to ${response.data.flagged}`);
      setSelectedGuest(response.data);
    } catch (error) {
      console.error('Error updating flag:', error);
      setUpdateMessage('Error updating flag status');
    }
  };

  const createGuest = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/guests`, newGuest);
      setCreateMessage(`Guest ${response.data.name} created with friendly ID ${response.data.friendly_id}`);
      setNewGuest({ name: '', id_number: '', document_type: 'NIN' });
    } catch (error) {
      console.error('Error creating guest:', error);
      setCreateMessage('Error creating guest');
    }
  };

  return (
    <div className="manual-search-container">
      <h2>Manual Guest Search & Flagging</h2>
      
      <div className="search-form">
        <h3>Search Guest</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter guest name or ID"
          className="input"
        />
        <button className="button" onClick={handleSearch}>Search</button>
        <div className="results">
          {searchResults.length > 0 ? (
            <ul className="result-list">
              {searchResults.map(guest => (
                <li key={guest.id} onClick={() => selectGuest(guest)} className="result-item">
                  {guest.name} - {guest.friendly_id} - {guest.id_number} - {guest.document_type} {guest.flagged ? "(Flagged)" : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>

      {selectedGuest && (
        <div className="flag-form">
          <h3>Update Flag for Selected Guest</h3>
          <p>
            Guest: {selectedGuest.name} (Friendly ID: {selectedGuest.friendly_id})
          </p>
          <label>
            Flag as Suspicious:
            <input
              type="checkbox"
              checked={flagStatus}
              onChange={(e) => setFlagStatus(e.target.checked)}
            />
          </label>
          <button className="button" onClick={updateFlag}>Update Flag</button>
          {updateMessage && <p className="message">{updateMessage}</p>}
        </div>
      )}

      <hr />

      <div className="create-guest-form">
        <h3>Create New Guest</h3>
        <label>
          Name:
          <input
            type="text"
            name="username"
            className="input"
            value={newGuest.name}
            onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
          />
        </label>
        <label>
          ID Number:
          <input
            type="text"
            name="id_number"
            className="input"
            value={newGuest.id_number}
            onChange={(e) => setNewGuest({ ...newGuest, id_number: e.target.value })}
          />
        </label>
        <label>
          Document Type:
          <select
            name="document_type"
            className="input"
            value={newGuest.document_type}
            onChange={(e) => setNewGuest({ ...newGuest, document_type: e.target.value })}
          >
            <option value="Driver Licence">Driver Licence</option>
            <option value="NIN">NIN</option>
            <option value="Voters Card">Voters Card</option>
            <option value="International Passport">International Passport</option>
          </select>
        </label>
        <button className="button" onClick={createGuest}>Create Guest</button>
        {createMessage && <p className="message">{createMessage}</p>}
      </div>
    </div>
  );
}

export default ManualSearch;
