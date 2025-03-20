import React, { useState } from 'react';
import axios from '../axios'; // Adjust if axios.js is elsewhere
import { useNavigate } from 'react-router-dom';

const Hashtag = () => {
  const [hashtag, setHashtag] = useState('');
  const [count, setCount] = useState(10);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.get(`/sentiment/hashtag/${hashtag}`, {
        params: { count },
      });
      navigate('/hashtag-result', { state: { data: response.data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch hashtag tweets');
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
            min="1"
            max="100"
            className="w-full p-2 border rounded"
            required
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