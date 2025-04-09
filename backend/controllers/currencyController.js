const Currency = require("../models/currency");


exports.addCurrency = async (req, res) => {
    try {
      const { Currency_id, currencyName, Vat_percent, createdBy, updatedBy } = req.body;
  
      // Optional: Check if currency with same Currency_id or name exists
      const existing = await Currency.findOne({ Currency_id });
      if (existing) {
        return res.status(400).json({ message: "Currency with this ID already exists." });
      }
  
      const newCurrency = new Currency({
        Currency_id,
        currencyName,
        Vat_percent,
        createdBy,
        updatedBy
      });
  
      await newCurrency.save();
      res.status(201).json({ message: "Currency added successfully", data: newCurrency });
    } catch (error) {
      console.error("Add Currency Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };


  // Get all currencies
  exports.getAllCurrencies = async (req, res) => {
    try {
      const { isActive } = req.query;
  
      const filter = {};
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }
  
      const currencies = await Currency.find(filter).populate("createdBy updatedBy", "name email");
      res.status(200).json({ message: "Currencies fetched successfully", data: currencies });
    } catch (error) {
      console.error("Get Currencies Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  