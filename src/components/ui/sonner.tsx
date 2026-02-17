"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-lg rounded-full px-6 py-4",
          title: "text-white font-semibold text-base",
          description: "text-white/90 text-sm",
          actionButton: "bg-white text-blue-600 hover:bg-white/90 font-bold rounded-full",
          cancelButton: "bg-white/20 text-white hover:bg-white/30 rounded-full",
        },
        style: {
          background: "linear-gradient(to right, hsl(217, 91%, 60%), hsl(224, 76%, 48%))",
          color: "white",
          border: "none",
          borderRadius: "99px", // More rounder
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
