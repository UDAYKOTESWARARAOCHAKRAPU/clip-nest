import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InstagramIcon from '@mui/icons-material/Instagram';
import '../Css/InstagramDownloader.css';

const InstagramDownloader = () => {
  const [url, setUrl] = useState('');
  const [contentType, setContentType] = useState(null); // Initially null until user selects
  const [isModalOpen, setIsModalOpen] = useState(true); // Modal opens on page load
  const [isLoading, setIsLoading] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('720p');

  // Open modal when the component mounts
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const handleContentTypeSelect = (type) => {
    setContentType(type);
    setIsModalOpen(false);
  };

  const handleSearch = () => {
    if (!url || !url.includes('instagram.com')) {
      alert('Please enter a valid Instagram URL');
      return;
    }
    setIsLoading(true);
    // Simulate fetching metadata based on content type (replace with actual API call in production)
    setTimeout(() => {
      setIsLoading(false);
      if (contentType === 'Photo') {
        setContentData({
          type: 'Photo',
          thumbnail: "https://via.placeholder.com/320x320.png?text=Instagram+Photo",
          description: "A photo from the Instagram post."
        });
      } else if (contentType === 'Reel') {
        setContentData({
          type: 'Reel',
          thumbnail: "https://via.placeholder.com/320x180.png?text=Instagram+Reel",
          duration: "0:15",
          qualities: ['360p', '480p', '720p', '1080p'],
          description: "A reel from the Instagram profile."
        });
      }
    }, 2000);
  };

  const handleDownload = () => {
    if (!contentData) {
      alert('No content data available to download');
      return;
    }
    setIsDownloading(true);
    // Simulate a download process (replace with actual backend API call in production)
    setTimeout(() => {
      setIsDownloading(false);
      // Simulate creating a downloadable link (for demo purposes)
      const dummyUrl = contentType === 'Reel' 
        ? 'https://www.w3schools.com/html/mov_bbb.mp4' 
        : 'https://via.placeholder.com/320x320.png'; // Placeholder for photos
      const link = document.createElement('a');
      link.href = dummyUrl;
      link.download = contentType === 'Reel' 
        ? `${contentData.type}_${selectedQuality}.mp4` 
        : `${contentData.type}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`Download completed: ${contentData.type}${contentType === 'Reel' ? ` (${selectedQuality})` : ''}`);
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

      {/* Modal for content type selection */}
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