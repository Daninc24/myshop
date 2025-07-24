const PageView = require('../models/PageView');

exports.recordPageView = async (req, res) => {
  try {
    const { sessionId, path } = req.body;
    const ipAddress = req.ip; // Get IP address from request
    const userAgent = req.headers['user-agent']; // Get user agent from request

    const pageView = new PageView({
      sessionId,
      path,
      ipAddress,
      userAgent,
    });

    await pageView.save();
    res.status(201).json({ message: 'Page view recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error recording page view', error: error.message });
  }
};