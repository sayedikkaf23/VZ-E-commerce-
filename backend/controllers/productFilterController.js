const CountryRisk = require("../models/CountryRisk");
const ProductRisk = require("../models/ProductRisk");

exports.getFilteredProducts = async (req, res) => {
  try {
    const { country, selectedProductIds, isAutoApproved } = req.body;

    const countryRisk = await CountryRisk.findOne({ country });
    if (!countryRisk) return res.status(404).json({ message: "Country not found" });

    if (!isAutoApproved) {
      return res.json([]); // return empty list if not auto-approved
    }

    const matchedProducts = await ProductRisk.find({
      _id: { $in: selectedProductIds },
      risk: countryRisk.risk
    });

    return res.json({ products: matchedProducts });
  } catch (error) {
    console.error("Get Filtered Products Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
