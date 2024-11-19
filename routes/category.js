// routes/category.js
const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new category
router.post('/', auth, async (req, res) => {
  const { userId, name, budget } = req.body;
  try {
    const newCategory = new Category({ userId, name, budget });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Get all categories for a user
router.get('/:userId', auth, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.params.userId });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Update a category's budget
router.put('/:id', auth, async (req, res) => {
  const { budget } = req.body;
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { budget },
      { new: true }
    );
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
});

router.get('/budgetsummary/:userId', auth, async (req, res) => {
    try {
      const categories = await Category.find({ userId: req.params.userId });
      const summary = categories.map((category) => ({
        name: category.name,
        budget: category.budget,
        remaining: category.budget + category.credits - category.debits,
      }));
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching summary' });
    }
  });  

module.exports = router;
