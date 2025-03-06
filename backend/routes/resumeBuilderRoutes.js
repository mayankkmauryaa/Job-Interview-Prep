const express = require('express');
const router = express.Router();
const ResumeBuilderController = require('../controllers/ResumeBuilderController');

router.post('/create-resume', ResumeBuilderController.createResume);

module.exports = router;
