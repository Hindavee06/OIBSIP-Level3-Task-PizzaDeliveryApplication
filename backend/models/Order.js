const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pizza: {
    base: { type: String, required: true },
    sauce: { type: String, required: true },
    cheese: { type: String, required: true },
    veggies: [String],
    name: String,
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'],
    default: 'Order Received'
  },
  statusHistory: [{
    status: String,
    updatedAt: { type: Date, default: Date.now }
  }],
  payment: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }
  },
  deliveryAddress: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);