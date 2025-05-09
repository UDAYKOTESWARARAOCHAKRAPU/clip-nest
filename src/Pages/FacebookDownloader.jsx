import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import '../Css/FacebookDownloader.css';

const FacebookDownloader = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const validateUrl = (url) => {
    const facebookPostRegex = /https:\/\/(www\.)?facebook\.com\/.*(posts|videos)\/\d+/;
    return facebookPostRegex.test(url);
  };

  const handleSearch = async () => {
    if (!url || !validateUrl(url)) {
      alert('Please enter a valid Facebook video URL (e.g., https://www.facebook.com/username/posts/123456789)');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/facebook/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch metadata');
      }

      const data = await response.json();
      setContentData(data);
    } catch (error) {
      alert(`Error fetching metadata: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!contentData || !contentData.download_url) {
      alert('No content data available to download');
      return;
    }
    setIsDownloading(true);
    try {
      const response = await fetch(`http://localhost:5000${contentData.download_url}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download content');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'facebook_video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Download completed: Facebook Video');
    } catch (error) {
      alert(`Error downloading content: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
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
            placeholder="Enter Facebook video URL (e.g., https://facebook.com/username/posts/123456789)"
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

        {contentData && (
          <motion.div 
            className="content-info"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            {contentData.thumbnail && (
              <img 
                src={contentData.thumbnail} 
                alt="Video Thumbnail" 
                className="content-thumbnail"
              />
            )}
            <h3 className="content-title">{contentData.type}</h3>
            <p className="content-description">{contentData.description}</p>
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
                'Download Video'
              )}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FacebookDownloader;