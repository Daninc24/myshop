const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  id: { type: String, required: true, trim: true },
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  id: { type: String, required: true, trim: true, unique: true },
  subcategories: [subcategorySchema],
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
