"use client";

import { useState, useEffect } from "react";
import { HARDCODED_MODELS } from "./ai-models";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Star, Wrench, Search, ChevronLeft, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { type ModelConfig } from "./ai-models";

interface ModelSettings {
    defaultModel: string;
    disabledTools: string[]; // List of model_names that have tools disabled
}

interface AiConfigurationProps {
    onBack: () => void;
}

export function AiConfiguration({ onBack }: AiConfigurationProps) {
    const [settings, setSettings] = useState<ModelSettings>({
        defaultModel: HARDCODED_MODELS[0].model_name,
        disabledTools: [],
    });
    const [searchTerm, setSearchTerm] = useState("");
    
    // Model Config State (Base URL, API Key)
    const [currentConfig, setCurrentConfig] = useState<ModelConfig | null>(null);
    const [baseUrl, setBaseUrl] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [modelName, setModelName] = useState("");
    const [configNickname, setConfigNickname] = useState("");

    // Multiple Saved Configs
    const [savedConfigs, setSavedConfigs] = useState<(ModelConfig & { nickname: string; id: string })[]>([]);

    // Load settings from localStorage on mount
    useEffect(() => {
        // Load Model Settings
        const savedSettings = localStorage.getItem("ai_model_settings");
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error("Failed to parse model settings", e);
            }
        }

        // Load Saved Configs
        const configs = localStorage.getItem("ai_saved_configs");
        if (configs) {
            try {
                setSavedConfigs(JSON.parse(configs));
            } catch (e) {
                console.error("Failed to parse saved configs", e);
            }
        }

        // Load Current Active Config
        const savedConfig = localStorage.getItem("ai_custom_config");
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                setCurrentConfig(parsed);
                // Also pre-fill the form if no nickname is set
                setBaseUrl(parsed.baseUrl || "");
                setApiKey(parsed.apiKey || "");
                setModelName(parsed.modelName || "");
            } catch (e) {
                console.error("Failed to parse current config", e);
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

    const handleApplyConfig = (config: ModelConfig) => {
        setCurrentConfig(config);
        localStorage.setItem("ai_custom_config", JSON.stringify(config));
        toast.success(`Configuration Applied: ${config.modelName}`);
    };

    const handleSaveNewConfig = () => {
        if (!modelName.trim() || !configNickname.trim()) {
            toast.error("Nickname and Model Name are required");
            return;
        }

        const newConfig = {
            id: crypto.randomUUID(),
            nickname: configNickname.trim(),
            baseUrl: baseUrl.trim(),
            apiKey: apiKey.trim(),
            modelName: modelName.trim()
        };

        const updatedConfigs = [...savedConfigs, newConfig];
        setSavedConfigs(updatedConfigs);
        localStorage.setItem("ai_saved_configs", JSON.stringify(updatedConfigs));
        
        setConfigNickname("");
        toast.success("Configuration saved");
    };

    const handleDeleteConfig = (id: string) => {
        const updatedConfigs = savedConfigs.filter(c => c.id !== id);
        setSavedConfigs(updatedConfigs);
        localStorage.setItem("ai_saved_configs", JSON.stringify(updatedConfigs));
        
        // If the deleted one was active, clear it
        if (currentConfig && (savedConfigs.find(c => c.id === id)?.modelName === currentConfig.modelName)) {
            localStorage.removeItem("ai_custom_config");
            setCurrentConfig(null);
        }
        
        toast.info("Configuration deleted");
    };

    const applyOllamaTemplate = () => {
        setBaseUrl("http://localhost:11434");
        setApiKey("ollama");
        setModelName("llama3.2");
        setConfigNickname("Local Ollama");
        toast.info("Ollama template pre-filled");
    };

    const filteredModels = HARDCODED_MODELS.filter(m => 
        m.model_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.model_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-gray-100">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Configuration</h2>
                        <p className="text-gray-500 text-xs">Manage AI models and connection settings</p>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 max-w-3xl mx-auto space-y-8">
                    
                    {/* Active Configuration Info */}
                    {currentConfig && (
                        <section className="bg-green-50/50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <div>
                                    <p className="text-sm font-semibold text-green-900">Custom Config Active</p>
                                    <p className="text-xs text-green-700 font-mono tracking-tight">{currentConfig.modelName}</p>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    localStorage.removeItem("ai_custom_config");
                                    setCurrentConfig(null);
                                    toast.info("Switched to standard models");
                                }}
                                className="text-green-700 hover:bg-green-100 h-8 px-3 text-xs font-semibold"
                            >
                                Clear Redirect
                            </Button>
                        </section>
                    )}

                    {/* Create New Configuration */}
                    <section className="space-y-4">
                         <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Create Configuration</h3>
                            <Button variant="outline" size="sm" onClick={applyOllamaTemplate} className="h-7 text-xs">
                                Use Ollama Template
                            </Button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Nickname (e.g. My Local Llama)</Label>
                                <Input 
                                    placeholder="Enter a name for this config..." 
                                    value={configNickname}
                                    onChange={(e) => setConfigNickname(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-500">Base URL</Label>
                                    <Input 
                                        placeholder="https://api.openai.com/v1" 
                                        value={baseUrl}
                                        onChange={(e) => setBaseUrl(e.target.value)}
                                        className="bg-white text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-500">API Key</Label>
                                    <Input 
                                        placeholder="sk-..." 
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="bg-white text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-500">Model Name (Target)</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="gpt-4o or llama3.2" 
                                        value={modelName}
                                        onChange={(e) => setModelName(e.target.value)}
                                        className="bg-white"
                                    />
                                    <Button onClick={handleSaveNewConfig} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Saved Configurations List */}
                    {savedConfigs.length > 0 && (
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Saved Configurations</h3>
                            <div className="grid gap-3">
                                {savedConfigs.map((config) => (
                                    <div 
                                        key={config.id}
                                        className={cn(
                                            "group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 bg-white",
                                            currentConfig?.modelName === config.modelName ? "border-blue-200 ring-1 ring-blue-50 bg-blue-50/20" : "border-gray-100"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-gray-900">{config.nickname}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono uppercase">
                                                    {config.modelName}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{config.baseUrl || "Default Base URL"}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant={currentConfig?.modelName === config.modelName ? "secondary" : "outline"} 
                                                size="sm" 
                                                onClick={() => handleApplyConfig({ baseUrl: config.baseUrl, apiKey: config.apiKey, modelName: config.modelName })}
                                                className="h-8 px-4 text-xs font-semibold"
                                            >
                                                {currentConfig?.modelName === config.modelName ? "Applied" : "Apply"}
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleDeleteConfig(config.id)}
                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="h-px bg-gray-100" />

                    {/* Available Models List */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Standard Models</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <Input 
                                    placeholder="Search models..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 h-8 text-xs bg-gray-50 border-gray-200"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3">
                            {filteredModels.map((model) => {
                                const isDefault = settings.defaultModel === model.model_name;
                                const toolsEnabled = !settings.disabledTools.includes(model.model_name);

                                return (
                                    <div 
                                        key={model.model_name}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                                            isDefault ? "bg-blue-50/30 border-blue-100" : "bg-white border-gray-100 hover:border-blue-50"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-gray-900 truncate">{model.model_title}</span>
                                                {isDefault && (
                                                    <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold uppercase tracking-wider">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <code className="text-[10px] text-gray-400 font-mono mt-0.5 block truncate">
                                                {model.model_name}
                                            </code>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            {/* Tool Toggle */}
                                            <div className="flex items-center gap-2" title="Enable Tool Calling">
                                                <Switch
                                                    id={`tools-${model.model_name}`}
                                                    checked={toolsEnabled}
                                                    onCheckedChange={(checked) => toggleToolSupport(model.model_name, checked)}
                                                    className="scale-75 data-[state=checked]:bg-blue-600"
                                                />
                                                <Label htmlFor={`tools-${model.model_name}`} className="text-[10px] text-gray-500 font-medium cursor-pointer">
                                                    Tools
                                                </Label>
                                            </div>

                                            {/* Default Toggle */}
                                            <Button
                                                variant={isDefault ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => toggleDefault(model.model_name)}
                                                disabled={isDefault}
                                                className={cn(
                                                    "h-7 px-3 text-[10px] uppercase tracking-wider font-bold rounded-lg",
                                                    isDefault 
                                                        ? "bg-blue-100 text-blue-700" 
                                                        : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                                )}
                                            >
                                                {isDefault ? "Selected" : "Set Default"}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </ScrollArea>
        </div>
    );
}

// Helper to get settings for other components
export function getModelSettings(): ModelSettings {
    if (typeof window === 'undefined') return { defaultModel: HARDCODED_MODELS[0].model_name, disabledTools: [] };
    
    // Check custom config first? No, custom config overrides model selection, not global defaults.
    
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
