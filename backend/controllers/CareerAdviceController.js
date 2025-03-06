// Handle career advice based on user data and job trends
const express = require('express');
const router = express.Router();
const CareerAdvice = require('../models/CareerAdvice');

exports.getAdvice = async (req, res) => {
  try {
    const userId = req.body.userId;
    const advice = await CareerAdvice.getAdvice(userId);
    res.json(advice);
  } catch (error) {
    res.status(500).json({ message: 'Error getting advice' });
  }
};
