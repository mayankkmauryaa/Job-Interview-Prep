const express = require('express');
const router = express.Router();
const GamificationController = require('../controllers/GamificationController');

router.post('/award-points', GamificationController.awardPoints);

module.exports = router;
