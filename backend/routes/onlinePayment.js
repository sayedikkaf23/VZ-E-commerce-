const express = require("express");
const {
    getPaymentModesHome,addAccountDetail,getAccountDetails,getSidebarData,getPiDataBySfId,payNow

    ,checkQuoteIdExists,payNowSaleforce,payNowByTelr,payNowByStripe,getPaymentModes,payNowByFiserv
} = require("../controllers/onlinePaymentController");

const router = express.Router();
router.get("/getpaymentmode", getPaymentModesHome);
router.post("/bank-transfer", addAccountDetail);
router.get("/account-details", getAccountDetails);
router.get("/sidebardata", getSidebarData);
router.get("/pi-data/:quoteId", getPiDataBySfId);
router.get("/paynow/:quoteId", payNow);
router.get("/checkQuoteId/:quoteId", checkQuoteIdExists);
router.post("/payNowSaleforce/:quoteId", payNowSaleforce);
router.get("/payNowByStripe/:quoteId", payNowByStripe);
router.get("/payNowByTelr/:quoteId", payNowByTelr);
router.get("/getpayment", getPaymentModes);
router.get("/payNowByFiserv/:quoteId", payNowByFiserv);
module.exports = router;
