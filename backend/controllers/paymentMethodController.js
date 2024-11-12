// controllers/paymentMethodController.js
const PaymentMethod = require('../models/paymentMethodModel');

// GET request to fetch payment methods
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.findOne();  // Assuming only one document exists for payment methods
    if (!paymentMethods) {
      return res.status(404).json({ message: 'Payment methods not found' });
    }
    res.status(200).json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Error fetching payment methods', details: error.message });
  }
};

// PUT request to update payment methods
exports.updatePaymentMethod = async (req, res) => {
  try {
    const paymentMethodId = req.params.paymentMethodId;
    const updateData = req.body;

    const updatedPaymentMethod = await PaymentMethod.findByIdAndUpdate(
      paymentMethodId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedPaymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.status(200).json({
      message: 'Payment method updated successfully',
      data: updatedPaymentMethod
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({
      message: 'Error updating payment method',
      details: error.message
    });
  }
};
