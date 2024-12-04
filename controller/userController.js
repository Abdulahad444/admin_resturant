const bcrypt = require('bcryptjs');
const { User } = require('../models/user');  // Path to the schema file
const mongoose = require('mongoose');
// Create a new employee

// Update User Role
async function toggleUserRole(req, res) {
    try {
        const { id, role } = req.body;

        // Validate input
        if (!id || !role) {
            return res.status(400).json({ message: 'User ID and role are required' });
        }

        if (!['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }

        // Find and update user role
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User role updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}


async function createEmployee(req, res) {
    try {
        const { username, email, password, firstName, lastName, role, permissions, contact, dietaryPreferences } = req.body;

        // Input Validation
        if (!username || !email || !password || !firstName || !lastName || !role) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,  // Store hashed password
            firstName,
            lastName,
            role,
            permissions,
            contact,
            dietaryPreferences
        });

        // Save the user to the database
        await newUser.save();
        res.status(201).json({ message: 'Employee created successfully', user: newUser });

    } catch (error) {
        console.error(error);
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ message: 'Invalid data format', error: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

async function updateEmployee(req, res) {
    try {
        const { id } = req.body;
        const updateFields = {};

        // Loop through the fields to update only provided ones
        const allowedFields = ['username', 'email', 'firstName', 'lastName', 'role', 'permissions', 'contact', 'dietaryPreferences', 'status'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });

        // Validate if necessary fields are still provided
        if (updateFields.username && !updateFields.email) {
            return res.status(400).json({ message: 'Required fields cannot be empty' });
        }

        // Update only provided fields
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }  // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee updated successfully', user: updatedUser });

    } catch (error) {
        console.error(error);
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}


// Delete an employee
async function deleteEmployee(req, res) {
    try {
        const { id } = req.body;

        // Find and delete the user by ID
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee deleted successfully', user: deletedUser });

    } catch (error) {
        console.error(error);
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
// Get all employees
async function getAllEmployees(req, res) {
    try {
        const employees = await User.find();  // Retrieve all users
        res.status(200).json({ employees });  // Send the list of employees
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

// Get an employee by username
async function getEmployeeByUsername(req, res) {
    try {
        const { username } = req.body;

        // Ensure 'username' is provided and not empty
        if (!username || username.trim() === '') {
            return res.status(400).json({ message: 'Username parameter is required' });
        }

        // Find the user by username (case-insensitive)
        const employee = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ employee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

// Toggle User Permissions
async function toggleUserPermissions(req, res) {
    try {
        const { id, permissions } = req.body;

        // Validate input
        if (!id || !Array.isArray(permissions)) {
            return res.status(400).json({ message: 'User ID and permissions are required' });
        }

        const validPermissions = [
            'VIEW_MENU', 'EDIT_MENU', 'MANAGE_ORDERS',
            'VIEW_REPORTS', 'MANAGE_USERS', 'MANAGE_TABLES'
        ];

        // Check if all provided permissions are valid
        if (permissions.some(p => !validPermissions.includes(p))) {
            return res.status(400).json({ message: 'Invalid permissions provided' });
        }

        // Update user's permissions
        const user = await User.findByIdAndUpdate(id, { permissions }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User permissions updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
module.exports = {
    createEmployee,
    updateEmployee,
    deleteEmployee,getAllEmployees,getEmployeeByUsername,
    toggleUserRole,toggleUserPermissions
};
