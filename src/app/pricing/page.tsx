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
            </main>

            <LandingFooter />
        </div>
    );
}
