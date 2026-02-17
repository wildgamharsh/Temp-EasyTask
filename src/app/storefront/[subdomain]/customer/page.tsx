import { redirect } from "next/navigation";

export default async function CustomerIndex({ params }: { params: Promise<{ subdomain: string }> }) {
    const { subdomain } = await params;
    redirect(`/storefront/${subdomain}/customer/bookings`);
}
