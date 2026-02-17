/**
 * useScrollAnimation Hook
 * Triggers animations when elements enter viewport
 */

"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
    const {
        threshold = 0.1,
        rootMargin = "0px",
        triggerOnce = true
    } = options;

    const elementRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { elementRef, isVisible };
}

/**
 * useParallax Hook
 * Creates parallax scroll effect
 */

export function useParallax(speed: number = 0.5) {
    const elementRef = useRef<HTMLElement>(null);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const element = elementRef.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const scrolled = window.scrollY;
            const elementTop = rect.top + scrolled;
            const windowHeight = window.innerHeight;

            // Calculate parallax offset
            if (scrolled + windowHeight > elementTop && scrolled < elementTop + rect.height) {
                const parallaxOffset = (scrolled - elementTop) * speed;
                setOffset(parallaxOffset);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial calculation

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [speed]);

    return { elementRef, offset };
}

/**
 * useStaggerAnimation Hook
 * Creates staggered animation for list items
 */

export function useStaggerAnimation(itemCount: number, delayIncrement: number = 0.1) {
    const delays = Array.from({ length: itemCount }, (_, i) => i * delayIncrement);
    return delays;
}
