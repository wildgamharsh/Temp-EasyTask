/**
 * Supabase Storage utilities for auth page images
 * Handles upload, deletion, and URL generation for auth background images
 */

import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (Next.js Server Action limit is 10MB)
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Upload auth background image to Supabase Storage
 * @param file - Image file to upload
 * @param organizerId - Organizer's ID for folder structure
 * @returns Public URL of uploaded image
 */
export async function uploadAuthBackground(
    file: File,
    organizerId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                error: "File size must be less than 5MB"
            };
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return {
                success: false,
                error: "File must be JPEG, PNG, or WebP format"
            };
        }

        const supabase = createClient();

        // Delete existing auth background if it exists
        const existingPath = `${organizerId}/auth-background.png`;
        await supabase.storage
            .from(BUCKET_NAME)
            .remove([existingPath]);

        // Upload new file
        const filePath = `${organizerId}/auth-background.png`;
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true
            });

        if (error) {
            console.error("Upload error:", error);
            return {
                success: false,
                error: error.message || "Failed to upload image"
            };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return {
            success: true,
            url: publicUrl
        };
    } catch (error) {
        console.error("Upload error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

/**
 * Delete auth background image from Supabase Storage
 * @param organizerId - Organizer's ID
 */
export async function deleteAuthBackground(
    organizerId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient();
        const filePath = `${organizerId}/auth-background.png`;

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error("Delete error:", error);
            return {
                success: false,
                error: error.message || "Failed to delete image"
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Delete error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred"
        };
    }
}

/**
 * Get public URL for auth background image
 * @param organizerId - Organizer's ID
 */
export function getAuthBackgroundUrl(organizerId: string): string {
    const supabase = createClient();
    const filePath = `${organizerId}/auth-background.png`;

    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Validate if a URL is accessible
 * @param url - URL to validate
 */
export async function validateImageUrl(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        return response.ok && (contentType?.startsWith('image/') ?? false);
    } catch {
        return false;
    }
}
