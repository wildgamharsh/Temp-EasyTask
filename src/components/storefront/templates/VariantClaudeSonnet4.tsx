"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import GalleryModal from '@/components/storefront/GalleryModal';
import CarouselGallery from '@/components/storefront/CarouselGallery';

import type { OrganizerProfile, LegacyService, StorefrontSettings } from '@/lib/database.types';

interface VariantClaudeSonnet4Props {
    organizer: OrganizerProfile;
    services: LegacyService[];
    settings: StorefrontSettings;
}

interface NavbarProps {
    businessName: string;
    subdomain: string;
    isMobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
    scrolled: boolean;
}

interface FooterProps {
    businessName: string;
    tagline: string;
}

interface Testimonial {
    name: string;
    role?: string;
    rating?: number;
    content: string;
}

// Exportable sub-components
export function StorefrontNavbar({ businessName, subdomain, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, scrolled }: NavbarProps) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // 1. Handle Auth Session (User State)
    useEffect(() => {
        const initializeAuth = async () => {
            console.log("[NAVBAR-DEBUG] initializeAuth started");
            try {
                // Get initial session
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;

                // Only set user if different to avoid excess re-renders (though React handles object ref check usually)
                setUser(user);

                if (!user) {
                    // If no user, we are done loading.
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("[NAVBAR-DEBUG] Error getting user:", err);
                setIsLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("[NAVBAR-DEBUG] AuthStateChange:", event, session?.user?.id);
            setUser(session?.user ?? null);

            // If sign out, stop loading immediately
            if (event === 'SIGNED_OUT' || !session) {
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Fetch Profile when User Changes
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return; // Handled in the other effect (setting isLoading false)

            console.log("[NAVBAR-DEBUG] Fetching profile for user:", user.id);

            // Create a timeout for the profile fetch
            const fetchTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout fetching profile")), 8000)
            );

            try {
                await Promise.race([
                    (async () => {
                        // Check customer
                        const { data: customer } = await supabase
                            .from('customers')
                            .select('*')
                            .eq('id', user.id)
                            .maybeSingle();

                        if (customer) {
                            setProfile({ ...customer, role: 'customer' });
                        } else {
                            // Check organizer
                            const { data: organizer } = await supabase
                                .from('organizers')
                                .select('*')
                                .eq('id', user.id)
                                .maybeSingle();

                            if (organizer) {
                                setProfile({ ...organizer, role: 'organizer' });
                            }
                        }
                    })(),
                    fetchTimeout
                ]);
            } catch (err) {
                console.error("[NAVBAR-DEBUG] Error fetching profile:", err);
            } finally {
                console.log("[NAVBAR-DEBUG] Profile fetch done/timeout, stopping loading");
                setIsLoading(false);
            }
        };

        if (user) {
            // Ensure loading is true while we fetch profile
            setIsLoading(true);
            fetchProfile();
        }
    }, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push(`/storefront/${subdomain}`);
        router.refresh();
        setUser(null);
        setProfile(null);
    };

    const getDashboardRoute = () => {
        if (!profile) return `/storefront/${subdomain}/customer/bookings`;
        switch (profile.role) {
            case "admin": return "/admin";
            case "organizer": return "/dashboard";
            default: return `/storefront/${subdomain}/customer/bookings`;
        }
    };


    const nameParts = businessName.split(' ');
    const firstName = nameParts[0];
    const restName = nameParts.slice(1).join(' ');

    const initials = profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg z-50' : 'bg-white/95 backdrop-blur-md shadow-lg z-50'}`}>
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href={`/storefront/${subdomain}`} className="text-2xl font-serif font-bold text-charcoal cursor-pointer">
                        {firstName} <span className="text-gold">{restName}</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href={`/storefront/${subdomain}#home`} className="nav-link text-charcoal hover:text-gold font-medium py-2">Home</Link>
                        <Link href={`/storefront/${subdomain}/services`} className="nav-link text-charcoal hover:text-gold font-medium py-2">Services</Link>
                        <Link href={`/storefront/${subdomain}#about`} className="nav-link text-charcoal hover:text-gold font-medium py-2">About</Link>
                        <Link href={`/storefront/${subdomain}#contact`} className="nav-link text-charcoal hover:text-gold font-medium py-2">Contact</Link>

                        <div className="flex items-center ml-4 pl-4 border-l border-gray-200">
                            {isLoading ? (
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                            ) : user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 group focus:outline-none">
                                            <Avatar className="h-9 w-9 border-2 border-gold transition-transform group-hover:scale-105">
                                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                                <AvatarFallback className="bg-gold text-white font-bold">{initials}</AvatarFallback>
                                            </Avatar>
                                            <ChevronDown className="w-4 h-4 text-charcoal group-hover:text-gold transition-colors" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 mt-2" align="end">
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-semibold text-charcoal">{profile?.name || "Customer"}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={getDashboardRoute()} className="flex items-center cursor-pointer">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                <span>{profile?.role === 'customer' ? 'My Bookings' : 'Dashboard'}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/customer/profile" className="flex items-center cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Profile Settings</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Sign Out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link href={`/storefront/${subdomain}/login`} className="px-6 py-2 rounded-full bg-gold text-white hover:bg-darkGold transition-all font-medium text-sm shadow-md hover:shadow-lg">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        {user && !isLoading && (
                            <Avatar className="h-8 w-8 border border-gold">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback className="bg-gold text-white text-xs">{initials}</AvatarFallback>
                            </Avatar>
                        )}
                        <button className="text-charcoal" onClick={toggleMobileMenu}>
                            <i className="fas fa-bars text-xl"></i>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div id="mobileMenu" className={`md:hidden mt-4 pb-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                    <Link href={`/storefront/${subdomain}#home`} className="block py-2 text-charcoal hover:text-gold" onClick={closeMobileMenu}>Home</Link>
                    <Link href={`/storefront/${subdomain}/services`} className="block py-2 text-charcoal hover:text-gold" onClick={closeMobileMenu}>Services</Link>
                    <Link href={`/storefront/${subdomain}#about`} className="block py-2 text-charcoal hover:text-gold" onClick={closeMobileMenu}>About</Link>
                    <Link href={`/storefront/${subdomain}#contact`} className="block py-2 text-charcoal hover:text-gold" onClick={closeMobileMenu}>Contact</Link>

                    <div className="pt-4 border-t border-gray-100 mt-2 space-y-2">
                        {user ? (
                            <>
                                <Link href={getDashboardRoute()} className="block py-2 text-charcoal hover:text-gold font-medium" onClick={closeMobileMenu}>
                                    {profile?.role === 'customer' ? 'My Bookings' : 'Dashboard'}
                                </Link>
                                <button onClick={() => { handleSignOut(); closeMobileMenu(); }} className="block w-full text-left py-2 text-red-600 hover:text-red-700 font-medium">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link href={`/storefront/${subdomain}/login`} className="w-full block text-left py-2 text-charcoal hover:text-gold font-medium" onClick={closeMobileMenu}>
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export function StorefrontFooter({ businessName, tagline }: FooterProps) {
    const nameParts = businessName?.split(' ') || ["Elite", "Events"];
    const firstName = nameParts[0];
    const restName = nameParts.slice(1).join(' ');

    return (
        <footer className="bg-charcoal text-white py-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center">
                    <div className="text-2xl font-serif font-bold mb-4">
                        {firstName} <span className="text-gold">{restName}</span>
                    </div>
                    <p className="text-gray-400 mb-4">{tagline}</p>
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default function VariantClaudeSonnet4({ organizer, services, settings }: VariantClaudeSonnet4Props) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const [visibleImages, setVisibleImages] = useState(6);
    const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

    const businessName = settings.business_name || organizer.business_name || "Elite Decorations";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const openGalleryModal = (imageUrl: string, testimonial?: any) => {
        setSelectedImageUrl(imageUrl);
        setSelectedTestimonial(testimonial); // set testimonial
        setIsGalleryModalOpen(true);
    };

    const closeGalleryModal = () => {
        setIsGalleryModalOpen(false);
        setSelectedTestimonial(null);
    };

    return (
        <div className="font-sans text-gray-800">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

                /* CSS Variables are now injected by ThemeProvider */
                /* This allows dynamic color customization from the builder */

                .font-serif { font-family: 'Playfair Display', serif; }
                .font-sans { font-family: 'Inter', sans-serif; }
                
                .text-gold { color: var(--color-gold-primary); }
                .text-charcoal { color: var(--color-charcoal-primary); }
                .bg-gold { background-color: var(--color-gold-primary); }
                .bg-gold-20 { background-color: var(--color-gold-20); }
                .bg-lightGray { background-color: var(--color-bg-light); }
                .bg-charcoal { background-color: var(--color-charcoal-primary); }
                .hover\\:bg-darkGold:hover { background-color: var(--color-gold-dark); }
                .hover\\:text-gold:hover { color: var(--color-gold-primary) !important; }
                
                .nav-link {
                    position: relative;
                    overflow: hidden;
                    transition: color 0.3s ease;
                }
                
                .nav-link:hover {
                    color: var(--color-gold-primary) !important;
                }
                
                .gradient-bg {
                    background: var(--gradient-charcoal);
                }
                
                .gold-gradient {
                    background: var(--gradient-gold);
                }
                
                .hero-pattern {
                    background-image:
                        radial-gradient(circle at 25% 25%, var(--color-gold-10) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, var(--color-gold-05) 0%, transparent 50%);
                }
                
                .card-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .card-hover:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 25px 50px -12px var(--color-black-25);
                }
                
                .testimonial-card {
                    background: linear-gradient(145deg, var(--color-bg-white) 0%, #f9f9f9 100%);
                }
                
                /* .nav-link definition merged above */
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: var(--color-gold-primary);
                    transition: width 0.3s ease;
                }
                
                .nav-link:hover::after {
                    width: 100%;
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                
                .animate-slide-up {
                    animation: slideUp 0.8s ease-out forwards;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .service-icon {
                    background: var(--gradient-gold);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .btn-primary {
                    background: var(--gradient-gold);
                    color: var(--color-text-light);
                    border: 2px solid transparent;
                    transition: all 0.3s ease;
                }
                
                .btn-primary:hover {
                    background: transparent;
                    background-image: none;
                    color: var(--color-gold-primary);
                    border-color: var(--color-gold-primary);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px -1px var(--color-black-10), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                .btn-secondary {
                    background: transparent;
                    color: var(--color-text-primary);
                    border: 2px solid var(--color-gold-primary);
                    transition: all 0.3s ease;
                }

                .btn-secondary:hover {
                    background: var(--color-gold-primary);
                    color: var(--color-text-light);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px -1px var(--color-black-10), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
            `}</style>

            <StorefrontNavbar
                businessName={businessName}
                subdomain={organizer.subdomain || ""}
                isMobileMenuOpen={isMobileMenuOpen}
                toggleMobileMenu={toggleMobileMenu}
                closeMobileMenu={closeMobileMenu}
                scrolled={scrolled}
            />

            {/* Hero Section */}
            <section id="home" className="gradient-bg hero-pattern min-h-screen flex items-center pt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left animate-fade-in">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-none">
                                {(settings.hero_title || "Elite Events Extraordinary Experiences")
                                    .replace(/<[^>]*>?/gm, ' ') // Strip HTML tags
                                    .trim()
                                    .split(/\\s+/)
                                    .map((word, index) => (
                                        <span key={index} className={index % 2 === 0 ? "text-gold" : "text-charcoal"}>
                                            {word}{" "}
                                        </span>
                                    ))}
                            </h1>
                            <p className="text-xl text-gray-800 mb-8 max-w-lg">
                                {settings.hero_subtitle || "Transform your special moments into unforgettable memories with our premium catering and decoration services."}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Link href={settings.hero_cta_link || "#contact"}>
                                    <button className="btn-primary px-8 py-4 rounded-full font-semibold w-full sm:w-auto">
                                        {settings.hero_cta_text || "Book Consultation"}
                                    </button>
                                </Link>
                                <Link href="/#gallery">
                                    <button className="btn-secondary px-8 py-4 rounded-full font-semibold w-full sm:w-auto">
                                        View Gallery
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative animate-slide-up">
                            <div className="bg-gold-20 rounded-full absolute top-4 left-4 w-full h-full"></div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 relative">
                                <img
                                    src={settings.banner_url || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
                                    alt="Elegant Event Setup"
                                    className="w-full h-80 object-cover rounded-2xl"
                                />
                                <div className="absolute -bottom-6 -right-6 bg-gold text-white p-4 rounded-full">
                                    <i className="fas fa-star text-2xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

{/* Services Section */}
            {services && services.length > 0 && (
            <section id="services" className="py-20 bg-lightGray">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-4">
                            Our <span className="text-gold">Services</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From intimate gatherings to grand celebrations, we provide comprehensive solutions that exceed expectations.
                        </p>
                        <Link href={`/storefront/${organizer.subdomain || ""}/services`} className="inline-block mt-4 text-gold font-semibold hover:underline">
                            View All Services <i className="fas fa-arrow-right ml-1"></i>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services && services.length > 0 ? (
                            services.slice(0, 3).map((service) => (
                                <div key={service.id} className="group bg-white rounded-3xl overflow-hidden shadow-lg card-hover transition-all duration-300 hover:shadow-2xl flex flex-col h-full">
                                    {/* Image Container 16:9 aspect ratio */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                                        {service.images && service.images.length > 0 ? (
                                            <img
                                                src={service.images[0]}
                                                alt={service.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).onerror = null;
                                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1478147427282-58a87a120781?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Fallback
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <i className="fas fa-star text-4xl text-gray-300"></i>
                                            </div>
                                        )}
                                        {/* Overlay gradient for text readability if needed, or subtle effect */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-xl font-serif font-bold text-charcoal mb-3 group-hover:text-gold transition-colors duration-300">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-3 flex-1">
                                            {service.description}
                                        </p>

                                        <div className="pt-4 border-t border-gray-100">
                                            <Link href={`/storefront/${organizer.subdomain}/services/${service.id}`} className="text-gold font-semibold text-sm uppercase tracking-wide flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                                                Book Now <i className="fas fa-arrow-right text-xs"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">No services available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            )}

            {/* Gallery Section */}
            {settings.show_gallery !== false && (
                <section
                    id="gallery"
                    className="py-24 relative overflow-hidden"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-gold-primary, #000) 15%, #050505)',
                        '--branding-primary': 'var(--color-gold-primary, #D4AF37)'
                    } as React.CSSProperties}
                >
                    {/* Background elements */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-[var(--branding-primary)] opacity-10 blur-[150px] rounded-full mix-blend-screen animate-pulse duration-7000"></div>
                        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-[var(--branding-primary)] opacity-10 blur-[150px] rounded-full mix-blend-screen animate-pulse duration-10000 delay-1000"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                    </div>

                    <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col items-center">
                        <div className="text-center mb-0 relative z-20">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 tracking-tight">
                                Our <span style={{ color: 'var(--branding-primary)' }}>Gallery</span>
                            </h2>
                            <div className="h-1 w-24 mx-auto rounded-full bg-[var(--branding-primary)] opacity-50 mt-4"></div>
                        </div>

                        {settings.gallery_images && settings.gallery_images.length > 0 ? (
                            <CarouselGallery
                                images={settings.gallery_images}
                                galleryTestimonials={settings.gallery_testimonials} // Pass data
                                onImageClick={openGalleryModal}
                            />
                        ) : (
                            <div className="text-center py-20 w-full">
                                <p className="text-white/40 text-lg font-light">Add images to showcase your work.</p>
                            </div>
                        )}
                    </div>

                    {/* Gallery Modal */}
                    <GalleryModal
                        isOpen={isGalleryModalOpen}
                        onClose={closeGalleryModal}
                        imageUrl={selectedImageUrl}
                        testimonial={selectedTestimonial} // Pass testimonial
                    />
                </section>
            )}
            {/* About Us & Testimonials Section */}
            {(settings.show_about !== false || (settings.show_testimonials !== false && settings.testimonials && settings.testimonials.length > 0)) && (
                <section id="about" className="py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className={`grid ${settings.show_about !== false && settings.show_testimonials !== false && settings.testimonials && settings.testimonials.length > 0 ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-16 items-start`}>
                            {/* About Content */}
                            {settings.show_about !== false && (
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-charcoal mb-6">
                                        About <span className="text-gold">{businessName}</span>
                                    </h2>
                                    <p className="text-lg text-gray-600 mb-6">
                                        {settings.about_text || "With over a decade of experience in luxury event planning, we have established ourselves as the premier choice for discerning clients who demand excellence."}
                                    </p>
                                    <p className="text-lg text-gray-600 mb-8">
                                        Our team of talented designers, chefs, and coordinators work tirelessly to bring your vision to life, creating unforgettable experiences that reflect your unique style and personality.
                                    </p>

                                </div>
                            )}

                            {/* Testimonials */}
                            {settings.show_testimonials !== false && settings.testimonials && settings.testimonials.length > 0 && (
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-serif font-semibold text-charcoal mb-8">What Our Clients Say</h3>
                                    {settings.testimonials.map((testimonial: Testimonial, index: number) => (
                                        <div key={index} className="testimonial-card rounded-2xl p-6 shadow-lg">
                                            <div className="flex items-center mb-4">
                                                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mr-4">
                                                    <i className="fas fa-user text-white"></i>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-charcoal">{testimonial.name}</div>
                                                    <div className="text-sm text-gray-500">{testimonial.role || "Client"}</div>
                                                </div>
                                            </div>
                                            <div className="flex mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={`fas fa-star text-gold ${i < (testimonial.rating || 5) ? '' : 'opacity-30'}`}></i>
                                                ))}
                                            </div>
                                            <p className="text-gray-700 italic">
                                                &quot;{testimonial.content}&quot;
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Contact Section */}
            {settings.show_contact !== false && (
                <section id="contact" className="py-20 gradient-bg">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                                Get In <span className="text-gold">Touch</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Ready to create something extraordinary? Let&apos;s discuss your vision and bring it to life.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto bg-charcoal rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
                            {/* Background pattern/glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                            <div className={`${settings.show_social_links !== false ? 'grid md:grid-cols-2 gap-12' : 'max-w-3xl mx-auto'} relative z-10`}>
                                {/* Contact Info Column */}
                                <div className={settings.show_social_links === false ? 'w-full' : ''}>
                                    <h3 className={`text-2xl font-serif font-semibold text-white mb-8 border-b border-white/10 pb-4 ${settings.show_social_links === false ? 'text-center' : ''}`}>
                                        Contact Information
                                    </h3>

                                    <div className={settings.show_social_links === false ? 'grid md:grid-cols-2 gap-8' : 'space-y-8'}>
                                        <a href={`tel:${settings.contact_phone || "416-826-4357"}`} className="flex items-start group transition-transform hover:translate-x-2 duration-300">
                                            <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mr-4 group-hover:bg-gold transition-colors duration-300 shrink-0">
                                                <i className="fas fa-phone text-gold group-hover:text-white transition-colors"></i>
                                            </div>
                                            <div>
                                                <div className="text-gold font-semibold text-sm uppercase tracking-wider mb-1">Phone</div>
                                                <div className="text-white text-lg font-medium">{settings.contact_phone || "+1 (416)-826-4357"}</div>
                                            </div>
                                        </a>

                                        <a href={`mailto:${settings.contact_email || organizer.email}`} className="flex items-start group transition-transform hover:translate-x-2 duration-300">
                                            <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mr-4 group-hover:bg-gold transition-colors duration-300 shrink-0">
                                                <i className="fas fa-envelope text-gold group-hover:text-white transition-colors"></i>
                                            </div>
                                            <div>
                                                <div className="text-gold font-semibold text-sm uppercase tracking-wider mb-1">Email</div>
                                                <div className="text-white text-lg font-medium">{settings.contact_email || organizer.email}</div>
                                            </div>
                                        </a>

                                        {settings.address && (
                                            <a
                                                href={settings.social_links?.google_maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-start group transition-transform hover:translate-x-2 duration-300 ${settings.show_social_links === false ? 'md:col-span-2 md:justify-center' : ''}`}
                                            >
                                                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mr-4 group-hover:bg-gold transition-colors duration-300 shrink-0">
                                                    <i className="fas fa-map-marker-alt text-gold group-hover:text-white transition-colors"></i>
                                                </div>
                                                <div>
                                                    <div className="text-gold font-semibold text-sm uppercase tracking-wider mb-1">Address</div>
                                                    <div className="text-white text-lg font-medium">{settings.address}</div>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Follow Us - Only shown if enabled */}
                                {settings.show_social_links !== false && (
                                    <div className="flex flex-col justify-center items-center md:items-start border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12">
                                        <h3 className="text-2xl font-serif font-semibold text-white mb-8 text-center md:text-left">
                                            Follow Us
                                        </h3>
                                        <div className="flex gap-4">
                                            {settings.social_links?.facebook && (
                                                <a href={settings.social_links.facebook} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-gold transition-all duration-300 group shadow-lg hover:shadow-gold/20">
                                                    <i className="fab fa-facebook-f text-white text-xl group-hover:text-gold transition-colors"></i>
                                                </a>
                                            )}
                                            {settings.social_links?.instagram && (
                                                <a href={settings.social_links.instagram} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-gold transition-all duration-300 group shadow-lg hover:shadow-gold/20">
                                                    <i className="fab fa-instagram text-white text-xl group-hover:text-gold transition-colors"></i>
                                                </a>
                                            )}
                                            {settings.social_links?.twitter && (
                                                <a href={settings.social_links.twitter} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-gold transition-all duration-300 group shadow-lg hover:shadow-gold/20">
                                                    <i className="fab fa-twitter text-white text-xl group-hover:text-gold transition-colors"></i>
                                                </a>
                                            )}

                                        </div>
                                        <div className="mt-8 text-center md:text-left">
                                            <p className="text-gray-400 text-sm">
                                                Stay updated with our latest events and inspirations.
                                            </p>
                                        </div>
                                    </div>
                                )}{/* End of social links condition */}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <StorefrontFooter businessName={businessName} tagline={settings.tagline || ""} />
        </div>
    );
}
