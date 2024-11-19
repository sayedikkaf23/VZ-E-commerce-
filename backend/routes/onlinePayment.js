const express = require("express");
const {
  getPaymentModesHome,
  addAccountDetail,
  getAccountDetails,
  getSidebarData,
  getPiDataBySfId,
  payNow,

  checkQuoteIdExists,
  payNowSaleforce,
  payNowByTelr,
  payNowByStripe,
  getPaymentModes,
  payNowByFiserv,
  updatePaymentModeStatus,

  getPaymentModeById,
  getPaymentMethodData,
  updatePaymentMethod,
  activatePaymentMethod,
  getPaymentMethods,
} = require("../controllers/onlinePaymentController");
const { authMiddleware } = require("../middleware/checkAuth");

const router = express.Router();
router.get("/getpaymentmods", getPaymentModesHome);
router.post("/bank-transfer", addAccountDetail);
router.get("/account-details", getAccountDetails);
router.get("/sidebardata", getSidebarData);
router.get("/pi-data/:quoteId", getPiDataBySfId);
router.get("/paynow/:quoteId", payNow);
router.get("/checkQuoteId/:quoteId", checkQuoteIdExists);
router.post("/payNowSaleforce/:quoteId", payNowSaleforce);
router.get("/payNowByStripe/:quoteId", payNowByStripe);
router.get("/payNowByTelr/:quoteId", payNowByTelr);
router.get("/get_payment_modes", getPaymentModes);
router.get("/payNowByFiserv/:quoteId", payNowByFiserv);
router.patch(
  "/update_payment_mode_status",
  authMiddleware,
  updatePaymentModeStatus
);
router.get("/get_payment_mode/:id", authMiddleware, getPaymentModeById);
router.get("/get_payment_modes", authMiddleware, getPaymentModes);
router.put("/update_payment_method/:id", authMiddleware, updatePaymentMethod);
router.get("/get_payment_methods", authMiddleware, getPaymentMethodData);
router.post("/activatepay", activatePaymentMethod);
router.get("/getpayment", getPaymentMethods);

module.exports = router;
