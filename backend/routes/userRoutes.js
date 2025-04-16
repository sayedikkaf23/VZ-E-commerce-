const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { multipleUpload, singleUpload } = require('../middleware/fileUpload'); // Import file upload middleware

// Route to handle form submission with multiple file uploads
router.post('/submit', userController.submit);
router.post('/callSalesforceEndpoint', userController.callSalesforceEndpoint);
router.post('/callSalesforceQuoteService', userController.callSalesforceQuoteService);

// Route to handle service submission with a single file upload
router.post('/submit-service', singleUpload, userController.submitService);
router.get('/services', userController.getAllServices);
router.post('/services', userController.createService);
router.get('/submissions', userController.getAllSubmissions);
router.get('/getBusinessBank', userController.getBusinessBank);
router.get('/getPersonalBank', userController.getPersonalBank);
router.post('/login', userController.loginAdmin);
router.post('/payNowByStripe', userController.payNowByStripe);
router.post('/checkUser', userController.checkUser);
router.put('/services/:serviceId', singleUpload, userController.updateService);
router.delete('/services/:serviceId', userController.deleteService); 
router.get('/menu-items', userController.getMenuItems);
router.post('/getallUserSerive', userController.getallUserSerive);
router.post('/menu-items', userController.addMenuItems);
router.post('/checkStatus', userController.checkStatus);
router.post('/MatchScoreProductService', userController.MatchScoreProductService);
router.post('/updateAdditionalUploadedFiles', userController.updateAdditionalUploadedFiles);
router.get('/dashboard', userController.dashboard);
router.post('/updateKycStatus', userController.updateKycStatus);
router.post('/createOpportunity', userController.createOpportunity);
module.exports = router;
