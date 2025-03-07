import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthProvider';

const Sidebar = () => {
  const { logout } = useContext(AuthContext); // Logout from context
  const navigate = useNavigate();             // Navigation hook

  const handleLogout = () => {
    logout(); // Clear user token
    navigate('/login'); // Redirect to login
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col fixed">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        Sentiment Analysis
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/dashboard" className="block p-2 rounded hover:bg-gray-700">Dashboard</Link>
        <Link to="/Twitter" className="block p-2 rounded hover:bg-gray-700">Twitter</Link>
        <Link to="#" className="block p-2 rounded hover:bg-gray-700">Profile</Link>
        <Link to="#" className="block p-2 rounded hover:bg-gray-700">Settings</Link>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar; // Export Sidebar component