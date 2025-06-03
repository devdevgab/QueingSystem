// src/components/NavigationBar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NavigationBar = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const getUserRole = () => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://192.168.10.245:8080/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies in the request
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('token');
        // Redirect to login page
        navigate('/login');
      } else {
        // Even if the server request fails, we'll still log the user out locally
        localStorage.removeItem('token');
        navigate('/login');
        console.error('Server logout failed, but local logout completed');
      }
    } catch (error) {
      // Even if there's an error, we'll still log the user out locally
      localStorage.removeItem('token');
      navigate('/login');
      console.error('Error during logout:', error);
    }
  };

  const userRole = getUserRole();

  return (
    <nav style={{
      backgroundColor: 'var(--nav-bg)',
      color: 'var(--nav-text)',
      padding: '1rem',
      boxShadow: '0 2px 4px var(--shadow-color)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" style={{ color: 'var(--nav-text)', textDecoration: 'none' }}>Home</Link>
          {token && userRole !== 'computer_operator' && (
            <>
              <Link to="/mytransactions" style={{ color: 'var(--nav-text)', textDecoration: 'none' }}>My Transactions</Link>
              <Link to="/transactions" style={{ color: 'var(--nav-text)', textDecoration: 'none' }}>All Transactions</Link>
            </>
          )}
        </div>

        <div>
          {token ? (
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--nav-text)',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" style={{ color: 'var(--nav-text)', textDecoration: 'none' }}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
