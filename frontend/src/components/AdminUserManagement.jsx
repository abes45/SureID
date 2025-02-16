import React, { useState } from 'react';
import axios from 'axios';
import './AdminUserManagement.css';

function AdminUserManagement() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'provider'
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}/api/users`, newUser);
      setMessage(`User ${response.data.username} created successfully!`);
      setNewUser({ username: '', password: '', role: 'provider' });
    } catch (error) {
      console.error("Error creating user:", error);
      const errDetail = error.response?.data?.detail || "Error creating user.";
      setMessage(errDetail);
    }
  };

  return (
    <div className="admin-user-management">
      <h2>Add New User</h2>
      <form onSubmit={createUser} className="user-form">
        <label>
          Username:
          <input 
            type="text" 
            name="username"
            value={newUser.username}
            onChange={handleChange}
            required 
          />
        </label>
        <label>
          Password:
          <input 
            type="password" 
            name="password"
            value={newUser.password}
            onChange={handleChange}
            required 
          />
        </label>
        <label>
          Role:
          <select 
            name="role"
            value={newUser.role}
            onChange={handleChange}
          >
            <option value="provider">Provider</option>
            <option value="security">Security</option>
          </select>
        </label>
        <button type="submit">Create User</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default AdminUserManagement;
