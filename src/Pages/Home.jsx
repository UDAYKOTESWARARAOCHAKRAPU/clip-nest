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
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <motion.div 
      className="home-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="home-title" variants={itemVariants}>Welcome to <span>ClipNest</span></motion.h1>
      <motion.p className="home-subtitle" variants={itemVariants}>Choose a platform to download your favorite content:</motion.p>
      
      <motion.div className="card-container" variants={itemVariants}>
        <motion.div 
          className="card youtube"
          whileHover={{ scale: 1.05 }}
          onClick={() => handleNavigation('youtube')}
        >
          <YouTubeIcon fontSize="large" />
          <h3>YouTube</h3>
        </motion.div>

        <motion.div 
          className="card facebook"
          whileHover={{ scale: 1.05 }}
          onClick={() => handleNavigation('facebook')}
        >
          <FacebookIcon fontSize="large" />
          <h3>Facebook</h3>
        </motion.div>

        <motion.div 
          className="card instagram"
          whileHover={{ scale: 1.05 }}
          onClick={() => handleNavigation('instagram')}
        >
          <InstagramIcon fontSize="large" />
          <h3>Instagram</h3>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
