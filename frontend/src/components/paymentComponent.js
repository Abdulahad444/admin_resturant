import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function PaymentManagement() {
  const formRef = useRef(null);
  const alertRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    category: '',
    types: [],
    newCategory: ''
  });

  useEffect(() => {
    fetchPaymentMethods();
    fetchUsers();
  }, []);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/payment');
      setPaymentMethods(response.data);
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error fetching payment methods', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/admin/users/all');
      setUsers(response.data.employees);
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (e) => {
    const userId = e.target.value;
    const selectedUserData = users.find(user => user._id === userId);
    setSelectedUser(selectedUserData);
    
    if (userId) {
      await fetchTransactionHistory(userId);
    } else {
      setTransactionHistory([]);
    }
  };

// First, modify fetchTransactionHistory to log the response data
const fetchTransactionHistory = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/payment/transactionhistory', {
        userId: userId
      });
      console.log('Transaction response data:', response.data.data); // Log to see the actual data structure
      setTransactionHistory(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      showAlert(error.response?.data?.message || 'Error fetching transaction history', 'error');
      setTransactionHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? 'http://localhost:3000/payment/update' : 'http://localhost:3000/payment/create';
      const method = isEditing ? 'PUT' : 'POST';
      const submitData = {
        ...formData
      };

      if (isEditing) {
        submitData.id = editingId;
      }

      const response = await axios({
        method,
        url,
        data: submitData
      });

      const savedMethod = response.data;
      
      if (isEditing) {
        setPaymentMethods(prev => prev.map(item => item._id === editingId ? savedMethod : item));
        showAlert('Payment method updated successfully', 'success');
      } else {
        setPaymentMethods(prev => [...prev, savedMethod]);
        showAlert('Payment method created successfully', 'success');
      }
      
      resetForm();
      fetchPaymentMethods();
      scrollToAlert();
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error submitting form', 'error');
      scrollToAlert();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    
    setLoading(true);
    try {
      await axios.delete('http://localhost:3000/payment/delete', { data: { id } });
      setPaymentMethods(prev => prev.filter(item => item._id !== id));
      showAlert('Payment method deleted successfully', 'success');
      scrollToAlert();
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error deleting payment method', 'error');
      scrollToAlert();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      category: item.category,
      types: item.types,
      newCategory: ''
    });
    setIsEditing(true);
    setEditingId(item._id);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const scrollToAlert = () => {
    setTimeout(() => {
      alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      types: [],
      newCategory: ''
    });
    setIsEditing(false);
    setEditingId(null);
    setShowForm(false);
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypesChange = (e) => {
    const types = e.target.value.split(',').map(t => t.trim());
    setFormData(prev => ({ ...prev, types }));
  };
  return (
    <>
      <style>
        {`
          .gradient-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(31, 38, 49, 0.9) 0%, rgba(26, 32, 44, 0.95) 100%);
            pointer-events: none;
            z-index: -1;
            animation: gradientShift 15s ease infinite;
          }

          .payment-container {
            min-height: 100vh;
            background-color: #111827;
            padding: 32px;
            color: #ffffff;
          }

          .dashboard-header {
            background: #111827;
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 71, 87, 0.2);
            backdrop-filter: blur(8px);
            margin-bottom: 0.5rem;
          }

          .dashboard-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: #ff4757;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-align: center;
            text-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
            margin: 0;
          }

          .alert {
            margin-bottom: 24px;
            padding: 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
          }

          .alert.success { background-color: rgba(6, 78, 59, 0.5); }
          .alert.error { background-color: rgba(153, 27, 27, 0.5); }

          .user-selection-container {
            background: rgba(55, 65, 81, 0.3);
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .user-selection-title {
            color: #e5e7eb;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .user-select {
            width: 100%;
            padding: 0.75rem;
            background: rgba(31, 41, 55, 0.8);
            border: 2px solid rgba(255, 71, 87, 0.3);
            border-radius: 8px;
            color: #e5e7eb;
            font-size: 1rem;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .user-select:hover {
            border-color: rgba(255, 71, 87, 0.6);
          }

          .user-select:focus {
            outline: none;
            border-color: #ff4757;
            box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.2);
          }

          .transaction-container {
            background: rgba(55, 65, 81, 0.3);
            padding: 1.5rem;
            border-radius: 12px;
            margin-top: 2rem;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .transaction-header {
            color: #e5e7eb;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
          }

          .transaction-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 1rem;
          }

          .transaction-table th {
            background: rgba(55, 65, 81, 0.5);
            color: #e5e7eb;
            font-weight: 600;
            padding: 1rem;
            text-align: left;
            border-bottom: 2px solid rgba(255, 71, 87, 0.3);
          }

          .transaction-table td {
            padding: 1rem;
            color: #e5e7eb;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-label {
            display: block;
            margin-bottom: 8px;
            color: #e5e7eb;
            font-weight: 500;
          }

          .form-input {
            width: 100%;
            padding: 10px;
            border: 1px solid #374151;
            background-color: #1f2937;
            color: #e5e7eb;
            border-radius: 6px;
            transition: all 0.3s ease;
          }

          .form-input:focus {
            outline: none;
            border-color: #ef4444;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
          }

          .button {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .button-primary {
            background-color: #ef4444;
            color: white;
          }

          .button-primary:hover {
            background-color: #dc2626;
            transform: translateY(-2px);
          }

          .table-container {
            overflow-x: auto;
            margin-top: 24px;
          }

          .table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }

          .table th {
            background-color: #374151;
            padding: 12px;
            text-align: left;
            font-weight: 500;
            color: #e5e7eb;
          }

          .table td {
            padding: 10px;
            color: #e5e7eb;
            border-bottom: 1px solid #374151;
          }

          .table tr:hover td {
            background-color: rgba(55, 65, 81, 0.5);
          }

          .action-button {
            padding: 6px;
            border: none;
            border-radius: 4px;
            background: transparent;
            color: #e5e7eb;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .action-button:hover {
            transform: translateY(-2px);
          }

          .edit-button:hover {
            color: #60a5fa;
          }

          .delete-button:hover {
            color: #ef4444;
          }

          .loading-indicator {
            color: #e5e7eb;
            text-align: center;
            padding: 1rem;
          }
        `}
      </style>
      <div className="gradient-overlay" />
      <div className="dashboard-header">
        <h1 className="dashboard-title">Payment Management</h1>
      </div>

      <div className="payment-container">
        {alert.show && (
          <div ref={alertRef} className={`alert ${alert.type}`}>
            <span>{alert.message}</span>
          </div>
        )}

        <div className="user-selection-container">
          <h2 className="user-selection-title">Select User</h2>
          <select 
            className="user-select"
            value={selectedUser?._id || ''}
            onChange={handleUserSelect}
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>

        {selectedUser && (
  <div className="transaction-container">
    <div className="transaction-header">
      Transaction History for {selectedUser.email}
    </div>
    {loading ? (
      <div className="loading-indicator">Loading transactions...</div>
    ) : (
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Order Type</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Payment Status</th>
            <th>Special Requests</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactionHistory.length > 0 ? (
            transactionHistory.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction._id}</td>
                <td>
                  <span className={`status-badge order-type-${transaction.orderType.toLowerCase()}`}>
                    {transaction.orderType.replace('_', ' ')}
                  </span>
                </td>
                <td>${transaction.totalPrice.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${transaction.status.toLowerCase()}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>
                  <span className={`status-badge payment-${transaction.paymentStatus.toLowerCase()}`}>
                    {transaction.paymentStatus}
                  </span>
                </td>
                <td>{transaction.specialRequests || '-'}</td>
                <td>{new Date(transaction.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>No transactions found</td>
            </tr>
          )}
        </tbody>
      </table>
    )}
  </div>
        )}

        <button className="button button-primary" onClick={() => setShowForm(!showForm)} style={{ marginTop: '1rem' ,marginBottom:'1rem' }}>
          {showForm ? 'Close Form' : 'Add New Method'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} ref={formRef}>
            <div className="form-grid">
              <div>
                <div className="form-group">
                  <label className="form-label">Category*</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Types*</label>
                  <input
                    type="text"
                    name="types"
                    value={(formData.types || []).join(', ')}
                    onChange={handleTypesChange}
                    className="form-input"
                    placeholder="Enter types separated by commas"
                    required
                  />
                </div>
              </div>

              <div>
                {isEditing && (
                  <div className="form-group">
                    <label className="form-label">New Category</label>
                    <input
                      type="text"
                      name="newCategory"
                      value={formData.newCategory}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="submit" className="button button-primary" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Update Method' : 'Add Method'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="button"
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Types</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map(method => (
                <tr key={method._id}>
                  <td>{method.category}</td>
                  <td>{(method.types || []).join(', ')}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(method)}
                      className="action-button edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(method._id)}
                      className="action-button delete-button"
                      style={{ marginLeft: '8px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
