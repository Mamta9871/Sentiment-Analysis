import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { jsPDF } from 'jspdf'; // Base jsPDF
import autoTable from 'jspdf-autotable'; // Explicitly import autoTable

const HashtagResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = location.state || { data: { hashtag: '', tweets: [] } };
  const [analysisResults, setAnalysisResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data || !data.tweets) {
      setError('No hashtag data available.');
    }
  }, [data]);

  const handleAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.all(
        data.tweets.map(async (tweet) => {
          const res = await axios.post('/sentiment/analyze', { tweet: tweet.text });
          return { ...tweet, sentiment: res.data.sentiment };
        })
      );
      setAnalysisResults(results);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze tweets');
      console.error('Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post('/sentiment/save-analyzed-hashtag-tweets', {
        hashtag: data.hashtag,
        tweets: analysisResults.length > 0 ? analysisResults : data.tweets,
      });
      alert('Hashtag tweets saved successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save hashtag tweets');
      console.error('Save Error:', err);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tweetsToExport = analysisResults.length > 0 ? analysisResults : data.tweets;
    const tableData = tweetsToExport.map((item) => [
      item.text,
      item.sentiment || 'N/A',
      item.created_at === 'N/A' ? 'N/A' : new Date(item.created_at).toLocaleString(),
    ]);

    doc.text(`Hashtag: #${data.hashtag}`, 10, 10);
    autoTable(doc, { // Apply autoTable explicitly
      head: [['Tweet', 'Sentiment', 'Posted']],
      body: tableData,
      startY: 20,
    });
    doc.save(`hashtag_${data.hashtag}_tweets.pdf`);
  };

  const handleDownloadCSV = () => {
    const tweetsToExport = analysisResults.length > 0 ? analysisResults : data.tweets;
    const headers = ['Tweet', 'Sentiment', 'Posted'];
    const csvRows = [
      headers.join(','),
      ...tweetsToExport.map((item) =>
        [
          `"${item.text.replace(/"/g, '""')}"`,
          item.sentiment || 'N/A',
          item.created_at === 'N/A' ? 'N/A' : new Date(item.created_at).toLocaleString(),
        ].join(',')
      ),
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hashtag_${data.hashtag}_tweets.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Hashtag: #{data.hashtag}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul className="space-y-4 mt-4">
        {(analysisResults.length > 0 ? analysisResults : data.tweets).map((item, index) => (
          <li key={index} className="border-b pb-2">
            <p><strong>Tweet:</strong> {item.text}</p>
            {analysisResults.length > 0 && (
              <p><strong>Sentiment:</strong> {item.sentiment}</p>
            )}
            <p className="text-sm text-gray-600">
              Posted: {item.created_at === 'N/A' ? 'N/A' : new Date(item.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex space-x-4 flex-wrap">
        <button
          onClick={handleAnalysis}
          disabled={loading || !data.tweets.length}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400 mb-2"
        >
          {loading ? 'Analyzing...' : 'Analyze Tweets'}
        </button>
        <button
          onClick={handleSave}
          disabled={!data.tweets.length}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 mb-2"
        >
          Save Analyzed Tweets
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={!data.tweets.length}
          className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:bg-gray-400 mb-2"
        >
          Download PDF
        </button>
        <button
          onClick={handleDownloadCSV}
          disabled={!data.tweets.length}
          className="bg-teal-500 text-white p-2 rounded hover:bg-teal-600 disabled:bg-gray-400 mb-2"
        >
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default HashtagResult;