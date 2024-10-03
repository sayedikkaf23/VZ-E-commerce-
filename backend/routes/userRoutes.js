const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/fileUpload'); // Import file upload middleware

// Route to handle form submission with file uploads
router.post('/submit', upload, userController.submit);

module.exports = router;