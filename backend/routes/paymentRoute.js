const express = require("express");
const {
    MagnatiTransactionStatus,
    payNowByFiserv,
    payNowByTelr,
    payNowSaleforce,
    payNowByStripe,
    payNow,
    AddCashMachin
} = require("../controllers/paymentController");
 
const {upload} = require("../middleware/fileUpload");

 
const router = express.Router();
 
router.post(
    "/addCashMachin/:quoteId",
    upload.array("transfer_copy"),
    AddCashMachin
  );
router.post("/payNowSaleforce/:quoteId", payNowSaleforce);
router.get("/payNowByFiserv/:quoteId", payNowByFiserv);
router.post("/magnatiTransactionStatus", MagnatiTransactionStatus);
router.get("/paynow/:quoteId", payNow);
router.get("/payNowByStripe/:quoteId", payNowByStripe);
router.get("/payNowByTelr/:quoteId", payNowByTelr);
 
 
 
module.exports = router;