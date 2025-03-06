const express = require('express');
const router = express.Router();
const ForumController = require('../controllers/ForumController');

router.post('/create-post', ForumController.createPost);

module.exports = router;
