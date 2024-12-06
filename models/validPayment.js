const mongoose = require('mongoose');

const ValidPaymentMethodSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,  // Category (e.g., 'CREDIT_CARD', 'PAYPAL')
    },
    types: [{
        type: String,
        required: true,  // Array of strings representing specific types for the category
    }],
    createdAt: {
        type: Date,
        default: Date.now,  // Tracks when the record is created
    },
    updatedAt: {
        type: Date,  // Tracks when the record was last updated
    }
});

// Create the model for ValidPaymentMethod
const ValidPaymentMethod = mongoose.model('ValidPaymentMethod', ValidPaymentMethodSchema);

module.exports = ValidPaymentMethod;
