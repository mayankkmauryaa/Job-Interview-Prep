const express = require('express');
const router = express.Router();
const VideoInterviewController = require('../controllers/VideoInterviewController');

router.post('/record-video', VideoInterviewController.recordVideo);

module.exports = router;
