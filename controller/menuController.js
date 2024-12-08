const MenuItem = require('../models/menuitem');
const mongoose = require('mongoose');

// Add a new menu item
exports.addMenuItem = async (req, res) => {
    try {
        const {
            name, description, price, category, createdBy, ingredients,
            nutritionalInfo, allergens, availability, imageUrl, preparationTime
        } = req.body;

        if (!name || !description || !price || !category || !createdBy) {
            return res.status(400).json({ message: 'Missing mandatory fields' });
        }

        const menuItemData = {
            name,
            description,
            price,
            category,
            createdBy,
            ingredients: ingredients || [],
            nutritionalInfo: nutritionalInfo || {},
            allergens: allergens || [],
            availability: availability !== undefined ? availability : true,
            imageUrl: imageUrl || null,
            preparationTime: preparationTime || null
        };

        const newMenuItem = new MenuItem(menuItemData);
        await newMenuItem.save();
        res.status(201).json(newMenuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing menu item
exports.updateMenuItem = async (req, res) => {
    try {
        const {
            id, name, description, price, category, ingredients,
            nutritionalInfo, allergens, availability, imageUrl, preparationTime
        } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'ID is required for updating' });
        }

        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: 'Missing mandatory fields' });
        }

        const updatedData = {
            name,
            description,
            price,
            category,
            ingredients: ingredients || [],
            nutritionalInfo: nutritionalInfo || {},
            allergens: allergens || [],
            availability: availability !== undefined ? availability : true,
            imageUrl: imageUrl || null,
            preparationTime: preparationTime || null
        };

        const updatedMenuItem = await MenuItem.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.status(200).json(updatedMenuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'ID is required for deletion' });
        }

        const deletedMenuItem = await MenuItem.findByIdAndDelete(id);
        if (!deletedMenuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
