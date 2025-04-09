const CountryRisk = require("../models/CountryRisk");
const Risk = require('../models/Risk');

exports.addCountryRisk = async (req, res) => {
  try {
    const { country, risk } = req.body;
    /**
     * 'risk' here should be the ID of the Risk document
     * in which you want to push the new country reference.
     *
     * e.g. {
     *   "country": "USA",
     *   "risk": "644930b1234abcd5678ef012"  <-- a valid ObjectId for a Risk
     * }
     */

    // 1. Check if the country already exists in CountryRisk
    const exists = await CountryRisk.findOne({ country });
    if (exists) {
      return res.status(400).json({ message: "Country already exists" });
    }

    // 2. Create the new CountryRisk document
    const newCountry = await CountryRisk.create({ country, risk });
    // 'newCountry' will have an _id like '644932abc...'

    // 3. Push the new country's _id into the Risk's 'countries' array
    // await Risk.findByIdAndUpdate(
    //   risk,                    // The ID of the Risk doc
    //   { $push: { countries: newCountry._id } },
    //   { new: true }           // Return the updated doc if you want
    // );

    // 4. Return the newly created CountryRisk
    res.status(201).json(newCountry);

  } catch (err) {
    console.error('Error adding country risk:', err);
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

