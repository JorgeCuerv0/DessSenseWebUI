// Import React and Next.js router hook for navigation.
import React from 'react';
import { useRouter } from 'next/router';
// Import icons for dark and light mode toggles.
import { AiOutlineMoon, AiOutlineSun } from 'react-icons/ai';

// TabsHeader component receives dark mode state and toggle function as props.
const TabsHeader = ({ darkMode, toggleDarkMode }) => {
  // Get access to the router to read the current path and navigate.
  const router = useRouter();
  // Determine the current path for styling active tabs.
  const currentPath = router.pathname;
  
  // Define the navigation tabs with a label and target path.
  const tabs = [
    { label: 'Pieces', path: '/' },
    { label: 'Fits', path: '/fits' },
    { label: 'Collections', path: '/collections' },
  ];

  // Function to generate inline styles for each tab,
  // changing color and border based on active status and dark mode setting.
  const tabStyle = (isActive) => ({
    fontSize: '32px',
    cursor: 'pointer',
    margin: '0 15px',
    // If active, use white for dark mode or black for light mode; otherwise, use gray.
    color: isActive ? (darkMode ? 'white' : 'black') : '#aaa',
    // Show an underline if active.
    borderBottom: isActive ? '3px solid blue' : 'none',
    paddingBottom: '5px',
    transition: 'border-bottom 0.2s ease, color 0.2s ease',
  });

  return (
    <div
      className="tabsHeader"
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      {/* Render navigation tabs by mapping over the tabs array */}
      {tabs.map((tab) => (
        <div
          key={tab.path}
          // Navigate to the selected path when clicked.
          onClick={() => router.push(tab.path)}
          // Apply dynamic styling to indicate the active tab.
          style={tabStyle(currentPath === tab.path)}
        >
          {tab.label}
        </div>
      ))}

      {/* Dark Mode Toggle placed absolutely at the right side */}
      <div
        onClick={toggleDarkMode}
        style={{
          position: 'absolute',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
      >
        {/* Change the icon based on the current dark mode setting */}
        {darkMode ? (
          <>
            {/* If dark mode is active, show the Sun icon with a golden color */}
            <AiOutlineSun size={24} style={{ color: '#FFD700' }} />
            <span style={{ color: 'white' }}></span>
          </>
        ) : (
          <>
            {/* If light mode is active, show the Moon icon with a darker tone */}
            <AiOutlineMoon size={24} style={{ color: '#555' }} />
            <span style={{ color: 'black' }}></span>
          </>
        )}
      </div>
    </div>
  );
};

// Export the TabsHeader component for use in other parts of the app.
export default TabsHeader;
