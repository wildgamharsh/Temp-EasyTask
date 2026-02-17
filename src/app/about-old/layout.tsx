import { LandingNavbar, LandingFooter } from "@/components/layout";

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <LandingNavbar />
            <main className="flex-1">{children}</main>
            <LandingFooter />
        </div>
    );
}
