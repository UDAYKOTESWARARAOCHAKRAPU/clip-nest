import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import YouTudeDownloder from './Pages/YouTudeDownloader';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import './App.css';
import FacebookDownloader from './Pages/FacebookDownloader';
import InstagramDownloader from './Pages/InstagramDownloader';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <div className="particle-layer">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/youtube" element={<YouTudeDownloder />} />
          <Route path="/facebook" element={<FacebookDownloader />} />
          <Route path="/instagram" element={<InstagramDownloader />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;