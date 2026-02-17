import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/30 p-4">
            <Card className="max-w-lg w-full">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <FileQuestion className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-3xl">404</CardTitle>
                    <CardDescription className="text-lg">
                        Page Not Found
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Message */}
                    <div className="text-center space-y-2">
                        <p className="text-muted-foreground">
                            Sorry, we couldn&apos;t find the page you&apos;re looking for.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            The page may have been moved, deleted, or never existed.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Button asChild size="lg" className="w-full">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                            <Button asChild variant="outline">
                                <Link href="/services">
                                    <Search className="mr-2 h-4 w-4" />
                                    Browse Services
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Go Back
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Helpful Links */}
                    <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-3">Popular pages:</p>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="link" size="sm" className="h-auto p-0">
                                <Link href="/services">Services</Link>
                            </Button>
                            <span className="text-muted-foreground">•</span>
                            <Button asChild variant="link" size="sm" className="h-auto p-0">
                                <Link href="/about">About</Link>
                            </Button>
                            <span className="text-muted-foreground">•</span>
                            <Button asChild variant="link" size="sm" className="h-auto p-0">
                                <Link href="/login">Login</Link>
                            </Button>
                            <span className="text-muted-foreground">•</span>
                            <Button asChild variant="link" size="sm" className="h-auto p-0">
                                <Link href="/register">Register</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
