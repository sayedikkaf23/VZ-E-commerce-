const PiData = require("../models/pidata");
const OnlinePayment = require("../models/OnlinePaymentModel");
const { validationResult } = require("express-validator");
const AWS = require("aws-sdk"); // Remove the import * as AWS from 'aws-sdk';
const fs = require("fs");
const AccountDetail = require("../models/accountDetail");
const CardMachine = require("../models/CardMachine");
const nodemailer = require("nodemailer");
const axios = require("axios");
const crypto = require("crypto");
const User = require("../models/user"); // Assuming the User model is in 'models/user'
const CashCounter = require("../models/CashOverCounter");
const bcrypt = require("bcrypt");
const MailDetails = require('../models/mailManagement'); // Import the model
const VirtualDetails = require('../models/virtualReceptionist'); // Import the model
const CashDeposit = require("../models/CashDeposit");
const BankTransfer = require("../models/BankTransferModel");
const Decimal = require("decimal.js"); // Install the library if needed
const ChequeDesposit = require("../models/ChequeDeposit");

require("dotenv").config();
//  const stripe = require("stripe")("sk_test_tR3PYbcVNZZ796tH88S4VQ2u");
const stripe = require("stripe")(process.env.STRIP_KEY);

const saltRounds = 15;

// const mailTransporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "mishalnunu@gmail.com",
//     pass: "qgwlzriynfzukuwy",
//   },
// });

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



const rates = {
  EUR: { USD: 1.08, AED: 3.98 },
  USD: { EUR: 0.92, AED: 3.65 },
  AED: { USD: 1/3.65, EUR: 0.25 }, // changed this line
};

const convertFileToBase64 = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const base64Data = data.toString('base64');
        resolve(base64Data);
      }
    });
  });
};


const AddCashMachin = async (req, res) => {
  // Validation errors check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { quoteId } = req.params;

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

  console.log("Access Token:", accessToken);
  // const uploadedFiles = req.files;
  // const fileNames = uploadedFiles.map((file) => file.filename);
  // const transfer_copy = req.file.filename;
  // console.log(fileNames)
  // console.log(transfer_copy)

  try {
    // const existingUser = await PiData.findOne({
    //   $or: [{ quoteId: quoteId }, { quotePaymentId: quoteId }],
    // });

     const existingUser = await PiData.findOne({
            $or: [
              { "quoteWithProductDetails.quoteId": quoteId },
              { "quotePaymentWithDetails.QuotePaymentId": quoteId },
            ],
          });



    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const accountDetailsResult = await AccountDetail.find();
    if (!accountDetailsResult || accountDetailsResult.length === 0) {
      return res.status(400).json({ message: "Account details not found" });
    }

    const accountDetails = accountDetailsResult[0];
    // Create a new PaymentForm instance
    const newBankTransferForm = new CardMachine({
      bankDetails: {
        bank_name: accountDetails.bank_name,
        account_name: accountDetails.account_name,
        iban_number: accountDetails.iban_number,
        account_number: accountDetails.account_number,
        swift_code: accountDetails.swift_code,
        bank_address: accountDetails.bank_address,
      },
      transactionDetails: {
        amount: existingUser.salesforceResponseMatchScreening.totalAmount,
        quotePaymentId: existingUser.quotePaymentWithDetails.QuotePaymentId,
        partPayment: existingUser.salesforceResponseMatchScreening.total_including_Vat,
        // fromCurrency: currency_convertingfrom, // Assuming currency_converting has 'from' and 'to' properties
        // toCurrency: currency_convertingto,
        proformaInvoiceNumber: existingUser.quotePaymentWithDetails.QuotePaymentId,
        currencyPaid: "AED",
        // amountPaid:existingUser.totalIncludingVAT,
      },
      customerDetails: {
        name: existingUser.leadWithDetails.FirstName,
        id: existingUser.leadWithDetails.Email, // Assuming this is the desired ID
      },
      // fileUpload: fileNames, // Assuming this is a string representing the file path or URL
      status: "AR Review",
      quoteId: existingUser.quotePaymentWithDetails.QuotePaymentId,
      generalLedgerCode: "1351 - Point of Sale", // Default status
    });

    await newBankTransferForm.save();
    console.log(newBankTransferForm.transactionDetails.currencyPaid);

    const requestBody = {
      qp: {
        paymentmethod: "Pay via Card Machine",
        amount_received: newBankTransferForm.transactionDetails.partPayment,
        bank_name: "Point of Sale",
        GL_code: newBankTransferForm.generalLedgerCode,
        Pay_Currency: newBankTransferForm.transactionDetails.currencyPaid,
        payment_status: newBankTransferForm.status,
        quotePaymentId: newBankTransferForm.transactionDetails.quotePaymentId,
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

    console.log(requestBody);

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json", // Specify the content type as JSON
    };

    const endpointUrl = `${process.env.SALESFORCE_API_URL}/services/apexrest/VZAR_ProformaInvoiceUpdateQuotePayments/${newBankTransferForm.transactionDetails.quotePaymentId}`;

    axios
      .put(endpointUrl, requestBody, { headers })
      .then((response) => {
        // Handle the response here
        console.log("Response:", response.data);
      })
      .catch((error) => {
        // Handle errors here
        console.error("Error:", error);
      });

    // await sendEmail(existingUser.opportunityOwnerName,newBankTransferForm.customerDetails.id, existingUser.contactName,existingUser.opportunityOwnerEmail);
    let HtmlBody = `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          .image_block img+div {
            display: none;
          }
      
          @media (max-width:620px) {
            .social_block.desktop_hide .social-table {
              display: inline-block !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
          <tbody>
            <tr>
              <td>
                <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="paragraph_block block-1" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad">
                                      <div style="color:#000000;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                        <p style="margin: 0; margin-bottom: 16px;">Hello,</p>
                                        <p style="margin: 0; margin-bottom: 16px;">A customer has chosen to <b>Pay via Card Machine.</b> </p>
                                        <p style="margin: 0; margin-bottom: 16px;">Reference Quote Number - <b>${existingUser.quotePaymentName}</b> </p>
                                     
                                    
                                     
                                        <p style="margin: 0;">Thank you!</p>
                                     
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 30px; padding-left: 20px; padding-right: 20px; padding-top: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                  <tr>
                                    <td class="pad" style="padding-bottom:20px;width:100%;padding-right:0px;padding-left:0px;">
                                      <div class="alignment" align="center" style="line-height:10px">
                                        <div style="max-width: 183px;"><a href="https://www.vz.ae" target="_blank" style="outline:none" tabindex="-1"><img src="https://res.cloudinary.com/dvekmmxxx/image/upload/v1718347384/photo_2024-06-14_11-46-14-removebg-preview_bml8en.png" style="display: block; height: auto; border: 0; width: 100%;" width="183"></a></div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                <table class="social_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                  <tr>
                                    <td class="pad" style="text-align:center;padding-right:0px;padding-left:0px;">
                                      <div class="alignment" align="center">
                                        <table class="social-table" width="276px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                          <tr>
                                            <td style="padding:0 7px 0 7px;"><a href="https://www.facebook.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="https://twitter.com/Virtuzone_UAE" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.youtube.com/virtuzoneuae" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/youtube@2x.png" width="32" height="32" alt="YouTube" title="YouTube" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.instagram.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" height="32" alt="Instagram" title="Instagram" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.linkedin.com/company/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" height="32" alt="LinkedIn" title="LinkedIn" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="https://www.vz.ae/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/website@2x.png" width="32" height="32" alt="Web Site" title="Web Site" style="display: block; height: auto; border: 0;"></a></td>
                                          </tr>
                                        </table>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                <table class="text_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding-left:10px;padding-right:10px;padding-top:10px;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; mso-line-height-alt: 18px; color: #000000; line-height: 1.5;">
                                          <p style="margin: 0; text-align: center; mso-line-height-alt: 18px;"><a href="https://g.page/virtuzone?share" target="_blank" style="text-decoration: underline; color: #000000;" rel="noopener">Office 404, Al Saaha Office, Building B, Souk Al Bahar, Old Town Island,<br>Burj Khalifa District, Dubai - UAE</a></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>
      `;
    let subjectMail = "Customer paying via Card Machine";
    let toMail = process.env.ToMail;

    // await  ReviewsendEmail(existingUser.opportunityOwnerEmail,toMail,subjectMail,HtmlBody,[])

    return res.status(200).json({
      message: "Cash Machin ",
      //   paymentFormDetails: newBankTransferForm,

      Paymentmodes: "Cash Machine",
      Amountpaid: newBankTransferForm.amount,
      partPayment: newBankTransferForm.partPayment,
      Bankstatus: newBankTransferForm.status,
      Name: newBankTransferForm.customerDetails.name,
      proformaInvoiceNumber:
        newBankTransferForm.transactionDetails.proformaInvoiceNumber,
      receiptfile: newBankTransferForm.fileUpload,
      Currency: newBankTransferForm.currencyPaid,
      generalLedgerCode: newBankTransferForm.generalLedgerCode,
      currencyPaid: newBankTransferForm.transactionDetails.currencyPaid,
    });
  } catch (err) {
    console.error("Error during Bank Transfer processing:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

async function payNow(req, res) {
  const { quoteId } = req.params;

  const data = await PiData.findOne({
    $or: [
      { "quoteWithProductDetails.quoteId": quoteId }, // Matches quoteId
      { "quotePaymentWithDetails.QuotePaymentId": quoteId }, // Matches QuotePaymentId
    ],
  });

  console.log("Data received in createTotalpaySession:", data);
  // Static data

  order_number = data.quotePaymentWithDetails.QuotePaymentId;
  acountname = data.quoteWithProductDetails.AccountName;
  acountemail = data.quoteWithProductDetails.quoteEmail;
  order_amount = Number(
    data.salesforceResponseMatchScreening.total_including_Vat
  ).toFixed(2);
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

  // const accountDetailsResult = await AccountDetail.find();
  // if (!accountDetailsResult || accountDetailsResult.length === 0) {
  //   return res.status(400).json({ message: "Account details not found" });
  // }

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
      amount: data.salesforceResponseMatchScreening.total_including_Vat,
      quotePaymentId: order_number,
      //   totalIncludingVAT: data.quoteWithProductDetails.totalIncludingVAT,

      // fromCurrency: currency_convertingfrom, // Assuming currency_converting has 'from' and 'to' properties
      // toCurrency: currency_convertingto,
      proformaInvoiceNumber: data.quoteWithProductDetails.ownerId,
      currencyPaid: "AED",
      // amountPaid:existingUser.totalIncludingVAT,
    },
    customerDetails: {
      name: data.quoteWithProductDetails.AccountName,
      id: data.quoteWithProductDetails.quoteEmail, // Assuming this is the desired ID
    },

    paymentType: "Online",
    status: "Paid",
    quoteId: data.quoteWithProductDetails.oppurtunityId,
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
    cancel_url: `https://ecommerce.yeepeey.com/failure/${order_number}`,
    success_url: `https://ecommerce.yeepeey.com/successful/${order_number}`,
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
  const data = await PiData.findOne({
    $or: [
      { "quoteWithProductDetails.quoteId": quoteId }, // Matches quoteId
      { "quotePaymentWithDetails.QuotePaymentId": quoteId }, // Matches QuotePaymentId
    ],
  });

  // if (!data) {
  //   const ManualPiData = await manualPiData.findOne({
  //     accountId: quoteId,
  //   });

  //   data = {
  //     quotePaymentId: ManualPiData.accountId,
  //     quoteName: ManualPiData.billTo,
  //     quoteEmail: ManualPiData.email,
  //     partPayment: ManualPiData.totalAmount,
  //     totalIncludingVAT: ManualPiData.totalAmount,
  //     invoiceNumber: ManualPiData.invoiceNumber,
  //     quoteId: ManualPiData.invoiceNumber,
  //     AccountName: ManualPiData.billTo,
  //   };
  //   type = "Manual";
  // }

  order_number = data.quotePaymentWithDetails.QuotePaymentId;
  acountname = data.quoteWithProductDetails.AccountName;
  acountemail = data.quoteWithProductDetails.quoteEmail;
  order_amount = Number(
    data.salesforceResponseMatchScreening.total_including_Vat
  ).toFixed(2);
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

  // const accountDetailsResult = await AccountDetail.find();
  // if (!accountDetailsResult || accountDetailsResult.length === 0) {
  //   return res.status(400).json({ message: "Account details not found" });
  // }

  try {
    //   const isManual = type === "Manual";
    //   const successType = isManual ? "?type=manual" : "";
    //   const cancelType = isManual ? "?type=manual" : "";

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
      success_url: `https://ecommerce.yeepeey.com/successful/${data.quotePaymentId}`,
      cancel_url: `https://ecommerce.yeepeey.com/failure/${data.quotePaymentId}`,
    });

    const stripeResponseData = stripeResponse;

    const newOnlinePayForm = new OnlinePayment({
      transactionDetails: {
        amount: data.salesforceResponseMatchScreening.total_including_Vat,
        quotePaymentId: order_number,
        //   totalIncludingVAT: data.quoteWithProductDetails.totalIncludingVAT,

        // fromCurrency: currency_convertingfrom, // Assuming currency_converting has 'from' and 'to' properties
        // toCurrency: currency_convertingto,
        proformaInvoiceNumber: data.quoteWithProductDetails.ownerId,
        currencyPaid: "AED",
        // amountPaid:existingUser.totalIncludingVAT,
      },
      customerDetails: {
        name: data.quoteWithProductDetails.AccountName,
        id: data.quoteWithProductDetails.quoteEmail, // Assuming this is the desired ID
      },

      paymentType: "Online",
      status: "Paid",
      quoteId: data.quoteWithProductDetails.oppurtunityId,
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
  let order_number,
    acountname,
    acountemail,
    order_amount,
    type = "Online";

  // Fetch order details
  const data = await PiData.findOne({
    $or: [
      { "quoteWithProductDetails.quoteId": quoteId }, // Matches quoteId
      { "quotePaymentWithDetails.QuotePaymentId": quoteId }, // Matches QuotePaymentId
    ],
  });
  // if (!data) {
  // //   const ManualPiData = await manualPiData.findOne({ accountId: quoteId });
  //   data = {
  //     quotePaymentId: ManualPiData.accountId,
  //     quoteName: ManualPiData.billTo,
  //     quoteEmail: ManualPiData.email,
  //     partPayment: ManualPiData.totalAmount,
  //     totalIncludingVAT: ManualPiData.totalAmount,
  //     invoiceNumber: ManualPiData.invoiceNumber,
  //     AccountName: ManualPiData.billTo,
  //   };
  // //   type = "Manual";
  // }

  order_number = data.quotePaymentWithDetails.QuotePaymentId;
  acountname = data.quoteWithProductDetails.AccountName;
  acountemail = data.quoteWithProductDetails.quoteEmail;
  order_amount = Number(
    data.salesforceResponseMatchScreening.total_including_Vat
  ).toFixed(2);
  const order_currency = "AED";
  const order_description = "payment_description";

  try {
    // Define success and cancel URLs based on payment type
    //   const isManual = type === "Manual";
    //   const successType = type === "Manual" ? "?type=manual" : "";
    //   const cancelType = type === "Manual" ? "?type=manual" : "";

    const telrResponse = await axios.post(
      "https://secure.telr.com/gateway/order.json",
      {
        method: "create",
        store: process.env.TELR_STORE_ID,
        authkey: process.env.TELR_AUTH_KEY,
        framed: 0, // Use 0 to disable iframe integration
        order: {
          cartid: order_number, // Unique order reference
          test: "1", // Use "1" for test mode; "0" for live transactions
          amount: order_amount, // Transaction amount
          currency: order_currency, // Currency (e.g., "AED")
          description: order_description, // Order description
        },
        return: {
          authorised: `https://ecommerce.yeepeey.com/successful/${order_number}`,
          declined: `https://ecommerce.yeepeey.com/failure/${order_number}`,
          cancelled: `https://ecommerce.yeepeey.com/cancelled/${order_number}`,
        },
        customer: {
          ref: order_number, // Unique customer reference
          email: acountemail, // Customer email
          name: {
            title: "tler", // Leave empty if not required
            forenames: acountname, // Full or first name of the customer
            surname: "tler", // Leave empty if no surname is needed
          },
          // Address fields left empty to hide them
          address: {
            line1: "tler", // Address line 1 - left empty to avoid display
            city: "tler", // City - left empty to avoid display
            country: "tler", // Country - left empty to avoid display
          },
          // Optionally, leave out the phone field
          phone: "+911234569898", // Leave empty to avoid displaying the phone number
        },
      },
      {
        headers: {
          Authorization: `Basic ${process.env.TELR_BASIC_AUTH}`,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    const newOnlinePayForm = new OnlinePayment({
      transactionDetails: {
        amount: data.salesforceResponseMatchScreening.total_including_Vat,
        quotePaymentId: order_number,
        //   totalIncludingVAT: data.quoteWithProductDetails.totalIncludingVAT,

        // fromCurrency: currency_convertingfrom, // Assuming currency_converting has 'from' and 'to' properties
        // toCurrency: currency_convertingto,
        proformaInvoiceNumber: data.quoteWithProductDetails.ownerId,
        currencyPaid: "AED",
        // amountPaid:existingUser.totalIncludingVAT,
      },
      customerDetails: {
        name: data.quoteWithProductDetails.AccountName,
        id: data.quoteWithProductDetails.quoteEmail, // Assuming this is the desired ID
      },

      paymentType: "Online",
      status: "Paid",
      quoteId: data.quoteWithProductDetails.oppurtunityId,
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
  console.log("salesforce called.............");

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
    const PiDataCheck = await PiData.findOne({
      $or: [
        { quoteId: quoteId },
        { "quotePaymentWithDetails.QuotePaymentId": quoteId },
      ],
    });


    const virtualDetails = await VirtualDetails.findOne({ "QuotePaymentId": quoteId });
    const mailDetails = await MailDetails.findOne({ "QuotePaymentId": quoteId });
    
    if (virtualDetails || mailDetails) {
        // Prepare the updated fields from virtualDetails or mailDetails
        const updatedShareholders = [];
        
        // Example logic: Check if there are any shareholders in virtualDetails or mailDetails
        if (virtualDetails && virtualDetails.shareholders) {
            virtualDetails.shareholders.forEach(shareholder => {
                updatedShareholders.push({
                    name: shareholder.name,
                    shareholderPercentage: shareholder.shareholderPercentage,
                    dob: shareholder.dob,
                    nationalityshareholder: shareholder.nationalityshareholder,
                    passportNumber: shareholder.passportNumber,
                    files: shareholder.files,  // Assuming `files` contain URLs or other file data
                });
            });
        }
    
        if (mailDetails && mailDetails.shareholders) {
            mailDetails.shareholders.forEach(shareholder => {
                updatedShareholders.push({
                    name: shareholder.name,
                    shareholderPercentage: shareholder.shareholderPercentage,
                    dob: shareholder.dob,
                    nationalityshareholder: shareholder.nationalityshareholder,
                    passportNumber: shareholder.passportNumber,
                    files: shareholder.files,  // Assuming `files` contain URLs or other file data
                });
            });
        }
    
        // Update PiData with new or modified shareholders
        const updateFile = await PiData.updateOne(
            { _id: PiDataCheck._id },  // Match by the PiData document's ID
            {
                $set: {
                 
                    shareholders: updatedShareholders || '',  // Update shareholders field
                },
            }
        );
    
        console.log("PiData updated successfully:", updateFile);
    }
    

    if (!paynowdata) {
      // Throw an error if the document is not found
      throw new Error("Document not found");
    }

    const requestBodySalesforce = {
      qp: {
        paymentmethod: "Pay Now",
        amount_received: paynowdata.transactionDetails.amount,
        bank_name: "Payment Gateway",
        GL_code: "1301 - VZ ADCB (AED) 10515838124001",
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
    console.log("requestBodySalesforce",requestBodySalesforce)

    const response1 = await axios.put(endpointUrl, requestBodySalesforce, { headers });

console.log(response1,"response 1 data")

      const requestBodySalesforce2 = {
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
  
      // Endpoint URL for the second API call
      const endpointUrl2 = `${process.env.SALESFORCE_API_URL}/services/apexrest/VZAR_ProformaInvoiceUpdate/${paynowdata.transactionDetails.quotePaymentId}`;
  
      console.log(requestBodySalesforce2,"requestBodySalesforce2")
      // Making the second API call
      const response2 = await axios.put(endpointUrl2, requestBodySalesforce2, { headers });
console.log(response2,"response 2 data")
      const { invoiceDate, invoiceNumber } = response2.data;
    if (PiDataCheck) {
      await PiData.updateOne(
        { _id: PiDataCheck._id },
        {
          $set: {
            invoiceDate,
            invoiceNumber,
          },
        }
      );
    }

    // 12. Mark isPayment = true on PiData if it exists
    if (PiDataCheck) {
      await PiData.updateOne(
        { _id: PiDataCheck._id },
        { $set: { isPayment: true } }
      );
      console.log("isPayment updated to true for:", PiDataCheck._id);
    } else {
      console.log("No document found for the given quoteId.");
    }

    // 13. Handle user creation and email sending
    const userEmail = paynowdata.customerDetails.id;
    const username = paynowdata.customerDetails.name;
    const Amount = paynowdata.transactionDetails.amount;
    const planName = PiDataCheck?.planname || "";


    console.log(planName,"planName................",PiDataCheck)

    console.log("User Email:", userEmail);

    // Step 2: Check if the user already exists in the database
    const existingUser = await User.findOne({ email: userEmail });

    if (!existingUser) {
      // User doesn't exist, create a new user and send email
      // Create a random password for the new user
      const randomPassword = Math.random().toString(36).slice(-8); // Simple 8-character random password

      // Hash the password and save the new user
      const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

      const newUser = new User({
        email: userEmail, // Use email from the payment data
        password: hashedPassword,
      });

      await newUser.save();

      // Send the email with login details
      const mailOptions = {
        from: "mishalnunu@gmail.com", // Sender address
        to: userEmail, // Receiver email address (from the OnlinePayment document)
        subject: "Payment Received – Welcome to Virtuzone!",
        html: `
<div> <p style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.5; color: #000;">
                      Hi ${username},<br><br>
                      Your payment has been successfully processed, and you’re officially part of Virtuzone! 🎉<br><br>
                      Here are your service details:<br>
                       <strong>Service Plan:</strong> ${planName}<br>
                      <strong>Amount:</strong> ${Amount}<br>
                    
                      You can access your Customer Portal here:<br>
                      <a href="https://ecommerce.yeepeey.com/login" style="color: #007bff; text-decoration: underline;">Customer Portal</a><br><br>
                      Your Email: <strong>${userEmail}</strong><br>
                      Your temporary password: <strong>${randomPassword}</strong> (You can change it once logged in).<br><br>
                      Feel free to reach out if you have any questions.<br><br>
                      Thanks for choosing Virtuzone!<br>
                      <strong>The Virtuzone Team</strong>
                    </p><table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
      <tbody>
        <tr>
          <td>
            <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color: #000000; width: 600px;" width="600">
              <tbody>
                <tr>
                  <td class="column column-1" width="100%" style="text-align: left; padding: 30px 20px; vertical-align: top;">
                    <table class="image_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding-bottom: 20px; text-align: center;">
                          <img src="https://res.cloudinary.com/dvekmmxxx/image/upload/v1718347384/photo_2024-06-14_11-46-14-removebg-preview_bml8en.png" style="max-width: 183px; width: 100%; height: auto; border: 0;" alt="Virtuzone Logo">
                        </td>
                      </tr>
                    </table>
                   
                    <table class="social_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="text-align: center;">
                          <a href="https://www.facebook.com/virtuzone" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" alt="Facebook">
                          </a>
                          <a href="https://twitter.com/Virtuzone_UAE" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" alt="Twitter">
                          </a>
                          <a href="http://www.youtube.com/virtuzoneuae" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/youtube@2x.png" width="32" alt="YouTube">
                          </a>
                          <a href="http://www.instagram.com/virtuzone" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" alt="Instagram">
                          </a>
                          <a href="http://www.linkedin.com/company/virtuzone" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" alt="LinkedIn">
                          </a>
                          <a href="https://www.vz.ae/" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/website@2x.png" width="32" alt="Website">
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #000;">
                      <a href="https://g.page/virtuzone?share" style="color: #000; text-decoration: underline;" target="_blank">
                        Office 404, Al Saaha Office, Building B, Souk Al Bahar, Old Town Island,<br>Burj Khalifa District, Dubai - UAE
                      </a>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table></div>

`,
      };

      // Send the email
      mailTransporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    } else {
      // If the user already exists, log a message
      console.log("User already exists, no need to create or send email");
    }



    const verifyMailOptions = {
      from: "mishalnunu@gmail.com", // Sender address
      to: userEmail, // Receiver email address
      subject: "Welcome to Virtuzone – Let's Get Started!",
      html: `
  <div>
    <p style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.5; color: #000;">
        Hi ${username},<br><br>
       Welcome to Virtuzone!<br>
       We noticed you've started filling out your details – that’s a great first step. Now, it’s time to complete your journey and access everything for your business to run seamlessly.<br><br>
       With Virtuzone, you'll get:<br>
        <ul>
            <li><strong>Expert guidance every step of the way.</strong></li>
            <li><strong>Fast and easy access to all our business services.</strong></li>
            <li><strong>A dedicated team ready to help you succeed</strong></li>
        </ul><br>
        Click below to pick up right where you left off and unlock the tools you need to bring your business dreams to life.<br><br>
        Best regards,<br>
        <strong>The Virtuzone Team</strong><br>
     
    </p>
    
    
<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
      <tbody>
        <tr>
          <td>
            <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="color: #000000; width: 600px;" width="600">
              <tbody>
                <tr>
                  <td class="column column-1" width="100%" style="text-align: left; padding: 30px 20px; vertical-align: top;">
                    <table class="image_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="padding-bottom: 20px; text-align: center;">
                          <img src="https://res.cloudinary.com/dvekmmxxx/image/upload/v1718347384/photo_2024-06-14_11-46-14-removebg-preview_bml8en.png" style="max-width: 183px; width: 100%; height: auto; border: 0;" alt="Virtuzone Logo">
                        </td>
                      </tr>
                    </table>
                   
                    <table class="social_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="text-align: center;">
                          <a href="https://www.facebook.com/virtuzone" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" alt="Facebook">
                          </a>
                          <a href="https://twitter.com/Virtuzone_UAE" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" alt="Twitter">
                          </a>
                          <a href="http://www.youtube.com/virtuzoneuae" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/youtube@2x.png" width="32" alt="YouTube">
                          </a>
                          <a href="http://www.instagram.com/virtuzone" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" alt="Instagram">
                          </a>
                          <a href="http://www.linkedin.com/company/virtuzone" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" alt="LinkedIn">
                          </a>
                          <a href="https://www.vz.ae/" target="_blank">
                            <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/website@2x.png" width="32" alt="Website">
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #000;">
                      <a href="https://g.page/virtuzone?share" style="color: #000; text-decoration: underline;" target="_blank">
                        Office 404, Al Saaha Office, Building B, Souk Al Bahar, Old Town Island,<br>Burj Khalifa District, Dubai - UAE
                      </a>
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>


</div>
      `,
  };
  
  // Send the verification email
  mailTransporter.sendMail(verifyMailOptions, (error, info) => {
      if (error) {
          console.error("Error sending verification email:", error);
      } else {
          console.log("Verification email sent:", info.response);
      }
  });
  
if (PiDataCheck) {
  // Update the isPayment field to true
  await PiData.updateOne(
    { _id: PiDataCheck._id },
    { $set: { isPayment: true } }
  );
  console.log("isPayment updated to true for:", PiDataCheck._id);
} else {
  console.log("No document found for the given quoteId.");
}
res.json({
  message: "Success",
  response2: response2.data,
});

  } catch (error) {
    console.error("Error in payNowSaleforce:", error);
    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Status Code:", error.response.status);
    } else if (error.request) {
      console.error("No Response Received:", error.request);
    } else {
      console.error("Error Message:", error.message);
    }
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
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

  // const accountDetailsResult = await AccountDetail.find();
  // if (!accountDetailsResult || accountDetailsResult.length === 0) {
  //   return res.status(400).json({ message: "Account details not found" });
  // }

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


const AddCashCounter = async (req, res) => {
  // Validation errors check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { quoteId } = req.params;
  //  console.log(quoteId)

   const tokenResponse = await axios.post(
       `${process.env.EXTERNAL_API_SERVISE_URL}/services/oauth2/token?client_id=3MVG92u_V3UMpV.iJ_PYoQIn.oBrD2K8M5KXly5UByR5PJScjbzghqvSh4Q1bWn901ksE5yXQ1nCu2jBS20ip&client_secret=0FF7FF381C10DC1CCCA1479939F21AA2370A640CAAF8730B8E3E90A7793AE6E1&grant_type=password&username=vzpaymentapi@vz.ae.vzfullcopy&password=VZ@12345678`
     );

  const accessToken = tokenResponse.data.access_token;
  const saleforcUrl = tokenResponse.data.instance_url;
  console.log("Access Token:", accessToken);

 
  try {
    const existingUser = await PiData.findOne({
      $or: [
        { "quoteWithProductDetails.quoteId": quoteId },
        { "quotePaymentWithDetails.QuotePaymentId": quoteId },
      ],
    });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const accountDetailsResult = await AccountDetail.find();
    if (!accountDetailsResult || accountDetailsResult.length === 0) {
      return res.status(400).json({ message: "Account details not found" });
    }

    const accountDetails = accountDetailsResult[0];

    // Check the condition for totalIncludingVAT
    if (existingUser.salesforceResponseMatchScreening.total_including_Vat < 55000) {
      // Handle the case when totalIncludingVAT is less than 55000
      // For example, save the file here or send a different response
      // You can add your specific logic here
      // Example: Save the file
      // const filePath = ...; // Define the file path
      // Save the file using appropriate logic

      const newBankTransferForm = new ChequeDesposit({
        bankDetails: {
          bank_name: accountDetails.bank_name,
          account_name: accountDetails.account_name,
          iban_number: accountDetails.iban_number,
          account_number: accountDetails.account_number,
          swift_code: accountDetails.swift_code,
          bank_address: accountDetails.bank_address,
        },
        transactionDetails: {
          amount: existingUser.salesforceResponseMatchScreening.totalAmount,
        quotePaymentId: existingUser.quotePaymentWithDetails.QuotePaymentId,
        partPayment: existingUser.salesforceResponseMatchScreening.total_including_Vat,
        proformaInvoiceNumber: existingUser.quotePaymentWithDetails.QuotePaymentId,
        currencyPaid: "AED",
        },
        customerDetails: {
          name: existingUser.leadWithDetails.FirstName,
          id: existingUser.leadWithDetails.Email, // Assuming this is the desired ID
        },
        status: "compliance Review",
        generalLedgerCode: "1341 - Cash in Hand (AED)",
      });

      await newBankTransferForm.save();
      // const requestBody = {
      //   paymentmethod: "Cash Over Counter",
      //   amount_received: newBankTransferForm.transactionDetails.partPayment,
      //   bank_name: "Cash in Hand (AED)",
      //   GL_code: newBankTransferForm.generalLedgerCode,
      //   Pay_Currency: newBankTransferForm.transactionDetails.currencyPaid,
      //   payment_status: newBankTransferForm.status,
      // };

      const requestBody =  {
        "qp": {
          paymentmethod: "Cash Over Counter",
          amount_received: newBankTransferForm.transactionDetails.amount,
          bank_name: "Cash in Hand (AED)",
          GL_code: newBankTransferForm.generalLedgerCode,
          Pay_Currency: newBankTransferForm.transactionDetails.currencyPaid,
          payment_status: newBankTransferForm.status,
          quotePaymentId:newBankTransferForm.transactionDetails.quotePaymentId
        },
        "attachments": [
          {
            "Body": "",
            "ContentType": "",
            "Name": ""
          },
          {
            "Body": "",
            "ContentType": "",
            "Name": ""
          }
        ]
      }

      console.log(requestBody);

      // Set up the headers with the access token
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json", // Specify the content type as JSON
      };

      const endpointUrl = `${saleforcUrl}/services/apexrest/VZAR_ProformaInvoiceUpdateQuotePayments/${newBankTransferForm.transactionDetails.quotePaymentId}`;

      axios
        .put(endpointUrl, requestBody, { headers })
        .then((response) => {
          // Handle the response here
          console.log("Response:", response.data);
        })
        .catch((error) => {
          // Handle errors here
          console.error("Error:", error);
        });

      return res.status(200).json({
        message: "Cash Over Counter Transfer processed",
        paymentmethod: "Cash Over Counter",

        Amountpaid: newBankTransferForm.amount,
        partPayment: newBankTransferForm.partPayment,
        status: newBankTransferForm.status,
        Name: newBankTransferForm.customerDetails.name,
        proformaInvoiceNumber:
          newBankTransferForm.transactionDetails.proformaInvoiceNumber,
        Currency: newBankTransferForm.currencyPaid,
        generalLedgerCode: newBankTransferForm.generalLedgerCode,
        currencyPaid: newBankTransferForm.transactionDetails.currencyPaid,
      });
    } else {
      // Create a new PaymentForm instance
      const uploadedFiles = req.files;
      const fileNames = uploadedFiles.map((file) => file.filename);
      // const fileNames = uploadedFiles/
      console.log(fileNames);
      const uploadPromises = uploadedFiles.map(async (file) => {
        const filePath = 'transfer_copy/' + file.filename; // Update this path
        const fileContent = fs.readFileSync(filePath);
        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: file.filename,
          Body: fileContent,
          ContentType: file.mimetype, // Set this according to your file type
        };
    
        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Location; // URL of the uploaded file
      });
    
      const paymentReceiptURLs = await Promise.all(uploadPromises);
 

      const newBankTransferForm = new CashCounter({
        bankDetails: {
          bank_name: accountDetails.bank_name,
          account_name: accountDetails.account_name,
          iban_number: accountDetails.iban_number,
          account_number: accountDetails.account_number,
          swift_code: accountDetails.swift_code,
          bank_address: accountDetails.bank_address,
        },
        transactionDetails: {
          amount: existingUser.salesforceResponseMatchScreening.totalAmount,
          quotePaymentId: existingUser.quotePaymentWithDetails.QuotePaymentId,
          partPayment: existingUser.salesforceResponseMatchScreening.total_including_Vat,
          proformaInvoiceNumber: existingUser.quotePaymentWithDetails.QuotePaymentId,
        currencyPaid: "AED",
          
        },
        customerDetails: {
          name: existingUser.leadWithDetails.FirstName,
          id: existingUser.leadWithDetails.Email, // Assuming this is the desired ID
        },
        fileUpload: paymentReceiptURLs,
        quoteId: existingUser.quotePaymentWithDetails.QuotePaymentId,
        status: "compliance Review",
        generalLedgerCode: "1301 - VZ ADCB (AED) 10515838124001",
      });


      let attachments = [];
      for (const file of req.files) {
        const filePath = 'transfer_copy/' + file.filename; // Update this path
        const base64Data = await convertFileToBase64(filePath);
        attachments.push({
          Body: base64Data,
          ContentType:file.mimetype, // Set this according to your file type
          Name: file.originalname
        });
      }

      await newBankTransferForm.save();

      const qp = {
        paymentmethod: "Cash Over Counter",
        amount_received: newBankTransferForm.transactionDetails.partPayment,
          bank_name:  "Cash in Hand (AED)",
          GL_code: newBankTransferForm.generalLedgerCode,
          Pay_Currency: newBankTransferForm.transactionDetails.currencyPaid,
          payment_status: newBankTransferForm.status,
          quotePaymentId:newBankTransferForm.transactionDetails.quotePaymentId
      };
    
     
      const requestBody = {
        qp,
        paymentReceiptURLs
        
      };

      console.log(requestBody)
      // Set up the headers with the access token
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json", // Specify the content type as JSON
      };

      const endpointUrl = `${saleforcUrl}/services/apexrest/VZAR_ProformaInvoiceUpdateQuotePayments/${newBankTransferForm.transactionDetails.quotePaymentId}`;

      axios
        .put(endpointUrl, requestBody, { headers })
        .then((response) => {
          // Handle the response here
          console.log("Response:", response.data);
        })
        .catch((error) => {
          // Handle errors here
          console.error("Error:", error);
        });

        await sendEmail(existingUser.salesPersonDetails.salesPersonName,newBankTransferForm.customerDetails.id, existingUser.leadWithDetails.FirstName,existingUser.salesPersonDetails.salesPersonEmail);
        let HtmlBody=`<!DOCTYPE html>
        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
        
        <head>
          <title></title>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
          <style>
            * {
              box-sizing: border-box;
            }
        
            body {
              margin: 0;
              padding: 0;
            }
        
            a[x-apple-data-detectors] {
              color: inherit !important;
              text-decoration: inherit !important;
            }
        
            #MessageViewBody a {
              color: inherit;
              text-decoration: none;
            }
        
            p {
              line-height: inherit
            }
        
            .desktop_hide,
            .desktop_hide table {
              mso-hide: all;
              display: none;
              max-height: 0px;
              overflow: hidden;
            }
        
            .image_block img+div {
              display: none;
            }
        
            @media (max-width:620px) {
              .social_block.desktop_hide .social-table {
                display: inline-block !important;
              }
        
              .mobile_hide {
                display: none;
              }
        
              .row-content {
                width: 100% !important;
              }
        
              .stack .column {
                width: 100%;
                display: block;
              }
        
              .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
              }
        
              .desktop_hide,
              .desktop_hide table {
                display: table !important;
                max-height: none !important;
              }
            }
          </style>
        </head>
        
        <body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
          <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
            <tbody>
              <tr>
                <td>
                  <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <tbody>
                      <tr>
                        <td>
                          <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                            <tbody>
                              <tr>
                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                  <table class="paragraph_block block-1" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                    <tr>
                                      <td class="pad">
                                        <div style="color:#000000;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                          <p style="margin: 0; margin-bottom: 16px;">Hello,</p>
                                          <p style="margin: 0; margin-bottom: 16px;">A customer has chosen to pay via <b>cash over counter.</b> </p>
                                          <p style="margin: 0; margin-bottom: 16px;">Reference Quote Number - <b>${existingUser.quotePaymentName}</b> </p>
                                       
                                     
                                         
                                          <p style="margin: 0;">Thank you!</p>
                                       
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <tbody>
                      <tr>
                        <td>
                          <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                            <tbody>
                              <tr>
                                <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 30px; padding-left: 20px; padding-right: 20px; padding-top: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                  <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tr>
                                      <td class="pad" style="padding-bottom:20px;width:100%;padding-right:0px;padding-left:0px;">
                                        <div class="alignment" align="center" style="line-height:10px">
                                          <div style="max-width: 183px;"><a href="https://www.vz.ae" target="_blank" style="outline:none" tabindex="-1"><img src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/661805_644134/VZ%20Logo.png" style="display: block; height: auto; border: 0; width: 100%;" width="183"></a></div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <table class="social_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                    <tr>
                                      <td class="pad" style="text-align:center;padding-right:0px;padding-left:0px;">
                                        <div class="alignment" align="center">
                                          <table class="social-table" width="276px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                            <tr>
                                              <td style="padding:0 7px 0 7px;"><a href="https://www.facebook.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; height: auto; border: 0;"></a></td>
                                              <td style="padding:0 7px 0 7px;"><a href="https://twitter.com/Virtuzone_UAE" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; height: auto; border: 0;"></a></td>
                                              <td style="padding:0 7px 0 7px;"><a href="http://www.youtube.com/virtuzoneuae" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/youtube@2x.png" width="32" height="32" alt="YouTube" title="YouTube" style="display: block; height: auto; border: 0;"></a></td>
                                              <td style="padding:0 7px 0 7px;"><a href="http://www.instagram.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" height="32" alt="Instagram" title="Instagram" style="display: block; height: auto; border: 0;"></a></td>
                                              <td style="padding:0 7px 0 7px;"><a href="http://www.linkedin.com/company/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" height="32" alt="LinkedIn" title="LinkedIn" style="display: block; height: auto; border: 0;"></a></td>
                                              <td style="padding:0 7px 0 7px;"><a href="https://www.vz.ae/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/website@2x.png" width="32" height="32" alt="Web Site" title="Web Site" style="display: block; height: auto; border: 0;"></a></td>
                                            </tr>
                                          </table>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  <table class="text_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                    <tr>
                                      <td class="pad" style="padding-left:10px;padding-right:10px;padding-top:10px;">
                                        <div style="font-family: sans-serif">
                                          <div class style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; mso-line-height-alt: 18px; color: #000000; line-height: 1.5;">
                                            <p style="margin: 0; text-align: center; mso-line-height-alt: 18px;"><a href="https://g.page/virtuzone?share" target="_blank" style="text-decoration: underline; color: #000000;" rel="noopener">Office 404, Al Saaha Office, Building B, Souk Al Bahar, Old Town Island,<br>Burj Khalifa District, Dubai - UAE</a></p>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table><!-- End -->
        </body>
        
        </html>
        `
        let subjectMail="Customer paying via cash over counter"
        let toMail= process.env.ToMailCashOverCounter
        await  ReviewsendEmail(existingUser.salesPersonDetails.salesPersonEmail,toMail,subjectMail,HtmlBody,attachments)

      return res.status(200).json({
        message: "Cash Over Counter Transfer processed successfully",
        Paymentmodes: "Cash Over Counter",

        Amountpaid: newBankTransferForm.totalIncludingVAT,
        partPayment: newBankTransferForm.partPayment,
        status: newBankTransferForm.status,
        Name: newBankTransferForm.customerDetails.name,
        proformaInvoiceNumber:
          newBankTransferForm.transactionDetails.proformaInvoiceNumber,
        receiptfile: newBankTransferForm.fileUpload,
        Currency: newBankTransferForm.currencyPaid,
        generalLedgerCode: newBankTransferForm.generalLedgerCode,
        currencyPaid: newBankTransferForm.transactionDetails.currencyPaid,
      });
    }
  } catch (err) {
    console.error("Error during Bank Transfer processing:", err);
    return res.status(500).json({ message: "Server error" });
  }
};




async function sendEmail(opportunityName,to,name,opportunityOwnerEmail) {
  // Email options

    const data = {
      from: process.env.SMTP_USER,
      to: to,
      cc: opportunityOwnerEmail,
      replyTo:"monish@yeepeey.com",
      subject:"Notice: Your documents are now under review",
       html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
    
    <head>
      <title></title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
      <style>
        * {
          box-sizing: border-box;
        }
    
        body {
          margin: 0;
          padding: 0;
        }
    
        a[x-apple-data-detectors] {
          color: inherit !important;
          text-decoration: inherit !important;
        }
    
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
        }
    
        p {
          line-height: inherit
        }
    
        .desktop_hide,
        .desktop_hide table {
          mso-hide: all;
          display: none;
          max-height: 0px;
          overflow: hidden;
        }
    
        .image_block img+div {
          display: none;
        }
    
        @media (max-width:620px) {
          .social_block.desktop_hide .social-table {
            display: inline-block !important;
          }
    
          .mobile_hide {
            display: none;
          }
    
          .row-content {
            width: 100% !important;
          }
    
          .stack .column {
            width: 100%;
            display: block;
          }
    
          .mobile_hide {
            min-height: 0;
            max-height: 0;
            max-width: 0;
            overflow: hidden;
            font-size: 0px;
          }
    
          .desktop_hide,
          .desktop_hide table {
            display: table !important;
            max-height: none !important;
          }
        }
      </style>
    </head>
    
    <body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
      <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
        <tbody>
          <tr>
            <td>
              <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tbody>
                  <tr>
                    <td>
                      <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                        <tbody>
                          <tr>
                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                              <table class="paragraph_block block-1" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                <tr>
                                  <td class="pad">
                                    <div style="color:#000000;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                      <p style="margin: 0; margin-bottom: 16px;">Hi&nbsp;${name},</p>
                                      <p style="margin: 0; margin-bottom: 16px;">Thank you for uploading the required supporting documents for your preferred payment method. We are pleased to inform you that they are now under review.</p>
                                      <p style="margin: 0; margin-bottom: 16px;">Our team will reach out to you if further details or documents are needed. We will also update you on the status of your payment and documents accordingly.</p>
                                     <br>
                                      <p style="margin: 0;">Regards,</p>
                                      <p style="margin: 0;">${opportunityName}</p>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tbody>
                  <tr>
                    <td>
                      <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                        <tbody>
                          <tr>
                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 30px; padding-left: 20px; padding-right: 20px; padding-top: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                              <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                  <td class="pad" style="padding-bottom:20px;width:100%;padding-right:0px;padding-left:0px;">
                                    <div class="alignment" align="center" style="line-height:10px">
                                      <div style="max-width: 183px;"><a href="https://www.vz.ae" target="_blank" style="outline:none" tabindex="-1"><img src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/661805_644134/VZ%20Logo.png" style="display: block; height: auto; border: 0; width: 100%;" width="183"></a></div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                              <table class="social_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                  <td class="pad" style="text-align:center;padding-right:0px;padding-left:0px;">
                                    <div class="alignment" align="center">
                                      <table class="social-table" width="276px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                        <tr>
                                          <td style="padding:0 7px 0 7px;"><a href="https://www.facebook.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; height: auto; border: 0;"></a></td>
                                          <td style="padding:0 7px 0 7px;"><a href="https://twitter.com/Virtuzone_UAE" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; height: auto; border: 0;"></a></td>
                                          <td style="padding:0 7px 0 7px;"><a href="http://www.youtube.com/virtuzoneuae" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/youtube@2x.png" width="32" height="32" alt="YouTube" title="YouTube" style="display: block; height: auto; border: 0;"></a></td>
                                          <td style="padding:0 7px 0 7px;"><a href="http://www.instagram.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" height="32" alt="Instagram" title="Instagram" style="display: block; height: auto; border: 0;"></a></td>
                                          <td style="padding:0 7px 0 7px;"><a href="http://www.linkedin.com/company/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" height="32" alt="LinkedIn" title="LinkedIn" style="display: block; height: auto; border: 0;"></a></td>
                                          <td style="padding:0 7px 0 7px;"><a href="https://www.vz.ae/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/website@2x.png" width="32" height="32" alt="Web Site" title="Web Site" style="display: block; height: auto; border: 0;"></a></td>
                                        </tr>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                              <table class="text_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                <tr>
                                  <td class="pad" style="padding-left:10px;padding-right:10px;padding-top:10px;">
                                    <div style="font-family: sans-serif">
                                      <div class style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; mso-line-height-alt: 18px; color: #000000; line-height: 1.5;">
                                        <p style="margin: 0; text-align: center; mso-line-height-alt: 18px;"><a href="https://g.page/virtuzone?share" target="_blank" style="text-decoration: underline; color: #000000;" rel="noopener">Office 404, Al Saaha Office, Building B, Souk Al Bahar, Old Town Island,<br>Burj Khalifa District, Dubai - UAE</a></p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table><!-- End -->
    </body>
    
    </html>
    `,
    };
  
    mailTransporter.sendMail(data, function (error, info) {
      if (error) {
          console.error('Failed to send email:', error);
      } else {
          console.log('Email sent:', info.response);
      }
  });


}
async function ReviewsendEmail(opportunityOwnerEmail,toMail,subjectMail,HtmlBody,attachments) {
  // Email options

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: [toMail, opportunityOwnerEmail],
    subject: subjectMail,
    html: HtmlBody,
    attachments: attachments.map((attachment) => ({
        filename: attachment.Name,
        content: attachment.Body,
        encoding: 'base64',
        contentType: attachment.ContentType,
    })),
};
  
mailTransporter.sendMail(mailOptions, function (error, info) {
  if (error) {
      console.error('Failed to send email:', error);
  } else {
      console.log('Email sent:', info.response);
  }
});
  // Send the email

}

const sendWaitingEmail = async (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ message: "Invalid request format. Expected JSON." });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required", body: req.body });
  }

  const data = {
    from: "mishalnunu@gmail.com",
    to: email,
    subject: "Your account is waiting for approval",
    html: `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
    
    <head>
      <title></title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
      <style>
        * {
          box-sizing: border-box;
        }
    
        body {
          margin: 0;
          padding: 0;
        }
    
        a[x-apple-data-detectors] {
          color: inherit !important;
          text-decoration: inherit !important;
        }
    
        #MessageViewBody a {
          color: inherit;
          text-decoration: none;
        }
    
        p {
          line-height: inherit
        }
    
        .desktop_hide,
        .desktop_hide table {
          mso-hide: all;
          display: none;
          max-height: 0px;
          overflow: hidden;
        }
    
        .image_block img+div {
          display: none;
        }
    
        @media (max-width:620px) {
          .social_block.desktop_hide .social-table {
            display: inline-block !important;
          }
    
          .mobile_hide {
            display: none;
          }
    
          .row-content {
            width: 100% !important;
          }
    
          .stack .column {
            width: 100%;
            display: block;
          }
    
          .mobile_hide {
            min-height: 0;
            max-height: 0;
            max-width: 0;
            overflow: hidden;
            font-size: 0px;
          }
    
          .desktop_hide,
          .desktop_hide table {
            display: table !important;
            max-height: none !important;
          }
        }
      </style>
    </head>
    
    <body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
      <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
        <tbody>
          <tr>
            <td>
              <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tbody>
                  <tr>
                    <td>
                      <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                        <tbody>
                          <tr>
                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                              <table class="paragraph_block block-1" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                <tr>
                                  <td class="pad">
                                    <div style="color:#000000;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                      <p style="margin: 0; margin-bottom: 16px;">Hi&nbsp;,</p>
                                      <p style="margin: 0; margin-bottom: 16px;"> Thank you for uploading the required supporting documents. We are pleased to inform you that they are now under review.</p>
                                      <p style="margin: 0; margin-bottom: 16px;">We will send an email with the link for the payment once you got the approval</p>
                                     <br>
                                      <p style="margin: 0;">Regards,</p>
                                      <p style="margin: 0;"></p>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tbody>
                  <tr>
                    <td>
                      <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                        <tbody>
                          <tr>
                            <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 30px; padding-left: 20px; padding-right: 20px; padding-top: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                              <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                  <td class="pad" style="padding-bottom:20px;width:100%;padding-right:0px;padding-left:0px;">
                                    <div class="alignment" align="center" style="line-height:10px">
                                      <div style="max-width: 183px;"><a href="https://www.vz.ae" target="_blank" style="outline:none" tabindex="-1"><img src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/661805_644134/VZ%20Logo.png" style="display: block; height: auto; border: 0; width: 100%;" width="183"></a></div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                              <table class="social_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tr>
                                  <td class="pad" style="text-align:center;padding-right:0px;padding-left:0px;">
                                    <div class="alignment" align="center">
                                      <table class="social-table" width="276px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                        <tr>
                                          <td style="padding:0 7px 0 7px;"><a href="https://www.facebook.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; height: auto; border: 0;"></a></td>
                                          <td style="padding:0 7px 0 7px;"><a href="https://twitter.com/Virtuzone_UAE" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; height: auto; border: 0;"></a></td>
                                          <td style="padding:0 7px 0 7px;"><a href="http://www.youtube.com/virtuzoneuae" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/youtube@2x.png" width="32" height="32" alt="YouTube" title="YouTube" style="display: block; height: auto; border: 0;"></a></td>
                                          <td style="padding:0 7px 0 7px;"><a href="http://www.instagram.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" height="32" alt="Instagram" title="Instagram" style="display: block; height: auto; border: 0;"></a></td>
                                          <td style="padding:0 7px 0 7px;"><a href="http://www.linkedin.com/company/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" height="32" alt="LinkedIn" title="LinkedIn" style="display: block; height: auto; border: 0;"></a></td>
                                          <td style="padding:0 7px 0 7px;"><a href="https://www.vz.ae/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/website@2x.png" width="32" height="32" alt="Web Site" title="Web Site" style="display: block; height: auto; border: 0;"></a></td>
                                        </tr>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                              <table class="text_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                <tr>
                                  <td class="pad" style="padding-left:10px;padding-right:10px;padding-top:10px;">
                                    <div style="font-family: sans-serif">
                                      <div class style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; mso-line-height-alt: 18px; color: #000000; line-height: 1.5;">
                                        <p style="margin: 0; text-align: center; mso-line-height-alt: 18px;"><a href="https://g.page/virtuzone?share" target="_blank" style="text-decoration: underline; color: #000000;" rel="noopener">Office 404, Al Saaha Office, Building B, Souk Al Bahar, Old Town Island,<br>Burj Khalifa District, Dubai - UAE</a></p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table><!-- End -->
    </body>
    
    </html>
    `,
         
        
        
  };

  try {
    await mailTransporter.sendMail(data); // Added `await`
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email", error });
  }
};



const AddCashDeposit = async (req, res) => {
  // Validation errors check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { quoteId } = req.params;

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

  console.log("Access Token:", accessToken);

  const uploadedFiles = req.files;
  const fileNames = uploadedFiles.map((file) => file.filename);
  // const transfer_copy = req.file.filename;
  const uploadPromises = uploadedFiles.map(async (file) => {
    const filePath = "transfer_copy/" + file.filename; // Update this path
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.filename,
      Body: fileContent,
      ContentType: file.mimetype, // Set this according to your file type
    };

    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // URL of the uploaded file
  });

  const paymentReceiptURLs = await Promise.all(uploadPromises);

  try {

    const existingUser = await PiData.findOne({
      $or: [
        { "quoteWithProductDetails.quoteId": quoteId },
        { "quotePaymentWithDetails.QuotePaymentId": quoteId },
      ],
    });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const accountDetailsResult = await AccountDetail.find();
    if (!accountDetailsResult || accountDetailsResult.length === 0) {
      return res.status(400).json({ message: "Account details not found" });
    }

    const accountDetails = accountDetailsResult[0];
    // Create a new PaymentForm instance
    const newBankTransferForm = new CashDeposit({
      bankDetails: {
        bank_name: accountDetails.bank_name,
        account_name: accountDetails.account_name,
        iban_number: accountDetails.iban_number,
        account_number: accountDetails.account_number,
        swift_code: accountDetails.swift_code,
        bank_address: accountDetails.bank_address,
      },
      transactionDetails: {
     
        amount: existingUser.salesforceResponseMatchScreening.totalAmount,
        quotePaymentId: existingUser.quotePaymentWithDetails.QuotePaymentId,
        partPayment: existingUser.salesforceResponseMatchScreening.total_including_Vat,
        proformaInvoiceNumber: existingUser.quotePaymentWithDetails.QuotePaymentId,
        // fromCurrency: currency_convertingfrom, // Assuming currency_converting has 'from' and 'to' properties
        // toCurrency: currency_convertingto,

        currencyPaid: "AED",
        // amountPaid:existingUser.totalIncludingVAT,
      },
      customerDetails: {
        name: existingUser.leadWithDetails.FirstName,
        id: existingUser.leadWithDetails.Email, // Assuming this is the desired ID
      },
      fileUpload: paymentReceiptURLs,
      quoteId:existingUser.quotePaymentWithDetails.QuotePaymentId,
      status: "AR Review",
      generalLedgerCode: "1341 - Cash in Hand (AED)", // Default status
    });

    let attachments = [];
    for (const file of req.files) {
      const filePath = "transfer_copy/" + file.filename; // Update this path
      const base64Data = await convertFileToBase64(filePath);
      attachments.push({
        Body: base64Data,
        ContentType: file.mimetype, // Set this according to your file type
        Name: file.originalname,
      });
    }

    console.log(attachments);

    await newBankTransferForm.save();
    const qp = {
      paymentmethod: "Cash Deposit",
      amount_received: newBankTransferForm.transactionDetails.partPayment,
      bank_name: "Cash in Hand (AED)",
      GL_code: newBankTransferForm.generalLedgerCode,
      Pay_Currency: newBankTransferForm.transactionDetails.currencyPaid,
      payment_status: newBankTransferForm.status,
      quotePaymentId: newBankTransferForm.transactionDetails.quotePaymentId,
    };

    const requestBody = {
      qp,
      paymentReceiptURLs,
    };

    console.log(requestBody);

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json", // Specify the content type as JSON
    };

    const endpointUrl = `${process.env.SALESFORCE_API_URL}/services/apexrest/VZAR_ProformaInvoiceUpdateQuotePayments/${newBankTransferForm.transactionDetails.quotePaymentId}`;

    axios
      .put(endpointUrl, requestBody, { headers })
      .then((response) => {
        // Handle the response here
        console.log("Response:", response.data);
      })
      .catch((error) => {
        // Handle errors here
        console.error("Error:", error);
      });

    await sendEmail(
      existingUser.salesPersonDetails.salesPersonName,newBankTransferForm.customerDetails.id, existingUser.leadWithDetails.FirstName,existingUser.salesPersonDetails.salesPersonEmail
    );
    let HtmlBody = `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          .image_block img+div {
            display: none;
          }
      
          @media (max-width:620px) {
            .social_block.desktop_hide .social-table {
              display: inline-block !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
          <tbody>
            <tr>
              <td>
                <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="paragraph_block block-1" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad">
                                      <div style="color:#000000;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                        <p style="margin: 0; margin-bottom: 16px;">Dear Mary,</p>
                                        <p style="margin: 0; margin-bottom: 16px;">Please note that an attachment has been uploaded for quote payment - <b>${existingUser.quotePaymentName}</b> </p>
                                     
                                     
                                        <p style="margin: 0;">Please have a look at it!</p>
                                        <br>
                                        <p style="margin: 0;">Thank you!</p>
                                     
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 30px; padding-left: 20px; padding-right: 20px; padding-top: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                  <tr>
                                    <td class="pad" style="padding-bottom:20px;width:100%;padding-right:0px;padding-left:0px;">
                                      <div class="alignment" align="center" style="line-height:10px">
                                        <div style="max-width: 183px;"><a href="https://www.vz.ae" target="_blank" style="outline:none" tabindex="-1"><img src="https://res.cloudinary.com/dvekmmxxx/image/upload/v1718347384/photo_2024-06-14_11-46-14-removebg-preview_bml8en.png" style="display: block; height: auto; border: 0; width: 100%;" width="183"></a></div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                <table class="social_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                  <tr>
                                    <td class="pad" style="text-align:center;padding-right:0px;padding-left:0px;">
                                      <div class="alignment" align="center">
                                        <table class="social-table" width="276px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                          <tr>
                                            <td style="padding:0 7px 0 7px;"><a href="https://www.facebook.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="https://twitter.com/Virtuzone_UAE" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.youtube.com/virtuzoneuae" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/youtube@2x.png" width="32" height="32" alt="YouTube" title="YouTube" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.instagram.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" height="32" alt="Instagram" title="Instagram" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.linkedin.com/company/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" height="32" alt="LinkedIn" title="LinkedIn" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="https://www.vz.ae/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/website@2x.png" width="32" height="32" alt="Web Site" title="Web Site" style="display: block; height: auto; border: 0;"></a></td>
                                          </tr>
                                        </table>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                <table class="text_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding-left:10px;padding-right:10px;padding-top:10px;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; mso-line-height-alt: 18px; color: #000000; line-height: 1.5;">
                                          <p style="margin: 0; text-align: center; mso-line-height-alt: 18px;"><a href="https://g.page/virtuzone?share" target="_blank" style="text-decoration: underline; color: #000000;" rel="noopener">Office 404, Al Saaha Office, Building B, Souk Al Bahar, Old Town Island,<br>Burj Khalifa District, Dubai - UAE</a></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>
      `;
    let subjectMail = "An Attachment has been uploaded";
    let toMail = process.env.ToMail;
    await ReviewsendEmail(
      existingUser.salesPersonDetails.salesPersonEmail,
      toMail,
      subjectMail,
      HtmlBody,
      attachments
    );

    return res.status(200).json({
      message: "Cash Deposit Transfer processed successfully",
      //   paymentFormDetails: newBankTransferForm,
      Paymentmodes: "Cash Deposit",

      Amountpaid: newBankTransferForm.partPayment,
      status: newBankTransferForm.status,
      Name: newBankTransferForm.customerDetails.name,
      proformaInvoiceNumber:
        newBankTransferForm.transactionDetails.proformaInvoiceNumber,
      receiptfile: newBankTransferForm.fileUpload,
      Currency: newBankTransferForm.currencyPaid,
      generalLedgerCode: newBankTransferForm.generalLedgerCode,
      currencyPaid: newBankTransferForm.transactionDetails.currencyPaid,
    });
  } catch (err) {
    console.error("Error during Bank Transfer processing:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


const convertCurrency = async (req, res) => {
  const xeApiUsername = process.env.XE_API_USERNAME;
  const xeApiPassword = process.env.XE_API_PASSWORD;

  const { fromCurrency, toCurrency, amount } = req.body;

  if (fromCurrency === toCurrency) {
    return res.json({ convertedAmount: amount });
  }

  const url = `${process.env.XE_API_BASE_URL}/convert_from?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`;
  const auth = { username: xeApiUsername, password: xeApiPassword };

  try {
    const response = await axios.get(url, { auth });
    const convertedAmount = response.data.to[0].mid;
    res.json({ convertedAmount });
  } catch (error) {
    // Handle specific error from the external API
    if (
      error.response &&
      error.response.data &&
      error.response.data.code === 9
    ) {
      // Perform custom conversion here
      console.log("customConverte worked");
      const conversionRate = rates[fromCurrency]?.[toCurrency];

      console.log(conversionRate, amount);

      let customConvertedAmount = new Decimal(amount)
        .mul(new Decimal(conversionRate))
        .toFixed(4); // changed this line
      customConvertedAmount = Math.round(customConvertedAmount * 100) / 100; // added this line
      console.log(customConvertedAmount);

      return res.json({ convertedAmount: customConvertedAmount });
    }

    // Handle other errors
    console.error("Error fetching conversion rate:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const AddBankTransfer = async (req, res) => {
  // Validation errors check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { quoteId } = req.params;
  console.log(quoteId);
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

  console.log("Access Token:", accessToken);

  const {
    currency_convertingfrom,
    currency_convertingto,
    amountPaid,
    currencyPaid,
    Converted_value,
  } = req.body;
  console.log(req.body);

  const uploadedFiles = req.files;
  const fileNames = uploadedFiles.map((file) => file.filename);
  console.log(fileNames);

  const uploadPromises = uploadedFiles.map(async (file) => {
    const filePath = "transfer_copy/" + file.filename; // Update this path
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.filename,
      Body: fileContent,
      ContentType: file.mimetype, // Set this according to your file type
    };

    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // URL of the uploaded file
  });

  const paymentReceiptURLs = await Promise.all(uploadPromises);

  try {
    const existingUser = await PiData.findOne({
      $or: [
        { "quoteWithProductDetails.quoteId": quoteId },
        { "quotePaymentWithDetails.QuotePaymentId": quoteId },
      ],
    });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const accountDetailsResult = await AccountDetail.find();
    if (!accountDetailsResult || accountDetailsResult.length === 0) {
      return res.status(400).json({ message: "Account details not found" });
    }

    const accountDetails = accountDetailsResult[0];
    // Create a new PaymentForm instance
    const newBankTransferForm = new BankTransfer({
      bankDetails: {
        bank_name: accountDetails.bank_name,
        account_name: accountDetails.account_name,
        iban_number: accountDetails.iban_number,
        account_number: accountDetails.account_number,
        swift_code: accountDetails.swift_code,
        bank_address: accountDetails.bank_address,
      },
      transactionDetails: {

        amount: existingUser.salesforceResponseMatchScreening.totalAmount,
        quotePaymentId: existingUser.quotePaymentWithDetails.QuotePaymentId,
        partPayment: existingUser.salesforceResponseMatchScreening.total_including_Vat,
        proformaInvoiceNumber: existingUser.quotePaymentWithDetails.QuotePaymentId,


      

     
        fromCurrency: currency_convertingfrom,
        toCurrency: currency_convertingto,
      
        currencyPaid: currencyPaid,
        amountPaid: existingUser.salesforceResponseMatchScreening.total_including_Vat,
      },
      customerDetails: {
        name: existingUser.leadWithDetails.FirstName,
        id: existingUser.leadWithDetails.Email, // Assuming this is the desired ID
      },
      fileUpload: paymentReceiptURLs, // Assuming this is a string representing the file path or URL
      status: "AR Review",
      quoteId: existingUser.quotePaymentWithDetails.QuotePaymentId,
      // Default status
    });

    let generalLedgerCode;
    switch (currencyPaid) {
      case "AED":
        generalLedgerCode = "1301 - VZ ADCB (AED) 10515838124001";
        break;
      case "USD":
        generalLedgerCode = "1302 - VZ ADCB (USD) 10515838193001";
        break;
      case "EUR":
        generalLedgerCode = "1303 - VZ ADCB (EUR) 10515838197001";
        break;
      default:
        generalLedgerCode = ""; // Default case or error handling
    }
    let BankNameCode;
    switch (currencyPaid) {
      case "AED":
        BankNameCode = "ADCB Current AED 10515838124001	";
        break;
      case "USD":
        BankNameCode = "ADCB Current USD 10515838193001";
        break;
      case "EUR":
        BankNameCode = "ADCB Current EUR 10515838197001";
        break;
      default:
        BankNameCode = ""; // Default case or error handling
    }
    let ExchangeRate;
    switch (currencyPaid) {
      case "AED":
        ExchangeRate = 0;
        break;
      case "USD":
        ExchangeRate = 3.65;
        break;
      case "EUR":
        ExchangeRate = (
          newBankTransferForm.transactionDetails.partPayment / Converted_value
        ).toFixed(2);
        break;
      default:
        ExchangeRate = ""; // Default case or error handling
    }

    // Save the PaymentForm instance to the database
    newBankTransferForm.generalLedgerCode = generalLedgerCode;

    newBankTransferForm.BankNameCode = BankNameCode;

    let attachments = [];

    for (const file of req.files) {
      const filePath = "transfer_copy/" + file.filename; // Update this path
      const base64Data = await convertFileToBase64(filePath);
      attachments.push({
        Body: base64Data,
        ContentType: file.mimetype, // Set this according to your file type
        Name: file.originalname,
      });
    }

    await newBankTransferForm.save();

    const qp = {
      paymentmethod: "Bank Transfer",
      amount_received: newBankTransferForm.transactionDetails.partPayment,
      bank_name: newBankTransferForm.BankNameCode,
      GL_code: newBankTransferForm.generalLedgerCode,
      Pay_Currency: newBankTransferForm.transactionDetails.currencyPaid,
      payment_status: newBankTransferForm.status,
      quotePaymentId: newBankTransferForm.transactionDetails.quotePaymentId,
      Converted_value: newBankTransferForm.transactionDetails.partPayment,
      Exact_value: Converted_value,
      requestedCurrency: currencyPaid,
      exchangeRate: ExchangeRate,
    };

    const requestBody = {
      qp,
      paymentReceiptURLs,
    };

    console.log(requestBody);

    // Set up the headers with the access token
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json", // Specify the content type as JSON
    };

    const endpointUrl = `${process.env.SALESFORCE_API_URL}/services/apexrest/VZAR_ProformaInvoiceUpdateQuotePayments/${newBankTransferForm.transactionDetails.quotePaymentId}`;

    axios
      .put(endpointUrl, requestBody, { headers })
      .then((response) => {
        // Handle the response here
        console.log("Response:", response.data);
      })
      .catch((error) => {
        // Handle errors here
        console.error("Error:", error);
      });

    await sendEmail(
      existingUser.salesPersonDetails.salesPersonName,newBankTransferForm.customerDetails.id, existingUser.leadWithDetails.FirstName,existingUser.salesPersonDetails.salesPersonEmail
    );
    let HtmlBody = `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          .image_block img+div {
            display: none;
          }
      
          @media (max-width:620px) {
            .social_block.desktop_hide .social-table {
              display: inline-block !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
          <tbody>
            <tr>
              <td>
                <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="paragraph_block block-1" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad">
                                      <div style="color:#000000;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                        <p style="margin: 0; margin-bottom: 16px;">Dear Mary,</p>
                                        <p style="margin: 0; margin-bottom: 16px;">Please note that an attachment has been uploaded for quote payment - <b>${existingUser.quotePaymentName}</b> </p>
                                     
                                     
                                        <p style="margin: 0;">Please have a look at it!</p>
                                        <br>
                                        <p style="margin: 0;">Thank you!</p>
                                     
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 30px; padding-left: 20px; padding-right: 20px; padding-top: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                  <tr>
                                    <td class="pad" style="padding-bottom:20px;width:100%;padding-right:0px;padding-left:0px;">
                                      <div class="alignment" align="center" style="line-height:10px">
                                        <div style="max-width: 183px;"><a href="https://www.vz.ae" target="_blank" style="outline:none" tabindex="-1"><img src="https://res.cloudinary.com/dvekmmxxx/image/upload/v1718347384/photo_2024-06-14_11-46-14-removebg-preview_bml8en.png" style="display: block; height: auto; border: 0; width: 100%;" width="183"></a></div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                <table class="social_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                  <tr>
                                    <td class="pad" style="text-align:center;padding-right:0px;padding-left:0px;">
                                      <div class="alignment" align="center">
                                        <table class="social-table" width="276px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                          <tr>
                                            <td style="padding:0 7px 0 7px;"><a href="https://www.facebook.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="https://twitter.com/Virtuzone_UAE" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.youtube.com/virtuzoneuae" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/youtube@2x.png" width="32" height="32" alt="YouTube" title="YouTube" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.instagram.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" height="32" alt="Instagram" title="Instagram" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.linkedin.com/company/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" height="32" alt="LinkedIn" title="LinkedIn" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="https://www.vz.ae/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/website@2x.png" width="32" height="32" alt="Web Site" title="Web Site" style="display: block; height: auto; border: 0;"></a></td>
                                          </tr>
                                        </table>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                <table class="text_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding-left:10px;padding-right:10px;padding-top:10px;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; mso-line-height-alt: 18px; color: #000000; line-height: 1.5;">
                                          <p style="margin: 0; text-align: center; mso-line-height-alt: 18px;"><a href="https://g.page/virtuzone?share" target="_blank" style="text-decoration: underline; color: #000000;" rel="noopener">Office 404, Al Saaha Office, Building B, Souk Al Bahar, Old Town Island,<br>Burj Khalifa District, Dubai - UAE</a></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>
      `;
    let subjectMail = "An Attachment has been uploaded";
    let toMail = process.env.ToMail;
    await ReviewsendEmail(
      existingUser.salesPersonDetails.salesPersonEmail,
      toMail,
      subjectMail,
      HtmlBody,
      attachments
    );

    return res.status(200).json({
      message: "Bank Transfer processed successfully",
      //   paymentFormDetails: newBankTransferForm,

      Bankstatus: newBankTransferForm.status,
      Name: newBankTransferForm.customerDetails.name,
      proformaInvoiceNumber:
        newBankTransferForm.transactionDetails.proformaInvoiceNumber,
      receiptfile: newBankTransferForm.fileUpload,
      currencyPaid: newBankTransferForm.transactionDetails.currencyPaid,
    });
  } catch (err) {
    console.error("Error during Bank Transfer processing:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



const AddChequeDeposit = async (req, res) => {
  // Validation errors check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { quoteId } = req.params;

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

  console.log("Access Token:", accessToken);

  const uploadedFiles = req.files;
  const fileNames = uploadedFiles.map((file) => file.filename);
  console.log(uploadedFiles);
  // const transfer_copy = req.file.filename;
  const uploadPromises = uploadedFiles.map(async (file) => {
    const filePath = "transfer_copy/" + file.filename; // Update this path
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.filename,
      Body: fileContent,
      ContentType: file.mimetype, // Set this according to your file type
    };

    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // URL of the uploaded file
  });

  const paymentReceiptURLs = await Promise.all(uploadPromises);

  try {
    const existingUser = await PiData.findOne({
      $or: [
        { "quoteWithProductDetails.quoteId": quoteId },
        { "quotePaymentWithDetails.QuotePaymentId": quoteId },
      ],
    });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const accountDetailsResult = await AccountDetail.find();
    if (!accountDetailsResult || accountDetailsResult.length === 0) {
      return res.status(400).json({ message: "Account details not found" });
    }

    const accountDetails = accountDetailsResult[0];
    // Create a new PaymentForm instance
    const newBankTransferForm = new ChequeDesposit({
      bankDetails: {
        bank_name: accountDetails.bank_name,
        account_name: accountDetails.account_name,
        iban_number: accountDetails.iban_number,
        account_number: accountDetails.account_number,
        swift_code: accountDetails.swift_code,
        bank_address: accountDetails.bank_address,
        // quotePaymentId:newBankTransferForm.transactionDetails.quotePaymentId
      },
      transactionDetails: {
        amount: existingUser.salesforceResponseMatchScreening.totalAmount,
        quotePaymentId: existingUser.quotePaymentWithDetails.QuotePaymentId,
        partPayment: existingUser.salesforceResponseMatchScreening.total_including_Vat,
        proformaInvoiceNumber: existingUser.quotePaymentWithDetails.QuotePaymentId,
        // fromCurrency: currency_convertingfrom, // Assuming currency_converting has 'from' and 'to' properties
        // toCurrency: currency_convertingto,

        currencyPaid: "AED",
        // amountPaid:existingUser.totalIncludingVAT,
      },
      customerDetails: {
        name: existingUser.leadWithDetails.FirstName,
        id: existingUser.leadWithDetails.Email, // Assuming this is the desired ID
      },
      fileUpload: fileNames,
      quoteId: existingUser.quotePaymentWithDetails.QuotePaymentId, // Assuming this is a string representing the file path or URL
      status: "AR Review",
      generalLedgerCode: "1341 - Cash in Hand (AED)", // Default status
    });

    let attachments = [];
    for (const file of req.files) {
      const filePath = "transfer_copy/" + file.filename; // Update this path
      const base64Data = await convertFileToBase64(filePath);
      attachments.push({
        Body: base64Data,
        ContentType: file.mimetype, // Set this according to your file type
        Name: file.originalname,
      });
    }

    await newBankTransferForm.save();

    const qp = {
      paymentmethod: "Cheque Deposit",
      amount_received: newBankTransferForm.transactionDetails.partPayment,
      bank_name: "Cash in Hand (AED)",
      GL_code: newBankTransferForm.generalLedgerCode,
      Pay_Currency: newBankTransferForm.transactionDetails.currencyPaid,
      payment_status: newBankTransferForm.status,
      quotePaymentId: newBankTransferForm.transactionDetails.quotePaymentId,
    };

    console.log(newBankTransferForm.transactionDetails.currencyPaid);

    const requestBody = {
      qp,
      paymentReceiptURLs,
    };

    console.log(requestBody);
    // Set up the headers with the access token
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json", // Specify the content type as JSON
    };

    const endpointUrl = `${process.env.SALESFORCE_API_URL}/services/apexrest/VZAR_ProformaInvoiceUpdateQuotePayments/${newBankTransferForm.transactionDetails.quotePaymentId}`;

    axios
      .put(endpointUrl, requestBody, { headers })
      .then((response) => {
        // Handle the response here
        console.log("Response:", response.data);
      })
      .catch((error) => {
        // Handle errors here
        console.error("Error:", error);
      });

    await sendEmail(
      existingUser.salesPersonDetails.salesPersonName,newBankTransferForm.customerDetails.id, existingUser.leadWithDetails.FirstName,existingUser.salesPersonDetails.salesPersonEmail
    );
    let HtmlBody = `<!DOCTYPE html>
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
      
      <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
        <style>
          * {
            box-sizing: border-box;
          }
      
          body {
            margin: 0;
            padding: 0;
          }
      
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
          }
      
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
          }
      
          p {
            line-height: inherit
          }
      
          .desktop_hide,
          .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
          }
      
          .image_block img+div {
            display: none;
          }
      
          @media (max-width:620px) {
            .social_block.desktop_hide .social-table {
              display: inline-block !important;
            }
      
            .mobile_hide {
              display: none;
            }
      
            .row-content {
              width: 100% !important;
            }
      
            .stack .column {
              width: 100%;
              display: block;
            }
      
            .mobile_hide {
              min-height: 0;
              max-height: 0;
              max-width: 0;
              overflow: hidden;
              font-size: 0px;
            }
      
            .desktop_hide,
            .desktop_hide table {
              display: table !important;
              max-height: none !important;
            }
          }
        </style>
      </head>
      
      <body style="background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff;">
          <tbody>
            <tr>
              <td>
                <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="paragraph_block block-1" width="100%" border="0" cellpadding="5" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad">
                                      <div style="color:#000000;direction:ltr;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:400;letter-spacing:0px;line-height:150%;text-align:left;mso-line-height-alt:21px;">
                                        <p style="margin: 0; margin-bottom: 16px;">Dear Mary,</p>
                                        <p style="margin: 0; margin-bottom: 16px;">Please note that an attachment has been uploaded for quote payment - <b>${existingUser.quotePaymentName}</b> </p>
                                     
                                     
                                        <p style="margin: 0;">Please have a look at it!</p>
                                        <br>
                                        <p style="margin: 0;">Thank you!</p>
                                     
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                  <tbody>
                    <tr>
                      <td>
                        <table class="row-content stack" align="left" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 600px;" width="600">
                          <tbody>
                            <tr>
                              <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 30px; padding-left: 20px; padding-right: 20px; padding-top: 30px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                  <tr>
                                    <td class="pad" style="padding-bottom:20px;width:100%;padding-right:0px;padding-left:0px;">
                                      <div class="alignment" align="center" style="line-height:10px">
                                        <div style="max-width: 183px;"><a href="https://www.vz.ae" target="_blank" style="outline:none" tabindex="-1"><img src="https://res.cloudinary.com/dvekmmxxx/image/upload/v1718347384/photo_2024-06-14_11-46-14-removebg-preview_bml8en.png" style="display: block; height: auto; border: 0; width: 100%;" width="183"></a></div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                <table class="social_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                  <tr>
                                    <td class="pad" style="text-align:center;padding-right:0px;padding-left:0px;">
                                      <div class="alignment" align="center">
                                        <table class="social-table" width="276px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
                                          <tr>
                                            <td style="padding:0 7px 0 7px;"><a href="https://www.facebook.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="https://twitter.com/Virtuzone_UAE" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.youtube.com/virtuzoneuae" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/youtube@2x.png" width="32" height="32" alt="YouTube" title="YouTube" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.instagram.com/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" height="32" alt="Instagram" title="Instagram" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="http://www.linkedin.com/company/virtuzone" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" height="32" alt="LinkedIn" title="LinkedIn" style="display: block; height: auto; border: 0;"></a></td>
                                            <td style="padding:0 7px 0 7px;"><a href="https://www.vz.ae/" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/website@2x.png" width="32" height="32" alt="Web Site" title="Web Site" style="display: block; height: auto; border: 0;"></a></td>
                                          </tr>
                                        </table>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                <table class="text_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                  <tr>
                                    <td class="pad" style="padding-left:10px;padding-right:10px;padding-top:10px;">
                                      <div style="font-family: sans-serif">
                                        <div class style="font-size: 12px; font-family: Arial, Helvetica, sans-serif; mso-line-height-alt: 18px; color: #000000; line-height: 1.5;">
                                          <p style="margin: 0; text-align: center; mso-line-height-alt: 18px;"><a href="https://g.page/virtuzone?share" target="_blank" style="text-decoration: underline; color: #000000;" rel="noopener">Office 404, Al Saaha Office, Building B, Souk Al Bahar, Old Town Island,<br>Burj Khalifa District, Dubai - UAE</a></p>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table><!-- End -->
      </body>
      
      </html>
      `;
    let subjectMail = "An Attachment has been uploaded";
    let toMail = process.env.ToMail;
    await ReviewsendEmail(
      existingUser.salesPersonDetails.salesPersonEmail,
      toMail,
      subjectMail,
      HtmlBody,
      attachments
    );

    return res.status(200).json({
      message: "Cheque Deposit Transfer processed successfully",
      //   paymentFormDetails: newBankTransferForm,

      Paymentmodes: "Cheque Deposit",
      Amountpaid: newBankTransferForm.amount,
      partPayment: newBankTransferForm.partPayment,
      status: newBankTransferForm.status,
      Name: newBankTransferForm.customerDetails.name,
      proformaInvoiceNumber:
        newBankTransferForm.transactionDetails.proformaInvoiceNumber,
      receiptfile: newBankTransferForm.fileUpload,
      Currency: newBankTransferForm.currencyPaid,
      generalLedgerCode: newBankTransferForm.generalLedgerCode,
      currencyPaid: newBankTransferForm.transactionDetails.currencyPaid,
    });
  } catch (err) {
    console.error("Error during Bank Transfer processing:", err);
    return res.status(500).json({ message: "Server error" });
  }
};




exports.AddBankTransfer = AddBankTransfer;
exports.convertCurrency = convertCurrency;
exports.payNow = payNow;
exports.payNowSaleforce = payNowSaleforce;
exports.payNowByStripe = payNowByStripe;
exports.payNowByTelr = payNowByTelr;
exports.payNowByFiserv = payNowByFiserv;
exports.MagnatiTransactionStatus = MagnatiTransactionStatus;
exports.AddCashMachin = AddCashMachin;
exports.AddCashCounter = AddCashCounter;
exports.AddCashDeposit = AddCashDeposit;
exports.AddChequeDeposit = AddChequeDeposit;
exports.sendWaitingEmail = sendWaitingEmail;