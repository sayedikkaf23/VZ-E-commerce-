const express = require("express");
const router = express.Router();
const { signup, login , forgotPassword, resetPassword} = require("../controllers/authController");

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// Forgot Password route (User requests a password reset link)
router.post("/forgot-password", forgotPassword);

// Reset Password route (User submits a new password with a token)
router.post("/reset-password", resetPassword);

module.exports = router;
