// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { getUserStatusReport } = require('../controller/performanceController');  // Assuming the controller is in the 'controllers' folder
const performanceController=require('../controller/performanceController')
// Define the route to fetch the user status report
router.get('/user-status-report', getUserStatusReport);


router.get('/system', performanceController.getSystemPerformance)
module.exports = router;
