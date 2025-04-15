// pages/get-dressed.js

// Import React, its hooks, bootstrap Button, and Next.js router
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/router';

export default function GetDressed() {
  // State to hold the list of image URLs from the wardrobe
  const [images, setImages] = useState([]);
  // Router for navigation
  const router = useRouter();

  // useEffect: Fetch the list of images when the component mounts
  useEffect(() => {
    fetch('http://127.0.0.1:5001/list')
      .then(res => res.json())
      .then(data => {
        // If there are files in the response, update the state
        if (data.files) {
          setImages(data.files);
        }
      })
      .catch(err => console.error('Error fetching images:', err));
  }, []);

  // Function to remove a specific image from the wardrobe.
  // It sends a request to delete the image from the backend.
  const handleRemoveItem = async (imageUrl) => {
    try {
      const response = await fetch('http://127.0.0.1:5001/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl }),
      });

      const result = await response.json();
      // If the delete request failed, throw an error
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete object');
      }

      // Remove the image from the local state to update the UI
      setImages((prev) => prev.filter((item) => item !== imageUrl));
      alert(`Removed ${imageUrl}`);
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Error removing item. Check console.');
    }
  };

  return (
    // Container for the entire page set to full viewport height
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* LEFT HALF: Wardrobe with smaller image previews */}
      <div
        style={{
          flex: 1,
          borderRight: '1px solid #ccc',
          padding: '20px',
          overflowY: 'auto'
        }}
      >
        <h2>Your Wardrobe</h2>
        {/* Check if there are images in the state */}
        {images.length > 0 ? (
          // Map through images and render each one with a remove button
          images.map((url, index) => (
            <div key={index} style={{ marginBottom: '20px', textAlign: 'center' }}>
              <img
                src={url}
                alt={`Wardrobe item ${index}`}
                // Style the image for a uniform preview size
                style={{ width: '150px', height: 'auto', objectFit: 'contain' }}
              />
              {/* Button to remove the specific image */}
              <Button
                variant="danger"
                size="sm"
                style={{ marginTop: '5px' }}
                onClick={() => handleRemoveItem(url)}
              >
                Remove Item
              </Button>
            </div>
          ))
        ) : (
          // Display if no images are present in the wardrobe
          <p>No items in your wardrobe.</p>
        )}
        {/* Button to navigate back to the Home page */}
        <div style={{ marginTop: '20px' }}>
          <Button variant="secondary" onClick={() => router.push('/')}>
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* RIGHT HALF: Layout for outfit parts (stacked rectangles) */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Accessories Section */}
        <div
          style={{
            flex: 1,
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            padding: '10px'
          }}
        >
          <h3 style={{ margin: 0 }}>Accessories</h3>
        </div>

        {/* Top Section */}
        <div
          style={{
            flex: 1,
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            padding: '10px'
          }}
        >
          <h3 style={{ margin: 0 }}>Top</h3>
        </div>

        {/* Pants Section */}
        <div
          style={{
            flex: 1,
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            padding: '10px'
          }}
        >
          <h3 style={{ margin: 0 }}>Pants</h3>
        </div>

        {/* Shoes Section */}
        <div
          style={{
            flex: 1,
            background: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            padding: '10px'
          }}
        >
          <h3 style={{ margin: 0 }}>Shoes</h3>
        </div>
      </div>
    </div>
  );
}
