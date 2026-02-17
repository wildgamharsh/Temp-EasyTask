"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';


export default function BeforeAfterSlider() {
    const [sliderPosition, setSliderPosition] = useState(85);
    const [isDragging, setIsDragging] = useState(false);
    const [showFixButton, setShowFixButton] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasMoved = useRef(false);
    const x = useMotionValue(85);

    const handleDrag = (clientX: number) => {
        if (!containerRef.current) return;
        hasMoved.current = true;

        const rect = containerRef.current.getBoundingClientRect();
        const position = ((clientX - rect.left) / rect.width) * 100;
        const clampedPosition = Math.max(0, Math.min(100, position));

        setSliderPosition(clampedPosition);
        x.set(clampedPosition);
    };

    const startDrag = () => {
        setIsDragging(true);
        hasMoved.current = false;
    };

    const stopDrag = () => {
        setIsDragging(false);

        // Click-to-Toggle Logic
        if (!hasMoved.current) {
            // If strictly a click (no drag movement), toggle side
            const targetPos = sliderPosition < 50 ? 100 : 0;
            animate(x, targetPos, {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                onUpdate: (latest) => setSliderPosition(latest)
            });
        }
        hasMoved.current = false;
    };


    const handleFixNow = () => {
        setShowFixButton(false);
        animate(x, 0, {
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for smooth, premium feel
            onUpdate: (latest) => {
                setSliderPosition(latest);
            }
        });
    };

    useEffect(() => {
        if (!isDragging) return;

        const onMouseMove = (e: MouseEvent) => handleDrag(e.clientX);
        const onTouchMove = (e: TouchEvent) => handleDrag(e.touches[0].clientX);
        const onUp = () => stopDrag();

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchend', onUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchend', onUp);
        };
    }, [isDragging]);

    return (
        <div className="w-full py-24 px-4 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Heading Text */}
                    <div className="text-left fade-up">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                            Superior Productivity. <br />
                            <span className="bg-gradient-to-r from-brand-500 to-indigo-600 bg-clip-text text-transparent">
                                Built for Event Pros.
                            </span>
                        </h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Streamline your entire operation and reclaim hours of your week with precision automation.
                        </p>
                        <ul className="space-y-4 text-slate-600">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-500" />
                                <span>Automated payment collection</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-500" />
                                <span>No more double-bookings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-500" />
                                <span>Instant professional credibility</span>
                            </li>
                        </ul>
                    </div>

                    {/* Right Column: Slider Card */}
                    <div
                        ref={containerRef}
                        className="relative h-[420px] w-full rounded-3xl overflow-hidden shadow-2xl select-none touch-none bg-white font-sans"
                    // Remove default border to match card style better, or keep subtle
                    >
                        {/* Before Section (Left/Chaos/Red) */}
                        {/* We use the styling of the 'Current Chaos' card here */}
                        <div
                            className="absolute inset-0 bg-white"
                            style={{
                                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                            }}
                        >
                            <div className="h-full w-full p-8 border border-red-100 flex flex-col justify-center relative overflow-hidden">
                                {/* Background Icon */}
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <i className="fa-solid fa-triangle-exclamation text-9xl text-red-500"></i>
                                </div>

                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
                                        <i className="fa-solid fa-xmark text-xl"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-6">The Current Chaos</h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-4">
                                            <i className="fa-solid fa-circle-xmark text-red-400 mt-1 text-lg"></i>
                                            <span className="text-slate-600 text-base">Inquiries scattered across WhatsApp, Email, and DM.</span>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <i className="fa-solid fa-circle-xmark text-red-400 mt-1 text-lg"></i>
                                            <span className="text-slate-600 text-base">Availability checks rely on memory or paper diaries.</span>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <i className="fa-solid fa-circle-xmark text-red-400 mt-1 text-lg"></i>
                                            <span className="text-slate-600 text-base">Sending pricing PDFs manually to every lead.</span>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <i className="fa-solid fa-circle-xmark text-red-400 mt-1 text-lg"></i>
                                            <span className="text-slate-600 text-base">Chasing payments and double-booking fears.</span>
                                        </li>
                                    </ul>

                                    {/* Fix Now Button - Only visible initially and on refresh */}
                                    {showFixButton && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            onClick={handleFixNow}
                                            className="mt-8 px-6 py-2 bg-white border-2 border-red-500 text-red-500 rounded-full font-bold text-sm tracking-wide hover:bg-red-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
                                        >
                                            FIX NOW
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* After Section (Right/System/Blue) */}
                        {/* We overlay this and clip it. The content matches 'The EasyTask Way' card */}
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"
                            style={{
                                clipPath: `inset(0 0 0 ${sliderPosition}%)`
                            }}
                        >
                            <div className="h-full w-full p-8 flex flex-col justify-center relative overflow-hidden">
                                {/* Background Icon */}
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <i className="fa-solid fa-check-double text-9xl text-white"></i>
                                </div>

                                <div className="relative z-10 text-white">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white mb-6">
                                        <i className="fa-solid fa-check text-xl"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-6">The EasyTask System</h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-4">
                                            <i className="fa-solid fa-circle-check text-blue-400 mt-1 text-lg"></i>
                                            <span className="text-blue-100 text-base">One central dashboard for all inquiries.</span>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <i className="fa-solid fa-circle-check text-blue-400 mt-1 text-lg"></i>
                                            <span className="text-blue-100 text-base">Live calendar preventing double bookings instantly.</span>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <i className="fa-solid fa-circle-check text-blue-400 mt-1 text-lg"></i>
                                            <span className="text-blue-100 text-base">Customers view services and book online 24/7.</span>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <i className="fa-solid fa-circle-check text-blue-400 mt-1 text-lg"></i>
                                            <span className="text-blue-100 text-base">Automated confirmations and reminders.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Draggable Handle */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.2)] cursor-col-resize z-20 hover:scale-105 active:scale-95 transition-transform"
                            style={{
                                left: `${sliderPosition}%`,
                                transform: 'translateX(-50%)'
                            }}
                            onMouseDown={startDrag}
                            onTouchStart={startDrag}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+30px)]">
                                <motion.div
                                    className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-slate-100 cursor-pointer"
                                    animate={{
                                        scale: isDragging ? 1.1 : 1,
                                    }}
                                >
                                    <svg
                                        className="w-6 h-6 text-brand-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M8 7l-5 5 5 5M16 7l5 5-5 5"
                                        />
                                    </svg>
                                </motion.div>
                            </div>


                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
