import Link from "next/link";
import Image from "next/image";

export function LandingFooter() {
    return (
        <footer className="bg-brand-50 text-slate-600 py-12 border-t border-brand-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center mb-4">
                        <Image
                            src="/images/logo-bgr.png"
                            alt="EasyTask"
                            width={140}
                            height={40}
                            className="h-10 w-auto"
                        />
                    </div>
                    <p className="text-sm text-slate-600">
                        The operating system for modern event businesses. Simplify bookings, manage inventory, and grow.
                    </p>
                </div>

                <div>
                    <h4 className="text-brand-900 font-bold mb-4">Product</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href="/how-it-works" className="hover:text-brand-700 transition-colors">
                                How It Works
                            </Link>
                        </li>
                        <li>
                            <Link href="#contact" className="hover:text-brand-700 transition-colors">
                                Scheduling
                            </Link>
                        </li>
                        <li>
                            <Link href="#contact" className="hover:text-brand-700 transition-colors">
                                Payments
                            </Link>
                        </li>
                        <li>
                            <Link href="#contact" className="hover:text-brand-700 transition-colors">
                                Pricing
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-brand-900 font-bold mb-4">Resources</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href="/about" className="hover:text-brand-700 transition-colors">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link href="#contact" className="hover:text-brand-700 transition-colors">
                                Blog
                            </Link>
                        </li>
                        <li>
                            <Link href="#contact" className="hover:text-brand-700 transition-colors">
                                Help Center
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-brand-900 font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href="/privacy-policy" className="hover:text-brand-700 transition-colors">
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link href="/terms-and-conditions" className="hover:text-brand-700 transition-colors">
                                Terms of Service
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-brand-200 text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} EasyTask Inc. All rights reserved.
            </div>
        </footer>
    );
}
