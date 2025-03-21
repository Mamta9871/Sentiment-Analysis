import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { AuthContext } from './AuthProvider';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const HashtagResult = () => {
  const { state } = useLocation();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const hashtagData = state?.data || null; // Adjusted to match hashtag data structure
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sentimentSummary, setSentimentSummary] = useState(null); // New state for summary

  useEffect(() => {
    if (!loading && (!user || !user.token)) {
      navigate('/login');
    }
    if (hashtagData && hashtagData.tweets) {
      console.log('Raw hashtag tweets from state:', JSON.stringify(hashtagData.tweets, null, 2));
    }
  }, [user, loading, navigate, hashtagData]);

  const calculateSentimentSummary = (results) => {
    const total = results.length;
    if (total === 0) return { positive: 0, negative: 0, neutral: 0, total: 0 };

    const counts = results.reduce(
      (acc, tweet) => {
        acc[tweet.sentiment] = (acc[tweet.sentiment] || 0) + 1;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );

    return {
      positive: counts.positive,
      negative: counts.negative,
      neutral: counts.neutral,
      positivePct: ((counts.positive / total) * 100).toFixed(1),
      negativePct: ((counts.negative / total) * 100).toFixed(1),
      neutralPct: ((counts.neutral / total) * 100).toFixed(1),
      total,
    };
  };

  const handleAnalysis = async () => {
    if (!hashtagData || !hashtagData.tweets || analysisResults.length > 0) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const results = await Promise.all(
        hashtagData.tweets.map(async (tweet) => {
          const res = await axios.post('/sentiment/analyze', { tweet: tweet.text });
          return {
            text: tweet.text,
            sentiment: res.data.sentiment,
            created_at: tweet.created_at,
          };
        })
      );
      setAnalysisResults(results);
      setSentimentSummary(calculateSentimentSummary(results)); // Calculate summary after analysis
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to analyze tweets.';
      const waitTime = err.response?.data?.wait_time;
      setError(waitTime ? `${errorMsg} Retry in ${waitTime} seconds.` : errorMsg);
      console.error('Analysis Error:', err.response?.data);
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
      const res = await axios.post('/sentiment/save-analyzed-hashtag-tweets', {
        hashtag: hashtagData.hashtag,
        tweets: analysisResults,
      });
      console.log('Save Response:', res.data);
      setSaveSuccess(true);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save hashtag tweets to database.';
      setError(errorMsg);
      console.error('Save Error:', err.response?.data);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Analyzed Tweets for #${hashtagData.hashtag}`, 14, 10);

    if (sentimentSummary) {
      doc.text('Sentiment Summary:', 14, 20);
      doc.text(`Positive: ${sentimentSummary.positive} (${sentimentSummary.positivePct}%)`, 14, 30);
      doc.text(`Negative: ${sentimentSummary.negative} (${sentimentSummary.negativePct}%)`, 14, 40);
      doc.text(`Neutral: ${sentimentSummary.neutral} (${sentimentSummary.neutralPct}%)`, 14, 50);
      doc.text(`Total Tweets: ${sentimentSummary.total}`, 14, 60);
    }

    const tableData = (analysisResults.length > 0 ? analysisResults : hashtagData.tweets).map((item) => [
      hashtagData.hashtag,
      item.text,
      item.sentiment || 'N/A',
      item.created_at === 'N/A'
        ? 'N/A'
        : new Date(item.created_at).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }) + ' IST',
    ]);

    autoTable(doc, {
      startY: sentimentSummary ? 70 : 20,
      head: [['Hashtag', 'Text', 'Sentiment', 'Posted']],
      body: tableData,
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 80 },
        2: { cellWidth: 30 },
        3: { cellWidth: 50 },
      },
      theme: 'striped',
    });

    doc.save(`${hashtagData.hashtag}_analyzed_tweets.pdf`);
  };

  const exportToCSV = () => {
    const csvContent = [
      'Hashtag,Tweet,Sentiment,Posted',
      ...(analysisResults.length > 0 ? analysisResults : hashtagData.tweets).map((item) =>
        [
          `"${hashtagData.hashtag}"`,
          `"${item.text.replace(/"/g, '""')}"`,
          `"${item.sentiment || 'N/A'}"`,
          `"${item.created_at === 'N/A' ? 'N/A' : new Date(item.created_at).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }) + ' IST'}"`,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${hashtagData.hashtag}_analyzed_tweets.csv`;
    link.click();
  };

  if (loading) return <div>Loading...</div>;

  if (!hashtagData || !hashtagData.tweets) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">No Results</h1>
          <p className="text-gray-600">No tweets were fetched. Please try again from the hashtag page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Twitter Posts for #{hashtagData.hashtag} {analysisResults.length > 0 ? '(Analyzed)' : ''}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {sentimentSummary && (
            <div className="mt-4 flex gap-5">
              <h2 className="text-xl font-semibold text-gray-800">Sentiment Summary</h2>
              <p className="text-green-600">
                <strong> 😊 Positive:</strong> {sentimentSummary.positive} ({sentimentSummary.positivePct}%)
              </p>
              <p className="text-red-600">
                <strong> 😡 Negative:</strong> {sentimentSummary.negative} ({sentimentSummary.negativePct}%)
              </p>
              <p className="text-gray-600">
                <strong> 😐 Neutral:</strong> {sentimentSummary.neutral} ({sentimentSummary.neutralPct}%)
              </p>
              <p className="text-gray-800">
                <strong>Total Tweets:</strong> {sentimentSummary.total}
              </p>
            </div>
          )}
          <button
            onClick={handleAnalysis}
            className="mt-4 bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition disabled:bg-gray-400"
            disabled={isAnalyzing || analysisResults.length > 0}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Tweets'}
          </button>
          {analysisResults.length > 0 && (
            <>
              <button
                onClick={handleSaveToDatabase}
                className="mt-4 ml-4 bg-green-600 text-white p-2 rounded hover:bg-green-700 transition disabled:bg-gray-400"
                disabled={isSaving || saveSuccess}
              >
                {isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save to Database'}
              </button>
              <button
                onClick={exportToPDF}
                className="mt-4 ml-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
              >
                Export to PDF
              </button>
              <button
                onClick={exportToCSV}
                className="mt-4 ml-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
              >
                Export to CSV
              </button>
            </>
          )}
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {saveSuccess && <p className="text-green-500 mt-4">Tweets saved to database successfully!</p>}
          <ul className="space-y-4 mt-4">
            {(analysisResults.length > 0 ? analysisResults : hashtagData.tweets).map((item, index) => {
              const postedTime =
                item.created_at === 'N/A'
                  ? 'N/A'
                  : new Date(item.created_at).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    }) + ' IST';
              console.log(`Tweet ${index} raw created_at: ${item.created_at}, formatted: ${postedTime}`);
              return (
                <li key={index} className="border-b pb-2">
                  <p>
                    <strong>Tweet:</strong> {item.text}
                  </p>
                  {analysisResults.length > 0 && (
                    <p>
                      <strong>Sentiment:</strong> {item.sentiment}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <strong>Posted on:</strong> {postedTime}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HashtagResult;