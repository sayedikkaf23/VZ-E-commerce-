const fileUpload = require('../middleware/fileUpload'); // Import the multer middleware
const VirtualDetails = require('../models/virtualReceptionist'); // Import the model

// Handle form submission and file uploads
exports.submitVirtualDetails = async (req, res) => {
  try {
      console.log('Files:', req.files);  // Log req.files for debugging
      console.log('Form Data:', req.body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No files were uploaded.' });
      }


      const { 
          firstName, 
          lastName, 
          email, 
          nationality, 
          mobileNumber,
          birthday,
          CompanyName, 
          CompanyIncorporated, 
          Website, 
          companylicensed, 
          tradelicense, 
          shareholdercount, 
          shareholders
      } = req.body;

      // Parse mobile number and shareholders if needed
      const parsedMobileNumber = typeof mobileNumber === "string" ? JSON.parse(mobileNumber) : mobileNumber;

      let parsedShareholders = [];
      if (Array.isArray(shareholders)) {
        parsedShareholders = shareholders;
      } else if (typeof shareholders === "string") {
        try {
          parsedShareholders = JSON.parse(shareholders);
        } catch (e) {
          console.error("Error parsing shareholders JSON:", e);
        }
      }

      // Append file paths for each shareholder
      parsedShareholders = parsedShareholders.map((shareholder, index) => {
          const passportFiles = req.files[`passport[${index}]`] || [];
          const salaryStatementFiles = req.files[`salaryStatements[${index}]`] || [];

          return {
              ...shareholder,
              passportFiles: passportFiles.map(file => file.path), // Array of passport file paths
              salaryStatements: salaryStatementFiles.map(file => file.path) // Array of salary statement file paths
          };
      });

      // Create and save user details
      const userDetails = new VirtualDetails({
          firstName,
          lastName,
          email,
          nationality,
          birthday,
          mobileNumber: parsedMobileNumber,
          CompanyName,
          CompanyIncorporated,
          Website,
          tradelicense,
          companylicensed,
          shareholdercount,
          shareholders: parsedShareholders // Includes file paths for each shareholder
      });

      await userDetails.save();

      res.status(201).json({ message: 'Details submitted successfully', userDetails });
  } catch (error) {
      res.status(500).json({ error: 'Error saving details', details: error.message });
  }
};
