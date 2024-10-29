const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload'); // Make sure this imports the correct file
const mailsDetails = require('../controllers/mailController');
const { multipleUpload, singleUpload } = require('../middleware/fileUpload'); // Import file upload middleware

// Route to handle form submission with multiple file uploads
router.post('/SubmitmailDetail',multipleUpload, mailsDetails.submitMailDetails); // Use upload.multipleUpload

module.exports = router;