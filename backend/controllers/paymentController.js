const PiData = require("../models/pidata");

const { validationResult } = require("express-validator");
const AWS = require("aws-sdk"); // Remove the import * as AWS from 'aws-sdk';
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();
//  const stripe = require("stripe")("sk_test_tR3PYbcVNZZ796tH88S4VQ2u");
const stripe = require("stripe")(process.env.STRIP_KEY);


// Load AWS credentials and S3 bucket name from environment variables
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION_NAME;
const s3BucketName = process.env.S3_BUCKET_NAME;

const s3 = new AWS.S3({
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey,
  region: awsRegion,
});

// const mailTransporter = nodemailer.createTransport({
//   service: "Outlook365",
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   // secure: process.env.SMTP_SECURE === 'true', // Convert string to boolean
//   tls: {
//     ciphers: process.env.SMTP_CIPHERS,
//     rejectUnauthorized: false,
//   },
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mishalnunu@gmail.com",
    pass: "qgwlzriynfzukuwy",
  },
});






async function payNow(req, res) {
    const { quoteId } = req.params;
  
    const data = await PiData.findOne({
      $or: [{ quoteId: quoteId }, { quotePaymentId: quoteId }],
    });
  
    console.log("Data received in createTotalpaySession:", data);
    // Static data
  
    const order_number = data.quotePaymentId;
    const acountname = data.quoteName;
    const acountemail = data.quoteEmail;
    const order_amount = Number(data.partPayment).toFixed(2);
    // const order_number = "order-1234";
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
  
    const accountDetailsResult = await AccountDetail.find();
    if (!accountDetailsResult || accountDetailsResult.length === 0) {
      return res.status(400).json({ message: "Account details not found" });
    }
  
    const TokenResponse = await axios.post(
      `https://test.salesforce.com/services/oauth2/token`,
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
    const accessToken = TokenResponse.data.access_token;
  
    // console.log("Access Token:", accessToken);
  
    // Create a new PaymentForm instance
    const newOnlinePayForm = new OnlinePayment({
      transactionDetails: {
        amount: data.totalIncludingVAT,
        quotePaymentId: data.quotePaymentId,
        partPayment: data.partPayment,
  
        // fromCurrency: currency_convertingfrom, // Assuming currency_converting has 'from' and 'to' properties
        // toCurrency: currency_convertingto,
        proformaInvoiceNumber: data.invoiceNumber,
        currencyPaid: "AED",
        // amountPaid:existingUser.totalIncludingVAT,
      },
      customerDetails: {
        name: data.AccountName,
        id: data.quoteEmail, // Assuming this is the desired ID
      },
  
      status: "Paid",
      quoteId: data.quoteId,
      // Default status
    });
  
    await newOnlinePayForm.save();
  
    // Create request body
    const requestBody = {
      merchant_key: "38e1fdfc-5b72-11ee-a23d-de864d357ae1",
      operation: "purchase",
      methods: ["card"],
      order: {
        number: order_number,
        amount: order_amount,
        currency: order_currency,
        description: order_description,
      },
      billing_address: {
        country: "AE",
        state: "Dubai",
        district: "Dubai",
        address: "Dubai",
        house_number: "1",
        address: "Moor Building",
        city: "Dubai",
        zip: "00000",
        phone: "+971090450954",
      },
      cancel_url: `https://virtuzone.yeepeey.com/failure/${data.quotePaymentId}`,
      success_url: `https://virtuzone.yeepeey.com/successful/${data.quotePaymentId}`,
      customer: {
        // name: acountname,
        email: acountemail,
      },
      recurring_init: "true",
      hash: sha1Hash,
    };
  
    console.log(sha1Hash, "sha1Hash");
  
    try {
      // Send request to Totalpay
      console.log("second");
        const totalpayResponse = await axios.post(
          "https://checkout.totalpay.global/api/v1/session",
          requestBody
        );
  
      const totalpayResponseData = totalpayResponse.data;
  
      const combinedResponse = {
        message: "Online Payment",
        GL_code: "1352 - Payment Gateway",
        bank_name: "Payment Gateway",
        Bankstatus: newOnlinePayForm.status,
        Name: newOnlinePayForm.customerDetails.name,
        proformaInvoiceNumber:
          newOnlinePayForm.transactionDetails.proformaInvoiceNumber,
        // receiptfile: newOnlinePayForm.fileUpload,
        currencyPaid: newOnlinePayForm.transactionDetails.currencyPaid,
        totalpayData: totalpayResponseData, // Include data from the first response here
      };
  
      // console.log(combinedResponse);
  
      res.status(200).json(combinedResponse);
    } catch (error) {
      console.error("Error message:", error.message);
  
      // Log the server's response provided by Axios in the error object
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
  
      // Log the full error stack for debugging purposes
      console.error("Error stack:", error.stack);
  
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  
  async function payNowByStripe(req, res) {
    const { quoteId } = req.params;
    let order_number;
    let acountname;
    let acountemail;
    let order_amount;
    let type = "Online";
    let data = await PiData.findOne({
      $or: [{ quoteId: quoteId }, { quotePaymentId: quoteId }],
    });
  
    if (!data) {
      const ManualPiData = await manualPiData.findOne({
        accountId: quoteId,
      });
  
      data = {
        quotePaymentId: ManualPiData.accountId,
        quoteName: ManualPiData.billTo,
        quoteEmail: ManualPiData.email,
        partPayment: ManualPiData.totalAmount,
        totalIncludingVAT: ManualPiData.totalAmount,
        invoiceNumber: ManualPiData.invoiceNumber,
        quoteId: ManualPiData.invoiceNumber,
        AccountName: ManualPiData.billTo,
      };
      type = "Manual";
    }
  
    order_number = data.quotePaymentId;
    acountname = data.quoteName;
    acountemail = data.quoteEmail;
    order_amount = Number(data.partPayment).toFixed(2);
  
    // const order_number = "order-1234";
    // const order_amount = "0.19";
    const order_currency = "AED";
    const order_description = "gift";
    const password = "23515a8aacd96768236258c7d8afc206"; // Replace with your password
  
    // Create hash
    const stringToHash =
      order_number + order_amount + order_currency + order_description + password;
  
    const md5hash = crypto
      .createHash("md5")
      .update(stringToHash.toUpperCase())
      .digest("hex");
  
    const sha1Hash = crypto.createHash("sha1").update(md5hash).digest("hex");
  
    const accountDetailsResult = await AccountDetail.find();
    if (!accountDetailsResult || accountDetailsResult.length === 0) {
      return res.status(400).json({ message: "Account details not found" });
    }
  
    try {
      const isManual = type === "Manual";
      const successType = isManual ? "?type=manual" : "";
      const cancelType = isManual ? "?type=manual" : "";
  
      const stripeResponse = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "aed", // Replace with your currency code
              product_data: {
                name: acountname, // Replace with your product name
              },
              unit_amount: order_amount * 100, // Specify the amount in cents (e.g., $10.00 USD)
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `https://virtuzone.yeepeey.com/successful/${data.quotePaymentId}${successType}`,
        cancel_url: `https://virtuzone.yeepeey.com/failure/${data.quotePaymentId}${cancelType}`,
      });
  
      const stripeResponseData = stripeResponse;
  
      const newOnlinePayForm = new OnlinePayment({
        transactionDetails: {
          amount: data.totalIncludingVAT,
          quotePaymentId: data.quotePaymentId,
          partPayment: data.partPayment,
  
          // fromCurrency: currency_convertingfrom, // Assuming currency_converting has 'from' and 'to' properties
          // toCurrency: currency_convertingto,
          proformaInvoiceNumber: data.invoiceNumber,
          currencyPaid: "AED",
          // amountPaid:existingUser.totalIncludingVAT,
        },
        customerDetails: {
          name: data.AccountName,
          id: data.quoteEmail, // Assuming this is the desired ID
        },
  
        paymentType: isManual ? "Manual" : "Online",
        status: "Paid",
        quoteId: data.quoteId,
        // Default status
      });
  
      await newOnlinePayForm.save();
  
      const combinedResponse = {
        stripeData: stripeResponseData, // Include data from the first response here
      };
  
      res.status(200).json(combinedResponse);
    } catch (error) {
      console.error("Error message:", "OnlinePayment Failed");
      console.error(
        "Error creating checkout session:",
        error.response?.data?.error
      );
      res.status(500).send("Error creating checkout session");
    }
  }
  
  
  
  
  async function payNowByTelr(req, res) {
    const { quoteId } = req.params;
    let order_number, acountname, acountemail, order_amount, type = "Online";
  
    // Fetch order details
    let data = await PiData.findOne({ $or: [{ quoteId }, { quotePaymentId: quoteId }] });
    if (!data) {
      const ManualPiData = await manualPiData.findOne({ accountId: quoteId });
      data = {
        quotePaymentId: ManualPiData.accountId,
        quoteName: ManualPiData.billTo,
        quoteEmail: ManualPiData.email,
        partPayment: ManualPiData.totalAmount,
        totalIncludingVAT: ManualPiData.totalAmount,
        invoiceNumber: ManualPiData.invoiceNumber,
        AccountName: ManualPiData.billTo,
      };
      type = "Manual";
    }
  
    order_number = data.quotePaymentId;
    acountname = data.quoteName;
    acountemail = data.quoteEmail;
    order_amount = Number(data.partPayment).toFixed(2);
    const order_currency = "AED";
    const order_description = "payment_description";
  
    try {
      // Define success and cancel URLs based on payment type
      const isManual = type === "Manual";
      const successType = type === "Manual" ? "?type=manual" : "";
      const cancelType = type === "Manual" ? "?type=manual" : "";
   
      const telrResponse = await axios.post("https://secure.telr.com/gateway/order.json", {
        method: "create",
        store: process.env.TELR_STORE_ID,
        authkey: process.env.TELR_AUTH_KEY,
        framed: 0,
        order: {
          cartid: order_number,
          test: "1", // Use "1" for testing; "0" for live
          amount: order_amount,
          currency: order_currency,
          description: order_description,
        },
        
        return: {
          authorised: `https://virtuzone.yeepeey.com/successful/${data.quotePaymentId}${successType}`,
          declined: `https://virtuzone.yeepeey.com/failure/${data.quotePaymentId}${cancelType}`,
          cancelled: `https://virtuzone.yeepeey.com/cancelled/${data.quotePaymentId}${cancelType}`
        },  customer: {
          ref:order_number,
          email: acountemail,
          name: {
            title: "",                // Leave empty if not available
            forenames: acountname,    // Use `acountname` here for full name or first name if split
            surname: ""               // Leave empty or set surname here if available
          } ,
          address: {
            line1: "",               // Leave address fields empty to avoid display
            city: "",
            country: ""
          }
         
        }
      }, {
        headers: {
          "Authorization": `Basic ${process.env.TELR_BASIC_AUTH}`,
          "Content-Type": "application/json",
          "accept": "application/json"
        }
      });
  
  
      const newOnlinePayForm = new OnlinePayment({
        transactionDetails: {
          amount: data.totalIncludingVAT,
          quotePaymentId: data.quotePaymentId,
          partPayment: data.partPayment,
  
          // fromCurrency: currency_convertingfrom, // Assuming currency_converting has 'from' and 'to' properties
          // toCurrency: currency_convertingto,
          proformaInvoiceNumber: data.invoiceNumber,
          currencyPaid: "AED",
          // amountPaid:existingUser.totalIncludingVAT,
        },
        customerDetails: {
          name: data.AccountName,
          id: data.quoteEmail, // Assuming this is the desired ID
        },
  
        paymentType: isManual ? "Manual" : "Online",
        status: "Paid",
        quoteId: data.quoteId,
        // Default status
      });
  
      await newOnlinePayForm.save();
  
   
  
  
      res.status(200).json({ telrData: telrResponse.data });
    } catch (error) {
      console.error("Error with Telr API:", error);
      res.status(500).send("Error creating Telr payment session");
    }
  }
  
  
  
  async function payNowSaleforce(req, res) {
    const { quoteId } = req.params;
    console.log("salesforce called");
    const TokenResponse = await axios.post(
      `https://test.salesforce.com/services/oauth2/token`,
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
    const accessToken = TokenResponse.data.access_token;
  
    try {
      const paynowdata = await OnlinePayment.findOne({
        $or: [
          { quoteId: quoteId },
          { "transactionDetails.quotePaymentId": quoteId },
        ],
      });
  
      if (!paynowdata) {
        // Throw an error if the document is not found
        throw new Error("Document not found");
      }
  
      const requestBodySalesforce = {
        qp: {
          paymentmethod: "Pay Now",
          amount_received: paynowdata.transactionDetails.partPayment,
          bank_name: "Payment Gateway",
          GL_code: "1301 - VZ ADCB (AED) 10515838124001",
          Pay_Currency: paynowdata.transactionDetails.currencyPaid,
          payment_status: "Paid",
          quotePaymentId: paynowdata.transactionDetails.quotePaymentId,
        },
        attachments: [
          {
            Body: "",
            ContentType: "",
            Name: "",
          },
          {
            Body: "",
            ContentType: "",
            Name: "",
          },
        ],
      };
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json", // Specify the content type as JSON
      };
  
      const endpointUrl = `${process.env.SALESFORCE_API_URL}/services/apexrest/VZAR_ProformaInvoiceUpdateQuotePayments/${paynowdata.transactionDetails.quotePaymentId}`;
      // console.log("url",endpointUrl)
      axios
        .put(endpointUrl, requestBodySalesforce, { headers })
        .then((response) => {
          // Handle the response here
          console.log("Response:", response.data);
        })
        .catch((error) => {
          // Handle errors here
          console.error("Error:", error);
        });
      res.json({ message: "Success" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
  
  async function payNowByFiserv(req, res) {
    const { quoteId } = req.params;
  
    const data = await PiData.findOne({
      $or: [{ quoteId: quoteId }, { quotePaymentId: quoteId }],
    });
  
    const order_number = data.quotePaymentId;
    const acountname = data.quoteName;
    const acountemail = data.quoteEmail;
    const order_amount = Number(data.partPayment).toFixed(2);
    // const order_number = "order-1234";
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
  
    const accountDetailsResult = await AccountDetail.find();
    if (!accountDetailsResult || accountDetailsResult.length === 0) {
      return res.status(400).json({ message: "Account details not found" });
    }
  
    const TokenResponse = await axios.post(
      `https://test.salesforce.com/services/oauth2/token`,
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
    const accessToken = TokenResponse.data.access_token;
  
    // console.log("Access Token:", accessToken);
  
    // Create a new PaymentForm instance
    const newOnlinePayForm = new OnlinePayment({
      transactionDetails: {
        amount: data.totalIncludingVAT,
        quotePaymentId: data.quotePaymentId,
        partPayment: data.partPayment,
  
        // fromCurrency: currency_convertingfrom, // Assuming currency_converting has 'from' and 'to' properties
        // toCurrency: currency_convertingto,
        proformaInvoiceNumber: data.invoiceNumber,
        currencyPaid: "AED",
        // amountPaid:existingUser.totalIncludingVAT,
      },
      customerDetails: {
        name: data.AccountName,
        id: data.quoteEmail, // Assuming this is the desired ID
      },
  
      status: "Paid",
      quoteId: data.quoteId,
      // Default status
    });
  
    await newOnlinePayForm.save();
  
    const postObj = {
      transactionAmount: {
        total: data?.totalIncludingVAT,
        currency: "AED",
      },
      orderId: getNextOrderId(), // Generate unique order ID,
      storeId: process.env.MAGNATI_STORE_ID,
      transactionType: "SALE",
      transactionNotificationURL: "https",
      expiration: "4102358400",
      authenticateTransaction: true,
      dynamicMerchantName: "FAB",
      invoiceNumber: getNextInvoiceNumber(),
      purchaseOrderNumber: "29062021-031",
      hostedPaymentPageText: "FAB",
      billing: {
        name: data?.AccountName,
        // birthDate: "1980-01-31",
        // contact: {
        //   phone: "1234567890",
        //   mobilePhone: "1234567890",
        //   fax: "1234567890",
        //   email: "Muhammad.Saghir@bankfab.com",
        // },
      },
    };
  
    const post = JSON.stringify(postObj);
    const clientRequestId = uuidv4();
    const timestamp = Date.now().toString();
    const apiKey = process.env.MAGNATI_API_KEY;
    const secretKey = process.env.MAGNATI_SECRET_KEY;
  
    const values = apiKey + clientRequestId + timestamp + post;
  
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(values);
    const messageSignatureBase64 = hmac.digest("base64");
  
    const url =
      "https://prod.emea.api.fiservapps.com/sandbox/ipp/payments-gateway/v2/payment-url";
  
    try {
      const magnatiResponse = await axios.post(url, postObj, {
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Api-Key": apiKey,
          "Client-Request-Id": clientRequestId,
          Timestamp: timestamp,
          "Message-Signature": messageSignatureBase64,
        },
      });
  
      const magnatiResponseData = magnatiResponse.data;
  
      const combinedResponse = {
        message: "Online Payment",
        GL_code: "1352 - Payment Gateway",
        bank_name: "Payment Gateway",
        Bankstatus: newOnlinePayForm.status,
        Name: newOnlinePayForm.customerDetails.name,
        proformaInvoiceNumber:
          newOnlinePayForm.transactionDetails.proformaInvoiceNumber,
        // receiptfile: newOnlinePayForm.fileUpload,
        currencyPaid: newOnlinePayForm.transactionDetails.currencyPaid,
        magnatiData: magnatiResponseData, // Include data from the first response here
      };
  
      return res.status(200).json(combinedResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.response?.data || error.message,
      });
    }
  }

  async function MagnatiTransactionStatus(req, res) {
    console.log(req.body);
  
    const status = req.body.status === "APPROVED" ? "successful" : "failure";
    const reason =
      req.body.status === "FAILED"
        ? `?reason=${
            req.body.fail_rc === "5003"
              ? "Payment already deducted, please contact administrator."
              : ""
          }`
        : "";
  
    try {
      // Check if `quotePaymentId` exists in the `PiData` collection
      const piDataRecord = await PiData.findOne({ quotePaymentId: req.body.oid });
  
      if (!piDataRecord) {
        // If `quotePaymentId` does not exist in PiData
        return res.status(404).json({
          message: "Quote Payment ID not found in PiData collection",
          oid: req.body.oid,
        });
      }
  
      // If transaction is approved, save the payment details
      if (req.body.status === "APPROVED") {
        const newOnlinePayForm = new OnlinePayment({
          transactionDetails: {
            amount: piDataRecord.totalIncludingVAT,
            quotePaymentId: req.body.oid,
            partPayment: req.body.chargetotal,
            currencyPaid: "AED",
          },
          status: "Paid",
          quoteId: req.body.oid,
          paymentType: "Online",
        });
        await newOnlinePayForm.save();
      }
  
      // Redirect to the appropriate status page
      res.redirect(
        `${process.env.REDIRECT_DOMAIN}/${status}/${req.body.oid}${reason}`
      );
    } catch (error) {
      // Handle any errors during the process
      console.error("Error during MagnatiTransactionStatus:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

exports.payNow = payNow;
exports.payNowSaleforce = payNowSaleforce;
exports.payNowByStripe = payNowByStripe;
exports.payNowByTelr = payNowByTelr;
exports.payNowByFiserv = payNowByFiserv;
exports.MagnatiTransactionStatus = MagnatiTransactionStatus;