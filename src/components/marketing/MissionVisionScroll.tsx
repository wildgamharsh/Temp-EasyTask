"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

// Register ScrollTrigger
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function MissionVisionScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const missionRef = useRef<HTMLDivElement>(null);
    const visionRef = useRef<HTMLDivElement>(null);
    const outcomeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=300%", // Pin for 3 screens worth of scroll
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                }
            });

            // Initial state: Vision and Outcome hidden via clip-path
            gsap.set([visionRef.current, outcomeRef.current], { 
                clipPath: "circle(0% at 50% 50%)",
                webkitClipPath: "circle(0% at 50% 50%)"
            });

            // --- TRANSITION 1: MISSION -> VISION ---
            tl.to(visionRef.current, {
                clipPath: "circle(150% at 50% 50%)",
                webkitClipPath: "circle(150% at 50% 50%)",
                duration: 2,
                ease: "power2.inOut"
            });

            // Parallax/Movement for internal elements (Mission Out, Vision In)
            // Mission Text Out
            tl.to(".mission-content", { scale: 0.9, opacity: 0, duration: 1 }, 0);
            // Vision Text In
            tl.from(".vision-content", { scale: 1.1, opacity: 0, duration: 1 }, 0.5);


            // --- TRANSITION 2: VISION -> OUTCOME ---
            tl.to(outcomeRef.current, {
                clipPath: "circle(150% at 50% 50%)",
                webkitClipPath: "circle(150% at 50% 50%)",
                duration: 2,
                ease: "power2.inOut"
            });

            // Vision Text Out
            tl.to(".vision-content", { scale: 0.9, opacity: 0, duration: 1 }, 2);
            // Outcome Text In
            tl.from(".outcome-content", { scale: 1.1, opacity: 0, duration: 1 }, 2.5);

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-white">
            
            {/* 1. MISSION SLIDE (Base Layer) - Light Blue Theme */}
            <div ref={missionRef} className="absolute inset-0 w-full h-full z-10 bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center gap-12 lg:gap-20 h-full">
                    {/* Left: Text Content */}
                    <div className="w-full md:w-1/2 mission-content order-2 md:order-1 flex flex-col justify-center">
                        <span className="text-blue-600 font-mono tracking-widest text-sm mb-4 uppercase block">The Mission</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                            Taking your <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">business online.</span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                            We exist to unify distinct operational threads into a single, cohesive fabric, enabling you to focus on what matters most.
                        </p>
                    </div>
                    {/* Right: Image */}
                    <div className="w-full md:w-1/2 relative h-[50vh] md:h-[70vh] order-1 md:order-2">
                        <Image 
                            src="/images/STOREFRONT_new.png" 
                            alt="Storefront" 
                            fill 
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* 2. VISION SLIDE (Layer 2) - Purple Theme */}
            <div ref={visionRef} className="absolute inset-0 w-full h-full z-20 bg-linear-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                 <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center gap-12 lg:gap-20 h-full">
                    {/* Left: Image (Inverted layout) */}
                    <div className="w-full md:w-1/2 relative h-[50vh] md:h-[70vh] order-1">
                         <Image 
                            src="/images/ai_agent_vision.png" 
                            alt="Vision Future" 
                            fill 
                            className="object-contain"
                        />
                    </div>

                    {/* Right: Text Content */}
                    <div className="w-full md:w-1/2 vision-content order-2 flex flex-col justify-center">
                        <span className="text-purple-600 font-mono tracking-widest text-sm mb-4 uppercase block">The Vision</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                        The operating system <br/> for <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">modern businesses.</span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                            Imagine a business that runs itself. Where AI handles the "busy work"—scheduling, pricing, layout—so you can focus purely on your craft.
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. OUTCOME SLIDE (Layer 3) - Green/Teal Theme */}
             <div ref={outcomeRef} className="absolute inset-0 w-full h-full z-30 bg-linear-to-br from-teal-50 to-green-50 flex items-center justify-center">
                <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center gap-12 lg:gap-20 h-full">
                    {/* Left: Text Content */}
                    <div className="w-full md:w-1/2 outcome-content order-2 md:order-1 flex flex-col justify-center">
                        <span className="text-teal-600 font-mono tracking-widest text-sm mb-4 uppercase block">The Outcome</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                            Tangible <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-500 to-green-500">Growth.</span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-md leading-relaxed">
                            Real results. More bookings, less admin, and a brand that stands out. We don't just build software; we build your business engine.
                        </p>
                    </div>
                    {/* Right: Image */}
                    <div className="w-full md:w-1/2 relative h-[50vh] md:h-[70vh] order-1 md:order-2">
                        <Image 
                            src="/images/DASHBOARD_new.png" 
                            alt="Outcome Results" 
                            fill 
                            className="object-contain hue-rotate-[-110deg]"
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
