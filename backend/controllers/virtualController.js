const fileUpload = require('../middleware/fileUpload'); // Import the multer middleware
const VirtualDetails = require('../models/virtualReceptionist'); // Import the model
const Pidata = require("../models/pidata");
const MailDetails = require('../models/mailManagement');
const Nationality = require('../models/nationalityModel');

const axios = require("axios");
require('dotenv').config();

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
      companyTradeLicense,
      LeadId
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

      const pidataUser = await Pidata.findOne({ "leadWithDetails.LeadId": LeadId });
      if (!pidataUser) {
        return res.status(404).json({ message: "Related Pidata entry not found" });
      }

    // const { LeadId } = pidataUser.leadWithDetails;
    const { QuotePaymentId } = pidataUser.quotePaymentWithDetails;
    const matchScore = pidataUser?.screeningDetails?.matchScore; // Correct casing here
    if (matchScore === undefined) {
      console.error("matchScore is undefined. pidataUser:", pidataUser);
    }
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
      QuotePaymentId,
      screeningDetails: { // Add screening details to the document
        matchScore: matchScore,
      },
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




exports.callSalesforceEndpoint = async (req, res) => {
  // Destructure fields from the request body
  const { firstName, lastName, email, nationality, phone, dob, CustomerType,shareholders ,isProfile,planname,tradeLicenseFileUrl} = req.body;
  const formattedPhone = phone.internationalNumber || phone.number || ""; // Format phone number


  const nationalities = await Nationality.find();

  const matchingNationality = nationalities.find(
    (item) => item.Country.toLowerCase() === nationality.toLowerCase()
  );
  

  const standardizedNationality = matchingNationality ? matchingNationality.Value : nationality;
  // Construct the JSON body to send to Salesforce
  const requestBody = {
    firstName,
    lastName,
    email,
    nationality:standardizedNationality,
    phone: formattedPhone,
    dob,
  };
  console.log(requestBody,shareholders);

  try {
    // Step 1: Authenticate with the external API
    const authResponse = await axios.post(
      `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/authenticate`,
      {
        username: process.env.SCREENING_USERNAME,
        password: process.env.SCREENING_PASSWORD,
        CompanyName: process.env.SCREENING_COMPANYNAME
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const authToken = authResponse.data.token; // Assuming the token is in authResponse.data.token

    // Step 2: Get access token from Salesforce
    const tokenResponse = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token?client_id=3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip&client_secret=0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1&grant_type=password&username=vzpaymentapi@vz.ae.vzfullcopy&password=Virtuzone@1234`
    );

    const accessToken = tokenResponse.data.access_token;
    const salesforceUrl = tokenResponse.data.instance_url;

    // Step 3: Make the HTTP POST request to the Salesforce endpoint
    const salesforceResponse = await axios.post(
      `${salesforceUrl}/services/apexrest/opportunityService/`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(CustomerType,CustomerType == "C",CustomerType == "I")
    // Extract the Salesforce response data

    // Extract and use responseData safely
    const responseData = salesforceResponse.data;
    console.log("Extracted Salesforce Data:", responseData);

    
   

    // Step 4: Call the appropriate Screening API based on CustomerType
    let screeningResponse;
    if (CustomerType == "I") {
      // Call individual customer screening API
      screeningResponse = await axios.post(
        `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/Screening`,
        {
          UserId: 'ComplianceUAT',
          CompanyName: 'Virtuzone',
          CustomerId: responseData.leadWithDetails.LeadId,
          CustomerType: CustomerType,
          FirstName: firstName,
          MiddleName: '',
          LastName: lastName,
          Gender: '',
          DOB: dob,
          NationalityISOList: [nationality],
          PlaceOfBirth: '',
          CustomerIdType: '',
          CustomerIdNumber: '',
          CustomerIdExpiry: '',
          MatchCategory: '',
          CompanyCode: '',
          SourceCode: '',
          ScreeningPreset: '',
          EmailIds: '',
          ReplyBackEmailIds: '',
          Threshold: 85,
          OtherParameters: {
            Header1: 'Value1',
            Header2: 'Value2',
            Header3: 'Value3',
            Header4: 'Value4',
            Header5: 'Value5',
          },
          Datasets: ['ALL'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    } else if (CustomerType == "C") {
      // Call corporate customer screening API

      const formattedShareholders = shareholders.map(shareholder => ({
        FirstName: shareholder.firstName || '',
        MiddleName: shareholder.middleName || '',
        LastName: shareholder.name || shareholder.lastName || '',
        Nationality: shareholder.nationalityshareholder || '',
        DOB: shareholder.dob || '',
        Gender: shareholder.gender || ''
      }));



      screeningResponse = await axios.post(
        `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/Screening`,
        {
          UserId: 'ComplianceUAT',
          CompanyName: 'Virtuzone',
          CustomerId: responseData.leadWithDetails.LeadId,
          CustomerType: CustomerType,
          FirstName: firstName,
          MiddleName: '',
          LastName: lastName,
          Gender: '',
          DOB: dob,
          NationalityISOList: [nationality],
          PlaceOfBirth: '',
          CustomerIdType: '',
          CustomerIdNumber: '',
          CustomerIdExpiry: '',
          MatchCategory: '',
          CompanyCode: '',
          SourceCode: '',
          ScreeningPreset: '',
          EmailIds: '',
          ReplyBackEmailIds: '',
          Threshold: 85,
          OtherParameters: {
            Header1: 'Value1',
            Header2: 'Value2',
            Header3: 'Value3',
            Header4: 'Value4',
            Header5: 'Value5',
          },
          Datasets: ['ALL'],
          Shareholders: formattedShareholders,
          ShareHolderOptions: {
            Threshold: 80,
            Datasets: ['PEP-CURRENT', 'SAN', 'REL', 'DD']
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    }

    console.log('Screening Response:', screeningResponse.data);
    const { matchScore } = screeningResponse.data;

    // Step 5: Create a new Pidata document
    const newPidata = new Pidata({
      leadWithDetails: {
        Nationality: responseData.leadWithDetails.Nationality,
        Phone: responseData.leadWithDetails.Phone,
        Origin__c: responseData.leadWithDetails.Origin__c,
        Email: responseData.leadWithDetails.Email.toLowerCase(),
        LeadSource: responseData.leadWithDetails.LeadSource,
        Status: responseData.leadWithDetails.Status,
        Company: responseData.leadWithDetails.Comapny,
        LastName: responseData.leadWithDetails.LastName,
        FirstName: responseData.leadWithDetails.FirstName,
        LeadId: responseData.leadWithDetails.LeadId || 'N/A',
      },
      quotePaymentWithDetails: {
        Currency: responseData.quotePaymentWithDetails.Currency || null,
        QuotePaymentId: responseData.quotePaymentWithDetails.QuotePaymentId || 'N/A',
        AccountId: responseData.quotePaymentWithDetails.AccountId || 'N/A',
      },
      quoteWithProductDetails: {
        AccountName: responseData.quoteWithProductDetails.AccountName,
        Discount: responseData.quoteWithProductDetails.Discount || 0,
        invoiceCurrency: responseData.quoteWithProductDetails.invoiceCurrency || null,
        invoiceDate: responseData.quoteWithProductDetails.invoiceDate,
        invoiceNumber: responseData.quoteWithProductDetails.invoiceNumber || null,
        mobile: formattedPhone,
        oppurtunityId: responseData.quoteWithProductDetails.oppurtunityId || 'N/A',
        ownerId: responseData.quoteWithProductDetails.ownerId || 'N/A',
        partPayment: responseData.quoteWithProductDetails.partPayment || null,
        paymentLink: responseData.quoteWithProductDetails.paymentLink || null,
        paymentMethod: responseData.quoteWithProductDetails.paymentMethod || null,
        product: responseData.quoteWithProductDetails.product || [],
        quoteEmail: responseData.quoteWithProductDetails.quoteEmail,
        quoteId: responseData.quoteWithProductDetails.quoteId || 'N/A',
        quoteName: responseData.quoteWithProductDetails.quoteName || 'Test Quote',
        quotePaymentId: responseData.quoteWithProductDetails.quotePaymentId || 'N/A',
        quotePdf: {
          ContentType: responseData.quoteWithProductDetails.quotePdf.ContentType,
          name: responseData.quoteWithProductDetails.quotePdf.name,
          pdfContent: responseData.quoteWithProductDetails.quotePdf.pdfContent,
        },
        sendToPaymentGateway: responseData.quoteWithProductDetails.sendToPaymentGateway || false,
        status: responseData.quoteWithProductDetails.status || 'Draft',
        subTotal: responseData.quoteWithProductDetails.subTotal || 0,
        totalIncludingVAT: responseData.quoteWithProductDetails.totalIncludingVAT || 0,
        totalPrice: responseData.quoteWithProductDetails.totalPrice || 0,
      },
      screeningDetails: { // Add screening details to the document
        matchScore: matchScore,
      },
      salesPersonDetails: { // Adding salesperson details
        salesPersonEmail: responseData.salesPersonDetails?.salesPersonEmail || 'N/A',
        salesPersonMobile: responseData.salesPersonDetails?.salesPersonMobile || 'N/A',
        salesPersonName: responseData.salesPersonDetails?.salesPersonName || 'N/A',
    },
      isProfile: isProfile ,
      planname: planname ,
      tradeLicenseFileUrl: tradeLicenseFileUrl ,
    });

    // Step 6: Save the document to MongoDB
    await newPidata.save();

    // Send a success response
    res.status(200).json({ message: 'Data saved successfully', data: responseData ,screeningmatchScore:screeningResponse.data});
  } catch (error) {
    console.error('Error calling Salesforce endpoint:', error);
    res.status(500).json({ message: 'Error calling Salesforce endpoint', details: error.message });
  }
};



// exports.getVirtualDetails = async (req, res) => {
//   try {
//       const details = await VirtualDetails.find(); // Fetch all details
//       res.status(200).json(details); // Return the details as JSON
//       console.log(details)
//   } catch (error) {
//       res.status(500).json({ error: 'Error fetching details', details: error.message });
//   }
// };
exports.getVirtualDetails = async (req, res) => {
  try {
    // 1) Parse page & limit from query, defaulting to page=1, limit=10
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
 
    // 2) Count how many documents match planname: "Virtual Receptionist"
    const totalRecords = await Pidata.countDocuments({ 
      $and: [
        { $or: [
          { 'leadWithDetails.ServiceName': "Virtual Receptionist" },
          { 'planname': "Virtual Receptionist" }
        ]},
        { "quoteWithProductDetails.product.0": { $exists: true } }
      ]
    });
    const totalPages = Math.ceil(totalRecords / limit);
 
    const pipeline = [
  { 
    $match: { 
      $and: [
        { $or: [
          { 'leadWithDetails.ServiceName': "Virtual Receptionist" },
          { 'planname': "Virtual Receptionist" }
        ]},
        { "quoteWithProductDetails.product.0": { $exists: true } }
      ]
    }
  },

  // Add a dateKey: yyyy-MM-dd
  { 
    $addFields: { 
      dateKey: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
    }
  },

  // Sort by createdAt descending (newest items first)
  { 
    $sort: { createdAt: -1 }
  },

  // Group by dateKey
  { 
    $group: {
      _id: "$dateKey",
      items: { $push: "$$ROOT" }
    }
  },

  // Reverse each group’s items (oldest first within today)
  { 
    $addFields: { 
      items: { $reverseArray: "$items" }
    }
  },

  // Sort groups by date descending (today first)
  { 
    $sort: { _id: -1 }
  },

  // Flatten
  { 
    $unwind: "$items"
  },

  { 
    $replaceRoot: { newRoot: "$items" }
  },

  // Paginate
  { 
    $skip: skip
  },
  { 
    $limit: limit
  }
];

const VirtualDetailsSubmissions = await Pidata.aggregate(pipeline);

 
    // 4) Call authenticate once for the KYC status
    // const authResponse = await axios.post(
    //   `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/authenticate`,
    //   {
    //     username: "VirtuUAT",
    //     password: "Virtuzone@1234",
    //     CompanyName: "Virtuzone",
    //   },
    //   {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );
 
    // const authToken = authResponse.data?.token;
    // const mergedResults = [];
 
    // 5) Merge for each Pidata doc
    // for (const submission of VirtualDetailsSubmissions) {
    //   const { quotePaymentWithDetails } = submission;
    //   const quotePaymentId = quotePaymentWithDetails?.QuotePaymentId;
 
    //   // Try to find the corresponding VirtualDetails
    //   const userDetails = await VirtualDetails.findOne({ QuotePaymentId: quotePaymentId });
 
    //   // We want to push *all* items, but you can decide if you only push when userDetails is found
    //   // Here, we push either way, so we always return up to 'limit' items per page.
    //   let kycStatus = "Unknown";
 
    //   // If userDetails exists, call the KYC status API
    //   if (userDetails) {
    //     try {
    //       const statusResponse = await axios.post(
    //         `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/status`,
    //         {
    //           CustomerId: submission?.leadWithDetails?.LeadId,
    //           CompanyName: "Virtuzone",
    //         },
    //         {
    //           headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${authToken}`,
    //           },
    //         }
    //       );
 
    //       // Extract KYC status from response
    //       kycStatus = statusResponse.data?.CustomerStatus || "Unknown";
 
    //       // Update the Pidata doc with the new status
    //       await Pidata.updateOne(
    //         { _id: submission._id },
    //         { $set: { kycStatus } }
    //       );
    //     } catch (statusError) {
    //       console.error("Error fetching KYC status:", statusError.message);
    //     }
    //   }
 
    //   // Build the merged object (even if userDetails is null)
    //   const mergedData = {
    //     ...submission._doc,
    //     userDetails: userDetails || null,
    //     kycStatus,
    //   };
 
    //   mergedResults.push(mergedData);
    // }
 
    // 6) Return JSON with pagination metadata
    res.status(200).json({
      data: VirtualDetailsSubmissions,   // up to 'limit' items
      totalRecords,          // how many total match
      totalPages,            // total pages for front end
      currentPage: page,     // which page we're on
      pageSize: limit,       // how many items per page
    });
  } catch (error) {
    console.error("Error fetching virtual details:", error);
    res.status(500).json({
      error: "Error fetching virtual details",
      details: error.message,
    });
  }
};