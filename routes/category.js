// routes/category.js
const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const router = express.Router();
const mongoose = require('mongoose');
const Expense = require('../models/Expense')

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

// Delete category and all related expenses
router.delete('/:id', auth, async (req, res) => {
  try {
    const categoryId = new mongoose.Types.ObjectId(req.params.id); // Correct way to instantiate ObjectId

    // Find and delete all expenses associated with the category first
    const expenses = await Expense.find({ categoryId });
    if (expenses.length > 0) {
      const deleteResult = await Expense.deleteMany({ categoryId });
      console.log('Expenses deleted:', deleteResult);
    } else {
      console.log('No expenses found for this category.');
    }

    // Now delete the category
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    console.log('Category deleted:', category);

    res.status(200).json({ message: 'Category and related expenses deleted successfully' });
  } catch (error) {
    console.error('Error deleting category and expenses:', error);
    res.status(500).json({ message: 'Error deleting category and expenses', error });
  }
});

router.get('/budgetsummary/:userId', auth, async (req, res) => {
    try {
      const categories = await Category.find({ userId: req.params.userId });
      const summary = categories.map((category) => ({
        name: category.name,
        budget: category.budget,
        remaining: category.budget + category.credits + category.debits,
      }));
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching summary' });
    }
  });  

// Backend route for editing a category
router.get('/edit/:id', auth, async (req, res) => {
  try {
      // Find the category by ID from the database
      const category = await Category.findById(req.params.id);

      // If category is not found, return a 404 error
      if (!category) {
          console.log("Category not found");
          return res.status(404).json({ message: "Category not found" });
      }

      // Send the category details as a response
      res.json(category);
  } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
