const express = require('express');
const router  = express.Router();
const { seedBusinessCategories, getBusinessCategories } = require('../controllers/businessCategorySeedController');

router.post('/seedBusinessCategories', seedBusinessCategories);
router.get ('/seedBusinessCategories', getBusinessCategories);

module.exports = router;
