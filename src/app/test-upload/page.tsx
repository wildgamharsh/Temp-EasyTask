"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Image Upload Test Page
 * Use this page to test and debug Supabase Storage uploads
 */
export default function ImageUploadTestPage() {
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUser(user);
        });
    }, []);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{
        success: boolean;
        message: string;
        url?: string;
        details?: unknown;
    } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        setUploadResult(null);

        try {
            console.log("=== UPLOAD TEST STARTED ===");
            console.log("File:", {
                name: file.name,
                size: file.size,
                type: file.type,
            });
            console.log("User ID:", user.id);

            // Import the upload function
            const { uploadOrganizerLogo } = await import("@/lib/supabase-data");

            // Attempt upload
            const url = await uploadOrganizerLogo(file, user.id);

            if (url) {
                console.log("✅ Upload successful!");
                console.log("Public URL:", url);
                setUploadResult({
                    success: true,
                    message: "Upload successful!",
                    url,
                    details: {
                        fileName: file.name,
                        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
                        fileType: file.type,
                        userId: user.id,
                        publicUrl: url,
                    },
                });
            } else {
                console.error("❌ Upload failed - no URL returned");
                setUploadResult({
                    success: false,
                    message: "Upload failed - no URL returned. Check console for details.",
                });
            }
        } catch (error: unknown) {
            console.error("❌ Upload error:", error);
            setUploadResult({
                success: false,
                message: `Upload error: ${error instanceof Error ? error.message : "Unknown error"}`,
                details: error,
            });
        } finally {
            setIsUploading(false);
            console.log("=== UPLOAD TEST ENDED ===");
        }
    };

    if (!user) {
        return (
            <div className="container max-w-2xl py-12">
                <Alert>
                    <AlertDescription>
                        Please log in to test image uploads.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-12 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Image Upload Test</h1>
                <p className="text-muted-foreground">
                    Test Supabase Storage uploads and debug any issues
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Test Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                            className="hidden"
                            id="test-upload"
                        />
                        <Button
                            onClick={() => document.getElementById("test-upload")?.click()}
                            disabled={isUploading}
                            className="w-full"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose Image to Upload
                                </>
                            )}
                        </Button>
                    </div>

                    {uploadResult && (
                        <Alert variant={uploadResult.success ? "default" : "destructive"}>
                            <div className="flex items-start gap-2">
                                {uploadResult.success ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                ) : (
                                    <XCircle className="h-5 w-5 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <AlertDescription>
                                        <p className="font-semibold mb-2">{uploadResult.message}</p>
                                        {uploadResult.url && (
                                            <div className="space-y-2">
                                                <p className="text-sm">Public URL:</p>
                                                <a
                                                    href={uploadResult.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-500 hover:underline break-all"
                                                >
                                                    {uploadResult.url}
                                                </a>
                                                <div className="mt-4">
                                                    <img
                                                        src={uploadResult.url}
                                                        alt="Uploaded"
                                                        className="max-w-full h-auto rounded-lg border"
                                                        onError={(e) => {
                                                            console.error("Image failed to load");
                                                            (e.target as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {!!uploadResult.details && (
                                            <details className="mt-4">
                                                <summary className="cursor-pointer text-sm font-medium">
                                                    View Details
                                                </summary>
                                                <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                    {JSON.stringify(uploadResult.details as any, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </AlertDescription>
                                </div>
                            </div>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-muted-foreground">1.</span>
                            <span>Create <code className="bg-muted px-1 rounded">images</code> bucket in Supabase Dashboard</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-muted-foreground">2.</span>
                            <span>Set bucket to <strong>Public</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-muted-foreground">3.</span>
                            <span>Set file size limit to <strong>2MB</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-muted-foreground">4.</span>
                            <span>Set allowed MIME types to <code className="bg-muted px-1 rounded">image/*</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-muted-foreground">5.</span>
                            <span>Verify environment variables in <code className="bg-muted px-1 rounded">.env.local</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-muted-foreground">6.</span>
                            <span>Open browser console (F12) to see detailed logs</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>User Info</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="space-y-2 text-sm">
                        <div>
                            <dt className="text-muted-foreground">User ID:</dt>
                            <dd className="font-mono">{user.id}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Email:</dt>
                            <dd>{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Expected folder:</dt>
                            <dd className="font-mono">{user.id}/data/</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </div>
    );
}
