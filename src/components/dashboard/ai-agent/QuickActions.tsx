"use client";

import { Sparkles, Brain, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onAction: (prompt: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    {
      label: "Synthesize Data",
      icon: FileText,
      prompt: "Can you help me synthesize and analyze some data?",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Creative Brainstorm",
      icon: Brain,
      prompt: "I need help brainstorming some creative ideas.",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Check Facts",
      icon: Search,
      prompt: "Can you help me verify some facts?",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Draft Content",
      icon: Sparkles,
      prompt: "Help me draft some content.",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mt-8 px-4">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          className="h-auto py-6 flex flex-col items-center gap-3 border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 hover:bg-white transition-all duration-300 rounded-xl bg-white"
          onClick={() => onAction(action.prompt)}
        >
          <div className={`p-3 rounded-full ${action.color}`}>
            <action.icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-gray-700">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
