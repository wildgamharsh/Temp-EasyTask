"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Mail,
    Globe,
    Calendar,
    Package,
    ArrowUpRight,
    Loader2,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface OrganizerWithDetails {
    id: string;
    name: string;
    email: string;
    business_name?: string;
    subdomain?: string;
    created_at: string;
    services?: {
        id: string;
        title: string;
        base_price: number;
        pricing_type: string;
        is_active: boolean;
    }[];
    bookings?: {
        id: string;
        customer_id: string;
        customer_name: string;
        service_name: string;
        event_date: string;
        total_price: number;
    }[];
}

export default function OrganizerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [organizer, setOrganizer] = useState<OrganizerWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrganizer = async () => {
            try {
                const response = await fetch(`/api/admin/organizers/${id}`);
                const data = await response.json();
                if (data.organizer) {
                    setOrganizer(data.organizer);
                }
            } catch (error) {
                console.error("Failed to fetch organizer details", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrganizer();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!organizer) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-2xl font-bold">Organizer Not Found</h2>
                <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{organizer.business_name || organizer.name}</h1>
                    <p className="text-muted-foreground">Organizer Details & Activity</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Badge variant="outline" className="h-8 px-3">
                        Organizer ID: {id.substring(0, 8)}...
                    </Badge>
                    <Badge className="h-8 px-3 bg-green-500">Active</Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Info */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {organizer.name[0]}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{organizer.name}</p>
                                <p className="text-xs text-muted-foreground">Manager</p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{organizer.email}</span>
                            </div>
                            {organizer.subdomain && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <a
                                        href={`http://${organizer.subdomain}.localhost:3000`}
                                        target="_blank"
                                        className="text-primary hover:underline"
                                    >
                                        {organizer.subdomain}.zaaro.ai
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Joined {format(new Date(organizer.created_at), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Storefront Performance</CardTitle>
                        <CardDescription>Overview of services and bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-muted/50 text-center">
                                <Package className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                                <div className="text-2xl font-bold">{organizer.services?.length || 0}</div>
                                <p className="text-xs text-muted-foreground">Services</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50 text-center">
                                <Calendar className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                                <div className="text-2xl font-bold">{organizer.bookings?.length || 0}</div>
                                <p className="text-xs text-muted-foreground">Total Bookings</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50 text-center">
                                <ArrowUpRight className="h-5 w-5 mx-auto mb-2 text-green-500" />
                                <div className="text-2xl font-bold">
                                    ${(organizer.bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) ?? 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">Revenue</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50 text-center">
                                <User className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                                <div className="text-2xl font-bold">
                                    {new Set(organizer.bookings?.map(b => b.customer_id)).size}
                                </div>
                                <p className="text-xs text-muted-foreground">Customers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Services List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Active Services</CardTitle>
                            <CardDescription>All services listed by this organizer</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href={`http://${organizer.subdomain}.localhost:3000/services`} target="_blank">
                                View Storefront
                            </a>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organizer.services?.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium text-sm">{service.title}</TableCell>
                                        <TableCell className="text-sm">
                                            ${service.base_price} {service.pricing_type === 'per_person' ? '/pp' : ''}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={service.is_active ? "default" : "secondary"}>
                                                {service.is_active ? "Active" : "Disabled"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {organizer.services?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm">
                                            No services found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Recent Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Bookings</CardTitle>
                        <CardDescription>Last 10 transactions through this organizer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organizer.bookings?.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell>
                                            <div className="text-sm font-medium">{booking.customer_name}</div>
                                            <div className="text-xs text-muted-foreground">{booking.service_name}</div>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {format(new Date(booking.event_date), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right text-sm font-semibold">
                                            ${booking.total_price}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {organizer.bookings?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm">
                                            No bookings found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
