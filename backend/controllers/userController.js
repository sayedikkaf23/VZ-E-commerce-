const UserDetails = require("../models/userDetails");
const fileUpload = require("../middleware/fileUpload"); 
const Service = require("../models/service");
const Pidata = require('../models/pidata');
const Nationality = require('../models/nationalityModel');
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const axios = require("axios");
const VirtualDetails = require('../models/virtualReceptionist'); // Import the model
const MailDetails = require('../models/mailManagement'); // Import the model
const CommondbSalesforceLog = require('../models/commondbsalesforcelogs'); // Import the model
require('dotenv').config(); 

const OnlinePayment = require("../models/OnlinePaymentModel");


 const stripe = require("stripe")("sk_test_tR3PYbcVNZZ796tH88S4VQ2u");
const MenuItem=require('../models/MenuItem');
const pidata = require("../models/pidata");
const { url } = require("inspector");
const safeLog = async (logData) => {
  try {
    CommondbSalesforceLog.create(logData);
  } catch (logErr) {
    console.error("Log Error (ignored):", logErr?.message || logErr);
  }
};


// Handle form submission and file uploads

exports.submit = async (req, res) => {
  try {
    console.log(req.body);

    // Destructure the required fields from req.body
    const {
      type,
      firstName,
      lastName,
      email,
      nationality,
      birthday,
      resident,
      working,
      salary, // Ensure salary is received in the body
      companyname,
      Bank,
      mobileNumber,
      companylocation,
      jurisdiction,
      shareholders,
      Turnover,
      LeadId, // Assume LeadId is now provided in the request
      shareholdercount
    } = req.body;

    console.log("Salary received:", salary); // Check if salary is received correctly

    // Process mobile number as before
    let parsedMobileNumber = typeof mobileNumber === "string" ? JSON.parse(mobileNumber) : mobileNumber;

    // Check if email already exists in UserDetails
    // const existingUser = await UserDetails.findOne({ email });
    // if (existingUser) {
    //   return res.status(400).json({ message: "Email already exists" });
    // }
console.log(LeadId,"LeadId")
    // Find the corresponding user in Pidata using the email
    const pidataUser = await Pidata.findOne({ "leadWithDetails.LeadId": LeadId });
    if (!pidataUser) {
      return res.status(404).json({ message: "Related Pidata entry not found" });
    }

    // Extract LeadId and QuotePaymentId from the found Pidata document
    // const { LeadId } = pidataUser.leadWithDetails;
    const { QuotePaymentId } = pidataUser.quotePaymentWithDetails;
    const matchScore = pidataUser?.screeningDetails?.matchScore; // Correct casing here
  
    if (matchScore === undefined) {
      console.error("matchScore is undefined. pidataUser:", pidataUser);
    }


    
    // Parse shareholders if provided as a string
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

    // Create and save user details in the database
    const userDetails = new UserDetails({
      type,
      firstName,
      lastName,
      email,
      nationality,
      birthday,
      resident,
      working,
      salary, // Storing salary directly as received
      companyname,
      Bank,
      mobileNumber: parsedMobileNumber,
      companylocation,
      jurisdiction,
      shareholders: parsedShareholders,
      Turnover,
      LeadId, // Add LeadId from Pidata
      shareholdercount,
      QuotePaymentId, // Add QuotePaymentId from Pidata
      screeningDetails: { // Add screening details to the document
        matchScore: matchScore,
      },
    });

    await userDetails.save();

        safeLog({
      unique_id: LeadId,
      request: {
        api: 'submit',
        url: 'http://localhost:3000/api/user/submit',
        body: req.body
      },
      response: userDetails
    });
    res.status(201).json({ message: "Details submitted successfully", userDetails });
  } catch (error) {
    console.error(error);
     safeLog({
      unique_id: req.body?.LeadId || 'unknown',
      request: {
        api: 'submit',
        body: req.body,
        url: 'http://localhost:3000/api/user/submit',
      },
      response: {
        error: error?.response?.data || error.toString(),
        stack: error.stack
      }
    });
    res.status(500).json({ error: "Error saving details", details: error.message });
  }
};



// exports.callSalesforceEndpoint = async (req, res) => {
//   // Destructure fields from the request body
//   const { firstName, lastName, email, nationality, phone, dob,CustomerType } = req.body;
//   const formattedPhone = phone.internationalNumber || phone.number || ""; // Format phone number

//   // Construct the JSON body to send to Salesforce
//   const requestBody = {
//     firstName,
//     lastName,
//     email,
//     nationality,
//     phone: formattedPhone,
//     dob,
    
//   };
//   console.log(requestBody);

//   try {
//     // Step 1: Authenticate with the external API
//     const authResponse = await axios.post(
//       'https://saasuat.digiveri5.com:5040/api/customer/authenticate',
//       {
//         username: 'VirtuUAT',
//         password: 'Virtuzone@1234',
//         CompanyName: 'Virtuzone',
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const authToken = authResponse.data.token; // Assuming the token is in authResponse.data.token

//     // Step 2: Call the Screening API
 

//     // Step 3: Get access token from Salesforce
//     const tokenResponse = await axios.post(
//       `https://test.salesforce.com/services/oauth2/token?client_id=3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip&client_secret=0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1&grant_type=password&username=vzpaymentapi@vz.ae.vzfullcopy&password=Virtuzone@1234`
//     );

//     const accessToken = tokenResponse.data.access_token;
//     const salesforceUrl = tokenResponse.data.instance_url;

//     // Step 4: Make the HTTP POST request to the Salesforce endpoint
//     const salesforceResponse = await axios.post(
//       `${salesforceUrl}/services/apexrest/opportunityService/`,
//       requestBody,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     // Extract the Salesforce response data
//     const responseData = salesforceResponse.data;




//     const screeningResponse = await axios.post(
//       'https://saasuat.digiveri5.com:5040/api/customer/Screening',
//       {
//         UserId: 'ComplianceUAT',
//         CompanyName: 'Virtuzone',
//         CustomerId: responseData.leadWithDetails.LeadId,
//         CustomerType:CustomerType,
//         FirstName: firstName,
//         MiddleName: '',
//         LastName: lastName,
//         Gender: '',
//         DOB: dob,
//         NationalityISOList: [nationality],
//         PlaceOfBirth: '',
//         CustomerIdType: '',
//         CustomerIdNumber: '',
//         CustomerIdExpiry: '',
//         MatchCategory: '',
//         CompanyCode: '',
//         SourceCode: '',
//         ScreeningPreset: '',
//         EmailIds: '',
//         ReplyBackEmailIds: '',
//         Threshold: 85,
//         OtherParameters: {
//           Header1: 'Value1',
//           Header2: 'Value2',
//           Header3: 'Value3',
//           Header4: 'Value4',
//           Header5: 'Value5',
//         },
//         Datasets: ['ALL'],
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${authToken}`,
//         },
//       }
//     );

//     console.log('Screening Response:', screeningResponse.data);
//     const { matchScore } = screeningResponse.data.highestScoringResult;

//     // Step 5: Create a new Pidata document
//     const newPidata = new Pidata({
//       leadWithDetails: {
//         Nationality: responseData.leadWithDetails.Nationality,
//         Phone: responseData.leadWithDetails.Phone,
//         Origin__c: responseData.leadWithDetails.Origin__c,
//         Email: responseData.leadWithDetails.Email,
//         LeadSource: responseData.leadWithDetails.LeadSource,
//         Status: responseData.leadWithDetails.Status,
//         Company: responseData.leadWithDetails.Comapny,
//         LastName: responseData.leadWithDetails.LastName,
//         FirstName: responseData.leadWithDetails.FirstName,
//         LeadId: responseData.leadWithDetails.LeadId || 'N/A',
//       },
//       quotePaymentWithDetails: {
//         Currency: responseData.quotePaymentWithDetails.Currency || null,
//         QuotePaymentId: responseData.quotePaymentWithDetails.QuotePaymentId || 'N/A',
//         AccountId: responseData.quotePaymentWithDetails.AccountId || 'N/A',
//       },
//       quoteWithProductDetails: {
//         AccountName: responseData.quoteWithProductDetails.AccountName,
//         Discount: responseData.quoteWithProductDetails.Discount || 0,
//         invoiceCurrency: responseData.quoteWithProductDetails.invoiceCurrency || null,
//         invoiceDate: responseData.quoteWithProductDetails.invoiceDate,
//         invoiceNumber: responseData.quoteWithProductDetails.invoiceNumber || null,
//         mobile: formattedPhone,
//         oppurtunityId: responseData.quoteWithProductDetails.oppurtunityId || 'N/A',
//         ownerId: responseData.quoteWithProductDetails.ownerId || 'N/A',
//         partPayment: responseData.quoteWithProductDetails.partPayment || null,
//         paymentLink: responseData.quoteWithProductDetails.paymentLink || null,
//         paymentMethod: responseData.quoteWithProductDetails.paymentMethod || null,
//         product: responseData.quoteWithProductDetails.product || [],
//         quoteEmail: responseData.quoteWithProductDetails.quoteEmail,
//         quoteId: responseData.quoteWithProductDetails.quoteId || 'N/A',
//         quoteName: responseData.quoteWithProductDetails.quoteName || 'Test Quote',
//         quotePaymentId: responseData.quoteWithProductDetails.quotePaymentId || 'N/A',
//         quotePdf: {
//           ContentType: responseData.quoteWithProductDetails.quotePdf.ContentType,
//           name: responseData.quoteWithProductDetails.quotePdf.name,
//           pdfContent: responseData.quoteWithProductDetails.quotePdf.pdfContent,
//         },
//         sendToPaymentGateway: responseData.quoteWithProductDetails.sendToPaymentGateway || false,
//         status: responseData.quoteWithProductDetails.status || 'Draft',
//         subTotal: responseData.quoteWithProductDetails.subTotal || 0,
//         totalIncludingVAT: responseData.quoteWithProductDetails.totalIncludingVAT || 0,
//         totalPrice: responseData.quoteWithProductDetails.totalPrice || 0,
//       },
//       screeningDetails: { // Add screening details to the document
//         // screeningId: id,
//         matchScore: matchScore,
//       },
//     });

//     // Step 6: Save the document to MongoDB
//     await newPidata.save();

//     // Send a success response
//     res.status(200).json({ message: 'Data saved successfully', data: responseData });
//   } catch (error) {
//     console.error('Error calling Salesforce endpoint:', error);
//     res.status(500).json({ message: 'Error calling Salesforce endpoint', details: error.message });
//   }
// };


exports.callSalesforceEndpoint = async (req, res) => {
  // Destructure fields from the request body
  const { CustomerId, CompanyName } = req.body || {};

  if (!CustomerId || !CompanyName) {
    return res.status(400).json({
      message: 'CustomerId and CompanyName are required'
    });
  }

  const pidataDoc = await Pidata.findOne(
    { 'quotePaymentWithDetails.QuotePaymentId': CustomerId }   // CustomerId == quotePaymentId
  );
  


  // Construct the JSON body to send to Salesforce

  // console.log(requestBody,shareholders);
 
  try {
    // Step 1: Authenticate with the external API
    console.log(process.env.EXTERNAL_API_SCREENING_URL)
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
    let CustomerType = pidataDoc?.customerType ; // Default to "C" if not found

    const nationalities = await Nationality.find();

// 2. Get the original nationality value from pidata
const nationalityValue = pidataDoc?.leadWithDetails?.Nationality || '';

const matched = nationalities.find(
  item => item.Value.toLowerCase() === nationalityValue.toLowerCase()
);

const NationalityISO = matched ? matched.Country : '';


    console.log(CustomerType,CustomerType == "C",CustomerType == "I")
    // Extract the Salesforce response data

    // Extract and use responseData safely
  
    // console.log("Extracted Salesforce Data:", responseData);
    subcategory = "personal"
    
   

    // Step 4: Call the appropriate Screening API based on CustomerType
    let screeningResponse;
    if (CustomerType == "I") {
      // Call individual customer screening API
      screeningResponse = await axios.post(
        `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/Screening`,
        {
          UserId: 'ComplianceUAT',
          CompanyName: 'Virtuzone',
          CustomerId:pidataDoc.leadWithDetails.LeadId, 

          CustomerType: CustomerType,
          FirstName: pidataDoc.leadWithDetails.FirstName,
          MiddleName: '',
          LastName: pidataDoc.leadWithDetails.LastName,
          Gender: '',
          DOB: pidataDoc.leadWithDetails.dob,
          NationalityISOList: [NationalityISO],
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

console.log(screeningResponse,"screeningResponse")


    } else if (CustomerType == "C") {
      // Call corporate customer screening API
      subcategory = "business"


      const formattedShareholders = (pidataDoc.shareholders || []).map(shareholder => {
        const parts = (shareholder.name || '').trim().split(/\s+/);
        const firstName  = parts[0] || '';
        const lastName   = parts.slice(1).join(' ') || '';
      
        return {
          FirstName:  shareholder.firstName || firstName,
          MiddleName: shareholder.middleName || '',
          LastName:   shareholder.lastName || lastName,
          Nationality: shareholder.nationalityshareholder || '',
          DOB: shareholder.dob
            ? new Date(shareholder.dob).toISOString().split('T')[0]
            : '',
          Gender: shareholder.gender || ''
        };
      });
      
 
      screeningResponse = await axios.post(
        `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/Screening`,
        {
          UserId: 'ComplianceUAT',
          CompanyName: 'Virtuzone',
          CustomerId: pidataDoc.leadWithDetails.LeadId, // 🎯 Random ID

          CustomerType: CustomerType,
          FirstName: pidataDoc.leadWithDetails.FirstName,
          MiddleName: '',
          LastName: pidataDoc.leadWithDetails.LastName,
          Gender: '',
          DOB: pidataDoc.leadWithDetails.dob,
          NationalityISOList: [NationalityISO],
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

    // console.log('Screening Response:', screeningResponse.data);
    const { matchScore } = screeningResponse.data;

    await Pidata.updateOne(
      { 'quotePaymentWithDetails.QuotePaymentId': CustomerId },  // filter
      {
        $set: {
          'screeningDetails.matchScore': matchScore
        }
      }
    );
    
    //  Save log to CommondbSalesforceLog
    safeLog({
      unique_id: CustomerId,
      request: {
        api: 'callSalesforceEndpoint',
        body: req.body,
        url: `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/Screening`,
      },
      response: screeningResponse.data
    });

    

    // Send a success response
    res.status(200).json({ message: 'Data saved successfully' ,screeningmatchScore:screeningResponse.data});
  } catch (error) {
    console.error('Error calling Salesforce endpoint:', error);

    safeLog({
      unique_id: CustomerId,
      request: {
        api: 'callSalesforceEndpoint',
        body: req.body,
        url: `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/Screening`,
      },
      response: {
        error: error.message,
        stack: error.stack,
        details: error.response?.data || null
      }
    });

    res.status(500).json({ message: 'Error calling Salesforce endpoint', details: error.message });
  }
};



function mapToProductWrapper(arr = []) {
  return arr.map(p => ({
            // or hard‑code a product ID
    ProductName:        p.name,
    ProductFamily:      p.ProductFamily,             // or hard‑code a family string
    ProductDescription: p.description || '',
    ProductCurrencyName:p.currencyName,
    productUnitPrice:   p.unitPrice,
    productQuantity:    p.quantity,
    ProductDiscount:    p.discount,

    // ← leave out _id, __v, totalPrice, totalPriceVat, vat, etc.
  }));
}


exports.createOpportunity = async (req, res) => {
  try {
 
    // console.log(req.body,"req.body")
    /*───────────────────────────── 1. grab body ─────────────────────────────*/
    const {
      firstName,
      lastName,
      email,
      nationality,

  
      shareholders = [] ,
      type,
      CustomerType
       // spelling kept as in the client payload
    } = req.body;
    const dob = req.body?.birthday || null;     // yyyy‑mm‑dd string

    const prodcutNameList = mapToProductWrapper(req.body.prodcutNameList);
  
    // console.log(prodcutNameList,"prodcutNameList")

    const phone =
  req.body?.mobileNumber?.e164Number ||
  ((req.body?.mobileNumber?.dialCode || '') + (req.body?.mobileNumber?.nationalNumber || '')).replace(/\s+/g, '') ||
  req.body?.mobileNumber?.number ||
  '';

    /*───────────────────────────── 2. send to SF ────────────────────────────*/
    const tokenResp = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
      null,
      {
        params: {
          client_id: '3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip',
          client_secret: '0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1',
          grant_type: 'password',
          username: 'vzpaymentapi@vz.ae.vzfullcopy',
          password: 'Virtuzone@1234',
        },
      }
    );
 
    const accessToken  = tokenResp.data.access_token;
    const salesforceUrl = tokenResp.data.instance_url;
 console.log( {
  firstName,
  lastName,
  email,
  nationality,
  phone,
  dob,
  prodcutNameList      // ship list exactly as Salesforce expects
},"req.body saleforce ")
    const sfResp = await axios.post(
      `${salesforceUrl}/services/apexrest/VZAR_CreateOpportunity/`,
      {
        firstName,
        lastName,
        email,
        nationality,
        phone,
        dob,
        prodcutNameList      // ship list exactly as Salesforce expects
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
 
console.log(sfResp.data,"sfResp.data")


const rawProdcutNameList = Array.isArray(req.body.prodcutNameList)
  ? req.body.prodcutNameList
  : [];

/* ── totals ────────────────────────────────────────────────── */
const { subTotal, totalIncludingVAT } = rawProdcutNameList.reduce(
  (tot, item) => {
    const base =
      item.totalPrice ??
      (item.unitPrice || 0) * (item.quantity || 1) - (item.discount || 0);

    const withVat =
      item.totalPriceVat ??
      base * (1 + (item.vat || 0) / 100);

    tot.subTotal           += base;
    tot.totalIncludingVAT  += withVat;
    return tot;
  },
  { subTotal: 0, totalIncludingVAT: 0 }
);

const totalPrice = subTotal; 

    /*───────────────────────────── 3. save in Mongo ─────────────────────────*/
    const pidataDoc = await Pidata.create({
      leadWithDetails: {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Nationality: nationality,
        Phone: phone,
        Origin__c: 'Website',     // or whatever source you want
        Status: 'Created',
        dob: dob,
        LeadId: sfResp.data?.LeadId ,
      },
      quotePaymentWithDetails: {
        QuotePaymentId:sfResp.data?.QuotePaymentId
      },
      quoteWithProductDetails: {
        quoteEmail: email,
        quoteName: firstName + ' ' + lastName,
        quotePaymentId: sfResp.data?.QuotePaymentId,
        totalIncludingVAT:totalIncludingVAT,
        subTotal:subTotal,
        totalPrice:totalPrice,
        product: req.body.prodcutNameList   // store the whole array
      },
      // salesforceResponseMatchScreening: {
       
      //   leadId:         sfResp.data?.LeadId         ?? null,
      //   // accountId:      sfResp.data?.AccountId      ?? null,
      //   opportunityId:  sfResp.data?.OpportunityId  ?? null,
      //   quoteId:        sfResp.data?.QuoteId        ?? null,
      //   quotePaymentId: sfResp.data?.QuotePaymentId ?? null,   // ← spelling fixed
      //   message:        sfResp.data?.Message        ?? ''
      // },
      shareholders,
      planname:type,
      subcategory:CustomerType,
    });
 
    safeLog({
  unique_id: sfResp.data?.LeadId || 'N/A',
  request: {
    api: 'createOpportunity',
    body: req.body,
    url: `${salesforceUrl}/services/apexrest/VZAR_CreateOpportunity/`
  },
  response: sfResp.data
});

    /*───────────────────────────── 4. reply to client ───────────────────────*/
    return res.status(200).json({
      message: 'Opportunity created & stored',
      salesforce: sfResp.data,
      // dbRecord: pidataDoc
    });
 
  } catch (error) {
    console.error('createOpportunity error:', error?.response?.data || error);
    // Log the error to CommondbSalesforceLog
    safeLog({
      unique_id: req.body?.email || 'unknown',  // fallback unique id
      request: {
        api: 'createOpportunity',
        body: req.body,
        url: `${process.env.EXTERNAL_API_SERVISE_URL}/services/apexrest/VZAR_CreateOpportunity/`
      },
      response: {
        error: error.message,
        stack: error.stack,
        details: error?.response?.data || null
      }
    });
    return res.status(500).json({
      message: 'Failed to create opportunity',
      error: error?.response?.data || error.toString()
    });
  }
};
 


exports.callSalesforceQuoteService = async (req, res) => {
  try {
    // Step 1: Find the document in the database using quotePaymentId
    const { quotePaymentId } = req.body; // Assume quotePaymentId is passed in the request body
    const document = await Pidata.findOne({ "quotePaymentWithDetails.QuotePaymentId": quotePaymentId });

    if (!document) {
      return res.status(404).json({ message: "No record found for the provided quotePaymentId" });
    }

    // Step 2: Construct the JSON body to send to Salesforce using data from the found document
    const requestBody = {
      lead_source: "App",
      currencyCode: "AED",
      quotePaymentId: document.quotePaymentWithDetails.QuotePaymentId,
      account_id: document.quotePaymentWithDetails.AccountId,
      payment_url: `https://ecommerce.virtuzone.com/onlinepayment/${document.quotePaymentWithDetails.QuotePaymentId}`
    };
    // console.log("Request to Salesforce:", requestBody);

    // Step 3: Get an access token from Salesforce
    const tokenResponse = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token?client_id=3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip&client_secret=0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1&grant_type=password&username=vzpaymentapi@vz.ae.vzfullcopy&password=Virtuzone@1234`
    );

    const accessToken = tokenResponse.data.access_token;
    const salesforceUrl = tokenResponse.data.instance_url;

    // Step 4: Make the HTTP POST request to the Salesforce endpoint
    const salesforceResponse = await axios.put(
      `${salesforceUrl}/services/apexrest/piQuoteService/`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    safeLog({
      unique_id: quotePaymentId || 'N/A',
      request: {
        api: 'callSalesforceQuoteService',
        body: requestBody,
        url: `${salesforceUrl}/services/apexrest/piQuoteService/`
      },
      response: salesforceResponse.data
    });
    const responseData = salesforceResponse.data;
    // console.log("Salesforce Response:", responseData);

    // Optional Step 5: Update the database document with the Salesforce response data (if needed)
    document.salesforceResponseData = responseData; // Assuming a field to store response data exists
    await document.save();

    // Step 6: Send a success response
    res.status(200).json({ message: "Data sent successfully to Salesforce", data: responseData });
  } catch (error) {
     safeLog({
        unique_id: req.body?.quotePaymentId || 'unknown',
        request: {
          api: 'callSalesforceQuoteService',
          body: req.body,
          url: `${process.env.EXTERNAL_API_SERVISE_URL}/services/apexrest/piQuoteService/`
        },
        response: {
          error: error.message,
          stack: error.stack,
          details: error?.response?.data || null
        }
      });
    console.error("Error calling Salesforce endpoint:", error);
    res.status(500).json({ message: "Error calling Salesforce endpoint", details: error.message });
  }
};






exports.MatchScoreProductService = async (req, res) => {
  try {
    // Step 1: Find the document in the database using quotePaymentId
    const { quotePaymentId } = req.body; // Assume quotePaymentId is passed in the request body
    const document = await Pidata.findOne({ "quotePaymentWithDetails.QuotePaymentId": quotePaymentId });

    if (!document) {
      return res.status(404).json({ message: "No record found for the provided quotePaymentId" });
    }

    // Step 2: Construct the JSON body to send to Salesforce using data from the found document
    const requestBody = JSON.stringify({
      quotePayementId: document.quotePaymentWithDetails.QuotePaymentId,
      accountId: document.quotePaymentWithDetails.AccountId,
      leadId: document.leadWithDetails.LeadId,
      matchScore: String(document.screeningDetails.matchScore),
      // quotePayementId: "aAWdu0000000WHdGAM",
      // accountId: "001du000002qGHFAA2",
      // leadId: "00Qdu000001objnEAA",
      // matchScore: "70",

    });
    console.log("Request to Salesforce8:", requestBody);

    // Step 3: Get an access token from Salesforce
    const tokenResponse = await axios.post(
      `https://test.salesforce.com/services/oauth2/token?client_id=3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip&client_secret=0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1&grant_type=password&username=vzpaymentapi@vz.ae.vzfullcopy&password=Virtuzone@1234`
    );

    const accessToken = tokenResponse.data.access_token;
    const salesforceUrl = tokenResponse.data.instance_url;
    console.log("Access Token:", accessToken);
    console.log("Salesforce URL:", salesforceUrl);

    // Step 4: Make the HTTP GET request to the Salesforce endpoint
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${salesforceUrl}/services/apexrest/MatchScoreProductService/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      data: requestBody,
    };

    const salesforceResponse = await axios.request(config);

    const responseData = salesforceResponse.data;
     safeLog({
      unique_id: quotePaymentId || 'N/A',
      request: {
        api: 'MatchScoreProductService',
        url: `${salesforceUrl}/services/apexrest/MatchScoreProductService/`,
        body: requestBody
      },
      response: responseData
    });
    console.log("Salesforce Response:", responseData);

    // Optional Step 5: Update the database document with the Salesforce response data (if needed)
    document.salesforceResponseMatchScreening = responseData; // Assuming a field to store response data exists
    await document.save();

    // Step 6: Send a success response
    res.status(200).json({ message: "Data sent successfully to Salesforce", data: responseData });
  } catch (error) {
    safeLog({
      unique_id: req.body?.quotePaymentId || 'unknown',
      request: {
        api: 'MatchScoreProductService',
        url: `${process.env.EXTERNAL_API_SERVISE_URL}/services/apexrest/MatchScoreProductService/`,
        body: req.body
      },
      response: {
        error: error.message,
        stack: error.stack,
        details: error?.response?.data || null
      }
    });
    console.error("Error calling Salesforce endpoint:", error);
    res.status(500).json({ message: "Error calling Salesforce endpoint", details: error.message });
  }
};
exports.getAllSubmissions = async (req, res) => {
  try {
    // 1) Parse query parameters for pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
 
    // 2) Get optional search term from the query (or empty if not provided)
    const searchTerm = req.query.searchTerm?.trim() || '';
 
    // 3) Build the filter object
    //    If searchTerm is provided, match it against multiple fields using $or + $regex
    let filter = {};
 
    if (searchTerm) {
      filter = {
        $or: [
          { 'leadWithDetails.Email': { $regex: searchTerm, $options: 'i' } },
          { 'quotePaymentWithDetails.QuotePaymentId': { $regex: searchTerm, $options: 'i' } },
          { 'quoteWithProductDetails.quoteEmail': { $regex: searchTerm, $options: 'i' } },
          // Add more fields if desired:
          // { planname: { $regex: searchTerm, $options: 'i' } },
          // etc.
        ],
      };
    }
 
    // 4) Fetch documents with filter, skip, and limit
    const pidata = await Pidata.find(filter)
      .skip(skip)
      .limit(limit);
 
    // 5) Count how many match the same filter (for total pages)
    const totalRecords = await Pidata.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);
    safeLog({
      unique_id: 'getAllSubmissions',
      request: { api: 'getAllSubmissions', query: req.query, url: req.originalUrl },
      response: { data: pidata, totalRecords, totalPages, currentPage: page, pageSize: limit }
    });
    // 6) Return the results
    res.status(200).json({
      data: pidata,
      totalRecords,
      totalPages,
      currentPage: page,
      pageSize: limit,
    });
  } catch (error) {
    console.error('Error fetching submissions with search:', error);
    safeLog({
      unique_id: 'getAllSubmissions',
      request: { api: 'getAllSubmissions', query: req.query },
      response: { error: error?.response?.data || error.toString(), stack: error.stack }
    });
    res.status(500).json({
      error: 'Error fetching submissions with search',
      details: error.message,
    });
  }
};
 
 


exports.getPersonalBank = async (req, res) => {
  try {
    // 1) Extract page & limit from query (fallback to page=1, limit=10)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    // 2) Build Aggregation Pipeline
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { 'leadWithDetails.subServiceName' : 'Personal Bank Account Opening' } },

      { $addFields: { dateKey: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } },

      { $sort: { createdAt: -1 } },

      { $group: { _id: "$dateKey", items: { $push: "$$ROOT" } } },

      { $addFields: { items: { $reverseArray: "$items" } } },

      { $sort: { _id: -1 } },

      { $unwind: "$items" },

      { $replaceRoot: { newRoot: "$items" } },

      { $skip: skip },
      { $limit: limit }
    ];

    const finalPipeline = [
      {
        $facet: {
          metadata: [ 
            { $match: { 'leadWithDetails.subServiceName' : 'Personal Bank Account Opening' } },
            { $count: "total" }
          ],
          data: pipeline
        }
      }
    ];

    const aggResult = await Pidata.aggregate(finalPipeline);

   
    const meta = aggResult[0]?.metadata?.[0] || {};
    const totalRecords = meta.total || 0; // If none found, total will be 0
    const data = aggResult[0]?.data || [];
 
    // 4) totalPages from totalRecords
    const totalPages = Math.ceil(totalRecords / limit);
 
    // 5) For each doc, call external KYC status API
    const mergedResults = [];

    for (const doc of data) {
      let kycStatus = 'Unknown';
      try {
        const leadId = doc?.leadWithDetails?.LeadId;
        if (leadId) {
          const authResponse = await axios.post(
            `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/status`,
            {
              CustomerId: leadId,
              CompanyName: 'Virtuzone'
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.authToken}` // Or do a separate authenticate call if needed
              }
            }
          );
          kycStatus = authResponse.data?.CustomerStatus || 'Unknown';

          // Optionally update the original Pidata doc with KYC status
          await Pidata.updateOne(
            { _id: doc._id },
            { $set: { kycStatus } }
          );
        }
      } catch (error) {
        console.error('Error fetching KYC status:', error.message);
      }

      // Attach the KYC status
      doc.kycStatus = kycStatus;

      mergedResults.push(doc);
    }
    safeLog({
      unique_id: 'getPersonalBank',
      request: { api: 'getPersonalBank', query: req.query, url: req.originalUrl },
      response: { data: mergedResults, totalRecords, totalPages, currentPage: page, pageSize: limit }
    });
    // 6) Return the final array with paginated results and KYC status
    res.status(200).json({
      data: mergedResults, // Up to 'limit' docs with KYC status
      totalRecords,
      totalPages,
      currentPage: page,
      pageSize: limit
    });
  } catch (error) {
    safeLog({
      unique_id: 'getPersonalBank',
      request: { api: 'getPersonalBank', query: req.query, url: req.originalUrl },
      response: { error: error?.response?.data || error.toString(), stack: error.stack }
    });
    console.error('Error fetching personal bank submissions:', error);
    res.status(500).json({
      error: 'Error fetching personal bank submissions',
      details: error.message
    });
  }
};




exports.getBusinessBank = async (req, res) => {
  try {
    // 1) Extract page & limit from query (fallback to page=1, limit=10)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
   // 2) Build Aggregation Pipeline
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: { 'leadWithDetails.subServiceName' : 'Business Bank Account Opening' } },

      { $addFields: { dateKey: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } },

      { $sort: { createdAt: -1 } },

      { $group: { _id: "$dateKey", items: { $push: "$$ROOT" } } },

      { $addFields: { items: { $reverseArray: "$items" } } },

      { $sort: { _id: -1 } },

      { $unwind: "$items" },

      { $replaceRoot: { newRoot: "$items" } },

      { $skip: skip },
      { $limit: limit }
    ];

    const finalPipeline = [
      {
        $facet: {
          metadata: [ 
            { $match: { 'leadWithDetails.subServiceName' : 'Business Bank Account Opening' } },
            { $count: "total" }
          ],
          data: pipeline
        }
      }
    ];

    const aggResult = await Pidata.aggregate(finalPipeline);

   
    // Structure of aggResult[0]
    const meta = aggResult[0]?.metadata?.[0] || {};
    const totalRecords = meta.total || 0; // If none found, total will be 0
    const data = aggResult[0]?.data || [];
 
    // Calculate totalPages from totalRecords
    const totalPages = Math.ceil(totalRecords / limit);
 
    // 4) Optionally perform any other additional logic (e.g., KYC status) if required

    safeLog({
      unique_id: 'getBusinessBank',
      request: { api: 'getBusinessBank', query: req.query,url: req.originalUrl },
      response: { data, totalRecords, totalPages, currentPage: page, pageSize: limit }
    });
    // 5) Return the final array + pagination info
    res.status(200).json({
      data: data, // Paginated data from the business category
      totalRecords,
      totalPages,
      currentPage: page,
      pageSize: limit,
    });
 
  } catch (error) {
    console.error("Error fetching business bank submissions:", error);
    safeLog({
      unique_id: 'getBusinessBank',
      request: { api: 'getBusinessBank', query: req.query, url: req.originalUrl },
      response: { error: error?.response?.data || error.toString(), stack: error.stack }
    });
    res.status(500).json({
      error: "Error fetching business bank submissions",
      details: error.message,
    });
  }
};



exports.submitService = async (req, res) => {
  try {
    const { serviceName, description, isActive } = req.body;

    // Check if a service with the same name already exists
    const existingService = await Service.findOne({ serviceName });
    if (existingService) {
      return res.status(400).json({
        error: "Duplicate entry",
        message: `A service with the name '${serviceName}' already exists.`,
      });
    }

    // Log the uploaded file to confirm file upload
    console.log("Uploaded file:", req.file);

    // Handle file upload for service icon
    const serviceIcon = req.file ? req.file.path : ""; // Use req.file for single file uploads

    // Create and save new service
    const newService = new Service({
      serviceName,
      description,
      isActive: isActive || true, // Defaults to true if not provided
      icon: serviceIcon, // Save the file path
    });

    const savedService = await newService.save();
    safeLog({
      unique_id: 'submitService',
      request: { api: 'submitService', body: req.body, url: req.originalUrl },
      response: savedService
    });
    res
      .status(201)
      .json({ message: "Service created successfully", service: savedService });
  } catch (error) {
    safeLog({
      unique_id: 'submitService',
      request: { api: 'submitService', body: req.body, url: req.originalUrl },
      response: { error: error?.response?.data || error.toString(), stack: error.stack }
    });
    res
      .status(500)
      .json({ error: "Error creating service", details: error.message });
  }
};


exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find(); // Fetch all services from the database
    safeLog({
      unique_id: 'getAllServices',
      request: { api: 'getAllServices', url: req.originalUrl },
      response: services
    });

    res.status(200).json(services); // Send back all services as JSON
  } catch (error) {
    safeLog({
      unique_id: 'getAllServices',
      request: { api: 'getAllServices', url: req.originalUrl },
      response: { error: error?.response?.data || error.toString(), stack: error.stack }
    });
    res
      .status(500)
      .json({ error: "Error fetching services", details: error.message });
  }
};


exports.createService = async (req, res) => {
  try {
    const { serviceName, description, isActive } = req.body;

    // Basic validation
    if (!serviceName || !description) {
      return res.status(400).json({ error: "serviceName and description are required." });
    }

    // Create and save the new service
    const newService = new Service({
      serviceName,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    const savedService = await newService.save();
    safeLog({
      unique_id: 'createService',
      request: { api: 'createService', body: req.body, url: req.originalUrl },
      response: savedService
    });
    res.status(201).json(savedService);
  } catch (error) {
    safeLog({
      unique_id: 'createService',
      request: { api: 'createService', body: req.body , url: req.originalUrl },
      response: { error: error?.response?.data || error.toString(), stack: error.stack }
    });
    res.status(500).json({ error: "Error creating service", details: error.message });
  }
};



exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      "mykey",
      { expiresIn: "10h" }
    );
    safeLog({
          unique_id: admin._id.toString(),
          request: {
            api: 'loginAdmin',
            url: '/api/admin/login',
            body: { email } 
          },
          response: {
            message: "Login successful",
            token,
            admin: { id: admin._id, username: admin.username, email: admin.email }
          }
        });
    // Send back the token and admin info
    res.status(200).json({
      message: "Login successful",
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email },
    });
  } catch (error) {
    console.error("Error during admin login:", error);
     safeLog({
      unique_id: email || 'unknown',
      request: {
        api: 'loginAdmin',
        body: { email },
        url: '/api/admin/login'
      },
      response: {
        error: error.message,
        stack: error.stack
      }
    });
    res.status(500).json({ error: "Server error", details: error.message });
  };


}
// Update Method in your service controller
exports.updateService = async (req, res) => {
  const { serviceId } = req.params; // Get the service ID from the request parameters
  const { serviceName, description, isActive } = req.body; // Destructure the new values from the request body

  try {
      // Find the service by ID
      const service = await Service.findById(serviceId);
      if (!service) {
          return res.status(404).json({ message: 'Service not found' });
      }

      // Update the service details
      service.serviceName = serviceName || service.serviceName; // Update only if new value is provided
      service.description = description || service.description; // Update only if new value is provided
      service.isActive = isActive !== undefined ? isActive : service.isActive; // Update only if new value is provided

      // Handle file upload for service icon if a new file is uploaded
      if (req.file) {
          service.icon = req.file.path; // Update the icon if a new file is uploaded
      }

      // Save the updated service
      const updatedService = await service.save();

        safeLog({
          unique_id: serviceId,
          request: {
            api: 'updateService',
            url: `/api/services/${serviceId}`,
            params: req.params,
            body: req.body,
            file: req.file ? req.file.path : null
          },
          response: updatedService
        });
      res.status(200).json({ message: 'Service updated successfully', service: updatedService });
  } catch (error) {
      safeLog({
        unique_id: serviceId,
        request: {
          api: 'updateService',
          params: req.params,
          body: req.body,
          file: req.file ? req.file.path : null,
          url: `/api/services/${serviceId}`
        },
        response: {
          error: error?.response?.data || error.toString(),
          stack: error.stack
        }
      });
      res.status(500).json({ error: 'Error updating service', details: error.message });
  }
};


 exports.payNowByStripe = async (req, res) => {

  
  const { amount } = req.body;

  // const data = await PiData.findOne({
  //   $or: [{ quoteId: quoteId }, { quotePaymentId: quoteId }],
  // });

  // const order_number = '342423423';
  // const acountname = data.quoteName;
  // const acountemail = data.quoteEmail;
  const order_amount = Number(amount).toFixed(2);
  const order_number = "order-1234";
  // const order_amount = "0.19";
  const order_currency = "AED";
  const order_description = "gift";
  const password = "23515a8aacd96768236258c7d8afc206"; // Replace with your password

  // Create hash
  const stringToHash =
  order_number + order_amount + order_currency + order_description + password;
  console.log("String to hash:", stringToHash); // log the string to be hashed
  const md5hash = crypto
    .createHash("md5")
    .update(stringToHash.toUpperCase())
    .digest("hex");
  console.log(md5hash);

  const sha1Hash = crypto.createHash("sha1").update(md5hash).digest("hex");
  console.log("SHA-1 Hash:", sha1Hash);

  // const accountDetailsResult = await AccountDetail.find();
  // if (!accountDetailsResult || accountDetailsResult.length === 0) {
  //   return res.status(400).json({ message: "Account details not found" });
  // }


  // console.log("Access Token:", accessToken);

  // Create a new PaymentForm instance



  try {
    const stripeResponse = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aed", // Replace with your currency code
            product_data: {
              name: "Test", // Replace with your product name
            },
            unit_amount: amount  * 100, // Specify the amount in cents (e.g., $10.00 USD)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://ecommerce.virtuzone.com/home`,
      cancel_url: `https://ecommerce.virtuzone.com/home`,
    });

    const stripeResponseData = stripeResponse;

     safeLog({
      unique_id: order_number,
      request: {
        api: 'payNowByStripe',
        body: req.body,
        url: 'https://api.stripe.com/v1/checkout/sessions',
        hash: sha1Hash,
      },
      response: stripeResponseData
    });
    const combinedResponse = {
      // message: "Online Payment",
      // GL_code: "1352 - Payment Gateway",
      // bank_name: "Payment Gateway",
      // Bankstatus: newOnlinePayForm.status,
      // Name: newOnlinePayForm.customerDetails.name,
      // proformaInvoiceNumber:
      //   newOnlinePayForm.transactionDetails.proformaInvoiceNumber,
      // // receiptfile: newOnlinePayForm.fileUpload,
      // currencyPaid: newOnlinePayForm.transactionDetails.currencyPaid,
      stripeData: stripeResponseData, // Include data from the first response here
    };

    res.status(200).json(combinedResponse);
  } catch (error) {
    console.error(
      "Error creating checkout session:",
      error.response.data.error
    );
    safeLog({
      unique_id: order_number,
      request: {
        api: 'payNowByStripe',
        body: req.body,
        hash: sha1Hash,
        url: 'https://api.stripe.com/v1/checkout/sessions'
      },
      response: {
        error: error?.response?.data || error.toString(),
        stack: error.stack
      }
    });
    res.status(500).send("Error creating checkout session");
  }
}

exports.checkUser = async (req,res) => {
  const { email, mobileNumber } = req.body;
console.log(req.body)
  try {
    // Check if the email already exists
    const emailExists = await UserDetails.findOne({ email });

    // Check if the mobile number already exists
    const mobileNumberExists = await UserDetails.findOne({ 
      'mobileNumber.e164Number': mobileNumber.e164Number 
    });

    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    if (mobileNumberExists) {
      return res.status(400).json({ message: 'Mobile number already exists' });
    }
      safeLog({
        unique_id: email,
        request: { api: 'checkUser', body: req.body, url: req.originalUrl },
        response: { message: 'Email and mobile number are available' }
      });
    // If neither exists, send a success response
    res.status(200).json({ message: 'Email and mobile number are available' });
  } catch (error) {
    console.error(error);
    safeLog({
      unique_id: email,
      request: { api: 'checkUser', body: req.body, url: req.originalUrl },
      response: { error: error?.response?.data || error.toString(), stack: error.stack }
    });
    res.status(500).json({ message: 'Server error' });
  }

  
}

exports.deleteService = async (req, res) => {
  const { serviceId } = req.params; // Get the service ID from the request parameters

  try {
      // Find the service by ID and remove it
      const deletedService = await Service.findByIdAndDelete(serviceId);
      if (!deletedService) {
          return res.status(404).json({ message: 'Service not found' });
      }
      safeLog({
          unique_id: 'deleteService',
          request: { api: 'deleteService', params: req.params, url: req.originalUrl },
          response: { message: 'Service deleted successfully', service: deletedService }
        });

      res.status(200).json({ message: 'Service deleted successfully', service: deletedService });
  } catch (error) {

    safeLog({
      unique_id: 'deleteService',
      request: { api: 'deleteService', params: req.params , url: req.originalUrl },
      response: { error: error?.response?.data || error.toString(), stack: error.stack }
    });
      res.status(500).json({ error: 'Error deleting service', details: error.message });
  }

};


exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    safeLog({
      unique_id: 'getMenuItems',
      request: { api: 'getMenuItems', url: req.originalUrl }, 
      response: menuItems
    });
    res.json(menuItems); // Send submenu items as JSON
  } catch (error) {
    safeLog({
        unique_id: 'getMenuItems',
        request: { api: 'getMenuItems', url: req.originalUrl },
        response: { error: error?.response?.data || error.toString(), stack: error.stack }
      });
    res.status(500).json({ error: 'Error fetching menu items' });
  }
};


exports.addMenuItems = async (req, res) => {
  const menuItems = req.body; // Expecting an array of menu items

  try {
    // Bulk insert all menu items
    const newMenuItems = await MenuItem.insertMany(menuItems);
    safeLog({
      unique_id: 'addMenuItems',
      request: { api: 'addMenuItems', body: req.body },
      response: newMenuItems
    });
    res.status(201).json({ message: 'Menu items created successfully', menuItems: newMenuItems });
  } catch (error) {
    safeLog({
      unique_id: 'addMenuItems',
      request: { api: 'addMenuItems', body: req.body },
      response: { error: error?.response?.data || error.toString(), stack: error.stack }
    });
    res.status(500).json({ error: 'Error creating menu items', details: error.message });
  }
};


exports.checkStatus = async (req, res) => {
  // Destructure CustomerId and CompanyName from the request body
  const { CustomerId, CompanyName } = req.body;
 
  try {
    // Step 1: Authenticate to get the token
    const authResponse = await axios.post(
      `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/authenticate`,
      {
        username: 'VirtuUAT',
        password: 'VirtuApiuat@123',
        CompanyName: 'Virtuzone',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
 
    const authToken = authResponse.data.token; // Assuming the token is in authResponse.data.token
 
    // Step 2: Call the status API with the provided payload from the request body
    const statusResponse = await axios.post(
      `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/status`,
      {
        CustomerId: CustomerId,
        CompanyName: CompanyName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
 
    // Extract response data from the status API
    const statusData = statusResponse.data;
    
 
    // Step 3: Find the Pidata entry using the LeadId in leadWithDetails to match CustomerId
    const pidata = await Pidata.findOne({ 'leadWithDetails.LeadId': CustomerId });
 
    if (!pidata) {
      return res.status(404).json({ error: 'Pidata not found' });
    }
 
    // Update the kycStatus field with the value from the API response
 
    pidata.kycStatus = statusData.CustomerStatus;
    // Save the updated record
    await pidata.save();
 
      safeLog({
      unique_id: CustomerId || 'unknown',
      request: {
        api: 'checkStatus',
        body: { CustomerId, CompanyName },
        url: `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/status`
      },
      response: {
        message: 'Status retrieved and Pidata updated successfully',
        data: statusData
      }
    });
    // Send a success response with status data
    res.status(200).json({
      message: 'Status retrieved and Pidata updated successfully',
      data: statusData,
    });
 
  } catch (error) {
    console.error('Error retrieving or updating status:', error);
     safeLog({
      unique_id: CustomerId || 'unknown',
      request: {
        api: 'checkStatus',
        url: `${process.env.EXTERNAL_API_SCREENING_URL}/api/customer/status`,
        body: { CustomerId, CompanyName }
      },
      response: {
        error: error.message,
        stack: error.stack
      }
    });
    res.status(500).json({
      error: 'Error retrieving or updating status',
      details: error.message,
    });
  }
};

exports.getallUserSerive = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
 
    const userData = await Pidata.find({ "leadWithDetails.Email": email });
    if (!userData || userData.length === 0) {
      return res.status(404).json({ message: "No data found for this user" });
    }
 
    // Authenticate with Salesforce once to get access token
    const tokenResponse = await axios.post(
      "https://test.salesforce.com/services/oauth2/token",
      null,
      {
        params: {
          client_id: process.env.SALESFORCE_CLIENT_ID,
          client_secret: process.env.SALESFORCE_CLIENT_SECRET,
          grant_type: "password",
          username: process.env.SALESFORCE_USERNAME,
          password: process.env.SALESFORCE_PASSWORD,
        },
      }
    );
 
    const accessToken = tokenResponse.data.access_token;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
 
    // Helper function to process each quoteDetail
    async function processQuoteDetail(quoteDetail) {
      const quotePaymentId = quoteDetail.QuotePaymentId;
      if (!quotePaymentId) {
        console.log("No QuotePaymentId found, skipping this quoteDetail");
        return;
      }
 
      const paynowdata = await OnlinePayment.findOne({
        "transactionDetails.quotePaymentId": quotePaymentId,
      });
 
      if (!paynowdata) {
        console.log("No payment data found for quotePaymentId:", quotePaymentId);
        return;
      }
 
      console.log("Found payment data, making Salesforce API call for quotePaymentId:", quotePaymentId);
 
      try {
        const response = await axios.put(
          `${process.env.SALESFORCE_API_URL}/services/apexrest/VZAR_ProformaInvoiceUpdate/${quotePaymentId}`,
          {
            qp: {
              paymentMethod: "Pay Now",
              amountReceived: paynowdata.transactionDetails.amount,
              bankName: "Payment Gateway",
              glCode: "1301 - VZ ADCB (AED) 10515838124001",
              payCurrency: "AED",
              paymentStatus: "Paid",
              quotePaymentId: paynowdata.transactionDetails.quotePaymentId,
            },
            attachments: [
              { Body: "", ContentType: "", Name: "" },
              { Body: "", ContentType: "", Name: "" },
            ],
          },
          { headers }
        );
 
        console.log("Salesforce API response data:", response.data);
 
        const { invoiceDate, invoiceNumber } = response.data;
        
        // Update Pidata record if found
        const piDataCheck = await Pidata.findOne({ "quotePaymentWithDetails.QuotePaymentId": quotePaymentId });
        if (piDataCheck) {
          await Pidata.updateOne(
            { _id: piDataCheck._id },
            {
              $set: {
                invoiceDate,
                invoiceNumber,
                payment_status: "Paid",
              },
            }
          );
        }
      } catch (err) {
        console.error(`Failed to update Salesforce for quotePaymentId ${quotePaymentId}:`, err.message);
      }
    }
 
    // Process each user record
    for (const userRecord of userData) {
      console.log("Processing userRecord with _id:", userRecord._id);
 
      const quoteDetails = userRecord.quotePaymentWithDetails;
 
      if (quoteDetails) {
        if (Array.isArray(quoteDetails)) {
          for (const quoteDetail of quoteDetails) {
            await processQuoteDetail(quoteDetail);
          }
        } else if (typeof quoteDetails === "object") {
          await processQuoteDetail(quoteDetails);
        } else {
          console.log("quotePaymentWithDetails is neither an array nor an object.");
        }
      } else {
        console.log("No quotePaymentWithDetails found on this user record.");
      }
    }
const updatedUserData = await Pidata.find({ "leadWithDetails.Email": email });
    // await CommondbSalesforceLog.create({
    //       unique_id: email,
    //       request: { api: 'getallUserSerive', body: req.body, url: `${process.env.SALESFORCE_API_URL}/services/apexrest/VZAR_ProformaInvoiceUpdate/${quotePaymentId}` },
    //       response: updatedUserData
    //     });
    // After all done, send success response
    res.status(200).json({
      message: "User data fetched and updated successfully",
      data: updatedUserData,
    });
  } catch (error) {
    console.error("Error fetching/updating user data:", error);
    // await CommondbSalesforceLog.create({
    //     unique_id: email,
    //     request: { api: 'getallUserSerive', body: req.body, url: `${process.env.SALESFORCE_API_URL}/services/apexrest/VZAR_ProformaInvoiceUpdate/${quotePaymentId}` },
    //     response: { error: error?.response?.data || error.toString(), stack: error.stack }
    //   });

    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.updateAdditionalUploadedFiles = async (req, res) => {
  try {
    // Extract payload
    const { payload } = req.body;
    if (!payload) {
      return res.status(400).json({ error: "Payload is required" });
    }

    const { files, someId } = payload;

    // Validate the payload
    if (!someId || !files || !Array.isArray(files)) {
      return res.status(400).json({ error: "Invalid payload structure" });
    }

    // Find the record in the database
    const record = await Pidata.findById(someId);

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Merge existing files with new files
    record.additionalUploadedFiles = [
      ...(record.additionalUploadedFiles || []),
      ...files,
    ];

    // Save the record
    await record.save();
    // await CommondbSalesforceLog.create({
    //   unique_id: someId || 'unknown',
    //   request: { api: 'updateAdditionalUploadedFiles', body: req.body, url: req.originalUrl },
    //   response: record
    // });
    return res.status(200).json({ message: "Files updated successfully", record });
  } catch (err) {
    console.error("Error updating files:", err.message || err);
    // await CommondbSalesforceLog.create({
    //   unique_id: someId || 'unknown',
    //   request: { api: 'updateAdditionalUploadedFiles', body: req.body, url: req.originalUrl },
    //   response: { error: err?.response?.data || err.toString(), stack: err.stack }
    // });
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUserFiles = async (req, res) => {
  try {
    const { payload } = req.body;

    if (!payload || !payload.someId) {
      return res.status(400).json({ error: "someId is required" });
    }

    const { someId, additionalUploadedFiles, uploadedFileNames, shareholders } = payload;


    const record = await Pidata.findById(someId);

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Update the respective fields with filtered arrays
    record.additionalUploadedFiles = additionalUploadedFiles || [];
    record.uploadedFileNames = uploadedFileNames || [];
    record.shareholders = shareholders || [];

    await record.save();
  //   await CommondbSalesforceLog.create({
  //   unique_id: someId || 'unknown',
  //   request: { api: 'updateUserFiles', body: req.body, url: req.originalUrl },
  //   response: record
  // });
    return res.status(200).json({ message: "Files updated successfully", record });
  } catch (error) {
    console.error("Error updating files:", error);
    // await CommondbSalesforceLog.create({
    //   unique_id: someId || 'unknown',
    //   request: { api: 'updateUserFiles', body: req.body, url: req.originalUrl },
    //   response: { error: error?.response?.data || error.toString(), stack: error.stack }
    // });
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};


exports.dashboard = async (req, res) => {
  try {
    // Retrieve counts in parallel
    const [
      virtualReceptionCount,
      mailManagementCount,
      bankOpeningCount,
      personalCount,
      businessCount,
      userCount,
      virtualDetailsCount,
      mailDetailsCount
    ] = await Promise.all([
      Pidata.countDocuments({ planname: 'Virtual Receptionist' }),
      Pidata.countDocuments({ planname: 'Mail Management' }),
      Pidata.countDocuments({ planname: 'Bank Account Opening' }),
      Pidata.countDocuments({ subcategory: 'personal' }),
      Pidata.countDocuments({ subcategory: 'business' }),
      UserDetails.countDocuments(),
      VirtualDetails.countDocuments(),
      MailDetails.countDocuments()
    ]);

    // Sum the user counts
    const totalUser = userCount + virtualDetailsCount + mailDetailsCount;
    // await CommondbSalesforceLog.create({
    //   unique_id: 'dashboard',
    //   request: { api: 'dashboard', url: req.originalUrl },
    //   response: {
    //     virtualReceptionCount,
    //     mailManagementCount,
    //     bankOpeningCount,
    //     personalCount,
    //     businessCount,
    //     totalUser
    //   }
    // });
    // Return the counts + the totalUser in a single response
    return res.json({
      // Pidata-based counts
      virtualReceptionCount,
      mailManagementCount,
      bankOpeningCount,
      personalCount,
      businessCount,

      // Individual model counts
     

      // The combined count
      totalUser
    });
  } catch (error) {
    console.error(error);
    // await CommondbSalesforceLog.create({
    //   unique_id: 'dashboard',
    //   request: { api: 'dashboard', url: req.originalUrl },
    //   response: { error: error?.response?.data || error.toString(), stack: error.stack }
    // });
    return res.status(500).json({
      message: 'Something went wrong',
      error: error.message
    });
  }
};

exports.updateKycStatus = async (req, res) => {
  try {
    const { id, kycStatus } = req.body;
    
 
    // Validate input
    if (!id || !["Approved", "Rejected"].includes(kycStatus)) {
      return res.status(400).json({
        error: "Invalid request. Provide a valid id and kycStatus (Approved/Rejected).",
      });
    }
 
    // Find and update the Pidata document
    const updatedDocument = await Pidata.findByIdAndUpdate(
      id,
      { $set: { kycStatus } },
      { new: true } // Return the updated document
    );
 
    if (!updatedDocument) {
      return res.status(404).json({ error: "Record not found" });
    }
 
    // await CommondbSalesforceLog.create({
    //   unique_id: id,
    //   request: {
    //     api: 'updateKycStatus',
    //     url: '/api/user/updateKycStatus',
    //     body: { id, kycStatus }
    //   },
    //   response: {
    //     message: `KYC status updated successfully to ${kycStatus}`,
    //     updatedDocument
    //   }
    // });
    res.status(200).json({
      message: `KYC status updated successfully to ${kycStatus}`,
      data: updatedDocument,
    });
  } catch (error) {
    console.error("Error updating KYC status:", error);
    //  await CommondbSalesforceLog.create({
    //   unique_id: req.body?.id || 'unknown',
    //   request: {
    //     api: 'updateKycStatus',
    //     url: '/api/user/updateKycStatus',
    //     body: req.body
    //   },
    //   response: {
    //     error: error.message,
    //     stack: error.stack
    //   }
    // });
    res.status(500).json({
      error: "Error updating KYC status",
      details: error.message,
    });
  }
};



exports.getTradeLicenseAndShareholders = async (req, res) => {
  try {
    const leadId = req.query.leadId;
    if (!leadId) {
      return res.status(400).json({ message: 'leadId query param is required' });
    }

    // Find the document
    const doc = await Pidata.findOne({ "leadWithDetails.LeadId": leadId });

    if (!doc) {
      return res.status(404).json({ message: 'Data not found for the given leadId' });
    }

    // Prepare the response with only needed fields
    const response = {
      tradeLicenseFileUrl: doc.tradeLicenseFileUrl || null,
      tradeLicenseNo: doc.tradeLicenseNo || null,
      shareholdersfiles: doc.shareholdersfiles || null,
      shareholderfilesnumber: doc.shareholderfilesnumber || null,
      shareholders: doc.shareholders || [],
      tradeLicenseFile: doc.tradeLicenseFile || [],
      uploadedFileNames: doc.uploadedFileNames || [],
    };
    // await CommondbSalesforceLog.create({
    //   unique_id: leadId || 'unknown',
    //   request: { api: 'getTradeLicenseAndShareholders', query: req.query, url: req.originalUrl },
    //   response
    // });

    return res.json(response);

  } catch (err) {
    // await CommondbSalesforceLog.create({
    //   unique_id: leadId || 'unknown',
    //   request: { api: 'getTradeLicenseAndShareholders', query: req.query , url: req.originalUrl },
    //   response: { error: err?.response?.data || err.toString(), stack: err.stack }
    // });
    console.error('Error getting trade license and shareholders data:', err);
    res.status(500).json({ message: 'Failed to get data' });
  }
};


exports.getStep1 = async (req, res) => {
  try {
    const leadId = req.query.leadId;
    if (!leadId) {
      return res.status(400).json({ message: 'leadId query param is required' });
    }

    const doc = await Pidata.findOne({ "leadWithDetails.LeadId": leadId });

    if (!doc) {
      return res.status(404).json({ message: 'Data not found for the given leadId' });
    }
    // await CommondbSalesforceLog.create({
    //     unique_id: leadId || 'unknown',
    //     request: { api: 'getStep1', query: req.query, url: req.originalUrl },
    //     response: doc.leadWithDetails
    //   });
    return res.json(doc.leadWithDetails);
  } catch (err) {
    console.error('Error getting step1 data:', err);
    // await CommondbSalesforceLog.create({
    //   unique_id: leadId || 'unknown',
    //   request: { api: 'getStep1', query: req.query, url: req.originalUrl },
    //   response: { error: err?.response?.data || err.toString(), stack: err.stack }
    // });
    res.status(500).json({ message: 'Failed to get step1 data' });
  }
};