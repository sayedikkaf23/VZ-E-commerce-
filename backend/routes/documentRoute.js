const express = require("express");
const router = express.Router();
const personalBankController = require("../controllers/documentTypeController");
 
// Signup route
router.post('/personal-bank', personalBankController.createPersonalBank);
router.get('/personal-bank', personalBankController.getPersonalBanks);
router.put('/personal-bank', personalBankController.updatePersonalBank); // Update route
router.delete('/personal-banks/:docId', personalBankController.deletePersonalBank);
 
// Business Bank routes
router.post('/business-bank', personalBankController.createBusinessBank);
router.get('/business-bank', personalBankController.getBusinessBanks);
// router.put('/business-bank', personalBankController.updateBusinessBank); // Update route
 
// Virtual Reception routes
router.post('/virtual-reception', personalBankController.createVirtualReception);
router.get('/virtual-reception', personalBankController.getVirtualReceptions);
router.put('/virtual-reception', personalBankController.updateVirtualReception); // Update route
 
// Mail Management routes
router.post('/mail-management', personalBankController.createMailManagement);
router.get('/mail-management', personalBankController.getMailManagements);
router.put('/mail-management', personalBankController.updateMailManagement); // Update route
router.delete('/mail-managements/:docId', personalBankController.deleteMailManagement);
router.delete('/virtual-receptions/:docId', personalBankController.deleteVirtualReception);
module.exports = router;