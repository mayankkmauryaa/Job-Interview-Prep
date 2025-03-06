const express = require('express');
const router = express.Router();
const InterviewPlanController = require('../controllers/InterviewPlanController');

router.post('/generate-plan', InterviewPlanController.generatePlan);

module.exports = router;
