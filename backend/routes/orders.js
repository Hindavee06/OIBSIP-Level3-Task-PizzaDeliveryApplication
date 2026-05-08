const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');
const { deductStock } = require('../utils/stockAlert');
const { sendOrderStatusEmail } = require('../utils/email');

// Place order
router.post('/', protect, async (req, res) => {
  try {
    const { pizza, totalPrice, deliveryAddress, paymentId, razorpayOrderId } = req.body;
    const order = await Order.create({
      user: req.user._id,
      pizza,
      totalPrice,
      deliveryAddress,
      payment: { razorpayOrderId, razorpayPaymentId: paymentId, status: 'paid' },
      statusHistory: [{ status: 'Order Received' }]
    });

    await deductStock(pizza);
    res.status(201).json({ message: 'Order placed!', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update order status
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { statusHistory: { status, updatedAt: new Date() } }
      },
      { new: true }
    ).populate('user', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    await sendOrderStatusEmail(order.user.email, status, order._id.toString().slice(-6).toUpperCase());
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;