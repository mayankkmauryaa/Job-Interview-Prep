// Handle scheduling and conducting mock interviews
const express = require('express');
const router = express.Router();
const MockInterview = require('../models/MockInterview');

exports.scheduleInterview = async (req, res) => {
  try {
    const interviewDetails = req.body;
    const scheduledInterview = await MockInterview.scheduleInterview(interviewDetails);
    res.json(scheduledInterview);
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling interview' });
  }
};
