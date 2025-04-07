const Risk = require('../models/Risk');

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