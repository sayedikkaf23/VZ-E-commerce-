const express = require("express");
const router = express.Router();
const personalBankController = require("../controllers/documentTypeController");

// Signup route
router.post('/personal-bank', personalBankController.createPersonalBank);
router.get('/personal-bank', personalBankController.getPersonalBanks);

// Business Bank routes
router.post('/business-bank', personalBankController.createBusinessBank);
router.get('/business-bank', personalBankController.getBusinessBanks);

// Virtual Reception routes
router.post('/virtual-reception', personalBankController.createVirtualReception);
router.get('/virtual-reception', personalBankController.getVirtualReceptions);

// Mail Management routes
router.post('/mail-management', personalBankController.createMailManagement);
router.get('/mail-management', personalBankController.getMailManagements);

module.exports = router;
