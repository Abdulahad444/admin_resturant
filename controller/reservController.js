const Table = require('../models/table'); // Adjust path according to your project structure
const mongoose = require('mongoose');
const Reservation=require("../models/reservation")
const {User}=require("../models/user")
// Create a new table
exports.createTable = async (req, res) => {
    const { tableNumber, capacity, location } = req.body;

    // Check if required fields are provided
    if (!tableNumber || !capacity || !location) {
        return res.status(400).json({ message: 'Table number, capacity, and location are required.' });
    }

    // Validate the location
    const validLocations = ['MAIN_HALL', 'OUTDOOR', 'PRIVATE_ROOM'];
    if (!validLocations.includes(location)) {
        return res.status(400).json({ message: `Invalid location. Valid locations are: ${validLocations.join(', ')}` });
    }

    try {
        // Check if a table with the same tableNumber already exists
        const existingTable = await Table.findOne({ tableNumber });
        if (existingTable) {
            return res.status(400).json({ message: 'Table number already exists.' });
        }

        // Create new table document
        const newTable = new Table({
            tableNumber,
            capacity,
            location
        });

        // Save the table to the database
        await newTable.save();
        res.status(201).json({ message: 'Table added successfully.', table: newTable });
    } catch (error) {
        res.status(500).json({ message: 'Error adding table.', error: error.message });
    }
};


// View all reservations
exports.viewReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find().populate('customer assignedto table');
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations.', error: error.message });
    }
};

// Delete a reservation by ID (in body)
exports.deleteReservation = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Reservation ID is required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid reservation ID.' });
    }

    try {
        const deletedReservation = await Reservation.findByIdAndDelete(id);

        if (!deletedReservation) {
            return res.status(404).json({ message: 'Reservation not found.' });
        }

        // Update the table status back to AVAILABLE
        await Table.findByIdAndUpdate(deletedReservation.table, { status: 'AVAILABLE', reservedBy: null, reservationTime: null });

        res.status(200).json({ message: 'Reservation deleted successfully.', deletedReservation });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reservation.', error: error.message });
    }
};

// Check availability of specific table or all tables
exports.checkTableAvailability = async (req, res) => {
    const { tableId, date, time } = req.body;

    try {
        if (tableId) {
            // Check availability of a specific table
            if (!mongoose.Types.ObjectId.isValid(tableId)) {
                return res.status(400).json({ message: 'Invalid table ID.' });
            }

            const table = await Table.findById(tableId);
            if (!table) {
                return res.status(404).json({ message: 'Table not found.' });
            }

            // Check if the table is available (status should be 'AVAILABLE')
            if (table.status !== 'AVAILABLE') {
                return res.status(400).json({ message: 'Table is not available.' });
            }

            // Check if the table is reserved for the given date and time
            const reservation = await Reservation.findOne({ table: tableId, date, time });
            if (reservation) {
                return res.status(400).json({ message: 'Table is not available for the selected date and time.' });
            }

            return res.status(200).json({ message: 'Table is available.', table });
        } else {
            // Check availability of all tables (status should be 'AVAILABLE')
            const availableTables = await Table.find({ status: 'AVAILABLE' });

            // Check if any available table matches the reservation date and time
            const availableTablesWithNoReservation = [];
            for (let table of availableTables) {
                const reservation = await Reservation.findOne({ table: table._id, date, time });
                if (!reservation) {
                    availableTablesWithNoReservation.push(table);
                }
            }

            if (availableTablesWithNoReservation.length > 0) {
                return res.status(200).json({ message: 'Available tables found.', availableTables: availableTablesWithNoReservation });
            } else {
                return res.status(400).json({ message: 'No tables available for the selected date and time.' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Error checking table availability.', error: error.message });
    }
};

exports.assignTableToStaff = async (req, res) => {
    const { assignedto, table } = req.body;

    try {
        // Validate both assignedto and table are provided
        if (!assignedto || !table) {
            return res.status(400).json({ message: 'Both staff (assignedto) and table are required.' });
        }

        // Validate if the assigned staff (assignedto) is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(assignedto)) {
            return res.status(400).json({ message: 'Invalid staff (assignedto) ID.' });
        }

        // Validate if the table ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(table)) {
            return res.status(400).json({ message: 'Invalid table ID.' });
        }

        // Check if the staff (assignedto) exists in the database
        const staffMember = await User.findById(assignedto);
        if (!staffMember) {
            return res.status(404).json({ message: 'Staff member not found.' });
        }

        // Ensure the assigned user is actually a staff member
        if (staffMember.role !== 'STAFF') { // Assuming 'staff' is the role assigned to staff members
            return res.status(400).json({ message: 'The assigned user is not a staff member.' });
        }

        // Check if the table exists in the database
        const tableRecord = await Table.findById(table);
        if (!tableRecord) {
            return res.status(404).json({ message: 'Table not found.' });
        }

        // Assign the table to the staff (assignedto)
        tableRecord.reservedBy = assignedto; // Assign staff to the table
        // No status change, as the status is not being validated for assignment

        // Save the updated table
        await tableRecord.save();

        // Return success response
        res.status(200).json({ message: 'Table successfully assigned to staff.', table: tableRecord });

    } catch (error) {
        res.status(500).json({ message: 'Error assigning table to staff.', error: error.message });
    }
};


// Get all tables
exports.getAllTables = async (req, res) => {
    try {
        // Fetch all tables from the database
        const tables = await Table.find();

        // If no tables are found
        if (!tables || tables.length === 0) {
            return res.status(404).json({ message: 'No tables found.' });
        }

        // Return the list of tables
        res.status(200).json({ message: 'Tables retrieved successfully.', tables });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Error retrieving tables.', error: error.message });
    }
};

exports.updateTable = async (req, res) => {
    const { tableId, tableNumber, capacity, location } = req.body;

    try {
        // Check if tableId is provided
        if (!tableId) {
            return res.status(400).json({ message: 'Table ID is required.' });
        }

        // Prepare the update object based on provided fields
        const fieldsToUpdate = {};

        // Update only the allowed fields
        if (tableNumber) {
            fieldsToUpdate.tableNumber = tableNumber;
        }
        if (capacity) {
            if (capacity < 1 || capacity > 10) {
                return res.status(400).json({ message: 'Capacity must be between 1 and 10.' });
            }
            fieldsToUpdate.capacity = capacity;
        }
        if (location) {
            if (!['MAIN_HALL', 'OUTDOOR', 'PRIVATE_ROOM'].includes(location)) {
                return res.status(400).json({ message: 'Invalid location. Choose from MAIN_HALL, OUTDOOR, PRIVATE_ROOM.' });
            }
            fieldsToUpdate.location = location;
        }

        // If no valid fields to update, return an error
        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update.' });
        }

        // Find the table by ID
        const table = await Table.findById(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Table not found.' });
        }

        // Update the table with the valid fields
        Object.assign(table, fieldsToUpdate);
        await table.save();

        res.status(200).json({ message: 'Table updated successfully.', table });
    } catch (error) {
        res.status(500).json({ message: 'Error updating table.', error: error.message });
    }
};
