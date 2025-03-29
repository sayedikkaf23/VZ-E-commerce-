const ProductRisk = require("../models/ProductRisk");

// ✅ Add single or multiple products (with duplication check)
exports.addProducts = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
      return res.status(400).json({ message: "No product data provided" });
    }

    if (Array.isArray(payload)) {
      // Check for duplicates before insert
      const existing = await ProductRisk.find({
        $or: payload.map(p => ({ name: p.name, risk: p.risk }))
      });

      const existingKeys = new Set(existing.map(p => `${p.name}_${p.risk}`));
      const newProducts = payload.filter(p => !existingKeys.has(`${p.name}_${p.risk}`));

      if (newProducts.length === 0) {
        return res.status(400).json({ message: "All products already exist" });
      }

      const added = await ProductRisk.insertMany(newProducts);
      return res.status(201).json({ message: "Products added", data: added });
    } else {
      const { name, risk } = payload;
      const exists = await ProductRisk.findOne({ name, risk });
      if (exists) {
        return res.status(400).json({ message: "Product already exists" });
      }

      const product = await ProductRisk.create(payload);
      return res.status(201).json({ message: "Product added", data: product });
    }
  } catch (error) {
    res.status(500).json({ message: "Add error", error: error.message });
  }
};

// ✅ Update multiple products
exports.updateProducts = async (req, res) => {
  try {
    const updates = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "Provide an array of products to update" });
    }

    const updated = await Promise.all(
      updates.map(({ _id, ...rest }) =>
        ProductRisk.findByIdAndUpdate(_id, rest, { new: true, runValidators: true })
      )
    );

    res.status(200).json({ message: "Products updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Update error", error: error.message });
  }
};

// ✅ Delete multiple products
exports.deleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Provide an array of product IDs to delete" });
    }

    await ProductRisk.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Products deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete error", error: error.message });
  }
};

// ✅ Get all products
exports.getAllProducts = async (_, res) => {
  const products = await ProductRisk.find();
  res.json(products);
};
