// controllers/serviceProductsController.js
const CountryRisk = require("../models/CountryRisk");
const Nationality = require("../models/nationalityModel");
const Pidata = require("../models/pidata");
require("dotenv").config();
const axios = require("axios");

exports.getServiceProducts = async (req, res) => {
  try {
    let { ServiceNameCode, SubTypeCode, RiskCode } = req.body;

    // Check if RiskCode is a number (if it's a direct value)
    if (typeof RiskCode === "number") {
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
            client_id:
              "3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip",
            client_secret:
              "0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1",
            grant_type: "password",
            username: "vzpaymentapi@vz.ae.vzfullcopy",
            password: "Virtuzone@1234",
          },
        }
      );

      const salesforceUrl = tokenResp.data.instance_url;

      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${salesforceUrl}/services/apexrest/VZAR_ServicesProducts/`,
        headers: {
          "Content-Type": "application/json",
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
          message: "Invalid country provided. Risk rating not found",
        });
      }

      // Use the RiskRating from the countryData
      RiskCode = countryData.RiskRating;
      console.log("Using RiskCode from CountryRisk:", RiskCode);
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
          client_id:
            "3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip",
          client_secret:
            "0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1",
          grant_type: "password",
          username: "vzpaymentapi@vz.ae.vzfullcopy",
          password: "Virtuzone@1234",
        },
      }
    );

    const salesforceUrl = tokenResp.data.instance_url;

    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${salesforceUrl}/services/apexrest/VZAR_ServicesProducts/`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenResp.data.access_token}`,
      },
      data: requestBody,
    };

    const salesforceResponse = await axios.request(config);
    // 2) call the Apex REST endpoint as GET + params

    // 3) return the product payload
    return res.status(200).json(salesforceResponse.data);
  } catch (err) {
    console.error("getServiceProducts error:", err || err);
    return res.status(500).json({
      message: "Failed to fetch service products",
      error: err.response?.data || err.toString(),
    });
  }
};

exports.createPaymentOpportunity = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      dob,
      prodcutNameList,
      nationality,
      type,
      CustomerType,
      subcategory,
      LeadId,
      subServiceName,
      AccountId,
      ContactId,
      ProductId,
      tradeLicenseFile = [],
       isLead,
      companyLocationUAE,
      employmentType,
      companyName,
      salary,
      bankType,
      companyLicensed,
      activityType,
      totalShareholders,
      companyTurnover,
      companyLocation,
      companyWebsite,
      tradeLicenseNo,
      shareholderfilesnumber,
      tradeLicenseFileUrl,
      uploadedFileNames = [],
      shareholders = [],
      shareholdersfiles,
      serviceName
    } = req.body;
    // console.log(req.body)
    // Log the RiskCode to ensure it's what you expect
    // console.log("Received RiskCode:", RiskCode);   countryCode:this.personalInfo.mobileNumber.dialCode,
    const cleanedPhone = phone.replace(/\s+/g, ""); // Removes all spaces
    const cleanedProductList = prodcutNameList.map(({ vat, ...rest }) => rest);

    // 1) Fetch nationality based on RiskCode (country)
    const nationalityData = await Nationality.findOne({ Country: nationality });

    if (!nationalityData) {
      return res.status(400).json({
        message: "Invalid country provided. Nationality not found.",
      });
    }
    // console.log("nationlity",nationalityData)

    // Now we have the nationality value from the Nationality model
    const nationalitys = nationalityData.Value; // Assuming `Value` field stores the nationality

    // 2) Grab Salesforce OAuth token
    const tokenResp = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
      null,
      {
        params: {
          client_id:
            "3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip",
          client_secret:
            "0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1",
          grant_type: "password",
          username: "vzpaymentapi@vz.ae.vzfullcopy",
          password: "Virtuzone@1234",
        },
      }
    );

    const salesforceUrl = tokenResp.data.instance_url;

    const requestBody = {
      LeadId: LeadId || null, // Optional, if provided
      AccountId: AccountId || null, // Optional, if provided
      ContactId: ContactId || null, // Optional, if provided
      // firstName: firstName,
      // lastName: lastName,
      // email: email,
      // nationality: nationalitys, // Add nationality data fetched from Nationality model
      // countryCode: countryCode,
      // phone: cleanedPhone,
      // dob: dob,
      subServiceName: subServiceName || null, // Optional, if provided
      serviceName: serviceName || null, // Optional, if provided
      prodcutNameList: cleanedProductList,
    };
    console.log(requestBody, "requestBody");

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${salesforceUrl}/services/apexrest/VZAR_CreateOpportunity/`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenResp.data.access_token}`,
      },
      data: JSON.stringify(requestBody),
    };

    const salesforceResponse = await axios.request(config);
    // ✅ Extract and guard data early
    const salesforceData = salesforceResponse?.data || {};
    const errorText = salesforceData?.error || "";

    const isDuplicate = errorText.includes("DUPLICATE_VALUE");
    const isConvertedLead = errorText.includes("CANNOT_UPDATE_CONVERTED_LEAD");

    if (errorText && !isDuplicate && !isConvertedLead) {
      return res.status(400).json({ error: errorText });
    }

    console.log("salesforceResponse", salesforceResponse.data);
    let subTotal = 0;
    let totalPrice = 0;

    for (const product of prodcutNameList) {
      const unitPrice = product.ProductUnitprice || 0;
      const quantity = product.ProductQuantity || 1;
      const discount = product.ProductDiscount || 0;
      const vat = product.vat || 0;

      const productTotal = unitPrice * quantity - discount;

      // Add VAT if vat > 0, else ignore
      const vatAmount = vat > 0 ? (productTotal * vat) / 100 : 0;

      subTotal += productTotal + vatAmount;
    }

    // Here, totalPrice = subTotal, or you can add tax/extra if needed
    totalPrice = subTotal;
    const salesPersonDetails = salesforceData?.salesPersonDetails || {};

    //  Update existing piData document by LeadId
    // Build $set object dynamically
const updateFields = {
  "leadWithDetails.FirstName": firstName,
  "leadWithDetails.LastName": lastName,
  "leadWithDetails.Email": email,
  "leadWithDetails.Nationality": nationality,
  "leadWithDetails.Phone": cleanedPhone,
  "leadWithDetails.countryCode": countryCode,
  "leadWithDetails.Origin__c": "Website",
  "leadWithDetails.Status": "Created",
  "leadWithDetails.dob": dob,
  "leadWithDetails.ServiceName": type,
  "leadWithDetails.subServiceName": subServiceName,
  "leadWithDetails.LeadId": salesforceResponse.data?.LeadId ?? LeadId,
  "leadWithDetails.companyLocationUAE": companyLocationUAE,
  "leadWithDetails.employmentType": employmentType,
  "leadWithDetails.Company": companyName,
  "leadWithDetails.salary": salary,
  "leadWithDetails.bankType": bankType,
  "leadWithDetails.companyLicensed": companyLicensed,
  "leadWithDetails.activityType": activityType,
  "leadWithDetails.totalShareholders": totalShareholders,
  "leadWithDetails.companyTurnover": companyTurnover,
  "leadWithDetails.companyLocation": companyLocation,
  "leadWithDetails.companyWebsite": companyWebsite,
  "leadWithDetails.isLead": isLead,

  "quotePaymentWithDetails.QuotePaymentId": salesforceResponse.data?.QuotePaymentId,

  "quoteWithProductDetails.quoteEmail": email,
  "quoteWithProductDetails.quoteName": firstName + " " + lastName,
  "quoteWithProductDetails.quotePaymentId": salesforceResponse.data?.QuotePaymentId,
  "quoteWithProductDetails.totalIncludingVAT": totalPrice,
  "quoteWithProductDetails.subTotal": subTotal,
  "quoteWithProductDetails.totalPrice": totalPrice,
  "quoteWithProductDetails.product": req.body.prodcutNameList,

  "salesPersonDetails.salesPersonName": salesPersonDetails.salesPersonName || null,
  "salesPersonDetails.salesPersonEmail": salesPersonDetails.salesPersonEmail || null,
  "salesPersonDetails.salesPersonMobile": salesPersonDetails.salesPersonMobile || null,

  accountId: salesforceResponse.data?.AccountId ?? AccountId,
  ContactId: salesforceResponse.data?.ContactId ?? ContactId,
  ProductId: ProductId,
  uploadedFileNames,
  planname: type,
  subcategory: subcategory,
  tradeLicenseFileUrl,
  shareholdersfiles,
  shareholders,
  tradeLicenseNo,
  shareholderfilesnumber,
  customerType: CustomerType
};

//  Only add tradeLicenseFile if url exists
if (tradeLicenseFile?.url) {
  updateFields.tradeLicenseFile = tradeLicenseFile;
}

const pidataDoc = await Pidata.findOneAndUpdate(
  { "leadWithDetails.LeadId": LeadId },
  { $set: updateFields },
  { new: true }
);


    if (!pidataDoc) {
      return res
        .status(404)
        .json({ message: "Pidata record not found for the provided LeadId" });
    }

    return res.status(200).json({
      message: "Opportunity created and Pidata updated successfully",
      salesforceResponse: salesforceResponse.data,
      pidata: pidataDoc,
    });
  } catch (err) {
    console.error("createOpportunity error:", err);
    return res.status(500).json({
      message: "Failed to create opportunity",
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
      shareholders: shareholders.map((s) => ({
        name: s.name,
        shareholderPercentage: s.shareholderPercentage,
        dob: s.dob,
        nationalityshareholder: s.nationalityshareholder,
        files: s.files.map((f) => ({
          name: f.name,
          url: f.url,
          type: f.type,
          oopId: f.oopId,
        })),
      })),
    };

    // 1. Get Salesforce token
    const tokenResp = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
      null,
      {
        params: {
          client_id:
            "3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip",
          client_secret:
            "0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1",
          grant_type: "password",
          username: "vzpaymentapi@vz.ae.vzfullcopy",
          password: "Virtuzone@1234",
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenResp.data.access_token}`,
        },
      }
    );

    return res.status(200).json({
      message: "Documents successfully pushed to Salesforce",
      data: response.data,
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
    const {
      firstName,
      lastName,
      email,
      nationality,
      phone,
      dob,
      service_id,
      leadId,
      countryCode,
      // subServiceName,
      // companyLocationUAE,
      // employmentType,
      // companyName,
      // salary,
      // bankType,
      // companyLicensed,
      // activityType,
      // totalShareholders,
      // companyTurnover,
      // companyLocation,
      // companyWebsite,
      // tradeLicenseNo,
      // shareholderfilesnumber,
      // tradeLicenseFile,
      // shareholdersfiles,
      // shareholders,
    } = req.body;
    console.log("req.body",req.body)

    if (!firstName || !lastName || !email || !nationality || !phone || !dob) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const nationalityData = await Nationality.findOne({ Country: nationality });

    if (!nationalityData) {
      return res.status(400).json({
        message: "Invalid country provided. Nationality not found.",
      });
    }
    // console.log("nationlity",nationalityData)

    // Now we have the nationality value from the Nationality model
    const nationalitys = nationalityData.Value; // Assuming `Value` field stores the nationality
    // Step 1: Get Salesforce token
    const tokenResp = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
      null,
      {
        params: {
          client_id:
            "3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip",
          client_secret:
            "0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1",
          grant_type: "password",
          username: "vzpaymentapi@vz.ae.vzfullcopy",
          password: "Virtuzone@1234",
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
        nationality: nationalitys,
        phone,
        dob,
        service_id,
        leadId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const cleanedPhone = phone.replace(/\s+/g, ""); // Example cleanup
   

    
    const existingDoc = await Pidata.findOne({ "leadWithDetails.LeadId": leadResp.data?.LeadId });

    let updatedLeadWithDetails = {
      ...(existingDoc?.leadWithDetails || {}), // keep existing
      ...{
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Nationality: nationality,
        Phone: cleanedPhone,
        countryCode: countryCode,
        Origin__c: "Website",
        Status: "Created",
        dob: dob,
        LeadId: leadResp.data?.LeadId || null,
      }
    };

    //  If leadId exists, update the record, else create a new one
    const pidataDoc = await Pidata.findOneAndUpdate(
      { "leadWithDetails.LeadId": leadResp.data?.LeadId }, // condition
      { $set:  { leadWithDetails: updatedLeadWithDetails } },
      { upsert: true, new: true } // upsert = create if not exists
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

exports.insertEconomicDetails = async (req, res) => {
  try {
    const {
      leadId,
      accountId,
      economicDetailId,
      serviceName,
      subServiceName,
      firstName,
      lastName,
      email,
      nationality,
      phone,
      countryCode,
      dob,
      companyLocationUAE,
      employmentType,
      companyName,
      salary,
      bankType,
      companyLicensed,
      activityType,
      totalShareholders,
      companyTurnover,
      companyLocation,
      companyWebsite,
      tradeLicenseNo,
      shareholderfilesnumber,
      tradeLicenseFile,
      tradeLicenseFileUrl,
      shareholdersfiles,
      shareholders,
      uploadedFileNames
    } = req.body;

    // Debug logging for companyName
    console.log("CompanyName in request body:", companyName);
    console.log("CompanyName field exists:", req.body.hasOwnProperty('companyName'));
    console.log("CompanyName isValidValue:", companyName !== null && companyName !== undefined && companyName !== '');

    // Helper function to check if a value is valid (not null, undefined, or empty string)
    const isValidValue = (value) => {
      return value !== null && value !== undefined && value !== '';
    };

    // Helper function to check if a field exists in the request body
    const fieldExists = (field) => {
      return req.body.hasOwnProperty(field);
    };

    // Construct the payload dynamically, only including fields that exist in the request body
    const payload = {};

    if (fieldExists('leadId') && isValidValue(leadId)) payload.leadId = leadId;
    if (fieldExists('accountId') && isValidValue(accountId)) payload.accountId = accountId;
    if (fieldExists('serviceName') && isValidValue(serviceName)) payload.serviceName = serviceName;
    if (fieldExists('subServiceName') && isValidValue(subServiceName)) payload.subServiceName = subServiceName;
    if (fieldExists('firstName') && isValidValue(firstName)) payload.FirstName = firstName;
    if (fieldExists('lastName') && isValidValue(lastName)) payload.LastName = lastName;
    if (fieldExists('email') && isValidValue(email)) payload.Email = email;
    if (fieldExists('countryCode') && isValidValue(countryCode)) payload.countryCode = countryCode;
    if (fieldExists('nationality') && isValidValue(nationality)) payload.Nationality = nationality;
    if (fieldExists('phone') && isValidValue(phone)) payload.Phone = phone;
    if (fieldExists('dob') && isValidValue(dob)) payload.dob = dob;
    if (fieldExists('companyLocationUAE') && isValidValue(companyLocationUAE)) payload.companyLocationUAE = companyLocationUAE;
    if (fieldExists('employmentType') && isValidValue(employmentType)) payload.employmentType = employmentType;
    // Always include companyName if it exists in request body, even if empty
    if (fieldExists('companyName')) payload.companyName = companyName;
    if (fieldExists('economicDetailId') && isValidValue(economicDetailId)) payload.economicDetailId = economicDetailId;
    if (fieldExists('salary') && isValidValue(salary)) payload.salary = salary;
    if (fieldExists('bankType') && isValidValue(bankType)) payload.bankType = bankType;
    if (fieldExists('companyLicensed') && isValidValue(companyLicensed)) payload.companyLicensed = companyLicensed;
    if (fieldExists('activityType') && isValidValue(activityType)) payload.activityType = activityType;
    if (fieldExists('totalShareholders') && isValidValue(totalShareholders)) payload.totalShareholders = totalShareholders;
    if (fieldExists('companyTurnover') && isValidValue(companyTurnover)) payload.companyTurnover = companyTurnover;
    if (fieldExists('companyLocation') && isValidValue(companyLocation)) payload.companyLocation = companyLocation;
    if (fieldExists('companyWebsite') && isValidValue(companyWebsite)) payload.companyWebsite = companyWebsite;
    if (fieldExists('tradeLicenseNo') && isValidValue(tradeLicenseNo)) payload.tradeLicenseNo = tradeLicenseNo;
    if (fieldExists('shareholderfilesnumber') && isValidValue(shareholderfilesnumber))
      payload.shareholderfilesnumber = shareholderfilesnumber;
    if (fieldExists('tradeLicenseFile') && tradeLicenseFile && Array.isArray(tradeLicenseFile))
      payload.tradeLicenseFile = tradeLicenseFileUrl;
    if (fieldExists('uploadedFileNames') && uploadedFileNames && Array.isArray(uploadedFileNames))
      payload.uploadedFileNames = uploadedFileNames;
    if (fieldExists('tradeLicenseFileUrl') && isValidValue(tradeLicenseFileUrl)) payload.tradeLicenseFileUrl = tradeLicenseFileUrl;
    if (fieldExists('shareholdersfiles') && isValidValue(shareholdersfiles)) payload.shareholdersfiles = shareholdersfiles;
    if (fieldExists('shareholders') && shareholders && Array.isArray(shareholders))
      payload.shareholders = shareholders;

    console.log("Payload before sending to Salesforce:", payload);


    // Step 1: Get Salesforce token
    const tokenResp = await axios.post(
      `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token`,
      null,
      {
        params: {
          client_id:
            "3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip",
          client_secret:
            "0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1",
          grant_type: "password",
          username: "vzpaymentapi@vz.ae.vzfullcopy",
          password: "Virtuzone@1234",
        },
      }
    );

    const accessToken = tokenResp.data.access_token;
    const salesforceUrl = tokenResp.data.instance_url;
    console.log("Salesforce payload insertEconomicDetails: ", payload);
    // Step 2: Call the InsertEconomicDetails API with dynamic payload
    const economicDetailsResp = await axios.post(
      `${salesforceUrl}/services/apexrest/insertEconomicDetails`,
      payload, // Use the dynamically created payload
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Clean phone number and generate country code
    // const cleanedPhone = phone ? phone.replace(/\s+/g, "") : null;
    // const countryCode = cleanedPhone ? "+" + cleanedPhone.slice(0, 2) : null;

    // Prepare the data for your local database (Pidata, etc.)
    const economicData = {
      leadWithDetails: {},
      quotePaymentWithDetails: {},
    };

    // Only add fields to leadWithDetails if they exist in the request body and have valid values
    if (fieldExists('leadId') && isValidValue(leadId)) economicData.leadWithDetails.LeadId = leadId;
    if (fieldExists('serviceName') && isValidValue(serviceName)) economicData.leadWithDetails.ServiceName = serviceName;
    if (fieldExists('subServiceName') && isValidValue(subServiceName)) economicData.leadWithDetails.subServiceName = subServiceName;
    if (fieldExists('firstName') && isValidValue(firstName)) economicData.leadWithDetails.FirstName = firstName;
    if (fieldExists('lastName') && isValidValue(lastName)) economicData.leadWithDetails.LastName = lastName;
    if (fieldExists('email') && isValidValue(email)) economicData.leadWithDetails.Email = email;
    if (fieldExists('nationality') && isValidValue(nationality)) economicData.leadWithDetails.Nationality = nationality;
    if (fieldExists('phone') && isValidValue(phone)) economicData.leadWithDetails.Phone = phone;
    if (fieldExists('countryCode') && isValidValue(countryCode)) economicData.leadWithDetails.countryCode = countryCode;
    if (fieldExists('dob') && isValidValue(dob)) economicData.leadWithDetails.dob = dob;
    if (fieldExists('companyLocationUAE') && isValidValue(companyLocationUAE)) economicData.leadWithDetails.companyLocationUAE = companyLocationUAE;
    if (fieldExists('employmentType') && isValidValue(employmentType)) economicData.leadWithDetails.employmentType = employmentType;
    // Always include companyName if it exists in request body, even if empty
    if (fieldExists('companyName')) economicData.leadWithDetails.Company = companyName;
    if (fieldExists('salary') && isValidValue(salary)) economicData.leadWithDetails.salary = salary;
    if (fieldExists('bankType') && isValidValue(bankType)) economicData.leadWithDetails.bankType = bankType;
    if (fieldExists('companyLicensed') && isValidValue(companyLicensed)) economicData.leadWithDetails.companyLicensed = companyLicensed;
    if (fieldExists('activityType') && isValidValue(activityType)) economicData.leadWithDetails.activityType = activityType;
    if (fieldExists('totalShareholders') && isValidValue(totalShareholders)) economicData.leadWithDetails.totalShareholders = totalShareholders;
    if (fieldExists('companyTurnover') && isValidValue(companyTurnover)) economicData.leadWithDetails.companyTurnover = companyTurnover;
    if (fieldExists('companyLocation') && isValidValue(companyLocation)) economicData.leadWithDetails.companyLocation = companyLocation;
    if (fieldExists('companyWebsite') && isValidValue(companyWebsite)) economicData.leadWithDetails.companyWebsite = companyWebsite;

    // Only add AccountId if it exists in the request body and has a valid value
    if (fieldExists('accountId') && isValidValue(accountId)) economicData.quotePaymentWithDetails.AccountId = accountId;

    // Add other fields only if they exist in the request body and have valid values
    if (economicDetailsResp.data?.economicDetailId) economicData.economicDetailId = economicDetailsResp.data.economicDetailId;
    if (fieldExists('subServiceName') && isValidValue(subServiceName)) economicData.subcategory = subServiceName;
    if (fieldExists('tradeLicenseFileUrl') && isValidValue(tradeLicenseFileUrl)) economicData.tradeLicenseFileUrl = tradeLicenseFileUrl;
    if (fieldExists('tradeLicenseFile') && tradeLicenseFile) economicData.tradeLicenseFile = tradeLicenseFile;
    if (fieldExists('shareholdersfiles') && isValidValue(shareholdersfiles)) economicData.shareholdersfiles = shareholdersfiles;
    if (fieldExists('shareholders') && shareholders) economicData.shareholders = shareholders;
    if (fieldExists('uploadedFileNames') && uploadedFileNames) economicData.uploadedFileNames = uploadedFileNames;
    if (fieldExists('tradeLicenseNo') && isValidValue(tradeLicenseNo)) economicData.tradeLicenseNo = tradeLicenseNo;
    if (fieldExists('shareholderfilesnumber') && isValidValue(shareholderfilesnumber)) economicData.shareholderfilesnumber = shareholderfilesnumber;

    // Step 3: Save the data to Pidata (or another local database)
    const pidataDoc = await Pidata.findOneAndUpdate(
      { "leadWithDetails.LeadId": leadId },
      {
        $set: {
          ...economicData,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "Economic details inserted successfully",
      data: economicDetailsResp.data,
    });
  } catch (err) {
    console.error("insertEconomicDetails error:", err);
    return res.status(500).json({
      message: "Failed to insert economic details",
      error: err.response?.data || err.toString(),
    });
  }
};
