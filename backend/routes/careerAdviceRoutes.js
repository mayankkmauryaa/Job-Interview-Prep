const express = require('express');
const router = express.Router();
const CareerAdviceController = require('../controllers/CareerAdviceController');

router.post('/get-advice', CareerAdviceController.getAdvice);

module.exports = router;
