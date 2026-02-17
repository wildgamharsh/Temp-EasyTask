"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, ArrowRight, Check, X, Layers, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { generateServiceConfigAction } from "@/app/dashboard/ai-agent/actions";
import { Service } from "@/types/pricing";
import { toast } from "sonner";

interface PricingAiAssistantProps {
    currentConfig: Service;
    onApply: (config: Service) => void;
    onCancel: () => void;
}

export function PricingAiAssistant({ currentConfig, onApply, onCancel }: PricingAiAssistantProps) {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);


    const [generatedService, setGeneratedService] = useState<Service | null>(null);

    // Ollama State
    const [useOllama, setUseOllama] = useState(false);
    const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434/v1");
    const [ollamaModel, setOllamaModel] = useState("llama3");
    const [showSettings, setShowSettings] = useState(false);

    const applyOllamaTemplate = () => {
        setPrompt("Please generate a service structure relative to: \n\n");
        toast.info("Ollama template applied");
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const config = useOllama ? {
                baseUrl: ollamaUrl,
                modelName: ollamaModel,
                apiKey: "ollama"
            } : undefined;

            const result = await generateServiceConfigAction(prompt, currentConfig, config);
            if (result.success && result.config) {
                setGeneratedService(result.config);
                toast.success("Pricing framework generated!");
            } else {
                toast.error(result.error || "Failed to generate configuration");
            }
        } catch (error) {
            console.error("Generation error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = () => {
        if (generatedService) {
            // Merge generated parts into current config to preserve ID/Metadata if needed
            // For now, we assume a full replace of Steps and Rules is desired
            const newConfig = {
                ...currentConfig,
                ...generatedService,
                id: currentConfig.id, // Preserve ID
                name: generatedService.name || currentConfig.name,
                description: generatedService.description || currentConfig.description
            };
            onApply(newConfig);
            toast.success("Configuration applied successfully");
        }
    };

    return (
        <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/10 mb-6">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <Sparkles className="h-5 w-5" />
                        <CardTitle className="text-lg">AI Pricing Architect</CardTitle>
                    </div>
                    <CardDescription>
                        Describe your service and let the AI build the structure.
                    </CardDescription>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-purple-600 hover:bg-purple-100"
                >
                    {useOllama ? "Local AI" : "Cloud AI"}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">

                {showSettings && (
                    <div className="bg-white p-4 rounded-md border border-purple-100 mb-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">Model Settings</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Use Ollama</span>
                                <input
                                    type="checkbox"
                                    checked={useOllama}
                                    onChange={(e) => setUseOllama(e.target.checked)}
                                    className="toggle"
                                />
                            </div>
                        </div>

                        {useOllama && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Base URL</label>
                                    <input
                                        className="w-full text-xs p-2 border rounded"
                                        value={ollamaUrl}
                                        onChange={(e) => setOllamaUrl(e.target.value)}
                                        placeholder="http://localhost:11434/v1"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-500">Model Name</label>
                                    <div className="flex gap-2">
                                        <input
                                            className="w-full text-xs p-2 border rounded"
                                            value={ollamaModel}
                                            onChange={(e) => setOllamaModel(e.target.value)}
                                            placeholder="llama3"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 shrink-0"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`${ollamaUrl}/tags`.replace('/v1', '/api'));
                                                    const data = await res.json();
                                                    if (data.models) {
                                                        // Just a quick toast or list would be better, but for now just success
                                                        toast.success(`Found ${data.models.length} models. Check console.`);
                                                        console.log(data.models);
                                                        if (data.models.length > 0) {
                                                            setOllamaModel(data.models[0].name);
                                                            toast.success(`Auto-selected: ${data.models[0].name}`);
                                                        }
                                                    }
                                                } catch (e) {
                                                    toast.error("Failed to fetch models. CORS issue?");
                                                }
                                            }}
                                            title="Fetch Models"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={applyOllamaTemplate}
                                        className="w-full text-xs"
                                    >
                                        Apply Ollama Template
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!generatedService ? (
                    <div className="space-y-3">
                        <Textarea
                            placeholder="Describe your pricing steps, options, and logic..."
                            className="min-h-[100px] bg-white dark:bg-gray-950 resize-y border-purple-200 focus:ring-purple-500"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isGenerating}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={onCancel} disabled={isGenerating}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Architecting...
                                    </>
                                ) : (
                                    <>
                                        Generate Framework
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-950 p-4 rounded-md border border-gray-200 dark:border-gray-800">
                            <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2">Generated Structure</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-medium">Service Name</span>
                                    <span>{generatedService.name}</span>
                                </div>

                                {/* Steps Preview */}
                                <div className="border-b pb-2">
                                    <div className="flex items-center gap-2 mb-1 text-blue-600">
                                        <Layers size={14} />
                                        <span className="font-medium text-sm">Steps ({generatedService.steps?.length || 0})</span>
                                    </div>
                                    <ul className="text-sm text-gray-600 pl-6 list-disc max-h-32 overflow-y-auto">
                                        {generatedService.steps?.map(s => (
                                            <li key={s.id}>
                                                <strong>{s.name}</strong> <span className="text-xs opacity-70">[{s.displayStyle}]</span> ({s.options?.length || 0} options)
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Rules Preview */}
                                <div className="pb-2">
                                    <div className="flex items-center gap-2 mb-1 text-indigo-600">
                                        <Zap size={14} />
                                        <span className="font-medium text-sm">Logic Rules ({generatedService.rules?.length || 0})</span>
                                    </div>
                                    <p className="text-xs text-gray-500 pl-6">
                                        {generatedService.rules?.length > 0
                                            ? "Contains conditional logic for price/visibility"
                                            : "No complex logic generated"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setGeneratedService(null)}>
                                Back to Edit
                            </Button>
                            <Button
                                onClick={handleApply}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Apply to Builder
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

