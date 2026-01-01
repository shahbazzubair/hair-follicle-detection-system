import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../features/auth/Login';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check session on load
    const role = localStorage.getItem('userRole');
    
    // If user is already authenticated, don't show login page
    if (role === 'patient') {
      navigate('/patient-dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ 
      backgroundColor: '#f0f7ff', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Login />
    </div>
  );
};

export default LoginPage;