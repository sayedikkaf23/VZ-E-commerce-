const fileUpload = require('../middleware/fileUpload'); // Import the multer middleware
const VirtualDetails = require('../models/virtualReceptionist'); // Import the model

// Handle form submission and file uploads
exports.submitVirtualDetails = async (req, res) => {
    try {
        // console.log('Files:', req.files);  // Log req.files for debugging
        console.log(req.body);

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
            shareholders // Assuming this comes as an array of shareholder objects from the client side
        } = req.body;

    
        // Handle file uploads (if necessary)
        // const passportCopy = req.files['passport'] ? req.files['passport'][0].path : '';
        // const salaryStatements = req.files['salaryStatements'] ? req.files['salaryStatements'].map(file => file.path) : [];
        let parsedMobileNumber = typeof mobileNumber === "string" ? JSON.parse(mobileNumber) : mobileNumber;
      
      
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
        // Create and save user details
        const userDetails = new VirtualDetails({
            firstName,
            lastName,
            email,
            nationality,
            birthday,
            mobileNumber:parsedMobileNumber,
            CompanyName,
            CompanyIncorporated,
            Website,
            tradelicense,
            companylicensed,
            shareholdercount,
            shareholders: parsedShareholders // Ensure shareholders are parsed if necessary
        });

        await userDetails.save();
        res.status(201).json({ message: 'Details submitted successfully', userDetails });
    } catch (error) {
        res.status(500).json({ error: 'Error saving details', details: error.message });
    }
};