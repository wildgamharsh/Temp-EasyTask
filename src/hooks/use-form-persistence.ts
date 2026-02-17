"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface UseFormPersistenceProps<T extends Record<string, any>> {
    key: string;
    form: UseFormReturn<T>;
    defaultValues: T;
    isEnabled?: boolean;
}

/**
 * A hook to persist react-hook-form state to localStorage.
 * Useful for preventing data loss on accidental page reloads or close.
 */
export function useFormPersistence<T extends Record<string, any>>({
    key,
    form,
    defaultValues,
    isEnabled = true,
}: UseFormPersistenceProps<T>) {
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from storage on mount
    useEffect(() => {
        if (!isEnabled) return;
        if (typeof window === "undefined") return;

        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                // We merge stored values with default values locally to ensure shape consistency
                // But for react-hook-form reset() works best
                form.reset({ ...defaultValues, ...parsed });
            }
        } catch (error) {
            console.error("Failed to load form persistence:", error);
        } finally {
            setIsLoaded(true);
        }
    }, [key, isEnabled, form, defaultValues]);

    // Save to storage on change
    useEffect(() => {
        if (!isEnabled || !isLoaded) return;

        const subscription = form.watch((value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error("Failed to save form persistence:", error);
            }
        });

        return () => subscription.unsubscribe();
    }, [key, isEnabled, isLoaded, form]);

    // Function to clear storage (call on successful submit)
    const clearStorage = () => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Failed to clear form persistence:", error);
        }
    };

    return { isLoaded, clearStorage };
}
