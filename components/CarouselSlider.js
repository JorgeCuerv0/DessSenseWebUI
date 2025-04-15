// components/CarouselSlider.js

import React from 'react';
// Import the Slider component from the react-slick package to create a carousel.
import Slider from "react-slick";
// Import Slick Carousel CSS files for default styling and theme.
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// CarouselSlider component receives an array of image URLs as props.
const CarouselSlider = ({ images }) => {
  // Settings configuration for react-slick slider:
  const settings = {
    dots: true,                  // Show pagination dots below the carousel.
    infinite: true,              // Enable infinite scrolling.
    speed: 500,                  // Transition speed (ms) for slide changes.
    slidesToShow: 1,             // Number of slides to show at once.
    slidesToScroll: 1,           // Number of slides to scroll at a time.
    autoplay: true,              // Enable automatic slide transitions.
    autoplaySpeed: 3000,         // Delay between slide transitions (ms).
    cssEase: "linear",           // Use a smooth linear easing for transitions.
  };

  return (
    // Render the Slider component using the settings defined above.
    <Slider {...settings}>
      {images.map((url, idx) => (
        // Each slide is wrapped in a div; a key is provided for list rendering.
        <div key={idx}>
          {/* 
            Wrap the image in an anchor tag so that clicking the slide 
            opens the image in a new tab. The rel attribute ensures security.
          */}
          <a href={url} target="_blank" rel="noopener noreferrer">
            <img
              src={url}                            // Source URL for the image.
              alt={`Slide ${idx}`}                  // Alt text for accessibility.
              style={{
                width: "100%",                      // Make the image span the full width of its container.
                height: "400px",                    // Set a fixed height for the slide.
                objectFit: "cover"                  // Ensure the image covers the space while maintaining aspect ratio.
              }}
            />
          </a>
        </div>
      ))}
    </Slider>
  );
};

export default CarouselSlider;
