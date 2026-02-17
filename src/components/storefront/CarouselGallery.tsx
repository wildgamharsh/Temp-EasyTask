"use client";

import { useState, useEffect, useRef } from 'react';

interface GalleryTestimonial {
    image_url: string;
    testimonials: Array<{
        name: string;
        comment: string;
        date?: string;
    }>;
}

interface CarouselGalleryProps {
    images: string[];
    galleryTestimonials?: GalleryTestimonial[];
    onImageClick: (imageUrl: string, testimonial: any) => void;
}

export default function CarouselGallery({ images, galleryTestimonials, onImageClick }: CarouselGalleryProps) {
    // ... existing state ...
    const [offset, setOffset] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const animationRef = useRef<number | null>(null);

    // ... existing refs ...
    const dragStartX = useRef<number>(0);
    const dragStartOffset = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // ... existing displayImages ...
    const displayImages = (() => {
        let result = [...images];
        while (result.length < 12) {
            result = [...result, ...images];
        }
        return result;
    })();

    // ... existing config ...
    const radius = 800; // Flatter arc radius
    const speed = 0.15; // Elegant faster speed

    // ... existing useEffect and handlers ...
    useEffect(() => {
        if (isPaused || isDragging) return;

        const animate = () => {
            setOffset(prev => {
                const newOffset = prev + speed;
                return newOffset >= 360 ? newOffset - 360 : newOffset;
            });
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPaused, isDragging]);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        dragStartX.current = clientX;
        dragStartOffset.current = offset;
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - dragStartX.current;
        const sensitivity = 0.3;
        let newOffset = dragStartOffset.current + (deltaX * sensitivity);
        newOffset = newOffset % 360;
        if (newOffset < 0) newOffset += 360;
        setOffset(newOffset);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const getImageStyle = (index: number, total: number) => {
        let angle = ((index * (360 / total)) + offset) % 360;
        if (angle < 0) angle += 360;

        const rad = angle * (Math.PI / 180);
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * (radius * 0.35);

        const isVisible = angle > 190 && angle < 350;
        const distanceToTop = Math.abs(angle - 270);
        const scaleBase = Math.max(0.7, 1 - (distanceToTop / 180));

        const isHovered = hoveredIndex === index;
        const finalScale = isHovered ? 1.15 : scaleBase;
        const zIndex = isHovered ? 100 : Math.round(scaleBase * 100);
        const opacity = isVisible ? Math.max(0, 1 - (distanceToTop / 120)) : 0;

        return {
            transform: `translate(${x.toFixed(3)}px, ${(y + 350).toFixed(3)}px) scale(${finalScale.toFixed(3)})`,
            zIndex,
            opacity: isHovered ? 1 : opacity,
            display: opacity < 0.05 ? 'none' : 'block',
            transition: isDragging ? 'none' : (isHovered ? 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'opacity 0.2s'),
            filter: isHovered ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' : 'none',
            cursor: isDragging ? 'grabbing' : 'grab'
        };
    };

    return (
        <div
            className="relative w-full h-[600px] flex items-center justify-center overflow-visible my-8 select-none"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
                handleMouseUp();
                setIsPaused(false);
                setHoveredIndex(null);
            }}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
        >
            <div className="relative w-full h-full flex items-center justify-center isolate pointer-events-none">
                {displayImages.map((image, index) => (
                    <div
                        key={`${index}-${image}`}
                        className="absolute will-change-transform pointer-events-auto"
                        style={getImageStyle(index, displayImages.length)}
                        onMouseEnter={() => {
                            if (!isDragging) {
                                setIsPaused(true);
                                setHoveredIndex(index);
                            }
                        }}
                        onMouseLeave={() => {
                            if (!isDragging) {
                                setIsPaused(false);
                                setHoveredIndex(null);
                            }
                        }}
                        onClick={(e) => {
                            if (!isDragging) {
                                // Find associated testimonial if any
                                const testimonialData = galleryTestimonials?.find(gt => gt.image_url === image);
                                onImageClick(image, testimonialData?.testimonials?.[0] || null);
                            }
                        }}
                    >
                        <div
                            className="relative rounded-2xl overflow-hidden bg-gray-900 transition-all duration-300"
                            style={{
                                width: '320px',
                                height: '450px',
                                border: hoveredIndex === index
                                    ? '3px solid var(--branding-primary)'
                                    : '1px solid rgba(255,255,255,0.15)',
                                // Removing overlay means we rely on the border and scale to indicate interactivity
                            }}
                        >
                            <img
                                src={image}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover"
                                draggable={false}
                                style={{
                                    // Make colors pop more on hover
                                    filter: hoveredIndex === index ? 'saturate(1.2) contrast(1.1)' : 'none',
                                    transition: 'filter 0.3s ease'
                                }}
                            />
                            {/* Overlay REMOVED as requested */}
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute -bottom-4 left-0 right-0 text-center pointer-events-none z-0">
                <p className="text-white/20 text-xs uppercase tracking-[0.3em] font-light">
                    Drag to Explore
                </p>
            </div>
        </div>
    );
}
