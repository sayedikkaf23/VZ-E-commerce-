const express = require("express");
const {
    MagnatiTransactionStatus,
    payNowByFiserv,
    payNowByTelr,
    payNowSaleforce,
    payNowByStripe,
    payNow,
    AddCashMachin,
    AddCashCounter
} = require("../controllers/paymentController");
 
// const {upload} = require("../middleware/fileUpload");
const upload = require('../middleware/multerConfig'); 
 
const router = express.Router();
 
router.post(
    "/addCashMachin/:quoteId",
    // upload.array("transfer_copy"),
    AddCashMachin
  );
  router.post('/addCashCounter/:quoteId', upload.array('transfer_copy',3), AddCashCounter);
router.post("/payNowSaleforce/:quoteId", payNowSaleforce);
router.get("/payNowByFiserv/:quoteId", payNowByFiserv);
router.post("/magnatiTransactionStatus", MagnatiTransactionStatus);
router.get("/paynow/:quoteId", payNow);
router.get("/payNowByStripe/:quoteId", payNowByStripe);
router.get("/payNowByTelr/:quoteId", payNowByTelr);
 
 
 
module.exports = router;