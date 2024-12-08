const ValidPaymentMethod = require('../models/validPayment');  // Assuming the schema is in the 'models' folder
const Order=require("../models/order")
const {User}=require("../models/user")
// Helper function to check for duplicate categories (across all records)
const isDuplicateCategory = async (category, excludeId = null) => {
    const query = { category };
    
    // Exclude the document with the specified ID in case of update
    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const existingMethod = await ValidPaymentMethod.findOne(query);
    return existingMethod;
};

// CREATE: Add a new payment method
exports.createPaymentMethod = async (req, res) => {
    try {
        console.log(req);
        const { category, types } = req.body;

        // Validate required fields
        if (!category || !types || types.length === 0) {
            return res.status(400).json({ error: 'Category and types are required' });
        }

        if (!Array.isArray(types) || types.some(type => typeof type !== 'string' || type.trim() === '')) {
            return res.status(400).json({ error: 'Types must be an array of non-empty strings' });
        }

        // Ensure types are unique
        const uniqueTypes = [...new Set(types)];
        if (uniqueTypes.length !== types.length) {
            return res.status(400).json({ error: 'Types must be unique' });
        }

        // Check for duplicate category
        const duplicateCategory = await isDuplicateCategory(category);
        if (duplicateCategory) {
            return res.status(400).json({ error: 'Payment method with the same category already exists' });
        }

        const paymentMethod = new ValidPaymentMethod({
            category,
            types,
        });

        await paymentMethod.save();
        return res.status(201).json({ message: 'Payment method created successfully', paymentMethod });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while creating the payment method' });
    }
};



// Update payment method controller
exports.updatePaymentMethod = async (req, res) => {
    const { category, types, newCategory } = req.body;

    // Validate required fields
    if (!category) {
        return res.status(400).json({ message: "Category is required" });
    }

    if (!types || !Array.isArray(types) || types.length === 0) {
        return res.status(400).json({ message: "Types are required and must be an array" });
    }

    // Validate if the new category is unique across all records
    if (newCategory) {
        const existingNewCategory = await ValidPaymentMethod.findOne({ category: newCategory });

        if (existingNewCategory && (existingNewCategory.category!=category)) {
            return res.status(400).json({ message: "New category already exists. It must be unique." });
        }
    }

    // Find the record by current category
    const paymentMethod = await ValidPaymentMethod.findOne({ category });

    if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
    }

    // If a new category is passed, update the category
    if (newCategory) {
        paymentMethod.category = newCategory; // Update category with the new category
    }

    // Overwrite the older types with the new ones
    paymentMethod.types = types; // Replace the old types with the new ones
    paymentMethod.updatedAt = Date.now(); // Update timestamp

    try {
        // Save the updated document
        await paymentMethod.save();
        return res.status(200).json({
            message: "Payment method updated successfully",
            data: paymentMethod
        });
    } catch (error) {
        return res.status(500).json({ message: "Error updating payment method", error: error.message });
    }
};




// DELETE: Delete a specific payment method by ID (from body)
exports.deletePaymentMethod = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID is required to delete a payment method' });
        }

        const paymentMethod = await ValidPaymentMethod.findByIdAndDelete(id);

        if (!paymentMethod) {
            return res.status(404).json({ error: 'Payment method not found' });
        }

        return res.status(200).json({ message: 'Payment method deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while deleting the payment method' });
    }
};



// READ: Get all payment methods
exports.getAllPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await ValidPaymentMethod.find();
        if (!paymentMethods || paymentMethods.length === 0) {
            return res.status(404).json({ error: 'No payment methods found' });
        }
        return res.status(200).json(paymentMethods);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching the payment methods' });
    }
};
// READ: Get a specific payment method by ID (from body)
exports.getPaymentMethodById = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID is required to fetch a payment method' });
        }

        const paymentMethod = await ValidPaymentMethod.findById(id);
        if (!paymentMethod) {
            return res.status(404).json({ error: 'Payment method not found' });
        }
        return res.status(200).json(paymentMethod);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching the payment method' });
    }
};


exports.viewTransactionHistory = async (req, res) => {
    const { userId } = req.body;  // Get userId from request body

    // Validate if userId is provided
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        // Check if the userId exists in the User collection
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find orders by customer (userId) and populate relevant fields
        const orders = await Order.find({ customer: userId })
            .populate('customer', 'name email')  // Optionally populate user details
            .populate('items.menuItem', 'name price')  // Optionally populate item details
            .sort({ createdAt: -1 });  // Sort orders by date (most recent first)

        // If no orders are found, return an appropriate message
        if (orders.length === 0) {
            return res.status(404).json({ message: "No transactions found for this customer." });
        }

        // Return the orders (transaction history)
        return res.status(200).json({
            message: "Transaction history fetched successfully.",
            data: orders
        });
    } catch (error) {
        // Handle error gracefully
        return res.status(500).json({ message: "Error fetching transaction history.", error: error.message });
    }
};