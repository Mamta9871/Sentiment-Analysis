// CircularProgress.jsx (or place this in the same file under Dashboard)

import React from 'react';

/**
 * A simple circular progress bar.
 *
 * @param {number} percentage - The percentage value to fill (0 to 100).
 * @param {string} color      - Tailwind color classes (e.g., 'text-green-500').
 */
const CircularProgress = ({ percentage, color }) => {
  // The radius of the circle
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  // Calculate the stroke offset based on the percentage
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {/* SVG is rotated so the progress starts from the top instead of the right */}
      <svg
        className="transform -rotate-90"
        width={80}
        height={80}
        viewBox="0 0 80 80"
      >
        {/* Background circle (gray track) */}
        <circle
          className="text-gray-300"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={40}
          cy={40}
        />
        {/* Progress circle (color fill) */}
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

      {/* Centered text showing the percentage */}
      <span className="absolute text-sm font-bold">
        {percentage}%
      </span>
    </div>
  );
};

export default CircularProgress;
