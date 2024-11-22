const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');
const User = require('../models/Users');

// Create an expense
router.post('/', auth, async (req, res) => {
  const { userId, categoryId, amount, description, date } = req.body; // Accept the date from request body

  try {
    // Validate userId
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    // Validate categoryId
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid categoryId' });
    }

    // Create a new expense, passing the date if available
    const newExpense = new Expense({ userId, categoryId, amount, description, date: date || Date.now() });
    await newExpense.save();

    // Update category debits
    await Category.findByIdAndUpdate(
      categoryId,
      { $inc: { debits: -amount } },
      { new: true }
    );

    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error adding expense:', error.message);
    res.status(500).json({ message: 'Error adding expense', error: error.message });
  }
});

// Get all expenses for a user
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Populate category name when fetching expenses
    const expenses = await Expense.find({ userId })
      .populate('categoryId', 'name') // Populate only the category name
      .sort({ date: -1 }); // Sort by most recent expenses

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

// Update an expense
router.put('/:id', auth, async (req, res) => {
  const { amount, description, categoryId, date } = req.body; // Accept date as well

  try {
    // Find the existing expense
    const existingExpense = await Expense.findById(req.params.id);
    if (!existingExpense) return res.status(404).json({ message: 'Expense not found' });

    const originalAmount = existingExpense.amount;
    const originalCategoryId = existingExpense.categoryId.toString();

    // Update the expense details, including date if provided
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { amount, description, categoryId, date },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(500).json({ message: 'Failed to update expense' });
    }

    // Handle category updates
    if (categoryId !== originalCategoryId) {
      await Category.findByIdAndUpdate(
        originalCategoryId,
        { $inc: { debits: -originalAmount } }
      );

      await Category.findByIdAndUpdate(
        categoryId,
        { $inc: { debits: amount } }
      );
    } else {
      const amountDifference = amount - originalAmount;
      await Category.findByIdAndUpdate(
        categoryId,
        { $inc: { debits: amountDifference } }
      );
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error.message);
    res.status(500).json({ message: 'Error updating expense', error: error.message });
  }
});

// Delete an expense
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find expense to delete
    const expenseToDelete = await Expense.findById(req.params.id);
    if (!expenseToDelete) return res.status(404).json({ message: 'Expense not found' });

    const { amount, categoryId } = expenseToDelete;

    // Delete expense
    await Expense.findByIdAndDelete(req.params.id);

    // Update category debits and budget
    await Category.findByIdAndUpdate(
      categoryId,
      { 
        $inc: { 
          debits: -amount, 
          budget: +amount 
        } 
      },
      { new: true }
    );

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error.message);
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
});

router.get('/edit/:id', auth, async (req, res) => {
  try {
      const expense = await Expense.findById(req.params.id);
      if (!expense) {
          console.log("Expense not found");
          return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
  } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;