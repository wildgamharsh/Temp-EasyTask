"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Search,
    MoreHorizontal,
    ArrowUpDown,
    MessageSquare,
    Eye
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export interface CustomerSummary {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    totalBookings: number;
    lastBookingDate?: Date;
    statusBreakdown: {
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        rejected: number;
        in_progress: number;
        completion_pending: number;
    };
    createdAt: string;
}

interface CustomersTableProps {
    data: CustomerSummary[];
    onViewCustomer: (id: string) => void;
    onMessageCustomer: (id: string) => void;
}

export function CustomersTable({ data, onViewCustomer, onMessageCustomer }: CustomersTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof CustomerSummary; direction: 'asc' | 'desc' } | null>(null);

    // Filtering
    const filteredData = data.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sorting
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || bValue === undefined) return 0;

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: keyof CustomerSummary) => {
        setSortConfig(current => ({
            key,
            direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredData.length} customers found
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort('name')}>
                                <div className="flex items-center">
                                    Customer
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('totalBookings')}>
                                <div className="flex items-center">
                                    Bookings
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('lastBookingDate')}>
                                <div className="flex items-center">
                                    Last Booking
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </div>
                            </TableHead>
                            <TableHead>Status History</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.map((customer) => (
                            <TableRow key={customer.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onViewCustomer(customer.id)}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={customer.avatarUrl} />
                                            <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{customer.name}</span>
                                            <span className="text-xs text-muted-foreground">{customer.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-mono">
                                        {customer.totalBookings}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {customer.lastBookingDate ? format(customer.lastBookingDate, 'MMM d, yyyy') : '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {customer.statusBreakdown.pending > 0 && (
                                            <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200 text-[10px] px-1 py-0 h-5">
                                                {customer.statusBreakdown.pending} Pending
                                            </Badge>
                                        )}
                                        {customer.statusBreakdown.confirmed > 0 && (
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 text-[10px] px-1 py-0 h-5">
                                                {customer.statusBreakdown.confirmed} Active
                                            </Badge>
                                        )}
                                        {(customer.statusBreakdown.in_progress + customer.statusBreakdown.completion_pending) > 0 && (
                                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 text-[10px] px-1 py-0 h-5">
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => { e.stopPropagation(); onMessageCustomer(customer.id); }}
                                            title="Message Customer"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onViewCustomer(customer.id)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onMessageCustomer(customer.id)}>
                                                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {sortedData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
