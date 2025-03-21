import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const Twitter = () => {
  const [username, setUsername] = useState('');
  const [count, setCount] = useState(5);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [waitTime, setWaitTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (waitTime > 0) {
      const timer = setInterval(() => {
        setWaitTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [waitTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (waitTime > 0) return;
    setError('');
    try {
      const response = await axios.get(`/sentiment/tweets/${username}`, {
        params: { count, start_date: startDate, end_date: endDate },
      });
      console.log('Twitter.js response:', JSON.stringify(response.data, null, 2));
      navigate('/result', { state: { data: response.data } });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch tweets';
      const wait = err.response?.data?.wait_time || 0;
      setError(wait ? `${errorMsg} Retry in ${wait} seconds.` : errorMsg);
      setWaitTime(wait);
      console.error('Error details:', err.response?.data);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">User Tweet Retrieval</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Username (without @)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., elonmusk"
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
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={waitTime > 0}
        >
          {waitTime > 0 ? `Waiting (${waitTime}s)` : 'Retrieve Tweets'}
        </button>
      </form>
    </div>
  );
};

export default Twitter;