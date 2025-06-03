import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../css/HomeStyles.css';
import myTransactionsIcon from '../assets/icons/my-transactions.svg';
import transactionsIcon from '../assets/icons/transactions.svg';

const Home = () => {
  const { isDarkMode } = useTheme();

  const getUserRole = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const userRole = getUserRole();

  return (
    <div className="home-container">
      <h1 className="home-title">Queuing System</h1>

      <div className="home-cards-container">
        {userRole !== 'computer_operator' ? (
          <>
            <Link to="/mytransactions" className="home-card">
              <img src={myTransactionsIcon} alt="My Transactions" className="home-card-icon" />
              <h2>My Transactions</h2>
              <p>View and manage your transactions</p>
            </Link>

            <Link to="/transactions" className="home-card">
              <img src={transactionsIcon} alt="All Transactions" className="home-card-icon" />
              <h2>All Transactions</h2>
              <p>View all system transactions</p>
            </Link>
          </>
        ) : (
          <Link to="/computer-operator" className="home-card">
            <img src={transactionsIcon} alt="Computer Operator" className="home-card-icon" />
            <h2>Computer Operator</h2>
            <p>Create and manage transactions</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
