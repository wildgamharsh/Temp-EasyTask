import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import AdminLoginForm from "./components/AdminLoginForm";

export default async function AdminLoginPage() {
    // Check for existing session
    const admin = await verifyAdminSession();

    if (admin) {
        redirect("/admin/dashboard");
    }

    return <AdminLoginForm />;
}
