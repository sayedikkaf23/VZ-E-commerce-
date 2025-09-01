const express = require("express");
const {
    MagnatiTransactionStatus,
    payNowByFiserv,
    payNowByTelr,
    payNowSaleforce,
    payNowByStripe,
    payNow,
    AddCashMachin,
    AddCashCounter,
    AddCashDeposit,
    convertCurrency,
    AddBankTransfer,
    AddChequeDeposit,
    sendWaitingEmail,
    initCheckout,
    getPaymentStatus
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
  router.post(
    "/addCashDeposit/:quoteId",
    upload.array("transfer_copy"),
    AddCashDeposit
  );

  router.post(
    "/addbankTransfer/:quoteId",
    upload.array("transfer_copy"),
    AddBankTransfer
  );
router.post("/payNowSaleforce/:quoteId", payNowSaleforce);
router.get("/payNowByFiserv/:quoteId", payNowByFiserv);
router.post("/magnatiTransactionStatus", MagnatiTransactionStatus);
router.get("/paynow/:quoteId", payNow);
router.get("/payNowByStripe/:quoteId", payNowByStripe);
router.post("/initCheckout/:quoteId", initCheckout);
router.get('/getPaymentStatus', getPaymentStatus);

router.get("/payNowByTelr/:quoteId", payNowByTelr);
router.post(
  "/addChequeDeposit/:quoteId",
  upload.array("transfer_copy"),
  AddChequeDeposit
);
router.post("/convert-currency", convertCurrency);
router.post("/waitingMail", sendWaitingEmail);
router.post("/successMail", sendSuccessEmail);
 
module.exports = router;