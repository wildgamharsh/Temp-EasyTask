"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";

import { LandingNavbar, LandingFooter } from "@/components/layout";
import BeforeAfterSlider from "@/components/marketing/BeforeAfterSlider";
import Features from "@/components/marketing/Features";
import PricingCards from "@/components/marketing/PricingCards";
import FAQ from "@/components/marketing/FAQ";
import { toast } from "sonner";
// ... (Skipping to the relevant insertion point)

// Later in the file...


const notifications = [
  {
    text: "New Booking Confirmed!",
    time: "Just now",
    iconBoxClass: "bg-green-100 text-green-600",
    icon: "fa-bell"
  },
  {
    text: "Payment Received: $1,200",
    time: "2 mins ago",
    iconBoxClass: "bg-blue-100 text-blue-600",
    icon: "fa-circle-dollar-to-slot"
  },
  {
    text: "New Inquiry from Sarah",
    time: "5 mins ago",
    iconBoxClass: "bg-purple-100 text-purple-600",
    icon: "fa-envelope"
  }
];

interface FormData {
  type: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  size: string;
  role: string;
  message: string;
}

export default function LandingPage() {
  const [formData, setFormData] = useState<FormData>({
    type: "Business",
    name: "",
    company: "",
    email: "",
    phone: "",
    subject: "",
    size: "",
    role: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationIndex, setNotificationIndex] = useState(0);

  useEffect(() => {
    // Force scroll to top on mount to prevent layout shifts/accidental scrolling
    window.scrollTo(0, 0);

    const interval = setInterval(() => {
      setNotificationIndex((prev) => (prev + 1) % notifications.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fillSampleData = () => {
    setFormData({
      type: "Business",
      name: "Alex Morgan",
      company: "Morgan Events LLC",
      email: "alex@morganevents.com",
      phone: "+1 (555) 123-4567",
      subject: "Testing Contact Form",
      size: "20 - 50 events",
      role: "Owner / Founder",
      message: "This is a test message to verify the contact form submission. Please disregard.",
    });
    toast.success("Sample data filled!");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({
          type: "Business",
          name: "",
          company: "",
          email: "",
          phone: "",
          subject: "",
          size: "",
          role: "",
          message: "",
        });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>


      <div className="antialiased selection:bg-brand-200 selection:text-brand-900">
        {/* Navbar */}
        <LandingNavbar />
        {/* Hero Section */}
        <section className="relative pt-40 md:pt-48 pb-20 lg:pb-32 overflow-hidden bg-linear-to-tr from-brand-50 to-white">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center gap-12 lg:gap-16">
              {/* Text Content */}
              <div className="hero-content max-w-6xl mx-auto">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-900 leading-[1.15] mb-8 tracking-tight">
                  Launch your business online <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-indigo-600">
                    without any technical hassle.
                  </span>
                </h1>
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Trust us, we&apos;ve got the technical part covered—so you can focus on building your brand.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="#contact"
                    className="px-8 py-4 rounded-full bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center justify-center gap-2 group"
                  >
                    Get More Done
                    <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="px-8 py-4 rounded-full bg-white text-brand-700 border border-brand-100 font-semibold hover:bg-brand-50 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-circle-info"></i> Learn More
                  </Link>
                </div>
              </div>

              {/* Hero Visual (Mockup) */}
              <div className="hero-mockup relative w-full max-w-5xl perspective-[1000px]">
                <div className="mockup-container bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl transform-[rotateX(5deg)_rotateY(-5deg)_rotateZ(1deg)] transition-transform duration-500 ease-out hover:transform-none">
                  {/* Mockup Header */}
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="bg-white border border-slate-200 rounded-md py-1 px-3 text-xs text-slate-400 inline-block w-48">
                        zaaro.ca/dashboard
                      </div>
                    </div>
                  </div>
                  {/* Mockup Body */}
                  <div className="p-6 grid grid-cols-12 gap-6 bg-white min-h-[500px] text-left">
                    {/* Sidebar */}
                    <div className="col-span-3 border-r border-slate-100 pr-4 space-y-4 hidden md:block">
                      <div className="h-8 w-24 bg-brand-100 rounded mb-6"></div>
                      <div className="space-y-3">
                        <div className="h-8 w-full bg-brand-50 text-brand-600 rounded-lg flex items-center px-3 text-[10px] font-bold border border-brand-100 shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-brand-500 mr-2"></div>
                          Dashboard
                        </div>
                        <div className="h-8 w-3/4 hover:bg-slate-50 rounded-lg flex items-center px-3 text-[10px] text-slate-400 border border-transparent hover:border-slate-100 transition-all">
                          <div className="w-2 h-2 rounded-full border border-slate-300 mr-2"></div>
                          Bookings
                        </div>
                        <div className="h-8 w-5/6 hover:bg-slate-50 rounded-lg flex items-center px-3 text-[10px] text-slate-400 border border-transparent hover:border-slate-100 transition-all">
                          <div className="w-2 h-2 rounded-full border border-slate-300 mr-2"></div>
                          Calendar
                        </div>
                        <div className="h-8 w-4/5 hover:bg-slate-50 rounded-lg flex items-center px-3 text-[10px] text-slate-400 border border-transparent hover:border-slate-100 transition-all">
                          <div className="w-2 h-2 rounded-full border border-slate-300 mr-2"></div>
                          Services
                        </div>
                      </div>
                    </div>
                    {/* Main Content */}
                    <div className="col-span-12 md:col-span-9">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                          <div className="h-6 w-48 bg-brand-900 rounded"></div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-blue-200"></div>
                      </div>
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                          <div className="text-xs text-blue-600 mb-1">New Inquiries</div>
                          <div className="text-2xl font-bold text-brand-900">12</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                          <div className="text-xs text-green-600 mb-1">Confirmed</div>
                          <div className="text-2xl font-bold text-brand-900">5</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                          <div className="text-xs text-purple-600 mb-1">Revenue</div>
                          <div className="text-2xl font-bold text-brand-900">$4.2k</div>
                        </div>
                      </div>
                      {/* List */}
                      <div className="space-y-3">
                        <div className="h-14 w-full border border-slate-100 rounded-lg flex items-center px-4 justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                            <div className="w-32 h-3 bg-slate-200 rounded"></div>
                          </div>
                          <div className="w-20 h-7 bg-green-100 rounded-full text-green-700 text-xs flex items-center justify-center font-bold">
                            PAID
                          </div>
                        </div>
                        <div className="h-14 w-full border border-slate-100 rounded-lg flex items-center px-4 justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                            <div className="w-40 h-3 bg-slate-200 rounded"></div>
                          </div>
                          <div className="w-20 h-7 bg-yellow-100 rounded-full text-yellow-700 text-xs flex items-center justify-center font-bold">
                            PENDING
                          </div>
                        </div>
                        <div className="h-14 w-full border border-slate-100 rounded-lg items-center px-4 justify-between hidden sm:flex">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                            <div className="w-32 h-3 bg-slate-200 rounded"></div>
                          </div>
                          <div className="w-20 h-7 bg-blue-100 rounded-full text-blue-700 text-xs flex items-center justify-center font-bold">
                            NEW
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Badge */}
                <div
                  key={notificationIndex}
                  className="absolute -bottom-6 -right-6 lg:-right-12 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-[bounce_3s_infinite] z-20"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notifications[notificationIndex].iconBoxClass}`}>
                    <i className={`fa-solid ${notifications[notificationIndex].icon}`}></i>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">{notifications[notificationIndex].time}</p>
                    <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{notifications[notificationIndex].text}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem (Chaos) vs The Solution (Order) - Interactive Slider */}
        <section id="how-it-works">
          <BeforeAfterSlider />
        </section>

        {/* Features Grid */}
        {/* Features Grid - Redesigned */}
        <Features />

        {/* Pricing Cards Section */}
        <PricingCards />

        {/* Philosophy / Dark Section - Redesigned */}
        <section className="py-32 bg-[#0a0c14] relative overflow-hidden">
          {/* Abstract Background Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 fade-up">
            <span className="text-slate-400 font-bold tracking-[0.2em] uppercase text-xs mb-6 block">
              GET STARTED
            </span>

            <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight">
              Ready to Optimize <br />
              <span className="bg-linear-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Your Business?
              </span>
            </h2>

            <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of professionals using Zaaro to streamline their operations and scale faster.
            </p>

            {/* Stylized Wave Graphic */}
            <div className="flex justify-center mb-16 px-4">
              <svg width="600" height="40" viewBox="0 0 600 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xl opacity-60">
                <path d="M0 20C50 20 100 10 150 10C200 10 250 30 300 30C350 30 400 10 450 10C500 10 550 20 600 20" stroke="url(#paint0_linear)" strokeWidth="4" strokeLinecap="round" />
                <path d="M0 25C50 25 100 15 150 15C200 15 250 35 300 35C350 35 400 15 450 15C500 15 550 25 600 25" stroke="url(#paint0_linear)" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
                <path d="M0 15C50 15 100 5 150 5C200 5 250 25 300 25C350 25 400 5 450 5C500 5 550 15 600 15" stroke="url(#paint0_linear)" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="paint0_linear" x1="0" y1="20" x2="600" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA" />
                    <stop offset="0.5" stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <Link
              href="#contact"
              className="inline-flex items-center px-12 py-5 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all shadow-xl shadow-blue-500/25 active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* Contact Section - Redesigned */}
        <section className="py-24 bg-white relative overflow-hidden" id="contact">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
              {/* Left Pane: Content */}
              <div className="fade-up">
                <span className="text-brand-600 font-bold tracking-widest uppercase text-sm mb-4 block">
                  Contact Us
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-brand-900 mb-6 leading-tight">
                  Ready to optimize your <span className="text-brand-600">Business?</span>
                </h2>
                <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                  Join the revolution. Reduce administrative overhead, improve response times, and gain total control over your bookings with Zaaro.
                </p>

                <h3 className="text-lg font-bold text-slate-900 mb-6">What you get with Zaaro:</h3>
                <ul className="space-y-5">
                  {[
                    "Custom storefront for your services",
                    "Automated booking and payments",
                    "Real-time calendar availability",
                    "Client management and history",
                    "Professional invoicing tools"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-700">
                      <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-check text-brand-600 text-xs"></i>
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-12 flex gap-8 text-slate-500">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-shield-halved text-brand-400"></i>
                    <span className="text-sm font-semibold">Secure Platform</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-chart-line text-brand-400"></i>
                    <span className="text-sm font-semibold">Analytics Included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-headset text-brand-400"></i>
                    <span className="text-sm font-semibold">24/7 Support</span>
                  </div>
                </div>

                {/* Test Data Button */}
                <div className="mt-8">
                  <button
                    onClick={fillSampleData}
                    className="text-xs font-semibold text-slate-400 hover:text-brand-600 transition-colors flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 hover:border-brand-200 hover:bg-brand-50"
                  >
                    <i className="fa-solid fa-flask"></i> Fill Sample Data
                  </button>
                </div>
              </div>


              {/* Right Pane: Contact Form */}
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-100 fade-up relative">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-brand-50 to-transparent rounded-tr-3xl -z-10"></div>

                <div className="flex justify-center mb-8">
                  <div className="bg-slate-100 p-1 rounded-xl inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "Business" })}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === "Business"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      <i className="fa-solid fa-building mr-2"></i> Business
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "Individual" })}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === "Individual"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                      <i className="fa-solid fa-user mr-2"></i> Individual
                    </button>
                  </div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all placeholder:text-slate-300"
                    />
                  </div>



                  {/* Company Name - Conditional */}
                  {formData.type === "Business" && (
                    <div className="fade-up">
                      <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company"
                        placeholder="Acme Events Co."
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required={formData.type === "Business"}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  )}

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Work Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Size & Role */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Monthly Events - Conditional */}
                    {formData.type === "Business" && (
                      <div>
                        <label htmlFor="size" className="block text-sm font-medium text-slate-700 mb-2">
                          Monthly Events
                        </label>
                        <div className="relative">
                          <select
                            id="size"
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all text-slate-700 appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Select size</option>
                            <option>1 - 5 events</option>
                            <option>5 - 20 events</option>
                            <option>20 - 50 events</option>
                            <option>50+ events</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                            <i className="fa-solid fa-chevron-down text-xs"></i>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={formData.type === "Individual" ? "md:col-span-2" : ""}>
                      <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                        Your Role
                      </label>
                      <div className="relative">
                        <select
                          id="role"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all text-slate-700 appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select role</option>
                          <option>Owner / Founder</option>
                          <option>Event Planner</option>
                          <option>Operations Manager</option>
                          <option>Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                          <i className="fa-solid fa-chevron-down text-xs"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all font-medium placeholder:text-slate-300"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all font-medium placeholder:text-slate-300 resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 mt-2 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    {!isSubmitting && (
                      <i className="fa-solid fa-paper-plane group-hover:translate-x-1 transition-transform"></i>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-400 mt-4">
                    By submitting this form, you agree to our <a href="#" className="underline hover:text-brand-600">Terms of Service</a> and <a href="#" className="underline hover:text-brand-600">Privacy Policy</a>.
                  </p>
                </form>
              </div>
            </div>
          </div >
        </section >

        {/* Footer */}
        <LandingFooter />
      </div>
    </>
  );
}
