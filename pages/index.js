// pages/Display.js
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
// Import core React features and hooks, Next.js router, 
// Bootstrap components, your custom FixedHeader, and required icons.
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Modal, Toast } from 'react-bootstrap';
import FixedHeader from '../components/FixedHeader';
import { 
  AiOutlinePlusCircle,
  AiOutlineEdit, 
  AiOutlineDelete, 
  AiFillHeart,
} from 'react-icons/ai';

// Define the main Display component that handles image display,
// deletion, upload, updating details, and filtering.
function Display({ darkMode, toggleDarkMode }) {
  // ----------------------------- //
  //       State Declarations      //
  // ----------------------------- //
  // images: stores the list of image items
  const [images, setImages] = useState([]);
  // showItemKeys: toggles display of image details in modal
  const [showItemKeys, setShowItemKeys] = useState(false);
  // deleteMode: tracks whether delete mode is active
  const [deleteMode, setDeleteMode] = useState(false);
  // selectedForDeletion: stores URLs of images selected for deletion
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  // favoritesFilter: toggles filter for favorite items only
  const [favoritesFilter, setFavoritesFilter] = useState(false);
  // activeFilters: tracks which sorting/filter options are active
  const [activeFilters, setActiveFilters] = useState({
    category: false,
    type: false,
    color: false,
    brand: false,
  });
  // Modals: control the state of modals for details and uploads
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  // selectedItem: holds the current image item being viewed/edited
  const [selectedItem, setSelectedItem] = useState(null);
  // State flags for updating and editing operations
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  // TempName: used to store edited image name before saving
  const [tempName, setTempName] = useState('');
  // toast: controls display of pop-up messages
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  // editingKey: tracks which key (field) is being edited
  const [editingKey, setEditingKey] = useState(null);
  // customMode: flag for custom input mode in dropdowns (e.g., Custom option)
  const [customMode, setCustomMode] = useState({});
  // Upload state: for name, file list, and upload status
  const [uploadName, setUploadName] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // useRouter hook provides navigation functions
  const router = useRouter();

  // Dropdown options used in the details modal for updating image details
  const dropdownOptions = {
    category: ["Top", "Bottom", "Outerwear", "Footwear"],
    color: ["White", "Black", "Red", "Blue", "Green", "Yellow"],
    material: ["Cotton", "Polyester", "Wool", "Silk", "Denim"],
    style: ["Minimalist", "Streetwear", "Casual", "Formal"],
    type: ["T-shirt", "Shirt", "Pants", "Dress", "Skirt"],
  };

  // List of keys (fields) that are shown in the details modal.
  const keysToShow = [
    "brand",
    "category",
    "color",
    "material",
    "style",
    "type"
  ];

  // ----------------------------- //
  //         Data Fetching         //
  // ----------------------------- //
  // Fetch images from the backend server and update state.
  const fetchData = () => {
    fetch(`${BACKEND_URL}/list`)
      .then((res) => res.json())
      .then((data) => {
        // Update state if images are returned from API
        if (data.files) setImages(data.files);
      })
      .catch((err) => console.error('Error fetching images:', err));
  };

  // useEffect to fetch data on mount and refresh every 3 seconds.
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------- //
  //         Delete Mode           //
  // ----------------------------- //
  // Toggle delete mode; if deactivating and images selected, send delete requests.
  const toggleDeleteMode = () => {
    if (deleteMode && selectedForDeletion.length > 0) {
      // Delete all selected images using POST calls to the backend.
      Promise.all(selectedForDeletion.map(url =>
        fetch(`${BACKEND_URL}/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url }),
        })
      ))
      .then((responses) => Promise.all(responses.map(res => res.json())))
      .then(() => {
        showToast('Selected images deleted');
        fetchData();
        setSelectedForDeletion([]);
        setDeleteMode(false);
      })
      .catch((err) => {
        console.error('Error deleting selected images:', err);
        showToast('Error deleting images', 'danger');
      });
    } else {
      // Otherwise, simply toggle the delete mode status.
      setDeleteMode((prev) => !prev);
      if (deleteMode) setSelectedForDeletion([]);
    }
  };

  // Toggle selection/deselection of an image for deletion.
  const handleSelectForDeletion = (s3_url) => {
    if (selectedForDeletion.includes(s3_url)) {
      setSelectedForDeletion((prev) => prev.filter((url) => url !== s3_url));
    } else {
      setSelectedForDeletion((prev) => [...prev, s3_url]);
    }
  };

  // ----------------------------- //
  //           Toast Alerts        //
  // ----------------------------- //
  // Display a toast message with an optional variant.
  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // ----------------------------- //
  //     Filter and Sorting        //
  // ----------------------------- //
  // Callback to toggle favorites filter.
  const handleFavoritesFilterToggle = () => setFavoritesFilter((prev) => !prev);
  // Toggle an active filter based on filter name (e.g., category, type).
  const handleToggleFilter = (filterName) => {
    setActiveFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  // Copy the images array and apply filters and sorting based on state.
  let displayedImages = [...images];
  // Filter only favorite items if favorites filter is active.
  if (favoritesFilter) {
    displayedImages = displayedImages.filter((item) => item.favorite);
  }
  // Sort images based on each active filter.
  if (activeFilters.category) {
    displayedImages.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
  }
  if (activeFilters.type) {
    displayedImages.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
  }
  if (activeFilters.color) {
    displayedImages.sort((a, b) => (a.color || '').localeCompare(b.color || ''));
  }
  if (activeFilters.brand) {
    displayedImages.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''));
  }

  // ----------------------------- //
  //           Upload Flow         //
  // ----------------------------- //
  // Open the upload modal.
  const handleOpenUploadModal = () => setShowUploadModal(true);

  // Close the upload modal and reset upload-related state.
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadName('');
    setUploadFiles([]);
    setIsUploading(false);
  };

  // When files are selected, update the state with the selected files.
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(Array.from(e.target.files));
    }
  };

  // Upload a single file to the backend. Returns a promise.
  const uploadSingleFile = (file, name = null) => {
    return new Promise((resolve, reject) => {
      // Validate that the file is an image
      if (!file.type.startsWith('image/')) {
        reject(new Error('Only image files are allowed'));
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      if (name) formData.append('name', name);
      // Use XMLHttpRequest for the file upload.
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BACKEND_URL}/upload`);
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const responseJson = JSON.parse(xhr.responseText);
            resolve(responseJson);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Upload error'));
      xhr.send(formData);
    });
  };

  // Handle the submit action for uploads.
  const handleUploadSubmit = async () => {
    // Prevent multiple uploads if one is in progress.
    if (isUploading) return;
    // Check that at least one file is selected.
    if (uploadFiles.length === 0) {
      showToast('Please select at least one image to upload', 'warning');
      return;
    }
    setIsUploading(true);
    try {
      // For a single file, use the provided name or default to "untitled".
      const isSingle = uploadFiles.length === 1;
      const safeName = isSingle ? (uploadName.trim() === '' ? 'untitled' : uploadName.trim()) : null;
      // Upload each file sequentially.
      for (let file of uploadFiles) {
        await uploadSingleFile(file, isSingle ? safeName : null);
      }
      showToast('Upload successful');
      fetchData();
      handleCloseUploadModal();
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload unsuccessful', 'danger');
    } finally {
      setIsUploading(false);
    }
  };

  // ----------------------------- //
  //        Details Modal Flow     //
  // ----------------------------- //
  // Open the details modal with a specific image item.
  const openModal = (item) => {
    setSelectedItem({ ...item, favorite: item.favorite || false });
    setTempName(item.name || `Piece #${item.id}`);
    setShowModal(true);
    setEditingKey(null);
    setCustomMode({});
  };

  // Close the modal and reset modal-related state.
  const handleCloseModal = () => {
    fetchData();
    setShowModal(false);
    setSelectedItem(null);
    setIsEditingName(false);
    setEditingKey(null);
    setCustomMode({});
  };

  // Handle changes for input fields in the modal.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem((prev) => ({ ...prev, [name]: value }));
  };

  // Send updated item data to the backend and refresh the list.
  const handleUpdate = async () => {
    setIsEditingName(false);
    setEditingKey(null);
    setCustomMode({});
    setIsUpdating(true);
    try {
      const response = await fetch(`${BACKEND_URL}/update`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedItem),
      });
      if (response.ok) {
        const updatedItem = await response.json();
        setSelectedItem(updatedItem);
        fetchData();
      } else {
        console.error('Failed to update item');
      }
    } catch (err) {
      console.error('Error updating item:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle 'Enter' key to trigger an update.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdate();
    }
  };

  // Toggle the editing state for the image name.
  const toggleEditingName = () => setIsEditingName((prev) => !prev);

  // Navigate to the "fits" page using the selected image's URL.
  const handleGenerateFit = () => {
    if (selectedItem && selectedItem.s3_url) {
      router.push({
        pathname: '/fits',
        query: { imageUrl: selectedItem.s3_url }
      });
    }
  };

  // Delete a single image directly from the details modal.
  const handleDelete = (s3_url) => {
    fetch('http://127.0.0.1:5001/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: s3_url }),
    })
    .then(res => res.json())
    .then(() => {
      showToast('Image deleted successfully');
      setShowModal(false);
      fetchData();
    })
    .catch(err => {
      console.error('Error deleting image:', err);
      showToast('Error deleting image', 'danger');
    });
  };

  // ----------------------------- //
  //        Grouping Logic         //
  // ----------------------------- //
  // Determine which key is used for grouping (based on active filters)
  const groupingKey = activeFilters.category 
    ? 'category' 
    : activeFilters.type 
      ? 'type'
      : activeFilters.color 
        ? 'color'
        : activeFilters.brand 
          ? 'brand'
          : null;

  // Group and map images if a grouping key is set.
  let content;
  if (groupingKey) {
    // Group images into an object based on the selected field.
    const groupedImages = displayedImages.reduce((acc, item) => {
      const group = item[groupingKey] || "Others";
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
    // Render each group with a title and grid of images.
    content = Object.keys(groupedImages)
      .sort()
      .map((group) => (
        <div key={group}>
          <h2 style={{ margin: '1rem 0' }}>{group}</h2>
          <div className="gridContainer">
            {groupedImages[group].map(item => (
              <div
                key={item.id}
                className="gridItem"
                style={{ position: 'relative' }}
                onClick={() => openModal(item)}
              >
                <div className="aspectRatioBox">
                  <img src={item.s3_url} alt={`Clothing item ${item.id}`} className="image" />
                  {/* Only show delete overlay in delete mode */}
                  {deleteMode && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: selectedForDeletion.includes(item.s3_url) ? 'red' : 'gray',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        // Prevent the modal from opening when selecting for deletion.
                        e.stopPropagation();
                        handleSelectForDeletion(item.s3_url);
                      }}
                    >
                      {selectedForDeletion.includes(item.s3_url) ? '✓' : 'X'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ));
  } else {
    // If no grouping key is active, render images in one grid.
    content = (
      <div className="gridContainer">
        {displayedImages.length > 0 ? (
          displayedImages.map(item => (
            <div
              key={item.id}
              className="gridItem"
              style={{ position: 'relative' }}
              onClick={() => openModal(item)}
            >
              <div className="aspectRatioBox">
                <img src={item.s3_url} alt={`Clothing item ${item.id}`} className="image" />
                {/* Delete mode icon for each image */}
                {deleteMode && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: selectedForDeletion.includes(item.s3_url) ? 'red' : 'gray',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectForDeletion(item.s3_url);
                    }}
                  >
                    {selectedForDeletion.includes(item.s3_url) ? '✓' : 'X'}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No images found.</p>
        )}
      </div>
    );
  }

  // ----------------------------- //
  //         Render Component      //
  // ----------------------------- //
  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* 9a. Render the fixed header with dark mode and filter toggle props */}
      <FixedHeader 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        favoritesFilter={favoritesFilter}
        handleFavoritesFilterToggle={handleFavoritesFilterToggle}
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
        onUploadClick={handleOpenUploadModal}
      />

      {/* 9b. Delete mode icon positioned in the top-right corner */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '40px',
          zIndex: 10000,
        }}
      >
        <div 
          className="deleteToggle" 
          onClick={toggleDeleteMode} 
          style={{ 
            cursor: 'pointer', 
            padding: '4px', 
            borderRadius: '50%', 
            backgroundColor: deleteMode ? '#f8d7da' : 'transparent' 
          }}
        >
          <AiOutlineDelete size={24} style={{ color: deleteMode ? 'red' : '#666' }} />
        </div>
      </div>

      {/* 9c. Main scrollable content area for displaying images */}
      <div
        style={{
          marginTop: '140px',         // Ensures content is not hidden behind header
          height: 'calc(100vh - 140px)', // Sets the height to fill remaining viewport space
          overflowY: 'auto',
          padding: '20px'
        }}
      >
        {content}
      </div>

      {/* 9d. Modal for uploading new images */}
      <Modal show={showUploadModal} onHide={handleCloseUploadModal} centered backdrop>
        <Modal.Header closeButton>
          <Modal.Title>Upload New Pieces</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="uploadName">Piece Name (for single upload)</label>
            <input
              type="text"
              id="uploadName"
              className="form-control"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="uploadFile">Choose Image Files</label>
            <input
              type="file"
              id="uploadFile"
              className="form-control"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
            {uploadFiles.length > 0 && (
              <p style={{ marginTop: '8px' }}>
                Selected files: <strong>{uploadFiles.map(f => f.name).join(', ')}</strong>
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-primary"
            onClick={handleUploadSubmit}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* 9e. Modal for viewing and editing image details */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        {selectedItem && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="modalTitleContainer">
                {isEditingName ? (
                  // Input to edit the name when editing is enabled
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => {
                      setTempName(e.target.value);
                      setSelectedItem(prev => ({ ...prev, name: e.target.value }));
                    }}
                    onKeyDown={handleKeyDown}
                    className="editNameInput"
                    autoFocus
                  />
                ) : (
                  // Display name and an edit icon that toggles editing mode
                  <>
                    {selectedItem.name || `Piece #${selectedItem.id}`}
                    <AiOutlineEdit className="editIcon" onClick={toggleEditingName} />
                  </>
                )}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="modalImageContainer">
                <img
                  src={selectedItem.s3_url}
                  alt="Bigger preview"
                  className="modalImage"
                  onClick={() => setShowItemKeys(prev => !prev)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              {/* Display item details when toggled */}
              {showItemKeys && (
                <div className="keyFeatures">
                  {keysToShow.map(key => {
                    if (key === "brand") {
                      // Specific treatment for brand field with editable input
                      return (
                        <div key={key} className="keyFeature">
                          <span className="keyLabel">{key}:</span>
                          {editingKey === "brand" ? (
                            <input
                              type="text"
                              id="brand"
                              name="brand"
                              value={selectedItem.brand || ""}
                              onChange={handleInputChange}
                              onKeyDown={handleKeyDown}
                              className="fieldInput"
                            />
                          ) : (
                            <span 
                              className="keyValue" 
                              onClick={() => setEditingKey("brand")} 
                              style={{ cursor: 'pointer' }}
                            >
                              {selectedItem.brand || "N/A"}
                            </span>
                          )}
                        </div>
                      );
                    } else {
                      // For other keys, either display an input or a select dropdown
                      return (
                        <div key={key} className="keyFeature">
                          <span className="keyLabel">{key}:</span>
                          {editingKey === key ? (
                            customMode[key] ? (
                              <input
                                type="text"
                                id={key}
                                name={key}
                                value={selectedItem[key] || ""}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="fieldInput"
                              />
                            ) : (
                              <select
                                name={key}
                                value={selectedItem[key] || ""}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (value === "Custom") {
                                    setCustomMode(prev => ({ ...prev, [key]: true }));
                                    setSelectedItem(prev => ({ ...prev, [key]: "" }));
                                  } else {
                                    setSelectedItem(prev => ({ ...prev, [key]: value }));
                                  }
                                }}
                                onKeyDown={handleKeyDown}
                                className="fieldInput"
                              >
                                {dropdownOptions[key]?.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                                <option value="Custom">Custom</option>
                              </select>
                            )
                          ) : (
                            <span 
                              className="keyValue" 
                              onClick={() => setEditingKey(key)} 
                              style={{ cursor: 'pointer' }}
                            >
                              {selectedItem[key] || "N/A"}
                            </span>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              )}
              {/* Icons for favorite and delete actions */}
              <div className="iconRow">
                {selectedItem.favorite ? (
                  <span
                    className="iconButton favoriteIcon red"
                    onClick={() => {
                      // Toggle off favorite status
                      fetch(`${BACKEND_URL}/favorite`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: selectedItem.id, favorite: false }),
                      })
                        .then(res => res.json())
                        .then(updatedItem => {
                          setSelectedItem(updatedItem);
                          fetchData();
                        })
                        .catch(err => console.error('Error toggling favorite:', err));
                    }}
                  >
                    <AiFillHeart />
                  </span>
                ) : (
                  <span
                    className="iconButton favoriteIcon grey"
                    onClick={() => {
                      // Toggle on favorite status
                      fetch('http://127.0.0.1:5001/favorite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: selectedItem.id, favorite: true }),
                      })
                        .then(res => res.json())
                        .then(updatedItem => {
                          setSelectedItem(updatedItem);
                          fetchData();
                        })
                        .catch(err => console.error('Error toggling favorite:', err));
                    }}
                  >
                    <AiFillHeart />
                  </span>
                )}
                {/* Delete icon in details modal */}
                <span
                  className="iconButton deleteIcon blue"
                  onClick={() => handleDelete(selectedItem.s3_url)}
                >
                  <AiOutlineDelete />
                </span>
              </div>
              {/* Button for generating a fit with the selected piece */}
              <div className="centerButtons">
                <button className="plusButton" onClick={handleGenerateFit}>
                  <AiOutlinePlusCircle className="iconSmall" />
                  Generate fit with this piece
                </button>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>

      {/* 9f. Toast component for showing notifications */}
      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        bg={toast.variant}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          minWidth: 200,
          zIndex: 9999,
        }}
      >
        <Toast.Body className="text-white">{toast.message}</Toast.Body>
      </Toast>
    </div>
  );
}

export default Display;
