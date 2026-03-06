"use client";

import { useState } from "react";
import Link from "next/link";

interface PricingPlan {
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    description: string;
    isPopular?: boolean;
    features: string[];
}

const plans: PricingPlan[] = [
    {
        name: "Starter",
        monthlyPrice: 19.99,
        yearlyPrice: 14.99,
        description: "Perfect for individuals and small startups.",
        features: [
            "Custom Branded Storefront",
            "Integrated Customer Messaging",
            "Multi-Service Listing (Up to 10 Services)",
            "Comprehensive Booking Management",
            "Real-Time Scheduling System",
            "Client Management Portal",
            "Flexible Appointment Scheduling",
            "Standard Email Support",
            "Customer Reviews & Rating System"
        ]
    },
    {
        name: "Professional",
        monthlyPrice: 39.99,
        yearlyPrice: 24.99,
        description: "Best for growing teams needing scale.",
        isPopular: true,
        features: [
            "Custom Branded Storefront",
            "Integrated Customer Messaging",
            "Comprehensive Booking Management",
            "Real-Time Scheduling System",
            "Client Management Portal",
            "Flexible Appointment Scheduling",
            "Standard Email Support",
            "Customer Reviews & Rating System",
            "Unlimited Service Creation",
            "AI Integration",
            "Promotions and Marketing Tools",
            "24×7 Support",
            "Advanced Reporting and Analytics",
            "Advanced Automation"
        ]
    }
];

export default function PricingCards() {
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <section className="relative overflow-x-hidden font-sans text-slate-800 bg-[#f7f8fa] py-20 lg:py-32" id="pricing">
            <style dangerouslySetInnerHTML={{
                __html: `
                .pricing-glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 10px 30px -10px rgba(37, 89, 244, 0.08);
                    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                }
                .pricing-glass-card:hover {
                    border-color: rgba(168, 85, 247, 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px -15px rgba(37, 89, 244, 0.15);
                }
                .pricing-gradient-text {
                    background: linear-gradient(135deg, #2559f4 0%, #a855f7 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .pricing-gradient-bg {
                    background: linear-gradient(135deg, #2559f4 0%, #a855f7 100%);
                }
                .pricing-radial-glow {
                    background: radial-gradient(circle at 50% 50%, rgba(37, 89, 244, 0.1) 0%, transparent 70%);
                }
            `}} />

            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] pricing-radial-glow pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] pricing-radial-glow pointer-events-none opacity-60"></div>

            <div className="relative z-10 px-6 max-w-7xl mx-auto">
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#2559f4]/10 text-[#2559f4] text-xs font-bold uppercase tracking-widest mb-6 border border-[#2559f4]/20">
                        Flexible Plans for Every Scale
                    </span>
                    <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tight text-slate-900">
                        Scale your business with <span className="pricing-gradient-text">Zaaro AI</span>
                    </h2>
                    <p className="text-slate-500 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                        Choose the perfect plan for your team's needs. Unlock powerful analytics, seamless integrations, and world-class support.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4 mb-16">
                    <span className={`text-sm font-semibold ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>

                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="relative w-16 h-8 bg-white/80 rounded-full p-1 cursor-pointer border border-slate-200 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#2559f4]"
                        role="switch"
                        aria-checked={isAnnual}
                        aria-label="Toggle annual billing"
                    >
                        <div className={`absolute top-1 size-6 bg-[#2559f4] rounded-full shadow-md transition-transform duration-300 ease-in-out ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
                    </button>

                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Yearly</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#a855f7]/10 text-[#a855f7] text-[10px] font-bold uppercase border border-[#a855f7]/20">
                            Save up to 37%
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={`pricing-glass-card rounded-2xl p-8 xl:p-10 flex flex-col relative w-full ${plan.isPopular ? 'ring-2 ring-[#2559f4]/20 shadow-2xl shadow-[#2559f4]/15 md:scale-105 z-20' : 'z-10'}`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pricing-gradient-bg text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2 text-slate-900">{plan.name}</h3>
                                <p className="text-slate-500 text-sm h-10">{plan.description}</p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-5xl font-black pricing-gradient-text">
                                    ${isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                                </span>
                                <span className="text-slate-400 font-semibold">/mo</span>
                            </div>

                            <Link href="/register" className="w-full">
                                <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all mb-10 shadow-sm border ${plan.isPopular ? 'pricing-gradient-bg text-white hover:opacity-90 shadow-[#2559f4]/25 shadow-lg border-transparent' : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'}`}>
                                    {plan.isPopular ? 'Try Professional' : 'Get Started'}
                                </button>
                            </Link>

                            <div className="space-y-4 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 shrink-0 rounded-full bg-blue-50 p-1 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-[#2559f4]" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className={`text-sm leading-snug ${plan.isPopular ? 'text-slate-700 font-medium' : 'text-slate-600'}`}>{feature}</span>
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
