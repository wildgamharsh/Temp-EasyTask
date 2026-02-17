"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Service as DBService, PricingConfiguration } from '@/lib/database.types';
import { Service, SelectionState, QuantityState, PricingMode } from '@/types/pricing';
import { evaluatePrice, calculatePriceRange, isStepVisible } from '@/lib/pricing/pricing-engine';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility, or I'll use template literals

interface ServiceDetailClientProps {
    service: DBService & { organizer: any };
    pricingConfig: PricingConfiguration | null;
}

export default function ServiceDetailClient({ service: dbService, pricingConfig }: ServiceDetailClientProps) {
    // --- Logic & State (Preserved) ---
    const richService: Service = useMemo(() => ({
        id: dbService.id,
        name: dbService.title,
        description: dbService.description,
        pricingMode: (pricingConfig?.pricing_mode as PricingMode) || PricingMode.FIXED,
        basePrice: (pricingConfig?.metadata?.basePrice as number) || 0,
        steps: pricingConfig?.steps || [],
        rules: pricingConfig?.rules || []
    }), [dbService, pricingConfig]);

    const [selections, setSelections] = useState<SelectionState>({});
    const [stepQuantities, setStepQuantities] = useState<QuantityState>({});
    const [globalQuantity, setGlobalQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('overview');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Ensure images array exists
    const images = dbService.images && dbService.images.length > 0 ? dbService.images : [];

    const pricingResult = useMemo(() => {
        return evaluatePrice(richService, selections, globalQuantity, stepQuantities);
    }, [richService, selections, globalQuantity, stepQuantities]);

    const priceRange = useMemo(() => {
        return calculatePriceRange(richService.basePrice, richService.steps, richService.rules);
    }, [richService]);

    // Heuristic: Show "Starting from" if current price equals min price OR if current selection is invalid (defaults not satisfied yet)
    // Actually, distinct UX: 
    // - If user hasn't interacted much or result is invalid -> "Starting from X"
    // - If user has valid selection -> "Total X"
    // - Simplest: If !isValid -> Starting from Min. If isValid -> Estimated Total.
    const showStartingFrom = !pricingResult.isValid || pricingResult.totalPrice <= priceRange.minPrice;
    const displayPrice = showStartingFrom ? priceRange.minPrice : pricingResult.totalPrice;

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
        // If optionId is provided, we might need it for selection sync, but for now assuming 1 quantity per step
        // or passing step object logic.
        // Adapting previous logic:
        setStepQuantities(prev => {
            const current = prev[stepId] || 0;
            const newValue = Math.max(0, current + delta);

            // Sync selection if needed (auto-select option if quantity > 0)
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

    // --- Render ---

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/" className="flex items-center space-x-2">
                                <Image
                                    src="/images/logo-bgr.png"
                                    alt="EasyTask"
                                    width={140}
                                    height={40}
                                    className="h-10 w-auto"
                                    priority
                                />
                            </Link>
                            <div className="hidden md:flex items-center space-x-6">
                                <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Browse</Link>
                                <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center">
                                    Categories
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">Log in</button>
                            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex items-center space-x-2 text-sm">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                        <Link href="#" className="text-gray-500 hover:text-gray-700">Services</Link>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                        <span className="text-gray-900 font-medium truncate">{dbService.title}</span>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Hero Section */}
                        <section>
                            {/* Image Carousel */}
                            <div className="relative rounded-2xl overflow-hidden bg-gray-200">
                                <div className="aspect-[16/9] bg-gray-100 relative group">
                                    {images.length > 0 ? (
                                        <div className="w-full h-full relative">
                                            <img
                                                src={images[currentImageIndex]}
                                                alt={`${dbService.title} - Image ${currentImageIndex + 1}`}
                                                className="w-full h-full object-cover transition-opacity duration-300"
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
                                                        <i className="fas fa-chevron-left text-gray-700"></i>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
                                                        }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg z-10"
                                                    >
                                                        <i className="fas fa-chevron-right text-gray-700"></i>
                                                    </button>

                                                    {/* Image Counter Badge */}
                                                    <div className="absolute top-4 left-4 flex space-x-2 z-10">
                                                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                                                            <i className="fas fa-camera mr-1"></i> {currentImageIndex + 1} / {images.length}
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
                                                                    flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200
                                                                    ${currentImageIndex === idx
                                                                        ? 'border-white shadow-md opacity-100 scale-105'
                                                                        : 'border-transparent opacity-70 hover:opacity-100'
                                                                    }
                                                                `}
                                                            >
                                                                <img
                                                                    src={img}
                                                                    alt={`Thumbnail ${idx + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
                                    )}

                                    {/* Action Buttons (Always Visible) */}
                                    <div className="absolute top-4 right-4 flex space-x-2 z-10">
                                        <button className="bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                                            <i className="far fa-heart text-gray-700"></i>
                                        </button>
                                        <button className="bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                                            <i className="fas fa-share-alt text-gray-700"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Service Info */}
                            <div className="mt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">Premium</span>
                                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
                                                <i className="fas fa-check-circle mr-1"></i>Verified
                                            </span>
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{dbService.title}</h1>
                                        <p className="text-gray-600 text-base mb-4 line-clamp-2">{dbService.description ? dbService.description.substring(0, 150) + "..." : ""}</p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <div className="flex items-center">
                                                <div className="flex items-center text-yellow-400">
                                                    <i className="fas fa-star"></i>
                                                    <i className="fas fa-star"></i>
                                                    <i className="fas fa-star"></i>
                                                    <i className="fas fa-star"></i>
                                                    <i className="fas fa-star-half-alt"></i>
                                                </div>
                                                <span className="ml-2 font-semibold text-gray-900">{dbService.rating || '4.8'}</span>
                                                <span className="text-gray-500 ml-1">({dbService.reviews || 128} reviews)</span>
                                            </div>
                                            <div className="flex items-center text-gray-500">
                                                <i className="fas fa-map-marker-alt mr-1"></i>
                                                <span>{dbService.province || 'Location not specified'}</span>
                                            </div>
                                            <div className="flex items-center text-gray-500">
                                                <i className="fas fa-calendar-check mr-1"></i>
                                                <span>250+ events</span>
                                            </div>
                                        </div>

                                        {/* Organizer Quick Info */}
                                        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                {dbService.organizer?.name?.[0] || 'O'}
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">Hosted by <span className="text-blue-600">{dbService.organizer?.business_name || dbService.organizer?.name}</span></p>
                                                <p className="text-xs text-gray-500">Responds within 2 hours • 8 years experience</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tabs Navigation */}
                        <div className="border-b border-gray-200 sticky top-16 bg-gray-50 z-40 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                            <nav className="flex space-x-8 overflow-x-auto" id="tabs">
                                {['Overview', 'Pricing', 'Reviews', 'FAQ'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.toLowerCase()
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Overview Section */}
                        {activeTab === 'overview' && (
                            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in duration-300">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Service</h2>
                                <div className="prose prose-gray max-w-none">
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                        {dbService.description}
                                    </p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">What's Included</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {dbService.features && dbService.features.length > 0 ? (
                                        dbService.features.map((feature, i) => (
                                            <div key={i} className="flex items-start space-x-3">
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <i className="fas fa-check text-green-600 text-xs"></i>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{feature}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        // Static fallback content if no features
                                        <>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <i className="fas fa-check text-green-600 text-xs"></i>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Complete Venue Styling</p>
                                                    <p className="text-sm text-gray-500">Full venue transformation with cohesive design</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <i className="fas fa-check text-green-600 text-xs"></i>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Premium Floral Arrangements</p>
                                                    <p className="text-sm text-gray-500">Fresh flowers for centerpieces and décor</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-8">Ideal For</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">Weddings</span>
                                    <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">Engagement Parties</span>
                                    <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">Anniversary Celebrations</span>
                                    <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">Corporate Events</span>
                                </div>
                            </section>
                        )}

                        {/* Pricing & Customization Section */}
                        <div id="pricing" className="scroll-mt-24"></div>
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Pricing & Customization</h2>
                                <span className="text-sm text-gray-500">Base Price: <span className="text-2xl font-bold text-gray-900">${richService.basePrice}</span></span>
                            </div>

                            {/* Dynamic Pricing Steps */}
                            <div className="space-y-8">
                                {richService.steps && richService.steps.sort((a, b) => a.order - b.order).map(step => {
                                    if (!isStepVisible(richService, step.id, selections)) return null;
                                    return (
                                        <div key={step.id}>
                                            <label className="block text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider text-xs">
                                                {step.name} {step.required && <span className="text-red-500">*</span>}
                                            </label>

                                            {/* Single / Fixed Selection (Packages) */}
                                            {(step.selectionType === 'single' || step.selectionType === 'fixed') && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {step.options.map(option => {
                                                        const active = isSelected(step.id, option.id);
                                                        return (
                                                            <div
                                                                key={option.id}
                                                                onClick={() => toggleSelection(step.id, option.id, step.selectionType as any)}
                                                                className={`
                                                                border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 relative
                                                                ${active
                                                                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                                    }
                                                            `}
                                                            >
                                                                {active && (
                                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                                                                        Selected
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className={`font-semibold ${active ? 'text-blue-900' : 'text-gray-900'}`}>{option.label}</span>
                                                                    {active ? (
                                                                        <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                                                                            <i className="fas fa-check text-white text-xs"></i>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                                                    )}
                                                                </div>
                                                                <p className="text-2xl font-bold text-gray-900 mb-1">
                                                                    {option.baseDelta > 0 ? `$${option.baseDelta}` : 'Included'}
                                                                </p>
                                                                {option.description && (
                                                                    <p className="text-sm text-gray-500">{option.description}</p>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}

                                            {/* Multi Selection (Add-ons) */}
                                            {step.selectionType === 'multi' && (
                                                <div className="space-y-3">
                                                    {step.options.map(option => {
                                                        const active = isSelected(step.id, option.id);
                                                        return (
                                                            <label
                                                                key={option.id}
                                                                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-colors ${active ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={active}
                                                                        onChange={() => toggleSelection(step.id, option.id, 'multi')}
                                                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    <div className="ml-3">
                                                                        <p className="font-medium text-gray-900">{option.label}</p>
                                                                        {option.description && <p className="text-sm text-gray-500">{option.description}</p>}
                                                                    </div>
                                                                </div>
                                                                <span className="font-semibold text-gray-900">
                                                                    {option.baseDelta > 0 ? `+$${option.baseDelta}` : 'Free'}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Quantity Selection */}
                                            {step.selectionType === 'quantity' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {step.options.map(option => (
                                                        <div key={option.id}>
                                                            <label className="block text-sm font-medium text-gray-700 mb-3">{option.label}</label>
                                                            <div className="flex items-center space-x-4">
                                                                <button
                                                                    onClick={() => updateQuantity(step.id, -1, option.id)}
                                                                    className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <i className="fas fa-minus text-gray-500 text-sm"></i>
                                                                </button>
                                                                <span className="text-xl font-semibold text-gray-900 w-12 text-center">
                                                                    {stepQuantities[step.id] || 0}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(step.id, 1, option.id)}
                                                                    className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <i className="fas fa-plus text-gray-500 text-sm"></i>
                                                                </button>
                                                                <span className="text-sm text-gray-500">× ${option.baseDelta} each</span>
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

                        {/* Organizer Profile Section */}
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Meet Your Organizer</h2>
                            <div className="flex flex-col md:flex-row md:items-start gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-24 h-24 rounded-2xl bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-400">
                                        {dbService.organizer?.name?.[0] || 'O'}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{dbService.organizer?.business_name || dbService.organizer?.name}</h3>
                                            <p className="text-gray-500 text-sm">Member since {new Date(dbService.organizer?.created_at).getFullYear()}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                <i className="fas fa-award mr-1"></i> Top Rated
                                            </span>
                                            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                <i className="fas fa-shield-alt mr-1"></i> Verified
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 mt-4 leading-relaxed">
                                        With a passion for creating unforgettable moments, our team specializes in transforming venues into extraordinary spaces. We've had the privilege of designing over 250 events, from intimate gatherings to grand celebrations. Every detail matters to us because we know it matters to you.
                                    </p>
                                    <button className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-700 flex items-center">
                                        View Full Profile
                                        <i className="fas fa-arrow-right ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Reviews Section */}
                        <div id="reviews" className="scroll-mt-24"></div>
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                                <span className="text-sm text-gray-500">128 reviews</span>
                            </div>

                            {/* Rating Summary - Static Placeholder */}
                            <div className="flex flex-col md:flex-row gap-8 mb-8 p-6 bg-gray-50 rounded-xl">
                                <div className="text-center md:text-left">
                                    <div className="text-5xl font-bold text-gray-900">4.8</div>
                                    <div className="flex items-center justify-center md:justify-start text-yellow-400 mt-2">
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star"></i>
                                        <i className="fas fa-star-half-alt"></i>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Based on 128 reviews</p>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <div key={star} className="flex items-center">
                                            <span className="text-sm text-gray-600 w-8">{star}</span>
                                            <i className="fas fa-star text-yellow-400 text-xs mx-2"></i>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="bg-blue-600 h-full rounded-full" style={{ width: star === 5 ? '78%' : star === 4 ? '15%' : '2%' }}></div>
                                            </div>
                                            <span className="text-sm text-gray-500 w-12 text-right">{star === 5 ? '78%' : star === 4 ? '15%' : '2%'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* FAQ Section */}
                        <div id="faq" className="scroll-mt-24"></div>
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                                        <span className="font-medium text-gray-900">How far in advance should I book?</span>
                                        <i className="fas fa-chevron-down text-gray-400"></i>
                                    </button>
                                    <div className="px-4 pb-4">
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            We recommend booking at least 3-6 months in advance for weddings and large events to ensure availability.
                                        </p>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                                        <span className="font-medium text-gray-900">Do you provide setup and breakdown services?</span>
                                        <i className="fas fa-chevron-down text-gray-400"></i>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar - Sticky */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                <div className="flex items-baseline justify-between mb-6">
                                    <div>
                                        <span className="text-sm text-gray-500">{showStartingFrom ? 'Starting from' : 'Estimated Total'}</span>
                                        <div className="flex items-baseline">
                                            <span className="text-3xl font-bold text-gray-900">${displayPrice.toLocaleString()}</span>
                                            {showStartingFrom && <span className="text-gray-500 ml-2">estimated</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <i className="fas fa-star text-yellow-400 mr-1"></i>
                                        <span className="font-semibold">{dbService.rating || '4.8'}</span>
                                        <span className="text-gray-400 ml-1">({dbService.reviews || 128})</span>
                                    </div>
                                </div>

                                {/* Quick Summary */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-2">
                                    <h4 className="font-medium text-gray-700 mb-2">Breakdown</h4>
                                    {pricingResult.breakdown.map((item, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span className="text-gray-600 truncate pr-2 max-w-[200px]">{item.label}</span>
                                            <span className="text-gray-900 font-medium">${item.finalPrice}</span>
                                        </div>
                                    ))}
                                    {pricingResult.breakdown.length === 0 && (
                                        <p className="text-gray-400 italic">No items selected</p>
                                    )}
                                </div>

                                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all mb-3 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    Book Now
                                </button>
                                <button className="w-full border border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                                    Contact Organizer
                                </button>

                                {pricingResult.errors.length > 0 && (
                                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">
                                        {pricingResult.errors.map((e, i) => <div key={i}>{e}</div>)}
                                    </div>
                                )}
                            </div>

                            {/* Similar Services */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4">Similar Services</h3>
                                <div className="space-y-4">
                                    <a href="#" className="flex items-start space-x-3 group">
                                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                                            <i className="fas fa-image"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">Luxury Floral Arrangements</h4>
                                            <p className="text-xs text-gray-500">By Garden Dreams Co.</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">From $1,200</p>
                                        </div>
                                    </a>
                                    <a href="#" className="flex items-start space-x-3 group">
                                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                                            <i className="fas fa-image"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">Event Lighting Design</h4>
                                            <p className="text-xs text-gray-500">By Lumina Events</p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">From $800</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </main >
        </div >
    );
}
