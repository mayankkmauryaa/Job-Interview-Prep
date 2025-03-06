const express = require('express');
const router = express.Router();
const MockInterviewController = require('../controllers/MockInterviewController');

router.post('/schedule-interview', MockInterviewController.scheduleInterview);

module.exports = router;
