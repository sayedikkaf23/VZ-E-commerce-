const ProductRisk = require("../models/ProductRisk");

// ✅ Add single or multiple products (with duplication check)
// ✅ Add single or multiple products (with duplication check)
exports.addProducts = async (req, res) => {
  try {
    const payload = req.body.products;  // Make sure you're using the "products" array

    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
      return res.status(400).json({ message: "No product data provided" });
    }

    // Loop through each product and check if it's valid
    const productPromises = payload.map(async (product) => {
      const { name, risk } = product;

      // Validate name and risk before saving
      if (!name || !risk) {
        return res.status(400).json({ message: "Product name and risk are required" });
      }

      const exists = await ProductRisk.findOne({ name, risk });
      if (exists) {
        return res.status(400).json({ message: "Product already exists" });
      }

      return ProductRisk.create(product);
    });

    // Wait for all products to be processed
    const addedProducts = await Promise.all(productPromises);
    return res.status(201).json({ message: "Products added", data: addedProducts });
  } catch (error) {
    res.status(500).json({ message: "Add error", error: error.message });
  }
};


exports.updateProducts = async (req, res) => {
  try {
    let updates = req.body;
    if (!Array.isArray(updates)) {
      updates = [updates];
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Provide product data to update" });
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
