import React from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * SentimentGeolocationMap Component
 *
 * @param {Array} data - Array of sentiment data objects with the shape:
 *   { lat: number, lng: number, sentiment: 'positive' | 'negative' | 'neutral', score: number }
 */
const SentimentGeolocationMap = ({ data }) => {
  // Helper: Choose a color based on sentiment type.
  const getColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'green';
      case 'negative':
        return 'red';
      case 'neutral':
        return 'orange';
      default:
        return 'blue';
    }
  };

  // Set a default center (if no data is provided, center over the Atlantic)
  const center = data && data.length > 0 ? [data[0].lat, data[0].lng] : [20, 0];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Sentiment Geolocation Map</h3>
      <MapContainer center={center} zoom={2} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((point, index) => (
          <Circle
            key={index}
            center={[point.lat, point.lng]}
            // Scale radius by score; adjust multiplier as needed.
            radius={point.score * 1000}
            pathOptions={{
              color: getColor(point.sentiment),
              fillColor: getColor(point.sentiment),
              fillOpacity: 0.5,
            }}
          >
            <Popup>
              <div>
                <strong>Sentiment:</strong> {point.sentiment} <br />
                <strong>Score:</strong> {point.score}
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
};

export default SentimentGeolocationMap;
