import React, { useState, useEffect } from 'react';
import { Bell, Eye, EyeOff, AlertCircle } from 'lucide-react';
import styled from 'styled-components'

export default function NotificationManagement() {

  const [loading, setLoading] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [triggers, setTriggers] = useState({
    watchOrders: false,
    watchTables: false
  });
  const [emailResults, setEmailResults] = useState({
    successfulSents: [],
    failedSents: []
  });

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/notification/low-stock');
      if (!response.ok) throw new Error('Failed to fetch low stock items');
      const {data} = await response.json();
      console.log("Length : "+data.length);
      setLowStockItems(data); // Fix: directly set the data
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  

  const sendLowStockAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/notification/low-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to send alerts');
      
      const data = await response.json();
      setEmailResults({
        successfulSents: data.successfulSents || [],
        failedSents: data.failedSents || []
      });
      showAlert('Low stock alerts sent successfully', 'success');
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleTriggers = async (newTriggerState) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/notification/control-triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTriggerState)
      });

      if (!response.ok) throw new Error('Failed to update triggers');

      const data = await response.json();
      setTriggers({
        watchOrders: data.orderWatching,
        watchTables: data.tableWatching
      });
      showAlert('Triggers updated successfully', 'success');
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  return (
    <>
      <style>
  {`
  .card {
  background-color: #1f2937;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #374151;
  margin-bottom: 32px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.stock-item {
  padding: 16px;
  background-color: rgba(55, 65, 81, 0.5);
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.stock-item:hover {
  transform: translateX(10px);
  background-color: rgba(55, 65, 81, 0.8);
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.trigger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: rgba(55, 65, 81, 0.5);
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.trigger-item:hover {
  transform: translateX(10px);
  background-color: rgba(55, 65, 81, 0.8);
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.alert-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
}

.alert-button:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(239, 68, 68, 0.3);
}

.results-section {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.results-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  border-color: rgba(239, 68, 68, 0.2);
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

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
    .notification-container {
      min-height: 100vh;
      background-color: #111827;
      padding: 32px;
      color: #ffffff;
    }

    .notification-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .notification-title {
      text-align: center;
  font-size: 30px;
  color: #cbd5e0;
  margin-bottom: 30px;
  font-weight: 700;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(to right, transparent, #ff4757, transparent);
  }
    }

    .alert {
      margin-bottom: 24px;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .alert.success { background-color: rgba(6, 78, 59, 0.5); }
    .alert.error { background-color: rgba(153, 27, 27, 0.5); }

    .card {
      background-color: #1f2937;
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #374151;
      margin-bottom: 32px;
      
    }

    .card-title {
      font-size: 24px;
      font-weight: 600;
      color: #ef4444;
      margin-bottom: 24px;

    }

    .trigger-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: rgba(55, 65, 81, 0.5);
      border-radius: 8px;
      margin-bottom: 16px;
      transition: background-color 0.3s;
    }

    .trigger-name {
      font-size: 18px;
      font-weight: 500;
      color: #e5e7eb;
      margin-bottom: 4px;
    }

    .trigger-description {
      font-size: 14px;
      color: #9ca3af;
    }

    .trigger-button {
      padding: 8px;
      border-radius: 8px;
      border: none;
      background-color: #4b5563;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .trigger-button.active {
      background-color: #ef4444;
    }

    .trigger-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .trigger-button:hover:not(:disabled) {
      background-color: #ef4444;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .alert-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background-color: #ef4444;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .alert-button:hover:not(:disabled) {
      background-color: #dc2626;
    }

    .alert-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .stock-item {
      padding: 16px;
      background-color: rgba(55, 65, 81, 0.5);
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .item-name {
      font-size: 18px;
      font-weight: 500;
      color: #e5e7eb;
      margin-bottom: 8px;
    }

    .item-quantity {
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 4px;
    }

    .item-threshold {
      font-size: 14px;
      color: #ef4444;
    }

    .empty-message {
      text-align: center;
      color: #9ca3af;
      padding: 32px 0;
    }

    .results-section {
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .results-section.success {
      background-color: rgba(6, 78, 59, 0.3);
    }

    .results-section.error {
      background-color: rgba(153, 27, 27, 0.3);
    }

    .results-title {
      font-size: 18px;
      font-weight: 500;
      color: #ef4444;
      margin-bottom: 16px;
    }

    .results-subtitle {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #34d399;
    }

    .results-section.error .results-subtitle {
      color: #ef4444;
    }

    .email-item {
      font-size: 14px;
      color: #e5e7eb;
      margin-bottom: 4px;
    }

    /* Gradient overlay styles */
    .gradient-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(31, 38, 49, 0.9) 0%, rgba(26, 32, 44, 0.95) 100%);
      pointer-events: none;
      z-index: -1;
    }

    @media (min-width: 768px) {
      .trigger-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
      }
    }
  `}
</style>
      <div className="gradient-overlay" />

      <div className="notification-container" >
        <div className="notification-header">
          <h1 className="notification-title">Notification Management</h1>
        </div>

        {alert.show && (
          <div className={`alert ${alert.type}`}>
            <AlertCircle style={{ width: 20, height: 20 }} />
            <span>{alert.message}</span>
          </div>
        )}

        <div className="card">
          <h2 className="card-title">Notification Triggers</h2>
          <div className="trigger-grid">
            <div>
              <div className="trigger-item">
                <div>
                  <h3 className="trigger-name">Order Notifications</h3>
                  <p className="trigger-description">Get notified about new orders</p>
                </div>
                <button
                  onClick={() => toggleTriggers({ ...triggers, watchOrders: !triggers.watchOrders })}
                  className={`trigger-button ${triggers.watchOrders ? 'active' : ''}`}
                  disabled={loading}
                >
                  {triggers.watchOrders ? 
                    <Eye style={{ width: 20, height: 20, color: 'white' }} /> : 
                    <EyeOff style={{ width: 20, height: 20, color: 'white' }} />
                  }
                </button>
              </div>
              <div className="trigger-item">
                <div>
                  <h3 className="trigger-name">Table Updates</h3>
                  <p className="trigger-description">Get notified about table status changes</p>
                </div>
                <button
                  onClick={() => toggleTriggers({ ...triggers, watchTables: !triggers.watchTables })}
                  className={`trigger-button ${triggers.watchTables ? 'active' : ''}`}
                  disabled={loading}
                >
                  {triggers.watchTables ? 
                    <Eye style={{ width: 20, height: 20, color: 'white' }} /> : 
                    <EyeOff style={{ width: 20, height: 20, color: 'white' }} />
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Low Stock Items</h2>
            <button
              onClick={sendLowStockAlerts}
              disabled={loading || lowStockItems.length === 0}
              className="alert-button"
            >
              <Bell style={{ width: 20, height: 20 }} />
              <span>{loading ? 'Sending...' : 'Send Alerts'}</span>
            </button>
          </div>

          {lowStockItems.length > 0 ? (
  lowStockItems.map((item, index) => (
    <div key={index} className="stock-item">
      <h3 className="item-name">{item.ingredient}</h3>
      <p className="item-quantity">
        Current Quantity: {item.quantity} {item.unit}
      </p>
      <p className="item-threshold">
        Low Stock Threshold: {item.lowStockThreshold} {item.unit}
      </p>
    </div>
  ))
) : (
  <div className="empty-message">
    {loading ? 'Loading...' : 'No low stock items found'}
  </div>
)}

          {(emailResults.successfulSents.length > 0 || emailResults.failedSents.length > 0) && (
            <div style={{ marginTop: '24px' }}>
              <h3 className="results-title">Alert Results</h3>
              {emailResults.successfulSents.length > 0 && (
                <div className="results-section success">
                  <h4 className="results-subtitle">Successfully Sent To:</h4>
                  {emailResults.successfulSents.map((email, index) => (
                    <p key={index} className="email-item">{email}</p>
                  ))}
                </div>
              )}
              {emailResults.failedSents.length > 0 && (
                <div className="results-section error">
                  <h4 className="results-subtitle">Failed To Send To:</h4>
                  {emailResults.failedSents.map((email, index) => (
                    <p key={index} className="email-item">{email}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}