import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios';
import './index.css';

// Set a global default header for Axios if the token is available
const token = localStorage.getItem("xAuthToken");
if (token) {
  axios.defaults.headers.common["X-Auth-Token"] = token;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
