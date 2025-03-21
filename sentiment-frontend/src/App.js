import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Twitter from './components/Twitter';
import Result from './components/Result';
import AuthProvider from './components/AuthProvider';
import TrendingHashtags from './components/TrendingHashtags';
import HashtagResult from './components/HashtagResult';
import Hashtag from './components/Hashtag';


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/twitter" element={<Twitter />} />
          <Route path="/result" element={<Result />} />
          <Route path="/hashtags" element={<TrendingHashtags />} />
          <Route path="/hashtag" element={<Hashtag />} /> {/* New route */}
          <Route path="/hashtag-result" element={<HashtagResult />} /> {/* New route */}
        </Routes>
      </Router>
      <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
    </AuthProvider>
  );
};

export default App;