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


exports.updateMailManagement = async (req, res) => {
    try {
        const updates = req.body; // Expecting an array of objects with id and updates

        if (!Array.isArray(updates)) {
            return res.status(400).json({ message: "Request body should be an array of updates." });
        }

        const updatedMailManagements = [];
        for (const update of updates) {
            const { id, documentType, isActive } = update;

            if (!id || !documentType) {
                return res.status(400).json({ message: "Each update must include an id and documentType." });
            }

            const updatedMailManagement = await MailManagement.findByIdAndUpdate(
                id,
                { documentType, isActive: isActive ?? true },
                { new: true }
            );

            if (!updatedMailManagement) {
                return res.status(404).json({ message: `MailManagement with id ${id} not found.` });
            }

            updatedMailManagements.push(updatedMailManagement);
        }

        res.status(200).json(updatedMailManagements); // Return all updated documents
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.updatePersonalBank = async (req, res) => {
    try {
        const updates = req.body; // Expecting an array of objects with id and updates

        if (!Array.isArray(updates)) {
            return res.status(400).json({ message: "Request body should be an array of updates." });
        }

        const updatedPersonalBanks = [];
        for (const update of updates) {
            const { id, documentType, isActive } = update;

            if (!id || !documentType) {
                return res.status(400).json({ message: "Each update must include an id and documentType." });
            }

            const updatedPersonalBank = await PersonalBank.findByIdAndUpdate(
                id,
                { documentType, isActive: isActive ?? true },
                { new: true }
            );

            if (!updatedPersonalBank) {
                return res.status(404).json({ message: `PersonalBank with id ${id} not found.` });
            }

            updatedPersonalBanks.push(updatedPersonalBank);
        }

        res.status(200).json(updatedPersonalBanks); // Return all updated documents
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.updateVirtualReception = async (req, res) => {
    try {
        const updates = req.body; // Expecting an array of objects with id and updates

        if (!Array.isArray(updates)) {
            return res.status(400).json({ message: "Request body should be an array of updates." });
        }

        const updatedVirtualReceptions = [];
        for (const update of updates) {
            const { id, documentType, isActive } = update;

            if (!id || !documentType) {
                return res.status(400).json({ message: "Each update must include an id and documentType." });
            }

            const updatedVirtualReception = await VirtualReception.findByIdAndUpdate(
                id,
                { documentType, isActive: isActive ?? true },
                { new: true }
            );

            if (!updatedVirtualReception) {
                return res.status(404).json({ message: `VirtualReception with id ${id} not found.` });
            }

            updatedVirtualReceptions.push(updatedVirtualReception);
        }

        res.status(200).json(updatedVirtualReceptions); // Return all updated documents
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
