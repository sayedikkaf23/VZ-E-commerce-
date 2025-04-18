const express = require('express');
const router  = express.Router();
const { bulkCreateProductFamilies, getBusinessCategories } = require('../controllers/businessCategorySeedController');

router.post('/bulkCreateProductFamilies', bulkCreateProductFamilies);
router.get ('/getProductFamilies', getBusinessCategories);

module.exports = router;