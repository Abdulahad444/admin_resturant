const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

// View and track orders
router.get('/track', orderController.trackOrder);
router.get('/customer', orderController.getCustomerOrders);
router.get('/', orderController.getAllOrders);

// Update order status
router.put('/updateStatus', orderController.updateOrderStatus);
router.post('/create', orderController.createOrder);

router.get('/feedback', orderController.generateCustomerFeedbackReport);
// Report generation endpoints
router.get('/report/sales', orderController.generateSalesReport);
router.get('/report/employee', orderController.generateEmployeeReport);
router.get('/report/menu-popularity', orderController.generateMenuItemPopularityReport);


// Route for updating special instructions for a menu item in an order
router.put('/update-special-instructions', orderController.updateSpecialInstructions);

// Route for getting special requests for an order
router.get('/special-requests', orderController.getSpecialRequests);

module.exports = router;
