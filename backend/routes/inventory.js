const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect, adminOnly } = require('../middleware/auth');

// Get all inventory (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const items = await Inventory.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get inventory summary
router.get('/summary', protect, adminOnly, async (req, res) => {
  try {
    const summary = await Inventory.aggregate([
      { $group: { _id: '$category', total: { $sum: '$quantity' }, count: { $sum: 1 }, lowStock: { $sum: { $cond: [{ $lte: ['$quantity', '$threshold'] }, 1, 0] } } } },
    ]);
    const items = await Inventory.find().sort({ quantity: 1 });
    res.json({ summary, lowStockItems: items.filter(i => i.quantity <= i.threshold) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add inventory item (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update inventory item (admin)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete inventory item (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed initial inventory
router.post('/seed', protect, adminOnly, async (req, res) => {
  try {
    const seedData = [
      { category: 'base', name: 'Classic Crust', quantity: 100, price: 50, description: 'Traditional hand-tossed crust' },
      { category: 'base', name: 'Thin Crust', quantity: 80, price: 50, description: 'Crispy and light' },
      { category: 'base', name: 'Thick Crust', quantity: 90, price: 60, description: 'Fluffy and chewy' },
      { category: 'base', name: 'Stuffed Crust', quantity: 70, price: 80, description: 'Cheese-filled edges' },
      { category: 'base', name: 'Sourdough Crust', quantity: 60, price: 70, description: 'Tangy artisan crust' },
      { category: 'sauce', name: 'Tomato Basil', quantity: 120, price: 30, description: 'Classic marinara' },
      { category: 'sauce', name: 'BBQ Sauce', quantity: 100, price: 35, description: 'Smoky and sweet' },
      { category: 'sauce', name: 'Pesto', quantity: 80, price: 40, description: 'Fresh basil pesto' },
      { category: 'sauce', name: 'Arrabbiata', quantity: 90, price: 35, description: 'Spicy tomato sauce' },
      { category: 'sauce', name: 'White Garlic', quantity: 70, price: 40, description: 'Creamy garlic base' },
      { category: 'cheese', name: 'Mozzarella', quantity: 150, price: 60, description: 'Classic stretchy cheese' },
      { category: 'cheese', name: 'Cheddar', quantity: 100, price: 60, description: 'Sharp and creamy' },
      { category: 'cheese', name: 'Parmesan', quantity: 80, price: 70, description: 'Hard Italian cheese' },
      { category: 'cheese', name: 'Ricotta', quantity: 70, price: 65, description: 'Soft and creamy' },
      { category: 'cheese', name: 'Feta', quantity: 60, price: 75, description: 'Crumbly Greek cheese' },
      { category: 'veggie', name: 'Tomatoes', quantity: 200, price: 20 },
      { category: 'veggie', name: 'Mushrooms', quantity: 180, price: 25 },
      { category: 'veggie', name: 'Bell Peppers', quantity: 160, price: 20 },
      { category: 'veggie', name: 'Onions', quantity: 200, price: 15 },
      { category: 'veggie', name: 'Spinach', quantity: 150, price: 20 },
      { category: 'veggie', name: 'Jalapeños', quantity: 100, price: 25 },
      { category: 'veggie', name: 'Olives', quantity: 120, price: 30 },
      { category: 'veggie', name: 'Corn', quantity: 180, price: 15 },
      { category: 'veggie', name: 'Zucchini', quantity: 100, price: 25 },
      { category: 'veggie', name: 'Basil', quantity: 150, price: 15 },
    ];
    await Inventory.deleteMany({});
    await Inventory.insertMany(seedData);
    res.json({ message: 'Inventory seeded successfully', count: seedData.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;