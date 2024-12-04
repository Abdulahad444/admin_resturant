import React, { useEffect, useState } from 'react';

// The DeleteUser component to fetch and display users and delete a selected user
const DeleteUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // To store the selected user to delete
  const [showConfirmation, setShowConfirmation] = useState(false); // To control the confirmation modal visibility
  const [notification, setNotification] = useState(null); // For showing notification after delete

  // Fetch users data from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch('http://localhost:3000/admin/users/all')
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.employees); // Store the fetched users data
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setLoading(false); // Set loading to false if there's an error
      });
  };

  // If data is loading, show a loading message
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading users...</p>
      </div>
    );
  }

  // Function to handle user selection for deletion
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowConfirmation(true); // Show the confirmation modal
  };

  // Function to confirm and delete the user
  const handleDeleteConfirm = () => {
    fetch('http://localhost:3000/admin/user/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: selectedUser._id, // Pass the selected user's ID here
      }),
    })
      .then((response) => response.json()) // Ensure response is in JSON format
      .then((data) => {
        if (data.success) {
          setUsers(users.filter((user) => user._id !== selectedUser._id)); // Remove deleted user from the list
          setNotification('User deleted successfully!'); // Show success notification
        }
        setShowConfirmation(false); // Close the modal after deletion
        setSelectedUser(null); // Reset the selected user
        fetchUsers(); // Re-fetch the updated users list
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        setNotification('Error deleting user, please try again.'); // Show error notification
        setShowConfirmation(false); // Close the modal if there's an error
      });
  };

  // Function to cancel deletion
  const handleDeleteCancel = () => {
    setShowConfirmation(false); // Close the confirmation modal without deleting
    setSelectedUser(null); // Reset the selected user
  };

  return (
    <div style={styles.deleteUsersPage}>
      <h2>Delete User</h2>
      <div style={styles.cardsContainer}>
        {users.map((user) => (
          <div key={user._id} style={styles.userCard}>
            <h3 style={styles.userName}>{user.firstName} {user.lastName}</h3>
            <p style={styles.userEmail}>{user.email}</p>
            <button style={styles.deleteButton} onClick={() => handleDeleteClick(user)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Confirmation modal */}
      {showConfirmation && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Are you sure you want to delete {selectedUser.firstName} {selectedUser.lastName}?</h2>
            <p>This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button style={styles.confirmButton} onClick={handleDeleteConfirm}>Yes, Delete</button>
              <button style={styles.cancelButton} onClick={handleDeleteCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div style={styles.notification}>
          <p>{notification}</p>
        </div>
      )}
            <button onClick={() => window.location.href = '/'} style={homeButtonStyle}>
        Admin Panel
      </button>
    </div>
    
  );
};

// Styles for DeleteUser component
const styles = {
    
  deleteUsersPage: {
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
  deleteButton: {
    backgroundColor: '#d32f2f', // Red color
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '10px',
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
    textAlign: 'center',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  },
  confirmButton: {
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  notification: {
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    marginTop: '20px',
    textAlign: 'center',
    width: '80%',
    maxWidth: '400px',
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
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
  
export default DeleteUser;
