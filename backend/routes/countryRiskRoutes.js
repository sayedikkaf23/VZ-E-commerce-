const router = require("express").Router();
const ctrl = require("../controllers/countryRiskController");

router.post("/add", ctrl.addCountryRisk);
router.get("/all", ctrl.getAllCountryRisks);
router.put("/update/:id", ctrl.updateCountryRisk);
router.delete("/delete/:id", ctrl.deleteCountryRisk);

module.exports = router;
