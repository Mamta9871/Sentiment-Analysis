const express = require('express');
const axios = require('axios');
const router = express.Router();
const AnalyzedTweet = require('../models/AnalyzedTweet');
const HashtagTweet = require('../models/HashtagTweet');

const FLASK_API_URL = 'http://localhost:5001/twitter';

router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - SENTIMENT.JS ACTIVE`);
  next();
});

router.get('/tweets/:username', async (req, res) => {
  const { username } = req.params;
  const { count } = req.query;
  console.log(`Received username request: ${username}, count: ${count}`);
  try {
    const response = await axios.get(`${FLASK_API_URL}/tweets/${username}`, {
      params: { count },
      headers: { Authorization: `Bearer ${req.user?.token || ''}` }
    });
    console.log('Flask response for username:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching username tweets:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Server error fetching username tweets'
    });
  }
});

router.get('/hashtag/:hashtag', async (req, res) => {
  const { hashtag } = req.params;
  const { count } = req.query;
  console.log(`Received hashtag request: ${hashtag}, count: ${count}`);
  try {
    const response = await axios.get(`${FLASK_API_URL}/hashtag/${hashtag}`, {
      params: { count }
    });
    console.log('Flask response for hashtag:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching hashtag tweets:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Server error fetching hashtag tweets'
    });
  }
});

router.post('/analyze', async (req, res) => {
  const { tweet } = req.body;
  console.log(`Received analysis request for tweet: ${tweet}`);
  try {
    const response = await axios.post(`${FLASK_API_URL}/analyze`, { tweet });
    console.log('Flask analysis response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error analyzing tweet:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Server error analyzing tweet'
    });
  }
});

router.post('/save-analyzed-tweets', async (req, res) => {
  const { username, name, tweets } = req.body;
  console.log(`Saving tweets for username: ${username}`);
  try {
    const tweetDoc = new AnalyzedTweet({
      username,
      name,
      tweets,
      user: req.user?.id || 'unknown'
    });
    await tweetDoc.save();
    res.status(201).json({ message: 'Tweets saved successfully' });
  } catch (error) {
    console.error('Error saving username tweets:', error.message);
    res.status(500).json({ error: 'Failed to save tweets' });
  }
});

router.post('/save-analyzed-hashtag-tweets', async (req, res) => {
  const { hashtag, tweets } = req.body;
  console.log(`Saving tweets for hashtag: ${hashtag}`);
  try {
    const hashtagTweetDoc = new HashtagTweet({
      hashtag,
      tweets,
      user: req.user?.id || 'unknown'
    });
    await hashtagTweetDoc.save();
    res.status(201).json({ message: 'Hashtag tweets saved successfully' });
  } catch (error) {
    console.error('Error saving hashtag tweets:', error.message);
    res.status(500).json({ error: 'Failed to save hashtag tweets' });
  }
});

module.exports = router;