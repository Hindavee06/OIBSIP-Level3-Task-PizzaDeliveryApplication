const Inventory = require('../models/Inventory');
const { sendStockAlert } = require('./email');

exports.checkStockThreshold = async () => {
  try {
    const lowStock = await Inventory.find({
      $expr: { $lte: ['$quantity', '$threshold'] },
      available: true
    });
    if (lowStock.length > 0) {
      await sendStockAlert(lowStock);
      console.log(`Stock alert sent for ${lowStock.length} items`);
    }
  } catch (err) {
    console.error('Stock check error:', err);
  }
};

exports.deductStock = async (pizza) => {
  const updates = [
    { name: pizza.base, category: 'base' },
    { name: pizza.sauce, category: 'sauce' },
    { name: pizza.cheese, category: 'cheese' },
    ...pizza.veggies.map(v => ({ name: v, category: 'veggie' }))
  ];

  for (const item of updates) {
    await Inventory.findOneAndUpdate(
      { name: item.name, category: item.category },
      { $inc: { quantity: -1 } }
    );
  }
};