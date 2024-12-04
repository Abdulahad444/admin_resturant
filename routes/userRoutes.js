const express = require('express');
const { createEmployee, updateEmployee, deleteEmployee,getAllEmployees,getEmployeeByUsername,toggleUserPermissions,toggleUserRole } = require('../controller/userController');  // Import controller functions
const userRoutes = require('../routes/userRoutes');  // Import the user routes

const router = express.Router();
// Route to create an employee
router.post('/user/create', createEmployee);

// Route to update an employee
router.put('/user/update', updateEmployee);

// Route to delete an employee
router.delete('/user/delete', deleteEmployee);

// Route to get all employees
router.get('/users/all', getAllEmployees);

// Route to get a specific employee by ID
router.get('/user/name', getEmployeeByUsername);

router.put('/employees/role', toggleUserRole);

router.put('/employees/permissions', toggleUserPermissions);

module.exports = router;
