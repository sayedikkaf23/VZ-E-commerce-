const express = require("express");
const router = express.Router();
const controller = require("../controllers/productRiskController");

router.post("/add", controller.addProducts); // Add one or many
router.put("/update", controller.updateProducts); // Update many
router.delete("/delete", controller.deleteProducts); // Delete many
router.get("/all", controller.getAllProducts); // Get all

module.exports = router;
