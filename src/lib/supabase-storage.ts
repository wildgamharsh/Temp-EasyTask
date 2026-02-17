// Supabase Storage utilities for managing images with proper folder structure
import { createClient } from "@/lib/supabase/client";

/**
 * IMPORTANT: All images are stored in the 'images' bucket (public bucket)
 * 
 * Folder structure in the 'images' bucket:
 * - {organizerId}/
 *   - data/
 *     - logo-{timestamp}.png (organizer logo)
 *     - services/
 *       - {serviceId}-{timestamp}.jpg
 *       - {serviceId}-{timestamp}.jpg
 *     - gallery/
 *       - {timestamp}.jpg
 *       - {timestamp}.jpg
 */

// Bucket name constant - DO NOT CHANGE
const STORAGE_BUCKET = "images";

export type ImageType = "logo" | "service" | "gallery";

interface UploadImageOptions {
    file: File;
    organizerId: string;
    type: ImageType;
    serviceId?: string; // Required for service images
}

/**
 * Generate the storage path for an image based on organizer and type
 */
function getImagePath(
    organizerId: string,
    type: ImageType,
    fileName: string,
    serviceId?: string
): string {
    const baseFolder = `${organizerId}/data`;

    switch (type) {
        case "logo":
            return `${baseFolder}/logo-${fileName}`;
        case "service":
            if (!serviceId) {
                throw new Error("serviceId is required for service images");
            }
            return `${baseFolder}/services/${serviceId}-${fileName}`;
        case "gallery":
            return `${baseFolder}/gallery/${fileName}`;
        default:
            throw new Error(`Unknown image type: ${type}`);
    }
}

/**
 * Upload an image to Supabase Storage with proper folder structure
 * @returns Public URL of the uploaded image or null on error
 */
export async function uploadImage({
    file,
    organizerId,
    type,
    serviceId,
}: UploadImageOptions): Promise<string | null> {
    const supabase = createClient();

    // Validate file size (2MB limit as per bucket settings)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > MAX_FILE_SIZE) {
        console.error("File size exceeds 2MB limit");
        return null;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
        console.error("File must be an image");
        return null;
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const fileName = `${timestamp}.${fileExt}`;

    // Get the storage path
    const filePath = getImagePath(organizerId, type, fileName, serviceId);

    console.log("Uploading image:", {
        bucket: STORAGE_BUCKET,
        fileName,
        filePath,
        type,
        organizerId,
        fileSize: file.size,
        fileType: file.type
    });

    // Upload to Supabase Storage
    const { error: uploadError, data: uploadData } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type,
        });

    if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return null;
    }

    console.log("Upload successful:", uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    console.log("Generated public URL:", publicUrl);

    return publicUrl;
}

/**
 * Upload multiple service images
 * @returns Array of public URLs
 */
export async function uploadServiceImages(
    files: File[],
    organizerId: string,
    serviceId: string
): Promise<string[]> {
    const uploadPromises = files.map((file) =>
        uploadImage({
            file,
            organizerId,
            type: "service",
            serviceId,
        })
    );

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
}

/**
 * Upload organizer logo
 * @returns Public URL of the uploaded logo or null on error
 */
export async function uploadOrganizerLogo(
    file: File,
    organizerId: string
): Promise<string | null> {
    return uploadImage({
        file,
        organizerId,
        type: "logo",
    });
}

/**
 * Upload gallery images
 * @returns Array of public URLs
 */
export async function uploadGalleryImages(
    files: File[],
    organizerId: string
): Promise<string[]> {
    const uploadPromises = files.map((file) =>
        uploadImage({
            file,
            organizerId,
            type: "gallery",
        })
    );

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
}

/**
 * Get public URL for an existing image path
 */
export function getImageUrl(path: string): string {
    const supabase = createClient();
    const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);

    return publicUrl;
}

/**
 * Get public URL with image transformations (resize, compress)
 */
export function getTransformedImageUrl(
    path: string,
    options?: {
        width?: number;
        height?: number;
        resize?: "cover" | "contain" | "fill";
        quality?: number;
    }
): string {
    const supabase = createClient();
    const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path, {
            transform: {
                width: options?.width,
                height: options?.height,
                resize: options?.resize || "cover",
                quality: options?.quality || 80,
            },
        });

    return publicUrl;
}

/**
 * Delete an image from storage
 */
export async function deleteImage(path: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

    if (error) {
        console.error("Error deleting image:", error);
        return false;
    }

    return true;
}

/**
 * Delete multiple images from storage
 */
export async function deleteImages(paths: string[]): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(paths);

    if (error) {
        console.error("Error deleting images:", error);
        return false;
    }

    return true;
}

/**
 * List all images for an organizer
 */
export async function listOrganizerImages(
    organizerId: string,
    type?: ImageType
): Promise<string[]> {
    const supabase = createClient();
    const folder = type
        ? `${organizerId}/data/${type === "service" ? "services" : type === "gallery" ? "gallery" : ""}`
        : `${organizerId}/data`;

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folder);

    if (error) {
        console.error("Error listing images:", error);
        return [];
    }

    return (data || []).map((file) => `${folder}/${file.name}`);
}

/**
 * Extract the storage path from a public URL
 * Useful for deleting images when you only have the public URL
 */
export function extractPathFromUrl(publicUrl: string): string | null {
    try {
        const url = new URL(publicUrl);
        const pathMatch = url.pathname.match(new RegExp(`\\/storage\\/v1\\/object\\/public\\/${STORAGE_BUCKET}\\/(.+)`));
        return pathMatch ? pathMatch[1] : null;
    } catch (error) {
        console.error("Error extracting path from URL:", error);
        return null;
    }
}
