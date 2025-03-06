// Handle user points and badges
const express = require('express');
const router = express.Router();
const User = require('../models/User');

exports.awardPoints = async (req, res) => {
  try {
    const userId = req.body.userId;
    const points = await User.awardPoints(userId);
    res.json(points);
  } catch (error) {
    res.status(500).json({ message: 'Error awarding points' });
  }
};
