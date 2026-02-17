"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
    User,
    MoreHorizontal,
    Eye,
    Ban,
    Mail,
    Trash2,
    ShieldCheck,
    Calendar,
} from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Customer {
    id: string;
    name: string;
    email: string;
    status: "active" | "banned";
    join_date: string;
    total_bookings: number;
    total_spent: number;
    last_booking_date: string | null;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCustomers = async () => {
        try {
            const response = await fetch("/api/admin/customers");
            const data = await response.json();
            if (data.customers) {
                setCustomers(data.customers);
            }
        } catch (error) {
            console.error("Failed to fetch customers", error);
            // Fallback demo data
            setCustomers([
                {
                    id: "1",
                    name: "John Smith",
                    email: "john.smith@email.com",
                    status: "active",
                    join_date: "2024-03-15T00:00:00Z",
                    total_bookings: 8,
                    total_spent: 4250,
                    last_booking_date: "2024-12-18T00:00:00Z",
                },
                {
                    id: "2",
                    name: "Emma Wilson",
                    email: "emma.wilson@email.com",
                    status: "active",
                    join_date: "2024-05-22T00:00:00Z",
                    total_bookings: 12,
                    total_spent: 8900,
                    last_booking_date: "2024-12-28T00:00:00Z",
                },
                {
                    id: "3",
                    name: "Michael Brown",
                    email: "m.brown@email.com",
                    status: "banned",
                    join_date: "2024-01-10T00:00:00Z",
                    total_bookings: 2,
                    total_spent: 650,
                    last_booking_date: "2024-06-05T00:00:00Z",
                },
                {
                    id: "4",
                    name: "Sophia Davis",
                    email: "sophia.d@email.com",
                    status: "active",
                    join_date: "2024-08-30T00:00:00Z",
                    total_bookings: 5,
                    total_spent: 3100,
                    last_booking_date: "2024-12-22T00:00:00Z",
                },
                {
                    id: "5",
                    name: "James Johnson",
                    email: "james.j@email.com",
                    status: "active",
                    join_date: "2024-09-12T00:00:00Z",
                    total_bookings: 3,
                    total_spent: 1850,
                    last_booking_date: "2024-11-15T00:00:00Z",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleBulkAction = async (selectedRows: Customer[], action: string) => {
        const ids = selectedRows.map((row) => row.id);

        if (action === "ban") {
            toast.success(`Banned ${ids.length} customer(s)`);
        } else if (action === "notify") {
            toast.success(`Notification sent to ${ids.length} customer(s)`);
        } else if (action === "export") {
            const headers = ["Name", "Email", "Status", "Joined", "Bookings", "Total Spent"];
            const csvContent = [
                headers.join(","),
                ...selectedRows.map((cust) =>
                    [
                        cust.name,
                        cust.email,
                        cust.status,
                        format(new Date(cust.join_date), "yyyy-MM-dd"),
                        cust.total_bookings,
                        cust.total_spent,
                    ].join(",")
                ),
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `customers-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Exported ${ids.length} customer(s) to CSV`);
        }
    };

    const handleExport = () => {
        handleBulkAction(customers, "export");
    };

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: "name",
            header: "Customer",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">{row.original.name}</p>
                        <p className="text-sm text-slate-500">{row.original.email}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge
                        className={
                            status === "active"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "total_bookings",
            header: "Bookings",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{row.original.total_bookings}</span>
                </div>
            ),
        },
        {
            accessorKey: "total_spent",
            header: "Total Spent",
            cell: ({ row }) => (
                <span className="font-semibold text-slate-900">
                    ${row.original.total_spent?.toLocaleString() ?? "0"}
                </span>
            ),
        },
        {
            accessorKey: "last_booking_date",
            header: "Last Booking",
            cell: ({ row }) => {
                const date = row.original.last_booking_date;
                if (!date) return <span className="text-slate-400">Never</span>;
                return (
                    <span className="text-slate-500">
                        {format(new Date(date), "MMM d, yyyy")}
                    </span>
                );
            },
        },
        {
            accessorKey: "join_date",
            header: "Joined",
            cell: ({ row }) => (
                <span className="text-slate-500">
                    {format(new Date(row.original.join_date), "MMM d, yyyy")}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/customers/${row.original.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {row.original.status === "active" ? (
                            <DropdownMenuItem className="text-orange-600">
                                <Ban className="mr-2 h-4 w-4" />
                                Ban Customer
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem className="text-green-600">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Unban Customer
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Customers
                </h1>
                <p className="text-slate-500 mt-1">
                    Manage all registered customers and their booking history.
                </p>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={customers}
                searchKey="name"
                searchPlaceholder="Search customers..."
                onExport={handleExport}
                onBulkAction={handleBulkAction}
                bulkActions={[
                    { label: "Send Notification", value: "notify" },
                    { label: "Ban", value: "ban", variant: "destructive" },
                    { label: "Export CSV", value: "export" },
                ]}
                isLoading={isLoading}
            />
        </div>
    );
}
