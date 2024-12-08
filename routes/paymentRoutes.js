const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controller/paymentController');

// CREATE: Add a new payment method
router.post('/create', paymentMethodController.createPaymentMethod);

// READ: Get all payment methods
router.get('/', paymentMethodController.getAllPaymentMethods);

// READ: Get payment method by ID
router.get('/getbyid', paymentMethodController.getPaymentMethodById);

// UPDATE: Update an existing payment method
router.put('/update', paymentMethodController.updatePaymentMethod);

// DELETE: Delete a payment method
router.delete('/delete', paymentMethodController.deletePaymentMethod);

// READ: View transaction history
router.post('/transactionhistory', paymentMethodController.viewTransactionHistory);

module.exports = router;

