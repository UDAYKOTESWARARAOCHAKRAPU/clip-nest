import React from 'react';
import { motion } from 'framer-motion';
import '../Css/Footer.css';

const Footer = () => {
  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
    >
      <p>© 2025 ClipNest. All rights reserved.</p>
    </motion.footer>
  );
};

export default Footer;