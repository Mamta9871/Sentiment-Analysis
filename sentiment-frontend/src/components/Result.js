import React from 'react';
import { FaSmile, FaMeh, FaFrown, FaBookmark, FaRegBookmark, FaTrash } from 'react-icons/fa';

const Result = ({ data, isSaved = false, onSave, onRemove }) => {
  // Determine sentiment icon and styles
  let SentimentIcon = FaMeh;
  let sentimentLabel = 'Neutral';
  let sentimentColor = 'text-gray-600';
  if (data.sentiment === 'positive') {
    SentimentIcon = FaSmile;
    sentimentLabel = 'Positive';
    sentimentColor = 'text-green-600';
  } else if (data.sentiment === 'negative') {
    SentimentIcon = FaFrown;
    sentimentLabel = 'Negative';
    sentimentColor = 'text-red-600';
  }

  return (
    <div className="bg-white shadow-sm rounded-md p-4 mb-4 flex justify-between items-start">
      {/* Result content */}
      <div>
        <p className="text-gray-800 font-medium">{data.text}</p>
      </div>
      {/* Sentiment indicator and action buttons */}
      <div className="flex items-center space-x-4">
        {/* Sentiment icon and label */}
        <div className="flex items-center space-x-1">
          <SentimentIcon className={sentimentColor} size={20} title={`${sentimentLabel} sentiment`} />
          <span className={`${sentimentColor} font-medium text-sm`}>{sentimentLabel}</span>
        </div>
        {/* Save or remove icon */}
        {onRemove ? (
          <button
            onClick={() => onRemove(data)}
            className="text-gray-600 hover:text-red-600 transition-colors"
            title="Remove"
          >
            <FaTrash size={18} />
          </button>
        ) : onSave ? (
          <button
            onClick={() => onSave(data)}
            className="text-gray-600 hover:text-blue-600 transition-colors"
            title={isSaved ? 'Saved' : 'Save'}
            disabled={isSaved}
          >
            {isSaved ? <FaBookmark size={18} /> : <FaRegBookmark size={18} />}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Result;
