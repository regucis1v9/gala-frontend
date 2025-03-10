import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import style from "../../style/SlideDisplay.module.css"

const DisplaySlides = () => {
  const { id } = useParams(); // Get the ID from the URL
  const [slides, setSlides] = useState([]); // State to hold the slides data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const autoplay = useRef(Autoplay({ delay: 5000 }));
    const API_URL = process.env.REACT_APP_API_URL;


    useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(`${API_URL}/getSlidesByScreen/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSlides(data); // Set the slides data
      } catch (error) {
        setError(error.message); // Set error message if the fetch fails
      } finally {
        setLoading(false); // Set loading to false regardless of fetch success or failure
      }
    };

    fetchSlides(); // Call the fetch function
  }, [id]); // Run effect when the ID changes

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message if any
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <Carousel
        plugins={[autoplay.current]}
        loop // Allows the carousel to loop back to the beginning
        align="start" // Aligns items to the start of the container
        height="100%" // Ensures the carousel takes the full height
        slideSize="100%" // Each slide takes full width
        withIndicators={false} // Show indicators for the slides
        classNames={{controls: style.hidden}}
      >
        {slides.map((slide) => (
          <Carousel.Slide key={slide.id} style={{ position: 'relative' }}>
            <img
              src={slide.imageLink}
              alt={`Slide ${slide.id}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover', // Ensures the image covers the full height/width while maintaining aspect ratio
              }}
            />
            <span
              className={slide.textPosition} // Dynamically assigning the class based on the API response
              style={{
                color: slide.textColor,
                backgroundColor: slide.bgColor,
                position: 'absolute', // Absolute positioning for the text overlay
                zIndex: 1, // Ensures the text appears above the image
              }}
            >
              {slide.description}
            </span>
          </Carousel.Slide>
        ))}
      </Carousel>
    </div>
  );
};

export default DisplaySlides;
