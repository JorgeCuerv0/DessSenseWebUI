// Import necessary React hooks, Next.js router, Bootstrap components, a fixed header component, and an icon.
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Modal, Button, Toast } from 'react-bootstrap';
import FixedHeader from '../components/FixedHeader';
import { AiFillDelete } from 'react-icons/ai';

//--------------------------------------------------------------------------//
// RecommendationDisplay Component
// This component displays a recommended outfit along with explanation, styling tips,
// and provides options to regenerate or save the recommendation.
// It also shows a modal for a magnified view of an outfit piece when clicked.
//--------------------------------------------------------------------------//
function RecommendationDisplay({ recommendation, onRegenerate, onSave }) {
  // State to manage which image is currently selected to display in the modal.
  const [selectedImage, setSelectedImage] = useState(null);

  // Log the received recommendation when it changes.
  useEffect(() => {
    console.log("Recommendation received:", recommendation);
  }, [recommendation]);

  // When an image is clicked, set it as the selected image to show in the modal.
  const handleImageClick = (url) => setSelectedImage(url);
  // Close the magnified view modal.
  const handleClose = () => setSelectedImage(null);

  // Check if the recommendation data is valid (contains an outfit array).
  if (!recommendation.outfit || !Array.isArray(recommendation.outfit)) {
    return (
      <div style={{ marginTop: '20px' }}>
        <h3>Recommended Outfit</h3>
        <p>Error: Recommendation data is not available or invalid.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Recommended Outfit</h3>
      {/* Display outfit images in a grid layout */}
      <div className="gridContainer" style={{ marginBottom: '20px' }}>
        {recommendation.outfit.map((url, index) => (
          <div
            key={index}
            className="gridItem"
            style={{ cursor: 'pointer' }}
            onClick={() => handleImageClick(url)}
          >
            <div className="aspectRatioBox">
              <img src={url} alt={`Outfit piece ${index}`} className="image" />
            </div>
          </div>
        ))}
      </div>
      {/* Display recommendation explanation and styling tips */}
      <p>
        <strong>Explanation:</strong> {recommendation.explanation}
      </p>
      <p>
        <strong>Styling Tips:</strong> {recommendation.styling}
      </p>

      {/* Buttons to regenerate the outfit or save the current recommendation */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button 
          onClick={onRegenerate}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Regenerate
        </button>
        <button 
          onClick={onSave}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Save Outfit
        </button>
      </div>

      {/* Modal to show a magnified view of a selected outfit image */}
      {selectedImage && (
        <Modal show={true} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Magnified View</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ textAlign: 'center' }}>
            <img
              src={selectedImage}
              alt="Magnified outfit piece"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

//--------------------------------------------------------------------------//
// Fits Component
// This is the main component that renders the chat interface, handles 
// outfit recommendation requests, manages chat history, and offers saving functionality.
// It also renders the fixed header and toast notifications.
//--------------------------------------------------------------------------//
export default function Fits({ darkMode, toggleDarkMode }) {
  // Access query parameters via Next.js router.
  const router = useRouter();
  // Get the imageUrl parameter from the router query.
  const { imageUrl } = router.query;
  // Reference to automatically scroll the chat view to the bottom.
  const messagesEndRef = useRef(null);

  // State to manage the chat messages.
  const [messages, setMessages] = useState([]);
  // State for the user input in the chat.
  const [input, setInput] = useState('');
  // Boolean state to indicate if the system is waiting for a server response.
  const [loading, setLoading] = useState(false);
  // Store the last prompt used for the conversation.
  const [lastPrompt, setLastPrompt] = useState('');
  // State for managing toast notification messages.
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  // Function to display a toast notification.
  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // Clear chat history, with a confirmation prompt.
  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          role: 'assistant',
          content: 'Welcome! Ask for an outfit recommendation by describing what you are looking for.',
        },
      ]);
      localStorage.removeItem('chatHistory');
    }
  };

  // Load chat history from localStorage when the component mounts.
  useEffect(() => {
    const storedMessages = localStorage.getItem('chatHistory');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages([
        {
          role: 'assistant',
          content: 'Welcome! Ask for an outfit recommendation by describing what you are looking for.',
        },
      ]);
    }
  }, []);

  // Update localStorage whenever messages change and scroll to the bottom.
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // When an imageUrl is available in the query parameters, set the default input message.
  useEffect(() => {
    if (imageUrl) {
      setInput(`Outfit recommendation for image: ${imageUrl}`);
    }
  }, [imageUrl]);

  // Helper function to scroll chat view to the bottom.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to send a chat message (or prompt) to the backend.
  // Optionally accepts a promptOverride for specific cases like regeneration.
  const handleSend = async (e, promptOverride = null) => {
    e?.preventDefault();
    const prompt = promptOverride || input;
    if (prompt.trim() === '') return;

    // Add the user's message to the chat.
    const userMessage = { role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    // Update the last prompt and clear input if it's a normal user prompt.
    if (!promptOverride) {
      setInput('');
      setLastPrompt(prompt);
    }
    setLoading(true);

    try {
      // Send the user's prompt to the backend for an outfit recommendation.
      const response = await fetch('http://127.0.0.1:5001/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_prompt: userMessage.content }),
      });
      const data = await response.json();

      // Check if the response contains the expected data.
      if (data.outfit && data.explanation && data.styling) {
        const recommendationMessage = { 
          role: 'recommendation', 
          content: data,
          promptUsed: prompt
        };
        setMessages((prev) => [...prev, recommendationMessage]);
      } else if (data.error) {
        const errorMessage = { role: 'assistant', content: `Error: ${data.error}` };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const unknownMessage = { role: 'assistant', content: 'Unexpected response from the server.' };
        setMessages((prev) => [...prev, unknownMessage]);
      }
    } catch (error) {
      const catchMessage = { role: 'assistant', content: `Error: ${error.message}` };
      setMessages((prev) => [...prev, catchMessage]);
    }
    setLoading(false);
  };

  // Function to handle the regeneration of an outfit recommendation.
  const handleRegenerate = (prompt) => {
    const regeneratePrompt = `Give me another outfit option for: ${prompt}`;
    handleSend(null, regeneratePrompt);
  };

  // Function to save the current outfit recommendation.
  // It creates a new outfit object, stores it locally, sends it to the backend,
  // and then navigates the user to the collections page.
  const handleSaveOutfit = async (outfitData, promptUsed) => {
    const newOutfit = {
      id: Date.now().toString(),
      images: outfitData.outfit,
      prompt: promptUsed,
      explanation: outfitData.explanation,
      styling: outfitData.styling,
      createdAt: new Date().toISOString(),
      favorite: false
    };
  
    try {
      // Save to localStorage.
      const stored = localStorage.getItem('savedOutfits');
      const current = stored ? JSON.parse(stored) : [];
      const updated = [newOutfit, ...current];
      localStorage.setItem('savedOutfits', JSON.stringify(updated));
  
      // Optionally, save to the backend.
      await fetch('http://127.0.0.1:5001/save-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOutfit),
      });
  
      // Redirect the user to the collections page.
      router.push('/collections');
    } catch (error) {
      console.error('Error saving outfit:', error);
      alert('Failed to save outfit. Please try again.');
    }
  };

  //--------------------------------------------------------------------------//
  // Render the main chat and recommendation interface.
  //--------------------------------------------------------------------------//
  return (
    <div className="container" style={{ 
      marginTop: '20px',
      height: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Fixed header with dark mode toggle */}
      <FixedHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Button to clear the chat history (positioned in the upper left) */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 10001,
        }}
      >
        <button
          onClick={clearChat}
          style={{
            padding: '8px 12px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
          title="Clear chat history"
        >
          <AiFillDelete size={18} />
          Clear Chat
        </button>
      </div>

      {/* Chat container with messages display and input form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '100px 0 20px',
        overflow: 'hidden'
      }}>
        {/* Chat messages display area with auto-scroll */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 20px',
          marginBottom: '20px',
          background: '#f7f7f7',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ padding: '20px' }}>
            {/* Map through and display each chat message */}
            {messages.map((msg, index) => {
              if (msg.role === 'recommendation') {
                // Render the RecommendationDisplay for recommendation messages.
                return (
                  <RecommendationDisplay 
                    key={index}
                    recommendation={msg.content}
                    onRegenerate={() => handleRegenerate(msg.promptUsed || lastPrompt)}
                    onSave={() => handleSaveOutfit(msg.content, msg.promptUsed || lastPrompt)}
                  />
                );
              } else {
                // Render normal chat bubbles for user or assistant messages.
                return (
                  <div
                    key={index}
                    className={`message-bubble ${msg.role === 'assistant' ? 'assistant-bubble' : 'user-bubble'}`}
                    style={{
                      marginBottom: '10px',
                      textAlign: msg.role === 'assistant' ? 'left' : 'right',
                      background: msg.role === 'assistant' ? '#e1f5fe' : '#c8e6c9',
                      padding: '10px',
                      borderRadius: '8px',
                      whiteSpace: 'pre-wrap',
                      color: '#000',
                      wordBreak: 'break-word'
                    }}
                  >
                    {/* Handle multiline messages */}
                    {msg.content.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                );
              }
            })}
            {/* Show a loading indicator when waiting for a response */}
            {loading && <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Loading...</div>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Form for user to send a new prompt */}
        <form
          onSubmit={handleSend}
          style={{
            display: 'flex',
            width: '100%',
            padding: '0 20px'
          }}
        >
          <input
            type="text"
            placeholder="Enter your outfit prompt..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginRight: '10px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              borderRadius: '4px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* Toast notification for displaying messages */}
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
