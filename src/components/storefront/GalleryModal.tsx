"use client";

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    testimonial?: { name: string; comment: string; date?: string; } | null;
}

export default function GalleryModal({
    isOpen,
    onClose,
    imageUrl,
    testimonial
}: GalleryModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative z-10 w-full ${testimonial ? 'max-w-6xl' : 'max-w-5xl'} h-[85vh] flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300`}>

                {/* Close Button (Absolute) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-800 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left Side - Image (Dynamic Width) */}
                <div className={`w-full ${testimonial ? 'md:w-1/2' : 'md:w-full'} h-1/2 md:h-full bg-black flex items-center justify-center relative group`}>
                    <img
                        src={imageUrl}
                        alt="Gallery Large"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Right Side - Testimonials (Conditionally Rendered) */}
                {testimonial && (
                    <div className="w-full md:w-1/2 h-1/2 md:h-full bg-white p-8 md:p-12 flex flex-col overflow-y-auto">
                        <div className="mb-8 border-b pb-4">
                            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                                Client Stories
                            </h3>
                            <p className="text-gray-500 font-light">Experiences from our cherished clients</p>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 shadow-sm relative mt-4">
                            {/* Quote Icon */}
                            <div className="absolute -top-3 -left-2 text-5xl text-gray-200 font-serif leading-none">"</div>
                            <p className="text-gray-700 italic text-lg mb-6 relative z-10 leading-relaxed">
                                {testimonial.comment}
                            </p>
                            <div className="flex items-center gap-4 pt-4 border-t border-gray-200/50">
                                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-lg">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-base">{testimonial.name}</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Verified Client</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
