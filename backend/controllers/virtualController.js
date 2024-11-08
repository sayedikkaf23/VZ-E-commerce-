const fileUpload = require('../middleware/fileUpload'); // Import the multer middleware
const VirtualDetails = require('../models/virtualReceptionist'); // Import the model
const Pidata = require('../models/pidata');

// Handle form submission and file uploads
exports.submitVirtualDetails = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
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
      tradelicense,
      shareholdercount,
      Companylicensed,
      shareholders = [], // Default to an empty array if not provided
      companyTradeLicense
    } = req.body;

    // Check if Company is incorporated in UAE and shareholders is not empty
    const shareholdersWithFiles = CompanyIncorporated == 'United Arab Emirates' && shareholders.length > 0 
      ? shareholders.map((shareholder, index) => {
          if (!shareholder.files || shareholder.files.length === 0 || !shareholder.files[0].url) {
            throw new Error(`Files with URL are required for shareholder at index ${index}.`);
          }
          // Map file details to match schema
          return {
            ...shareholder,
            files: shareholder.files.map(file => ({
              name: file.name,
              url: file.url // Assuming schema expects a 'url'
            }))
          };
        })
      : shareholders; // If not UAE or no shareholders, return them as is without file mapping

    const pidataUser = await Pidata.findOne({ "leadWithDetails.Email": email });
    if (!pidataUser) {
      return res.status(404).json({ message: "Related Pidata entry not found" });
    }

    const { LeadId } = pidataUser.leadWithDetails;
    const { QuotePaymentId } = pidataUser.quotePaymentWithDetails;

    const virtualDetailsData = new VirtualDetails({
      firstName,
      lastName,
      email,
      nationality,
      mobileNumber,
      birthday: new Date(birthday),
      CompanyName,
      CompanyIncorporated,
      Website,
      tradelicense,
      shareholdercount,
      Companylicensed,
      shareholders: shareholdersWithFiles,
      companyTradeLicense,
      LeadId,
      QuotePaymentId
    });

    await virtualDetailsData.save();

    res.status(201).json({
      message: 'Virtual Details submitted successfully',
      data: virtualDetailsData
    });

  } catch (error) {
    console.error("Error in processing:", error);
    res.status(500).json({
      error: 'Error processing request',
      details: error.message
    });
  }
};





exports.getVirtualDetails = async (req, res) => {
  try {
      const details = await VirtualDetails.find(); // Fetch all details
      res.status(200).json(details); // Return the details as JSON
      console.log(details)
  } catch (error) {
      res.status(500).json({ error: 'Error fetching details', details: error.message });
  }
};
