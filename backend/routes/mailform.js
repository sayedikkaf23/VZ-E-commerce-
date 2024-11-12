const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload'); // Make sure this imports the correct file
const mailsDetails = require('../controllers/mailController');

// Route to handle form submission with multiple file uploads
router.post('/SubmitmailDetail', mailsDetails.submitMailDetails); // Use upload.multipleUpload
router.get('/getMailDetails', mailsDetails.getMailDetails);
router.post('/callSalesforceEndpoint', mailsDetails.callSalesforceEndpoint);

module.exports = router;