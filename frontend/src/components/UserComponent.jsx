import React, { useState } from 'react';
import axios from 'axios';

const EmployeeManagement = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldError, setFieldError] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    const errors = {};
    const { username, email, password, firstName, lastName, role } = formData;

    if (!username) errors.username = 'Username is required';
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email format is invalid';
    }
    if (!password) errors.password = 'Password is required';
    if (!firstName) errors.firstName = 'First Name is required';
    if (!lastName) errors.lastName = 'Last Name is required';
    if (!role || !['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'].includes(role)) {
      errors.role = 'Valid role is required';
    }

    setFieldError(errors);

    return Object.keys(errors).length === 0;
  };

  const createEmployee = async () => {
    setError('');
    setSuccess('');
    setFieldError({});

    if (!validateFields()) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/admin/user/create', formData);
      setSuccess(response.data.message);
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Internal Server Error');
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Restaurant Management System</h1>

      {/* Error or Success Message */}
      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}

      <div style={cardStyle}>
        {/* Form Fields */}
        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          style={inputStyle}
        />
        {fieldError.username && <div style={errorFieldStyle}>{fieldError.username}</div>}
        
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={inputStyle}
        />
        {fieldError.email && <div style={errorFieldStyle}>{fieldError.email}</div>}

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={inputStyle}
        />
        {fieldError.password && <div style={errorFieldStyle}>{fieldError.password}</div>}

        <input
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          style={inputStyle}
        />
        {fieldError.firstName && <div style={errorFieldStyle}>{fieldError.firstName}</div>}

        <input
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          style={inputStyle}
        />
        {fieldError.lastName && <div style={errorFieldStyle}>{fieldError.lastName}</div>}

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Select Role</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="STAFF">Staff</option>
          <option value="CUSTOMER">Customer</option>
        </select>
        {fieldError.role && <div style={errorFieldStyle}>{fieldError.role}</div>}

        <button type="button" onClick={createEmployee} style={buttonStyle}>
          Create Employee
        </button>
      </div>

      <button onClick={() => window.location.href = '/'} style={homeButtonStyle}>
        Admin Panel
      </button>
    </div>
  );
};

// Styles
const containerStyle = {
  backgroundColor: '#1a1a1a',
  color: '#f1f1f1',
  padding: '40px 20px',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const headingStyle = {
  textAlign: 'center',
  marginBottom: '20px',
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#f39c12',
  cursor: 'pointer',
  transition: 'color 0.3s ease',
};

const cardStyle = {
  backgroundColor: '#333',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  maxWidth: '500px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
};

const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #444',
  backgroundColor: '#222',
  color: '#f1f1f1',
  outline: 'none',
};

const buttonStyle = {
  backgroundColor: '#e74c3c',  // Changed to red
  color: '#fff',
  border: 'none',
  padding: '12px',
  borderRadius: '5px',
  cursor: 'pointer',
  textTransform: 'uppercase',
  fontWeight: 'bold',
};

const errorStyle = {
  color: '#e74c3c',
  backgroundColor: '#f2d7d5',
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '15px',
  textAlign: 'center',
  width: '100%',
  maxWidth: '500px',
};

const successStyle = {
  color: '#2ecc71',
  backgroundColor: '#a9dfbf',
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '15px',
  textAlign: 'center',
  width: '100%',
  maxWidth: '500px',
};

const errorFieldStyle = {
  color: '#e74c3c',
  fontSize: '0.9rem',
  marginTop: '5px',
};

const homeButtonStyle = {
  backgroundColor: '#2980b9',
  color: '#fff',
  border: 'none',
  padding: '12px',
  borderRadius: '5px',
  cursor: 'pointer',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  marginTop: '20px',
};

export default EmployeeManagement;
