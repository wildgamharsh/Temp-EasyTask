/**
 * Server Actions for Storefront Builder
 * Saves business info, content, and design settings
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

interface StorefrontBuilderData {
    businessData: {
        businessName: string;
        shortDescription: string;
        logoUrl: string;
        aboutUs: string;
        contactEmail: string;
        contactPhone: string;
        address: string;
        socialLinks: Record<string, string>;
        pricingDisplay?: boolean;
    };
    contentData: {
        testimonials: Array<{
            name: string;
            role?: string;
            content: string;
            rating?: number;
            image?: string;
        }>;
        galleryImages: string[];
        heroTitle: string;
        heroSubtitle: string;
        bannerUrl: string;
        showHero: boolean;
        showAbout: boolean;
        showTestimonials: boolean;
        showGallery: boolean;
        showContact: boolean;
        showSocialLinks: boolean;
        showServices?: boolean;
        authDescription?: string;
        loginHeading?: string;
        loginDescription?: string;
        signupHeading?: string;
        signupDescription?: string;
        authBackgroundUrl?: string;
    };
    designData: {
        template: 'modern' | 'classic' | 'elegant'; // Legacy
        templateCategory?: import("@/lib/database.types").TemplateCategory; // New field
        fontFamily: string;
        templateColors?: {
            goldPrimary: string;
            goldDark: string;
            charcoalPrimary: string;
            charcoalDark: string;
            bgLight: string;
            bgCard: string;
            textPrimary: string;
            textSecondary: string;
            textMuted: string;
            borderLight: string;
            borderGold: string;

        };
        themeColors: {
            primary: string;
            secondary: string;
            accent: string;
            background: string;
            text: string;
            muted: string;
        };
    };
    subdomain?: string; // Optional for backward compatibility, but should be passed
}

export async function checkSubdomainAvailability(subdomain: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id; // Optional for this check, but used for exclusion

        // Normalize
        const normalizedSubdomain = subdomain.toLowerCase().trim();

        // Check if taken by ANYONE (including self, to be safe, but we'll filter self out in UI logic ideally, 
        // strictly speaking "availability" means "can I take this?". If I stick to my own, it's available TO ME.
        // But for a check, usually we check if *another* user has it.

        const { data, error } = await supabase
            .from('organizers') // Changed from profiles
            .select('id')
            .eq('subdomain', normalizedSubdomain)
            .neq('id', userId) // Exclude self
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
            console.error('Error checking subdomain:', error);
            throw new Error('Failed to check availability');
        }

        return { available: !data };
    } catch (error) {
        console.error('Error in checkSubdomainAvailability:', error);
        return { available: false, error: 'Failed to check availability' };
    }
}

export async function saveStorefrontSettings(data: StorefrontBuilderData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: "Unauthorized"
            };
        }

        const userId = user.id;

        // 0. Handle Subdomain Update if provided
        if (data.subdomain) {
            const normalizedSubdomain = data.subdomain.toLowerCase().trim();

            // Double check availability to prevent race conditions
            const { available } = await checkSubdomainAvailability(normalizedSubdomain);

            // We need to check if it's the USER'S current subdomain. 
            // checkSubdomainAvailability excludes self, so if it returns available=true, 
            // it means no one ELSE has it. It might be the user's current one, which is fine.
            if (!available) {
                return {
                    success: false,
                    error: `Subdomain "${normalizedSubdomain}" is unavailable.`
                };
            }

            // Update profile with new subdomain
            const { error: subdomainError } = await supabase
                .from('organizers') // Changed from profiles
                .update({
                    subdomain: normalizedSubdomain,
                    storefront_enabled: true
                })
                .eq('id', userId);

            if (subdomainError) {
                console.error('Error updating subdomain:', subdomainError);
                if (subdomainError.code === '23505') { // Unique violation
                    return { success: false, error: 'Subdomain is already taken.' };
                }
                return { success: false, error: 'Failed to update subdomain.' };
            }
        }

        // 1. Update profile with business info
        const { error: profileError } = await supabase
            .from('organizers') // Changed from profiles
            .update({
                business_name: data.businessData.businessName,
                logo_url: data.businessData.logoUrl,
                description: data.businessData.aboutUs,
                gallery: data.contentData.galleryImages,
                storefront_enabled: true, // Enable storefront after setup
            })
            .eq('id', userId);

        if (profileError) {
            console.error('Error updating profile:', profileError);
            return {
                success: false,
                error: `Failed to update profile: ${profileError.message}`
            };
        }

        // 2. Update or create storefront settings
        const settingsData = {
            organizer_id: userId,
            business_name: data.businessData.businessName,
            tagline: data.businessData.shortDescription,
            logo_url: data.businessData.logoUrl,
            banner_url: data.contentData.bannerUrl,
            pricing_display: data.businessData.pricingDisplay ?? true, // Default to true

            // Template & Theme
            template: data.designData.template,
            template_category: data.designData.templateCategory,
            font_family: data.designData.fontFamily,
            // Use templateColors if available (new system), otherwise use legacy themeColors
            theme_colors: data.designData.templateColors ? {
                primary: data.designData.templateColors.goldPrimary,
                secondary: data.designData.templateColors.goldDark,
                accent: data.designData.templateColors.borderGold,
                background: data.designData.templateColors.bgLight,
                text: data.designData.templateColors.textPrimary,
                muted: data.designData.templateColors.textSecondary,
            } : data.designData.themeColors,

            // Component Visibility
            show_hero: data.contentData.showHero,
            show_about: data.contentData.showAbout,
            show_services: true, // Always show services
            show_testimonials: data.contentData.showTestimonials,
            show_gallery: data.contentData.showGallery,
            show_contact: data.contentData.showContact,
            show_social_links: data.contentData.showSocialLinks,

            // Hero Section
            hero_title: data.contentData.heroTitle,
            hero_subtitle: data.contentData.heroSubtitle,
            hero_cta_text: 'View Services',
            hero_cta_link: '#services',

            // Content
            about_text: data.businessData.aboutUs,
            contact_email: data.businessData.contactEmail,
            contact_phone: data.businessData.contactPhone,
            address: data.businessData.address,
            social_links: data.businessData.socialLinks,

            // Testimonials & Gallery
            testimonials: data.contentData.testimonials,
            gallery_images: data.contentData.galleryImages,

            // Auth Page Customization
            auth_description: data.contentData.authDescription,
            login_heading: data.contentData.loginHeading,
            login_description: data.contentData.loginDescription,
            signup_heading: data.contentData.signupHeading,
            signup_description: data.contentData.signupDescription,
            auth_background_url: data.contentData.authBackgroundUrl,

            updated_at: new Date().toISOString(),
        };

        // Try to save with all fields first
        let { error: settingsError } = await supabase
            .from('storefront_settings')
            .upsert(settingsData, {
                onConflict: 'organizer_id'
            });

        // If error is related to missing column (Postgres 42703), retry without new fields
        if (settingsError && settingsError.code === '42703') {
            console.warn('Column missing in storefront_settings, retrying with legacy fields only');

            const legacySettingsData = { ...settingsData };
            delete legacySettingsData.template_category;

            const retryResult = await supabase
                .from('storefront_settings')
                .upsert(legacySettingsData, {
                    onConflict: 'organizer_id'
                });

            settingsError = retryResult.error;
        }

        if (settingsError) {
            console.error('Error updating storefront settings:', settingsError);
            return {
                success: false,
                error: `Failed to update storefront settings: ${settingsError.message}`
            };
        }

        // 3. Revalidate paths
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/storefront-builder');

        return {
            success: true,
        };

    } catch (error) {
        console.error('Unexpected error in saveStorefrontSettings:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
}

export async function uploadStorefrontImage(formData: FormData) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };
        const userId = user.id;
        const file = formData.get('file') as File;
        const type = formData.get('type') as string || 'gallery';

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/data/${type}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file, {
                upsert: true,
                contentType: file.type,
            });

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            return { success: false, error: uploadError.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return { success: true, url: publicUrl };

    } catch (error) {
        console.error('Error in uploadStorefrontImage:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed'
        };
    }
}

export async function generateStorefrontContent(businessName: string, model: string = "nvidia/nemotron-3-nano-30b-a3b:free", apiKey?: string) {
    try {
        const token = apiKey || process.env.OPENROUTER_API_KEY;
        if (!token) throw new Error("API Key is missing (not in env and not provided)");

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: token,
        });

        const systemPrompt = `You are a professional AI web content generator.
Your task is to generate a comprehensive, professional, yet friendly and persuasive business profile for a given business name.
You must return ONLY a valid JSON object. Do not include markdown formatting (like \`\`\`json) or any other text.
The JSON object must strictly follow this structure:
{
  "shortDescription": "A brief, catchy tagline or 1-2 sentence description (max 200 chars)",
  "aboutUs": "A detailed, engaging story about the business, its mission, and what makes it special (3-4 paragraphs)",
  "contactEmail": "A professional placeholder email (e.g., hello@...)",
  "contactPhone": "A professional placeholder phone number",
  "address": "A realistic but fictional business address",
  "heroTitle": "A catchy, welcoming headline for the homepage hero section",
  "heroSubtitle": "A supporting subheadline for the hero section",
  "testimonials": [
    {
      "name": "Full Name",
      "role": "Job Title or Customer Type",
      "content": "A glowing, specific testimonial (2-3 sentences)"
    },
    {
      "name": "Full Name",
      "role": "Job Title or Customer Type",
      "content": "A glowing, specific testimonial (2-3 sentences)"
    },
    {
      "name": "Full Name",
      "role": "Job Title or Customer Type",
      "content": "A glowing, specific testimonial (2-3 sentences)"
    }
  ]
}
Ensure the content is tailored to the business name provided, inferring the industry and style.
`;

        const userPrompt = `Create a professional profile for the company: "${businessName}".`;

        const chatCompletion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
        });

        let result = chatCompletion.choices[0].message.content;

        if (!result) throw new Error("No content received from AI");



        // Clean up markdown code blocks if present
        result = result.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");

        return {
            success: true,
            data: JSON.parse(result)
        };

    } catch (error) {
        console.error("AI Generation Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate content"
        };
    }
}
