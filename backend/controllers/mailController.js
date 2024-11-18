const fileUpload = require('../middleware/fileUpload'); // Import the multer middleware
const MailDetails = require('../models/mailManagement'); // Import the model
const axios = require("axios");
require('dotenv').config();

// Handle form submission and file uploads
const Pidata = require('../models/pidata');

// Handle form submission and file uploads
exports.submitMailDetails = async (req, res) => {
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
    const MailDetailsData = new MailDetails({
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

    await MailDetailsData.save();

    res.status(201).json({
      message: 'Virtual Details submitted successfully',
      data: MailDetailsData
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
  const { firstName, lastName, email, nationality, phone, dob, CustomerType,shareholders } = req.body;
  const formattedPhone = phone.internationalNumber || phone.number || ""; // Format phone number

  // Construct the JSON body to send to Salesforce
  const requestBody = {
    firstName,
    lastName,
    email,
    nationality,
    phone: formattedPhone,
    dob,
  };
  console.log(requestBody,shareholders);

  try {
    // Step 1: Authenticate with the external API
    const authResponse = await axios.post(
      `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/authenticate`,
      {
        username: SALESFORCE_USERNAME,
        password: SALESFORCE_PASSWORD,
        CompanyName: SALESFORCE_COMPANYNAME
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
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token?client_id=3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip&client_secret=0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1&grant_type=password&username=vzpaymentapi@vz.ae.vzfullcopy&password=VZ@12345678`
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
        Email: responseData.leadWithDetails.Email,
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
    });

    // Step 6: Save the document to MongoDB
    await newPidata.save();

    // Send a success response
    res.status(200).json({ message: 'Data saved successfully', data: responseData });
  } catch (error) {
    console.error('Error calling Salesforce endpoint:', error);
    res.status(500).json({ message: 'Error calling Salesforce endpoint', details: error.message });
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