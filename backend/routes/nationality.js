const express = require('express');
const router = express.Router();
const nationalityController = require('../controllers/nationalityController');

router.post('/add-nationalities', nationalityController.addNationalities);
router.get('/get-nationalities', nationalityController.getNationalities); // New GET route

module.exports = router;
