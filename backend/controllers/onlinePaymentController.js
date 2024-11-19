const PaymentMode = require("../models/paymentMode");

const AccountDetail=require("../models/accountDetail")
const SidebarData = require("../models/SidebarData");
const PiData = require("../models/PiDatas");


const getPaymentModesHome = async (req, res) => {
    try {
      const adminObjectId = new mongoose.Types.ObjectId(
        "653f5041f94b9319a2bb17bd"
      );
      // Find all payment methods documents based on admin ID
      const paymentMethods = await PaymentMode.find();
  
      if (!paymentMethods || paymentMethods.length === 0) {
        return res.status(404).json({ message: "No payment methods found" });
      }
  
      return res.status(200).json({
        // message: "Payment methods retrieved successfully",
        paymentMethods,
      });
    } catch (error) {
      console.error("Error getting payment methods:", error);
      return res.status(500).json({ message: "Error getting payment methods" });
    }
  };

  const addAccountDetail = async (req, res) => {
    try {
      const {
        bank_name,
        account_name,
        iban_number,
        account_number,
        swift_code,
        bank_address,
      } = req.body; // Assuming you are sending data in the request body
  
      // Check if an account with the provided iban_number or account_number already exists
      const existingAccount = await AccountDetail.findOne({
        $or: [{ iban_number }, { account_number }],
      });
  
      if (existingAccount) {
        // If a matching account is found, return a response indicating duplication
        return res.status(400).json({
          error:
            "Account with the provided IBAN number or Account number already exists.",
        });
      }
  
      // If no matching account is found, create a new instance of AccountDetail model with the request data
      const newAccountDetail = new AccountDetail({
        bank_name,
        account_name,
        iban_number,
        account_number,
        swift_code,
        bank_address,
      });
  
      // Save the new account detail data to the database
      await newAccountDetail.save();
  
      res.status(201).json({ message: "Account detail added successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  const getAccountDetails = async (req, res) => {
    try {
      // Fetch all account details from the database
      const accountDetails = await AccountDetail.find();
  
      // Send the account details as a response
      res.status(200).json(accountDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const getSidebarData = async (req, res) => {
    try {
      // Fetch the data from the MongoDB collection
      const data = await SidebarData.findOne({ _id: "6565a41238b2318fa7fca22f" }); // Replace with the correct ID
  
      if (!data) {
        return res.status(404).json({ msg: "Sidebar data not found" });
      }
  
      // Send the data as a JSON response
      res.json(data);
    } catch (err) {
      console.error("Error fetching sidebar data:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  async function getPiDataBySfId(req, res) {
    const { quoteId } = req.params; // Assuming sf_id is passed as a URL parameter
    console.log(quoteId);
    try {
      const data = await PiData.findOne({
        $or: [{ quoteId: quoteId }, { quotePaymentId: quoteId }],
      });
      if (data) {
        // Data found, send it to the frontend
        res.status(200).json(data);
      } else {
        if (!data) {
          const data = await manualPiData.findOne({
            accountId: quoteId,
          });
          if (data) {
            // Data found, send it to the frontend
            return res.status(200).json(data);
          } else {
            // Data not found for the provided sf_id
            return res
              .status(404)
              .json({ message: "Data not found for the provided sf_id" });
          }
        }
        res
          .status(404)
          .json({ message: "Data not found for the provided sf_id" });
      }
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
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

  const checkQuoteIdExists = async (req, res) => {
    const { quoteId } = req.params;
  
    try {
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
  
      const sfEndpoint = `${process.env.SALESFORCE_API_URL}/services/apexrest/VZAR_CheckPaymentLink`;
      const requestBody = [quoteId];
  
      const sfResponse = await axios.post(sfEndpoint, requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      // Check if the response contains any data
      if (sfResponse.data && sfResponse.data.length > 0) {
        const firstPayment = sfResponse.data[0];
        const isActive = firstPayment.isActive;
  
        // Handle the isActive value as needed
        console.log(`isActive...: ${isActive}`);
  
        // Respond to the client based on the isActive value
        res.status(200).json({ isActive });
      } else {
        // If the response is empty or does not contain the expected data
        console.log("Invalid response from Salesforce endpoint");
        res
          .status(500)
          .json({ error: "Invalid response from Salesforce endpoint" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while checking quoteId." });
    }
  };
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


  //get payment mode
  async function getPaymentModeById  (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const data = await PaymentMode.findById(req.params.id);
  
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      console.error("Error during get payment mode:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
  //get payment modes
  async function getPaymentModes  (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      let condition = {
        isDeleted: false,
      };
  
      const page = Number(req.query.page) ? Number(req.query.page) : 1;
      const limit = Number(req.query.limit) ? Number(req.query.limit) : 10;
      const skip = (page - 1) * limit;
  
      const data = await PaymentMode.find(condition)
        .skip(skip)
        .limit(limit)
        .sort({ _id: 1 });
  
      const count = await PaymentMode.countDocuments(condition);
      const pages = Math.ceil(count / limit);
  
      return res.status(200).json({
        success: true,
        data,
        pages,
      });
    } catch (err) {
      console.error("Error during payment mode:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
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
  

 //update payment status
 async function updatePaymentModeStatus  (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const paymentModeId = req?.body?.paymentModeId;
  
      if (!paymentModeId) {
        res
          .status(400)
          .json({ success: false, message: "Payment Mode Not Found!" });
        return;
      }
      const filter = { _id: paymentModeId };
      const update = {
        isActive: req?.body.isActive,
      };
  
      await PaymentMode.findOneAndUpdate(filter, update, {
        new: true,
      });
  
      const { name, isActive } = req.body;
  console.log(req.body)
      // Define the update object
      let updateObject = {};
      if (name === "Stripe") {
        updateObject.stripePayment = isActive;
      } else if (name === "Total Pay") {
        updateObject.totalpay = isActive;
      } else if (name === "Magnati") {
        updateObject.magnati = isActive;
      }  else if (name === "Telr") {
        updateObject.Telr = isActive;
      }else {
        return res.status(400).json({
          success: false,
          message: "Invalid payment method name.",
        });
      }
  
      const adminObjectId = new mongoose.Types.ObjectId(
        "653f5041f94b9319a2bb17bd"
      );
  
      // Update the payment method document
      const updateResult = await PaymentMethod.findOneAndUpdate(
        { admin: adminObjectId },
        { $set: updateObject },
        { new: true }
      );
  
      if (updateResult) {
        // Log the operation
        await logger.info({
          type: "Payment Mode",
          entityType: `Payment mode: ${name}`,
          name: req?.user?.user_name,
          email: req?.user?.email,
        });
  
        return res.status(200).json({
          success: true,
          message: "Payment mode status updated successfully.",
          data: updateResult,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Payment method not found.",
        });
      }
    } catch (err) {
      console.error("Error during payment mode status update:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
  async function updatePaymentMethod (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      await PaymentMethod.updateOne({ _id: req.params.id }, { $set: req.body });
  
      const paymentTypes = {
        cardMachine: "Card Machine",
        bankTransfer: "Bank Transfer",
        cashDeposit: "Cash Deposit",
        cashOverCounter: "Cash Over Counter",
        chequeDeposit: "Cheque Deposit",
        onlinePayment: "Online Payment",
        pcdCheque: "PDC Cheque",
      };
  
      // Find the first matching payment type, even if its value is false
      const payment_type_key = Object.keys(paymentTypes).find(
        (key) => key in req.body
      );
  
      // Assign the corresponding payment type value with its state (true/false)
      const paymentTypeValue = payment_type_key
        ? paymentTypes[payment_type_key]
        : "";
  
      await logger.info({
        type: "Payment Type",
        entityType: `Payment type: ${paymentTypeValue}`,
        name: req?.user?.user_name,
        email: req?.user?.email,
      });
  
      return res.status(200).json({
        success: true,
        message: "Payment method update successfully.",
      });
    } catch (err) {
      console.error("Error during user updation:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
  

  async function getPaymentMethodData  (req, res)  {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      let condition = {
        bankTransfer: true,
      };
  
      const page = Number(req.query.page) ? Number(req.query.page) : 1;
      const limit = Number(req.query.limit) ? Number(req.query.limit) : 10;
      const skip = (page - 1) * limit;
  
      const data = await PaymentMethod.find(condition)
        .skip(skip)
        .limit(limit)
        .sort({ _id: 1 });
  
      const count = await PaymentMethod.countDocuments(condition);
      const pages = Math.ceil(count / limit);
  
      return res.status(200).json({
        success: true,
        data,
        pages,
      });
    } catch (err) {
      console.error("Error during get payment method data:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  async function activatePaymentMethod  (req, res)  {
    try {
      const { method } = req.body;
      const adminObjectId = new mongoose.Types.ObjectId(
        "653f5041f94b9319a2bb17bd"
      );
  
      // Find the payment method document based on admin ID
      const paymentMethod = await PaymentMethod.findOne({ admin: adminObjectId });
  
      if (!paymentMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }
  
      // Toggle the value of the specified method field
      paymentMethod[method] = !paymentMethod[method];
  
      // Save the updated document
      await paymentMethod.save();
  
      return res.status(200).json({
        message: `Payment method '${method}' toggled successfully`,
        paymentMethod,
      });
    } catch (error) {
      console.error("Error toggling payment method:", error);
      return res.status(500).json({ message: "Error toggling payment method" });
    }
  };
  async function getPaymentMethods  (req, res) {
    try {
      const adminObjectId = new mongoose.Types.ObjectId(
        "653f5041f94b9319a2bb17bd"
      );
      // Find all payment methods documents based on admin ID
  
      console.log(adminObjectId);
  
      const paymentMethods = await PaymentMethod.find({ admin: adminObjectId });
  
      console.log(paymentMethods);
  
      if (!paymentMethods || paymentMethods.length === 0) {
        return res.status(404).json({ message: "No payment methods found" });
      }
  
      return res.status(200).json({
        // message: "Payment methods retrieved successfully",
        paymentMethods,
      });
    } catch (error) {
      console.error("Error getting payment methods:", error);
      return res.status(500).json({ message: "Error getting payment methods" });
    }
  };
  exports.getPaymentModesHome = getPaymentModesHome;
  exports.getAccountDetails = getAccountDetails;
  exports.addAccountDetail = addAccountDetail;
  exports.getSidebarData = getSidebarData;

  exports.getPiDataBySfId = getPiDataBySfId;
  exports.payNow = payNow;
  exports.checkQuoteIdExists = checkQuoteIdExists;
  exports.payNowSaleforce = payNowSaleforce;


  exports.payNowByStripe = payNowByStripe;
  exports.payNowByTelr = payNowByTelr;

  exports.updatePaymentModeStatus = updatePaymentModeStatus;

  exports.payNowByFiserv = payNowByFiserv;
  exports.getPaymentModeById = getPaymentModeById;
  exports.getPaymentModes = getPaymentModes;
  exports.updatePaymentMethod = updatePaymentMethod;
  exports.getPaymentMethodData = getPaymentMethodData;
  exports.activatePaymentMethod = activatePaymentMethod;
  exports.getPaymentMethods = getPaymentMethods;
