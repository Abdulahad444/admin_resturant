const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

// View and track orders
router.get('/track', orderController.trackOrder);
router.get('/customer', orderController.getCustomerOrders);
router.get('/', orderController.getAllOrders);

// Update order status
router.put('/updateStatus', orderController.updateOrderStatus);

router.get('/feedback', orderController.generateCustomerFeedbackReport);
// Report generation endpoints
router.post('/report/sales', orderController.generateSalesReport);
router.post('/report/employee', orderController.generateEmployeeReport);
router.post('/report/menu-popularity', orderController.generateMenuItemPopularityReport);


// Route for updating special instructions for a menu item in an order
router.put('/update-special-instructions', orderController.updateSpecialInstructions);

// Route for getting special requests for an order
router.get('/special-requests', orderController.getSpecialRequests);

module.exports = router;
