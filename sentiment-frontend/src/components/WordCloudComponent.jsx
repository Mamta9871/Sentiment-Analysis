import React from 'react';
import ReactWordcloud from 'react-wordcloud';

const WordCloudComponent = ({ words }) => {
  // Configure options for the word cloud
  const options = {
    rotations: 2,
    rotationAngles: [-90, 0],
    fontSizes: [20, 60],
    padding: 1,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Word Cloud of Most Used Words</h3>
      <ReactWordcloud words={words} options={options} />
    </div>
  );
};

export default WordCloudComponent;
