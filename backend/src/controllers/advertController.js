const Advert = require('../models/Advert');
const Product = require('../models/Product');

// Admin: Create advert
exports.createAdvert = async (req, res) => {
  try {
    const { title, message, product, startDate, endDate, active, template } = req.body;
    let image = req.body.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    // Parse dates to ensure correct type
    const startDateParsed = startDate ? new Date(startDate) : undefined;
    const endDateParsed = endDate ? new Date(endDate) : undefined;
    const advert = await Advert.create({
      title,
      message,
      product,
      image,
      startDate: startDateParsed,
      endDate: endDateParsed,
      active,
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
    let image = req.body.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
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
        image,
        startDate: startDateParsed,
        endDate: endDateParsed,
        active,
        template
      },
      { new: true }
    );
    if (!advert) return res.status(404).json({ message: 'Advert not found' });
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
    res.json({ adverts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching adverts', error: error.message });
  }
};

// Public: Get active adverts
exports.getActiveAdverts = async (req, res) => {
  try {
    const now = new Date();
    console.log('--- getActiveAdverts called ---');
    console.log('Current date:', now.toISOString());
    // Log all adverts for debugging
    const allAdverts = await Advert.find().populate('product');
    allAdverts.forEach(ad => {
      const reasons = [];
      if (!ad.active) reasons.push('inactive');
      if (ad.startDate && ad.startDate > now) reasons.push('startDate in future');
      if (ad.endDate && ad.endDate < now) reasons.push('endDate in past');
      if (reasons.length === 0) {
        console.log(`[INCLUDED] ${ad.title} (${ad._id})`);
      } else {
        console.log(`[EXCLUDED] ${ad.title} (${ad._id}): ${reasons.join(', ')}`);
      }
    });
    const adverts = allAdverts.filter(ad => ad.active && (!ad.startDate || ad.startDate <= now) && (!ad.endDate || ad.endDate >= now));
    console.log('Filtered adverts count:', adverts.length);
    res.json({ adverts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active adverts', error: error.message });
  }
}; 