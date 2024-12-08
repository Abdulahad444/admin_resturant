import React, { useState, useEffect } from 'react';

const LOCATIONS = ['MAIN_HALL', 'OUTDOOR', 'PRIVATE_ROOM'];

const RestaurantDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState('tables');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState('');
  const [newTable, setNewTable] = useState({
    tableNumber: '',
    capacity: '',
    location: 'MAIN_HALL'
  });

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/reservation');
      const data = await response.json();
      setTables(data.tables || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
    setLoading(false);
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/reservation/reservation');
      const data = await response.json();
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, []);

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTable.tableNumber || !newTable.capacity || !newTable.location) return;

    try {
      const response = await fetch('http://localhost:3000/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTable)
      });
      
      if (response.ok) {
        fetchTables();
        setNewTable({ tableNumber: '', capacity: '', location: 'MAIN_HALL' });
      }
    } catch (error) {
      console.error('Error creating table:', error);
    }
  };

  const handleDeleteReservation = async (id) => {
    setDeleteLoading(id);
    try {
      const response = await fetch('http://localhost:3000/reservation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (response.ok) {
        await fetchReservations();
      }
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
    setDeleteLoading('');
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return `${formattedDate} at ${time}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    if (activeTab === 'tables') {
      return (
        <>
          <form onSubmit={handleCreateTable} className="add-table-form">
            <h3>Add New Table</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Table Number (e.g., T01)"
                value={newTable.tableNumber}
                onChange={(e) => setNewTable({...newTable, tableNumber: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Capacity (1-10)"
                min="1"
                max="10"
                value={newTable.capacity}
                onChange={(e) => setNewTable({...newTable, capacity: e.target.value})}
                required
              />
              <select
                value={newTable.location}
                onChange={(e) => setNewTable({...newTable, location: e.target.value})}
                required
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc.replace('_', ' ')}</option>
                ))}
              </select>
              <button type="submit">Add Table</button>
            </div>
          </form>

          <div className="tables-grid">
            {tables.map(table => (
              <div key={table._id} className="table-card">
                <div className="card-header">
                  <h3>Table {table.tableNumber}</h3>
                  <span className={`status ${table.status?.toLowerCase()}`}>
                    {table.status || 'AVAILABLE'}
                  </span>
                </div>
                <div className="card-content">
                  <p><strong>Capacity:</strong> {table.capacity} guests</p>
                  <p><strong>Location:</strong> {table.location.replace('_', ' ')}</p>
                  {table.reservedBy && (
                    <p><strong>Reserved By:</strong> {table.reservedBy}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    return (
      <div className="reservations-grid">
        {reservations.map(reservation => (
          <div key={reservation._id} className="reservation-card">
            <div className="card-header">
              <h3>Table {reservation.table.tableNumber}</h3>
              <span className={`status ${reservation.status.toLowerCase()}`}>
                {reservation.status}
              </span>
              <button 
                onClick={() => handleDeleteReservation(reservation._id)}
                className="delete-btn"
                disabled={deleteLoading === reservation._id}
              >
                {deleteLoading === reservation._id ? '...' : '×'}
              </button>
            </div>
            <div className="card-content">
              <div className="customer-info">
                {reservation.customer ? (
                  <>
                    <p><strong>Customer:</strong> {reservation.customer.firstName} {reservation.customer.lastName}</p>
                    <p><strong>Email:</strong> {reservation.customer.email}</p>
                  </>
                ) : (
                  <p><strong>Walk-in Reservation</strong></p>
                )}
              </div>
              <div className="booking-info">
                <p><strong>Date & Time:</strong> {formatDateTime(reservation.date, reservation.time)}</p>
                <p><strong>Party Size:</strong> {reservation.partySize} guests</p>
                <p><strong>Location:</strong> {reservation.table.location.replace('_', ' ')}</p>
                {reservation.specialRequests && (
                  <p><strong>Special Requests:</strong> {reservation.specialRequests}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="site-title">
        <h1>Fine Dining Restaurant</h1>
      </div>

      <div className="content-wrapper">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h2>Dashboard</h2>
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
                onClick={() => setActiveTab('tables')}
              >
                Tables ({tables.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
                onClick={() => setActiveTab('reservations')}
              >
                Reservations ({reservations.length})
              </button>
            </div>
          </header>

          <div className="dashboard-content">
            {renderContent()}
          </div>
        </div>
      </div>

     <style>{`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .page-wrapper {
    min-height: 100vh;
    background: #121721;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .site-title {
  text-align: center;
  padding: 20px 20px;  /* Padding stays the same for now */
  position: relative;
  margin-top: 20px;  /* Increased margin at the top */
}

.site-title h1 {
  font-size: 42px;
  font-weight: 800;
  color: #e2e8f0;
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
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
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .dashboard-container {
    width: 100%;
    max-width: 1000px;
    max-height: 120vh;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .dashboard-header {
    padding: 24px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
  }

  .dashboard-header h2 {
    color: #ff4757;
    font-size: 24px;
    margin-bottom: 20px;
  }

  .tab-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  .tab-btn {
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: #a0aec0;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
  }

  .tab-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .tab-btn.active {
    background: #ff4757;
    color: white;
  }

  .dashboard-content {
    padding: 24px;
    overflow-y: auto;
    max-height: calc(80vh - 140px);
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #a0aec0;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 71, 87, 0.3);
    border-radius: 50%;
    border-top-color: #ff4757;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .add-table-form {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .add-table-form h3 {
    color: #e2e8f0;
    margin-bottom: 16px;
    font-size: 18px;
  }

  .form-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .form-group input,
  .form-group select {
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    color: #e2e8f0;
    font-size: 14px;
  }

  .form-group input::placeholder {
    color: #a0aec0;
  }

  .form-group button {
    padding: 10px;
    border: none;
    border-radius: 6px;
    background: #ff4757;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .form-group button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }

  .tables-grid,
  .reservations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .table-card,
  .reservation-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease;
  }

  .table-card:hover,
  .reservation-card:hover {
    transform: translateY(-2px);
  }

  .card-header {
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .card-header h3 {
    color: #e2e8f0;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    background: #ff4757;
    color: white;
    font-weight: 500;
  }

  .status.available {
    background: #48bb78;
  }

  .status.reserved,
  .status.confirmed {
    background: #ff4757;
  }

  .delete-btn {
    background: none;
    border: none;
    color: #ff4757;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    line-height: 1;
  }

  .delete-btn:hover {
    background: rgba(255, 71, 87, 0.1);
  }

  .delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .card-content {
    padding: 16px;
  }

  .customer-info,
  .booking-info {
    margin-bottom: 12px;
  }

  .card-content p {
    color: #a0aec0;
    margin: 8px 0;
    font-size: 14px;
    line-height: 1.5;
  }

  .card-content strong {
    color: #e2e8f0;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .site-title h1 {
      font-size: 32px;
    }

    .site-title h1::after {
      width: 140px;
    }

    .dashboard-container {
      max-height: 85vh;
      border-radius: 12px;
    }

    .dashboard-content {
      padding: 16px;
    }

    .tables-grid,
    .reservations-grid {
      grid-template-columns: 1fr;
    }

    .form-group {
      grid-template-columns: 1fr;
    }

    .tab-buttons {
      flex-direction: column;
    }

    .tab-btn {
      width: 100%;
    }
  }
`}</style>

    </div>
  );
};

export default RestaurantDashboard;