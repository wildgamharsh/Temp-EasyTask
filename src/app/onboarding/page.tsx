"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    User,
    Building2,
    Loader2,
    Phone,
} from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { onboardingSchema, OnboardingFormData } from "@/schemas/onboarding";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { checkSubdomainAvailability } from "@/lib/supabase-data";
import { completeOnboarding } from "./actions";
import Image from "next/image";

export default function OnboardingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [checkingSubdomain, setCheckingSubdomain] = useState(false);
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            name: "",
            subdomain: "",
            businessName: "",
            phone: "",
        },
    });

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                router.push("/login");
                return;
            }

            // Check if organizer profile already exists AND onboarding is completed
            const { data: organizer } = await supabase
                .from('organizers')
                .select('id, onboarding_completed')
                .eq('id', user.id)
                .single();

            if (organizer?.onboarding_completed) {
                router.push("/dashboard");
                return;
            }

            const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
            if (fullName) setValue("name", fullName);

            const phoneStr = user.user_metadata?.phone || "";
            if (phoneStr) setValue("phone", phoneStr);

            setUser(user);
            setIsLoading(false);
        };

        getUser();
    }, [router, setValue]);

    const subdomain = watch("subdomain");

    const handleCheckSubdomain = async () => {
        if (!subdomain || subdomain.length < 3) {
            toast.error("Subdomain must be at least 3 characters");
            return;
        }

        setCheckingSubdomain(true);
        try {
            const available = await checkSubdomainAvailability(subdomain.toLowerCase());
            setSubdomainAvailable(available);

            if (available) {
                toast.success("Subdomain is available!");
            } else {
                toast.error("Subdomain is already taken");
            }
        } catch (error) {
            console.error("Error checking subdomain:", error);
            toast.error("Failed to check availability");
            setSubdomainAvailable(null);
        } finally {
            setCheckingSubdomain(false);
        }
    };

    const onSubmit = async (data: OnboardingFormData) => {
        if (!user) return;

        if (subdomainAvailable !== true) {
            if (subdomainAvailable === false) {
                toast.error("Subdomain is already taken");
                return;
            }
            // Optional: verify subdomain before submit if not verified yet
            await handleCheckSubdomain();
            if (subdomainAvailable === false) return;
        }

        setIsLoading(true);
        try {
            const result = await completeOnboarding({
                name: data.name,
                businessName: data.businessName,
                subdomain: data.subdomain?.toLowerCase(),
                phone: data.phone,
                role: 'organizer'
            });

            if (!result.success) {
                toast.error(result.error || "Failed to complete onboarding");
                setIsLoading(false);
                return;
            }

            toast.success("Welcome! Setting up your store...");

            if (result.redirectTo) {
                window.location.href = result.redirectTo;
            }
        } catch (error) {
            console.error("Error during onboarding:", error);
            toast.error("Failed to complete onboarding. Please try again.");
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Panel - Hero Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574&auto=format&fit=crop"
                        alt="Workspace"
                        className="h-full w-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 p-12 text-white">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-500/30">
                        <i className="fa-solid fa-rocket text-xl"></i>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Launch Your Business</h1>
                    <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                        Set up your professional storefront and start accepting bookings in minutes.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-background">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <div className="flex h-12 w-auto items-center justify-center mb-6 lg:hidden">
                            <Image
                                src="/images/logo-bgr.png"
                                alt="EasyTask"
                                width={160}
                                height={45}
                                className="h-10 w-auto"
                            />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Setup Your Store
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Enter your business details to get started.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="pl-10"
                                    {...register("name")}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <PhoneInput
                                            {...field}
                                            id="phone"
                                            defaultCountry="CA"
                                            value={field.value || ""}
                                            onChange={(val) => field.onChange(val || "")}
                                            placeholder="(+1) 234-567-89"
                                            className={cn(
                                                "focus-within:ring-2 focus-within:bg-white rounded-3xl overflow-hidden transition-all shadow-sm",
                                                errors.phone ? "focus-within:ring-red-400 ring-2 ring-red-400/50" : "focus-within:ring-green-400"
                                            )}
                                        />
                                    )}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-sm text-destructive">{errors.phone.message}</p>
                            )}
                        </div>

                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="businessName">Business Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="businessName"
                                        type="text"
                                        placeholder="Your Business Name"
                                        className="pl-10"
                                        {...register("businessName")}
                                    />
                                </div>
                                {errors.businessName && (
                                    <p className="text-sm text-destructive">{errors.businessName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subdomain">Storefront URL</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            id="subdomain"
                                            type="text"
                                            value={subdomain || ""}
                                            onChange={(e) => {
                                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                                                setValue("subdomain", val, { shouldValidate: true });
                                                setSubdomainAvailable(null);
                                            }}
                                            placeholder="your-business"
                                            className="flex-1"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleCheckSubdomain}
                                        disabled={checkingSubdomain || !subdomain || subdomain.length < 3}
                                        variant="outline"
                                    >
                                        {checkingSubdomain ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Final URL: <span className="font-mono bg-slate-100 px-1 rounded">{subdomain || "your-business"}.easytask.ca</span>
                                </p>
                                {subdomainAvailable !== null && (
                                    <div className={cn("text-xs flex items-center gap-1.5 font-medium", subdomainAvailable ? "text-green-600" : "text-red-600")}>
                                        {subdomainAvailable ? (
                                            <>
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                                                Available
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                                Unavailable
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Setup"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
