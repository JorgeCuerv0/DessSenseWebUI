// components/GlobalModal.js

// Import React and necessary hooks for creating and consuming context.
import React, { createContext, useState, useContext } from "react";
// Import Modal component from React-Bootstrap for modal functionality.
import { Modal } from "react-bootstrap";

// Create a new context to manage modal state and actions globally.
const ModalContext = createContext();

// ModalProvider component wraps parts of the app that need access to modal functionality.
export function ModalProvider({ children }) {
  // State to control the visibility of the modal.
  const [show, setShow] = useState(false);
  // State to store the URL of the image to display in the modal.
  const [imageUrl, setImageUrl] = useState("");

  // Function to open the modal with a specified image URL.
  const openModal = (url) => {
    setImageUrl(url);
    setShow(true);
  };

  // Function to close the modal and reset the image URL.
  const closeModal = () => {
    setShow(false);
    setImageUrl("");
  };

  return (
    // Provide the openModal and closeModal functions via context to children components.
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {/* Render the modal component that will display the image.
          - show: determines if the modal is visible.
          - onHide: function to call when modal is requested to be closed.
          - centered: positions the modal at the center of the viewport.
          - size: 'lg' for large modal size.
      */}
      <Modal show={show} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Display the selected image with responsive styling */}
          <img
            src={imageUrl}
            alt="Preview"
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
          />
        </Modal.Body>
      </Modal>
    </ModalContext.Provider>
  );
}

// useModal is a custom hook for easy access to the ModalContext values in functional components.
export function useModal() {
  return useContext(ModalContext);
}
