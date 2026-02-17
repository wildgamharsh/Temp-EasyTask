import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { TemplateCategory } from '@/lib/template-configs';
import { TEMPLATE_CONFIGS, getAllTemplateCategories, COLOR_PALETTES } from '@/lib/template-configs';

interface TemplateSelectorProps {
    selectedTemplate?: TemplateCategory;
    onSelect: (template: TemplateCategory) => void;
    className?: string;
}

export default function TemplateSelector({
    selectedTemplate,
    onSelect,
    className = '',
}: TemplateSelectorProps) {
    const [hoveredTemplate, setHoveredTemplate] = useState<TemplateCategory | null>(null);
    const templates = getAllTemplateCategories();

    return (
        <div className={`space-y-6 ${className}`}>
            <div>
                <h3 className="text-2xl font-bold mb-2">Choose Your Template</h3>
                <p className="text-gray-600">
                    Select a design that best represents your brand. Each template has been carefully crafted with unique styling.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((templateId) => {
                    const config = TEMPLATE_CONFIGS[templateId];
                    const isSelected = selectedTemplate === templateId;
                    const isHovered = hoveredTemplate === templateId;
                    const defaultColors = COLOR_PALETTES[config.defaultPalette];

                    return (
                        <button
                            key={templateId}
                            onClick={() => onSelect(templateId)}
                            onMouseEnter={() => setHoveredTemplate(templateId)}
                            onMouseLeave={() => setHoveredTemplate(null)}
                            className={`
                                relative p-6 rounded-xl border-2 text-left transition-all duration-300
                                ${isSelected
                                    ? 'border-pink-500 bg-pink-50 shadow-lg'
                                    : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                                }
                            `}
                        >
                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                            )}

                            {/* Template Preview Colors */}
                            <div className="flex gap-2 mb-4">
                                <div
                                    className="w-12 h-12 rounded-lg shadow-sm"
                                    style={{ backgroundColor: defaultColors.primary }}
                                    title="Primary Color"
                                />
                                <div
                                    className="w-12 h-12 rounded-lg shadow-sm"
                                    style={{ backgroundColor: defaultColors.accent }}
                                    title="Accent Color"
                                />
                                <div
                                    className="w-12 h-12 rounded-lg shadow-sm border border-gray-200"
                                    style={{ backgroundColor: defaultColors.background }}
                                    title="Background Color"
                                />
                            </div>

                            {/* Template Info */}
                            <h4 className="text-xl font-bold mb-2">{config.name}</h4>
                            <p className="text-sm text-gray-600 mb-4">{config.description}</p>

                            {/* Hover Effect */}
                            {isHovered && !isSelected && (
                                <div className="absolute inset-0 bg-pink-50 bg-opacity-30 rounded-xl pointer-events-none" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Template Details */}
            {selectedTemplate && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                    <h4 className="font-bold mb-2">Selected: {TEMPLATE_CONFIGS[selectedTemplate].name}</h4>
                    <p className="text-sm text-gray-600">
                        {TEMPLATE_CONFIGS[selectedTemplate].description}
                    </p>
                </div>
            )}
        </div>
    );
}
