const express = require("express");
const router = express.Router();
const controller = require("../controllers/productFilterController");

router.post("/get-by-country-risk", controller.getFilteredProducts);

module.exports = router;
