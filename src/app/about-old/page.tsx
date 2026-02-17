"use client";

import Link from "next/link";
import TeamSection from "@/components/marketing/TeamSection";
import MissionVisionScroll from "@/components/marketing/MissionVisionScroll";
import AiFeaturesSection from "@/components/marketing/AiFeaturesSection";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-32 md:py-48 overflow-hidden bg-slate-900">
                {/* Modern Gradient Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/50 via-slate-900 to-slate-950 z-0"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/grid-pattern.svg')] opacity-[0.03] z-0"></div>

                {/* Floating Icons - Left Side */}
                <div className="absolute top-1/2 left-[5%] -translate-y-1/2 hidden lg:flex flex-col gap-12 z-10 pointer-events-none">
                    <div className="animate-float-slow p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl">
                            <i className="fa-solid fa-store"></i>
                        </div>
                    </div>
                    <div className="animate-float-medium p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl translate-x-12">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-2xl">
                            <i className="fa-solid fa-chart-line"></i>
                        </div>
                    </div>
                </div>

                {/* Floating Icons - Right Side */}
                <div className="absolute top-1/2 right-[5%] -translate-y-1/2 hidden lg:flex flex-col gap-12 z-10 pointer-events-none">
                    <div className="animate-float-medium p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl">
                            <i className="fa-solid fa-robot"></i>
                        </div>
                    </div>
                    <div className="animate-float-slow p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl -translate-x-12">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-2xl">
                            <i className="fa-solid fa-calendar-check"></i>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium tracking-wide text-sm mb-8 fade-up backdrop-blur-sm">
                            You've Got Business to Handle
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight fade-up leading-tight drop-shadow-lg">
                            Run Your Business. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">Forget the Tech.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 leading-relaxed fade-up mb-10 max-w-2xl mx-auto">
                            EasyTask exists to bridge the gap between your real-world talent and the professional systems you need to scale.
                        </p>
                    </div>
                </div>
            </section>

            {/* GSAP Scroll Mission/Vision */}
            <MissionVisionScroll />

            {/* AI Features Section (Repurposed Vision) */}
            <AiFeaturesSection />

            {/* Team Section */}
            <TeamSection />



        </div>
    );
}
