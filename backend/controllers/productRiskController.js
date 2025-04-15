const ProductRisk = require("../models/ProductRisk");

// ✅ Add single or multiple products (with duplication check)
exports.addProducts = async (req, res) => {
  try {
    const products = req.body.products; // expecting an array of products

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No product data provided" });
    }

    // Process each product
    const addedProducts = [];
    for (const product of products) {
      const { name, unitPrice, quantity, currencyName, risk } = product;

      // Validate mandatory fields
      if (
        !name ||
        unitPrice === undefined ||
        quantity === undefined ||
        !currencyName ||
        !risk
      ) {
        return res.status(400).json({
          message: "Mandatory fields missing: name, unit price, quantity, currency, and risk level are required."
        });
      }

      // Additional business validations:
      // Check if the product already exists with the same name and risk
      const exists = await ProductRisk.findOne({ name, risk });
      if (exists) {
        return res.status(400).json({ message: "Product already exists" });
      }

      // Create the product in the database.
      // Any Mongoose errors (including those from schema validations) will be caught.
      const createdProduct = await ProductRisk.create(product);
      addedProducts.push(createdProduct);
    }

    return res.status(201).json({ message: "Products added", data: addedProducts });
  } catch (error) {
    // If the error is from Mongoose validations, return a 400 error.
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "An error occurred", error: error.message });
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
