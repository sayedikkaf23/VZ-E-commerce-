const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload'); // Make sure this imports the correct file
const virtualDetails = require('../controllers/virtualController');

// Route to handle form submission with multiple file uploads
router.post('/SubmitvirtualDetail', virtualDetails.submitVirtualDetails); // Use upload.multipleUpload
router.get('/getVirtualDetails', virtualDetails.getVirtualDetails);

module.exports = router;