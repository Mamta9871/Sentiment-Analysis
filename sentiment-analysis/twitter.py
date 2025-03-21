from flask import Blueprint, request, jsonify
from flask_cors import CORS
import tweepy
import logging
import time
from textblob import TextBlob
from datetime import datetime

twitter_bp = Blueprint('twitter', __name__)
CORS(twitter_bp)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

TWITTER_BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAFbszgEAAAAAb%2FTZo3udOYmkJWbvNdpSEPfIsv4%3DVR0iZa1urcucFkElUZBNutDiu9YJ2XYDDzbtiujfK5irguTKdU"
print(f"Loaded TWITTER_BEARER_TOKEN: {'Set' if TWITTER_BEARER_TOKEN else 'Not Set'}")

class TwitterScraper:
    def __init__(self, bearer_token):
        print("Initializing TwitterScraper...")
        if not bearer_token:
            raise ValueError("No Bearer Token provided")
        self.client = tweepy.Client(bearer_token=bearer_token)
        self.request_count = 0
        self.window_start_time = time.time()
        self.MAX_REQUESTS = 50
        self.RATE_LIMIT_WINDOW = 900
        print("TwitterScraper initialized successfully")

    def can_make_request(self):
        current_time = time.time()
        elapsed_time = current_time - self.window_start_time
        if elapsed_time >= self.RATE_LIMIT_WINDOW:
            print(f"Resetting rate limit: Elapsed time = {elapsed_time:.2f}s")
            self.request_count = 0
            self.window_start_time = current_time
        can_proceed = self.request_count < self.MAX_REQUESTS
        wait_time = int(self.RATE_LIMIT_WINDOW - elapsed_time) if not can_proceed else 0
        print(f"Checking rate limit: Requests = {self.request_count}/{self.MAX_REQUESTS}, Elapsed = {elapsed_time:.2f}s, Can proceed = {can_proceed}, Wait = {wait_time}s")
        return can_proceed, wait_time

    def fetch_tweets(self, username, start_date=None, end_date=None, count=5):
        print(f"Fetching tweets for username: {username}, start: {start_date}, end: {end_date}, count: {count}")
        can_proceed, wait_time = self.can_make_request()
        if not can_proceed:
            logger.warning(f"Local rate limit hit. Wait time: {wait_time}s")
            return {"error": f"Rate limited locally. Wait {wait_time} seconds.", "wait_time": wait_time}, 429

        try:
            user_response = self.client.get_user(username=username)
            if not user_response.data:
                logger.error(f"User @{username} not found")
                return {"error": f"Twitter user @{username} not found."}, 404

            user_id = user_response.data.id
            count = min(int(count), 100) if count > 0 else 0
            tweets = []
            if count > 0:
                for tweet_batch in tweepy.Paginator(
                    self.client.get_users_tweets,
                    id=user_id,
                    start_time=start_date,
                    end_time=end_date,
                    max_results=min(count, 100),
                    tweet_fields=["created_at"]
                ):
                    if not tweet_batch.data:
                        break
                    self.request_count += 1
                    tweets.extend([
                        {"text": tweet.text, "created_at": tweet.created_at.isoformat()}
                        for tweet in tweet_batch.data
                    ])
                    if len(tweets) >= count:
                        tweets = tweets[:count]
                        break

            if not tweets and count > 0:
                logger.info(f"No tweets found for @{username} in range {start_date} to {end_date}")
                return {"tweets": [{"text": f"No tweets found for @{username} in specified range", "created_at": "N/A"}]}, 200
            elif count == 0:
                logger.info(f"Count set to 0 for @{username}, returning empty list")
                return {"username": username, "name": user_response.data.name, "tweets": []}, 200

            print(f"Fetched tweets: {tweets}")
            logger.info(f"Successfully fetched {len(tweets)} tweets for @{username}")
            return {"username": username, "name": user_response.data.name, "tweets": tweets}, 200

        except tweepy.TooManyRequests as e:  # Fixed syntax: removed extra ')'
            reset_time = int(e.response.headers.get('x-rate-limit-reset', time.time() + 900))
            wait_time = max(0, reset_time - int(time.time()))
            logger.warning(f"Twitter API 429: Too Many Requests. Reset in {wait_time}s. Headers: {e.response.headers}")
            return {"error": f"Twitter API rate limit exceeded. Wait {wait_time} seconds.", "wait_time": wait_time}, 429
        except tweepy.TweepyException as e:
            logger.error(f"Tweepy error fetching tweets: {str(e)}, Headers: {e.response.headers if e.response else 'N/A'}")
            return {"error": f"Tweepy error fetching tweets: {str(e)}"}, 500
        except Exception as e:
            logger.error(f"Unexpected error fetching tweets: {str(e)}")
            return {"error": f"Unexpected error fetching tweets: {str(e)}"}, 500

    def fetch_hashtag_tweets(self, hashtag, start_date=None, end_date=None, count=10):
        print(f"Fetching tweets for hashtag: #{hashtag}, start: {start_date}, end: {end_date}, count: {count}")
        can_proceed, wait_time = self.can_make_request()
        if not can_proceed:
            logger.warning(f"Local rate limit hit. Wait time: {wait_time}s")
            return {"error": f"Rate limited locally. Wait {wait_time} seconds.", "wait_time": wait_time}, 429

        try:
            query = f"#{hashtag}"
            count = min(int(count), 100) if count > 0 else 0
            tweets = []
            if count > 0:
                fetch_count = max(10, min(count, 100))
                for tweet_batch in tweepy.Paginator(
                    self.client.search_recent_tweets,
                    query=query,
                    start_time=start_date,
                    end_time=end_date,
                    max_results=fetch_count,
                    tweet_fields=["created_at"]
                ):
                    if not tweet_batch.data:
                        break
                    self.request_count += 1
                    tweets.extend([
                        {"text": tweet.text, "created_at": tweet.created_at.isoformat()}
                        for tweet in tweet_batch.data
                    ])
                    if len(tweets) >= count:
                        tweets = tweets[:count]
                        break

            if not tweets and count > 0:
                logger.info(f"No tweets found for #{hashtag} in range {start_date} to {end_date}")
                return {"tweets": [{"text": f"No tweets found for #{hashtag} in specified range", "created_at": "N/A"}]}, 200
            elif count == 0:
                logger.info(f"Count set to 0 for #{hashtag}, returning empty list")
                return {"hashtag": hashtag, "tweets": []}, 200

            print(f"Fetched hashtag tweets: {tweets}")
            logger.info(f"Successfully fetched {len(tweets)} tweets for #{hashtag}")
            return {"hashtag": hashtag, "tweets": tweets}, 200

        except tweepy.TooManyRequests as e:  # Fixed syntax: removed extra ')'
            reset_time = int(e.response.headers.get('x-rate-limit-reset', time.time() + 900))
            wait_time = max(0, reset_time - int(time.time()))
            logger.warning(f"Twitter API 429: Too Many Requests. Reset in {wait_time}s. Headers: {e.response.headers}")
            return {"error": f"Twitter API rate limit exceeded. Wait {wait_time} seconds.", "wait_time": wait_time}, 429
        except tweepy.TweepyException as e:
            logger.error(f"Tweepy error fetching hashtag tweets: {str(e)}, Headers: {e.response.headers if e.response else 'N/A'}")
            return {"error": f"Tweepy error fetching hashtag tweets: {str(e)}"}, 500
        except Exception as e:
            logger.error(f"Unexpected error fetching hashtag tweets: {str(e)}")
            return {"error": f"Unexpected error fetching hashtag tweets: {str(e)}"}, 500

try:
    twitter_scraper = TwitterScraper(TWITTER_BEARER_TOKEN)
except Exception as e:
    print(f"Failed to initialize TwitterScraper: {str(e)}")
    raise

@twitter_bp.route('/tweets/<username>', methods=['GET'])
def get_tweets(username):
    count = request.args.get('count', default=5, type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    result, status_code = twitter_scraper.fetch_tweets(username, start_date, end_date, count)
    return jsonify(result), status_code

@twitter_bp.route('/hashtag/<hashtag>', methods=['GET'])
def get_hashtag_tweets(hashtag):
    count = request.args.get('count', default=10, type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    result, status_code = twitter_scraper.fetch_hashtag_tweets(hashtag, start_date, end_date, count)
    return jsonify(result), status_code

@twitter_bp.route('/analyze', methods=['POST'])
def analyze_tweet():
    data = request.get_json()
    tweet = data.get('tweet')
    if not tweet:
        return jsonify({"error": "No tweet provided"}), 400
    try:
        analysis = TextBlob(tweet)
        sentiment = "positive" if analysis.sentiment.polarity > 0 else "negative" if analysis.sentiment.polarity < 0 else "neutral"
        logger.info(f"Analyzed tweet: '{tweet}' -> Sentiment: {sentiment}")
        return jsonify({"sentiment": sentiment}), 200
    except Exception as e:
        logger.error(f"Error analyzing tweet: {str(e)}")
        return jsonify({"error": f"Error analyzing tweet: {str(e)}"}), 500