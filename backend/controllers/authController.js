const User = require("../models/loginModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({ email, password: hashedPassword });

        res.status(201).json({ message: "Signup successful", user: newUser });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


exports.login = async (req, res) => {
    let { email, password } = req.body;
  
    try {
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
  
      // Convert email to lowercase
      email = email.toLowerCase();
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      // Send email and message as response
      res.status(200).json({
        message: "Login successful",
        email: user.email, // Include email in the response
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
  
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res
          .status(404)
          .json({ message: "No user found with that email address" });
      }
  
      // Generate a random token
      const resetToken = crypto.randomBytes(20).toString("hex");
  
      // Set token and expiration (e.g., 1 hour)
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
      await user.save();
  
      // Send reset link via email
      const resetUrl = `https://virtuzone.yeepeey.com/reset-password?token=${resetToken}`;
  
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "mishalnunu@gmail.com",
          pass: "qgwlzriynfzukuwy",
        },
      });
  
      const mailOptions = {
        from: "mishalnunu@gmail.com",
        to: user.email,
        subject: "Password Reset",
        html:  `
        <p>You requested a password reset. Please click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>If you did not request a password reset, please ignore this email.</p>  `,
      };
  
      await transporter.sendMail(mailOptions);
  
      return res
        .status(200)
        .json({ message: "Password reset link sent to your email" });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };



  exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ message: "Token and new password are required" });
      }
  
      // Find user by resetPasswordToken and check expiration
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // $gt = greater than
      });
  
      if (!user) {
        return res.status(400).json({
          message: "Invalid or expired reset token",
        });
      }
  
      // Token is valid, hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update user's password
      user.password = hashedPassword;
      // Clear reset token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
  
      return res.status(200).json({
        message: "Password has been reset successfully",
      });
    } catch (error) {
      console.error("Reset Password Error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };