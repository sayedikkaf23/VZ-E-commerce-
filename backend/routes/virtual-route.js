const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload'); // Ensure path is correct
const virtualDetails = require('../controllers/virtualController'); // Ensure path is correct

// Route for file uploads
router.post('/SubmitvirtualDetail', upload.multipleUpload, virtualDetails.submitVirtualDetails);

module.exports = router;
