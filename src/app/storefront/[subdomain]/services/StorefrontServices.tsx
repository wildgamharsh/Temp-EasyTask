"use client";

import { useState, useEffect, useCallback } from "react";
import { ServiceFilter, FilterState } from "@/components/marketplace/ServiceFilter";
import { ServiceCard } from "@/components/marketplace/ServiceCard";
import { LegacyService as Service, OrganizerProfile } from "@/lib/database.types";
import { Loader2 } from "lucide-react";
import { StorefrontNavbar, StorefrontFooter } from "@/components/storefront/templates/VariantClaudeSonnet4";
import Link from 'next/link';
import { StorefrontGlobalStyles } from "@/components/storefront/StorefrontGlobalStyles";

interface StorefrontServicesProps {
    organizer: OrganizerProfile;
    services: Service[];
    subdomain: string;
}

export default function StorefrontServices({ organizer, services, subdomain }: StorefrontServicesProps) {
    const [mounted, setMounted] = useState(false);
    const [filteredServices, setFilteredServices] = useState<Service[]>(services);
    const [loading, setLoading] = useState(false);

    // Navbar State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            // Theme often uses this to change transparency
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    // Sync filteredServices when initial services prop changes (e.g. after async fetch in parent)
    useEffect(() => {
        setFilteredServices(services);
    }, [services]);

    const handleFilterChange = useCallback((filters: FilterState) => {
        // Storefront only has ONE organizer, so ignore organizerId filter
        let result = [...services];

        // Search
        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(
                (s) =>
                    s.title.toLowerCase().includes(q) ||
                    s.description.toLowerCase().includes(q)
            );
        }

        // Pricing Type - Legacy filter removed as all services are now dynamic/configured
        /*
        if (filters.pricingType !== "all") {
            result = result.filter((s) =>
                (s.pricing_model === filters.pricingType) ||
                (s.pricing_type === filters.pricingType)
            );
        */

        // Price Range
        // Use min_price as valid comparison
        // Treat 5000 as "5000+" (no upper limit)
        if (filters.maxPrice >= 5000) {
            result = result.filter((s) => (s.min_price || 0) >= filters.minPrice);
        } else {
            result = result.filter(
                (s) => {
                    const price = s.min_price || 0;
                    return price >= filters.minPrice && price <= filters.maxPrice;
                }
            );
        }

        setFilteredServices(result);
    }, [services]);

    if (!mounted) return null;

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

            <main className="pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <nav className="flex text-sm py-2 mb-4" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2">
                                <li>
                                    <Link
                                        href={`/storefront/${subdomain}`}
                                        className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <span className="text-[var(--color-muted)] mx-2">/</span>
                                </li>
                                <li>
                                    <span className="text-[var(--color-text)] font-medium">
                                        Services
                                    </span>
                                </li>
                            </ol>
                        </nav>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-2">
                            Our Services
                        </h1>
                        <p className="text-[var(--color-muted)]">
                            Browse and book our professional services.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar (Desktop) / Sheet (Mobile) */}
                        <aside className="w-full lg:w-1/4 flex-shrink-0">
                            {/* 
                                Note: ServiceFilter might have hardcoded colors. 
                                Ideally, we'd refactor it or wrap it to use CSS variables.
                                For now, we trust it renders neutrally enough or we might see some blue.
                                To fix perfectly, we'd need to fork ServiceFilter or make it themable.
                                Assuming standard shadcn/tailwind, it might use 'bg-white' etc. which is fine.
                            */}
                            <div className="bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-sm sticky top-24">
                                <h2 className="font-bold text-lg mb-4 hidden lg:block text-[var(--color-text)]">Filters</h2>
                                <ServiceFilter
                                    onFilterChange={handleFilterChange}
                                    // Single organizer, so filter should probably hide or lock this
                                    organizers={[{ id: organizer.id, name: organizer.business_name || organizer.name || "Us" }]}
                                />
                            </div>
                        </aside>

                        {/* Results Grid */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 text-sm text-[var(--color-muted)]">
                                        Showing <strong>{filteredServices.length}</strong> results
                                    </div>

                                    {filteredServices.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {filteredServices.map((service) => (
                                                <div key={service.id} className="relative group h-full">
                                                    <ServiceCard
                                                        service={service}
                                                        subdomain={subdomain}
                                                        hideRating={true}
                                                        showPricing={organizer.storefront_settings?.pricing_display !== false}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-12 text-center">
                                            <div className="w-16 h-16 bg-[var(--color-background)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-muted)]">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">No services found</h3>
                                            <p className="text-[var(--color-muted)] max-w-sm mx-auto">
                                                Try adjusting your filters to find what you're looking for.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <StorefrontFooter businessName={organizer.business_name || organizer.name || "Storefront"} tagline="Making your events unforgettable." />
        </div>
    );
}

// Inline Search Icon to avoid import issues
function Search(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}

