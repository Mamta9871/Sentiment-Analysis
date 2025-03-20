from flask import Blueprint, request, jsonify
from flask_cors import CORS
import tweepy
import logging
import time
from textblob import TextBlob

twitter_bp = Blueprint('twitter', __name__)
CORS(twitter_bp)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)
 
# New Bearer Token hardcoded
TWITTER_BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAABysyQEAAAAALMHLg%2Bq%2BphQl9ahUwa5YbynOm8Y%3DLTWi4CMOLwdRG9UVwUAwHkauszzwkQYAQnJs9ezqERqparqcKt"
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
        print(f"Checking rate limit: Requests = {self.request_count}/{self.MAX_REQUESTS}, Elapsed = {elapsed_time:.2f}s, Can proceed = {can_proceed}")
        return can_proceed

    def fetch_tweets(self, username, count=5):
        print(f"Fetching tweets for username: {username}, count: {count}")
        if not self.can_make_request():
            wait_time = int(self.RATE_LIMIT_WINDOW - (time.time() - self.window_start_time))
            logger.warning(f"Rate limited. Wait time: {wait_time}s")
            return {"error": f"Rate limited. Please wait {wait_time} seconds before trying again."}, 429

        try:
            user_response = self.client.get_user(username=username)
            if not user_response.data:
                logger.error(f"User @{username} not found")
                return {"error": f"Twitter user @{username} not found."}, 404

            user_id = user_response.data.id
            count = max(5, min(int(count), 100))
            tweets_response = self.client.get_users_tweets(
                id=user_id,
                max_results=count,
                tweet_fields=["created_at"]
            )
            if not tweets_response.data:
                logger.info(f"No recent tweets found for @{username}")
                return {"tweets": [{"text": f"No recent tweets found for @{username}", "created_at": "N/A"}]}, 200

            self.request_count += 1
            tweets = [
                {"text": tweet.text, "created_at": tweet.created_at.isoformat()}
                for tweet in tweets_response.data
            ]
            print(f"Fetched tweets: {tweets}")
            logger.info(f"Successfully fetched {len(tweets)} tweets for @{username}")
            return {"username": username, "name": user_response.data.name, "tweets": tweets}, 200

        except tweepy.TooManyRequests:
            logger.warning("Too Many Requests (429). Wait 15 minutes.")
            self.request_count = self.MAX_REQUESTS
            return {"error": "Too Many Requests (429). Wait 15 minutes."}, 429
        except tweepy.TweepyException as e:
            logger.error(f"Tweepy error fetching tweets: {str(e)}")
            return {"error": f"Tweepy error fetching tweets: {str(e)}"}, 500
        except Exception as e:
            logger.error(f"Unexpected error fetching tweets: {str(e)}")
            return {"error": f"Unexpected error fetching tweets: {str(e)}"}, 500

    def fetch_hashtag_tweets(self, hashtag, count=10):
        print(f"Fetching tweets for hashtag: #{hashtag}, count: {count}")
        if not self.can_make_request():
            wait_time = int(self.RATE_LIMIT_WINDOW - (time.time() - self.window_start_time))
            logger.warning(f"Rate limited. Wait time: {wait_time}s")
            return {"error": f"Rate limited. Please wait {wait_time} seconds before trying again."}, 429

        try:
            query = f"#{hashtag}"
            count = max(5, min(int(count), 100))
            tweets_response = self.client.search_recent_tweets(
                query=query,
                max_results=count,
                tweet_fields=["created_at"]
            )
            if not tweets_response.data:
                logger.info(f"No recent tweets found for #{hashtag}")
                return {"tweets": [{"text": f"No recent tweets found for #{hashtag}", "created_at": "N/A"}]}, 200

            self.request_count += 1
            tweets = [
                {"text": tweet.text, "created_at": tweet.created_at.isoformat()}
                for tweet in tweets_response.data
            ]
            print(f"Fetched hashtag tweets: {tweets}")
            logger.info(f"Successfully fetched {len(tweets)} tweets for #{hashtag}")
            return {"hashtag": hashtag, "tweets": tweets}, 200

        except tweepy.TooManyRequests:
            logger.warning("Too Many Requests (429). Wait 15 minutes.")
            self.request_count = self.MAX_REQUESTS
            return {"error": "Too Many Requests (429). Wait 15 minutes."}, 429
        except tweepy.TweepyException as e:
            logger.error(f"Tweepy error fetching hashtag tweets: {str(e)}")
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
    result, status_code = twitter_scraper.fetch_tweets(username, count)
    return jsonify(result), status_code

@twitter_bp.route('/hashtag/<hashtag>', methods=['GET'])
def get_hashtag_tweets(hashtag):
    count = request.args.get('count', default=10, type=int)
    result, status_code = twitter_scraper.fetch_hashtag_tweets(hashtag, count)
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