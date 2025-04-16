const express = require('express');
const router = express.Router();
const riskController = require('../controllers/RiskMangament');

// Add new risk
router.post('/addrisk', riskController.addRisk);
router.get('/getallrisk', riskController.getRisks);
// Get all active risks
router.get('/getrisk', riskController.getActiveRisks);
router.post('/getProductsByCountryRisk', riskController.getProductsByCountryRisk);
router.post('/getActivictyByRiskBulk', riskController.getActivictyByRiskBulk);
router.get('/getAllBusinessCategories', riskController.getAllBusinessCategories);

router.patch('/updaterisk/:id/status', riskController.updateRiskStatus);



module.exports = router;
