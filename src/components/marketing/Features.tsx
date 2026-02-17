"use client";

import React from 'react';

export default function Features() {
    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden" id="features">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="mb-16 fade-up">
                    <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block">Why EasyTask</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight whitespace-nowrap">
                        Master Your Operations, <span className="text-brand-600">Scale Your Success</span>
                    </h2>
                    <p className="mt-4 text-lg text-slate-600 leading-relaxed whitespace-nowrap">
                        Turning inquiries into booked events is a challenge for every business. Our platform simplifies the entire process.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8">

                    {/* Feature 1: Storefront (White -> Blue Gradient) */}
                    <div className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col h-full hover:-translate-y-1 transition-all duration-300 fade-up relative overflow-hidden">
                        {/* Hover Gradient Background */}
                        <div className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-br from-blue-600 to-indigo-700 transition-[height] duration-500 ease-in-out group-hover:h-full z-0"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 shrink-0 transition-colors group-hover:bg-white/20 group-hover:text-white">
                                <i className="fa-solid fa-store text-lg"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 transition-colors group-hover:text-white">Professional Storefront</h3>
                            <p className="text-slate-600 leading-relaxed mb-8 flex-grow transition-colors group-hover:text-blue-100">
                                Centralized showcase for your services. Give clients a beautiful place to browse packages and verify credibility instantly.
                            </p>

                            {/* Mockup Placeholder: Storefront Mini-UI */}
                            <div className="mt-auto bg-slate-50 rounded-xl p-4 border border-slate-100 relative overflow-hidden transition-all group-hover:bg-white/10 group-hover:border-white/20">
                                {/* Header Bar */}
                                <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2 transition-colors group-hover:border-white/20">
                                    <div className="w-20 h-2 bg-slate-200 rounded-full transition-colors group-hover:bg-white/30"></div>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 transition-colors group-hover:bg-white/40"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 transition-colors group-hover:bg-white/40"></div>
                                    </div>
                                </div>
                                {/* Content Blocks */}
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-md bg-white border border-slate-100 shrink-0 transition-colors group-hover:bg-white/20 group-hover:border-white/10"></div>
                                        <div className="w-full">
                                            <div className="w-24 h-2 bg-slate-200 rounded-full mb-1 transition-colors group-hover:bg-white/40"></div>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full transition-colors group-hover:bg-white/20"></div>
                                        </div>
                                    </div>
                                    <div className="h-16 bg-white rounded-lg border border-slate-100 w-full mt-2 relative top-2 shadow-sm transition-colors group-hover:bg-white/20 group-hover:border-white/10"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: Availability (Blue Gradient -> Black) */}
                    <div className="group bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-900/20 flex flex-col h-full hover:-translate-y-1 transition-all duration-300 relative overflow-hidden fade-up" style={{ transitionDelay: '100ms' }}>
                        {/* Hover Black Background */}
                        <div className="absolute inset-x-0 bottom-0 h-0 bg-slate-950 transition-[height] duration-500 ease-in-out group-hover:h-full z-0"></div>

                        {/* Abstract Background element */}
                        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none z-0 transition-opacity group-hover:opacity-5">
                            <i className="fa-regular fa-calendar-check text-9xl"></i>
                        </div>

                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-6 shrink-0 z-10 transition-colors group-hover:bg-white/10">
                            <i className="fa-regular fa-bell text-lg"></i>
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-xl font-bold mb-3">Real-time Availability</h3>
                            <p className="text-blue-100 leading-relaxed mb-8 flex-grow transition-colors group-hover:text-slate-400">
                                Instant alerts for new inquiries and auto-blocking of dates. We automate the calendar so you never double-book.
                            </p>

                            {/* Mockup Placeholder: Notification Card */}
                            <div className="mt-auto bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 relative overflow-hidden transition-colors group-hover:bg-white/5 group-hover:border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-xs font-semibold text-white">Notification</div>
                                    <i className="fa-solid fa-rotate text-[10px] text-white/70"></i>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-slate-900/40 rounded-lg p-3 flex items-center gap-3 transition-colors group-hover:bg-black/40">
                                        <div className="w-2 h-2 rounded-full bg-green-400 shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="w-24 h-2 bg-white/20 rounded-full mb-1"></div>
                                            <div className="w-16 h-2 bg-white/10 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/20 rounded-lg p-3 flex items-center gap-3 transition-colors group-hover:bg-black/20">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></div>
                                        <div className="flex-1">
                                            <div className="w-32 h-2 bg-white/20 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: Centralized Dashboard (White -> Blue Gradient) */}
                    <div className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col h-full hover:-translate-y-1 transition-all duration-300 fade-up relative overflow-hidden" style={{ transitionDelay: '200ms' }}>
                        {/* Hover Gradient Background */}
                        <div className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-br from-blue-600 to-indigo-700 transition-[height] duration-500 ease-in-out group-hover:h-full z-0"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 shrink-0 transition-colors group-hover:bg-white/20 group-hover:text-white">
                                <i className="fa-solid fa-layer-group text-lg"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 transition-colors group-hover:text-white">Centralized Dashboard</h3>
                            <p className="text-slate-600 leading-relaxed mb-8 flex-grow transition-colors group-hover:text-blue-100">
                                Manage your whole business from one place. Track bookings, payments, inventory, and client history without switching apps.
                            </p>

                            {/* Mockup Placeholder: Dashboard Interface */}
                            <div className="mt-auto bg-slate-50 rounded-xl p-4 border border-slate-100 relative overflow-hidden transition-all group-hover:bg-white/10 group-hover:border-white/20">
                                <div className="flex gap-3">
                                    {/* Sidebar */}
                                    <div className="w-1/4 space-y-2">
                                        <div className="h-2 w-full bg-slate-200 rounded-full mb-3 transition-colors group-hover:bg-white/30"></div>
                                        <div className="h-1.5 w-3/4 bg-slate-200 rounded-full transition-colors group-hover:bg-white/40"></div>
                                        <div className="h-1.5 w-full bg-slate-200 rounded-full transition-colors group-hover:bg-white/40"></div>
                                        <div className="h-1.5 w-5/6 bg-slate-200 rounded-full transition-colors group-hover:bg-white/40"></div>
                                    </div>
                                    {/* Main Content */}
                                    <div className="flex-1 bg-white rounded-lg border border-slate-100 p-2 shadow-sm transition-colors group-hover:bg-white/10 group-hover:border-white/10">
                                        <div className="flex justify-between mb-2">
                                            <div className="h-2 w-16 bg-slate-200 rounded-full transition-colors group-hover:bg-white/30"></div>
                                            <div className="h-4 w-4 bg-brand-100 rounded-full transition-colors group-hover:bg-white/60"></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="h-8 bg-slate-50 rounded border border-slate-50 transition-colors group-hover:bg-white/10 group-hover:border-white/5"></div>
                                            <div className="h-8 bg-slate-50 rounded border border-slate-50 transition-colors group-hover:bg-white/10 group-hover:border-white/5"></div>
                                        </div>
                                        <div className="mt-2 h-8 bg-slate-50 rounded border border-slate-50 w-full transition-colors group-hover:bg-white/10 group-hover:border-white/5"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
