const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controller/paymentController');

// CREATE: Add a new payment method
router.post('/', paymentMethodController.createPaymentMethod);

// READ: Get all payment methods
router.get('/', paymentMethodController.getAllPaymentMethods);

// READ: Get payment method by ID
router.get('/getbyid', paymentMethodController.getPaymentMethodById);

// UPDATE: Update an existing payment method
router.put('/', paymentMethodController.updatePaymentMethod);

// DELETE: Delete a payment method
router.delete('/', paymentMethodController.deletePaymentMethod);

router.get('/transactionhistory', paymentMethodController.viewTransactionHistory);

module.exports = router;
