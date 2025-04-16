const Risk = require('../models/Risk');
const ProductRisk = require("../models/ProductRisk");
const CountryRisk = require("../models/CountryRisk");
// ➕ Add New Risk
exports.addRisk = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Invalid or missing risk name' });
    }

    const existing = await Risk.findOne({ name });

    if (existing) {
      return res.status(409).json({ error: 'Risk already exists' });
    }

    const newRisk = new Risk({ name, isActive: isActive !== undefined ? isActive : true });
    const saved = await newRisk.save();
    res.status(201).json({ message: 'Risk added successfully', data: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getRisks = async (req, res) => {
  try {
    const risks = await Risk.find();
    res.status(200).json(risks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📥 Get All Active Risks
exports.getActiveRisks = async (req, res) => {
  try {
    const risks = await Risk.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(risks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateRiskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be true or false' });
    }

    const updated = await Risk.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Risk not found' });
    }

    res.status(200).json({ message: 'Risk status updated', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getProductsByCountryRisk = async (req, res) => {
  // We expect something like: { "countries": ["USA", "India"] }
  const { countries } = req.body;
   
  try {
  // 1. Validate input
  if (!Array.isArray(countries) || countries.length === 0) {
  return res
  .status(400)
  .json({ message: 'countries must be a non-empty array' });
  }
   
  const results = [];
   
  // 2. Loop through each country in the array
  for (const country of countries) {
  // 3. Find all risk entries for this country (if you have at most one risk per country, use `findOne`;
  // if you have multiple possible risk entries, use `find`)
  const countryRisks = await CountryRisk.find({ country });
   
  // If there is no risk data for this country, you can skip or handle differently
  if (!countryRisks || countryRisks.length === 0) {
  // Option: push an entry with an empty products array or skip
  results.push({
  country,
  riskLevel: null,
  products: [],
  message: 'No risk data found for this country',
  });
  continue;
  }
   
  // 4. For each risk document found, query ProductRisk and build result items
  for (const cr of countryRisks) {
  // cr might look like { country: 'India', risk: 'High', ... }
  const products = await ProductRisk.find({ risk: cr.risk });
   
  results.push({
  country: cr.country,
  riskLevel: cr.risk,
  products,
  });
  }
  }
   
  // 5. Return array of all matched countries and their products
  return res.status(200).json({ results });
  } catch (error) {
  console.error('Error getting products by multiple countries risk:', error);
  return res.status(500).json({ message: 'Server error' });
  }
  };