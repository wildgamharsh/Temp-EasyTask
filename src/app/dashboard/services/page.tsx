"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
    DollarSign,
    AlertCircle,
    Package,
    LayoutGrid,
    List as ListIcon,
    Columns,
    Search,
    Star,
    TrendingUp,
    PackagePlus,
    ChevronRight,
    ArrowUpRight,
    Tag,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getServicesByOrganizer, updateService, deleteService } from "@/lib/supabase-data";
import { LegacyService as Service } from "@/lib/database.types";

type ViewMode = "grid" | "list" | "detailed";
type StatusFilter = "all" | "active" | "hidden";

// ─── Service Image / Fallback ─────────────────────────────────────────────────
function ServiceImage({ service, className }: { service: Service; className?: string }) {
    if (service.images && service.images.length > 0) {
        return (
            <img
                src={service.images[0]}
                alt={service.title}
                className={cn("w-full h-full object-cover", className)}
                onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = "none";
                    const fallback = el.parentElement?.querySelector(".img-fallback") as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                }}
            />
        );
    }
    return null;
}

function ImageFallback({ hidden }: { hidden?: boolean }) {
    return (
        <div
            className={cn(
                "img-fallback absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100",
                hidden ? "hidden" : "flex"
            )}
        >
            <Package className="h-12 w-12 text-blue-300" />
        </div>
    );
}

// ─── Pricing Display ──────────────────────────────────────────────────────────
function PriceLabel({ service }: { service: Service }) {
    const suffix =
        service.pricingType === "per_person"
            ? "/person"
            : service.pricingType === "hourly"
                ? "/hr"
                : "";
    return (
        <span className="flex items-baseline gap-0.5">
            <DollarSign className="h-3.5 w-3.5 text-blue-500 self-center" />
            <span className="font-bold text-blue-700">{(service.min_price || 0).toLocaleString()}</span>
            {suffix && <span className="text-xs text-slate-400 ml-0.5">{suffix}</span>}
        </span>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
    return active ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
            Hidden
        </span>
    );
}

// ─── Actions Dropdown ─────────────────────────────────────────────────────────
function ServiceActionsMenu({
    service,
    onToggleActive,
    onDelete,
    align = "end",
}: {
    service: Service;
    onToggleActive: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
    align?: "end" | "start";
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-slate-100 text-slate-500"
                    onClick={(e) => e.preventDefault()}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="w-44">
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/services/${service.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Service
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleActive(service.id, service.isActive)}>
                    {service.isActive ? (
                        <><EyeOff className="mr-2 h-4 w-4" /> Hide Service</>
                    ) : (
                        <><Eye className="mr-2 h-4 w-4" /> Publish Service</>
                    )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(service.id)}
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── GRID CARD ────────────────────────────────────────────────────────────────
function GridCard({
    service,
    onToggleActive,
    onDelete,
}: {
    service: Service;
    onToggleActive: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
}) {
    const pricingTypeLabel =
        service.pricingType === "per_person"
            ? "Per Person"
            : service.pricingType === "hourly"
                ? "Hourly"
                : service.pricingType === "fixed"
                    ? "Flat Rate"
                    : null;

    return (
        <div className="group relative rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
            {/* Image Area */}
            <Link href={`/dashboard/services/${service.id}/edit`} className="block">
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                    <ServiceImage service={service} className="transition-transform duration-500 group-hover:scale-105" />
                    <ImageFallback hidden={!!(service.images && service.images.length > 0)} />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Status overlay for hidden */}
                    {!service.isActive && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="text-white text-xs font-semibold bg-black/30 px-3 py-1 rounded-full border border-white/20">
                                Hidden
                            </span>
                        </div>
                    )}
                    {/* Pricing type pill on image */}
                    {pricingTypeLabel && (
                        <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white border border-white/20">
                                <Tag className="h-2.5 w-2.5" /> {pricingTypeLabel}
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Action menu — top right: visible always on mobile, on hover on desktop */}
            <div className="absolute top-2 right-2 z-10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-100">
                    <ServiceActionsMenu service={service} onToggleActive={onToggleActive} onDelete={onDelete} />
                </div>
            </div>

            {/* Card Body */}
            <Link href={`/dashboard/services/${service.id}/edit`} className="flex-1 flex flex-col p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-1 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                        {service.title}
                    </h3>
                    <StatusBadge active={service.isActive} />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1 leading-relaxed">
                    {service.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <PriceLabel service={service} />
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-slate-600">{service.rating || "—"}</span>
                        <span className="text-slate-300">·</span>
                        <span className="hidden sm:inline">{service.reviews} reviews</span>
                        <span className="sm:hidden">{service.reviews}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
}

// ─── ADD SERVICE CARD ─────────────────────────────────────────────────────────
function AddServiceCard() {
    return (
        <Link href="/services/new" className="block h-full">
            <div className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-colors">
                    <Plus className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">Add New Service</p>
                    <p className="text-xs text-slate-400 mt-0.5">Create a new listing</p>
                </div>
            </div>
        </Link>
    );
}

// ─── LIST ROW ────────────────────────────────────────────────────────────────
function ListRow({
    service,
    onToggleActive,
    onDelete,
}: {
    service: Service;
    onToggleActive: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <div className="group flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 border-l-2 border-transparent hover:border-blue-500 transition-all duration-150">
            {/* Thumbnail */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0 border border-slate-100">
                {service.images && service.images.length > 0 ? (
                    <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <Package className="h-6 w-6 text-blue-300" />
                    </div>
                )}
                {!service.isActive && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <EyeOff className="h-3.5 w-3.5 text-white" />
                    </div>
                )}
            </div>

            {/* Title + Description */}
            <div className="flex-1 min-w-0">
                <Link href={`/dashboard/services/${service.id}/edit`} className="block">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                            {service.title}
                        </span>
                        <StatusBadge active={service.isActive} />
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[380px]">{service.description}</p>
                </Link>
            </div>

            {/* Price */}
            <div className="hidden sm:flex flex-col items-end w-28">
                <PriceLabel service={service} />
                <span className="text-[10px] text-slate-400 mt-0.5">starts from</span>
            </div>

            {/* Rating */}
            <div className="hidden md:flex items-center gap-1 w-24 justify-end">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-slate-700">{service.rating || "—"}</span>
                <span className="text-xs text-slate-400">({service.reviews})</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/dashboard/services/${service.id}/edit`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                </Link>
                <ServiceActionsMenu service={service} onToggleActive={onToggleActive} onDelete={onDelete} />
            </div>
        </div>
    );
}

// ─── DETAILED CARD ────────────────────────────────────────────────────────────
function DetailedCard({
    service,
    onToggleActive,
    onDelete,
}: {
    service: Service;
    onToggleActive: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
}) {
    const pricingTypeLabel =
        service.pricingType === "per_person"
            ? "Per Person"
            : service.pricingType === "hourly"
                ? "Hourly"
                : service.pricingType === "fixed"
                    ? "Flat Rate"
                    : "Custom";

    const ratingNum = parseFloat(String(service.rating || "0"));
    const pct = Math.min(100, Math.round((ratingNum / 5) * 100));

    return (
        <div className="group rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col sm:flex-row">
            {/* Left — Image */}
            <Link
                href={`/dashboard/services/${service.id}/edit`}
                className="relative w-full sm:w-44 lg:w-52 flex-shrink-0 min-h-[160px] bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden"
            >
                <ServiceImage service={service} className="transition-transform duration-500 group-hover:scale-105" />
                <ImageFallback hidden={!!(service.images && service.images.length > 0)} />
                {!service.isActive && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-white text-xs font-semibold bg-black/30 px-2 py-1 rounded-full border border-white/20">
                            Hidden
                        </span>
                    </div>
                )}
            </Link>

            {/* Right — Content */}
            <div className="flex-1 flex flex-col p-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Link href={`/dashboard/services/${service.id}/edit`} className="flex-1">
                        <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors">
                            {service.title}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <StatusBadge active={service.isActive} />
                        <ServiceActionsMenu service={service} onToggleActive={onToggleActive} onDelete={onDelete} />
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed flex-1">
                    {service.description}
                </p>

                {/* Info row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
                    {/* Price */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Starting from</span>
                        <PriceLabel service={service} />
                    </div>
                    {/* Pricing type */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Billing</span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                            {pricingTypeLabel}
                        </span>
                    </div>
                    {/* Rating */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Rating</span>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-amber-400 transition-all"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">
                                {service.rating || "—"}
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{service.reviews} reviews</span>
                    </div>
                </div>

                {/* Action bar */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                    <Link href={`/dashboard/services/${service.id}/edit`} className="flex-1 sm:flex-none">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                            <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Service
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "text-xs flex-1 sm:flex-none",
                            service.isActive
                                ? "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        )}
                        onClick={() => onToggleActive(service.id, service.isActive)}
                    >
                        {service.isActive ? (
                            <><EyeOff className="h-3.5 w-3.5 mr-1.5" /> Hide</>
                        ) : (
                            <><Eye className="h-3.5 w-3.5 mr-1.5" /> Publish</>
                        )}
                    </Button>
                    <div className="ml-auto">
                        <Link href={`/dashboard/services/${service.id}/edit`}>
                            <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-blue-600">
                                Full Details <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ filtered }: { filtered: boolean }) {
    if (filtered) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Search className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-700 mb-1">No matching services</h3>
                <p className="text-sm text-slate-400">Try adjusting your search or filter criteria.</p>
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6 shadow-inner">
                <PackagePlus className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No services yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
                Create your first service listing to start receiving bookings from clients.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
                <Link href="/services/new">
                    <Plus className="mr-2 h-4 w-4" /> Create your first service
                </Link>
            </Button>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const supabase = createClient();

    const loadServices = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setIsLoading(false); return; }
            const userServices = await getServicesByOrganizer(user.id);
            setServices(userServices);
        } catch (err) {
            console.error("Error loading services:", err);
            setError("Failed to load services. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadServices(); }, []);

    const handleToggleActive = async (serviceId: string, currentActive: boolean) => {
        const updated = await updateService(serviceId, { isActive: !currentActive });
        if (updated) {
            setServices(services.map(s => s.id === serviceId ? updated : s));
            toast.success(currentActive ? "Service hidden" : "Service published");
        }
    };

    const handleDelete = async (serviceId: string) => {
        const success = await deleteService(serviceId);
        if (success) {
            setServices(services.filter(s => s.id !== serviceId));
            toast.success("Service deleted");
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch =
            service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all"
                ? true
                : statusFilter === "active"
                    ? service.isActive
                    : !service.isActive;
        return matchesSearch && matchesStatus;
    });

    const activeCount = services.filter(s => s.isActive).length;
    const hiddenCount = services.filter(s => !s.isActive).length;

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm text-slate-400">Loading services…</span>
            </div>
        );
    }

    // ── Error ──
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                    <AlertCircle className="h-7 w-7 text-red-400" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-slate-700 mb-1">Something went wrong</h3>
                    <p className="text-sm text-slate-400 mb-4">{error}</p>
                    <Button onClick={loadServices} variant="outline" size="sm">Try Again</Button>
                </div>
            </div>
        );
    }

    const hasFilters = searchQuery.length > 0 || statusFilter !== "all";

    return (
        <div className="space-y-5">

            {/* ── Page Header ───────────────────────────────────────────────── */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                {/* decorative circles */}
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute bottom-0 right-16 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute top-1/2 -translate-y-1/2 right-1/3 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-blue-200 text-xs font-medium mb-1">
                            <TrendingUp className="h-3.5 w-3.5" /> Dashboard
                            <ChevronRight className="h-3 w-3" /> Services
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">My Services</h1>
                        <p className="text-blue-100 text-sm mt-0.5">Manage and optimize your service listings</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Stat pills */}
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-white/20 min-w-[60px]">
                                <p className="text-xl font-bold">{services.length}</p>
                                <p className="text-[10px] text-blue-100 font-medium">Total</p>
                            </div>
                            <div className="text-center bg-emerald-400/20 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-emerald-300/20 min-w-[60px]">
                                <p className="text-xl font-bold">{activeCount}</p>
                                <p className="text-[10px] text-blue-100 font-medium">Active</p>
                            </div>
                            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2.5 border border-white/10 min-w-[60px]">
                                <p className="text-xl font-bold">{hiddenCount}</p>
                                <p className="text-[10px] text-blue-100 font-medium">Hidden</p>
                            </div>
                        </div>
                        <Button
                            asChild
                            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-sm"
                        >
                            <Link href="/services/new">
                                <Plus className="mr-2 h-4 w-4" /> Add Service
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ───────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search services…"
                        className="pl-9 bg-white border-slate-200 rounded-xl h-10 text-sm shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Status filter chips */}
                <div className="flex items-center gap-1.5">
                    {(["all", "active", "hidden"] as StatusFilter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={cn(
                                "text-xs px-3 py-1.5 rounded-full font-medium border transition-all duration-200 active:scale-95",
                                statusFilter === f
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                            )}
                        >
                            {f === "all" ? "All" : f === "active" ? "Active" : "Hidden"}
                            {f === "all" && <span className="ml-1.5 text-[10px] opacity-70">{services.length}</span>}
                            {f === "active" && <span className="ml-1.5 text-[10px] opacity-70">{activeCount}</span>}
                            {f === "hidden" && <span className="ml-1.5 text-[10px] opacity-70">{hiddenCount}</span>}
                        </button>
                    ))}
                </div>

                {/* View mode toggle */}
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-0.5 shadow-sm ml-auto">
                    {([
                        { mode: "grid" as ViewMode, Icon: LayoutGrid, label: "Cards" },
                        { mode: "list" as ViewMode, Icon: ListIcon, label: "List" },
                        { mode: "detailed" as ViewMode, Icon: Columns, label: "Detailed" },
                    ]).map(({ mode, Icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            title={label}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                                viewMode === mode
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────────────── */}
            {services.length === 0 ? (
                <EmptyState filtered={false} />
            ) : filteredServices.length === 0 ? (
                <EmptyState filtered={hasFilters} />
            ) : viewMode === "grid" ? (
                // ── CARDS VIEW ──────────────────────────────────────────────
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredServices.map((service) => (
                        <GridCard
                            key={service.id}
                            service={service}
                            onToggleActive={handleToggleActive}
                            onDelete={handleDelete}
                        />
                    ))}
                    {statusFilter === "all" && !searchQuery && <AddServiceCard />}
                </div>

            ) : viewMode === "list" ? (
                // ── LIST VIEW ───────────────────────────────────────────────
                <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                    {/* List header */}
                    <div className="flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="w-14 flex-shrink-0" />
                        <div className="flex-1">Service</div>
                        <div className="hidden sm:block w-28 text-right">Price</div>
                        <div className="hidden md:block w-24 text-right">Rating</div>
                        <div className="w-24" />
                    </div>
                    <div className="divide-y divide-slate-50">
                        {filteredServices.map((service) => (
                            <ListRow
                                key={service.id}
                                service={service}
                                onToggleActive={handleToggleActive}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                    {/* List footer */}
                    <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50/50 to-white border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                            Showing <span className="font-semibold text-slate-600">{filteredServices.length}</span> of {services.length} services
                        </span>
                        <Link href="/services/new">
                            <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-8">
                                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Service
                            </Button>
                        </Link>
                    </div>
                </div>

            ) : (
                // ── DETAILED CARDS VIEW ─────────────────────────────────────
                <div className="flex flex-col gap-4">
                    {filteredServices.map((service) => (
                        <DetailedCard
                            key={service.id}
                            service={service}
                            onToggleActive={handleToggleActive}
                            onDelete={handleDelete}
                        />
                    ))}
                    {statusFilter === "all" && !searchQuery && (
                        <Link href="/services/new" className="block">
                            <div className="rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 flex items-center justify-center gap-3 py-8 cursor-pointer group">
                                <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-colors">
                                    <Plus className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">Add New Service</p>
                                    <p className="text-xs text-slate-400">Create a new listing</p>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
