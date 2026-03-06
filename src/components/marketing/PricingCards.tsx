"use client";

import { useState } from "react";
import Link from "next/link";

// Each feature row — what each plan gets
// string = custom label (e.g. "Up to 10"), true = included (uses row label), false = not included
interface FeatureRow {
    label: string;
    starter: string | boolean;
    pro: string | boolean;
}

const featureRows: FeatureRow[] = [
    { label: "Custom Branded Storefront", starter: true, pro: true },
    { label: "Integrated Customer Messaging", starter: true, pro: true },
    { label: "Service Listings", starter: "Up to 10", pro: "Unlimited" },
    { label: "Comprehensive Booking Mgmt", starter: true, pro: true },
    { label: "Real-Time Scheduling", starter: true, pro: true },
    { label: "Client Management Portal", starter: true, pro: true },
    { label: "Flexible Appointment Scheduling", starter: true, pro: true },
    { label: "Customer Reviews & Ratings", starter: true, pro: true },
    { label: "Email Support", starter: "Standard", pro: "24×7 Priority" },
    { label: "AI Integration", starter: false, pro: true },
    { label: "Promotions & Marketing Tools", starter: false, pro: true },
    { label: "Advanced Reporting & Analytics", starter: false, pro: true },
    { label: "Advanced Automation", starter: false, pro: true },
];

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
);

const CrossIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export default function PricingCards() {
    const [isAnnual, setIsAnnual] = useState(false);

    const starterMonthly = 19.99;
    const starterYearly = 14.99;
    const proMonthly = 39.99;
    const proYearly = 24.99;

    return (
        <section className="relative overflow-hidden font-sans bg-[#f7f8fa] py-20 lg:py-32" id="pricing">
            <style dangerouslySetInnerHTML={{
                __html: `
                .pr-radial-glow {
                    background: radial-gradient(circle at 50% 50%, rgba(37,89,244,0.09) 0%, transparent 70%);
                }
                .pr-glass {
                    background: rgba(255,255,255,0.75);
                    backdrop-filter: blur(18px);
                    border: 1px solid rgba(255,255,255,0.85);
                    box-shadow: 0 8px 32px -8px rgba(37,89,244,0.09);
                    transition: transform 0.28s ease, box-shadow 0.28s ease;
                }
                .pr-glass:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 48px -12px rgba(37,89,244,0.14);
                }
                .pr-pro {
                    background: linear-gradient(145deg, #4f27d8 0%, #7c3aed 45%, #a855f7 100%);
                    border: 1px solid rgba(167,139,250,0.35);
                    box-shadow: 0 8px 40px -8px rgba(124,58,237,0.45);
                    transition: transform 0.28s ease, box-shadow 0.28s ease;
                }
                .pr-pro:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 24px 56px -12px rgba(124,58,237,0.55);
                }
                .pr-gradient-text {
                    background: linear-gradient(135deg, #2559f4 0%, #a855f7 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .pr-toggle-track {
                    background: rgba(255,255,255,0.9);
                    border: 1px solid #e2e8f0;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
                }
                /* Divider lines inside cards */
                .pr-divider { border-color: rgba(148,163,184,0.18); }
                .pr-divider-pro { border-color: rgba(255,255,255,0.15); }
            `}} />

            {/* bg blobs */}
            <div className="absolute top-[-12%] left-[-8%] w-[55%] h-[55%] pr-radial-glow pointer-events-none" />
            <div className="absolute bottom-[-12%] right-[-8%] w-[55%] h-[55%] pr-radial-glow pointer-events-none opacity-50" />

            <div className="relative z-10 px-6 max-w-7xl mx-auto">

                {/* Heading */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#2559f4]/10 text-[#2559f4] text-[11px] font-bold uppercase tracking-widest mb-5 border border-[#2559f4]/20">
                        Flexible Plans
                    </span>
                    <h2 className="text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight text-slate-900">
                        Scale with <span className="pr-gradient-text">Zaaro AI</span>
                    </h2>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                        Pick the plan that fits your business. Upgrade anytime as you grow.
                    </p>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-4 mb-14">
                    <span className={`text-sm font-semibold ${!isAnnual ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="relative w-16 h-8 pr-toggle-track rounded-full p-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2559f4]"
                        role="switch"
                        aria-checked={isAnnual}
                        aria-label="Toggle annual billing"
                    >
                        <div className={`absolute top-1 size-6 bg-[#2559f4] rounded-full shadow-md transition-transform duration-300 ease-in-out ${isAnnual ? "translate-x-8" : "translate-x-0"}`} />
                    </button>
                    <span className={`text-sm font-semibold ${isAnnual ? "text-slate-900" : "text-slate-400"}`}>Yearly</span>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto items-stretch">

                    {/* ── STARTER ── */}
                    <div className="pr-glass rounded-2xl p-8 flex flex-col relative">
                        {/* Header */}
                        <div className="mb-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Starter</p>
                            <h3 className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
                                <span className="text-base font-bold text-slate-500 self-start mt-1.5">$</span>
                                {isAnnual ? starterYearly : starterMonthly}
                                <span className="text-sm font-semibold text-slate-400">/mo</span>
                            </h3>
                            {isAnnual && (
                                <p className="text-xs text-slate-400 mt-0.5">Billed as ${(starterYearly * 12).toFixed(0)}/yr</p>
                            )}
                            <p className="text-slate-500 text-sm mt-3 leading-relaxed">Perfect for individuals and small startups.</p>
                        </div>

                        <Link href="/register" className="w-full mt-6 mb-8">
                            <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm transition-all">
                                Get Started
                            </button>
                        </Link>

                        {/* Feature list */}
                        <div className="flex-grow space-y-0">
                            {featureRows.map((row, i) => {
                                const available = row.starter !== false;
                                const label = typeof row.starter === "string" ? row.starter : row.label;
                                return (
                                    <div key={i}>
                                        {i > 0 && <div className="border-t pr-divider" />}
                                        <div className="flex items-center gap-3 py-2.5">
                                            <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${available ? "bg-blue-50" : "bg-slate-100"}`}>
                                                {available
                                                    ? <CheckIcon className="w-3 h-3 text-[#2559f4]" />
                                                    : <CrossIcon className="w-3 h-3 text-slate-400" />
                                                }
                                            </div>
                                            <span className={`text-[13px] leading-snug ${available ? "text-slate-700" : "text-slate-400"}`}>
                                                {available ? label : row.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── PROFESSIONAL ── */}
                    <div className="pr-pro rounded-2xl p-8 flex flex-col relative">
                        {/* Popular badge — top-right inside card */}
                        <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/30">
                            Most Popular
                        </div>

                        {/* Header */}
                        <div className="mb-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-purple-200 mb-2">Professional</p>
                            <h3 className="text-3xl font-black text-white flex items-baseline gap-1">
                                <span className="text-base font-bold text-purple-200 self-start mt-1.5">$</span>
                                {isAnnual ? proYearly : proMonthly}
                                <span className="text-sm font-semibold text-purple-200">/mo</span>
                            </h3>
                            {isAnnual && (
                                <p className="text-xs text-purple-300 mt-0.5">Billed as ${(proYearly * 12).toFixed(0)}/yr</p>
                            )}
                            <p className="text-purple-100 text-sm mt-3 leading-relaxed">Best for growing teams needing scale.</p>
                        </div>

                        <Link href="/register" className="w-full mt-6 mb-8">
                            <button className="w-full py-3.5 rounded-xl font-bold text-sm bg-white text-[#7c3aed] hover:bg-purple-50 shadow-lg shadow-purple-900/30 transition-all">
                                Try Professional
                            </button>
                        </Link>

                        {/* Feature list */}
                        <div className="flex-grow space-y-0">
                            {featureRows.map((row, i) => {
                                const available = row.pro !== false;
                                // Show custom label (e.g. "Unlimited" or "24×7 Priority") or feature name
                                const label = typeof row.pro === "string" ? row.pro : row.label;
                                // Highlight rows that are pro-exclusive
                                const isProOnly = row.starter === false;
                                return (
                                    <div key={i}>
                                        {i > 0 && <div className="border-t pr-divider-pro" />}
                                        <div className="flex items-center gap-3 py-2.5">
                                            <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isProOnly ? "bg-white/25" : "bg-white/15"}`}>
                                                <CheckIcon className="w-3 h-3 text-white" />
                                            </div>
                                            <span className={`text-[13px] leading-snug font-medium ${isProOnly ? "text-white" : "text-purple-100"}`}>
                                                {label}
                                                {isProOnly && (
                                                    <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-purple-200 bg-white/15 px-1.5 py-0.5 rounded-md">Pro</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom note */}
                <p className="text-center text-slate-400 text-sm mt-10">
                    All plans include a 14-day free trial. No credit card required.
                </p>
            </div>
        </section>
    );
}
