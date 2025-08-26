import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ComputerOperatorPageStyles.css';

const API_URL = 'http://192.168.10.199:8080';

const ComputerOperatorPage = () => {
    const [activeTab, setActiveTab] = useState('withdrawal');
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        AccountNumber: '',
        Name: '',
        TransactionType: 'Withdrawal',
        Amount: '',
        AccountType: '',
        DepositType: '',
        PaymentType: '',
        DisbursementType: ''
    });
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            TransactionType: activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
        }));
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Check if name appears to be a number
            if (!isNaN(formData.Name) && Number.isInteger(Number(formData.Name))) {
                const isNumber = window.confirm("The name appears to be a number. Do you want to proceed?");
                if (!isNumber) {
                    showToast("Transaction cancelled", "error");
                    return;
                }
            }

            const transactionData = {
                AccountNumber: formData.AccountNumber,
                Name: formData.Name,
                Amount: formData.Amount,
                AccountType: formData.AccountType,
                TransactionType: activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
            };

            // Add type-specific fields
            if (activeTab === 'deposit') {
                transactionData.DepositType = formData.DepositType;
            } else if (activeTab === 'payment') {
                transactionData.PaymentType = formData.PaymentType;
            } else if (activeTab === 'disbursement') {
                transactionData.DisbursementType = formData.DisbursementType;
            }

            console.log('Sending transaction data:', transactionData);

            const endpoint = activeTab === 'withdrawal' ? 'create-withdrawal' : 'create-transaction';
            const response = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transactionData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error response:', errorData);
                throw new Error(errorData?.message || `Failed to create ${activeTab}: ${response.status}`);
            }

            const data = await response.json();
            console.log('Success response:', data);

            showToast(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} transaction created successfully`, 'success');

            // Reset form
            setFormData({
                AccountNumber: '',
                Name: '',
                TransactionType: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
                Amount: '',
                AccountType: '',
                DepositType: '',
                PaymentType: '',
                DisbursementType: ''
            });
        } catch (error) {
            console.error(`Error creating ${activeTab}:`, error);
            showToast(error.message || `Failed to create ${activeTab}`, 'error');
        }
    };

    const renderTransactionForm = () => {
        return (
            <form onSubmit={handleTransactionSubmit} className="transaction-form">
                <div className="form-group">
                    <label htmlFor="AccountNumber">Account Number</label>
                    <input
                        type="text"
                        id="AccountNumber"
                        name="AccountNumber"
                        value={formData.AccountNumber}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="Name">Customer Name</label>
                    <input
                        type="text"
                        id="Name"
                        name="Name"
                        value={formData.Name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="Amount">Amount</label>
                    <input
                        type="number"
                        id="Amount"
                        name="Amount"
                        value={formData.Amount}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="AccountType">Account Type</label>
                    <select
                        id="AccountType"
                        name="AccountType"
                        value={formData.AccountType}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Account Type</option>
                        <option value="Savings">Savings</option>
                        <option value="Checking">Current</option>

                    </select>
                </div>

                {activeTab === 'deposit' && (
                    <div className="form-group">
                        <label htmlFor="DepositType">Deposit Type</label>
                        <select
                            id="DepositType"
                            name="DepositType"
                            value={formData.DepositType}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Deposit Type</option>
                            <option value="Cash">Cash</option>
                            <option value="Check">Check</option>
                            <option value="Transfer">Transfer</option>
                            <option value="Transfer">ATM-Deposit</option>
                        </select>
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div className="form-group">
                        <label htmlFor="PaymentType">Payment Type</label>
                        <select
                            id="PaymentType"
                            name="PaymentType"
                            value={formData.PaymentType}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Payment Type</option>
                            <option value="Bill">Bill</option>
                            <option value="Loan">Loan</option>
                            <option value="Credit Card">Credit Card</option>
                        </select>
                    </div>
                )}

                {activeTab === 'disbursement' && (
                    <div className="form-group">
                        <label htmlFor="DisbursementType">Disbursement Type</label>
                        <select
                            id="DisbursementType"
                            name="DisbursementType"
                            value={formData.DisbursementType}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Disbursement Type</option>
                            <option value="Salary">Salary</option>
                            <option value="Loan">Loan</option>
                            <option value="Refund">Refund</option>
                        </select>
                    </div>
                )}

                <button type="submit" className="submit-button">
                    Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
            </form>
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
                <h2>Create New Transaction</h2>
            </div>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'withdrawal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('withdrawal')}
                >
                    Create Withdrawal
                </button>
                <button
                    className={`tab-button ${activeTab === 'deposit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('deposit')}
                >
                    Create Deposit
                </button>

                {/* <button
                    className={`tab-button ${activeTab === 'disbursement' ? 'active' : ''}`}
                    onClick={() => setActiveTab('disbursement')}
                >
                    Create Disbursement
                </button> */}

                <button
                    className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payment')}
                >
                    Create Payment
                </button>
            </div>

            <div className="form-container">
                {renderTransactionForm()}
            </div>
        </div>
    );
};

export default ComputerOperatorPage; 