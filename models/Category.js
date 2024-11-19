// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  budget: { type: Number, required: true, default: 0 },
  credits: { type: Number, required: true, default: 0 },
  debits: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model('Category', categorySchema);
