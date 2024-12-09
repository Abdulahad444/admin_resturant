import React, { useState, useEffect } from 'react';

const OrdersDashboard = () => {
  // State Management
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  
  // Reports State
  const [reports, setReports] = useState({
    sales: null,
    employee: null,
    menuPopularity: null
  });

  // Constants
  const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
  const PERIODS = ['daily', 'monthly', 'annual'];

  // Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/order');
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/admin/users/all');
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.employees);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Track Order
  const handleTrackOrder = async (orderId) => {
    try {
      const response = await fetch('http://localhost:3000/order/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedOrder(data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Update Order Status
  const handleStatusUpdate = async (orderId, status) => {
    try {
      const response = await fetch('http://localhost:3000/order/updateStatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      if (response.ok) {
        fetchOrders();
      } else {
        const data = await response.json();
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Generate Report
  const generateReport = async (reportType) => {
    try {
      const response = await fetch(`http://localhost:3000/order/report/${reportType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: selectedPeriod })
      });
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        setReports(prev => ({
          ...prev,
          [reportType]: data
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch Customer Orders
  const fetchCustomerOrders = async (customerId) => {
    try {
      const response = await fetch('http://localhost:3000/order/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId })
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchEmployees();
  }, []);

  // Filtered lists
  const staffMembers = employees.filter(emp => emp.role === 'STAFF');
  const customers = employees.filter(emp => emp.role === 'CUSTOMER');

  // Render Functions
  const renderOrders = () => (
    
    <div className="orders-section">
      <div className="orders-grid">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="card-header">
              <h3>Order #{order._id?.slice(-6)}</h3>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                className={`status-select ${order.status?.toLowerCase()}`}
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="card-content">
              <div className="order-info">
                <p><strong>Total:</strong> ${order.totalPrice}</p>
                <p><strong>Type:</strong> {order.orderType}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
              </div>

              <div className="items-section">
                <h4>Items</h4>
                <ul>
                  {order.items?.map((item, index) => (
                    <li key={index}>
                      {item.menuItem?.name} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmployees = () => (
    <div className="employees-section">
      <h2>Staff Members</h2>
      <div className="employees-grid">
        {staffMembers.map(employee => (
          <div key={employee._id} className="employee-card">
            <div className="card-header">
              <h3>{employee.firstName} {employee.lastName}</h3>
              <span className="role-badge staff">{employee.role}</span>
            </div>
            <div className="card-content">
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Username:</strong> {employee.username}</p>
              <p><strong>Status:</strong> {employee.status}</p>
              {employee.permissions?.length > 0 && (
                <div className="permissions">
                  <strong>Permissions:</strong>
                  <ul>
                    {employee.permissions.map(perm => (
                      <li key={perm}>{perm}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2>Customers</h2>
      <div className="employees-grid">
        {customers.map(customer => (
          <div key={customer._id} className="employee-card">
            <div className="card-header">
              <h3>{customer.firstName} {customer.lastName}</h3>
              <span className="role-badge customer">{customer.role}</span>
            </div>
            <div className="card-content">
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Username:</strong> {customer.username}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  const renderReports = () => (
  <div className="reports-section">
    <div className="report-controls">
      <select
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        className="period-select"
      >
        {PERIODS.map(period => (
          <option key={period} value={period}>{period}</option>
        ))}
      </select>
      <button onClick={() => generateReport('sales')} className="report-button">
        Sales Report
      </button>
      <button onClick={() => generateReport('menu-popularity')} className="report-button">
        Menu Popularity
      </button>
    </div>

    {/* Display Reports */}
    {reports.sales && (
      <div className="report-card">
        <h3>Sales Report</h3>
        <div className="report-data">
          <p>Total Sales: ${reports.sales.totalSales}</p>
          <p>Total Orders: {reports.sales.totalOrders}</p>
          {Object.entries(reports.sales.reportData).map(([date, data]) => (
            <div key={date} className="daily-data">
              <p>Date: {date}</p>
              <p>Sales: ${data.totalSales}</p>
              <p>Orders: {data.totalOrders}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {reports.menuPopularity && (
      <div className="report-card">
        <h3>Menu Popularity</h3>
        <div className="report-data">
          {Object.keys(reports.menuPopularity.reportData).length > 0 ? (
            Object.entries(reports.menuPopularity.reportData).map(([item, data]) => (
              <div key={item} className="menu-item-data">
                <h4>{item}</h4>
                <p>Orders: {data.totalOrders}</p>
                <p>
                  Average Rating: {data.avgRating !== undefined ? data.avgRating.toFixed(1) : 'N/A'}
                </p>
                <p>Total Ratings: {data.totalRating}</p>
              </div>
            ))
          ) : (
            <p>No menu item data available for this period.</p>
          )}
        </div>
      </div>
    )}
  </div>
);

  return (
    
    <div className="page-wrapper">
              <div className="gradient-overlay" />
      <div className="site-title">
        <h1>Restaurant Dashboard</h1>
      </div>

      <div className="content-wrapper">
        {error && (
          <div className="error-message" onClick={() => setError(null)}>
            {error}
          </div>
        )}

        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`tab-button ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            Employees
          </button>
          <button
            className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'employees' && renderEmployees()}
              {activeTab === 'reports' && renderReports()}
            </>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="modal" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Order Details</h3>
            <p>Status: {selectedOrder.status}</p>
            <p>Customer: {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
            <p>Total: ${selectedOrder.totalPrice}</p>
            <button onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      )}

<style>{`
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
  /* Base Styles */
  .page-wrapper {
    min-height: 100vh;
    background: #121721;
    padding: 20px;
    color: #e2e8f0;
  }

  .site-title {
    text-align: center;
    padding: 40px 20px;
    position: relative;
  }

  .site-title h1 {
    font-size: 42px;
    font-weight: 800;
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

  /* Dashboard Layout */
  .dashboard-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 10px;
  }

  .tab-button {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: #a0aec0;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tab-button.active {
    background: #ff4757;
    color: white;
  }

  .dashboard-content {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    padding: 20px;
  }

  /* Cards Grid */
  .orders-grid,
  .employees-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .order-card,
  .employee-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.3s ease;
  }

  .order-card:hover,
  .employee-card:hover {
    transform: translateY(-2px);
  }

  /* Card Headers */
  .card-header {
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-header h3 {
    margin: 0;
    font-size: 16px;
    color: #e2e8f0;
  }

  .card-content {
    padding: 15px;
  }

  /* Status Select */
  .status-select {
    padding: 5px 10px;
    border-radius: 6px;
    border: none;
    color: white;
    cursor: pointer;
  }

  .status-select.pending { background: #f59e0b; }
  .status-select.processing { background: #3b82f6; }
  .status-select.completed { background: #10b981; }
  .status-select.cancelled { background: #ef4444; }

  /* Role Badges */
  .role-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: white;
  }

  .role-badge.staff { background: #3b82f6; }
  .role-badge.customer { background: #10b981; }

  /* Buttons */
  .track-button,
  .performance-button,
  .orders-button,
  .report-button {
    width: 100%;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #ff4757;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
  }

  .track-button:hover,
  .performance-button:hover,
  .orders-button:hover,
  .report-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }

  /* Reports Section */
  .report-controls {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .period-select {
    padding: 8px 16px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .report-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .report-data {
    margin-top: 15px;
  }

  .daily-data,
  .menu-item-data {
    padding: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Modal */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: #1a202c;
    padding: 20px;
    border-radius: 10px;
    max-width: 500px;
    width: 90%;
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 71, 87, 0.3);
    border-radius: 50%;
    border-top-color: #ff4757;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Error Message */
  .error-message {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 20px;
    text-align: center;
    cursor: pointer;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .page-wrapper {
      padding: 10px;
    }

    .site-title h1 {
      font-size: 32px;
    }

    .dashboard-tabs {
      flex-direction: column;
    }

    .orders-grid,
    .employees-grid {
      grid-template-columns: 1fr;
    }

    .report-controls {
      flex-direction: column;
    }

    .period-select,
    .report-button {
      width: 100%;
    }

    .modal-content {
      width: 95%;
      margin: 10px;
    }
  }
`}</style>
    </div>
  );
};

export default OrdersDashboard;