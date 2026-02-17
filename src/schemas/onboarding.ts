import { z } from "zod";

export const onboardingSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    businessName: z.string().min(2, "Business name is required"),
    subdomain: z.string().min(3, "Subdomain is required"),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").min(1, "Phone number is required"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
