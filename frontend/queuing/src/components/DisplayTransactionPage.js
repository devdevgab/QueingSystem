import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../css/MyTransactionPageStyles.css';

const DisplayTransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const { isDarkMode } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://192.168.10.199:8080/display-transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        const transactionsArray = Array.isArray(data) ? data : data.transactions || [];
        setTransactions(transactionsArray);
        setFilteredTransactions(transactionsArray);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        alert('Failed to load transactions');
        setTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Add filter effect
  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(transactions.filter(t => t.Status === statusFilter));
    }
  }, [statusFilter, transactions]);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
  };

  const getStatusClass = (status) => {
    return ''; // Remove status class styling
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status;
  };

  return (
    <div className="container">
      <h2 style={{
        color: 'var(--text-primary)',
        marginBottom: '1.5rem'
      }}>All Transactions</h2>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-button ${statusFilter === 'All' ? 'active' : ''}`}
          onClick={() => handleFilterChange('All')}
        >
          All
        </button>
        <button
          className={`filter-button ${statusFilter === 'Open' ? 'active' : ''}`}
          onClick={() => handleFilterChange('Open')}
        >
          Open
        </button>
        <button
          className={`filter-button ${statusFilter === 'In Progress' ? 'active' : ''}`}
          onClick={() => handleFilterChange('In Progress')}
        >
          In Progress
        </button>
        <button
          className={`filter-button ${statusFilter === 'Closed' ? 'active' : ''}`}
          onClick={() => handleFilterChange('Closed')}
        >
          Closed
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading transactions...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">No transactions found.</div>
      ) : (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px var(--shadow-color)'
        }}>
          <table className="transaction-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Account Number</th>
                <th>Transaction Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn, index) => (
                <tr key={index} style={{
                  backgroundColor: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  transition: 'background-color 0.3s ease'
                }}>
                  <td>{txn.ID || 'N/A'}</td>
                  <td>{txn.AccountNumber || 'N/A'}</td>
                  <td>{txn.TransactionType || 'N/A'}</td>
                  <td>{formatDate(txn.created)}</td>
                  <td>{txn.Amount || 'N/A'}</td>
                  <td>{formatStatus(txn.Status) === 'Unknown' ? 'Open' : formatStatus(txn.Status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisplayTransactionPage;
