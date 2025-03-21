import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SentimentTimeline = ({ sentimentCounts }) => {
  const [filter, setFilter] = useState("1hr");
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    let labels = [];
    let positiveData = [];
    let negativeData = [];
    let neutralData = [];
    let points = 6; // Default points for "1hr"

    switch (filter) {
      case "6hr":
        points = 12;
        break;
      case "12hr":
        points = 12;
        break;
      case "24hr":
        points = 24;
        break;
      case "1 month":
        points = 30;
        break;
      case "1 year":
        points = 12;
        break;
      default:
        points = 6;
    }

    for (let i = 0; i < points; i++) {
      labels.push(`${filter} - ${i + 1}`);

      // Ensure positive, negative, and neutral data update dynamically
      positiveData.push(sentimentCounts.positive ? Math.random() * sentimentCounts.positive : 0);
      negativeData.push(sentimentCounts.negative ? Math.random() * sentimentCounts.negative : 0);
      neutralData.push(sentimentCounts.neutral ? Math.random() * sentimentCounts.neutral : 0);
    }

    setChartData({
      labels,
      datasets: [
        {
          label: "Positive",
          data: positiveData,
          borderColor: "green",
          backgroundColor: "rgba(0, 128, 0, 0.3)", // Filled green area
          fill: true,
          tension: 0.4,
        },
        {
          label: "Negative",
          data: negativeData,
          borderColor: "red",
          backgroundColor: "rgba(255, 0, 0, 0.3)", // Filled red area
          fill: true,
          tension: 0.4,
        },
        {
          label: "Neutral",
          data: neutralData,
          borderColor: "orange",
          backgroundColor: "rgba(255, 165, 0, 0.3)", // Filled orange area
          fill: true,
          tension: 0.4,
        },
      ],
    });
  }, [filter, sentimentCounts]); // Update when filter or sentimentCounts change

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Timeline Graph</h3>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        {["1hr", "6hr", "12hr", "24hr", "1 month", "1 year"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full border transition ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 hover:bg-blue-600 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Line Chart */}
      {chartData && chartData.labels.length > 0 ? (
        <div className="h-64">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "bottom" },
                title: { display: false },
              },
              scales: {
                x: {
                  title: { display: true, text: "Time" },
                },
                y: {
                  title: { display: true, text: "Sentiment Count" },
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
