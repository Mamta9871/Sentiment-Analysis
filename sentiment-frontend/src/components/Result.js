import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { AuthContext } from './AuthProvider';

const Result = () => {
  const { state } = useLocation();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const tweets = state?.tweets || null;
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Track saving state
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false); // Track save success

  useEffect(() => {
    if (!loading && (!user || !user.token)) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleAnalysis = async () => {
    if (!tweets || analysisResults.length > 0) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const results = await Promise.all(
        tweets.tweets.map(async (tweet) => {
          const res = await axios.post('/sentiment/analyze', { tweet: tweet.text });
          return {
            text: tweet.text,
            sentiment: res.data.sentiment,
            created_at: tweet.created_at
          };
        })
      );
      setAnalysisResults(results);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to analyze tweets.';
      setError(errorMsg);
      console.error('Analysis Error:', errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!analysisResults.length) return;

    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const res = await axios.post('/sentiment/save-analyzed-tweets', {
        username: tweets.username,
        name: tweets.name,
        tweets: analysisResults
      });
      console.log('Save Response:', res.data);
      setSaveSuccess(true);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save tweets to database.';
      setError(errorMsg);
      console.error('Save Error:', errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!tweets) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">No Results</h1>
          <p className="text-gray-600">No tweets were fetched. Please try again from the Twitter page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Twitter Posts for @{tweets.username} {analysisResults.length > 0 ? '(Analyzed)' : ''}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p><strong>Name:</strong> {tweets.name}</p>
          <button
            onClick={handleAnalysis}
            className="mt-4 bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition disabled:bg-gray-400"
            disabled={isAnalyzing || analysisResults.length > 0}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Tweets'}
          </button>
          {analysisResults.length > 0 && (
            <button
              onClick={handleSaveToDatabase}
              className="mt-4 ml-4 bg-green-600 text-white p-2 rounded hover:bg-green-700 transition disabled:bg-gray-400"
              disabled={isSaving || saveSuccess}
            >
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save to Database'}
            </button>
          )}
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {saveSuccess && <p className="text-green-500 mt-4">Tweets saved to database successfully!</p>}
          <ul className="space-y-4 mt-4">
            {(analysisResults.length > 0 ? analysisResults : tweets.tweets).map((item, index) => (
              <li key={index} className="border-b pb-2">
                <p><strong>Tweet:</strong> {item.text}</p>
                {analysisResults.length > 0 && (
                  <p><strong>Sentiment:</strong> {item.sentiment}</p>
                )}
                <p className="text-sm text-gray-600">
                  Posted: {item.created_at === "Unknown" ? "Unknown" : new Date(item.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Result;