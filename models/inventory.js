const mongoose = require('mongoose');
const InventorySchema = new mongoose.Schema({
    ingredient: {
        type: String,
        required: true,
        unique: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        enum: ['KG', 'GRAM', 'LITER', 'ML', 'PIECE']
    },
    lowStockThreshold: {
        type: Number,
        required: true
    },
    lastRestocked: Date,
    restockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});
const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;