const User = require("../models/loginModel");
const bcrypt = require("bcrypt");

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
    const { email, password } = req.body;
  
    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
  
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
  