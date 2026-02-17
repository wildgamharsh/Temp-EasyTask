"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
    ChevronLeft,
    ChevronRight,
    Camera,
    MapPin,
    Star,
    Check,
    Share2,
    Heart,
    Info,
    Building,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    Users,
    MessageCircle,
    Phone,
    Mail,
    Clock,
    Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/BackButton";
import { StorefrontNavbar, StorefrontFooter } from "@/components/storefront/templates/VariantClaudeSonnet4";
import { MarketplaceBookingModal } from "@/components/marketplace/booking/MarketplaceBookingModal";
import { Service, OrganizerProfile, PricingConfiguration, serviceToLegacy } from "@/lib/database.types";
import { StorefrontGlobalStyles } from "@/components/storefront/StorefrontGlobalStyles";
import { ReviewsSection } from "@/components/storefront/ReviewsSection";

interface StorefrontServiceDetailProps {
    service: Service;
    organizer: OrganizerProfile;
    subdomain: string;
    startingPrice?: number;
    pricingConfig?: PricingConfiguration | null;
}

// Imports already handled in previous step (lucide-react, etc.)
// We need to add specific imports for the pricing engine
import { useMemo } from "react";
import { evaluatePrice, isStepVisible, calculatePriceRange } from "@/lib/pricing/pricing-engine";
import { PricingMode } from "@/types/pricing";

interface StorefrontServiceDetailProps {
    service: Service;
    organizer: OrganizerProfile;
    subdomain: string;
    startingPrice?: number;
    pricingConfig?: PricingConfiguration | null;
}

export function StorefrontServiceDetail({ service, organizer, subdomain, startingPrice, pricingConfig }: StorefrontServiceDetailProps) {
    // Navbar State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Carousel State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = service.images && service.images.length > 0 ? service.images : [];

    // --- Dynamic Pricing Logic ---
    const [selections, setSelections] = useState<Record<string, string[]>>(() => {
        // Initialize with default values
        const defaults: Record<string, string[]> = {};
        if (pricingConfig?.steps) {
            (pricingConfig.steps as any[]).forEach(step => {
                if (step.defaultOptionIds && step.defaultOptionIds.length > 0) {
                    defaults[step.id] = step.defaultOptionIds;
                } else if (step.options && step.options.length > 0 && step.required && (step.selectionType === 'single' || step.selectionType === 'fixed')) {
                    // Fallback: Select first option if required and single/fixed
                    defaults[step.id] = [step.options[0].id]; // keeping it strictly explicit defaults for now based on request, but sometimes auto-select first is desired. 
                    // User said "default values which are set in the pricing framework should be already selected".
                    // So strictly using defaultOptionIds is safer, but fallback is often good UX. 
                    // Let's stick to defaultOptionIds mostly, but re-reading the user prompt: "default values which are set in the pricing framework"
                    // The ConfigStep type has defaultOptionIds.
                }
            });
        }
        return defaults;
    });
    const [stepQuantities, setStepQuantities] = useState<Record<string, number>>({});
    const [globalQuantity, setGlobalQuantity] = useState(1);

    // Map DB Service to Pricing Engine Service Structure
    const richService = useMemo(() => ({
        id: service.id,
        name: service.title,
        description: service.description,
        pricingMode: PricingMode.CONFIGURED, // Always configured now
        basePrice: 0, // No base price, pure stepping
        steps: (pricingConfig?.steps || []) as any[],
        rules: (pricingConfig?.rules || []) as any[]
    }), [service, pricingConfig]);

    const pricingResult = useMemo(() => {
        return evaluatePrice(richService, selections, globalQuantity, stepQuantities);
    }, [richService, selections, globalQuantity, stepQuantities]);

    // Handlers
    const toggleSelection = (stepId: string, optionId: string, type: 'single' | 'multi' | 'fixed') => {
        setSelections(prev => {
            const current = prev[stepId] || [];
            if (type === 'single' || type === 'fixed') {
                return { ...prev, [stepId]: [optionId] };
            } else {
                if (current.includes(optionId)) {
                    return { ...prev, [stepId]: current.filter(id => id !== optionId) };
                } else {
                    return { ...prev, [stepId]: [...current, optionId] };
                }
            }
        });
    };

    const updateQuantity = (stepId: string, delta: number, optionId?: string) => {
        setStepQuantities(prev => {
            const current = prev[stepId] || 0;
            const newValue = Math.max(0, current + delta);

            // Auto-select if quantity > 0
            if (optionId) {
                setSelections(selPrev => {
                    const currentSel = selPrev[stepId] || [];
                    if (newValue > 0 && !currentSel.includes(optionId)) {
                        return { ...selPrev, [stepId]: [optionId] };
                    } else if (newValue === 0 && currentSel.includes(optionId)) {
                        return { ...selPrev, [stepId]: [] };
                    }
                    return selPrev;
                });
            }
            return { ...prev, [stepId]: newValue };
        });
    };

    const isSelected = (stepId: string, optionId: string) => {
        return selections[stepId]?.includes(optionId);
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    // Check pricing display setting
    const showPricing = organizer.storefront_settings?.pricing_display ?? true;

    return (
        <div className="min-h-screen bg-[var(--color-background)] font-sans text-[var(--color-text)]">
            <StorefrontGlobalStyles />
            <StorefrontNavbar
                businessName={organizer.business_name || organizer.name || "Storefront"}
                subdomain={subdomain}
                isMobileMenuOpen={isMobileMenuOpen}
                toggleMobileMenu={toggleMobileMenu}
                closeMobileMenu={closeMobileMenu}
                scrolled={scrolled}
            />

            <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="mb-2">
                    <BackButton label="Back to Services" />
                </div>
                {/* Breadcrumb */}
                <nav className="flex text-sm py-2" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <Link href={`/storefront/${subdomain}`} className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                                Home
                            </Link>
                        </li>
                        <li><span className="text-[var(--color-muted)] mx-2">/</span></li>
                        <li>
                            <Link href={`/storefront/${subdomain}/services`} className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                                Services
                            </Link>
                        </li>
                        <li><span className="text-[var(--color-muted)] mx-2">/</span></li>
                        <li>
                            <span className="text-[var(--color-text)] font-medium truncate max-w-[200px] sm:max-w-md">
                                {service.title}
                            </span>
                        </li>
                    </ol>
                </nav>

                <main className="py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Hero Image / Carousel */}
                            {/* Image Carousel */}
                            <div className="relative rounded-2xl overflow-hidden bg-gray-200">
                                <div className="aspect-[16/9] bg-gray-100 relative group">
                                    {images.length > 0 ? (
                                        <div className="w-full h-full relative">
                                            <Image
                                                src={images[currentImageIndex]}
                                                alt={`${service.title} - Image ${currentImageIndex + 1}`}
                                                fill
                                                className="w-full h-full object-cover transition-opacity duration-300"
                                                priority
                                            />

                                            {/* Navigation Arrows (Only if multiple images) */}
                                            {images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
                                                        }}
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg z-10"
                                                    >
                                                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
                                                        }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg z-10"
                                                    >
                                                        <ChevronRight className="w-5 h-5 text-gray-700" />
                                                    </button>

                                                    {/* Image Counter Badge */}
                                                    <div className="absolute top-4 left-4 flex space-x-2 z-10">
                                                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center">
                                                            <Camera className="w-3 h-3 mr-1" /> {currentImageIndex + 1} / {images.length}
                                                        </span>
                                                    </div>

                                                    {/* Thumbnail Strip */}
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20 overflow-x-auto max-w-[90%] py-2 px-2 no-scrollbar">
                                                        {images.map((img, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setCurrentImageIndex(idx);
                                                                }}
                                                                className={`
                                                                    flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 relative
                                                                    ${currentImageIndex === idx
                                                                        ? 'border-white shadow-md opacity-100 scale-105'
                                                                        : 'border-transparent opacity-70 hover:opacity-100'
                                                                    }
                                                                `}
                                                            >
                                                                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                            <Image src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2969&auto=format&fit=crop" alt="Default" fill className="object-cover opacity-80" />
                                        </div>
                                    )}

                                    {/* Action Buttons (Always Visible) */}
                                    <div className="absolute top-4 right-4 flex space-x-2 z-10">
                                        <button className="bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                                            <Heart className="w-5 h-5 text-gray-700" />
                                        </button>
                                        <button className="bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                                            <Share2 className="w-5 h-5 text-gray-700" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Service Info Block (Moved out of Hero) */}
                            <div className="space-y-4">
                                {/* Badges Row */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="bg-[var(--color-primary)] text-white border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                        Premium
                                    </Badge>
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center">
                                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                                        Verified Provider
                                    </Badge>
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] tracking-tight">
                                    {service.title}
                                </h1>

                                {/* Stats Row */}
                                <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--color-muted)]">
                                    {service.reviews > 0 && (
                                        <div className="flex items-center">
                                            <div className="flex items-center text-amber-400 mr-2">
                                                <Star className="w-4 h-4 fill-current" />
                                            </div>
                                            <span className="font-semibold text-[var(--color-text)] mr-1">{service.rating?.toFixed(1) || "5.0"}</span>
                                            <span>({service.reviews} reviews)</span>
                                        </div>
                                    )}
                                    {service.province && (
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1.5 text-[var(--color-muted)]" />
                                            <span>{service.province}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <Building className="w-4 h-4 mr-1.5 text-[var(--color-muted)]" />
                                        <span>Hosted by <span className="font-medium text-[var(--color-primary)]">{organizer?.business_name || "Organizer"}</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            <section className="bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-[var(--color-text)] mb-4 flex items-center">
                                    <Info className="w-5 h-5 text-[var(--color-primary)] mr-3" />
                                    About This Service
                                </h2>
                                <p className="text-[var(--color-text)]/80 leading-relaxed whitespace-pre-line mb-8">
                                    {service.description}
                                </p>
                                {service.features && service.features.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                                        <h3 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center">
                                            <Check className="w-5 h-5 text-[var(--color-primary)] mr-2.5" />
                                            What's Included
                                        </h3>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                                            {service.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3 group">
                                                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-[var(--color-primary)]" />
                                                    </span>
                                                    <span className="text-[var(--color-text)] text-sm font-medium leading-relaxed">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </section>

                            {/* PRICING & CUSTOMIZATION SECTION (NEW) */}
                            {richService.steps && richService.steps.length > 0 && (
                                <section className="bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-sm" id="pricing">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)]">
                                        <h2 className="text-2xl font-bold text-[var(--color-text)]">
                                            {showPricing ? "Pricing & Customization" : "Customization Options"}
                                        </h2>
                                    </div>

                                    <div className="space-y-8">
                                        {richService.steps.sort((a: any, b: any) => a.order - b.order).map((step: any) => {
                                            if (!isStepVisible(richService, step.id, selections)) return null;
                                            return (
                                                <div key={step.id} className="animate-in fade-in duration-500">
                                                    <label className="block text-sm font-bold text-[var(--color-muted)] mb-3 uppercase tracking-wider">
                                                        {step.name} {step.required && <span className="text-red-500">*</span>}
                                                    </label>

                                                    {/* Selection Renderers */}
                                                    {(step.selectionType === 'single' || step.selectionType === 'fixed') && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {step.options.map((option: any) => {
                                                                const active = isSelected(step.id, option.id);
                                                                return (
                                                                    <div
                                                                        key={option.id}
                                                                        onClick={() => toggleSelection(step.id, option.id, step.selectionType as any)}
                                                                        className={`
                                                                            border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 relative
                                                                            ${active
                                                                                ? 'border-[var(--color-primary)] bg-[var(--color-background)] shadow-md transform scale-[1.02]'
                                                                                : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-background)]/50'
                                                                            }
                                                                        `}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className={`font-bold ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>{option.label}</span>
                                                                            {active && <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />}
                                                                        </div>
                                                                        {showPricing && (
                                                                            <div className="text-lg font-black text-[var(--color-text)] mb-1">
                                                                                {option.baseDelta > 0 ? `$${option.baseDelta}` : 'Included'}
                                                                            </div>
                                                                        )}
                                                                        {option.description && (
                                                                            <p className="text-xs text-[var(--color-muted)]">{option.description}</p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {step.selectionType === 'multi' && (
                                                        <div className="space-y-3">
                                                            {step.options.map((option: any) => {
                                                                const active = isSelected(step.id, option.id);
                                                                return (
                                                                    <div
                                                                        key={option.id}
                                                                        onClick={() => toggleSelection(step.id, option.id, 'multi')}
                                                                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all duration-200 ${active ? 'bg-[var(--color-background)] border-[var(--color-primary)]' : 'bg-white border-[var(--color-border)] hover:border-[var(--color-primary)]'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-4">
                                                                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${active ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-muted)]'}`}>
                                                                                {active && <Check className="w-4 h-4 text-white" />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold text-[var(--color-text)]">{option.label}</p>
                                                                                {option.description && <p className="text-xs text-[var(--color-muted)]">{option.description}</p>}
                                                                            </div>
                                                                        </div>
                                                                        {showPricing && (
                                                                            <span className="font-bold text-[var(--color-text)]">
                                                                                {option.baseDelta > 0 ? `+$${option.baseDelta}` : 'Free'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {step.selectionType === 'quantity' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {step.options.map((option: any) => (
                                                                <div key={option.id} className="bg-[var(--color-background)]/30 rounded-xl p-4 border border-[var(--color-border)]">
                                                                    <label className="block text-sm font-bold text-[var(--color-text)] mb-3">{option.label}</label>
                                                                    <div className="flex items-center space-x-4">
                                                                        <button
                                                                            onClick={() => updateQuantity(step.id, -1, option.id)}
                                                                            className="w-10 h-10 flex items-center justify-center border border-[var(--color-border)] rounded-lg hover:bg-white transition-colors bg-white text-[var(--color-text)]"
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span className="text-xl font-black text-[var(--color-text)] w-12 text-center">
                                                                            {stepQuantities[step.id] || 0}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => updateQuantity(step.id, 1, option.id)}
                                                                            className="w-10 h-10 flex items-center justify-center border border-[var(--color-border)] rounded-lg hover:bg-white transition-colors bg-white text-[var(--color-text)]"
                                                                        >
                                                                            +
                                                                        </button>
                                                                        {showPricing && (
                                                                            <span className="text-sm text-[var(--color-muted)] font-medium">× ${option.baseDelta} each</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Organizer Profile Section */}
                            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Meet Your Organizer</h2>
                                <div className="flex flex-col md:flex-row md:items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-24 h-24 rounded-2xl bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden relative">
                                            {organizer?.logo_url ? (
                                                <Image src={organizer.logo_url} alt="Logo" fill className="object-cover" />
                                            ) : (
                                                (organizer?.business_name || organizer?.name || "O")
                                                    .split(' ')
                                                    .map(n => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2)
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{organizer?.business_name || organizer?.name}</h3>
                                                <p className="text-gray-500 text-sm">Member since {organizer?.created_at ? new Date(organizer.created_at).getFullYear() : '2024'}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                    <Star className="w-3 h-3 mr-1" /> Top Rated
                                                </span>
                                                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mt-4 leading-relaxed">
                                            {organizer?.description || "With a passion for creating unforgettable moments, our team specializes in transforming venues into extraordinary spaces. We've had the privilege of designing over 250 events, from intimate gatherings to grand celebrations. Every detail matters to us because we know it matters to you."}
                                        </p>

                                    </div>
                                </div>
                            </section>

                            {/* Reviews Section */}
                            {service.reviews > 0 && (
                                <section className="bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
                                    <h2 className="text-xl font-bold text-[var(--color-text)] mb-6 flex items-center">
                                        <Star className="w-5 h-5 text-[var(--color-primary)] mr-3" />
                                        Customer Reviews
                                    </h2>
                                    <ReviewsSection serviceId={service.id} />
                                </section>
                            )}
                        </div>

                        {/* Right Column - Pricing & Actions (Sticky) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Dynamic Pricing Card */}
                                <section className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
                                    <div className="relative bg-gradient-to-br from-[var(--color-background)] via-white to-[var(--color-background)] p-8 border-b border-[var(--color-border)]">
                                        <div className="relative z-10">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider">
                                                    {showPricing ? "Total Price" : "Estimated Quote"}
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-2 mb-6">
                                                {showPricing ? (
                                                    <>
                                                        <span className="text-3xl font-bold text-[var(--color-muted)]">$</span>
                                                        <span className="text-6xl font-black text-[var(--color-text)] tracking-tight">
                                                            {(pricingResult.totalPrice).toLocaleString()}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-xl font-black text-[var(--color-text)] tracking-tight">
                                                        Quote available upon request
                                                    </span>
                                                )}
                                            </div>

                                            {/* Mini Breakdown */}
                                            {showPricing && pricingResult.isValid && pricingResult.breakdown.length > 0 && (
                                                <div className="bg-[var(--color-background)]/50 rounded-xl p-4 mb-4 space-y-2">
                                                    {pricingResult.breakdown.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-[var(--color-muted)]">{item.label}</span>
                                                            <span className="font-bold text-[var(--color-text)]">${item.finalPrice}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-6 space-y-4 bg-gradient-to-b from-[var(--color-background)] to-white">
                                        <MarketplaceBookingModal
                                            service={serviceToLegacy(service)}
                                            pricingConfig={pricingConfig}
                                            initialSelections={selections}
                                            initialStepQuantities={stepQuantities}
                                            initialGlobalQuantity={globalQuantity}
                                            subdomain={subdomain}
                                            isQuoteMode={!showPricing}
                                            triggerLabel={!showPricing ? "Get a Quote" : "Book Now"}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={async () => {
                                                const supabase = createClient();
                                                const { data: { session } } = await supabase.auth.getSession();

                                                if (!session) {
                                                    // User not logged in -> Redirect to login
                                                    window.location.href = `/storefront/${subdomain}/login?next=/storefront/${subdomain}/customer/messages?organizer=${organizer.id}`;
                                                } else {
                                                    // User logged in -> Redirect to messages with organizer param
                                                    window.location.href = `/storefront/${subdomain}/customer/messages?organizer=${organizer.id}`;
                                                }
                                            }}
                                            className="w-full py-6 text-base font-semibold rounded-2xl border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-gold-05)] text-[var(--color-primary)] hover:!text-[var(--color-primary)] transition-all duration-300 hover:shadow-lg"
                                        >
                                            <MessageCircle className="w-5 h-5 mr-2" />
                                            Contact Organizer
                                        </Button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <StorefrontFooter businessName={organizer.business_name || organizer.name || "Storefront"} tagline="Making your events unforgettable." />
        </div>
    );
}
