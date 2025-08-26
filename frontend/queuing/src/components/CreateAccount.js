import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import LoadingScreen from './LoadingScreen';
import '../css/CreateAccountStyles.css';

const CreateAccount = () => {
    const [formData, setFormData] = useState({
        Name: '',
        LastName: '',
        Username: '',
        Password: '',
        TellerNumber: ''
    });
    const [adminCredentials, setAdminCredentials] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [adminErrors, setAdminErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [adminLoading, setAdminLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleAdminInputChange = (e) => {
        const { name, value } = e.target;
        setAdminCredentials(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (adminErrors[name]) {
            setAdminErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setAdminErrors({});
        setAdminLoading(true);

        try {
            const response = await fetch('http://192.168.10.199:8080/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Username: adminCredentials.username,
                    Password: adminCredentials.password
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setIsAdminAuthenticated(true);
                setAdminLoading(false);
            } else {
                setAdminLoading(false);
                setAdminErrors({ general: data.message || 'Admin authentication failed' });
            }
        } catch (err) {
            setAdminLoading(false);
            setAdminErrors({ general: 'An error occurred during admin authentication' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.Name.trim()) {
            newErrors.Name = 'First name is required';
        }
        if (!formData.LastName.trim()) {
            newErrors.LastName = 'Last name is required';
        }
        if (!formData.Username.trim()) {
            newErrors.Username = 'Username is required';
        } else if (formData.Username.length < 3) {
            newErrors.Username = 'Username must be at least 3 characters';
        }
        if (!formData.Password) {
            newErrors.Password = 'Password is required';
        } else if (formData.Password.length < 6) {
            newErrors.Password = 'Password must be at least 6 characters';
        }
        if (!formData.TellerNumber.trim()) {
            newErrors.TellerNumber = 'TellerNumber is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        setSuccess('');
        try {
            const response = await fetch('http://192.168.10.199:8080/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('Account created successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setErrors({ general: data.message || 'Failed to create account' });
                setLoading(false);
            }
        } catch (err) {
            setErrors({ general: 'An error occurred while creating your account' });
            setLoading(false);
        }
    };

    const handleLoadingComplete = () => {
        setLoading(false);
    };

    if (loading) {
        return <LoadingScreen onFadeComplete={handleLoadingComplete} />;
    }

    // Show admin login if not authenticated
    if (!isAdminAuthenticated) {
        return (
            <div className="create-account-container">
                <div className="create-account-box admin-login-box">
                    <h2>Admin Authentication Required</h2>
                    <p className="admin-subtitle">Please login as an administrator to create new accounts.</p>

                    <form onSubmit={handleAdminLogin}>
                        <div className="form-group">
                            <label htmlFor="adminUsername">Admin Username</label>
                            <input
                                type="text"
                                id="adminUsername"
                                name="username"
                                value={adminCredentials.username}
                                onChange={handleAdminInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="adminPassword">Admin Password</label>
                            <input
                                type="password"
                                id="adminPassword"
                                name="password"
                                value={adminCredentials.password}
                                onChange={handleAdminInputChange}
                                required
                            />
                        </div>

                        {adminErrors.general && <div className="error-message">{adminErrors.general}</div>}

                        <button type="submit" className="create-account-button" disabled={adminLoading}>
                            {adminLoading ? 'Authenticating...' : 'Login as Admin'}
                        </button>
                    </form>

                    <div className="login-link">
                        <span onClick={() => navigate('/login')}>Back to Login</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="create-account-container">
            <div className="create-account-box">
                <div className="admin-header">
                    <h2>Create Account</h2>
                    <button
                        className="logout-admin-btn"
                        onClick={() => setIsAdminAuthenticated(false)}
                        title="Logout as Admin"
                    >
                        Logout Admin
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="Name">First Name</label>
                            <input
                                type="text"
                                id="Name"
                                name="Name"
                                value={formData.Name}
                                onChange={handleInputChange}
                                className={errors.Name ? 'error' : ''}
                                required
                            />
                            {errors.Name && <span className="field-error">{errors.Name}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="LastName">Last Name</label>
                            <input
                                type="text"
                                id="LastName"
                                name="LastName"
                                value={formData.LastName}
                                onChange={handleInputChange}
                                className={errors.LastName ? 'error' : ''}
                                required
                            />
                            {errors.LastName && <span className="field-error">{errors.LastName}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="Username">Username</label>
                        <input
                            type="text"
                            id="Username"
                            name="Username"
                            value={formData.Username}
                            onChange={handleInputChange}
                            className={errors.Username ? 'error' : ''}
                            required
                        />
                        {errors.Username && <span className="field-error">{errors.Username}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="Password">Password</label>
                        <input
                            type="password"
                            id="Password"
                            name="Password"
                            value={formData.Password}
                            onChange={handleInputChange}
                            className={errors.Password ? 'error' : ''}
                            required
                        />
                        {errors.Password && <span className="field-error">{errors.Password}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="TellerNumber">Teller Number</label>
                        <input
                            type="text"
                            id="TellerNumber"
                            name="TellerNumber"
                            value={formData.TellerNumber}
                            onChange={handleInputChange}
                            className={errors.TellerNumber ? 'error' : ''}
                            required
                        />
                        {errors.TellerNumber && <span className="field-error">{errors.TellerNumber}</span>}
                    </div>
                    {errors.general && <div className="error-message">{errors.general}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <button type="submit" className="create-account-button">
                        Create Account
                    </button>
                </form>
                <div className="login-link">
                    Already have an account? <span onClick={() => navigate('/login')}>Login here</span>
                </div>
            </div>
        </div>
    );
};

export default CreateAccount;
