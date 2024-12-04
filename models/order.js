const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        specialInstructions: String
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: [
            'PENDING', 'CONFIRMED', 'PREPARING', 
            'READY', 'DELIVERED', 'CANCELLED'
        ],
        default: 'PENDING'
    },
    orderType: {
        type: String,
        enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['CREDIT_CARD', 'PAYPAL', 'CASH', 'MOBILE_PAYMENT'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'REFUNDED'],
        default: 'PENDING'
    },
    assignedStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    specialRequests: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date
});
