const Order = require('../models/order');
const MenuItem = require('../models/menuitem');
const  User  = require('../models/user'); // Assuming there's a User model for employee performance
const mongoose = require('mongoose');
const feedback=require('../models/feedback')
// Create Order
exports.createOrder = async (req, res) => {
    try {
        const { customer, items, totalPrice, orderType, paymentMethod, specialRequests, assignedStaff } = req.body;

        // Ensure mandatory fields are provided
        if (!customer || !items || !items.length || !totalPrice || !orderType || !paymentMethod || !assignedStaff) {
            return res.status(400).json({ message: 'Missing mandatory fields' });
        }

        // Validate customer ID (ensure it's a valid reference to User)
        const validCustomer = await User.findById(customer);
        if (!validCustomer) {
            return res.status(400).json({ message: 'Invalid customer ID' });
        }

        // Check if all menu items in the order exist
        const menuItemsIds = items.map(item => item.menuItem); // Extract menu item IDs from the request
        const menuItems = await MenuItem.find({ '_id': { $in: menuItemsIds } });

        // Find which items do not exist in the database
        const invalidItemIds = menuItemsIds.filter(id => !menuItems.some(item => item._id.toString() === id));

        if (invalidItemIds.length > 0) {
            return res.status(400).json({
                message: 'One or more menu items not found',
                invalidItems: invalidItemIds  // Return the list of invalid item IDs
            });
        }

        // Check if assignedStaff exists (mandatory field)
        const staffMember = await User.findById(assignedStaff);
        if (!staffMember) {
            return res.status(400).json({ message: 'Assigned staff member not found' });
        }

        // Create a new order if all items are valid
        const newOrder = new Order({
            customer,
            items,
            totalPrice,
            orderType,
            paymentMethod,
            specialRequests,
            assignedStaff,  // Mandatory field for assigned staff
            status: 'PENDING', // Default status for new orders
        });

        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Track Order
exports.trackOrder = async (req, res) => {
    try {
        const { orderId } = req.body; // Now receiving orderId in the body

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        const order = await Order.findById(orderId).populate('customer items.menuItem assignedStaff');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Customer Orders
exports.getCustomerOrders = async (req, res) => {
    try {
        const { customerId } = req.body; // Now receiving customerId in the body

        // Check if customerId is provided
        if (!customerId) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }

        // Check if the customerId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: 'Invalid Customer ID format' });
        }

        // Fetch orders for the given customer
        const orders = await Order.find({ customer: customerId }).populate('items.menuItem');

        // If no orders found for the customer, return a friendly message
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for the provided Customer ID' });
        }

        // Return the orders
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
// Get All Orders
exports.getAllOrders = async (req, res) => {
    try {
        // Fetch all orders from the database and populate related items and staff
        const orders = await Order.find().populate('items.menuItem assignedStaff');

        // If no orders are found, return a friendly message
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        // Return the orders
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        // Check if orderId and status are provided
        if (!orderId || !status) {
            return res.status(400).json({ message: 'Order ID and status are required' });
        }

        // Check for valid status (you can add more valid statuses based on your application)
        const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value. Valid options are: ' + validStatuses.join(', ') });
        }

        // Check if the orderId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid Order ID format' });
        }

        // Find and update the order
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        
        // If order not found, return 404 error
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Return the updated order
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.generateSalesReport = async (req, res) => {
    try {
        const { period } = req.body; // Receive period in the body

        if (!period) {
            return res.status(400).json({ message: 'Period is required' });
        }

        let matchStage = {};
        // Set the date filter based on period
        if (period === 'daily') {
            matchStage = { createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } };
        } else if (period === 'monthly') {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            matchStage = { createdAt: { $gte: startOfMonth } };
        }

        const report = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },  // Group by date
                    totalSales: { $sum: '$totalPrice' },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } },  // Optional: to sort by date descending
            {
                $project: {
                    date: "$_id",  // Rename _id to date
                    totalSales: 1,
                    totalOrders: 1,
                    _id: 0  // Exclude the original _id field
                }
            }
        ]);

        // Build the response object with date as the key
        let formattedReport = {};
        report.forEach(item => {
            formattedReport[item.date] = {
                totalSales: item.totalSales,
                totalOrders: item.totalOrders
            };
        });

        // Aggregate total sales and orders
        const totalSales = report.reduce((sum, data) => sum + data.totalSales, 0);
        const totalOrders = report.reduce((sum, data) => sum + data.totalOrders, 0);

        res.status(200).json({
            reportData: formattedReport,
            totalSales,
            totalOrders,
            message: `Sales report for the ${period} period`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.generateEmployeeReport = async (req, res) => {
    try {
        const { employeeId } = req.body; // Receive employeeId in the body

        if (!employeeId) {
            return res.status(400).json({ message: 'Employee ID is required' });
        }

        // Check if the provided employeeId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'Invalid Employee ID format' });
        }

        // Convert employeeId to ObjectId
        const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

        const report = await Order.aggregate([
            // Filter orders by assignedStaff and exclude cancelled orders
            { $match: { assignedStaff: employeeObjectId, status: { $ne: 'CANCELLED' } } },
            // Group by staff and calculate total orders and revenue
            { $group: { _id: '$assignedStaff', totalOrders: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' } } },
            // Lookup the employee data from the 'users' collection
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'employee' } },
            { $unwind: '$employee' },
            // Project the final result with employee name
            { $project: { employeeName: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] }, totalOrders: 1, totalRevenue: 1 } }
        ]);

        // Check if no report data is found for the given employeeId
        if (report.length === 0) {
            return res.status(404).json({ message: 'No report found for the given employee ID' });
        }

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.generateCustomerFeedbackReport = async (req, res) => {
    try {
        // Aggregate feedback data from the Feedback collection
        const feedbackReport = await feedback.aggregate([
            { $match: { rating: { $exists: true } } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }  // Optionally sort by rating
        ]);

        // Mapping of numeric rating to user-friendly labels
        const ratingLabels = {
            1: 'Very Bad',
            2: 'Bad',
            3: 'Average',
            4: 'Good',
            5: 'Excellent'
        };

        // Get the total count of feedbacks to calculate percentages
        const totalFeedbacks = feedbackReport.reduce((sum, item) => sum + item.count, 0);

        // Format the report with labels and percentages
        const formattedReport = feedbackReport.map(item => {
            const ratingLabel = ratingLabels[item._id] || 'Unknown Rating';
            const percentage = ((item.count / totalFeedbacks) * 100).toFixed(2);  // Percentage rounded to two decimal places
            return {
                rating: ratingLabel,
                count: item.count,
                percentage: `${percentage}%`
            };
        });

        res.status(200).json({
            message: 'Customer Feedback Report',
            totalFeedbacks: totalFeedbacks,
            report: formattedReport
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.generateMenuItemPopularityReport = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.body; // Receive period and dates in the body

        if (!period) {
            return res.status(400).json({ message: 'Period is required' });
        }

        let matchStage = {};
        // Set the date filter based on period
        if (period === 'daily') {
            matchStage = { createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }; // From midnight today
        } else if (period === 'monthly') {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1); // First day of this month
            matchStage = { createdAt: { $gte: startOfMonth } };
        } else if (period === 'annual') {
            const startOfYear = new Date(new Date().getFullYear(), 0, 1); // First day of this year
            matchStage = { createdAt: { $gte: startOfYear } };
        } else if (period === 'custom' && startDate && endDate) {
            // Validate the date format
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start) || isNaN(end)) {
                return res.status(400).json({ message: 'Invalid startDate or endDate format' });
            }

            matchStage = { createdAt: { $gte: start, $lte: end } };
        } else {
            return res.status(400).json({ message: 'Invalid period or missing date range for custom period' });
        }

        const report = await Order.aggregate([
            { $match: matchStage },
            {
                $unwind: "$items" // Flatten the items array in each order
            },
            {
                $group: {
                    _id: "$items.menuItem", // Group by menuItem
                    totalOrders: { $sum: 1 }, // Count the total number of times a menuItem was ordered
                }
            },
            { $sort: { totalOrders: -1 } },  // Sort by totalOrders descending
            {
                $lookup: {
                    from: "menuitems", // Join with the MenuItem model to fetch menu item details
                    localField: "_id",
                    foreignField: "_id",
                    as: "menuItemDetails"
                }
            },
            { $unwind: "$menuItemDetails" }, // Unwind the menu item details
            {
                $lookup: {
                    from: "feedbacks", // Join with Feedback to get ratings for menu items
                    localField: "_id",
                    foreignField: "menuItemRatings.menuItem",
                    as: "feedbacks"
                }
            },
            {
                $unwind: {
                    path: "$feedbacks",
                    preserveNullAndEmptyArrays: true // Allow menu items without feedbacks
                }
            },
            {
                $unwind: {
                    path: "$feedbacks.menuItemRatings",
                    preserveNullAndEmptyArrays: true // Unwind the menuItemRatings array
                }
            },
            {
                $group: {
                    _id: "$_id",
                    totalOrders: { $first: "$totalOrders" },
                    totalRating: { $sum: { $ifNull: ["$feedbacks.menuItemRatings.rating", 0] } },
                    avgRating: { $avg: { $ifNull: ["$feedbacks.menuItemRatings.rating", 0] } },
                    menuItemName: { $first: "$menuItemDetails.name" }
                }
            },
            {
                $project: {
                    menuItem: "$menuItemName",
                    totalOrders: 1,
                    avgRating: { $ifNull: ["$avgRating", 0] }, // Ensure avgRating is never null
                    totalRating: { $ifNull: ["$totalRating", 0] }, // Ensure totalRating is never null
                    _id: 0
                }
            }
        ]);

        // Format the report for easy use
        let formattedReport = {};
        report.forEach(item => {
            formattedReport[item.menuItem] = {
                totalOrders: item.totalOrders,
                avgRating: item.avgRating,
                totalRating: item.totalRating
            };
        });

        // Aggregate total orders and ratings
        const totalOrders = report.reduce((sum, data) => sum + data.totalOrders, 0);
        const totalRatings = report.reduce((sum, data) => sum + data.totalRating, 0);

        res.status(200).json({
            reportData: formattedReport,
            totalOrders,
            totalRatings,
            message: `Menu item popularity report for the ${period} period`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update Special Instructions for the Order's Special Requests
exports.updateSpecialInstructions = async (req, res) => {
    try {
        const { orderId, specialInstructions } = req.body; // Only orderId and specialInstructions are required

        // Validate the request
        if (!orderId || !specialInstructions) {
            return res.status(400).json({ message: 'Missing required fields: orderId and specialInstructions.' });
        }

        // Validate if orderId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid orderId format.' });
        }

        // Find the order by orderId
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Update the specialRequests field
        order.specialRequests = specialInstructions;

        // Save the updated order
        await order.save();

        res.status(200).json({
            message: 'Special instructions updated successfully for the order.',
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating special instructions.', error: error.message });
    }
};


// Get Special Requests for an Order
exports.getSpecialRequests = async (req, res) => {
    try {
        const { orderId } = req.body;  // Fetch orderId from the request body

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required.' });
        }

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Return the special requests
        res.status(200).json({
            message: 'Special requests fetched successfully.',
            specialRequests: order.specialRequests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching special requests.', error: error.message });
    }
};
