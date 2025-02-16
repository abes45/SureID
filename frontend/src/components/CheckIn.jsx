import React, { useState } from 'react';
import axios from 'axios';
import './CheckIn.css';

function CheckIn() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  // States for extraction and verification
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  // States for guest lookup/creation and check-in
  const [guestExists, setGuestExists] = useState(false);
  const [createOption, setCreateOption] = useState(false);
  const [checkinGuestId, setCheckinGuestId] = useState('');
  const [checkinResponse, setCheckinResponse] = useState(null);
  const [securityAlert, setSecurityAlert] = useState(false);

  const documentTypes = [
    "Driver Licence",
    "NIN",
    "Voters Card",
    "International Passport"
  ];

  // Handle file selection and reset process
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    resetProcess();
  };

  const resetProcess = () => {
    setExtractedData(null);
    setEditedData(null);
    setVerificationResult(null);
    setGuestExists(false);
    setCreateOption(false);
    setCheckinGuestId('');
    setCheckinResponse(null);
    setSecurityAlert(false);
  };

  // Step 1: Extract data using OCR simulation
  const extractIdData = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${backendUrl}/api/extract-id`, formData);
      setExtractedData(response.data.extracted_data);
      setEditedData(response.data.extracted_data);
    } catch (error) {
      console.error("Error extracting data:", error);
    }
  };

  // Step 2: Verify data and check if guest exists
  const verifyData = async () => {
    if (!editedData) {
      alert("No data to verify.");
      return;
    }
    try {
      const verifyResponse = await axios.post(`${backendUrl}/api/verify-id`, editedData);
      setVerificationResult(verifyResponse.data.verification);
      // Search for guest by name (and matching id_number)
      const searchResponse = await axios.get(
        `${backendUrl}/api/guests/search?q=${encodeURIComponent(editedData.name)}`
      );
      const found = searchResponse.data.find(g => g.id_number === editedData.id_number);
      if (found) {
        setGuestExists(true);
        setCheckinGuestId(found.friendly_id);
        if (found.flagged) {
          setSecurityAlert(true);
        }
      } else {
        setGuestExists(false);
        setCreateOption(true);
      }
    } catch (error) {
      console.error("Error verifying data:", error);
    }
  };

  // Create guest if not found
  const createGuest = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/guests`, editedData);
      setCheckinGuestId(response.data.friendly_id);
      setCreateOption(false);
      setGuestExists(true);
    } catch (error) {
      console.error("Error creating guest:", error);
    }
  };

  // Confirm check-in
  const checkInGuest = async () => {
    if (!checkinGuestId.trim()) {
      alert("Guest ID is required for check-in.");
      return;
    }
    try {
      const payload = { guest_id: checkinGuestId };
      const response = await axios.post(`${backendUrl}/api/checkin`, payload);
      setCheckinResponse(response.data);
      if (response.data.alert) {
        setSecurityAlert(true);
      }
    } catch (error) {
      console.error("Error checking in guest:", error);
    }
  };

  return (
    <div className="checkin-container">
      <h2>Check-In</h2>
      <button className="button" onClick={resetProcess} disabled={securityAlert}>
        Restart Check-In Process
      </button>
      <div className="section">
        <h3>Step 1: Upload ID and Extract Data</h3>
        <input type="file" accept="image/*" className="input" onChange={handleFileChange} />
        <button className="button" onClick={extractIdData}>Extract Data</button>
        {extractedData && (
          <div className="edit-section">
            <h4>Extracted Data (Editable):</h4>
            <label>
              Name:
              <input 
                type="text"
                className="input"
                value={editedData.name}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
              />
            </label>
            <label>
              ID Number:
              <input 
                type="text"
                className="input"
                value={editedData.id_number}
                onChange={(e) => setEditedData({ ...editedData, id_number: e.target.value })}
              />
            </label>
            <label>
              Document Type:
              <select
                className="input"
                value={editedData.document_type}
                onChange={(e) => setEditedData({ ...editedData, document_type: e.target.value })}
              >
                {documentTypes.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <button className="button" onClick={verifyData}>Verify Data</button>
          </div>
        )}
        {verificationResult && (
          <div className="result-section">
            <h4>Verification Result:</h4>
            <p><strong>Status:</strong> {verificationResult.verified ? 'Verified' : 'Not Verified'}</p>
            <p><strong>Details:</strong> {verificationResult.verification_details}</p>
          </div>
        )}
      </div>
      <div className="section">
        <h3>Step 2: Guest Check-In</h3>
        {createOption && (
          <div>
            <p>No matching guest found in the system.</p>
            <button className="button" onClick={createGuest}>Create Guest</button>
          </div>
        )}
        {guestExists && (
          <div>
            <p>Guest Friendly ID: <strong>{checkinGuestId}</strong></p>
            {securityAlert && <p style={{ color: 'red' }}><strong>Security Alert:</strong> This guest is flagged as suspicious.</p>}
            <button className="button" onClick={checkInGuest}>Confirm Check-In</button>
            {checkinResponse && (
              <div className="result-section">
                <h4>Check-In Response:</h4>
                <p><strong>Guest ID:</strong> {checkinResponse.guest_id}</p>
                {checkinResponse.alert && <p style={{ color: 'red' }}><strong>Alert:</strong> {checkinResponse.alert}</p>}
                <p><strong>Check-In Time:</strong> {new Date(checkinResponse.check_in_time).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckIn;
