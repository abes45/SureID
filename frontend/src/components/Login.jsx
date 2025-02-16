import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('provider'); // role can be used for UI hints if needed

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      const data = await response.json();
      // Save token and user role in localStorage
      localStorage.setItem("xAuthToken", data.token);
      localStorage.setItem("userRole", data.user.role);
      // Also update the global Axios default header
      // (Alternatively, a full page reload will pick it up from index.js)
      // axios.defaults.headers.common["X-Auth-Token"] = data.token;
      if (data.user.role === 'provider') {
        navigate("/provider");
      } else if (data.user.role === 'security') {
        navigate("/security");
      } else if (data.user.role === 'admin') {
        navigate("/admin/users");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert("Login failed. Check credentials.");
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome to SureID</h2>
      <form onSubmit={handleLogin} className="login-form">
        <label>
          Username:
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
        </label>
        <label>
          Password:
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </label>
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="provider">Provider</option>
            <option value="security">Security</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
