const UserDetails = require('../models/userDetails');
const fileUpload = require('../middleware/fileUpload'); // Import the multer middleware

// Handle form submission and file uploads
exports.submit = async (req, res) => {
    try {
        console.log('Files:', req.files);  // Log req.files for debugging

        const { firstName, lastName, email, nationality,nationalityfile, birthday, working, salary, emiratesId } = req.body;
console.log(req.body)
        // Handle file uploads
        const passportCopy = req.files['passport'] ? req.files['passport'][0].path : '';
        const salaryStatements = req.files['salaryStatements'] ? req.files['salaryStatements'].map(file => file.path) : [];

        // Create and save user details
        const userDetails = new UserDetails({
            firstName,
            lastName,
            email,
            nationality,
            nationalityfile,
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

exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Compare the password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  

  
      res.status(200).json({ message: 'Login successful'});
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };