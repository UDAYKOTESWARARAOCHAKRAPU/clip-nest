import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../Css/Navbar.css';
import logo from '../Images/logo.png';

const Navbar = () => {
  return (
    <motion.header 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Link to="/">
        <motion.img 
          src={logo} 
          alt="ClipNest Logo" 
          className="logo"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        />
      </Link>
      <Link to="/">
        <h1>ClipNest</h1>
      </Link>
    </motion.header>
  );
};

export default Navbar;