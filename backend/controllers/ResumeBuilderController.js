// Handle resume creation and customization
const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');

exports.createResume = async (req, res) => {
  try {
    const resumeDetails = req.body;
    const createdResume = await Resume.createResume(resumeDetails);
    res.json(createdResume);
  } catch (error) {
    res.status(500).json({ message: 'Error creating resume' });
  }
};
