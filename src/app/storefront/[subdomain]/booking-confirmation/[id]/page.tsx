
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { getBooking } from "@/lib/supabase-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StorefrontNav from "@/components/storefront/StorefrontNav";
import "@/styles/storefront-animations.css";

// Force dynamic rendering since we rely on route params
export const dynamic = 'force-dynamic';

export default async function BookingConfirmationPage({
    params,
}: {
    params: Promise<{ subdomain: string; id: string }>;
}) {
    const { subdomain, id } = await params;
    const booking = await getBooking(id);

    if (!booking) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[var(--storefront-background)]">
            <StorefrontNav
                subdomain={subdomain}
                businessName={booking.organizerName}
                sections={[
                    { id: 'hero', label: 'Home' },
                    { id: 'services', label: 'Services' },
                    { id: 'contact', label: 'Contact' }
                ]}
            />

            <main className="container mx-auto px-4 pt-32 pb-16">
                <div className="max-w-2xl mx-auto animate-fade-in-up">
                    <Card className="p-8 md:p-12 text-center border-t-4 border-t-[var(--storefront-primary)] shadow-xl">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce-soft">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold mb-4 font-[family-name:var(--font-family)]" style={{ color: 'var(--storefront-text)' }}>
                            Booking Confirmed!
                        </h1>

                        <p className="text-lg text-gray-600 mb-8">
                            Thank you, <strong>{booking.customerName}</strong>. Your appointment has been successfully scheduled.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-4 border border-gray-100">
                            <h3 className="font-semibold text-gray-900 border-b pb-2 mb-4">Booking Details</h3>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-[var(--storefront-primary)]">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Service</p>
                                    <p className="font-medium">{booking.serviceName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-[var(--storefront-primary)]">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">
                                        {new Date(booking.eventDate + 'T00:00:00').toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-[var(--storefront-primary)]">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium">{booking.eventTime}</p>
                                </div>
                            </div>

                            {booking.notes && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-[var(--storefront-primary)]">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Notes</p>
                                        <p className="font-medium">{booking.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                                A confirmation email has been sent to {booking.customerEmail}.
                            </p>

                            <Button
                                asChild
                                className="w-full sm:w-auto bg-[var(--storefront-primary)] hover:opacity-90 transition-opacity"
                                size="lg"
                            >
                                <Link href={`/storefront/${subdomain}`}>
                                    Return to Home <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
