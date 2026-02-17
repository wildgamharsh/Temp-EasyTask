"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const teamMembers = [
    {
        name: "Alpha",
        role: "Founder & CEO",
        image: "/images/placeholder.jpg",
    },
    {
        name: "Beta",
        role: "Head of Product",
        image: "/images/placeholder.jpg",
    },
    {
        name: "Charlie",
        role: "Lead Developer",
        image: "/images/placeholder.jpg",
    },
    {
        name: "Delta",
        role: "Design Lead",
        image: "/images/placeholder.jpg",
    },
];

export default function TeamSection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden" id="our-team">


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20 fade-up">
                    <span className="text-brand-600 font-bold tracking-widest uppercase text-sm mb-4 block">
                        Our Team
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-brand-900 mb-6 tracking-tight">
                        Meet the <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-indigo-600">Visionaries</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        A small but mighty team dedicated to transforming how you manage your event business.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative min-h-[400px] items-start">



                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            // Stagger effect: Push down even indices on large screens
                            className={`flex flex-col items-center text-center ${index % 2 !== 0 ? 'lg:mt-24' : ''}`}
                        >
                            <div className="relative group mb-6">
                                <div className="absolute inset-0 bg-linear-to-br from-brand-400 to-indigo-600 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500 scale-110"></div>
                                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-slate-200 group-hover:shadow-brand-500/20 transition-all duration-500 relative z-10 group-hover:scale-105">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Floating Badge or Decorator */}
                                <div className="absolute bottom-2 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md z-20 text-brand-600 border border-brand-50 group-hover:rotate-12 transition-transform duration-300">
                                    <i className="fa-brands fa-linkedin-in text-sm"></i>
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{member.name}</h3>
                            <p className="text-brand-600 font-medium">{member.role}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
