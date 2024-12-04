import React, { useEffect, useState } from 'react';

// The ViewUsers component to fetch and display users from the API
const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // To store the selected user for modal
  const [showModal, setShowModal] = useState(false); // To control modal visibility

  // Fetch users data from API
  useEffect(() => {
    fetch('http://localhost:3000/admin/users/all')
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.employees); // Store the fetched employees data
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setLoading(false); // Set loading to false if there's an error
      });
  }, []);

  // If data is loading, show a loading message
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading users...</p>
      </div>
    );
  }

  // Function to handle opening the modal with user details
  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <div style={styles.viewUsersPage}>
      <h2>View Users</h2>
      <div style={styles.cardsContainer}>
        {users.map((user) => (
          <div key={user._id} style={styles.userCard}>
            <h3 style={styles.userName}>{user.firstName} {user.lastName}</h3>
            <p style={styles.userEmail}>{user.email}</p>
            <p style={styles.userRole}>{user.role}</p>
            <p style={styles.userStatus}>Status: {user.status}</p>
            <button style={styles.adminButton} onClick={() => handleOpenModal(user)}>View Details</button>
          </div>
        ))}
      </div>

      {/* Modal for displaying user details */}
      {showModal && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
            <p><strong>Email:</strong> {selectedUser.email || 'N/A'}</p>
            <p><strong>Username:</strong> {selectedUser.username || 'N/A'}</p>
            <p><strong>Role:</strong> {selectedUser.role || 'N/A'}</p>
            <p><strong>Status:</strong> {selectedUser.status || 'N/A'}</p>
            <h3>Permissions</h3>
            <ul>
              {selectedUser.permissions?.length ? (
                selectedUser.permissions.map((perm, index) => (
                  <li key={index}>{perm}</li>
                ))
              ) : (
                <li>No permissions assigned</li>
              )}
            </ul>
            <h3>Dietary Preferences</h3>
            <ul>
              {selectedUser.dietaryPreferences?.length ? (
                selectedUser.dietaryPreferences.map((pref, index) => (
                  <li key={index}>{pref}</li>
                ))
              ) : (
                <li>No dietary preferences</li>
              )}
            </ul>
            <p><strong>Address:</strong> {selectedUser.contact?.address?.street || 'N/A'}, {selectedUser.contact?.address?.city || 'N/A'}, {selectedUser.contact?.address?.state || 'N/A'}, {selectedUser.contact?.address?.zipCode || 'N/A'}, {selectedUser.contact?.address?.country || 'N/A'}</p>
            <p><strong>Phone:</strong> {selectedUser.contact?.phone || 'N/A'}</p>
            <button style={styles.closeModalButton} onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}

      <button onClick={() => window.location.href = '/'} style={homeButtonStyle}>
        Admin Panel
      </button>
    </div>
  );
};

// Styles for ViewUsers component
const styles = {
  viewUsersPage: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '20px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    width: '100%',
    maxWidth: '1200px',
  },
  userCard: {
    backgroundColor: '#444',
    color: '#fff',
    padding: '20px',
    borderRadius: '10px',
    width: '250px',
    minWidth: '250px',
    maxWidth: '300px',
    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
  },
  userName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: '1rem',
    margin: '10px 0',
  },
  userRole: {
    fontSize: '1rem',
    margin: '10px 0',
  },
  userStatus: {
    fontSize: '1rem',
    margin: '10px 0',
    fontWeight: 'bold',
  },
  adminButton: {
    backgroundColor: '#d32f2f', // Red color
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    margin: '10px 0',
    width: '100%',
  },
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '9999',
  },
  modalContent: {
    backgroundColor: '#222',
    color: '#fff',
    padding: '40px',
    borderRadius: '10px',
    width: '70%',
    maxWidth: '900px',
    boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.2)',
    textAlign: 'left',
  },
  closeModalButton: {
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  adminPanelButtonContainer: {
    marginTop: '40px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  adminPanelButton: {
    backgroundColor: '#0288d1',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
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
export default ViewUsers;
