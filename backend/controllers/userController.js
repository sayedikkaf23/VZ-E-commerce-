const UserDetails = require('../models/userDetails');
const fileUpload = require('../middleware/fileUpload'); // Import the multer middleware

// Handle form submission and file uploads
exports.submit = async (req, res) => {
    try {
        console.log('Files:', req.files);  // Log req.files for debugging

        const { firstName, lastName, email, nationality, birthday, working, salary, emiratesId } = req.body;

        // Handle file uploads
        const passportCopy = req.files['passport'] ? req.files['passport'][0].path : '';
        const salaryStatements = req.files['salaryStatements'] ? req.files['salaryStatements'].map(file => file.path) : [];

        // Create and save user details
        const userDetails = new UserDetails({
            firstName,
            lastName,
            email,
            nationality,
            birthday,
            working,
            salary,
            emiratesId,
            passportCopy,
            salaryStatements
        });

        await userDetails.save();
        res.status(201).json({ message: 'Details submitted successfully', userDetails });
    } catch (error) {
        res.status(500).json({ error: 'Error saving details', details: error.message });
    }
};
