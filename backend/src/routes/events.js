const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { auth, admin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);

// Admin routes
router.post('/', auth, admin, upload.single('image'), eventController.createEvent);
router.put('/:id', auth, admin, upload.single('image'), eventController.updateEvent);
router.delete('/:id', auth, admin, eventController.deleteEvent);

module.exports = router;