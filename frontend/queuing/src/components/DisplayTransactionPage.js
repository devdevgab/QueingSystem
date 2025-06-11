import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const DisplayTransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Convert SQL Server datetime to ISO format
    const date = new Date(dateString.replace(' ', 'T') + 'Z');
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://192.168.10.245:8080/display-transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });


        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        // Ensure we're setting an array of transactions
        setTransactions(Array.isArray(data) ? data : data.transactions || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        alert('Failed to load transactions');
        setTransactions([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);



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

      {loading ? (
        <div className="loading-state">Loading transactions...</div>
      ) : transactions.length === 0 ? (
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
                {/* <th>Teller Number</th> */}
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(transactions) && transactions.map((txn, index) => (
                <tr key={index} style={{
                  backgroundColor: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  transition: 'background-color 0.3s ease'
                }}>
                  <td>{txn.ID || 'N/A'}</td>
                  <td>{txn.AccountNumber || 'N/A'}</td>
                  <td>{txn.TransactionType || 'N/A'}</td>
                  <td>{txn.created ? (() => {
                    const date = new Date(txn.created);
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
                  })() : 'N/A'}</td>

                  {/* <td>{txn.TellerNumber || 'N/A'}</td> */}
                  <td>{txn.Amount || 'N/A'}</td>
                  {/* <td>{formatStatus(txn.Status) || 'Open'}</td> */}
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
