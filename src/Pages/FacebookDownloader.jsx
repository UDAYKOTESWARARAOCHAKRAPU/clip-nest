import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import '../Css/FacebookDownloader.css';

const FacebookDownloader = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('720p');

  const handleSearch = () => {
    if (!url || !url.includes('facebook.com')) {
      alert('Please enter a valid Facebook video URL');
      return;
    }
    setIsLoading(true);
    // Simulate fetching video metadata (replace with actual API call in production)
    setTimeout(() => {
      setIsLoading(false);
      setVideoData({
        title: "Sample Facebook Video Title",
        thumbnail: "https://via.placeholder.com/320x180.png?text=Thumbnail",
        duration: "2:30",
        qualities: ['360p', '480p', '720p', '1080p'], // Simulated quality options
        description: "This is a sample Facebook video description for demonstration purposes."
      });
    }, 2000);
  };

  const handleDownload = () => {
    if (!videoData) {
      alert('No video data available to download');
      return;
    }
    setIsLoading(true);
    // Simulate a download process (replace with actual backend API call in production)
    setTimeout(() => {
      setIsDownloading(false);
      // Simulate creating a downloadable link (for demo purposes)
      const dummyVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Placeholder video URL
      const link = document.createElement('a');
      link.href = dummyVideoUrl;
      link.download = `${videoData.title}_${selectedQuality}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`Download completed for: ${videoData.title} (${selectedQuality})`);
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 1,
        when: "beforeChildren",
        staggerChildren: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05, 
      boxShadow: "0 0 15px rgba(59, 89, 152, 0.5)", 
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="facebook-downloader-wrapper">
      <motion.div 
        className="facebook-downloader-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="title-container" variants={itemVariants}>
          <FacebookIcon fontSize="large" className="facebook-icon" />
          <h1 className="facebook-downloader-title">
            Facebook Downloader
          </h1>
        </motion.div>
        <motion.p 
          className="facebook-downloader-subtitle" 
          variants={itemVariants}
        >
          Paste the Facebook video URL below to search:
        </motion.p>

        <motion.div 
          className="input-container"
          variants={itemVariants}
        >
          <input
            type="text"
            className="url-input"
            placeholder="Enter Facebook video URL (e.g., https://facebook.com/video/example)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <motion.button
            className="search-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                className="loader"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            ) : (
              'Search'
            )}
          </motion.button>
        </motion.div>

        {videoData && (
          <motion.div 
            className="video-info"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <img 
              src={videoData.thumbnail} 
              alt="Video Thumbnail" 
              className="video-thumbnail"
            />
            <h3 className="video-title">{videoData.title}</h3>
            <p className="video-duration">Duration: {videoData.duration}</p>
            <p className="video-description">{videoData.description}</p>
            <div className="quality-selector">
              <label htmlFor="quality">Select Quality: </label>
              <select
                id="quality"
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                disabled={isDownloading}
              >
                {videoData.qualities.map((quality) => (
                  <option key={quality} value={quality}>
                    {quality}
                  </option>
                ))}
              </select>
            </div>
            <motion.button
              className="download-button"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <motion.div
                  className="loader"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              ) : (
                'Download'
              )}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FacebookDownloader;