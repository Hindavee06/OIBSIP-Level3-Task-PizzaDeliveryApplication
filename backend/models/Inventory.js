const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'],
    required: true
  },
  name: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 100 },
  unit: { type: String, default: 'units' },
  threshold: { type: Number, default: 20 },
  price: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  imageUrl: String,
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);