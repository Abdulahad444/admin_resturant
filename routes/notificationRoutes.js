const express = require('express');
const router = express.Router();
const inventoryController = require('../controller/notificationController'); // Adjust the path as needed

// Route to get low-stock items
router.get('/low-stock', inventoryController.getLowStockItems);
router.post('/low-stock', inventoryController.pushLowStockAlert);

module.exports = router;
