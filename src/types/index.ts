export type UserRole = "customer" | "organizer" | "admin";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar_url?: string;
    created_at: string;
}

export interface Organizer {
    id: string;
    user_id: string;
    business_name: string;
    logo_url?: string;
    description?: string;
    category: "catering" | "decoration";
    location?: string;
    stripe_account_id?: string;
    is_verified: boolean;
    created_at: string;
}

export interface Service {
    id: string;
    organizer_id: string;
    title: string;
    description: string;
    base_price: number;
    pricing_type: "fixed" | "per_person" | "hourly";
    images: string[];
    is_active: boolean;
    created_at: string;
}

export interface Booking {
    id: string;
    customer_id: string;
    service_id: string;
    organizer_id: string;
    event_date: string;
    guest_count?: number;
    total_price: number;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    notes?: string;
    created_at: string;
}
