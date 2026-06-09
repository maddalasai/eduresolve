const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // ✅ Only once, at the top
const Expense = require('../models/Expense');

// Create a new expense (protected)
router.post('/', auth, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      user: req.user.id   // user from JWT
    });
    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get all expenses for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update an expense
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete an expense
router.delete('/:id', auth, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;

