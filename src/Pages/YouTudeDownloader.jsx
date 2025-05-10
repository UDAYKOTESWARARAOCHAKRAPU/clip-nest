import React, { useState } from 'react';
import { motion } from 'framer-motion';
import YouTubeIcon from '@mui/icons-material/YouTube';
import '../Css/YouTubeDownloader.css';
import axios from 'axios';

const YouTubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('720p');

  // Utility function to format duration in MM:SS or HH:MM:SS
  const formatDuration = (seconds) => {
    if (!seconds || typeof seconds !== 'number') return 'N/A';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${minutes}:${paddedSeconds}`;
  };

  const cleanYouTubeUrl = (url) => {
    // Remove query parameters except 'v' for youtube.com/watch URLs
    const regex = /^(https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+|https:\/\/youtu\.be\/[\w-]+)/;
    const match = url.match(regex);
    if (!match) return url;
    let cleanUrl = match[0];
    if (cleanUrl.includes('youtube.com/watch')) {
      const vMatch = url.match(/v=([\w-]+)/);
      if (vMatch) {
        cleanUrl = `https://www.youtube.com/watch?v=${vMatch[1]}`;
      }
    }
    return cleanUrl;
  };

  const validateUrl = (url) => {
    const youtubeVideoRegex = /^(https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+|https:\/\/youtu\.be\/[\w-]+)/;
    return youtubeVideoRegex.test(cleanYouTubeUrl(url));
  };

  const handleSearch = async () => {
    const cleanedUrl = cleanYouTubeUrl(url);
    if (!cleanedUrl || !validateUrl(cleanedUrl)) {
      alert('Please enter a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ)');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/youtube/metadata', {
        url: cleanedUrl,
      });
      setContentData(response.data);
    } catch (error) {
      console.error('Metadata fetch error:', error.response || error);
      alert(`Error fetching metadata: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const cleanedUrl = cleanYouTubeUrl(url);
    if (!contentData || !contentData.download_url) {
      alert('No content data available to download');
      return;
    }
    setIsDownloading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/download', {
        url: cleanedUrl,
        platform: 'youtube',
        quality: selectedQuality,
      });

      const downloadUrl = `http://localhost:5000${response.data.download_url}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `youtube_video_${selectedQuality}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`Download completed: YouTube Video (${selectedQuality})`);
    } catch (error) {
      console.error('Download error:', error.response || error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Error downloading content: ${errorMessage}`);
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
        staggerChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 0 15px rgba(255, 0, 0, 0.5)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <div className="youtube-downloader-wrapper">
      <motion.div
        className="youtube-downloader-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="title-container" variants={itemVariants}>
          <YouTubeIcon fontSize="large" className="youtube-icon" />
          <h1 className="youtube-downloader-title">YouTube Downloader</h1>
        </motion.div>
        <motion.p className="youtube-downloader-subtitle" variants={itemVariants}>
          Paste the YouTube video URL below to search:
        </motion.p>

        <motion.div className="input-container" variants={itemVariants}>
          <input
            type="text"
            className="url-input"
            placeholder="Enter YouTube video URL (e.g., https://youtu.be/example or https://youtube.com/watch?v=example)"
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
            <img src={contentData.thumbnail} alt="Video Thumbnail" className="content-thumbnail" />
            <h3 className="content-title">{contentData.type}</h3>
            <p className="content-description">{contentData.description}</p>
            {contentData.duration != null && (
              <p className="content-duration">Duration: {formatDuration(contentData.duration)}</p>
            )}
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

export default YouTubeDownloader;