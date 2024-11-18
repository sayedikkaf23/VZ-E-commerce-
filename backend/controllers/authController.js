const User = require('../models/userModel');

// Handle Login Submission
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { errorMessage: 'Invalid username or password' });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('login', { errorMessage: 'Invalid username or password' });
        }

        // Login successful
        return res.json({ user });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};
