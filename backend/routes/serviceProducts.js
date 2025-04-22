const express = require('express');
const router = express.Router();
const serviceProductsController = require('../controllers/serviceProductsController');

// Define the routes
router.post('/service-products', serviceProductsController.getServiceProducts);
router.post('/create-opportunity', serviceProductsController.createPaymentOpportunity);

module.exports = router;
