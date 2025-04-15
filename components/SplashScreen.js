// components/SplashScreen.js

// Import React and the necessary hooks from the React library.
import React, { useEffect, useState } from "react";
// Import styling from the SplashScreen.module.css file.
import styles from './SplashScreen.module.css';

// SplashScreen component accepts a callback prop `onFinish` which is called when the splash screen has finished its exit animation.
const SplashScreen = ({ onFinish }) => {
  // Local state to determine if the splash screen should trigger the exit animation.
  const [isExiting, setIsExiting] = useState(false);

  // useEffect hook sets timers for the duration of the splash screen and its exit animation.
  useEffect(() => {
    // Set a timer to start the exit animation after 3 seconds.
    const timer = setTimeout(() => {
      // Set isExiting to true to add the exit animation class.
      setIsExiting(true);
      // Set a timer for the duration of the exit animation (1 second).
      const exitTimer = setTimeout(() => {
        // Call the onFinish callback after the exit animation completes.
        onFinish();
      }, 1000);
      // Cleanup function to clear the exit timer if needed.
      return () => clearTimeout(exitTimer);
    }, 3000);

    // Cleanup function to clear the initial timer if the component is unmounted or updated.
    return () => clearTimeout(timer);
  }, [onFinish]); // onFinish is a dependency to ensure the effect re-runs if it ever changes.

  // Render the splash screen with conditional CSS classes to control the animations.
  return (
    // Combine the base splash style with the exit style if isExiting is true.
    <div className={`${styles.splash} ${isExiting ? styles.exit : ""}`}>
      {/* Container to center text elements */}
      <div className={styles.textContainer}>
        {/* Main title of the splash screen */}
        <h1 className={styles.title}>Dress Sense</h1>
        {/* Subtitle or motto */}
        <p className={styles.motto}>Look Sharp, Feel Smart, Be Unstoppable</p>
      </div>
    </div>
  );
};

// Export the SplashScreen component for use in other parts of the application.
export default SplashScreen;
