"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AiCircuitIcon } from "@/components/ui/AiCircuitIcon";

// Register ScrollTrigger
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AiFeaturesSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const aiCoreRef = useRef<HTMLDivElement>(null);
    const linesRef = useRef<SVGSVGElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 60%", // Start when top of section hits 60% of viewport height
                    toggleActions: "play none none reverse"
                }
            });

            // --- INITIAL STATES ---
            // 1. AI Core: Hidden and small
            gsap.set(aiCoreRef.current, { scale: 0, opacity: 0 });

            // 2. Lines: Hidden via clip-path
            gsap.set(linesRef.current, { clipPath: "circle(0% at 50% 50%)", opacity: 1 });

            // 3. Cards: Hidden and slightly offset
            gsap.set(".feature-card", { opacity: 0, y: 20, scale: 0.95 });

            // --- ANIMATION SEQUENCE ---

            // Step 1: AI Icon fades/scales into view
            tl.to(aiCoreRef.current, {
                scale: 1,
                opacity: 1,
                duration: 0.8,
                ease: "back.out(1.7)"
            });

            // Step 2: Connector lines animate in
            tl.to(linesRef.current, {
                clipPath: "circle(150% at 50% 50%)",
                duration: 1.5,
                ease: "power2.out"
            }, "-=0.2");

            // Step 3: Feature cards appear (staggered)
            tl.to(".feature-card", {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.15,
                ease: "power2.out"
            }, "-=1.0");

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-32 bg-slate-900 relative overflow-hidden text-white flex items-center justify-center min-h-[800px]">
            <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full h-full flex flex-col justify-center">
                <div className="text-center mb-12 absolute top-8 md:top-12 left-0 w-full z-20">
                    <span className="text-brand-300 font-bold tracking-widest uppercase text-sm mb-4 block">
                        Powered by Intelligence
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        The <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-300 to-indigo-300">Brain</span> Behind Your Operations
                    </h2>
                </div>

                <div className="relative flex items-center justify-center w-full h-[600px] mt-16 md:mt-24">

                    {/* Central Connector Lines (Desktop) */}
                    <svg ref={linesRef} className="absolute inset-0 w-full h-full hidden lg:block z-0 pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
                        {/* Defs for gradients */}
                        <defs>
                            <linearGradient id="lineGradientBlue" x1="50%" y1="50%" x2="15%" y2="15%">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#60a5fa" stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="lineGradientPurple" x1="50%" y1="50%" x2="85%" y2="15%">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#c084fc" stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="lineGradientGreen" x1="50%" y1="50%" x2="15%" y2="85%">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
                            </linearGradient>
                            <linearGradient id="lineGradientOrange" x1="50%" y1="50%" x2="85%" y2="85%">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#fb923c" stopOpacity="1" />
                            </linearGradient>
                        </defs>

                        <style jsx>{`
                            @keyframes flow {
                                from { stroke-dashoffset: 24; }
                                to { stroke-dashoffset: 0; }
                            }
                            .animate-flow-slow {
                                animation: flow 8s linear infinite;
                            }
                        `}</style>

                        {/* Background Tracks (Dim) */}
                        <g opacity="0.1">
                            <path d="M500,300 L350,150" stroke="white" strokeWidth="3" fill="none" />
                            <path d="M500,300 L650,150" stroke="white" strokeWidth="3" fill="none" />
                            <path d="M500,300 L350,450" stroke="white" strokeWidth="3" fill="none" />
                            <path d="M500,300 L650,450" stroke="white" strokeWidth="3" fill="none" />
                        </g>

                        {/* Animated Energy Beams (Dashed Data Flow) */}
                        <g>
                            {/* Top Left */}
                            <path
                                d="M500,300 L350,150"
                                stroke="url(#lineGradientBlue)"
                                strokeWidth="3"
                                strokeDasharray="4 8"
                                className="animate-flow-slow"
                                strokeLinecap="round"
                                fill="none"
                            />
                            {/* Top Right */}
                            <path
                                d="M500,300 L650,150"
                                stroke="url(#lineGradientPurple)"
                                strokeWidth="3"
                                strokeDasharray="4 8"
                                className="animate-flow-slow"
                                strokeLinecap="round"
                                fill="none"
                            />
                            {/* Bottom Left */}
                            <path
                                d="M500,300 L350,450"
                                stroke="url(#lineGradientGreen)"
                                strokeWidth="3"
                                strokeDasharray="4 8"
                                className="animate-flow-slow"
                                strokeLinecap="round"
                                fill="none"
                            />
                            {/* Bottom Right */}
                            <path
                                d="M500,300 L650,450"
                                stroke="url(#lineGradientOrange)"
                                strokeWidth="3"
                                strokeDasharray="4 8"
                                className="animate-flow-slow"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </g>
                    </svg>

                    {/* Central AI Core */}
                    <div ref={aiCoreRef} className="relative z-20 flex flex-col items-center justify-center w-40 h-40 md:w-56 md:h-56">
                        {/* Animated Pulse Core (Background) */}
                        <div className="absolute w-[80%] h-[80%] bg-brand-500/20 rounded-full blur-xl animate-pulse"></div>

                        {/* New SVG Icon */}
                        <div className="relative z-10 w-full h-full p-2 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                            <AiCircuitIcon className="w-full h-full" />
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div ref={cardsRef} className="absolute inset-0 hidden lg:block pointer-events-none">
                        {/* Top Left - Ends at 35%, 25% (Right Edge) */}
                        <div className="feature-card absolute top-[25%] left-[35%] w-80 xl:w-96 -translate-x-full -translate-y-1/2 pr-6">
                            <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-all border-r-4 border-r-blue-400 shadow-lg group pointer-events-auto text-right">
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center justify-end gap-3 mb-2">
                                    <h3 className="font-bold text-lg">Smart Booking System</h3>
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0"><i className="fa-solid fa-comments"></i></div>
                                </div>
                                <p className="text-sm text-slate-300">Seamlessly handle appointments and instant client communication with zero friction.</p>
                            </div>
                        </div>

                        {/* Top Right - Ends at 65%, 25% (Left Edge) */}
                        <div className="feature-card absolute top-[25%] left-[65%] w-80 xl:w-96 -translate-y-1/2 pl-6">
                            <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-all border-l-4 border-l-purple-400 shadow-lg group pointer-events-auto text-left">
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-400 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center justify-start gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0"><i className="fa-solid fa-paintbrush"></i></div>
                                    <h3 className="font-bold text-lg">Custom Storefronts</h3>
                                </div>
                                <p className="text-sm text-slate-300">Brand-aligned, high-converting designs that adapt automatically to your style.</p>
                            </div>
                        </div>

                        {/* Bottom Left - Ends at 35%, 75% (Right Edge) */}
                        <div className="feature-card absolute top-[75%] left-[35%] w-80 xl:w-96 -translate-x-full -translate-y-1/2 pr-6">
                            <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-all border-r-4 border-r-green-400 shadow-lg group pointer-events-auto text-right">
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center justify-end gap-3 mb-2">
                                    <h3 className="font-bold text-lg">Service Logic</h3>
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-300 flex items-center justify-center shrink-0"><i className="fa-solid fa-list-check"></i></div>
                                </div>
                                <p className="text-sm text-slate-300">Flexible pricing structures, custom packages, and intelligent add-on management.</p>
                            </div>
                        </div>

                        {/* Bottom Right - Ends at 65%, 75% (Left Edge) */}
                        <div className="feature-card absolute top-[75%] left-[65%] w-80 xl:w-96 -translate-y-1/2 pl-6">
                            <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-all border-l-4 border-l-orange-400 shadow-lg group pointer-events-auto text-left">
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-400 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center justify-start gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center shrink-0"><i className="fa-solid fa-clock"></i></div>
                                    <h3 className="font-bold text-lg">Live Availability</h3>
                                </div>
                                <p className="text-sm text-slate-300">Real-time calendar synchronization to prevent conflicts and double-bookings.</p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Fallback - Stacked (No Scroll Animation) */}
                    <div className="lg:hidden grid gap-4 mt-8 w-full max-w-sm">
                        <div className="p-4 bg-white/10 rounded-xl border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0"><i className="fa-solid fa-comments"></i></div>
                            <div>
                                <h3 className="font-bold text-sm">Smart Booking</h3>
                                <p className="text-xs text-slate-400">Automated scheduling</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/10 rounded-xl border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0"><i className="fa-solid fa-paintbrush"></i></div>
                            <div>
                                <h3 className="font-bold text-sm">Custom Storefronts</h3>
                                <p className="text-xs text-slate-400">Brand-aligned design</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/10 rounded-xl border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-300 flex items-center justify-center shrink-0"><i className="fa-solid fa-list-check"></i></div>
                            <div>
                                <h3 className="font-bold text-sm">Service Logic</h3>
                                <p className="text-xs text-slate-400">Flexible pricing</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/10 rounded-xl border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center shrink-0"><i className="fa-solid fa-clock"></i></div>
                            <div>
                                <h3 className="font-bold text-sm">Live Availability</h3>
                                <p className="text-xs text-slate-400">Syncs instantly</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
