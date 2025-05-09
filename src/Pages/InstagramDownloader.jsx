import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InstagramIcon from '@mui/icons-material/Instagram';
import '../Css/InstagramDownloader.css';

const InstagramDownloader = () => {
  const [url, setUrl] = useState('');
  const [contentType, setContentType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('720p');

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const handleContentTypeSelect = (type) => {
    setContentType(type);
    setIsModalOpen(false);
  };

  const validateUrl = (url) => {
    const instagramPostRegex = /https:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+/;
    return instagramPostRegex.test(url);
  };

  const handleSearch = async () => {
    if (!url || !validateUrl(url)) {
      alert('Please enter a valid Instagram post or reel URL (e.g., https://www.instagram.com/p/shortcode/)');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/instagram/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, contentType }),
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
      const downloadUrl = contentType === 'Reel' 
        ? `${contentData.download_url}?quality=${selectedQuality}` 
        : contentData.download_url;

      const response = await fetch(`http://localhost:5000${downloadUrl}`, {
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
      link.download = contentType === 'Reel' 
        ? `reel_${selectedQuality}.mp4` 
        : 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`Download completed: ${contentData.type}${contentType === 'Reel' ? ` (${selectedQuality})` : ''}`);
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
      boxShadow: "0 0 15px rgba(214, 36, 159, 0.5)", 
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="instagram-downloader-wrapper">
      <motion.div 
        className="instagram-downloader-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="title-container" variants={itemVariants}>
          <InstagramIcon fontSize="large" className="instagram-icon" />
          <h1 className="instagram-downloader-title">
            Instagram Downloader
          </h1>
        </motion.div>
        <motion.p 
          className="instagram-downloader-subtitle" 
          variants={itemVariants}
        >
          Paste the Instagram post/reel URL below to search:
        </motion.p>

        <motion.div 
          className="input-container"
          variants={itemVariants}
        >
          <input
            type="text"
            className="url-input"
            placeholder="Enter Instagram URL (e.g., https://instagram.com/p/example)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading || !contentType}
          />
          {contentType && (
            <p className="content-type-confirmation">
              You are downloading a {contentType}
            </p>
          )}
          <motion.button
            className="search-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleSearch}
            disabled={isLoading || !contentType}
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
            <img 
              src={contentData.thumbnail} 
              alt={`${contentData.type} Thumbnail`} 
              className="content-thumbnail"
            />
            <h3 className="content-title">{contentData.type}</h3>
            {contentData.duration && <p className="content-duration">Duration: {contentData.duration}</p>}
            <p className="content-description">{contentData.description}</p>
            {contentData.qualities && (
              <div className="quality-selector">
                <label htmlFor="quality">Select Quality: </label>
                <select
                  id="quality"
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                  disabled={isDownloading}
                >
                  {contentData.qualities.map((quality) => (
                    <option key={quality} value={quality}>
                      {quality}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                `Download ${contentData.type}`
              )}
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {isModalOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="modal-content"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h2>Select Content Type</h2>
            <p>Please choose what you want to download from Instagram:</p>
            <div className="modal-buttons">
              <motion.button
                className="modal-button"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleContentTypeSelect('Photo')}
              >
                Photo
              </motion.button>
              <motion.button
                className="modal-button"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleContentTypeSelect('Reel')}
              >
                Reel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InstagramDownloader;