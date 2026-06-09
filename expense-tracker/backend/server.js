// server.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// -------------------
// Middleware
// -------------------
app.use(cors());           // Enable Cross-Origin requests
app.use(express.json());   // Parse JSON bodies

// -------------------
// Routes
// -------------------
app.use('/api/auth', authRoutes);       // Auth routes: register/login
app.use('/api/expenses', expenseRoutes); // Expense CRUD routes

// -------------------
// Test/Home Route
// -------------------
app.get('/', (req, res) => {
    res.json({ msg: 'Server is running!' });
});

// -------------------
// Error handling for unknown routes
// -------------------
app.use((req, res) => {
    res.status(404).json({ msg: 'Route not found' });
});

// -------------------
// Start server
// -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
