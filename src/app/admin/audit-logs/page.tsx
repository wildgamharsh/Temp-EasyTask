"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    FileText,
    User,
    Building2,
    CreditCard,
    Settings,
    LogIn,
    LogOut,
    Edit,
    Trash2,
    Shield,
    Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AuditLog {
    id: string;
    admin_id: string;
    admin_name: string;
    action: string;
    resource_type: string;
    resource_id: string;
    details: Record<string, unknown>;
    ip_address: string;
    created_at: string;
}



export default function AuditLogsPage() {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState("all");
    const [resourceFilter, setResourceFilter] = useState("all");

    const fetchLogs = async () => {
        try {
            const response = await fetch("/api/admin/audit-logs");
            const data = await response.json();
            if (data.auditLogs) {
                setAuditLogs(data.auditLogs);
            }
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);



    const getResourceIcon = (type: string) => {
        switch (type) {
            case "organizer":
                return <Building2 className="h-4 w-4 text-blue-600" />;
            case "customer":
                return <User className="h-4 w-4 text-green-600" />;
            case "payment":
                return <CreditCard className="h-4 w-4 text-purple-600" />;
            case "settings":
                return <Settings className="h-4 w-4 text-orange-600" />;
            default:
                return <Shield className="h-4 w-4 text-slate-500" />;
        }
    };

    const getActionBadgeColor = (action: string) => {
        switch (action) {
            case "login":
            case "logout":
                return "bg-blue-100 text-blue-700";
            case "approve":
                return "bg-green-100 text-green-700";
            case "update":
                return "bg-yellow-100 text-yellow-700";
            case "suspend":
            case "delete":
                return "bg-red-100 text-red-700";
            case "refund":
                return "bg-purple-100 text-purple-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    const filteredLogs = auditLogs.filter((log) => {
        if (actionFilter !== "all" && log.action !== actionFilter) return false;
        if (resourceFilter !== "all" && log.resource_type !== resourceFilter) return false;
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <span className="text-slate-500 font-medium">Loading audit logs...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Audit Logs
                </h1>
                <p className="text-slate-500 mt-1">
                    Track all administrative actions across the platform.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Filters:</span>
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200">
                        <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="approve">Approve</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="suspend">Suspend</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200">
                        <SelectValue placeholder="Resource" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Resources</SelectItem>
                        <SelectItem value="organizer">Organizers</SelectItem>
                        <SelectItem value="customer">Customers</SelectItem>
                        <SelectItem value="payment">Payments</SelectItem>
                        <SelectItem value="settings">Settings</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Audit Log Entries */}
            <Card className="border-slate-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                        Activity Timeline
                    </CardTitle>
                    <CardDescription>
                        Showing {filteredLogs.length} entries
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all"
                            >
                                {/* Icon */}
                                <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                    {getResourceIcon(log.resource_type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-slate-900">
                                            {log.admin_name}
                                        </span>
                                        <Badge className={`${getActionBadgeColor(log.action)} hover:${getActionBadgeColor(log.action)}`}>
                                            {log.action}
                                        </Badge>
                                        <span className="text-slate-600">
                                            on <span className="font-medium">{log.resource_type}</span>
                                        </span>
                                    </div>

                                    {/* Details */}
                                    {Object.keys(log.details).length > 0 && (
                                        <div className="mt-2 text-sm text-slate-500">
                                            {Object.entries(log.details).map(([key, value]) => (
                                                <span key={key} className="mr-3">
                                                    <span className="font-medium">{key}:</span> {String(value)}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-xs text-slate-400 mt-2">
                                        {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                                        {log.ip_address && ` • IP: ${log.ip_address}`}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {filteredLogs.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No audit logs found matching your filters.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
