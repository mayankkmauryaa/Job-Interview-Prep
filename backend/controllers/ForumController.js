// Handle forum discussions and user profiles
const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');

exports.createPost = async (req, res) => {
  try {
    const post = await ForumPost.create(req.body);
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
};
