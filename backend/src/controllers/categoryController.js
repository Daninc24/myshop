const Category = require('../models/Category');

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, id, subcategories = [] } = req.body;
    const category = new Category({ name, id, subcategories });
    await category.save();
    categoriesCache = { data: null, ts: 0 };
    res.status(201).json({ category });
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
};

// Simple in-memory cache for categories
let categoriesCache = { data: null, ts: 0 };
const CATEGORIES_TTL_MS = 60 * 1000; // 1 minute

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const now = Date.now();
    if (categoriesCache.data && (now - categoriesCache.ts) < CATEGORIES_TTL_MS) {
      return res.json({ categories: categoriesCache.data });
    }
    const categories = await Category.find();
    categoriesCache = { data: categories, ts: now };
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Update category (including subcategories)
exports.updateCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    const category = await Category.findOneAndUpdate(
      { id: req.params.id },
      { name, subcategories },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    categoriesCache = { data: null, ts: 0 };
    res.json({ category });
  } catch (error) {
    res.status(400).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ id: req.params.id });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    categoriesCache = { data: null, ts: 0 };
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};
