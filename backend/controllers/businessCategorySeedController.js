const BusinessCategory = require('../models/BusinessCategory'); 
// ^–– make sure this file exports the BusinessCategory model as shown earlier
const list= require('../db/businessCategories');

exports.seedBusinessCategories = async (req, res) => {
  try {
    await BusinessCategory.deleteMany({});
    const docs = list.map(item => ({
      name:     item.Label,
      value:    item.Value,
      isActive: true
    }));
    const inserted = await BusinessCategory.insertMany(docs, { ordered: false });
    return res
      .status(201)
      .json({ message: `Inserted ${inserted.length}`, data: inserted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getBusinessCategories = async (req, res) => {
  try {
    const all = await BusinessCategory.find({});
    return res.status(200).json(all);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
