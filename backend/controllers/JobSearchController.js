// Handle job listings and applications
const express = require('express');
const router = express.Router();
const JobListing = require('../models/JobListing');

exports.getJobListings = async (req, res) => {
  try {
    const jobListings = await JobListing.getJobListings();
    res.json(jobListings);
  } catch (error) {
    res.status(500).json({ message: 'Error getting job listings' });
  }
};
