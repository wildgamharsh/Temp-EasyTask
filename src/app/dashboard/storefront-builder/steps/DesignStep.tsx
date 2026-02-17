/**
 * Design Step - Step 3 of Storefront Builder
 * Template selection and color theme customization
 */

"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import type { TemplateCategory } from "@/lib/database.types";
import { TEMPLATE_CONFIGS, COLOR_PALETTES } from "@/lib/template-configs";

interface TemplateColors {
    // Brand Colors
    goldPrimary: string;
    goldDark: string;
    charcoalPrimary: string;
    charcoalDark: string;
    // Backgrounds
    bgLight: string;
    bgCard: string;
    // Text Colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    // Borders
    borderLight: string;
    borderGold: string;
}

interface DesignData {
    template?: 'modern' | 'classic' | 'elegant'; // Legacy
    templateCategory?: TemplateCategory; // New template system
    fontFamily: string;
    templateColors?: TemplateColors;
    // Legacy support
    themeColors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        muted: string;
    };
}

interface DesignStepProps {
    data: DesignData;
    onChange: (data: DesignData) => void;
    businessName: string;
}

export default function DesignStep({ data, onChange, businessName }: DesignStepProps) {
    // Initialize template colors from legacy if needed
    const templateColors: TemplateColors = data.templateColors || {
        goldPrimary: '#D4AF37',
        goldDark: '#B8941F',
        charcoalPrimary: '#2C2C2C',
        charcoalDark: '#1a1a1a',
        bgLight: '#F8F8F8',
        bgCard: '#ffffff',
        textPrimary: '#2C2C2C',
        textSecondary: '#6b7280',
        textMuted: '#9ca3af',
        borderLight: '#e5e7eb',
        borderGold: '#D4AF37',
    };

    const handleColorPresetChange = (presetName: string) => {
        const preset = COLOR_PALETTES[presetName];
        if (preset) {
            // Map preset to template colors
            onChange({
                ...data,
                templateColors: {
                    goldPrimary: preset.primary,
                    goldDark: preset.secondary,
                    charcoalPrimary: preset.text,
                    charcoalDark: '#1a1a1a',
                    bgLight: preset.background,
                    bgCard: '#ffffff',
                    textPrimary: preset.text,
                    textSecondary: preset.muted,
                    textMuted: '#9ca3af',
                    borderLight: preset.border || '#e5e7eb',
                    borderGold: preset.accent,
                },
                themeColors: {
                    primary: preset.primary,
                    secondary: preset.secondary,
                    accent: preset.accent,
                    background: preset.background,
                    text: preset.text,
                    muted: preset.muted,
                },
            });
        }
    };

    const handleTemplateColorChange = (colorKey: keyof TemplateColors, value: string) => {
        const newColors = { ...templateColors, [colorKey]: value };
        onChange({
            ...data,
            templateColors: newColors,
            // Also update legacy themeColors for compatibility
            themeColors: {
                primary: newColors.goldPrimary,
                secondary: newColors.goldDark,
                accent: newColors.borderGold,
                background: newColors.bgLight,
                text: newColors.textPrimary,
                muted: newColors.textSecondary,
            },
        });
    };

    const colorGroups = [
        {
            name: 'Brand Colors',
            colors: [
                { key: 'goldPrimary' as keyof TemplateColors, label: 'Gold Primary', value: templateColors.goldPrimary },
                { key: 'goldDark' as keyof TemplateColors, label: 'Gold Dark', value: templateColors.goldDark },
                { key: 'charcoalPrimary' as keyof TemplateColors, label: 'Charcoal Primary', value: templateColors.charcoalPrimary },
                { key: 'charcoalDark' as keyof TemplateColors, label: 'Charcoal Dark', value: templateColors.charcoalDark },
            ]
        },
        {
            name: 'Backgrounds',
            colors: [
                { key: 'bgLight' as keyof TemplateColors, label: 'Light Background', value: templateColors.bgLight },
                { key: 'bgCard' as keyof TemplateColors, label: 'Card Background', value: templateColors.bgCard },
            ]
        },
        {
            name: 'Text Colors',
            colors: [
                { key: 'textPrimary' as keyof TemplateColors, label: 'Primary Text', value: templateColors.textPrimary },
                { key: 'textSecondary' as keyof TemplateColors, label: 'Secondary Text', value: templateColors.textSecondary },
                { key: 'textMuted' as keyof TemplateColors, label: 'Muted Text', value: templateColors.textMuted },
            ]
        },
        {
            name: 'Borders & Accents',
            colors: [
                { key: 'borderLight' as keyof TemplateColors, label: 'Border Light', value: templateColors.borderLight },
                { key: 'borderGold' as keyof TemplateColors, label: 'Border Gold', value: templateColors.borderGold },
            ]
        },
    ];

    return (
        <div className="space-y-8">
            {/* Template Info (Fixed) */}
            <div className="bg-slate-950 p-6 rounded-xl border border-amber-500/20 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <h3 className="text-xl font-bold text-amber-400 mb-2 relative z-10">Elegant Gold Design</h3>
                <p className="text-slate-400 relative z-10">
                    Your storefront uses our premium Elegant Gold template, featuring sophisticated typography and luxurious gold accents.
                </p>
            </div>

            {/* Color Theme */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Color Theme
                </h3>

                {/* Color Presets */}
                <div>
                    <Label className="mb-3 block font-medium">Quick Palettes</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(COLOR_PALETTES).map(([name, colors]) => (
                            <button
                                key={name}
                                onClick={() => handleColorPresetChange(name)}
                                className="group relative p-3 rounded-lg border-2 transition-all hover:scale-105 border-gray-200 hover:border-blue-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{
                                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                                }}></div>

                                <div className="relative z-10 flex flex-col gap-2">
                                    <div className="flex gap-1 h-8 rounded-md overflow-hidden shadow-sm">
                                        <div className="flex-1" style={{ backgroundColor: colors.primary }}></div>
                                        <div className="flex-1" style={{ backgroundColor: colors.secondary }}></div>
                                        <div className="flex-1" style={{ backgroundColor: colors.accent }}></div>
                                        <div className="flex-1" style={{ backgroundColor: colors.background }}></div>
                                    </div>
                                    <span className="text-sm font-medium capitalize text-gray-700">
                                        {name.replace('-', ' ')}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grouped Color Controls */}
                <div className="space-y-6 pt-4 border-t">
                    <Label className="block font-medium">Customize Template Colors</Label>
                    {colorGroups.map((group) => (
                        <div key={group.name} className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{group.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.colors.map(({ key, label, value }) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={`color-${key}`} className="text-sm">{label}</Label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                id={`color-${key}`}
                                                value={value}
                                                onChange={(e) => handleTemplateColorChange(key, e.target.value)}
                                                className="w-12 h-10 rounded border cursor-pointer p-1"
                                            />
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleTemplateColorChange(key, e.target.value)}
                                                className="flex-1 px-3 py-2 border rounded text-sm font-mono uppercase"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Color Preview */}
                <Card className="p-6 transition-colors duration-300" style={{ backgroundColor: templateColors.bgLight }}>
                    <h4 className="font-semibold mb-4" style={{ color: templateColors.textPrimary }}>Theme Preview</h4>
                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-3">
                            <button
                                className="px-6 py-2 rounded-full font-medium text-white transition-all shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${templateColors.goldPrimary}, ${templateColors.goldDark})` }}
                            >
                                Gold Gradient
                            </button>
                            <button
                                className="px-6 py-2 rounded-full font-medium text-white transition-all shadow-lg"
                                style={{ backgroundColor: templateColors.charcoalPrimary }}
                            >
                                Charcoal
                            </button>
                            <button
                                className="px-6 py-2 rounded-full font-medium transition-all shadow-lg"
                                style={{
                                    backgroundColor: 'transparent',
                                    color: templateColors.goldPrimary,
                                    border: `2px solid ${templateColors.borderGold}`
                                }}
                            >
                                Outlined
                            </button>
                        </div>

                        <div className="p-6 rounded-xl border-2 border-dashed" style={{
                            borderColor: templateColors.borderLight,
                            backgroundColor: templateColors.bgCard
                        }}>
                            <h5 className="text-2xl font-bold mb-2" style={{ color: templateColors.goldPrimary }}>
                                {businessName || 'Your Business Name'}
                            </h5>
                            <p className="text-base leading-relaxed mb-2" style={{ color: templateColors.textPrimary }}>
                                Primary text appears in this color for headings and important content.
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: templateColors.textSecondary }}>
                                Secondary text is used for descriptions and supporting information.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
