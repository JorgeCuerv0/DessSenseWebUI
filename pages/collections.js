// Import React hooks for managing state, effects, and DOM references
import React, { useEffect, useState, useRef } from 'react';
// Import the header component for navigation tabs
import TabsHeader from '../components/TabsHeader';
// Import delete and edit icons from react-icons for user interaction
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';

export default function Collections({ darkMode, toggleDarkMode }) {
  // State to store the list of saved outfits from localStorage
  const [outfits, setOutfits] = useState([]);
  // State for tracking which outfit card is expanded to show extra details
  const [expandedOutfitId, setExpandedOutfitId] = useState(null);
  // State for tracking which outfit's title is currently being edited
  const [editingTitleId, setEditingTitleId] = useState(null);
  // Temporary state to hold the new title while editing
  const [tempTitle, setTempTitle] = useState('');
  // State to manage which image is active (clicked) within an expanded outfit
  const [activeImage, setActiveImage] = useState(null);
  // Ref for the main container to detect clicks outside it
  const containerRef = useRef(null);

  // On component mount, retrieve saved outfits from localStorage, sort them by creation date, and update state.
  useEffect(() => {
    const stored = localStorage.getItem('savedOutfits');
    // If outfits are found, parse them; otherwise, use an empty array.
    const parsed = stored ? JSON.parse(stored) : [];
    // Sort outfits from the most recent to oldest
    parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOutfits(parsed);
  }, []);

  // Helper function to update localStorage and state when outfits are changed.
  const saveToLocal = (updated) => {
    localStorage.setItem('savedOutfits', JSON.stringify(updated));
    setOutfits(updated);
  };

  // Handle deletion of an outfit by filtering it out and saving the result.
  const handleDelete = (id) => {
    const updated = outfits.filter((o) => o.id !== id);
    saveToLocal(updated);
  };

  // Toggle expansion of an outfit card to show/hide its details.
  const toggleExpand = (id) => {
    setExpandedOutfitId((prev) => (prev === id ? null : id));
    // Reset editing state and active image when toggling expansion.
    setEditingTitleId(null);
    setActiveImage(null);
  };

  // Start editing the title of an outfit: set the editing state and temporary title.
  const startEditingTitle = (id, currentTitle) => {
    setEditingTitleId(id);
    setTempTitle(currentTitle);
  };

  // Save the edited title and update the corresponding outfit.
  const saveTitle = (id) => {
    const updated = outfits.map((o) =>
      o.id === id ? { ...o, title: tempTitle || o.title } : o
    );
    saveToLocal(updated);
    setEditingTitleId(null);
  };

  // Detect clicks outside of the container to collapse any expanded outfit
  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setExpandedOutfitId(null);
      setActiveImage(null);
    }
  };

  // Add event listener for clicks outside the container when the component mounts.
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    // Remove the event listener when the component unmounts.
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    // Main container with a ref to detect clicks outside
    <div ref={containerRef} style={styles.container}>
      {/* Render the header navigation tabs */}
      <TabsHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* If there are no saved outfits, display a message */}
      {outfits.length === 0 ? (
        <p style={styles.emptyText}>No outfits saved yet, generate a fit first!</p>
      ) : (
        // Map through each saved outfit to display its card
        outfits.map((outfit, index) => {
          // Determine if this outfit is currently expanded
          const isExpanded = expandedOutfitId === outfit.id;
          // Determine if the title of this outfit is currently being edited
          const isEditing = editingTitleId === outfit.id;
          // Use an existing title, or generate a default title based on index
          const title = outfit.title || `Outfit ${outfits.length - index}`;

          return (
            <div key={outfit.id} style={styles.outfitCard}>
              {/* Row containing the delete icon */}
              <div style={styles.promptRow}>
                <AiOutlineDelete
                  size={20}
                  style={styles.icon}
                  onClick={() => handleDelete(outfit.id)}
                />
              </div>

              {/* Row for displaying or editing the outfit's title */}
              <div style={styles.titleRow}>
                {isEditing ? (
                  // Render an input field for editing the title
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTitle(outfit.id);
                    }}
                    onBlur={() => saveTitle(outfit.id)}
                    style={styles.titleInput}
                    autoFocus
                  />
                ) : (
                  // Render the title text; clicking toggles the expanded state.
                  <h2 style={styles.outfitTitle} onClick={() => toggleExpand(outfit.id)}>
                    {title}
                    {isExpanded && (
                      // If expanded, show an edit icon to enable title editing.
                      <AiOutlineEdit
                        size={16}
                        style={styles.editIcon}
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTitle(outfit.id, title);
                        }}
                      />
                    )}
                  </h2>
                )}
              </div>

              {/* Image stack: displays outfit images in an overlapping (stacked) layout */}
              <div className={`image-stack ${isExpanded ? 'expanded' : ''}`}>
                {outfit.images.map((url, idx) => {
                  // Calculate the left offset for a smooth stacking effect.
                  const offset = isExpanded ? idx * 180 : idx * 40;
                  // Check if this image is currently active (clicked).
                  const isClicked = activeImage === `${outfit.id}-${idx}`;
                  return (
                    <div
                      key={idx}
                      className="stacked-wrapper"
                      style={{ left: `${offset}px`, zIndex: outfit.images.length - idx }}
                      onClick={(e) => {
                        // Prevent card collapse when clicking an image.
                        e.stopPropagation();
                        if (isExpanded) {
                          // Toggle active image state.
                          setActiveImage(
                            activeImage === `${outfit.id}-${idx}` ? null : `${outfit.id}-${idx}`
                          );
                        }
                      }}
                    >
                      <img src={url} className="stacked-image" alt={`outfit-${idx}`} />
                      {/* If the outfit is expanded and this image is active, show a feature box */}
                      {isExpanded && isClicked && (
                        <div className="feature-box">Key features coming soon</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* If the outfit card is expanded, show extra details */}
              {isExpanded && (
                <>
                  <div className="prompt-text">
                    <strong>Prompt:</strong> {outfit.prompt}
                  </div>
                  <div className="prompt-text">
                    <strong>Explanation:</strong> {outfit.explanation}
                  </div>
                  <div className="prompt-text">
                    <strong>Styling Tips:</strong> {outfit.styling}
                  </div>
                </>
              )}
            </div>
          );
        })
      )}

      {/* Scoped CSS styles for the stacked images and text */}
      <style jsx>{`
        .image-stack {
          position: relative;
          height: 200px;
          margin-bottom: 10px;
        }
        .stacked-wrapper {
          position: absolute;
          transition: left 0.5s ease;
        }
        .stacked-image {
          height: 200px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          cursor: pointer;
        }
        .prompt-text {
          font-size: 1rem;
          margin: 5px 0;
          line-height: 1.4;
        }
        .feature-box {
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          padding: 8px 12px;
          margin-top: 8px;
          border: 1px solid #ccc;
          border-radius: 6px;
          white-space: nowrap;
          font-size: 0.9rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}

// Inline styles used throughout the component
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: '60px',
    fontSize: '1.2rem',
    color: '#777',
  },
  outfitCard: {
    marginBottom: '60px',
    paddingBottom: '20px',
    borderBottom: '1px solid #ccc',
  },
  promptRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '10px',
  },
  icon: {
    cursor: 'pointer',
    color: '#777',
  },
  titleRow: {
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
  },
  outfitTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginRight: '10px',
    cursor: 'pointer',
  },
  titleInput: {
    fontSize: '1.1rem',
    padding: '4px 8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '50%',
  },
  editIcon: {
    marginLeft: '8px',
    cursor: 'pointer',
    verticalAlign: 'middle',
  },
};
