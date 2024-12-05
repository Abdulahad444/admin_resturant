const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: String,
    menuItemRatings: [{
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    suggestion: String,
    response: String,

    // New fields added
    implementationStatus: {
        type: String,
        enum: ['done', 'notdone'], // Only allow these values
        default: 'notdone' // Default to 'notdone' if no status is set
    },
    implementationComment: {
        type: String,
        default: '' // Default is an empty string if not provided
    }
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;
