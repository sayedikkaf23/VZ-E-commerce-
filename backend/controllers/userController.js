const UserDetails = require("../models/userDetails");
const fileUpload = require("../middleware/fileUpload"); 
const Service = require("../models/service");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');


const stripe = require("stripe")("pk_test_51JRurLE3UGZ0nP4jugPtN6GQbkAjrEc3KkzZIAIQ6AofKtnjBXBOqiIxZdlvAoWjw59yRE1hpVPipxJb3XMBoSXc00l3qLEhN");



// Handle form submission and file uploads

exports.submit = async (req, res) => {
  try {
    console.log(req.body);

    // Destructure the required fields from req.body
    const {
      firstName,
      lastName,
      email,
      nationality,
      birthday,
      resident,
      working,
      salary,
      companyname,
      Bank,
      mobileNumber,
    } = req.body;
    let parsedMobileNumber;

    // If mobileNumber is a string, try to parse it, otherwise, use it directly
    if (typeof mobileNumber === "string") {
      try {
        parsedMobileNumber = JSON.parse(mobileNumber); // Try to parse JSON string
      } catch (e) {
        console.error("Error parsing mobileNumber JSON:", e);
        parsedMobileNumber = mobileNumber; // If parsing fails, use as-is
      }
    } else {
      parsedMobileNumber = mobileNumber; // If it's already an object, use it
    }
    // Check if email already exists
    const existingUser = await UserDetails.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create and save user details in the database
    const userDetails = new UserDetails({
      firstName,
      lastName,
      email,
      nationality,
      birthday,
      resident,
      working,
      salary,
      companyname,
      Bank,
      mobileNumber: parsedMobileNumber,
    });

    // Save the user details to the database
    await userDetails.save();
    res
      .status(201)
      .json({ message: "Details submitted successfully", userDetails });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error saving details", details: error.message });
  }
};


exports.getAllSubmissions = async (req, res) => {
  try {
    const allSubmissions = await UserDetails.find(); // Fetch all user submissions
    res.status(200).json(allSubmissions); // Return all submissions as JSON
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching submissions", details: error.message });
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
    res
      .status(201)
      .json({ message: "Service created successfully", service: savedService });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating service", details: error.message });
  }
};


exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find(); // Fetch all services from the database
    res.status(200).json(services); // Send back all services as JSON
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching services", details: error.message });
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

    // Send back the token and admin info
    res.status(200).json({
      message: "Login successful",
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email },
    });
  } catch (error) {
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
      res.status(200).json({ message: 'Service updated successfully', service: updatedService });
  } catch (error) {
      res.status(500).json({ error: 'Error updating service', details: error.message });
  }
};


 exports.payNowByStripe = async (req, res) => {

  
  const { quoteId } = req.params;

  // const data = await PiData.findOne({
  //   $or: [{ quoteId: quoteId }, { quotePaymentId: quoteId }],
  // });

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


  // console.log("Access Token:", accessToken);

  // Create a new PaymentForm instance

  await newOnlinePayForm.save();

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
            unit_amount: data?.totalIncludingVAT * 100, // Specify the amount in cents (e.g., $10.00 USD)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://virtuzone.yeepeey.com/successful/${data.quotePaymentId}`,
      cancel_url: `https://virtuzone.yeepeey.com/failure/${data.quotePaymentId}`,
    });

    const stripeResponseData = stripeResponse;

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
      stripeData: stripeResponseData, // Include data from the first response here
    };

    res.status(200).json(combinedResponse);
  } catch (error) {
    console.error(
      "Error creating checkout session:",
      error.response?.data?.error
    );
    res.status(500).send("Error creating checkout session");
  }
}

