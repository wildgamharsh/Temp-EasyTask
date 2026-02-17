"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
    id: string;
    date: string;
    amount: number;
    status: string;
    service_name: string;
    customer_name: string;
    payment_method: string;
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch("/api/admin/transactions");
                const data = await response.json();
                if (data.transactions) {
                    setTransactions(data.transactions);
                }
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                <p className="text-muted-foreground">
                    Monitor all booking payments and platform revenue.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        {format(new Date(tx.date), "MMM d, HH:mm")}
                                    </TableCell>
                                    <TableCell>{tx.customer_name}</TableCell>
                                    <TableCell>{tx.service_name}</TableCell>
                                    <TableCell className="capitalize">{tx.payment_method}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                tx.status === "confirmed" || tx.status === "completed"
                                                    ? "default"
                                                    : tx.status === "cancelled"
                                                        ? "destructive"
                                                        : "outline"
                                            }
                                        >
                                            {tx.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${tx.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                        No transactions found.
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
