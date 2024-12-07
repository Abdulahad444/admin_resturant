const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController'); // Adjust the path as needed

// Route to get low-stock items
router.get('/low-stock', notificationController.getLowStockItems);
router.post('/low-stock', notificationController.pushLowStockAlert);

// Route for controlling triggers
router.post('/control-triggers', notificationController.controlTriggers);
module.exports = router;