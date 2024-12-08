import { set } from 'mongoose';
import React, { useState, useEffect } from 'react';

export function EmployeeDashboard ()  {
  // State Management
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('list');
  const [success, setSuccess] = useState(null); // Added success state

  // Form State
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STAFF',
    permissions: [],
    contact: '',
    dietaryPreferences: []
  });

  // Constants
  const ROLES = ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'];
  const PERMISSIONS = [
    'VIEW_MENU', 
    'EDIT_MENU', 
    'MANAGE_ORDERS',
    'VIEW_REPORTS', 
    'MANAGE_USERS', 
    'MANAGE_TABLES'
  ];

  // API Functions
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/admin/users/all');
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.employees || []);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render error or success message
  const renderMessage = () => (
    (error || success) && (
      <div className={`message ${error ? 'error-message' : 'success-message'}`} onClick={() => { setError(null); setSuccess(null); }}>
        {error ? error : success}
      </div>
    )
  );
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);  // Clear any previous errors
    try {
      const response = await fetch('http://localhost:3000/admin/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('success-message'); // Success message
        setError(null);
        await fetchEmployees(); // Refresh the employee list
        setActiveView('list');
        setNewEmployee({
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'STAFF',
          permissions: [],
          contact: '',
          dietaryPreferences: []
        });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message); // Set error if creation fails
    } finally {
      setLoading(false);
    }
  };
  

  const handleUpdateEmployee = async (id, updateData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/admin/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updateData })
      });
      const data = await response.json();
      
      if (response.ok) {
        await fetchEmployees();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/admin/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      
      if (response.ok) {
        await fetchEmployees();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchEmployees();
  }, []);
  const renderEmployeeList = () => (
    <div className="employee-grid">
      {employees.map(employee => (
        <div key={employee._id} className="employee-card">
          <div className="card-header">
            <h3>{employee.firstName} {employee.lastName}</h3>
            <span className={`role-badge ${employee.role.toLowerCase()}`}>
              {employee.role}
            </span>
          </div>
          
          <div className="card-content">
            <div className="employee-info">
              <p><strong>Username:</strong> {employee.username}</p>
              <p><strong>Email:</strong> {employee.email}</p>
              {employee.contact && (
                <p><strong>Contact:</strong> {employee.contact}</p>
              )}
            </div>

            <div className="permissions-section">
              <strong>Permissions</strong>
              <div className="permissions-grid">
                {PERMISSIONS.map(permission => (
                  <label key={permission} className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={Array.isArray(employee.permissions) && 
                              employee.permissions.includes(permission)}
                      onChange={(e) => {
                        const newPermissions = e.target.checked
                          ? [...(employee.permissions || []), permission]
                          : (employee.permissions || []).filter(p => p !== permission);
                        handleUpdateEmployee(employee._id, { permissions: newPermissions });
                      }}
                    />
                    <span>{permission.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="card-actions">
              <select
                value={employee.role}
                onChange={(e) => handleUpdateEmployee(employee._id, { role: e.target.value })}
                className="role-select"
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <button
                onClick={() => handleDeleteEmployee(employee._id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Create employee form
  const renderCreateForm = () => (
    <form onSubmit={handleCreateEmployee} className="create-form">
      <h2>Add New Employee</h2>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Username*</label>
          <input
            type="text"
            value={newEmployee.username}
            onChange={(e) => setNewEmployee({
              ...newEmployee,
              username: e.target.value
            })}
            required
          />
        </div>

        <div className="form-group">
          <label>Email*</label>
          <input
            type="email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({
              ...newEmployee,
              email: e.target.value
            })}
            required
          />
        </div>

        <div className="form-group">
          <label>Password*</label>
          <input
            type="password"
            value={newEmployee.password}
            onChange={(e) => setNewEmployee({
              ...newEmployee,
              password: e.target.value
            })}
            required
          />
        </div>

        <div className="form-group">
          <label>First Name*</label>
          <input
            type="text"
            value={newEmployee.firstName}
            onChange={(e) => setNewEmployee({
              ...newEmployee,
              firstName: e.target.value
            })}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name*</label>
          <input
            type="text"
            value={newEmployee.lastName}
            onChange={(e) => setNewEmployee({
              ...newEmployee,
              lastName: e.target.value
            })}
            required
          />
        </div>

        <div className="form-group">
          <label>Role*</label>
          <select
            value={newEmployee.role}
            onChange={(e) => setNewEmployee({
              ...newEmployee,
              role: e.target.value
            })}
            required
          >
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Contact</label>
          <input
            type="text"
            value={newEmployee.contact}
            onChange={(e) => setNewEmployee({
              ...newEmployee,
              contact: e.target.value
            })}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Creating...' : 'Create Employee'}
        </button>
        <button
          type="button"
          onClick={() => setActiveView('list')}
          className="cancel-button"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  // Main render
  return (
    <>
    <style>{`
      html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
  .page-wrapper {
    min-height: 100vh;
    background: #121721;
    padding: 20px;

  }

  .site-title {
    text-align: center;
    padding: 40px 20px;
    position: relative;
  }

  .site-title h1 {
    font-size: 42px;
    font-weight: 800;
    color: #e2e8f0;
    margin: 0;
    letter-spacing: 2px;
    position: relative;
    display: inline-block;
  }

  .site-title h1::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 180px;
    height: 4px;
    background: linear-gradient(to right, transparent, #ff4757, transparent);
  }

  .content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-container {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    padding: 12px 16px;
    border-radius: 8px;
    margin: 16px;
    text-align: center;
    cursor: pointer;
  }

  .dashboard-header {
    padding: 24px;
     background-color: #1f2937;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: flex-end;
  }

  .toggle-view-button {
    padding: 10px 20px;
    background: #ff4757;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .toggle-view-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }

  .dashboard-content {
    padding: 24px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: #a0aec0;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 71, 87, 0.3);
    border-radius: 50%;
    border-top-color: #ff4757;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Employee Grid */
  .employee-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
  }

  .employee-card {
     background-color: #1f2937;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease;
  }

  .employee-card:hover {
    transform: translateY(-2px);
  }

  .card-header {
    padding: 16px;
     background-color: #1f2937;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-header h3 {
    color: #e2e8f0;
    font-size: 18px;
    margin: 0;
  }

  .role-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: white;
  }

  .role-badge.admin { background: #ff4757; }
  .role-badge.manager { background: #2196f3; }
  .role-badge.staff { background: #4caf50; }
  .role-badge.customer { background: #ff9800; }

  .card-content {
    padding: 16px;
  }

  .employee-info p {
    color: #a0aec0;
    margin-bottom: 8px;
  }

  .employee-info strong {
    color: #e2e8f0;
  }

  .permissions-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .permissions-section > strong {
    color: #e2e8f0;
    display: block;
    margin-bottom: 12px;
  }

  .permissions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }

  .permission-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a0aec0;
    font-size: 14px;
    cursor: pointer;
  }

  .permission-checkbox input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .card-actions {
    margin-top: 16px;
    display: flex;
    gap: 12px;
  }
/* Enhanced gradient overlay */
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

  .role-select {
    flex: 1;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #e2e8f0;
    cursor: pointer;
  }

  .delete-button {
    padding: 8px 16px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .delete-button:hover {
    background: #dc2626;
  }

  /* Create Form */
  .create-form {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
  }

  .create-form h2 {
    color: #e2e8f0;
    margin-bottom: 24px;
    text-align: center;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    color: #e2e8f0;
    font-size: 14px;
  }

  .form-group input,
  .form-group select {
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #e2e8f0;
    font-size: 14px;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #ff4757;
  }

  .form-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }

  .submit-button,
  .cancel-button {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .submit-button {
    background: #ff4757;
    color: white;
    border: none;
  }

  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }

  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .cancel-button {
    background: transparent;
    color: #e2e8f0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .cancel-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .cancel-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .page-wrapper {
      padding: 10px;
    }
  .success-message {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    padding: 12px 16px;
    border-radius: 8px;
    margin: 16px;
    text-align: center;
    cursor: pointer;
  }
    .site-title h1 {
      font-size: 32px;
    }

    .site-title h1::after {
      width: 140px;
    }

    .employee-grid {
      grid-template-columns: 1fr;
    }

    .card-actions {
      flex-direction: column;
    }

    .role-select,
    .delete-button {
      width: 100%;
    }

    .form-actions {
      flex-direction: column;
    }

    .submit-button,
    .cancel-button {
      width: 100%;
    }
  }
`}</style>
 <div className="gradient-overlay" />

    <div className="page-wrapper">
      <div className="site-title">
        <h1>Employee Management</h1>
      </div>

      <div className="content-wrapper">
        <div className="dashboard-container">
        {(error || success) && (
  <div className={`message ${error ? 'error-message' : 'success-message'}`} onClick={() => { setError(null); setSuccess(null); }}>
    {error ? error : success}
  </div>
          )}
          
          <div className="dashboard-header">
            <button 
              onClick={() => setActiveView(activeView === 'list' ? 'create' : 'list')}
              className="toggle-view-button"
            >
              {activeView === 'list' ? 'Add Employee' : 'View Employees'}
            </button>
          </div>

          <div className="dashboard-content">
            {loading && activeView === 'list' ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            ) : (
              activeView === 'list' ? renderEmployeeList() : renderCreateForm()
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};