// src/components/NavigationBar.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NavigationBar = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
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
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        localStorage.removeItem('token');
        navigate('/login');
        console.error('Server logout failed, but local logout completed');
      }
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/login');
      console.error('Error during logout:', error);
    }
  };

  const userRole = getUserRole();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkStyle = (path) => ({
    color: 'var(--nav-text)',
    textDecoration: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    backgroundColor: isActive(path) ? 'var(--nav-active)' : 'transparent',
    color: isActive(path) ? 'white' : 'var(--nav-text)',
    fontWeight: isActive(path) ? '600' : '500',
    fontSize: '0.95rem',
    letterSpacing: '0.3px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    '&:hover': {
      backgroundColor: isActive(path) ? 'var(--nav-active)' : 'var(--nav-hover)',
      transform: 'translateY(-1px)'
    }
  });

  return (
    <nav style={{
      backgroundColor: 'var(--nav-bg)',
      color: 'var(--nav-text)',
      padding: '1rem 2rem',
      boxShadow: '0 2px 8px var(--shadow-color)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          <Link to="/home" style={getLinkStyle('/home')}>
            <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>🏦</span>
            Home
          </Link>
          {token && userRole !== 'computer_operator' && (
            <>
              <Link to="/mytransactions" style={getLinkStyle('/mytransactions')}>
                <span style={{ fontSize: '1.2rem' }}>📋</span>
                My Transactions
              </Link>
              <Link to="/transactions" style={getLinkStyle('/transactions')}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                All Transactions
              </Link>
            </>
          )}
        </div>
        <div>
          {token ? (
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--nav-text)',
                cursor: 'pointer',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                '&:hover': {
                  backgroundColor: 'var(--nav-hover)',
                  transform: 'translateY(-1px)'
                }
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--nav-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🚪</span>
              Logout
            </button>
          ) : (
            <Link to="/login" style={getLinkStyle('/login')}>
              <span style={{ fontSize: '1.2rem' }}>🔑</span>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
