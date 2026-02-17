
"use client";

import { LegacyService as Service } from "@/lib/database.types";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Building, ArrowRight } from "lucide-react";

interface MarketplaceServiceCardProps {
    service: Service & {
        organizer: {
            business_name: string | null;
            name: string | null;
            logo_url: string | null;
            subdomain: string | null;
        } | null;
    };
}

export function MarketplaceServiceCard({ service }: MarketplaceServiceCardProps) {
    // Determine image to show
    const displayImage = service.images && service.images.length > 0 ? service.images[0] : null;
    const organizerName = service.organizer?.business_name || service.organizer?.name || "Organizer";
    const organizerLogo = service.organizer?.logo_url;
    const location = service.province || "Remote / Online";
    // Use dynamic calculated min_price or default
    const startPrice = service.min_price ?? 0;
    const price = startPrice.toLocaleString();
    const rating = service.rating || 0;
    const reviews = service.reviews || 0;
    const subdomain = service.organizer?.subdomain || 'demo';

    return (
        <Link
            href={`/marketplace/${service.id}`}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
        >
            <div className="relative h-48 bg-slate-200 overflow-hidden">
                {displayImage ? (
                    <Image
                        src={displayImage}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Image
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center z-10">
                    <Star className="w-3 h-3 text-amber-400 mr-1 fill-current" />
                    {rating} ({reviews})
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative w-6 h-6 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {organizerLogo ? (
                            <Image
                                src={organizerLogo}
                                alt={organizerName}
                                fill
                                className="object-cover"
                                sizes="24px"
                            />
                        ) : (
                            <Building className="w-3 h-3 text-slate-400" />
                        )}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 truncate">
                        {organizerName}
                    </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {service.title}
                </h3>

                <div className="flex items-center text-slate-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <span className="truncate">{location}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Starting at</p>
                        <p className="text-lg font-black text-slate-900">
                            ${price}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
