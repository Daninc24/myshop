const express = require('express');
const router = express.Router();
const pageViewController = require('../controllers/pageViewController');

router.post('/', pageViewController.recordPageView);

module.exports = router;