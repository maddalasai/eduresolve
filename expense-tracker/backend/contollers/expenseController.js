const Expense = require('../models/Expense');

const addExpense = async (req, res) => {
  const { title, amount, category } = req.body;
  if (!title || !amount || !category)
    return res.status(400).json({ msg: 'Please enter all fields' });

  const expense = await Expense.create({ user: req.user, title, amount, category });
  res.json(expense);
};

const getExpenses = async (req, res) => {
  const expenses = await Expense.find({ user: req.user }).sort({ createdAt: -1 });
  res.json(expenses);
};

module.exports = { addExpense, getExpenses };
