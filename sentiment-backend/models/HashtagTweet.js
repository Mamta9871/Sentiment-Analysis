const mongoose = require('mongoose');

const hashtagTweetSchema = new mongoose.Schema({
  hashtag: { type: String, required: true },
  tweets: [{
    text: String,
    created_at: String,
    sentiment: String // Optional, added if analyzed
  }],
  user: { type: String, required: true }, // Could be ObjectId if linked to a User model
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HashtagTweet', hashtagTweetSchema);