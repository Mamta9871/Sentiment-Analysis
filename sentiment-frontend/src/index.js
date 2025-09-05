import React from 'react';
import ReactDOM from 'react-dom/client'; // <-- change here
import './index.css';
import App from './App';
import AuthProvider from './components/AuthProvider';
import 'leaflet/dist/leaflet.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);