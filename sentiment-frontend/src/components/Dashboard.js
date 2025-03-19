import React, { useState } from 'react';
import Layout from '../components/Layout';
import CircularProgress from '../components/CircularProgress';
import SentimentTimeline from '../components/SentimentTimeline';
import WordCloudComponent from '../components/WordCloudComponent';

const Dashboard = () => {
  const [tweet, setTweet] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedEntities, setSavedEntities] = useState([]);

  // Keep track of counts for each sentiment
  const [sentimentCounts, setSentimentCounts] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  });


  // Simulated sentiment analysis logic with emoji support
  const getSentiment = (text) => {
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes('good') ||
      lowerText.includes('great') ||
      lowerText.includes('happy') ||
      lowerText.includes('😊') ||
      lowerText.includes('👍')
    ) {
      return { type: 'positive', emoji: '😊👍' };
    } else if (
      lowerText.includes('bad') ||
      lowerText.includes('terrible') ||
      lowerText.includes('sad') ||
      lowerText.includes('😢') ||
      lowerText.includes('👎')
    ) {
      return { type: 'negative', emoji: '😢👎' };
    } else {
      return { type: 'neutral', emoji: '😐' };
    }
  };

  const handleAnalyze = () => {
    if (!tweet.trim()) return;

    const sentiment = getSentiment(tweet);
    setAnalysisResult({
      text: tweet,
      sentiment: sentiment.type,
      emoji: sentiment.emoji,
    });

    setRecentSearches((prev) => [...prev, tweet]);

    // Update the count for the identified sentiment
    setSentimentCounts((prev) => ({
      ...prev,
      [sentiment.type]: prev[sentiment.type] + 1,
    }));

    setTweet('');
  };

  const handleSaveEntity = () => {
    if (analysisResult) {
      setSavedEntities((prev) => [
        ...prev,
        `${analysisResult.text} (${analysisResult.sentiment} ${analysisResult.emoji})`,
      ]);
      setAnalysisResult(null);
    }
  };

  // Sentiment color mapping for the analyzed tweet box
  const sentimentColors = {
    positive: 'bg-green-50 border-green-200 text-green-800',
    negative: 'bg-red-50 border-red-200 text-red-800',
    neutral: 'bg-gray-50 border-gray-200 text-gray-800',
  };

  // Calculate total analyzed tweets
  const total =
    sentimentCounts.positive +
    sentimentCounts.negative +
    sentimentCounts.neutral;

  // If no tweets analyzed, default to 33/33/34 distribution
  const positivePerc = total === 0 ? 33 : Math.round((sentimentCounts.positive / total) * 100);
  const negativePerc = total === 0 ? 33 : Math.round((sentimentCounts.negative / total) * 100);
  const neutralPerc  = total === 0 ? 34 : Math.round((sentimentCounts.neutral / total) * 100);

  // Sample words array for the word cloud (replace with your dynamic data)
  const words = [
    { text: 'React', value: 50 },
    { text: 'JavaScript', value: 30 },
    { text: 'CSS', value: 20 },
    { text: 'Coding', value: 40 },
    { text: 'UI', value: 25 },
    { text: 'UX', value: 15 },
    { text: 'Design', value: 35 },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-800">Good Morning, Mamta!</h2>

        {/* Cards row with 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 1) Analyze Tweet Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Analyze Tweet</h3>
            <textarea
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a tweet... (try adding 😊 or 😢)"
              rows={3}
            />
            <button
              onClick={handleAnalyze}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
            >
              Analyze
            </button>
            {analysisResult && (
              <div className={`mt-3 p-3 border rounded ${sentimentColors[analysisResult.sentiment]}`}>
                <p className="mb-2 font-medium">Text: "{analysisResult.text}"</p>
                <p className="mb-2 font-medium">
                  Sentiment: <span className="capitalize">{analysisResult.sentiment}</span>{' '}
                  {analysisResult.emoji}
                </p>
                <button
                  onClick={handleSaveEntity}
                  className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 transition"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* 2) Recent Searches */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Searches</h3>
            {recentSearches.length > 0 ? (
              <ul className="list-disc ml-5 text-sm">
                {recentSearches.map((search, idx) => (
                  <li key={idx}>{search}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No recent searches yet.</p>
            )}
          </div>

          {/* 3) Saved Entities */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Saved Entities</h3>
            {savedEntities.length > 0 ? (
              <ul className="list-disc ml-5 text-sm">
                {savedEntities.map((entity, idx) => (
                  <li key={idx}>{entity}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No saved entities yet.</p>
            )}
          </div>

          {/* 4) Overall Sentiment Score */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Sentiment Score</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              {/* Positive Circle */}
              <div className="flex flex-col items-center">
                <CircularProgress percentage={positivePerc} color="stroke-green-500" />
                <span className="mt-2 text-sm font-medium text-green-700">
                  Positive
                </span>
              </div>
              {/* Negative Circle */}
              <div className="flex flex-col items-center">
                <CircularProgress percentage={negativePerc} color="stroke-red-500" />
                <span className="mt-2 text-sm font-medium text-red-700">
                  Negative
                </span>
              </div>
              {/* Neutral Circle */}
              <div className="flex flex-col items-center">
                <CircularProgress percentage={neutralPerc} color="stroke-orange-400" />
                <span className="mt-2 text-sm font-medium text-orange-600">
                  Neutral
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Timeline Graph */}
        <SentimentTimeline />

        {/* Word Cloud Component */}
        {/* <WordCloudComponent words={words} /> */}

      </div>
    </Layout>
  );
};

export default Dashboard;
