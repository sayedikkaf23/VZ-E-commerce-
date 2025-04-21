const express = require('express');
const router  = express.Router();
const { getServiceProducts } = require('../controllers/serviceProductsController');

router.post('/service-products', getServiceProducts);
module.exports = router;
