const PersonalBank = require('../models/personalBankModel');
const BusinessBank = require('../models/businessBankModel');
const { VirtualReception, MailManagement } = require('../models/virtualReceptionMailManagementModel');

// POST method to create a new Virtual Reception document
exports.createVirtualReception = async (req, res) => {
    try {
        const virtualReception = new VirtualReception(req.body);
        const savedVirtualReception = await virtualReception.save();
        res.status(201).json(savedVirtualReception);
    } catch (error) {
        res.status(400).json({ message: error.message });
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
        const mailManagement = new MailManagement(req.body);
        const savedMailManagement = await mailManagement.save();
        res.status(201).json(savedMailManagement);
    } catch (error) {
        res.status(400).json({ message: error.message });
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
        const personalBank = new PersonalBank(req.body);
        const savedPersonalBank = await personalBank.save();
        res.status(201).json(savedPersonalBank);
    } catch (error) {
        res.status(400).json({ message: error.message });
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
        const businessBank = new BusinessBank(req.body);
        const savedBusinessBank = await businessBank.save();
        res.status(201).json(savedBusinessBank);
    } catch (error) {
        res.status(400).json({ message: error.message });
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


