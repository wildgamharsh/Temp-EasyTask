/**
 * Storefront Navigation Component
 * Fixed navigation with smooth scroll, auto-hide, and variant styling
 */

"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface NavLink {
    id: string;
    label: string;
}

interface StorefrontNavProps {
    businessName: string;
    logoUrl?: string;
    variant?: 'modern' | 'classic' | 'elegant';
    sections: NavLink[];
    ctaText?: string;
    ctaLink?: string;
    subdomain?: string;
}

export default function StorefrontNav({
    businessName,
    logoUrl,
    variant = 'modern',
    sections,
    ctaText = "Book Now",
    ctaLink = "#contact",
    subdomain
}: StorefrontNavProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const pathname = usePathname();
    const router = useRouter();

    const isHomePage = !subdomain || pathname === `/storefront/${subdomain}`;

    // Handle scroll behavior (only on homepage or if relevant)
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 50);

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Track active section with Intersection Observer (Only on homepage)
    useEffect(() => {
        if (!isHomePage) return;

        const observerOptions = {
            rootMargin: "-20% 0px -80% 0px",
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [sections, isHomePage]);

    // Smooth scroll or Navigate
    const handleNavClick = (sectionId: string) => {
        if (isHomePage) {
            const element = document.getElementById(sectionId);
            if (element) {
                const navHeight = 80;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - navHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        } else if (subdomain) {
            // Navigate to homepage with hash
            router.push(`/storefront/${subdomain}#${sectionId}`);
        }
        setIsMobileMenuOpen(false);
    };

    // Variant-specific styles (Helper functions remain same)
    const getNavStyles = () => {
        const baseStyles = `fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`;
        if (variant === 'modern') return `${baseStyles} ${isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`;
        if (variant === 'classic') return `${baseStyles} ${isScrolled ? 'bg-white shadow-md border-b-2' : 'bg-white/95'} border-b`;
        return `${baseStyles} ${isScrolled ? 'bg-white/95 shadow-sm' : 'bg-transparent'}`;
    };

    const getLinkStyles = (isActive: boolean) => {
        if (variant === 'modern') {
            return `px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                ? 'text-white font-semibold'
                : isScrolled
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-white hover:text-white/80'
                } ${isActive ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]' : ''}`;
        }
        // ... classic and elegant styles same as before ...
        if (variant === 'classic') {
            return `px-4 py-2 font-serif transition-all duration-200 ${isActive ? 'font-bold border-b-2' : 'hover:opacity-70'}`;
        }
        return `px-4 py-2 font-light transition-all duration-200 ${isActive ? 'border-b border-current' : 'hover:opacity-70'}`;
    };

    return (
        <nav className={getNavStyles()} style={{
            borderColor: variant === 'classic' ? 'var(--color-primary)' : undefined,
            color: variant === 'modern' && !isScrolled && isHomePage ? 'white' : 'var(--color-text)'
        }}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo/Brand */}
                    <button
                        onClick={() => handleNavClick('hero')}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        {logoUrl && (
                            <img
                                src={logoUrl}
                                alt={businessName}
                                className="h-10 w-10 object-contain rounded-full"
                            />
                        )}
                        <span className={`font-bold text-xl ${variant === 'classic' ? 'font-serif' : variant === 'elegant' ? 'font-light text-2xl' : ''
                            }`}>
                            {businessName}
                        </span>
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {sections.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => handleNavClick(id)}
                                className={getLinkStyles(activeSection === id)}
                                style={{
                                    borderColor: variant === 'classic' && activeSection === id ? 'var(--color-primary)' : undefined,
                                    color: variant === 'modern' && !isScrolled && isHomePage ? 'white' : undefined
                                }}
                            >
                                {label}
                            </button>
                        ))}

                        {/* CTA Button */}
                        {ctaText && (
                            <div className="ml-4">
                                {ctaLink.startsWith('#') ? (
                                    <Button
                                        onClick={() => handleNavClick(ctaLink.replace('#', ''))}
                                        className={`${variant === 'modern'
                                            ? 'bg-white text-gray-900 hover:bg-gray-100'
                                            : variant === 'classic'
                                                ? 'font-serif'
                                                : 'font-light'
                                            }`}
                                        style={{
                                            backgroundColor: variant !== 'modern' ? 'var(--color-primary)' : undefined,
                                            color: variant !== 'modern' ? 'white' : undefined
                                        }}
                                    >
                                        {ctaText}
                                    </Button>
                                ) : (
                                    <a href={ctaLink}>
                                        <Button
                                            className={`${variant === 'modern'
                                                ? 'bg-white text-gray-900 hover:bg-gray-100'
                                                : variant === 'classic'
                                                    ? 'font-serif'
                                                    : 'font-light'
                                                }`}
                                            style={{
                                                backgroundColor: variant !== 'modern' ? 'var(--color-primary)' : undefined,
                                                color: variant !== 'modern' ? 'white' : undefined
                                            }}
                                        >
                                            {ctaText}
                                        </Button>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t shadow-lg text-gray-900">
                    <div className="container mx-auto px-4 py-4 space-y-2">
                        {sections.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => handleNavClick(id)}
                                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${activeSection === id
                                    ? 'bg-gray-100 font-semibold'
                                    : 'hover:bg-gray-50'
                                    }`}
                                style={{
                                    color: activeSection === id ? 'var(--color-primary)' : undefined
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
