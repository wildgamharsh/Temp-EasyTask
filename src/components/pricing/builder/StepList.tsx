import React, { useState } from 'react';
import { Service, ConfigStep, Option, StepSelectionType, StepDisplayStyle } from '@/types/pricing';
import { Trash2, Plus, Settings, Check, Palette, Image as ImageIcon, Tag, DollarSign, FileText, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Input } from '../ui/Input';
import { CustomSelect } from '../ui/CustomSelect';

interface Props {
    service: Service;
    onChange: (service: Service) => void;
}

type ConfigMode = 'step' | 'option';

export const StepList: React.FC<Props> = ({ service, onChange }) => {
    const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
    // Initial state: always try to select first step if available
    const [configMode, setConfigMode] = useState<ConfigMode | null>(service.steps.length > 0 ? 'step' : null);
    const [configuringStepId, setConfiguringStepId] = useState<string | null>(Array.isArray(service.steps) && service.steps.length > 0 ? [...service.steps].sort((a, b) => a.order - b.order)[0].id : null);
    const [configuringOptionId, setConfiguringOptionId] = useState<string | null>(null);

    // Drag and Drop State
    const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'step' | 'option', sourceStepId?: string } | null>(null);

    // Auto-select first step on mount or when steps exist but nothing selected
    React.useEffect(() => {
        if (!configuringStepId && service.steps.length > 0) {
            const firstStep = [...service.steps].sort((a, b) => a.order - b.order)[0];
            setConfigMode('step');
            setConfiguringStepId(firstStep.id);
            // Optionally expand the first step too
            setExpandedSteps(prev => new Set([...prev, firstStep.id]));
        }
    }, [service.steps, configuringStepId]); // Dependency on length so if steps added/removed we re-eval if needed

    const generateId = (prefix: string) => `${prefix} -${Date.now()} -${Math.floor(Math.random() * 1000)} `;

    const configuringStep = service.steps.find(s => s.id === configuringStepId);
    const configuringOption = configuringStep?.options.find(o => o.id === configuringOptionId);

    const toggleStepExpand = (stepId: string) => {
        const newExpanded = new Set(expandedSteps);
        if (newExpanded.has(stepId)) {
            newExpanded.delete(stepId);
        } else {
            newExpanded.add(stepId);
        }
        setExpandedSteps(newExpanded);
    };

    const openStepConfig = (stepId: string) => {
        setConfigMode('step');
        setConfiguringStepId(stepId);
        setConfiguringOptionId(null);
    };

    const openOptionConfig = (stepId: string, optionId: string) => {
        setConfigMode('option');
        setConfiguringStepId(stepId);
        setConfiguringOptionId(optionId);
    };

    const switchToStep = (stepId: string) => {
        setConfigMode('step');
        setConfiguringStepId(stepId);
        setConfiguringOptionId(null);
    };

    const addStep = () => {
        const newStep: ConfigStep = {
            id: generateId('step'),
            serviceId: service.id,
            name: 'New Step',
            order: service.steps.length + 1,
            required: true,
            selectionType: 'single',
            displayStyle: 'card-standard',
            defaultOptionIds: [],
            options: []
        };
        onChange({ ...service, steps: [...service.steps, newStep] });
        setExpandedSteps(new Set([...expandedSteps, newStep.id]));
        openStepConfig(newStep.id);
    };

    const removeStep = (stepId: string) => {
        if (window.confirm("Are you sure? This will delete the step and all its options.")) {
            const updatedSteps = service.steps.filter(s => s.id !== stepId);
            const updatedRules = (service.rules || []).filter(r =>
                r.condition.dependsOnStepId !== stepId &&
                r.effects.every(e => e.targetStepId !== stepId) // Assuming structure, checking all effects for reference
            );

            onChange({
                ...service,
                steps: updatedSteps,
                rules: updatedRules
            });

            if (configuringStepId === stepId) {
                // If we deleted the active step, try to select another one
                const remaining = updatedSteps.sort((a, b) => a.order - b.order);
                if (remaining.length > 0) {
                    switchToStep(remaining[0].id);
                } else {
                    setConfigMode(null);
                    setConfiguringStepId(null);
                }
            }
        }
    };

    const updateStep = (stepId: string, updates: Partial<ConfigStep>) => {
        onChange({
            ...service,
            steps: service.steps.map(s => s.id === stepId ? { ...s, ...updates } : s)
        });
    };

    const addOption = (stepId: string) => {
        const newOption: Option = {
            id: generateId('opt'),
            stepId,
            label: 'New Option',
            baseDelta: 0,
            description: ''
        };
        const step = service.steps.find(s => s.id === stepId);
        if (!step) return;

        updateStep(stepId, { options: [...step.options, newOption] });
        openOptionConfig(stepId, newOption.id);
    };

    const removeOption = (stepId: string, optionId: string) => {
        const step = service.steps.find(s => s.id === stepId);
        if (!step) return;

        const newDefaults = (step.defaultOptionIds || []).filter(id => id !== optionId);
        updateStep(stepId, {
            options: step.options.filter(o => o.id !== optionId),
            defaultOptionIds: newDefaults
        });

        if (configuringOptionId === optionId) {
            // If deleting active option, switch back to step config
            openStepConfig(stepId);
        }
    };

    const updateOption = (stepId: string, optionId: string, updates: Partial<Option>) => {
        const step = service.steps.find(s => s.id === stepId);
        if (!step) return;

        updateStep(stepId, {
            options: step.options.map(o => o.id === optionId ? { ...o, ...updates } : o)
        });
    };

    const toggleDefault = (stepId: string, optionId: string) => {
        const step = service.steps.find(s => s.id === stepId);
        if (!step) return;

        const currentDefaults = step.defaultOptionIds || [];
        let newDefaults: string[];

        if (step.selectionType === 'single' || step.selectionType === 'quantity') {
            newDefaults = currentDefaults.includes(optionId) ? [] : [optionId];
        } else {
            newDefaults = currentDefaults.includes(optionId)
                ? currentDefaults.filter(id => id !== optionId)
                : [...currentDefaults, optionId];
        }
        updateStep(stepId, { defaultOptionIds: newDefaults });
    };

    // --- Drag and Drop Handlers ---

    const handleDragStart = (e: React.DragEvent, id: string, type: 'step' | 'option', sourceStepId?: string) => {
        e.stopPropagation();
        setDraggedItem({ id, type, sourceStepId });
        e.dataTransfer.effectAllowed = 'move';
        // Set a transparent drag image or customized view if needed
    };

    const handleDragOver = (e: React.DragEvent, targetId: string, targetType: 'step' | 'option', targetStepId?: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedItem) return;
        if (draggedItem.type !== targetType) return;
        if (draggedItem.id === targetId) return;

        // For options, ensure we are in the same step
        if (targetType === 'option' && draggedItem.sourceStepId !== targetStepId) return;

        if (targetType === 'step') {
            const items = [...service.steps].sort((a, b) => a.order - b.order);
            const dragIndex = items.findIndex(i => i.id === draggedItem.id);
            const hoverIndex = items.findIndex(i => i.id === targetId);

            if (dragIndex === -1 || hoverIndex === -1) return;

            // Swap logic
            const newItems = [...items];
            const [dragged] = newItems.splice(dragIndex, 1);
            newItems.splice(hoverIndex, 0, dragged);

            // Update orders
            const updatedSteps = newItems.map((step, index) => ({
                ...step,
                order: index + 1
            }));

            onChange({ ...service, steps: updatedSteps });
        }

        else if (targetType === 'option' && targetStepId) {
            const step = service.steps.find(s => s.id === targetStepId);
            if (!step) return;

            const items = [...step.options];
            const dragIndex = items.findIndex(i => i.id === draggedItem.id);
            const hoverIndex = items.findIndex(i => i.id === targetId);

            if (dragIndex === -1 || hoverIndex === -1) return;

            const newItems = [...items];
            const [dragged] = newItems.splice(dragIndex, 1);
            newItems.splice(hoverIndex, 0, dragged);

            updateStep(targetStepId, { options: newItems });
        }
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const needsImage = (style: StepDisplayStyle) => ['card-image', 'card-icon'].includes(style);
    const needsColor = (style: StepDisplayStyle) => ['card-color', 'card-color-pill'].includes(style);

    const layoutOptions = [
        { label: "Standard Cards", value: "card-standard" },
        { label: "Compact Grid", value: "card-compact" },
        { label: "Large Gallery (Images)", value: "card-image" },
        { label: "Icon List (Small Images)", value: "card-icon" },
        { label: "Color Swatches", value: "card-color" },
        { label: "Color Pills", value: "card-color-pill" },
        { label: "Simple List", value: "list-toggle" }
    ];

    return (
        <div className="relative flex gap-6">
            {/* Left Side - Compact Step & Option Cards */}
            <div className="flex-1 space-y-4">
                {[...service.steps].sort((a, b) => a.order - b.order).map((step, index) => {
                    const isExpanded = expandedSteps.has(step.id);
                    const isDragging = draggedItem?.id === step.id;

                    return (
                        <div
                            key={step.id}
                            className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm transition-all
                                ${isDragging ? 'opacity-40 border-dashed border-blue-400' : 'border-gray-200 hover:shadow-md'}
                            `}
                            draggable
                            onDragStart={(e) => handleDragStart(e, step.id, 'step')}
                            onDragOver={(e) => handleDragOver(e, step.id, 'step')}
                            onDragEnd={handleDragEnd}
                        >
                            {/* Step Header - Compact */}
                            <div
                                onClick={() => openStepConfig(step.id)}
                                className={`p-4 border-b-2 cursor-pointer transition-all duration-200 group flex items-center gap-3
                                    ${configuringStepId === step.id && configMode === 'step'
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                {/* Drag Handle */}
                                <div className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500">
                                    <GripVertical size={20} />
                                </div>

                                <div className="flex items-center gap-3 flex-1">
                                    {/* Expand/Collapse */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStepExpand(step.id);
                                        }}
                                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-all text-gray-500"
                                    >
                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>

                                    {/* Step Number */}
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-lg font-bold text-sm shrink-0">
                                        {index + 1}
                                    </div>

                                    {/* Step Name */}
                                    <div className="flex-1 font-semibold text-gray-900">
                                        {step.name}
                                    </div>

                                    {/* Action Buttons */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeStep(step.id);
                                        }}
                                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group-hover:bg-white"
                                        title="Delete Step"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Step Info */}
                                <div className="ml-2 flex items-center gap-2 text-xs text-gray-500">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded font-medium">
                                        {step.options.length} options
                                    </span>
                                    <span className="px-2 py-0.5 bg-gray-100 rounded font-medium capitalize">
                                        {step.selectionType}
                                    </span>
                                </div>
                            </div>

                            {/* Options List - Compact */}
                            {isExpanded && (
                                <div className="p-4 bg-gray-50 space-y-2">
                                    {step.options.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400 text-sm">
                                            No options yet
                                        </div>
                                    ) : (
                                        step.options.map((option) => {
                                            const isDefault = (step.defaultOptionIds || []).includes(option.id);
                                            const isOptionDragging = draggedItem?.id === option.id;

                                            return (
                                                <div
                                                    key={option.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, option.id, 'option', step.id)}
                                                    onDragOver={(e) => handleDragOver(e, option.id, 'option', step.id)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={() => openOptionConfig(step.id, option.id)}
                                                    className={`flex items-center gap-3 p-3 bg-white rounded-lg border-2 transition-all cursor-pointer group/opt
                                                        ${isOptionDragging ? 'opacity-40 border-dashed border-blue-400' : ''}
                                                        ${configuringOptionId === option.id && configMode === 'option'
                                                            ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10'
                                                            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                        }`}
                                                >
                                                    {/* Drag Handle */}
                                                    <div className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500">
                                                        <GripVertical size={16} />
                                                    </div>

                                                    {/* Option Name */}
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                            <span className="font-mono">${option.baseDelta}</span>
                                                            {isDefault && (
                                                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                                                                    DEFAULT
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeOption(step.id, option.id);
                                                        }}
                                                        className="p-2 rounded-lg opacity-0 group-hover/opt:opacity-100 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
                                                        title="Delete Option"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}

                                    {/* Add Option Button */}
                                    <button
                                        onClick={() => addOption(step.id)}
                                        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 text-sm font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Add Option
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add Step Button */}
                <button
                    onClick={addStep}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Add New Step
                </button>
            </div>

            {/* Right Side - Configuration Panel (Permanent) */}
            <div className="w-[450px] bg-white rounded-xl border-2 border-gray-200 shadow-xl overflow-hidden shrink-0 flex flex-col">
                {!configMode ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                        <Settings size={48} className="mb-4 opacity-20" />
                        <p className="font-semibold">Select a step or option to configure</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-blue-500 text-white p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-lg">
                                    {configMode === 'step' ? 'Configure Step' : 'Configure Option'}
                                </h3>
                                {/* Permanent Panel - No Close Button */}
                            </div>
                            <p className="text-blue-100 text-sm">
                                {configMode === 'step' ? configuringStep?.name : configuringOption?.label}
                            </p>
                        </div>

                        {/* Panel Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)] space-y-6">
                            {configMode === 'step' && configuringStep && (
                                <>
                                    {/* Step Name */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-gray-700">
                                            Step Name
                                        </label>
                                        <Input
                                            value={configuringStep.name}
                                            onChange={(e) => updateStep(configuringStep.id, { name: e.target.value })}
                                            placeholder="Step name"
                                        />
                                    </div>

                                    {/* Step Type */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wide mb-3 text-gray-700">
                                            Step Type
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                {
                                                    value: 'single',
                                                    label: 'Config',
                                                    color: 'blue',
                                                    desc: 'Standard choice. User picks options from a list (e.g. Bronze/Silver/Gold).'
                                                },
                                                {
                                                    value: 'fixed',
                                                    label: 'Fixed',
                                                    color: 'gray',
                                                    desc: 'Mandatory fee or service automatically applied (e.g. Setup Fee).'
                                                },
                                                {
                                                    value: 'quantity',
                                                    label: 'Qty',
                                                    color: 'orange',
                                                    desc: 'User enters a numeric amount (e.g. Hours, Seats, Units).'
                                                }
                                            ].map(type => (
                                                <div key={type.value} className="relative group">
                                                    <button
                                                        onClick={() => updateStep(configuringStep.id, {
                                                            selectionType: type.value as StepSelectionType,
                                                            defaultOptionIds: []
                                                        })}
                                                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all ${(configuringStep.selectionType === type.value) ||
                                                            (type.value === 'single' && configuringStep.selectionType === 'multi') // Group single/multi under 'Config'
                                                            ? 'bg-blue-500 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {type.label}
                                                    </button>

                                                    {/* Tooltip Popover */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center leading-relaxed">
                                                        {type.desc}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Selection Mode */}
                                    {(configuringStep.selectionType === 'single' || configuringStep.selectionType === 'multi') && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wide mb-3 text-gray-700">
                                                Selection Mode
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => updateStep(configuringStep.id, { selectionType: 'single', defaultOptionIds: [] })}
                                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${configuringStep.selectionType === 'single'
                                                        ? 'bg-blue-500 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    ● Single
                                                </button>
                                                <button
                                                    onClick={() => updateStep(configuringStep.id, { selectionType: 'multi', defaultOptionIds: [] })}
                                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${configuringStep.selectionType === 'multi'
                                                        ? 'bg-blue-500 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    ☑ Multi
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Visual Design */}
                                    {(configuringStep.selectionType === 'single' || configuringStep.selectionType === 'multi' || configuringStep.selectionType === 'quantity') && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wide mb-3 text-gray-700">
                                                Visual Design
                                            </label>
                                            <CustomSelect
                                                value={configuringStep.displayStyle}
                                                options={layoutOptions}
                                                onChange={(val) => updateStep(configuringStep.id, { displayStyle: val as StepDisplayStyle })}
                                            />
                                        </div>
                                    )}

                                    {/* Required Toggle */}
                                    {configuringStep.selectionType !== 'fixed' && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wide mb-3 text-gray-700">
                                                Constraints
                                            </label>
                                            <button
                                                onClick={() => updateStep(configuringStep.id, { required: !configuringStep.required })}
                                                className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${configuringStep.required
                                                    ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                                                    : 'bg-gray-100 border-2 border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Check size={16} className={configuringStep.required ? 'text-blue-600' : 'text-gray-400'} />
                                                Required Step
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {configMode === 'option' && configuringOption && configuringStep && (
                                <>
                                    {/* Option Name */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-2 text-gray-700">
                                            <Tag size={12} /> Option Name
                                        </label>
                                        <Input
                                            value={configuringOption.label}
                                            onChange={(e) => updateOption(configuringStep.id, configuringOption.id, { label: e.target.value })}
                                            placeholder="Option name"
                                        />
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-2 text-gray-700">
                                            <DollarSign size={12} /> Price Adjustment
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                                            <Input
                                                type="number"
                                                value={configuringOption.baseDelta}
                                                onChange={(e) => updateOption(configuringStep.id, configuringOption.id, { baseDelta: parseFloat(e.target.value) || 0 })}
                                                className="pl-8 font-mono"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-2 text-gray-700">
                                            <FileText size={12} /> Description
                                        </label>
                                        <Input
                                            value={configuringOption.description || ''}
                                            onChange={(e) => updateOption(configuringStep.id, configuringOption.id, { description: e.target.value })}
                                            placeholder="Optional description"
                                        />
                                    </div>

                                    {/* Color */}
                                    {needsColor(configuringStep.displayStyle) && configuringStep.selectionType !== 'fixed' && (
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-2 text-gray-700">
                                                <Palette size={12} /> Color
                                            </label>
                                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border-2 border-gray-200">
                                                <input
                                                    type="color"
                                                    value={configuringOption.colorHex || '#0066FF'}
                                                    onChange={(e) => updateOption(configuringStep.id, configuringOption.id, { colorHex: e.target.value })}
                                                    className="h-10 w-10 rounded-lg cursor-pointer border-2 border-gray-300"
                                                />
                                                <span className="text-xs font-mono text-gray-600">{configuringOption.colorHex || '#0066FF'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Image */}
                                    {needsImage(configuringStep.displayStyle) && configuringStep.selectionType !== 'fixed' && (
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide mb-2 text-gray-700">
                                                <ImageIcon size={12} /> Image URL
                                            </label>
                                            <Input
                                                value={configuringOption.image || ''}
                                                onChange={(e) => updateOption(configuringStep.id, configuringOption.id, { image: e.target.value })}
                                                placeholder="https://..."
                                            />
                                            {configuringOption.image && (
                                                <div className="mt-3 relative aspect-video rounded-lg overflow-hidden border-2 border-gray-100 bg-gray-50 group">
                                                    <img
                                                        src={configuringOption.image}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Set as Default */}
                                    {configuringStep.selectionType !== 'fixed' && configuringStep.selectionType !== 'quantity' && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wide mb-3 text-gray-700">
                                                Default Selection
                                            </label>
                                            <button
                                                onClick={() => toggleDefault(configuringStep.id, configuringOption.id)}
                                                className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${(configuringStep.defaultOptionIds || []).includes(configuringOption.id)
                                                    ? 'bg-blue-500 text-white shadow-md'
                                                    : 'bg-gray-100 border-2 border-gray-200 text-gray-600 hover:border-blue-300'
                                                    }`}
                                            >
                                                <Check size={16} />
                                                {(configuringStep.defaultOptionIds || []).includes(configuringOption.id) ? 'Default Option' : 'Set as Default'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div >
    );
};
