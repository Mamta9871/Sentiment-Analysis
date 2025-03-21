import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const Hashtag = () => {
  const [hashtag, setHashtag] = useState('');
  const [count, setCount] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.get(`/sentiment/hashtag/${hashtag}`, {
        params: { count, start_date: startDate, end_date: endDate },
      });
      navigate('/hashtag-result', { state: { data: response.data } });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch hashtag tweets';
      setError(errorMsg);
      console.error('Error details:', err.response?.data);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Hashtag Tweet Retrieval</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Hashtag (without #)</label>
          <input
            type="text"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., AI"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Number of Tweets</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min="0"
            max="100"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Start Date (YYYY-MM-DD)</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">End Date (YYYY-MM-DD)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Retrieve Tweets
        </button>
      </form>
    </div>
  );
};

export default Hashtag;