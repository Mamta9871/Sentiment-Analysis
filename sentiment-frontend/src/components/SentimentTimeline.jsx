import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SentimentTimeline = () => {
  const [filter, setFilter] = useState('1hr');
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    let labels = [];
    let positiveData = [];
    let negativeData = [];
    let neutralData = [];
    let points = 0;

    switch (filter) {
      case '1hr':
        points = 6; // e.g., data point every 10 minutes
        break;
      case '6hr':
        points = 12; // e.g., data point every 30 minutes
        break;
      case '12hr':
        points = 12; // e.g., hourly
        break;
      case '24hr':
        points = 24; // hourly
        break;
      case '1 month':
        points = 30; // daily
        break;
      case '1 year':
        points = 12; // monthly
        break;
      default:
        points = 6;
    }

    for (let i = 0; i < points; i++) {
      labels.push(`${filter} - ${i + 1}`);
      positiveData.push(Math.floor(Math.random() * 20));
      negativeData.push(Math.floor(Math.random() * 20));
      neutralData.push(Math.floor(Math.random() * 20));
    }

    setChartData({
      labels,
      datasets: [
        {
          label: 'Positive',
          data: positiveData,
          borderColor: 'green',
          backgroundColor: 'rgba(0, 128, 0, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Negative',
          data: negativeData,
          borderColor: 'red',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Neutral',
          data: neutralData,
          borderColor: 'orange',
          backgroundColor: 'rgba(255, 165, 0, 0.1)',
          tension: 0.4,
        },
      ],
    });
  }, [filter]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Timeline Graph</h3>
      <div className="flex gap-2 mb-4">
        {['1hr', '6hr', '12hr', '24hr', '1 month', '1 year'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full border transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-blue-600 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {chartData && chartData.labels ? (
        <div className="h-64">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom' },
                title: { display: false },
              },
              scales: {
                x: {
                  title: { display: true, text: 'Time' },
                },
                y: {
                  title: { display: true, text: 'Sentiment Count' },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default SentimentTimeline;
