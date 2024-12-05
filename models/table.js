const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
        default: 'AVAILABLE'
    },
    reservedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reservationTime: Date,
    location: {
        type: String,
        enum: ['MAIN_HALL', 'OUTDOOR', 'PRIVATE_ROOM']
    }
});

const Table = mongoose.model('Table', TableSchema);

module.exports = Table;
