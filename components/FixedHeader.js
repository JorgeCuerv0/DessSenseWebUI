import React from 'react';
// Import TabsHeader and MenuButtons components that will be rendered inside the fixed header.
import TabsHeader from './TabsHeader';
import MenuButtons from './MenuButtons';

// FixedHeader component provides a top-fixed header bar with navigation tabs,
// dark mode toggle, and conditional filter buttons (MenuButtons) if filtering props exist.
const FixedHeader = ({
  darkMode,                   // Boolean representing if dark mode is enabled.
  toggleDarkMode,             // Function to toggle dark mode.
  favoritesFilter,            // Boolean indicating if favorites filter is active.
  handleFavoritesFilterToggle, // Function to toggle the favorites filter.
  activeFilters,              // Object holding the active states for various filters (e.g., category, type).
  onToggleFilter,             // Function to toggle a specific filter.
  onUploadClick               // Function to handle uploading pieces.
}) => {
  // Determine if filter buttons should be displayed.
  // Filters will be shown if all the following props are defined.
  const showFilters = favoritesFilter !== undefined &&
    handleFavoritesFilterToggle &&
    activeFilters &&
    onToggleFilter;

  return (
    // The header container is fixed at the top and spans full width.
    <div
      style={{
        position: 'fixed',        // Fix position relative to the viewport.
        top: 0,                   // Align to the top.
        left: 0,                  // Full width from the left.
        right: 0,                 // Full width from the right.
        background: darkMode ? '#000' : '#fff', // Background color changes based on dark mode.
        zIndex: 10000,            // Sits above most other elements.
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)', // Adds a subtle shadow for visual separation.
        padding: '10px 20px'      // Padding inside the header.
      }}
    >
      {/* Render the TabsHeader component with dark mode and toggle functionality */}
      <TabsHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Conditionally render the MenuButtons component only if filter props are provided */}
      {showFilters && (
        <MenuButtons
          favoritesFilter={favoritesFilter}
          handleFavoritesFilterToggle={handleFavoritesFilterToggle}
          activeFilters={activeFilters}
          onToggleFilter={onToggleFilter}
          onUploadClick={onUploadClick}
        />
      )}
    </div>
  );
};

// Export the FixedHeader component so it can be imported and used in other parts of your app.
export default FixedHeader;
