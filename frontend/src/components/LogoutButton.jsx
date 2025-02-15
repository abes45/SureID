import React from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("xAuthToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;
