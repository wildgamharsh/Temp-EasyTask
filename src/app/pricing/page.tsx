"use client";

import { LandingNavbar, LandingFooter } from "@/components/layout";
import PricingCards from "@/components/marketing/PricingCards";
import FAQ from "@/components/marketing/FAQ";
import Link from "next/link";
import { useEffect } from "react";

export default function PricingPage() {
    useEffect(() => {
        // Force scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="antialiased selection:bg-brand-200 selection:text-brand-900 min-h-screen flex flex-col">
            <LandingNavbar />

            <main className="flex-1 pt-12 md:pt-20">
                <PricingCards />

                {/* Philosophy / Dark Section - Mini Version for Conversion */}
                <section className="py-20 bg-[#0a0c14] relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 fade-up">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                            Ready to Optimize <br />
                            <span className="bg-linear-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                                Your Business?
                            </span>
                        </h2>
                        <Link
                            href="/register"
                            className="inline-flex items-center px-10 py-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all shadow-xl shadow-blue-500/25 active:scale-95 mt-4"
                        >
                            Get Started Free
                        </Link>
                    </div>
                </section>

                {/* Bring in the FAQ to answer subscription questions */}
                <div className="bg-brand-50/30">
                    <FAQ />
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
