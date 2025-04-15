// pages/_app.js

// Import React and its hooks
import React, { useState, useEffect } from 'react';

// Import Slick Carousel styles for carousels
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
// Import Bootstrap and custom global styles
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';

// Import ModalProvider for global modal functionality
import { ModalProvider } from '../components/GlobalModal';

// MyApp component acts as the main wrapper for all pages in the Next.js app.
function MyApp({ Component, pageProps }) {
  // State for toggling dark mode across the application.
  const [darkMode, setDarkMode] = useState(false);
  // Function to toggle dark mode on and off.
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // useEffect to add or remove a 'dark-mode' class to the document body
  // based on the darkMode state.
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    // Provide global modal state by wrapping the app with ModalProvider.
    <ModalProvider>
      {/* Pass darkMode and toggleDarkMode as props to every page component */}
      <Component {...pageProps} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </ModalProvider>
  );
}

export default MyApp;
