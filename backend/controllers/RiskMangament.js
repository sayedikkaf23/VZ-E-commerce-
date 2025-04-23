const Risk = require('../models/Risk');
const Pidata = require('../models/pidata');

// const CountryRisk = require("../models/CountryRisk");
const ProductRisk = require("../models/ProductRisk");
const CountryRisk = require("../models/CountryRisk");
const BusinessCategory = require('../models/BusinessCategory'); // adjust path if needed
const Nationality = require('../models/nationalityModel');
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


  exports.getActivictyByRiskBulk = async (req, res) => {
    try {
      const entries = req.body;
  
      if (!Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ message: 'Array of business categories required' });
      }
  
      const formattedEntries = [];
  
      for (const entry of entries) {
        const { name, isActive = true, risk = 'Low', createdBy, updatedBy } = entry;
  
        if (!name) continue; // skip if no name
  
        const exists = await BusinessCategory.findOne({ name });
        if (exists) continue; // skip duplicates
  
        formattedEntries.push({
          name,
          isActive,
          risk,
          createdBy,
          updatedBy,
        });
      }
  
      const inserted = await BusinessCategory.insertMany(formattedEntries);
  
      res.status(201).json({
        message: `${inserted.length} categories inserted successfully`,
        data: inserted,
      });
    } catch (err) {
      console.error('Bulk insert error:', err);
      res.status(500).json({ message: 'Server error during bulk insert' });
    }
  }


  exports.getAllBusinessCategories = async (req, res) => {
    try {
      const categories = await BusinessCategory.find({  }); 
  
      res.status(200).json({
        message: `${categories.length} active categories found`,
        data: categories
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ message: 'Server error while fetching categories' });
    }
  };

  exports.getBusinessCategoriesByRisk = async (req, res) => {
    try {
      const riskRating = parseInt(req.query.riskRating); // Accept query param as number (e.g., ?riskRating=2)
  
      if (isNaN(riskRating)) {
        return res.status(400).json({ message: 'Valid riskRating parameter (as number) is required.' });
      }
  
      const categories = await BusinessCategory.find({ Score: riskRating }); // Match on numeric Score
  
      res.status(200).json({
        data: categories,
      });
    } catch (err) {
      console.error('Error fetching categories by risk rating:', err);
      res.status(500).json({ message: 'Server error while fetching categories by risk rating' });
    }
  };
  
  


  exports.getProductsByCategoryAndCountryRisk = async (req, res) => {
    try {
      const { customerCountryRisk, shareholderCountriesRisk, totalCusotmerSelected, BusisnessActivityRisk } = req.body;
  
      const totalPossibleRating = totalCusotmerSelected * 3;
  
      // Assuming customerCountryRisk is the RiskRating directly provided for the customer
      const customerRiskRating = customerCountryRisk;
  
      if (customerRiskRating === undefined) {
        return res.status(400).json({ message: 'Customer country risk rating is required.' });
      }
  
      // 2. Get ShareholderCountries RiskRatings from the provided array
      const shareholderRiskRatings = shareholderCountriesRisk || [];
  
      // 3. Calculate userRating
      const customerRisk = customerRiskRating || 0;
      const shareholderRiskSum = shareholderRiskRatings.reduce((sum, riskRating) => sum + (riskRating || 0), 0);
      const userRating = customerRisk + shareholderRiskSum + BusisnessActivityRisk;
  
      console.log('Customer Risk Rating:', customerRisk);
      console.log('Shareholder Risk Ratings:', shareholderRiskRatings);
      console.log('User Rating (Customer + Shareholders):', userRating);
  
      const percentage = (userRating / totalPossibleRating) * 100;

 const  Fixedpercentage = parseFloat((percentage.toFixed(2)));

 
      let computedRisk = 'Low';
      if (percentage > 75) {
        computedRisk = 'High';
      } else if (percentage > 50) {
        computedRisk = 'Medium';
      }
  
      return res.status(200).json({
        appliedRisk: computedRisk,
        message: 'success',
        Fixedpercentage,
        userRating,
        totalPossibleRating,
      });
  
    } catch (err) {
      console.error('Error in getProductsByCategoryAndCountryRisk:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  