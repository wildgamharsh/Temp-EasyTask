/**
 * Contact Section Component
 */

"use client";

import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import type { OrganizerProfile, StorefrontSettings } from "@/lib/database.types";

interface ContactSectionProps {
    organizer: OrganizerProfile;
    settings: StorefrontSettings;
    variant?: 'modern' | 'classic' | 'elegant';
}

export default function ContactSection({ organizer, settings, variant = 'modern' }: ContactSectionProps) {
    const socialLinks = settings.social_links || {};

    if (variant === 'modern') {
        return (
            <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
                        Get In Touch
                    </h2>
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            {settings.contact_email && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-1">Email</p>
                                        <a href={`mailto:${settings.contact_email}`} className="text-gray-600 hover:underline">
                                            {settings.contact_email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {settings.contact_phone && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-secondary)' }}>
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-1">Phone</p>
                                        <a href={`tel:${settings.contact_phone}`} className="text-gray-600 hover:underline">
                                            {settings.contact_phone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {settings.address && (
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-accent)' }}>
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-1">Address</p>
                                        <p className="text-gray-600">{settings.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {Object.values(socialLinks).some(Boolean) && (
                            <div>
                                <p className="font-semibold mb-4">Follow Us</p>
                                <div className="flex gap-4">
                                    {socialLinks.facebook && (
                                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--color-primary)' }}>
                                            <Facebook className="w-5 h-5 text-white" />
                                        </a>
                                    )}
                                    {socialLinks.instagram && (
                                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--color-primary)' }}>
                                            <Instagram className="w-5 h-5 text-white" />
                                        </a>
                                    )}
                                    {socialLinks.twitter && (
                                        <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--color-primary)' }}>
                                            <Twitter className="w-5 h-5 text-white" />
                                        </a>
                                    )}
                                    {socialLinks.linkedin && (
                                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--color-primary)' }}>
                                            <Linkedin className="w-5 h-5 text-white" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    if (variant === 'classic') {
        return (
            <section id="contact" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-serif font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
                        Contact Us
                    </h2>
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border-2" style={{ borderColor: 'var(--color-primary)' }}>
                        <div className="space-y-4 text-center">
                            {settings.contact_email && (
                                <p className="flex items-center justify-center gap-2">
                                    <Mail className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                                    <a href={`mailto:${settings.contact_email}`} className="hover:underline">{settings.contact_email}</a>
                                </p>
                            )}
                            {settings.contact_phone && (
                                <p className="flex items-center justify-center gap-2">
                                    <Phone className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                                    <a href={`tel:${settings.contact_phone}`} className="hover:underline">{settings.contact_phone}</a>
                                </p>
                            )}
                            {settings.address && (
                                <p className="flex items-center justify-center gap-2">
                                    <MapPin className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                                    <span>{settings.address}</span>
                                </p>
                            )}
                            {Object.values(socialLinks).some(Boolean) && (
                                <div className="pt-4 border-t">
                                    <div className="flex justify-center gap-4">
                                        {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /></a>}
                                        {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /></a>}
                                        {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"><Twitter className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /></a>}
                                        {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /></a>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Elegant variant
    return (
        <section id="contact" className="py-24 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-5xl font-light mb-12" style={{ color: 'var(--color-primary)' }}>
                        Let&apos;s Connect
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {settings.contact_email && (
                            <div>
                                <Mail className="w-6 h-6 mb-2" style={{ color: 'var(--color-accent)' }} />
                                <p className="text-sm text-gray-500 mb-1">Email</p>
                                <a href={`mailto:${settings.contact_email}`} className="font-light hover:underline">{settings.contact_email}</a>
                            </div>
                        )}
                        {settings.contact_phone && (
                            <div>
                                <Phone className="w-6 h-6 mb-2" style={{ color: 'var(--color-accent)' }} />
                                <p className="text-sm text-gray-500 mb-1">Phone</p>
                                <a href={`tel:${settings.contact_phone}`} className="font-light hover:underline">{settings.contact_phone}</a>
                            </div>
                        )}
                        {settings.address && (
                            <div>
                                <MapPin className="w-6 h-6 mb-2" style={{ color: 'var(--color-accent)' }} />
                                <p className="text-sm text-gray-500 mb-1">Location</p>
                                <p className="font-light">{settings.address}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
