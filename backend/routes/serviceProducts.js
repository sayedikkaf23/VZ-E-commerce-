const express = require('express');
const router = express.Router();
const serviceProductsController = require('../controllers/serviceProductsController');

// Define the routes
router.post('/service-products', serviceProductsController.getServiceProducts);
router.post('/insertDocumentsFromShareholders', serviceProductsController.insertDocumentsFromShareholders);
router.post('/create-opportunity', serviceProductsController.createPaymentOpportunity);
router.post('/createLeadOnly', serviceProductsController.createLeadOnly);

module.exports = router;
