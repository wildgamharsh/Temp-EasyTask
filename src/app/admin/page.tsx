import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    Users,
    DollarSign,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    UserPlus,
    CheckCircle,
    Clock,
} from "lucide-react";
import { redirect } from "next/navigation";

// Redirect /admin to /admin/dashboard
export default function AdminPage() {
    redirect("/admin/dashboard");
}
