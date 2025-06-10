import React, { useEffect, useState, useCallback } from 'react';
import '../css/MyTransactionPageStyles.css';

const API_URL = 'http://192.168.10.245:8080';
const POLLING_INTERVAL = 5000; // 5 seconds

const MyTransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [tellerNumber, setTellerNumber] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';

      switch (tellerNumber) {
        case "1":
          endpoint = '/teller-one-transactions';
          break;
        case "2":
          endpoint = '/teller-two-transactions';
          break;
        case "3":
          endpoint = '/teller-three-transactions';
          break;
        case "4":
          endpoint = '/teller-four-transactions';
          break;
        default:
          throw new Error('Invalid teller number');
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Unauthorized or failed request');
      }

      const data = await res.json();
      const hasNewTransactions = JSON.stringify(data.transactions) !== JSON.stringify(transactions);

      if (hasNewTransactions) {
        setTransactions(data.transactions || []);
        setLastUpdateTime(new Date());
        if (transactions.length > 0) {
          showToast('New transactions available', 'info');
        }
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to load transactions", 'error');
    } finally {
      setLoading(false);
    }
  }, [tellerNumber, transactions]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTellerNumber(payload.tellerNumber);
        console.log("Current teller number:", payload.tellerNumber);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (tellerNumber) {
      fetchTransactions();
      const intervalId = setInterval(fetchTransactions, POLLING_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [tellerNumber, fetchTransactions]);

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseModal = () => {
    setSelectedTransaction(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/update-transaction-status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ Status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();

      setTransactions(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.ID === id ? data.transaction : transaction
        )
      );

      showToast(`Status updated to ${newStatus} successfully`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status. Please try again.', 'error');
    }
  };

  const getStatusButtonStyle = (status) => {
    const baseStyle = {
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      margin: '0.25rem',
      transition: 'all 0.3s ease',
      fontWeight: '500'
    };

    const isSelected = selectedTransaction?.Status === status;

    switch (status) {
      case 'In Progress':
        return {
          ...baseStyle,
          backgroundColor: isSelected ? '#38a169' : '#f0fff4',
          color: isSelected ? 'white' : '#2f855a'
        };
      case 'Open':
        return {
          ...baseStyle,
          backgroundColor: isSelected ? '#f6c000' : '#fffbea',
          color: isSelected ? '#1a1a1a' : '#744210'
        };
      case 'Closed':
        return {
          ...baseStyle,
          backgroundColor: isSelected ? '#e53e3e' : '#fff5f5',
          color: isSelected ? 'white' : '#822727'
        };
      default:
        return baseStyle;
    }
  };

  const getTellerTitle = () => {
    switch (tellerNumber) {
      case "1":
        return "Teller 1 - Withdrawals & Deposits";
      case "2":
        return "Teller 2 - Collections";
      case "3":
        return "Teller 3 - Disbursements";
      case "4":
        return "Teller 4 - Vouchers";
      default:
        return "Transactions";
    }
  };

  const renderTransactionDetails = () => {
    if (!selectedTransaction) return null;

    return (
      <div className="transaction-details">
        <p><strong>Name:</strong> {selectedTransaction.Name}</p>
        <p><strong>Transaction ID:</strong> {selectedTransaction.ID}</p>
        <p><strong>Account Number:</strong> {selectedTransaction.AccountNumber}</p>
        <p><strong>Account Type:</strong> {selectedTransaction.AccountType || 'N/A'}</p>
        <p><strong>Transaction Type:</strong> {selectedTransaction.TransactionType}</p>
        <p><strong>Deposit Type:</strong> {selectedTransaction.DepositType || 'N/A'}</p>
        <p><strong>Date:</strong> {new Date(selectedTransaction.created).toLocaleString()}</p>
        <p><strong>Teller Number:</strong> {selectedTransaction.TellerNumber || 'N/A'}</p>
        <p><strong>Amount:</strong> {selectedTransaction.Amount}</p>
        <p><strong>Current Status:</strong>{' '}
          <span className={`status-badge ${selectedTransaction.Status?.toLowerCase().replace(/\s/g, '-') || 'in-progress'}`}>
            {selectedTransaction.Status || 'In Progress'}
          </span>
        </p>
      </div>
    );
  };

  return (
    <div className="container">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}
      <div className="header-section">
        <h2>{getTellerTitle()}</h2>
        {lastUpdateTime && (
          <span className="last-update">
            Last updated: {lastUpdateTime.toLocaleTimeString()}
          </span>
        )}
      </div>
      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <>
          <table className="transaction-table" border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Name</th>
                <th>Transaction Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(txn)}
                  className="clickable-row"
                >
                  <td>{txn.ID}</td>
                  <td>{txn.Name}</td>
                  <td>{txn.TransactionType}</td>
                  <td>
                    <span className={`status-badge ${txn.Status?.toLowerCase().replace(/\s/g, '-') || 'in-progress'}`}>
                      {txn.Status || 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedTransaction && (
            <div className="modal-overlay" onClick={handleOverlayClick}>
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Transaction Details</h3>
                  <button className="close-button" onClick={handleCloseModal}>×</button>
                </div>
                <div className="modal-body">
                  {renderTransactionDetails()}
                  <div className="modal-buttons">
                    <button
                      onClick={() => handleStatusUpdate(selectedTransaction.ID, 'In Progress')}
                      style={getStatusButtonStyle('In Progress')}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedTransaction.ID, 'Open')}
                      style={getStatusButtonStyle('Open')}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedTransaction.ID, 'Closed')}
                      style={getStatusButtonStyle('Closed')}
                    >
                      Closed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyTransactionPage;
