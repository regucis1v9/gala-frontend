import React, { useEffect, useState, useRef } from 'react';
import { useViewportSize } from '@mantine/hooks';
import { useParams } from 'react-router-dom';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import style from "../../style/SlideDisplay.module.css";

const Clock = () => {
    const [time, setTime] = useState(() =>
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: '-58px',
            left: '2px',
            backgroundColor: 'rgb(38,38,39)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '30px',
            zIndex: 10
        }}>
            {time}
        </div>
    );
};

const DateDisplay = () => {
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    return (
        <div style={{
            position: 'absolute',
            top: '-58px',
            right: '2px',
            backgroundColor: 'rgb(38,38,39)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '30px',
            zIndex: 10
        }}>
            {formatDate(new Date())}
        </div>
    );
};

const DisplaySlides = () => {
    const { height, width } = useViewportSize();
    const { id } = useParams();
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const autoplay = useRef(Autoplay({ delay: 5000 }));
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await fetch(`${API_URL}/api/getSlidesByScreen/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setSlides(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSlides();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style ={{backgroundColor:"rgb(38,38,39)"}}>
            <Clock />
            <DateDisplay />
            <div style={{ height: height - 60, overflow: 'hidden', position: 'relative', marginTop: '60px', backgroundColor: 'rgb(38,38,39)' }}>
                <Carousel
                    plugins={[autoplay.current]}
                    loop
                    align="start"
                    height={height - 60}
                    width="100vw"
                    slideSize="100%"
                    withIndicators={false}
                    classNames={{ controls: style.hidden }}

                >
                    {slides.map((slide) => (
                        <Carousel.Slide
                            key={slide.id}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <img
                                src={slide.imageLink}
                                alt={`Slide ${slide.id}`}
                                style={{
                                    width: 'auto',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            {slide.description && (
                                <span
                                    className={slide.textPosition}
                                    style={{
                                        color: slide.textColor,
                                        backgroundColor: slide.bgColor,
                                        position: 'absolute',
                                        zIndex: 1
                                    }}
                                >
                {slide.description}
              </span>
                            )}
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </div>
        </div>
    );
};

export default DisplaySlides;
