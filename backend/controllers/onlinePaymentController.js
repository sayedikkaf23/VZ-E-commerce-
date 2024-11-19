const PaymentMode = require("../models/paymentMode");



const getPaymentModesHome = async (req, res) => {
    try {
      const adminObjectId = new mongoose.Types.ObjectId(
        "653f5041f94b9319a2bb17bd"
      );
      // Find all payment methods documents based on admin ID
      const paymentMethods = await PaymentMode.find();
  
      if (!paymentMethods || paymentMethods.length === 0) {
        return res.status(404).json({ message: "No payment methods found" });
      }
  
      return res.status(200).json({
        // message: "Payment methods retrieved successfully",
        paymentMethods,
      });
    } catch (error) {
      console.error("Error getting payment methods:", error);
      return res.status(500).json({ message: "Error getting payment methods" });
    }
  };
  exports.getPaymentModesHome = getPaymentModesHome;
