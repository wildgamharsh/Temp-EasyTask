/**
 * Gallery Section Component
 */

"use client";

interface GallerySectionProps {
    images: string[];
    variant?: 'modern' | 'classic' | 'elegant';
}

export default function GallerySection({ images, variant = 'modern' }: GallerySectionProps) {
    if (!images || images.length === 0) return null;

    if (variant === 'modern') {
        return (
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
                        Our Work
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="aspect-square overflow-hidden rounded-lg hover:scale-105 transition-transform cursor-pointer">
                                <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'classic') {
        return (
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-serif font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
                        Gallery
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {images.map((image, index) => (
                            <div key={index} className="aspect-[4/3] overflow-hidden rounded-lg border-4" style={{ borderColor: 'var(--color-primary)' }}>
                                <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Elegant variant
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-5xl font-light mb-16" style={{ color: 'var(--color-primary)' }}>
                    Portfolio
                </h2>
                <div className="columns-1 md:columns-3 gap-6 space-y-6">
                    {images.map((image, index) => (
                        <div key={index} className="break-inside-avoid">
                            <img src={image} alt={`Gallery ${index + 1}`} className="w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
