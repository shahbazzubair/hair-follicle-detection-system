import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import logoImg from '../../assets/logo.jpg';
import styles from './Navbar.module.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme, isDarkMode } = useTheme();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        
        <Link to="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
          <img src={logoImg} alt="HFD AI Logo" className={styles.logoImg} />
          <span>HFD<span>AI</span></span>
        </Link>

        {/* Right Section / Nav Links & Actions */}
        <div className={`${styles.rightSection} ${isMenuOpen ? styles.showMenu : ''}`}>
          <div className={styles.authButtons}>
            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={styles.themeToggleBtn}
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle dark mode"
            >
              <span className={styles.themeIcon}>{isDarkMode ? "☀️" : "🌙"}</span>
              <span className={styles.themeLabel}>{isDarkMode ? "Light" : "Dark"}</span>
            </button>

            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className={location.pathname === "/login" ? styles.activeBtn : styles.inactiveBtn}
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setIsMenuOpen(false)}
              className={location.pathname === "/signup" ? styles.activeBtn : styles.inactiveBtn}
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className={styles.menuIcon} onClick={toggleMenu}>
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar1 : ''}`}></div>
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar2 : ''}`}></div>
          <div className={`${styles.bar} ${isMenuOpen ? styles.bar3 : ''}`}></div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;