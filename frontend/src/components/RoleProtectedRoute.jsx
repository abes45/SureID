import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem("userRole");
  // If no role is found or the user role is not allowed, redirect to login.
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RoleProtectedRoute;
