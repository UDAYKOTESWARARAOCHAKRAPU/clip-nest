import React from 'react';
import { motion } from 'framer-motion';
import '../Css/Footer.css';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      y: 20, 
      transition: { 
        duration: 0.5, 
        ease: "easeIn"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5 }
    },
    hover: { 
      scale: 1.1, 
      color: "#d6249f",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.footer
      className="footer"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className="footer-content" variants={itemVariants}>
        <p>© 2025 ClipNest. All rights reserved.</p>
        <div className="footer-links">
          <motion.a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            variants={itemVariants}
            whileHover="hover"
          >
            Twitter
          </motion.a>
          <motion.a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            variants={itemVariants}
            whileHover="hover"
          >
            Instagram
          </motion.a>
          <motion.a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            variants={itemVariants}
            whileHover="hover"
          >
            Facebook
          </motion.a>
        </div>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;