const PersonalBank = require('../models/personalBankModel');
const BusinessBank = require('../models/businessBankModel');
const { VirtualReception, MailManagement } = require('../models/virtualReceptionMailManagementModel');

// POST method to create a new Virtual Reception document
exports.createVirtualReception = async (req, res) => {
    try {
        const documentTypes = req.body; // Expecting an array directly
        console.log("Request Body:", req.body); // Debug the incoming request body

        if (!Array.isArray(documentTypes)) {
            return res.status(400).json({ message: "Request body should be an array." });
        }

        const savedVirtualReceptions = [];
        for (const docType of documentTypes) {
            const virtualReception = new VirtualReception({ documentType: docType, isActive: true });

            // Save each document one by one
            const savedReception = await virtualReception.save();
            savedVirtualReceptions.push(savedReception);
        }

        res.status(201).json(savedVirtualReceptions); // Return all saved documents
    } catch (error) {
        res.status(500).json({ message: error.message }); // Use 500 status code for server errors
    }
};

// GET method to retrieve all Virtual Reception documents
exports.getVirtualReceptions = async (req, res) => {
    try {
        const virtualReceptions = await VirtualReception.find();
        res.status(200).json(virtualReceptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST method to create a new Mail Management document
exports.createMailManagement = async (req, res) => {
    try {
        const documentTypes = req.body; // Directly use the array from the request body

        if (!Array.isArray(documentTypes)) {
            return res.status(400).json({ message: "Request body should be an array." });
        }

        const savedMailManagements = [];
        for (const docType of documentTypes) {
            const mailManagement = new MailManagement({ isActive: true, documentType: docType });

            // Save each document one by one
            const savedMailManagement = await mailManagement.save();
            savedMailManagements.push(savedMailManagement);
        }

        res.status(201).json(savedMailManagements); // Return all saved documents
    } catch (error) {
        res.status(500).json({ message: error.message }); // Use 500 status code for server errors
    }
};


// GET method to retrieve all Mail Management documents
exports.getMailManagements = async (req, res) => {
    try {
        const mailManagements = await MailManagement.find();
        res.status(200).json(mailManagements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// POST method to create a new Personal Bank document
exports.createPersonalBank = async (req, res) => {
    try {
        const documentTypes = req.body; // Directly get the array from the request body
        console.log("Request Body:", req.body); // Debug the incoming request body

        if (!Array.isArray(documentTypes)) {
            return res.status(400).json({ message: "Request body should be an array." });
        }

        const savedBanks = [];
        for (const docType of documentTypes) {
            const personalBank = new PersonalBank({ isActive: true, documentType: docType });

            // Save each document one by one
            const savedBank = await personalBank.save();
            savedBanks.push(savedBank);
        }

        res.status(201).json(savedBanks); // Return all saved documents
    } catch (error) {
        res.status(500).json({ message: error.message }); // Use 500 status code for server errors
    }
};



// GET method to retrieve all Personal Bank documents
exports.getPersonalBanks = async (req, res) => {
    try {
        const personalBanks = await PersonalBank.find();
        res.status(200).json(personalBanks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// POST method to create a new Business Bank document
exports.createBusinessBank = async (req, res) => {
    try {
        const documentTypes = req.body; // Directly get the array from the request body
        console.log("Request Body:", req.body); // Debug the incoming request body

        if (!Array.isArray(documentTypes)) {
            return res.status(400).json({ message: "Request body should be an array." });
        }

        const savedBanks = [];
        for (const docType of documentTypes) {
            const businessBank = new BusinessBank({ isActive: true, documentType: docType });

            // Save each document one by one
            const savedBank = await businessBank.save();
            savedBanks.push(savedBank);
        }

        res.status(201).json(savedBanks); // Return all saved documents
    } catch (error) {
        res.status(500).json({ message: error.message }); // Use 500 status code for server errors
    }
};


// GET method to retrieve all Business Bank documents
exports.getBusinessBanks = async (req, res) => {
    try {
        const businessBanks = await BusinessBank.find();
        res.status(200).json(businessBanks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


