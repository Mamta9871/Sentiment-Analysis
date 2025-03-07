import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import axios from '../axios';
import { AuthContext } from './AuthProvider';

const Dashboard = () => {
  const [tweet, setTweet] = useState('');       // Tweet input state
  const [result, setResult] = useState(null);   // Sentiment result state
  const [error, setError] = useState('');       // Error state
  const { user } = useContext(AuthContext);     // User from context

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const res = await axios.post('/sentiment/analyze', { tweet }, {
        headers: { Authorization: `Bearer ${user?.token}` }, // Send token
      });
      setResult(res.data); // Set result
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Ensure Flask API is running.'); // Show error
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Sentiment Analysis Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label htmlFor="tweet" className="block text-gray-700">Tweet</label>
              <textarea
                id="tweet"
                value={tweet}
                onChange={(e) => setTweet(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="4"
                placeholder="Enter a tweet to analyze..."
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition"
            >
              Analyze Sentiment
            </button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>} 
          {result && (
            <div className="mt-6 bg-gray-50 p-5 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Analysis Result</h2>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-gray-700 font-medium">Sentiment:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    result.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                    result.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {result.sentiment}
                </span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <p className="text-gray-700"><strong>Original Tweet:</strong> {result.original_tweet}</p>
                <p className="text-gray-700 mt-2"><strong>Cleaned Tweet:</strong> {result.cleaned_tweet}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; // Export Dashboard component