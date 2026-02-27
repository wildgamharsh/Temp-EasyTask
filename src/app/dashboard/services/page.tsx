"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    Search,
    Filter
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
import { PricingMode, ConfigStep } from "@/types/pricing";

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClient();

    const loadServices = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoading(false);
                return;
            }

            const userServices = await getServicesByOrganizer(user.id);
            setServices(userServices);

            // Fetch and calculate pricing ranges removed - utilizing attached min_price instead

        } catch (err) {
            console.error("Error loading services:", err);
            setError("Failed to load services. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

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

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadServices}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Services</h1>
                    <p className="text-muted-foreground">
                        Manage your service listings
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg p-1 bg-white shadow-sm">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setViewMode('list')}
                        >
                            <ListIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button asChild>
                        <Link href="/services/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Service
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Search Toolbar */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search services..."
                            className="pl-9 bg-slate-50 border-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="text-slate-500">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                    </Button>
                </div>
            </div>

            {/* Services Content */}
            {services.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No services yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first service to start receiving bookings.
                        </p>
                        <Button asChild>
                            <Link href="/services/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Service
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : viewMode === 'grid' ? (
                // GRID VIEW
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredServices.map((service) => (
                        <div key={service.id} className="group overflow-hidden pt-0 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
                            <div className="absolute top-2 right-2 z-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm border-slate-200">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/services/${service.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleActive(service.id, service.isActive)}>
                                            {service.isActive ? (
                                                <>
                                                    <EyeOff className="mr-2 h-4 w-4" />
                                                    Hide
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Publish
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => handleDelete(service.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <Link href={`/dashboard/services/${service.id}/edit`} className="flex-1 flex flex-col">
                                <div className="aspect-video bg-linear-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                                    {service.images && service.images.length > 0 ? (
                                        <img
                                            src={service.images[0]}
                                            alt={service.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                const parent = e.currentTarget.parentElement;
                                                if (parent) {
                                                    e.currentTarget.style.display = 'none';
                                                    const icon = parent.querySelector('.fallback-icon');
                                                    if (icon) (icon as HTMLElement).style.display = 'flex';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <div className={cn(
                                        "fallback-icon absolute inset-0 flex items-center justify-center",
                                        service.images && service.images.length > 0 ? "hidden" : "flex"
                                    )}>
                                        <Package className="h-16 w-16 text-primary/50" />
                                    </div>
                                    {!service.isActive && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Badge variant="secondary">Hidden</Badge>
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-semibold line-clamp-1 mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                                        {service.description}
                                    </p>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1 text-lg font-bold text-primary">
                                            <DollarSign className="h-4 w-4" />
                                            {/* Logic: Prioritize Calculated Range, then use Legacy fields */}
                                            <span className="text-xs font-normal text-muted-foreground mr-1">Starting from</span>
                                            {(service.min_price || 0).toLocaleString()}

                                            <span className="text-xs font-normal text-muted-foreground">
                                                {service.pricingType === "per_person" ? "/person" :
                                                    service.pricingType === "hourly" ? "/hr" : ""}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                            <span>{service.reviews} reviews</span>
                                            <span>★ {service.rating || "0"}</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-medium text-primary">
                                            Edit Service <Edit className="h-3 w-3" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </div>
                    ))}
                    <Link href="/services/new">
                        <Card className="h-full border-dashed hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px]">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Plus className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="font-medium">Add New Service</p>
                                <p className="text-sm text-muted-foreground">Create a new listing</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            ) : (
                // LIST VIEW
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-medium text-slate-500">Service</TableHead>
                                <TableHead className="font-medium text-slate-500">Price</TableHead>
                                <TableHead className="font-medium text-slate-500">Status</TableHead>
                                <TableHead className="font-medium text-slate-500">Rating</TableHead>
                                <TableHead className="font-medium text-slate-500 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServices.map((service) => (
                                <TableRow key={service.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-16 bg-slate-100 rounded-md overflow-hidden relative">
                                                {service.images && service.images.length > 0 ? (
                                                    <img
                                                        src={service.images[0]}
                                                        alt={service.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Package className="h-6 w-6 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{service.title}</div>
                                                <div className="text-sm text-slate-500 line-clamp-1 max-w-[300px]">{service.description}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-700">
                                            <DollarSign className="inline h-3 w-3 mr-0.5 text-slate-400" />
                                            {(service.min_price || 0).toLocaleString()}
                                            <span className="text-xs text-slate-400 font-normal ml-1">
                                                (starts from)
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={service.isActive ? "default" : "secondary"} className={cn("font-medium", service.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                                            {service.isActive ? "Active" : "Hidden"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-600">
                                            <span className="font-medium">{service.rating || "0"}</span>
                                            <span className="text-slate-400 mx-1">•</span>
                                            <span>{service.reviews} reviews</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/services/${service.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleActive(service.id, service.isActive)}>
                                                    {service.isActive ? (
                                                        <>
                                                            <EyeOff className="mr-2 h-4 w-4" />
                                                            Hide
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Publish
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(service.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
