import React from "react";

// Tailwind color mapping
const colorMap = {
  "stroke-green-500": "#22c55e",
  "stroke-red-500": "#ef4444",
  "stroke-orange-400": "#fb923c",
};

const CircularProgress = ({ percentage = 0, color }) => {
  const radius = 36;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Use mapped color or fallback to green
  const strokeColor = colorMap[color] || "#22c55e";

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={strokeColor}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x={radius}
        y={radius}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="1em"
        fontWeight="bold"
        fill={strokeColor}
      >
        {percentage}%
      </text>
    </svg>
  );
};

export default CircularProgress;

