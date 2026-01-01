import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  // If no user data exists, we need to redirect
  if (!userRole || !userName) {
    // If they were trying to reach the Admin area, send them to /admin
    if (allowedRole === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // Otherwise, send them to the standard login
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in but has the WRONG role
  if (allowedRole && userRole !== allowedRole) {
    if (allowedRole === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;