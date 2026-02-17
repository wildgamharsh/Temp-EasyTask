"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function MissionVisionStatic() {
    return (
        <div className="bg-white">
            {/* 1. MISSION SLIDE */}
            <section className="py-24 md:py-32 bg-linear-to-br from-blue-50 to-indigo-50 border-b border-indigo-100">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-blue-600 font-mono tracking-widest text-sm mb-4 uppercase block font-bold">The Mission</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                            Taking your <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">business online.</span>
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            We exist to unify distinct operational threads into a single, cohesive fabric, enabling you to focus on what matters most.
                        </p>
                    </motion.div>
                    {/* Right: Image */}
                    <motion.div
                        className="relative h-[400px] md:h-[500px]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Image
                            src="/images/STOREFRONT_new.png"
                            alt="Storefront"
                            fill
                            className="object-contain drop-shadow-2xl"
                        />
                    </motion.div>
                </div>
            </section>

            {/* 2. VISION SLIDE */}
            <section className="py-24 md:py-32 bg-linear-to-br from-purple-50 to-pink-50 border-b border-purple-100">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left: Image (Order 1 on desktop) */}
                    <motion.div
                        className="relative h-[400px] md:h-[500px] order-2 md:order-1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Image
                            src="/images/ai_agent_vision.png"
                            alt="Vision Future"
                            fill
                            className="object-contain drop-shadow-2xl"
                        />
                    </motion.div>

                    {/* Right: Text Content */}
                    <motion.div
                        className="order-1 md:order-2"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-purple-600 font-mono tracking-widest text-sm mb-4 uppercase block font-bold">The Vision</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                            The operating system <br /> for <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">modern businesses.</span>
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Imagine a business that runs itself. Where AI handles the "busy work"—scheduling, pricing, layout—so you can focus purely on your craft.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 3. OUTCOME SLIDE */}
            <section className="py-24 md:py-32 bg-linear-to-br from-teal-50 to-green-50">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-teal-600 font-mono tracking-widest text-sm mb-4 uppercase block font-bold">The Outcome</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                            Tangible <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-500 to-green-500">Growth.</span>
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Real results. More bookings, less admin, and a brand that stands out. We don't just build software; we build your business engine.
                        </p>
                    </motion.div>
                    {/* Right: Image */}
                    <motion.div
                        className="relative h-[400px] md:h-[500px]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Image
                            src="/images/DASHBOARD_new.png"
                            alt="Outcome Results"
                            fill
                            className="object-contain hue-rotate-[-110deg] drop-shadow-2xl"
                        />
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
