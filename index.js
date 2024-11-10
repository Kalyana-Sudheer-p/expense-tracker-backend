require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.listen(5000, () => console.log('Server started on port 5000'));
