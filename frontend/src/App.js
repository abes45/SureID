import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [guests, setGuests] = useState([]);
  const [newGuest, setNewGuest] = useState({ name: '', id_number: '', document_type: '' });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/guests`);
      setGuests(response.data);
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewGuest({ ...newGuest, [e.target.name]: e.target.value });
  };

  const addGuest = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/guests`, newGuest);
      setGuests([...guests, response.data]);
      setNewGuest({ name: '', id_number: '', document_type: '' });
    } catch (error) {
      console.error('Error adding guest:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>SureID Guest Verification</h1>
      <h2>Add New Guest</h2>
      <div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newGuest.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="id_number"
          placeholder="ID Number"
          value={newGuest.id_number}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="document_type"
          placeholder="Document Type"
          value={newGuest.document_type}
          onChange={handleInputChange}
        />
        <button onClick={addGuest}>Add Guest</button>
      </div>
      <h2>Guest List</h2>
      <ul>
        {guests.map((guest) => (
          <li key={guest.id}>
            {guest.name} - {guest.id_number} ({guest.document_type})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
