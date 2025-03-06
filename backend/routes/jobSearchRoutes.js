const express = require('express');
const router = express.Router();
const JobSearchController = require('../controllers/JobSearchController');

router.get('/job-listings', JobSearchController.getJobListings);

module.exports = router;
