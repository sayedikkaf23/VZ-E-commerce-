// controllers/serviceProductsController.js
const CountryRisk = require("../models/CountryRisk");
const Nationality=require("../models/nationalityModel")

require('dotenv').config();
const axios = require('axios');

 
exports.getServiceProducts = async (req, res) => {
  try {
    let  { ServiceNameCode, SubTypeCode, RiskCode } = req.body;
 
    const countryData = await CountryRisk.findOne({ country: RiskCode });

    if (!countryData) {
      return res.status(400).json({
        message: 'Invalid country provided. Risk rating not found '
      });
    }

    RiskCode = countryData.RiskRating;

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
      error: err.response?.data || err.toString()
    });
  }
};


exports.createPaymentOpportunity = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dob, prodcutNameList,nationality } = req.body;
// console.log(req.body)
    // Log the RiskCode to ensure it's what you expect
    // console.log("Received RiskCode:", RiskCode);
    const cleanedPhone = phone.replace(/\s+/g, '');  // Removes all spaces

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
      phone: cleanedPhone,
      dob: dob,
      prodcutNameList: prodcutNameList,
    };

    // console.log(requestBody)

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

    console.log(config)
    const salesforceResponse = await axios.request(config);

    return res.status(200).json(salesforceResponse.data);

  } catch (err) {
    console.error('createOpportunity error:', err);
    return res.status(500).json({
      message: 'Failed to create opportunity',
      error: err.response?.data || err.toString(),
    });
  }
};
