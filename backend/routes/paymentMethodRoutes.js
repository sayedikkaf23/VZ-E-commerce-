// routes/paymentMethodRoutes.js
const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');

// Route to fetch payment methods
router.get('/payment-methods', paymentMethodController.getPaymentMethods);

// Route to update payment method
router.put('/payment-methods/update/:paymentMethodId', paymentMethodController.updatePaymentMethod);

module.exports = router;
