const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { multipleUpload, singleUpload } = require('../middleware/fileUpload'); // Import file upload middleware

// Route to handle form submission with multiple file uploads
router.post('/submit', multipleUpload, userController.submit);

// Route to handle service submission with a single file upload
router.post('/submit-service', singleUpload, userController.submitService);
router.get('/services', userController.getAllServices);
router.get('/submissions', userController.getAllSubmissions);
router.post('/login', userController.loginAdmin);

module.exports = router;
