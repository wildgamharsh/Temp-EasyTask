"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    className?: string;
    label?: string;
    href?: string;
}

export function BackButton({ className, label = "Back", href }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <Button
            variant="ghost"
            onClick={handleClick}
            className={cn("pl-0 gap-1 hover:bg-transparent hover:text-primary transition-colors text-muted-foreground", className)}
        >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-medium">{label}</span>
        </Button>
    );
}
