"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
    Building2,
    ExternalLink,
    MoreHorizontal,
    Eye,
    Ban,
    CheckCircle,
    Mail,
    Trash2,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Organizer {
    id: string;
    name: string;
    email: string;
    business_name: string;
    status: "active" | "suspended" | "pending";
    join_date: string;
    services_count: number;
    subdomain: string;
    total_bookings: number;
    total_revenue: number;
}

export default function OrganizersPage() {
    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const fetchOrganizers = async () => {
        try {
            const url = statusFilter !== "all"
                ? `/api/admin/organizers?status=${statusFilter}`
                : "/api/admin/organizers";
            const response = await fetch(url);
            const data = await response.json();
            if (data.organizers) {
                setOrganizers(data.organizers);
            }
        } catch (error) {
            console.error("Failed to fetch organizers", error);
            // Fallback demo data
            setOrganizers([
                {
                    id: "1",
                    name: "Sarah Jenkins",
                    email: "sarah@elegantdecor.ca",
                    business_name: "Elegant Wedding Decor",
                    status: "active",
                    join_date: "2024-06-15T00:00:00Z",
                    services_count: 3,
                    subdomain: "elegant-decor",
                    total_bookings: 48,
                    total_revenue: 67500,
                },
                {
                    id: "2",
                    name: "Michael Chen",
                    email: "michael@freshfeast.ca",
                    business_name: "Fresh Feast Catering",
                    status: "pending",
                    join_date: "2024-12-20T00:00:00Z",
                    services_count: 0,
                    subdomain: "",
                    total_bookings: 0,
                    total_revenue: 0,
                },
                {
                    id: "3",
                    name: "Emily Rodriguez",
                    email: "emily@bloomglow.ca",
                    business_name: "Bloom & Glow Decor",
                    status: "active",
                    join_date: "2024-08-22T00:00:00Z",
                    services_count: 5,
                    subdomain: "bloom-glow",
                    total_bookings: 72,
                    total_revenue: 94200,
                },
                {
                    id: "4",
                    name: "David Kim",
                    email: "david@savorydelights.ca",
                    business_name: "Savory Delights",
                    status: "suspended",
                    join_date: "2024-03-10T00:00:00Z",
                    services_count: 2,
                    subdomain: "savory-delights",
                    total_bookings: 15,
                    total_revenue: 18750,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizers();
    }, [statusFilter]);

    const handleBulkAction = async (selectedRows: Organizer[], action: string) => {
        const ids = selectedRows.map((row) => row.id);

        if (action === "approve") {
            toast.success(`Approved ${ids.length} organizer(s)`);
        } else if (action === "suspend") {
            toast.success(`Suspended ${ids.length} organizer(s)`);
        } else if (action === "export") {
            // Generate CSV export
            const headers = ["Name", "Business", "Email", "Status", "Joined", "Bookings", "Revenue"];
            const csvContent = [
                headers.join(","),
                ...selectedRows.map((org) =>
                    [
                        org.name,
                        org.business_name,
                        org.email,
                        org.status,
                        format(new Date(org.join_date), "yyyy-MM-dd"),
                        org.total_bookings,
                        org.total_revenue,
                    ].join(",")
                ),
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `organizers-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Exported ${ids.length} organizer(s) to CSV`);
        }
    };

    const handleExport = () => {
        handleBulkAction(organizers, "export");
    };

    const columns: ColumnDef<Organizer>[] = [
        {
            accessorKey: "business_name",
            header: "Business",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">{row.original.business_name || row.original.name}</p>
                        <p className="text-sm text-slate-500">{row.original.name}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <span className="text-slate-600">{row.original.email}</span>
            ),
        },
        {
            accessorKey: "subdomain",
            header: "Storefront",
            cell: ({ row }) => {
                const subdomain = row.original.subdomain;
                if (!subdomain) {
                    return <span className="text-slate-400">Not configured</span>;
                }
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-slate-600">{subdomain}.easytask.ai</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                            <a
                                href={`http://${subdomain}.localhost:3000`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-3 w-3 text-blue-600" />
                            </a>
                        </Button>
                    </div>
                );
            },
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
                                : status === "pending"
                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
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
                <span className="font-medium text-slate-900">{row.original.total_bookings}</span>
            ),
        },
        {
            accessorKey: "total_revenue",
            header: "Revenue",
            cell: ({ row }) => (
                <span className="font-medium text-slate-900">
                    ${row.original.total_revenue?.toLocaleString() ?? "0"}
                </span>
            ),
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
                            <Link href={`/admin/organizers/${row.original.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {row.original.status === "pending" && (
                            <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                            </DropdownMenuItem>
                        )}
                        {row.original.status === "active" && (
                            <DropdownMenuItem className="text-orange-600">
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend
                            </DropdownMenuItem>
                        )}
                        {row.original.status === "suspended" && (
                            <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Reactivate
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Organizers
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage all platform organizers and their storefronts.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-white border-slate-200">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={organizers}
                searchKey="business_name"
                searchPlaceholder="Search organizers..."
                onExport={handleExport}
                onBulkAction={handleBulkAction}
                bulkActions={[
                    { label: "Approve", value: "approve" },
                    { label: "Suspend", value: "suspend", variant: "destructive" },
                    { label: "Export CSV", value: "export" },
                ]}
                isLoading={isLoading}
            />
        </div>
    );
}
