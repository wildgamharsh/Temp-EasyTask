"use client";

import { useState, useEffect } from "react";
import { HARDCODED_MODELS, Model } from "./ai-models";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Star, Wrench, Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ModelSettings {
    defaultModel: string;
    disabledTools: string[]; // List of model_names that have tools disabled
}

interface AiModelsViewProps {
    onBack: () => void;
}

export function AiModelsView({ onBack }: AiModelsViewProps) {
    const [settings, setSettings] = useState<ModelSettings>({
        defaultModel: HARDCODED_MODELS[0].model_name,
        disabledTools: [],
    });
    const [searchTerm, setSearchTerm] = useState("");

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("ai_model_settings");
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse model settings", e);
            }
        }
    }, []);

    const saveSettings = (newSettings: ModelSettings) => {
        setSettings(newSettings);
        localStorage.setItem("ai_model_settings", JSON.stringify(newSettings));
    };

    const toggleDefault = (modelName: string) => {
        const newSettings = { ...settings, defaultModel: modelName };
        saveSettings(newSettings);
        toast.success("Default model updated");
    };

    const toggleToolSupport = (modelName: string, isEnabled: boolean) => {
        let newDisabled = [...settings.disabledTools];
        if (!isEnabled) {
            if (!newDisabled.includes(modelName)) newDisabled.push(modelName);
        } else {
            newDisabled = newDisabled.filter(m => m !== modelName);
        }
        
        saveSettings({ ...settings, disabledTools: newDisabled });
    };

    const filteredModels = HARDCODED_MODELS.filter(m => 
        m.model_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.model_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Models</h2>
                    <p className="text-gray-500 text-sm mt-1">Configure capabilities and default behaviors</p>
                </div>
                <Button onClick={onBack} variant="outline" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Back to Chat
                </Button>
            </div>

            <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                        placeholder="Search models..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 max-w-4xl mx-auto grid gap-4">
                    {filteredModels.map((model) => {
                        const isDefault = settings.defaultModel === model.model_name;
                        const toolsEnabled = !settings.disabledTools.includes(model.model_name);

                        return (
                            <div 
                                key={model.model_name}
                                className={cn(
                                    "p-4 rounded-xl border transition-all duration-200",
                                    isDefault ? "bg-blue-50/30 border-blue-200 shadow-sm" : "bg-white border-gray-100 hover:border-blue-100 hover:shadow-sm"
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {model.model_title}
                                            </h3>
                                            {isDefault && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <code className="text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded inline-block">
                                            {model.model_name}
                                        </code>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0">
                                         <Button
                                            variant={isDefault ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => toggleDefault(model.model_name)}
                                            disabled={isDefault}
                                            className={cn(
                                                "gap-2",
                                                isDefault ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "text-gray-500 hover:text-blue-600"
                                            )}
                                        >
                                            <Star className={cn("w-4 h-4", isDefault && "fill-current")} />
                                            {isDefault ? "Default" : "Set Default"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            toolsEnabled ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                                        )}>
                                            <Wrench className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">Tool Calling</span>
                                            <span className="text-xs text-gray-500">
                                                {toolsEnabled ? "Enabled" : "Disabled"} for this model
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`tools-${model.model_name}`} className="text-xs text-gray-500 sr-only">
                                            Enable Tool Calling
                                        </Label>
                                        <Switch
                                            id={`tools-${model.model_name}`}
                                            checked={toolsEnabled}
                                            onCheckedChange={(checked) => toggleToolSupport(model.model_name, checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}

// Export setting helpers for other components
export function getModelSettings(): ModelSettings {
    if (typeof window === 'undefined') return { defaultModel: HARDCODED_MODELS[0].model_name, disabledTools: [] };
    
    const saved = localStorage.getItem("ai_model_settings");
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            return { defaultModel: HARDCODED_MODELS[0].model_name, disabledTools: [] };
        }
    }
    return { defaultModel: HARDCODED_MODELS[0].model_name, disabledTools: [] };
}
