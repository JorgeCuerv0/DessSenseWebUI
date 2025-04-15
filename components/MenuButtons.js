import React from 'react';
// Import specific icons from the react-icons library.
import { 
  AiFillHeart, 
  AiOutlineAppstore, 
  AiOutlineTags, 
  AiOutlineBgColors, 
  AiOutlineShopping, 
  AiOutlinePlusCircle
} from 'react-icons/ai';

// MenuButtons component renders filter buttons and an upload button.
// It receives various props from a parent component to manage filter states and actions.
const MenuButtons = ({
  favoritesFilter,           // Boolean to indicate if favorites filter is active
  handleFavoritesFilterToggle, // Function to toggle the favorites filter state
  activeFilters,             // Object containing active states for various filters (category, type, etc.)
  onToggleFilter,            // Function to toggle specific filters by key (e.g., 'category', 'type')
  onUploadClick              // Function to handle the upload pieces action
}) => {
  // Define colors used for highlighting filters when active.
  const filterColors = {
    category: 'blue',
    type: 'purple',
    color: 'orange',
    brand: 'pink',
  };

  // Define a common inline style for all buttons to keep a consistent look.
  const buttonStyle = {
    fontSize: '14px',     // Use slightly smaller text
    padding: '4px 8px',   // Set button padding
    display: 'flex',      // Use flexbox to align icon and text together
    alignItems: 'center', // Center items vertically
    gap: '4px'            // Space between the icon and the text
  };

  return (
    // Container div for all filter buttons and the upload button.
    <div
      className="filtersContainer"
      style={{
        display: 'flex',         // Arrange buttons in a row
        flexWrap: 'wrap',        // Allow wrapping if there is not enough horizontal space
        justifyContent: 'center',// Center the buttons horizontally
        alignItems: 'center',    // Center the buttons vertically
        gap: '10px',             // Uniform spacing between buttons
        marginTop: '20px'        // Space from the top of the container
      }}
    >
      {/* Favorites Button */}
      <button
        className="filterButton"
        onClick={handleFavoritesFilterToggle} // Toggle favorites filter state when clicked
        style={buttonStyle}                    // Apply common button styles
      >
        <AiFillHeart 
          className="iconStyle"
          style={{
            // Change icon color based on whether the favorites filter is active.
            color: favoritesFilter ? 'red' : '#555',
            fontSize: '16px'
          }}
        />
        Favorites
      </button>

      {/* Category Filter Button */}
      <button
        className={`filterButton ${activeFilters.category ? 'active' : ''}`}
        onClick={() => onToggleFilter('category')} // Toggle the category filter when clicked
        style={buttonStyle}
      >
        <AiOutlineAppstore
          className="iconStyle"
          style={{
            // Apply designated color if the category filter is active; otherwise, use a neutral color.
            color: activeFilters.category ? filterColors.category : '#555',
            fontSize: '16px'
          }}
        />
        Category
      </button>

      {/* Type Filter Button */}
      <button
        className={`filterButton ${activeFilters.type ? 'active' : ''}`}
        onClick={() => onToggleFilter('type')} // Toggle the type filter when clicked
        style={buttonStyle}
      >
        <AiOutlineTags
          className="iconStyle"
          style={{
            color: activeFilters.type ? filterColors.type : '#555',
            fontSize: '16px'
          }}
        />
        Type
      </button>

      {/* Color Filter Button */}
      <button
        className={`filterButton ${activeFilters.color ? 'active' : ''}`}
        onClick={() => onToggleFilter('color')} // Toggle the color filter when clicked
        style={buttonStyle}
      >
        <AiOutlineBgColors
          className="iconStyle"
          style={{
            color: activeFilters.color ? filterColors.color : '#555',
            fontSize: '16px'
          }}
        />
        Color
      </button>

      {/* Brand Filter Button */}
      <button
        className={`filterButton ${activeFilters.brand ? 'active' : ''}`}
        onClick={() => onToggleFilter('brand')} // Toggle the brand filter when clicked
        style={buttonStyle}
      >
        <AiOutlineShopping
          className="iconStyle"
          style={{
            color: activeFilters.brand ? filterColors.brand : '#555',
            fontSize: '16px'
          }}
        />
        Brand
      </button>

      {/* Upload Pieces Button */}
      <button
        className="uploadButton"
        onClick={onUploadClick} // Execute the upload action when clicked
        style={buttonStyle}
      >
        <AiOutlinePlusCircle style={{ fontSize: '16px' }} />
        Upload pieces
      </button>
    </div>
  );
};

// Export the MenuButtons component for use in other parts of the application.
export default MenuButtons;
