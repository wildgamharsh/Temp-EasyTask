"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    User,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    CreditCard,
    Loader2
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

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [customer, setCustomer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await fetch(`/api/admin/customers/${id}`);
                const data = await response.json();
                if (data.customer) {
                    setCustomer(data.customer);
                }
            } catch (error) {
                console.error("Failed to fetch customer details", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomer();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="p-12 text-center">
                <h2 className="text-2xl font-bold">Customer Not Found</h2>
                <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    const totalSpent = customer.bookings?.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0) || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                    <p className="text-muted-foreground">Customer Profile & Booking History</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Badge variant="outline" className="h-8 px-3">
                        Customer ID: {id.substring(0, 8)}...
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Contact Info */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-bold">
                                {customer.name[0]}
                            </div>
                            <div>
                                <p className="font-semibold">{customer.name}</p>
                                <p className="text-sm text-muted-foreground">Joined {format(new Date(customer.created_at), "MMM yyyy")}</p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{customer.phone_number || "No phone provided"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Account created {format(new Date(customer.created_at), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Spending & Activity Cards */}
                <div className="md:col-span-2 grid gap-6 grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-8 w-8 text-purple-500" />
                                <div className="text-3xl font-bold">{customer.bookings?.length || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Spent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-8 w-8 text-green-500" />
                                <div className="text-3xl font-bold">${totalSpent.toLocaleString()}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Booking History */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Booking History</CardTitle>
                    <CardDescription>Complete record of service reservations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Organizer</TableHead>
                                <TableHead>Event Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customer.bookings?.map((booking: any) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.service_name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{booking.organizer_name}</TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(booking.event_date), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                booking.status === 'completed' ? 'default' :
                                                    booking.status === 'confirmed' ? 'outline' :
                                                        'secondary'
                                            }
                                        >
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        ${booking.total_price}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {customer.bookings?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No bookings yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
