const express = require("express");
const {
    getPaymentModesHome
} = require("../controllers/onlinePaymentController");

const router = express.Router();
router.get("/getpayment", getPaymentModesHome);


module.exports = router;
