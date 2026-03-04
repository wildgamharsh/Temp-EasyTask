"use client";

import { useState } from "react";
import Link from "next/link";

interface PricingPlan {
    name: string;
    price: number;
    launchPrice: number;
    description: string;
    isPopular?: boolean;
    features: string[];
}

const plans: PricingPlan[] = [
    {
        name: "Pro",
        price: 29.99,
        launchPrice: 19.99,
        description: "The essential toolkit for event organizers to manage their business, bookings, and availability seamlessly.",
        features: [
            "Customizable Storefront",
            "Customer Chat",
            "List up to 10 event services",
            "Booking Management System",
            "Real-time Calendar Management",
            "Client Dashboard",
            "Custom Time & Date Selection",
            "Standard Email Support",
            "Basic Reviews & Ratings"
        ]
    },
    {
        name: "Pro +",
        price: 59.99,
        launchPrice: 39.99,
        description: "The ultimate growth tier for established event organizers. Get everything in Pro, plus powerful AI tools.",
        isPopular: true,
        features: [
            "Everything in Pro, plus:",
            "Unlimited Service Listings",
            "AI One-Step Service Creation",
            "Coupons & Discounts Marketing",
            "Offer Broadcasting",
            "Premium Marketplace Visibility",
            "Advanced Reporting & Analytics",
            "24/7 Priority Support",
            "Advanced Automations"
        ]
    }
];

export default function PricingCards() {
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <section className="py-24 relative overflow-hidden bg-brand-50/50" id="pricing">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-brand-200/50 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-indigo-200/50 blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 fade-up">
                    <span className="text-brand-600 font-bold tracking-widest uppercase text-sm mb-4 block">
                        Pricing
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-brand-900 mb-6 leading-tight">
                        Simple, transparent pricing <br className="hidden sm:block" />
                        for <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-indigo-600">event organizers.</span>
                    </h2>
                    <p className="text-lg text-slate-600">
                        Choose the best plan to grow your event service business on Zaaro AI. No hidden fees.
                    </p>

                    {/* Billing Toggle (Visual Only for now based on prompt, but standard practice) */}
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <span className={`text-sm font-semibold ${!isAnnual ? 'text-brand-900' : 'text-slate-500'}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative inline-flex h-7 w-14 items-center rounded-full bg-brand-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                            role="switch"
                            aria-checked={isAnnual}
                        >
                            <span
                                className={`${isAnnual ? 'translate-x-8 bg-brand-600' : 'translate-x-1 bg-white'} inline-block h-5 w-5 transform rounded-full transition-transform shadow-md`}
                            />
                        </button>
                        <span className={`text-sm font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-brand-900' : 'text-slate-500'}`}>
                            Annually <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-wide">Save 20%</span>
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-3xl bg-white p-8 xl:p-10 transition-all duration-300 hover:shadow-2xl fade-up border ${plan.isPopular ? 'border-brand-500 shadow-xl scale-100 md:scale-105 z-10' : 'border-slate-200 shadow-lg scale-100 z-0'} `}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-linear-to-r from-brand-500 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <p className="text-sm text-slate-500 h-10">{plan.description}</p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-2">
                                <div className="flex flex-col">
                                    {/* Strikethrough for original price */}
                                    <span className="text-lg text-slate-400 line-through decoration-slate-300 decoration-1 font-medium font-mono leading-none">
                                        ${plan.price}
                                    </span>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-5xl font-extrabold text-brand-900 tracking-tight">${plan.launchPrice}</span>
                                        <span className="text-slate-500 font-medium">/mo</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-4 block">Launch Discount Applies!</span>
                                <Link
                                    href="/register"
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group ${plan.isPopular
                                        ? 'bg-linear-to-r from-brand-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-brand-500/30'
                                        : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                                        }`}
                                >
                                    Get Started
                                    <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                                </Link>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">What's included</p>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className={`mt-0.5 rounded-full p-1 bg-brand-100 text-brand-600 shrink-0`}>
                                            <i className="fa-solid fa-check text-[10px] w-3 h-3 flex items-center justify-center"></i>
                                        </div>
                                        <span className={i === 0 && plan.isPopular ? "text-slate-900 font-semibold text-sm" : "text-slate-600 text-sm"}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
