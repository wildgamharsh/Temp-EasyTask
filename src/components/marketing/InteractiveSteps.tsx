"use client";

import { motion } from "framer-motion";

const steps = [
    {
        title: "Getting Started",
        description: "Create your account, choose your plan, and instantly secure your unique subdomain to start your journey.",
        icon: "fa-rocket",
        color: "bg-blue-100 text-blue-600",
        details: ["Sign up in seconds", "Select your plan", "Get your subdomain"]
    },
    {
        title: "Customize & Configure",
        description: "Transform our templates into your professional storefront and easily list your services with pricing and availability.",
        icon: "fa-paintbrush",
        color: "bg-indigo-100 text-indigo-600",
        details: ["Personalize storefront", "List your services", "Set availability"]
    },
    {
        title: "Launch & Grow",
        description: "Go live instantly and use your powerful dashboard to manage bookings, payments, and automated customer chat.",
        icon: "fa-chart-line",
        color: "bg-brand-100 text-brand-600",
        details: ["Go live instantly", "Manage dashboard", "Automate with AI"]
    }
];

export default function InteractiveSteps() {
    return (
        <section className="py-24 bg-white relative overflow-hidden" id="how-it-works">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 fade-up">
                    <span className="text-brand-600 font-bold tracking-widest uppercase text-sm mb-4 block">
                        Simple Process
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-brand-900 mb-6 tracking-tight">
                        Three Steps to <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-indigo-600">Success</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        We&apos;ve streamlined everything so you can focus on your business, not the tech.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            // Removed overflow-hidden from here to allow badge to protrude
                            className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
                        >
                            {/* Inner Clipped Container for Background Effects */}
                            <div className="absolute inset-0 rounded-[2rem] overflow-hidden z-0">
                                {/* Hover Gradient Background */}
                                <div className="absolute inset-x-0 bottom-0 h-0 bg-linear-to-br from-blue-600 to-indigo-700 transition-[height] duration-500 ease-in-out group-hover:h-full"></div>
                            </div>

                            {/* Step Number Badge - Outside the clipped area */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-linear-to-br from-brand-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-brand-500/30 z-20 border-4 border-white group-hover:border-white/20 transition-all">
                                {index + 1}
                            </div>

                            {/* Content Container - Relative to sit above background */}
                            <div className="relative z-10 w-full p-8 flex flex-col items-center h-full">
                                {/* Icon */}
                                <div className={`w-20 h-20 rounded-full ${step.color} flex items-center justify-center text-3xl mb-6 shadow-inner mt-4 transition-all duration-300 group-hover:bg-white/20 group-hover:text-white group-hover:scale-110`}>
                                    <i className={`fa-solid ${step.icon}`}></i>
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 mb-4 transition-colors group-hover:text-white">
                                    {step.title}
                                </h3>
                                
                                <p className="text-slate-600 leading-relaxed mb-8 flex-grow transition-colors group-hover:text-blue-50">
                                    {step.description}
                                </p>

                                <ul className="space-y-3 w-full text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 transition-all group-hover:bg-white/10 group-hover:border-white/20 shadow-sm">
                                    {step.details.map((detail, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 transition-colors group-hover:text-white">
                                            {/* List Icon: Blue default -> Light Purple hover */}
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-purple-200 group-hover:text-purple-700">
                                                <i className="fa-solid fa-check text-[10px]"></i>
                                            </div>
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
