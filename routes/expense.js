const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();
const auth = require('../middleware/auth');

// Create an expense
router.post('/', auth, async (req, res) => {
  const { userId, category, amount, description } = req.body;
  try {
    const newExpense = new Expense({ userId, category, amount, description });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error adding expense' });
  }
});

// Get all expenses for a user
router.get('/:userId', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.params.userId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

// Update an expense
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense' });
  }
});

// Delete an expense
router.delete('/:id', auth, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense' });
  }
});

module.exports = router;
