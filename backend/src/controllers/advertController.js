const Product = require('../models/Product');
const Advert = require('../models/Advert');
const cloudinary = require('../utils/cloudinary'); // Add this import at the top

// Admin: Create advert
exports.createAdvert = async (req, res) => {
  try {

    const { title, message, product, startDate, endDate, active, template } = req.body;
    let images = [];
    if (req.file) {
      images = [req.file.path];
    } else if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path); // Cloudinary URLs
    } else if (req.body.image && typeof req.body.image === 'string') {
      images = [req.body.image];
    }
    // Parse dates to ensure correct type
    const startDateParsed = startDate ? new Date(startDate) : undefined;
    const endDateParsed = endDate ? new Date(endDate) : undefined;
    const advert = await Advert.create({
      title,
      message,
      product,
      images,
      startDate: startDateParsed,
      endDate: endDateParsed,
      active: typeof active === 'string' ? active === 'true' : !!active,
      template
    });
    res.status(201).json({ advert });
  } catch (error) {
    res.status(500).json({ message: 'Error creating advert', error: error.message });
  }
};

// Admin: Update advert
exports.updateAdvert = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, product, startDate, endDate, active, template } = req.body;
    const existing = await Advert.findById(id);
    if (!existing) return res.status(404).json({ message: 'Advert not found' });

    let images = existing.images || [];
    if (req.file) {
      images = [req.file.path];
    } else if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path); // Cloudinary URLs
    } else if (req.body.image && typeof req.body.image === 'string') {
      images = [req.body.image];
    }
    // Parse dates to ensure correct type
    const startDateParsed = startDate ? new Date(startDate) : undefined;
    const endDateParsed = endDate ? new Date(endDate) : undefined;
    const advert = await Advert.findByIdAndUpdate(
      id,
      {
        title,
        message,
        product,
        images,
        startDate: startDateParsed,
        endDate: endDateParsed,
        active: typeof active === 'string' ? active === 'true' : !!active,
        template
      },
      { new: true }
    );
    res.json({ advert });
  } catch (error) {
    res.status(500).json({ message: 'Error updating advert', error: error.message });
  }
};

// Admin: Delete advert
exports.deleteAdvert = async (req, res) => {
  try {
    const { id } = req.params;
    const advert = await Advert.findByIdAndDelete(id);
    if (!advert) return res.status(404).json({ message: 'Advert not found' });
    res.json({ message: 'Advert deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting advert', error: error.message });
  }
};

// Admin: List all adverts
exports.listAdverts = async (req, res) => {
  try {
    const adverts = await Advert.find().populate('product');
    const advertsWithImage = adverts.map(ad => ({
      ...ad.toObject(),
      image: ad.images && ad.images.length > 0 ? ad.images[0] : ''
    }));
    res.json({ adverts: advertsWithImage });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching adverts', error: error.message });
  }
};

// Simple in-memory cache for active adverts
let advertsCache = { data: null, ts: 0 };
const ADVERTS_TTL_MS = 60 * 1000; // 1 minute

// Public: Get active adverts
exports.getActiveAdverts = async (req, res) => {
  try {
    const now = new Date();
    const nowMs = Date.now();
    if (advertsCache.data && (nowMs - advertsCache.ts) < ADVERTS_TTL_MS) {
      return res.json({ adverts: advertsCache.data });
    }

    // Log all adverts for debugging
    const allAdverts = await Advert.find().populate('product');
    allAdverts.forEach(ad => {
      const reasons = [];
      if (!ad.active) reasons.push('inactive');
      if (ad.startDate && ad.startDate > now) reasons.push('startDate in future');
      if (ad.endDate && ad.endDate < now) reasons.push('endDate in past');
      if (reasons.length > 0) {
        console.log(`Advert ${ad._id} is not active because: ${reasons.join(', ')}`);
      } else {
        console.log(`Advert ${ad._id} is active and within date range.`);
      }
    });
    const adverts = allAdverts.filter(ad => ad.active && (!ad.startDate || ad.startDate <= now) && (!ad.endDate || ad.endDate >= now));

    const advertsWithImage = adverts.map(ad => ({
      ...ad.toObject(),
      image: ad.images && ad.images.length > 0 ? ad.images[0] : ''
    }));
    advertsCache = { data: advertsWithImage, ts: nowMs };
    res.json({ adverts: advertsWithImage });
  } catch (error) {
    console.error('Error in getActiveAdverts:', error);
    res.status(500).json({ message: 'Error fetching active adverts', error: error.message });
  }
};