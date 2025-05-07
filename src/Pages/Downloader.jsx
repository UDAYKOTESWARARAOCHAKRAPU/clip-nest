import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../Css/Downloader.css';

const Downloader = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    if (!url) {
      alert('Please enter a valid URL');
      return;
    }
    setIsLoading(true);
    // Simulate a download process (replace with actual API call in production)
    setTimeout(() => {
      setIsLoading(false);
      alert('Download initiated for: ' + url);
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
      boxShadow: "0 0 15px rgba(0, 188, 212, 0.5)", 
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="downloader-wrapper">
      <motion.header 
        className="header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.img 
          src="/logo.svg" 
          alt="ClipNest Logo" 
          className="logo"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        />
        <h1>ClipNest Downloader</h1>
      </motion.header>

      <motion.div 
        className="downloader-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="downloader-title" 
          variants={itemVariants}
        >
          Download Your Media
        </motion.h1>
        <motion.p 
          className="downloader-subtitle" 
          variants={itemVariants}
        >
          Paste the URL of the video or media you want to download below:
        </motion.p>

        <motion.div 
          className="input-container"
          variants={itemVariants}
        >
          <input
            type="text"
            className="url-input"
            placeholder="Enter URL (e.g., https://youtube.com/watch?v=example)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <motion.button
            className="download-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleDownload}
            disabled={isLoading}
          >
            {isLoading ? (
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
      </motion.div>

      <motion.footer 
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p>© 2025 ClipNest. All rights reserved.</p>
      </motion.footer>
    </div>
  );
};

export default Downloader;