import React from 'react';

/**
 * A simple circular progress bar.
 *
 * @param {number} percentage - The percentage value to fill (0 to 100). Defaults to 0.
 * @param {string} color      - Tailwind color classes (e.g., 'text-green-500').
 */
const CircularProgress = ({ percentage = 0, color }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((percentage || 0) / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={80}
        height={80}
        viewBox="0 0 80 80"
      >
        {/* Background Circle */}
        <circle
          className="text-gray-300"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={40}
          cy={40}
        />
        {/* Progress Circle */}
        <circle
          className={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={40}
          cy={40}
        />
      </svg>

      {/* Percentage Text - Ensure Visibility */}
      <span className="absolute text-sm font-bold text-gray-900 bg-white px-1 py-3 rounded">
        {percentage ?? 0}%
      </span>
    </div>
  );
};

export default CircularProgress;
