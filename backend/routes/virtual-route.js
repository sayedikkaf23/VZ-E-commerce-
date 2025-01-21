const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload'); // Ensure path is correct
const virtualDetails = require('../controllers/virtualController'); // Ensure path is correct
const awsController = require('../middleware/awsController');

// Route for file uploads
router.post('/SubmitvirtualDetail', virtualDetails.submitVirtualDetails);
router.get('/getVirtualDetails', virtualDetails.getVirtualDetails);
router.post('/upload-file',  awsController.uploadFileToS3);

router.post('/callSalesforceEndpoint', virtualDetails.callSalesforceEndpoint);

module.exports = router;
