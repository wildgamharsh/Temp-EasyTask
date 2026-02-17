"use client";

import { LandingNavbar, LandingFooter } from "@/components/layout";
import InteractiveSteps from "@/components/marketing/InteractiveSteps";
import VideoModal from "@/components/marketing/VideoModal";
import Link from "next/link";
import Image from "next/image";

import AiFeaturesSection from "@/components/marketing/AiFeaturesSection";

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased selection:bg-brand-200 selection:text-brand-900">
            <LandingNavbar />

            {/* Hero Section */}
            {/* Hero Section */}
            <section
                className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-center min-h-[56.25vw] bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url("/images/HIWBG.jpg")' }}
            >
                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/80 to-transparent -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl text-left">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-brand-900 mb-6 tracking-tight">
                            How <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-indigo-600">EasyTask</span> Works
                        </h1>
                        <p className="text-xl text-slate-700 mb-10 leading-relaxed font-medium">
                            From setup to scale, see how our platform empowers your event business with automation, stunning design, and smart tools.
                        </p>
                        <div className="flex gap-4 justify-start">
                            <Link
                                href="/signup"
                                className="px-8 py-4 rounded-full bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center gap-2 group"
                            >
                                Get Started
                                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-linear-to-br from-blue-50 via-indigo-50/20 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
                    <div className="text-center md:mb-16">
                        <span className="text-brand-600 font-bold tracking-widest uppercase text-sm mb-4 block fade-up">
                            Powerful Features
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-brand-900 mb-6 tracking-tight">
                            Everything You Need to <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-indigo-600">Succeed</span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            Powerful tools designed to help you manage, grow, and automate your event business without the technical headache.
                        </p>
                    </div>
                    {/* Feature 1 */}
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="order-2 md:order-1 fade-up">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                <i className="fa-solid fa-laptop-code text-xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-brand-900 mb-4">Customizable Storefront Website</h3>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Create your professional online presence without any coding skills. EasyTask provides drag-and-drop templates that let you customize every aspect of your storefront. Add your business logo, services, photos, and contact details to build a site that perfectly represents your brand.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">No coding required</span>
                                </li>
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">Mobile responsive designs</span>
                                </li>
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">SEO optimized automatically</span>
                                </li>
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 flex justify-center fade-in">
                            <div className="relative">
                                {/* Decorator blob */}
                                <div className="absolute -inset-4 bg-linear-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
                                <Image
                                    src="/images/STOREFRONT_new.png"
                                    alt="Storefront Preview"
                                    width={800}
                                    height={600}
                                    className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="flex justify-center fade-in">
                            <div className="relative">
                                {/* Decorator blob */}
                                <div className="absolute -inset-4 bg-linear-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
                                <Image
                                    src="/images/DASHBOARD_new.png"
                                    alt="Dashboard Preview"
                                    width={800}
                                    height={600}
                                    className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-500"
                                />
                            </div>
                        </div>
                        <div className="fade-up">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                <i className="fa-solid fa-chart-pie text-xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-brand-900 mb-4">Smart Admin Dashboard</h3>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Manage your entire business from one intuitive dashboard. The real-time calendar shows your availability at a glance with color-coded appointments, drag-and-drop rescheduling, and automated reminders sent to both you and your customers.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">Real-time calendar sync</span>
                                </li>
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">Automated email & SMS reminders</span>
                                </li>
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">Multi-location & team support</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="order-2 md:order-1 fade-up">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                <i className="fa-solid fa-comments text-xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-brand-900 mb-4">Built-in Live Chat</h3>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Connect with customers instantly through professional live chat integrated directly into your storefront. Visitors can start conversations from any page of your site, and you&apos;ll receive real-time notifications so you never miss a lead.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">Instant push notifications</span>
                                </li>
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">File sharing & image support</span>
                                </li>
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">Persistent conversation history</span>
                                </li>
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 flex justify-center fade-in">
                            <div className="relative">
                                {/* Decorator blob */}
                                <div className="absolute -inset-4 bg-linear-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
                                <Image
                                    src="/images/CHAT_FEATURE_new.png"
                                    alt="Chat Interface"
                                    width={800}
                                    height={600}
                                    className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Feature 4: AI Agent */}
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="flex justify-center fade-in">
                            <div className="relative">
                                {/* Decorator blob */}
                                <div className="absolute -inset-4 bg-linear-to-r from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
                                <Image
                                    src="/images/AI AGENT_new.png"
                                    alt="AI Agent"
                                    width={800}
                                    height={600}
                                    className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-500"
                                />
                            </div>
                        </div>
                        <div className="fade-up">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                <i className="fa-solid fa-robot text-xl"></i>
                            </div>
                            <h3 className="text-3xl font-bold text-brand-900 mb-4">AI Business Agent</h3>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Let our intelligent AI handle routine business operations so you can focus on growth. The AI agent automatically responds to common customer inquiries, schedules appointments based on your rules, and manages follow-ups.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">24/7 Availability & instant response</span>
                                </li>
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">Context-aware smart scheduling</span>
                                </li>
                                <li className="flex items-center gap-4 text-slate-700">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                                    </div>
                                    <span className="font-medium">Continually learns from interactions</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Steps */}
            <InteractiveSteps />

            {/* AI Features Section */}
            <AiFeaturesSection />

            {/* Demo Videos Section */}
            <section className="py-32 bg-slate-50 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-100/30 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20 fade-up">
                        <span className="text-brand-600 font-bold tracking-widest uppercase text-sm mb-4 block">
                            See It In Action
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-brand-900 mb-6 tracking-tight">
                            Experience the <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-indigo-600">Power</span>
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            Watch how EasyTask simplifies every part of your business, from setup to scaling.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
                        <VideoModal
                            thumbnail="/images/Thumb.jpg"
                            title="Storefront Customization"
                            description="Learn how to transform a template into your branded storefront in just minutes. Drag, drop, and launch."
                            videoId="nlW8uN9juGE"
                        />
                        <VideoModal
                            thumbnail="/images/Thumb.jpg"
                            title="Features Overview"
                            description="See the complete admin dashboard that puts booking management, calendar, and analytics at your fingertips."
                            videoId="gnbj0VWu-QU"
                        />
                        <VideoModal
                            thumbnail="/images/Thumb.jpg"
                            title="Creating Services"
                            description="Discover how easy it is to set up your services, define pricing, and manage availability rules."
                            videoId="hOegBi2suEk"
                        />
                        <VideoModal
                            thumbnail="/images/Thumb.jpg"
                            title="Grow Your Business"
                            description="See how EasyTask helps you reach more customers, automate responses, and scale without burnout."
                            videoId="R-5Ij5pJpxA"
                        />
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
}
