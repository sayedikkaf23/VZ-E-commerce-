// controllers/serviceProductsController.js
const CountryRisk = require("../models/CountryRisk");
const Nationality=require("../models/nationalityModel")
const Pidata = require('../models/pidata');
require('dotenv').config();
const axios = require('axios');
 
 
exports.getServiceProducts = async (req, res) => {
  try {
    let { ServiceNameCode, SubTypeCode, RiskCode } = req.body;
 
    // Check if RiskCode is a number (if it's a direct value)
    if (typeof RiskCode === 'number') {
      // If RiskCode is a number, directly use it in the payload
      const requestBody = JSON.stringify({
        ServiceNameCode: ServiceNameCode,
        SubTypeCode: SubTypeCode,
        RiskCode: RiskCode,
      });
 
      // 1) grab Salesforce OAuth token
      const tokenResp = await axios.post(
        `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
        null,
        {
          params: {
            client_id: '3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip',
            client_secret: '0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1',
            grant_type: 'password',
            username: 'vzpaymentapi@vz.ae.vzfullcopy',
            password: 'VZ@12345678',
          },
        }
      );
 
      const salesforceUrl = tokenResp.data.instance_url;
 
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${salesforceUrl}/services/apexrest/VZAR_ServicesProducts/`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResp.data.access_token}`,
        },
        data: requestBody,
      };
 
      const salesforceResponse = await axios.request(config);
      // 2) call the Apex REST endpoint as GET + params
 
      // 3) return the product payload
      return res.status(200).json(salesforceResponse.data);
    } else {
      // If RiskCode is a string (likely country), perform lookup in the CountryRisk collection
      const countryData = await CountryRisk.findOne({ country: RiskCode });
 
      if (!countryData) {
        return res.status(400).json({
          message: 'Invalid country provided. Risk rating not found'
        });
      }
 
      // Use the RiskRating from the countryData
      RiskCode = countryData.RiskRating;
      console.log('Using RiskCode from CountryRisk:', RiskCode);
    }
 
    const requestBody = JSON.stringify({
      ServiceNameCode: ServiceNameCode,
      SubTypeCode: SubTypeCode,
      RiskCode: RiskCode,
    });
 
    // 1) grab Salesforce OAuth token
    const tokenResp = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
      null,
      {
        params: {
          client_id: '3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip',
          client_secret: '0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1',
          grant_type: 'password',
          username: 'vzpaymentapi@vz.ae.vzfullcopy',
          password: 'VZ@12345678',
        },
      }
    );
 
    const salesforceUrl = tokenResp.data.instance_url;
 
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${salesforceUrl}/services/apexrest/VZAR_ServicesProducts/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenResp.data.access_token}`,
      },
      data: requestBody,
    };
 
    const salesforceResponse = await axios.request(config);
    // 2) call the Apex REST endpoint as GET + params
 
    // 3) return the product payload
    return res.status(200).json(salesforceResponse.data);
 
  } catch (err) {
    console.error('getServiceProducts error:', err || err);
    return res.status(500).json({
      message: 'Failed to fetch service products',
      error: err.response?.data || err.toString(),
    });
  }
};
 
 
 
exports.createPaymentOpportunity = async (req, res) => {
  try {
    const { firstName, lastName, email, phone,countryCode,dob, prodcutNameList,nationality,type,CustomerType, subcategory, uploadedFileNames = [],  shareholders = []  } = req.body;
// console.log(req.body)
    // Log the RiskCode to ensure it's what you expect
    // console.log("Received RiskCode:", RiskCode);   countryCode:this.personalInfo.mobileNumber.dialCode,
    const cleanedPhone = phone.replace(/\s+/g, '');  // Removes all spaces
 const cleanedProductList = prodcutNameList.map(({ vat, ...rest }) => rest);

    // 1) Fetch nationality based on RiskCode (country)
    const nationalityData = await Nationality.findOne({ Country:nationality });
 
    if (!nationalityData) {
      return res.status(400).json({
        message: 'Invalid country provided. Nationality not found.',
      });
    }
    // console.log("nationlity",nationalityData)
 
    // Now we have the nationality value from the Nationality model
    const nationalitys = nationalityData.Value;  // Assuming `Value` field stores the nationality
   
    // 2) Grab Salesforce OAuth token
    const tokenResp = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
      null,
      {
        params: {
          client_id: '3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip',
          client_secret: '0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1',
          grant_type: 'password',
          username: 'vzpaymentapi@vz.ae.vzfullcopy',
          password: 'VZ@12345678',
        },
      }
    );
 
    const salesforceUrl = tokenResp.data.instance_url;
 
    const requestBody = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      nationality: nationalitys,  // Add nationality data fetched from Nationality model
      countryCode:countryCode,
      phone: cleanedPhone,
      dob: dob,
      prodcutNameList: cleanedProductList,
    };
 console.log(requestBody,"requestBody")
 
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${salesforceUrl}/services/apexrest/VZAR_CreateOpportunity/`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenResp.data.access_token}`,
      },
      data: JSON.stringify(requestBody),
    };
 
    const salesforceResponse = await axios.request(config);
    console.log(salesforceResponse)
 
 
    const errorText = salesforceResponse.data && salesforceResponse.data.error ? salesforceResponse.data.error : '';
 
  // Check if error text contains "DUPLICATE_VALUE"
  if (errorText.includes('DUPLICATE_VALUE')) {
    return res.status(400).json({
     
      error: errorText
    });
  }
 
console.log("salesforceResponse",salesforceResponse.data)
    let subTotal = 0;
    let totalPrice = 0;
   
for (const product of prodcutNameList) {
  const unitPrice = product.ProductUnitprice || 0;
  const quantity = product.ProductQuantity || 1;
  const discount = product.ProductDiscount || 0;
  const vat = product.vat || 0;

  const productTotal = (unitPrice * quantity) - discount;
  
  // Add VAT if vat > 0, else ignore
  const vatAmount = vat > 0 ? (productTotal * vat) / 100 : 0;

  subTotal += productTotal + vatAmount;
}
   
    // Here, totalPrice = subTotal, or you can add tax/extra if needed
    totalPrice = subTotal;
 
 
    const pidataDoc = await Pidata.create({
      leadWithDetails: {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Nationality: nationality,
        Phone: cleanedPhone,
         countryCode:countryCode,
        Origin__c: 'Website',     // or whatever source you want
        Status: 'Created',
        dob: dob,
        LeadId: salesforceResponse.data?.LeadId ,
      },
      quotePaymentWithDetails: {
        QuotePaymentId:salesforceResponse.data?.QuotePaymentId
      },
      quoteWithProductDetails: {
        quoteEmail: email,
        quoteName: firstName + ' ' + lastName,
        // QuotePaymentName: salesforceResponse.data?.QuotePaymentName,
        quotePaymentId: salesforceResponse.data?.QuotePaymentId,
        totalIncludingVAT:totalPrice,
        subTotal:subTotal,
        totalPrice:totalPrice,
        product: req.body.prodcutNameList   // store the whole array
      },
      salesPersonDetails:{
        salesPersonName: salesforceResponse.data?.salesPersonDetails.salesPersonName,
        salesPersonEmail: salesforceResponse.data?.salesPersonDetails.salesPersonEmail,
        salesPersonMobile: salesforceResponse.data?.salesPersonDetails.salesPersonMobile,
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
      uploadedFileNames,
      planname:type,
      subcategory:subcategory,
      customerType:CustomerType,
    });
 
 
 
 
    return res.status(200).json(salesforceResponse.data);
 
  } catch (err) {
    console.error('createOpportunity error:', err);
    return res.status(500).json({
      message: 'Failed to create opportunity',
      error: err.response?.data || err.toString(),
    });
  }
};
 


exports.insertDocumentsFromShareholders = async (req, res) => {
  try {
    const { quotePaymentId, serviceName, shareholders } = req.body;

    if (!quotePaymentId || !serviceName || !Array.isArray(shareholders)) {
      return res.status(400).json({ message: "Missing or invalid data" });
    }

    const payload = {
      quotePaymentId,
      serviceName,
      shareholders: shareholders.map(s => ({
        name: s.name,
        shareholderPercentage: s.shareholderPercentage,
        dob: s.dob,
        nationalityshareholder: s.nationalityshareholder,
        files: s.files.map(f => ({
          name: f.name,
          url: f.url,
          type: f.type,
          oopId: f.oopId
        }))
      }))
    };

    // 1. Get Salesforce token
    const tokenResp = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
      null,
      {
        params: {
          client_id: '3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip',
          client_secret: '0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1',
          grant_type: 'password',
          username: 'vzpaymentapi@vz.ae.vzfullcopy',
          password: 'VZ@12345678',
        },
      }
    );

    const salesforceUrl = tokenResp.data.instance_url;

    // 2. Send request to Salesforce Apex endpoint
    const response = await axios.post(
      `${salesforceUrl}/services/apexrest/insertDocumentsFromShareholders`,
      JSON.stringify(payload),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenResp.data.access_token}`,
        },
      }
    );

    return res.status(200).json({
      message: "Documents successfully pushed to Salesforce",
      data: response.data
    });

  } catch (err) {
    console.error("insertDocumentsFromShareholders error:", err);
    return res.status(500).json({
      message: "Failed to insert documents",
      error: err.response?.data || err.toString(),
    });
  }
};




exports.createLeadOnly = async (req, res) => {
  try {
    const { firstName, lastName, email, nationality, phone, dob } = req.body;

    if (!firstName || !lastName || !email || !nationality || !phone || !dob) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Step 1: Get Salesforce token
    const tokenResp = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
      null,
      {
        params: {
          client_id: '3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip',
          client_secret: '0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1',
          grant_type: 'password',
          username: 'vzpaymentapi@vz.ae.vzfullcopy',
          password: 'VZ@12345678',
        },
      }
    );

    const accessToken = tokenResp.data.access_token;
    const salesforceUrl = tokenResp.data.instance_url;

    // Step 2: Call the CreateLeadOnly API
    const leadResp = await axios.post(
      `${salesforceUrl}/services/apexrest/VZAR_CreateLeadOnly/`,
      {
        firstName,
        lastName,
        email,
        nationality,
        phone,
        dob,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.status(200).json({
      message: "Lead created successfully",
      data: leadResp.data,
    });

  } catch (err) {
    console.error("createLeadOnly error:", err);
    return res.status(500).json({
      message: "Failed to create lead",
      error: err.response?.data || err.toString(),
    });
  }
};
