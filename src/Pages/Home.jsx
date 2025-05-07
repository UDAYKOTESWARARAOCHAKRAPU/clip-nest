import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import '../Css/Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (platform) => {
    navigate(`/${platform}`);
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

  const glowVariants = {
    hover: { 
      scale: 1.1, 
      boxShadow: "0 0 25px rgba(255, 255, 255, 0.5)", 
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="home-wrapper">
      <motion.div 
        className="home-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="home-title" 
          variants={itemVariants}
        >
          Download Your Favorite Content with <span>ClipNest</span>
        </motion.h1>
        <motion.p 
          className="home-subtitle" 
          variants={itemVariants}
        >
          Select a platform to start downloading videos and media effortlessly!
        </motion.p>
        
        <motion.div 
          className="card-container" 
          variants={itemVariants}
        >
          <motion.div 
            className="card youtube"
            variants={glowVariants}
            whileHover="hover"
            onClick={() => handleNavigation('youtube')}
          >
            <YouTubeIcon fontSize="large" />
            <h3>YouTube</h3>
          </motion.div>

          <motion.div 
            className="card facebook"
            variants={glowVariants}
            whileHover="hover"
            onClick={() => handleNavigation('facebook')}
          >
            <FacebookIcon fontSize="large" />
            <h3>Facebook</h3>
          </motion.div>

          <motion.div 
            className="card instagram"
            variants={glowVariants}
            whileHover="hover"
            onClick={() => handleNavigation('instagram')}
          >
            <InstagramIcon fontSize="large" />
            <h3>Instagram</h3>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;