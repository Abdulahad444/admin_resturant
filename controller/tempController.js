const mongoose = require('mongoose');
const Feedback = require('../models/feedback');  // Assuming Feedback model is in models/Feedback.js
const Order = require('../models/order');        // Assuming Order model is in models/Order.js
const User = require('../models/order');          // Assuming User model is in models/User.js
const Reservation=require('../models/reservation')
const Table=require('../models/table')
exports.postFeedback = async (req, res) => {
    try {
        const { orderId, customerId, rating, comment, menuItemRatings } = req.body;

        // Validate required fields
        if (!orderId || !customerId || !rating) {
            return res.status(400).json({ message: 'Order ID, Customer ID, and Rating are required' });
        }

        // Validate that customerId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: 'Invalid Customer ID format' });
        }

        // Find the order and populate the customer
        const order = await Order.findById(orderId).populate('customer');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log('Order found:', order);

        // Ensure the order has a customer associated with it
        if (!order.customer) {
            return res.status(400).json({ message: 'Order does not have an associated customer' });
        }

        // Check if the customerId in the request matches the order's customer ID
        if (order.customer._id.toString() !== customerId) {
            return res.status(400).json({ message: 'Customer did not place this order' });
        }

        // Create the feedback document
        const newFeedback = new Feedback({
            order: orderId,
            customer: customerId,
            rating,
            comment,
            menuItemRatings
        });

        // Save the feedback
        const savedFeedback = await newFeedback.save();

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback: savedFeedback
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
};


exports.createReservation = async (req, res) => {
    const { customer, assignedto, table, date, time, partySize, specialRequests } = req.body;

    // Check if all required fields are provided
    if (!customer || !assignedto || !table || !date || !time || !partySize) {
        return res.status(400).json({ message: 'All fields except specialRequests are required.' });
    }

    try {
        // Check if the table is already reserved
        const existingReservation = await Reservation.findOne({ table, date, time });
        if (existingReservation) {
            return res.status(400).json({ message: 'Table is already reserved for the selected date and time.' });
        }

        const newReservation = new Reservation({ customer, assignedto, table, date, time, partySize, specialRequests });
        await newReservation.save();

        // Update table status to RESERVED
        await Table.findByIdAndUpdate(table, { status: 'RESERVED', reservedBy: customer, reservationTime: date });

        res.status(201).json({ message: 'Reservation created successfully.', reservation: newReservation });
    } catch (error) {
        res.status(500).json({ message: 'Error creating reservation.', error: error.message });
    }
};