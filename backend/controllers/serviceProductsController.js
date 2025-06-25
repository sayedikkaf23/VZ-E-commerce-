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
    const pidataDoc = await Pidata.findOneAndUpdate(
      { "leadWithDetails.LeadId": LeadId }, // Match by LeadId from initial step
      {
        $set: {
      leadWithDetails: {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Nationality: nationality,
        Phone: cleanedPhone,
        countryCode: countryCode,
        Origin__c: "Website", // or whatever source you want
        Status: "Created",
        dob: dob,
        ServiceName: type,
        LeadId: salesforceResponse.data?.LeadId ?? LeadId,
         companyLocationUAE,
        employmentType,
        Company: companyName,
        salary,
        bankType,
        companyLicensed,
        activityType,
        totalShareholders,
        companyTurnover,
        companyLocation,
        companyWebsite,
        isLead,
      },
      quotePaymentWithDetails: {
        QuotePaymentId: salesforceResponse.data?.QuotePaymentId,
      },
      quoteWithProductDetails: {
        quoteEmail: email,
        quoteName: firstName + " " + lastName,
        // QuotePaymentName: salesforceResponse.data?.QuotePaymentName,
        quotePaymentId: salesforceResponse.data?.QuotePaymentId,
        totalIncludingVAT: totalPrice,
        subTotal: subTotal,
        totalPrice: totalPrice,
        product: req.body.prodcutNameList, // store the whole array
      },
     salesPersonDetails: {
    salesPersonName: salesPersonDetails.salesPersonName || null,
    salesPersonEmail: salesPersonDetails.salesPersonEmail || null,
    salesPersonMobile: salesPersonDetails.salesPersonMobile || null,
  },
      // salesforceResponseMatchScreening: {

          //   leadId:         sfResp.data?.LeadId         ?? null,
          accountId: salesforceResponse.data?.AccountId ?? AccountId,
          // opportunityId:  salesforceResponse.data?.OpportunityId  ?? null,
          ContactId: salesforceResponse.data?.ContactId ?? ContactId,
          //   quoteId:        sfResp.data?.QuoteId        ?? null,
          //   quotePaymentId: sfResp.data?.QuotePaymentId ?? null,   // ← spelling fixed
          //   message:        sfResp.data?.Message        ?? ''
          // },
          ProductId: ProductId,
          tradeLicenseFile,
          uploadedFileNames,
          planname: type,
          subServiceName: subcategory,
          tradeLicenseFileUrl: tradeLicenseFileUrl,
          shareholdersfiles,
          shareholders,
          tradeLicenseNo,
          shareholderfilesnumber,
          customerType: CustomerType,
        },
      },
      { new: true } // Return the updated document
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
      subServiceName,
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
      shareholdersfiles,
      shareholders,
    } = req.body;

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
    const countryCode = "+" + cleanedPhone.slice(0, 2); // Or get it from input/parse lib

    const leadData = {
      leadWithDetails: {
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
        companyLocationUAE,
        employmentType,
        Company: companyName,
        salary,
        bankType,
        companyLicensed,
        activityType,
        totalShareholders,
        companyTurnover,
        companyLocation,
        companyWebsite,
      },

      subcategory: subServiceName,
      tradeLicenseFileUrl: tradeLicenseFile,
      shareholdersfiles,
      shareholders,
      tradeLicenseNo,
      shareholderfilesnumber,
      quotePaymentWithDetails: {
        AccountId: leadResp.data?.AccountId || null,
      },
      ContactId: leadResp.data?.ContactId || null,
    };

    //  If leadId exists, update the record, else create a new one
    const pidataDoc = await Pidata.findOneAndUpdate(
      { "leadWithDetails.LeadId": leadResp.data?.LeadId }, // condition
      { $set: leadData },
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
      shareholdersfiles,
      shareholders,
    } = req.body;

    // Construct the payload dynamically, excluding null or undefined fields
    const payload = {};

    if (leadId) payload.leadId = leadId;
    if (accountId) payload.accountId = accountId;
    if (serviceName) payload.serviceName = serviceName;
    if (subServiceName) payload.subServiceName = subServiceName;
    if (firstName) payload.FirstName = firstName;
    if (lastName) payload.LastName = lastName;
    if (email) payload.Email = email;
    if (countryCode) payload.Email = countryCode;
    if (nationality) payload.Nationality = nationality;
    if (phone) payload.Phone = phone;
    if (dob) payload.dob = dob;
    if (companyLocationUAE) payload.companyLocationUAE = companyLocationUAE;
    if (employmentType) payload.employmentType = employmentType;
    if (companyName) payload.companyName = companyName;
     if (economicDetailId) payload.economicDetailId = economicDetailId;
     else payload.economicDetailId = '';
    if (salary) payload.salary = salary;
    if (bankType) payload.bankType = bankType;
    if (companyLicensed) payload.companyLicensed = companyLicensed;
    if (activityType) payload.activityType = activityType;
    if (totalShareholders) payload.totalShareholders = totalShareholders;
    if (companyTurnover) payload.companyTurnover = companyTurnover;
    if (companyLocation) payload.companyLocation = companyLocation;
    if (companyWebsite) payload.companyWebsite = companyWebsite;
    if (tradeLicenseNo) payload.tradeLicenseNo = tradeLicenseNo;
    if (shareholderfilesnumber)
      payload.shareholderfilesnumber = shareholderfilesnumber;
    if (tradeLicenseFile) payload.tradeLicenseFile = tradeLicenseFile;
    if (shareholdersfiles) payload.shareholdersfiles = shareholdersfiles;
    if (shareholders && Array.isArray(shareholders))
      payload.shareholders = shareholders;

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
    console.log("Salesforce payload: ", payload);
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
      leadWithDetails: {
        LeadId: leadId,

        ServiceName: serviceName,

        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Nationality: nationality,
        Phone: phone,
        countryCode,
        dob,
        companyLocationUAE,
        employmentType,
        Company: companyName,
        salary,
        bankType,
        companyLicensed,
        activityType,
        totalShareholders,
        companyTurnover,
        companyLocation,
        companyWebsite,
      },
      quotePaymentWithDetails: {
        AccountId: accountId,
      },
      economicDetailId : economicDetailsResp.data?.economicDetailId,
      subcategory: subServiceName,
      tradeLicenseFileUrl: tradeLicenseFile,
      shareholdersfiles,
      shareholders,
      tradeLicenseNo,
      shareholderfilesnumber,
    };

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
