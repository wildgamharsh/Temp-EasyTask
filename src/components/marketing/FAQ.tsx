"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const faqs = [
    {
        question: "What features are included in Zaaro?",
        answer: "Zaaro is an all-in-one operating system including a professional storefront, live availability calendar, centralized dashboard, automated follow-ups, integrated payments, and revenue insights. Everything you need to manage your business."
    },
    {
        question: "Do I need any coding skills to use it?",
        answer: "Absolutely not. Zaaro is designed for simplicity. You can get your professional storefront up and running in minutes with zero coding or technical hassle. It's built for business owners, not developers."
    },
    {
        question: "How does the AI Agent help my business?",
        answer: "Our AI Agent works 24/7 to handle incoming inquiries, manage bookings, and answer client questions instantly. It acts as a tireless virtual assistant that ensures you never miss an opportunity, even when you're sleeping."
    },
    {
        question: "Who is Zaaro designed for?",
        answer: "It's perfect for any service-based business including consultants, agencies, creative professionals, and freelancers. Basically, anyone who wants to scale their business without the administrative overload."
    },
    {
        question: "Is my data and payment information secure?",
        answer: "Yes, security is our top priority. We use integrated secure payment capture to eliminate manual invoicing and ensure your business and client data is protected at all times."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        if (openIndex !== index) {
            setOpenIndex(index);
        }
    };

    return (
        <section className="py-24 bg-white relative overflow-hidden" id="faq">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-16 fade-up">
                    <span className="text-brand-600 font-semibold tracking-wide uppercase text-sm mb-2 block">FAQ</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                        Have Questions?
                    </h2>
                    <p className="mt-4 text-slate-500">Everything you need to know about Zaaro.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    {/* Left Column: Accordion List */}
                    <div className="lg:col-span-7 space-y-4 fade-up">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl transition-all duration-300 overflow-hidden ${openIndex === index
                                    ? 'bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-900/20 scale-[1.01] transform'
                                    : 'bg-slate-50 border border-slate-100 hover:border-blue-200'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full text-left px-8 py-6 flex items-center justify-between bg-transparent"
                                >
                                    <span className={`text-lg ${openIndex === index ? 'font-semibold text-white' : 'font-medium text-slate-800'}`}>
                                        {faq.question}
                                    </span>
                                    {openIndex !== index && (
                                        <span className="transform transition-transform duration-300">
                                            <i className="fa-solid fa-chevron-down text-slate-400"></i>
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence initial={false}>
                                    {openIndex === index && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                        >
                                            <div className="px-8 pb-8 pt-0 text-blue-50 leading-relaxed font-light text-[1.05rem]">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Contact Card */}
                    <div className="lg:col-span-5 space-y-6 fade-up sticky top-24">
                        <div className="bg-linear-to-br from-brand-500 to-indigo-600 rounded-[2rem] p-10 text-center text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
                            {/* Abstract Decoration */}
                            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                <i className="fa-regular fa-comments text-9xl"></i>
                            </div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-6 shadow-inner">
                                    <i className="fa-solid fa-message text-2xl"></i>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Have different questions?</h3>
                                <p className="text-blue-100 mb-8 max-w-xs mx-auto">
                                    Connect with our team for questions on specific topics or custom needs.
                                </p>
                                <Link
                                    href="/#contact"
                                    className="w-full py-4 bg-white text-brand-600 font-bold rounded-xl shadow-lg hover:bg-brand-50 hover:scale-105 transition-all active:scale-95 block text-center"
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
