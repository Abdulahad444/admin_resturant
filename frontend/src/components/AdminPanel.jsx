import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteUser from './DeleteUser';

const AdminPanel = () => {
  const navigate = useNavigate(); // Hook to navigate to a different route

  const handleCreateUserClick = () => {
    navigate('/create-user');  // Navigates to the CreateUser page
  };
  const handleViewClick = () => {
    navigate('/view-user');  // Navigates to the CreateUser page
  };
  const handleDeleteClick = () => {
    navigate('/delete-user');  // Navigates to the CreateUser page
  };

  return (
    <div style={styles.adminPanel}>
      <header style={styles.adminHeader}>
        <h1>Admin Panel</h1>
        <p>Manage your application efficiently!</p>
      </header>

      <div style={styles.buttonContainer}>
        <button style={styles.adminButton} onClick={handleCreateUserClick}>Create User</button>
        <button style={styles.adminButton} onClick={ handleDeleteClick}>Delete User </button>
        <button style={styles.adminButton}>Update User</button>
        <button style={styles.adminButton} onClick={handleViewClick}>View User</button>
        <button style={styles.adminButton}>Assign Roles</button>
        <button style={styles.adminButton}>Assign Permissions</button>
      </div>
    </div>
  );
};

const styles = {
  adminPanel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    color: '#fff',
    minHeight: '100vh',  // Ensures the panel takes full page height
    padding: '20px',
    margin: '0',
  },
  adminHeader: {
    backgroundColor: '#222',
    color: '#fff',
    padding: '40px 30px',
    borderRadius: '10px',
    marginBottom: '50px',
    textAlign: 'center',
    boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '900px',
  },
  adminHeaderH1: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '10px',
    textTransform: 'uppercase',
  },
  adminHeaderP: {
    fontSize: '1.3rem',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    width: '100%',
    maxWidth: '1000px',
    padding: '20px',
  },
  adminButton: {
    backgroundColor: '#d32f2f', // Red color
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '1.1rem',
    fontWeight: '500',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    width: '250px',
    minWidth: '200px',
    maxWidth: '300px',
    textTransform: 'uppercase',
  },
};

export default AdminPanel;
