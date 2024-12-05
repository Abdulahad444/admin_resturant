const mongoose = require('mongoose');
const MenuItemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true,
        min: 0
    },
    category: { 
        type: String, 
        required: true,
        enum: [
            'APPETIZER', 'MAIN_COURSE', 'DESSERT', 
            'BEVERAGE', 'SIDES', 'SPECIALS'
        ]
    },
    ingredients: [{ 
        type: String 
    }],
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
    },
    allergens: [{
        type: String,
        enum: ['GLUTEN', 'DAIRY', 'NUTS', 'SHELLFISH', 'SOY', 'EGGS']
    }],
    availability: {
        type: Boolean,
        default: true
    },
    imageUrl: String,
    preparationTime: Number, // in minutes
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);