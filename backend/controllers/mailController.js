const fileUpload = require('../middleware/fileUpload'); // Import the multer middleware
const MailDetails = require('../models/mailManagement'); // Import the model

// Handle form submission and file uploads
exports.submitMailDetails = async (req, res) => {
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

    // Parse shareholders if it's a JSON string
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

    // Map over parsedShareholders to include file paths for each shareholder
    parsedShareholders = parsedShareholders.map((shareholder, index) => {
      // Find files associated with this shareholder by their fieldnames
      const shareholderFiles = req.files.filter(file => 
        file.fieldname.startsWith(`shareholders[${index}][files]`)
      );

      return {
        ...shareholder,
        files: shareholderFiles.map(file => ({
          originalName: file.originalname,
          path: file.path, // Path where the file was saved
          mimetype: file.mimetype,
          size: file.size
        }))
      };
    });

    // Create a new record including all details
    const userDetails = new MailDetails({
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
      shareholders: parsedShareholders // Includes file paths and metadata for each shareholder
    });

    await userDetails.save();

    res.status(201).json({ message: 'Details submitted successfully', userDetails });

    } catch (error) {
        res.status(500).json({ error: 'Error saving details', details: error.message });
    }
};
exports.getMailDetails = async (req, res) => {
  try {
      const details = await MailDetails.find(); // Fetch all mail entries
      res.status(200).json(details); // Return the details as JSON
  } catch (error) {
      res.status(500).json({ error: 'Error fetching details', details: error.message });
  }
};