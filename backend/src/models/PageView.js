const mongoose = require('mongoose');

const PageViewSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  path: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String },
});

module.exports = mongoose.model('PageView', PageViewSchema);