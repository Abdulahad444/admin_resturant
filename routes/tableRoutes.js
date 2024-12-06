const express = require('express');
const router = express.Router();
const tableController = require('../controller/reservController'); // Adjust path accordingly

// Route to add a new table
router.post('/', tableController.createTable);
router.get('/', tableController.getAllTables);
router.put('/', tableController.updateTable);


router.get('/reservation', tableController.viewReservations);  // View all reservations
router.delete('/', tableController.deleteReservation);  // Delete reservation by ID in body

// Check table availability
router.get('/checkAvailability', tableController.checkTableAvailability);  // Check table availability

router.post('/assign', tableController.assignTableToStaff);  // Check table availability

module.exports = router;
