const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");

// POST: Add Currency
router.post("/add", currencyController.addCurrency);
// GET: All currencies
router.get("/all", currencyController.getAllCurrencies);

module.exports = router;
