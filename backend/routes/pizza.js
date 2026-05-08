const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');

// Get all pizza options grouped by category
router.get('/options', protect, async (req, res) => {
  try {
    const items = await Inventory.find({ available: true, quantity: { $gt: 0 } });
    const grouped = {
      bases: items.filter(i => i.category === 'base'),
      sauces: items.filter(i => i.category === 'sauce'),
      cheeses: items.filter(i => i.category === 'cheese'),
      veggies: items.filter(i => i.category === 'veggie'),
      meats: items.filter(i => i.category === 'meat'),
    };
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get pizza varieties
router.get('/varieties', protect, async (req, res) => {
  const varieties = [
    { name: 'Margherita Classic', base: 'Classic Crust', sauce: 'Tomato Basil', cheese: 'Mozzarella', veggies: ['Tomatoes', 'Basil', 'Olives'], price: 299, emoji: '🍅', description: 'The timeless Italian classic' },
    { name: 'BBQ Bonanza', base: 'Thick Crust', sauce: 'BBQ Sauce', cheese: 'Cheddar', veggies: ['Onions', 'Bell Peppers', 'Corn'], price: 349, emoji: '🔥', description: 'Smoky, tangy perfection' },
    { name: 'Garden Delight', base: 'Thin Crust', sauce: 'Pesto', cheese: 'Parmesan', veggies: ['Spinach', 'Mushrooms', 'Zucchini', 'Tomatoes'], price: 329, emoji: '🥗', description: 'Fresh garden goodness' },
    { name: 'Spicy Arrabbiata', base: 'Stuffed Crust', sauce: 'Arrabbiata', cheese: 'Mozzarella', veggies: ['Jalapeños', 'Red Onions', 'Bell Peppers'], price: 379, emoji: '🌶️', description: 'For the heat seekers' },
    { name: 'White Truffle', base: 'Sourdough Crust', sauce: 'White Garlic', cheese: 'Ricotta', veggies: ['Mushrooms', 'Spinach', 'Olives'], price: 449, emoji: '✨', description: 'Luxury in every bite' },
    { name: 'Mediterranean Dream', base: 'Thin Crust', sauce: 'Hummus Base', cheese: 'Feta', veggies: ['Olives', 'Tomatoes', 'Red Onions', 'Spinach'], price: 389, emoji: '🫒', description: 'Mediterranean flavors unite' },
  ];
  res.json(varieties);
});

module.exports = router;