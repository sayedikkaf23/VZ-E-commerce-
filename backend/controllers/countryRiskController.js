const CountryRisk = require("../models/CountryRisk");

exports.addCountryRisk = async (req, res) => {
  try {
    const { country, risk } = req.body;
    const exists = await CountryRisk.findOne({ country });

    if (exists) return res.status(400).json({ message: "Country already exists" });

    const entry = await CountryRisk.create({ country, risk });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllCountryRisks = async (_, res) => {
  const countries = await CountryRisk.find();
  res.json(countries);
};

exports.updateCountryRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const { country, risk } = req.body;

    const exists = await CountryRisk.findOne({ country, _id: { $ne: id } });
    if (exists) return res.status(400).json({ message: "Country already exists" });

    const updated = await CountryRisk.findByIdAndUpdate(id, { country, risk }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteCountryRisk = async (req, res) => {
  await CountryRisk.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
};

