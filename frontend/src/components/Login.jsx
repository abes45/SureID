import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send login request to the backend
      const response = await axios.post(
        'http://localhost:8000/api/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = response.data;
      
      // Store token and role in localStorage
      localStorage.setItem("xAuthToken", data.token);
      localStorage.setItem("userRole", data.user.role);
      
      // Update global Axios default header immediately
      axios.defaults.headers.common["X-Auth-Token"] = data.token;
      
      // Navigate based on user role
      if (data.user.role === 'provider') {
        navigate('/provider');
      } else if (data.user.role === 'security') {
        navigate('/security');
      } else if (data.user.role === 'admin') {
        navigate('/admin/users');
      } else {
        navigate('/login');
      }
    } catch (error) {
      setErrorMsg("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to SureID</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
