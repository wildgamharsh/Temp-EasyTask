import React, { useState, useEffect } from 'react';
import { Service, ConfigStep, Option, StepSelectionType, StepDisplayStyle } from '@/types/pricing';
import { 
    Layers, Zap, Code, Network, Settings, Palette, Image as ImageIcon, 
    Plus, Trash2, GripVertical, Check, ChevronDown, ChevronRight,
    MoreVertical, Copy, Edit3, Eye, X
} from 'lucide-react';

interface Props {
    service: Service;
    onChange: (service: Service) => void;
    fullPage?: boolean;
}

const DISPLAY_STYLES = [
    { id: 'card-standard', label: 'Card Standard', icon: 'view_module', desc: 'Large cards with details' },
    { id: 'card-compact', label: 'Card Compact', icon: 'grid_view', desc: 'Compact card layout' },
    { id: 'card-icon', label: 'Icon Card', icon: 'style', desc: 'Cards with icons' },
    { id: 'card-image', label: 'Image Card', icon: 'image', desc: 'Large cards with images' },
    { id: 'card-color', label: 'Color Swatch', icon: 'palette', desc: 'Circular color selectors' },
    { id: 'card-color-pill', label: 'Color Pill', icon: 'circle', desc: 'Pill-shaped color options' },
    { id: 'list-toggle', label: 'List Toggle', icon: 'list', desc: 'Simple list with toggles' },
];

const SELECTION_TYPES = [
    { id: 'single', label: 'Single Select', desc: 'Choose one option' },
    { id: 'multi', label: 'Multi Select', desc: 'Select multiple options' },
    { id: 'quantity', label: 'Quantity Based', desc: 'Price calculated by quantity' },
    { id: 'fixed', label: 'Fixed', desc: 'All options mandatory' },
];

const STEP_ICONS: Record<string, string> = {
    'card-standard': 'view_module',
    'card-compact': 'grid_view',
    'card-icon': 'style',
    'card-image': 'image',
    'card-color': 'palette',
    'card-color-pill': 'circle',
    'list-toggle': 'list',
};

export const ServiceBuilder: React.FC<Props> = ({ service, onChange, fullPage = false }) => {
    const [activeTab, setActiveTab] = useState<'builder' | 'logic' | 'graph' | 'json'>('builder');
    const [configuringStepId, setConfiguringStepId] = useState<string | null>(null);
    const [configuringOptionId, setConfiguringOptionId] = useState<string | null>(null);
    const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
    const [deleteConfirmStepId, setDeleteConfirmStepId] = useState<string | null>(null);

    useEffect(() => {
        if (!configuringStepId && service.steps.length > 0) {
            const firstStep = [...service.steps].sort((a, b) => a.order - b.order)[0];
            setConfiguringStepId(firstStep.id);
            setExpandedSteps(new Set([firstStep.id]));
        }
    }, [service.steps, configuringStepId]);

    const generatingId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const configuringStep = service.steps.find(s => s.id === configuringStepId);
    const configuringOption = configuringStep?.options.find(o => o.id === configuringOptionId);

    const sortedSteps = [...service.steps].sort((a, b) => a.order - b.order);

    const toggleStepExpand = (stepId: string) => {
        const newExpanded = new Set(expandedSteps);
        if (newExpanded.has(stepId)) {
            newExpanded.delete(stepId);
        } else {
            newExpanded.add(stepId);
        }
        setExpandedSteps(newExpanded);
    };

    const addStep = () => {
        const newStep: ConfigStep = {
            id: generatingId('step'),
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
        setExpandedSteps(prev => new Set([...prev, newStep.id]));
        setConfiguringStepId(newStep.id);
    };

    const confirmDeleteStep = (stepId: string) => {
        setDeleteConfirmStepId(stepId);
    };

    const executeDeleteStep = () => {
        if (!deleteConfirmStepId) return;
        
        const updatedSteps = service.steps.filter(s => s.id !== deleteConfirmStepId);
        onChange({ ...service, steps: updatedSteps });
        
        if (configuringStepId === deleteConfirmStepId) {
            setConfiguringStepId(updatedSteps.length > 0 ? updatedSteps[0].id : null);
        }
        
        setDeleteConfirmStepId(null);
    };

    const cancelDeleteStep = () => {
        setDeleteConfirmStepId(null);
    };

    const updateStep = (stepId: string, updates: Partial<ConfigStep>) => {
        const updatedSteps = service.steps.map(s => 
            s.id === stepId ? { ...s, ...updates } : s
        );
        onChange({ ...service, steps: updatedSteps });
    };

    const addOption = (stepId: string) => {
        const step = service.steps.find(s => s.id === stepId);
        if (!step) return;
        
        const newOption: Option = {
            id: generatingId('opt'),
            stepId: stepId,
            label: 'New Option',
            baseDelta: 0,
            description: '',
        };
        
        updateStep(stepId, { options: [...step.options, newOption] });
    };

    const removeOption = (stepId: string, optionId: string) => {
        const step = service.steps.find(s => s.id === stepId);
        if (!step) return;
        
        updateStep(stepId, { 
            options: step.options.filter(o => o.id !== optionId) 
        });
        
        if (configuringOptionId === optionId) {
            setConfiguringOptionId(null);
        }
    };

    const updateOption = (stepId: string, optionId: string, updates: Partial<Option>) => {
        const step = service.steps.find(s => s.id === stepId);
        if (!step) return;
        
        const updatedOptions = step.options.map(o => 
            o.id === optionId ? { ...o, ...updates } : o
        );
        updateStep(stepId, { options: updatedOptions });
    };

    const selectStep = (stepId: string) => {
        setConfiguringStepId(stepId);
        setConfiguringOptionId(null);
        if (!expandedSteps.has(stepId)) {
            setExpandedSteps(prev => new Set([...prev, stepId]));
        }
    };

    const selectOption = (optionId: string) => {
        setConfiguringOptionId(optionId);
    };

    const showImageConfig = configuringStep && ['card-image', 'card-icon'].includes(configuringStep.displayStyle);
    const showColorConfig = configuringStep && ['card-color', 'card-color-pill'].includes(configuringStep.displayStyle);

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Custom Delete Confirmation Modal */}
            {deleteConfirmStepId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Delete Step?</h3>
                                <p className="text-sm text-slate-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">
                            Are you sure you want to delete this step and all its options? This will also remove any associated rules.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDeleteStep}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDeleteStep}
                                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center border-b border-slate-200 bg-white px-4 shrink-0">
                {[
                    { id: 'builder', label: 'Builder', icon: <Layers size={16} /> },
                    { id: 'logic', label: 'Logic Rules', icon: <Zap size={16} /> },
                    { id: 'graph', label: 'Visual Graph', icon: <Network size={16} /> },
                    { id: 'json', label: 'JSON', icon: <Code size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                            activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'builder' ? (
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar: Steps List with Accordion */}
                    <aside className="w-72 flex flex-col border-r border-slate-200 bg-white shrink-0">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-slate-700 text-sm">Pricing Steps</h3>
                            <button 
                                onClick={addStep}
                                className="p-1 hover:bg-slate-100 rounded text-blue-600 transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {sortedSteps.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No steps yet. Click + to add one.
                                </div>
                            ) : (
                                sortedSteps.map((step, index) => {
                                    const isActive = step.id === configuringStepId;
                                    const isExpanded = expandedSteps.has(step.id);
                                    
                                    return (
                                        <div key={step.id} className="space-y-1">
                                            {/* Step Header */}
                                            <div
                                                onClick={() => selectStep(step.id)}
                                                className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                                    isActive
                                                        ? 'bg-blue-50 border border-blue-200 shadow-sm'
                                                        : 'bg-white border border-transparent hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStepExpand(step.id);
                                                    }}
                                                    className="p-0.5 hover:bg-slate-100 rounded text-slate-400 transition-colors"
                                                >
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>
                                                <div className={`flex items-center justify-center rounded-md bg-slate-100 text-slate-500 shrink-0 size-7 ${
                                                    isActive ? 'bg-white text-blue-600 shadow-sm' : ''
                                                }`}>
                                                    <span className="text-xs font-bold">{index + 1}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className={`text-sm font-medium truncate block ${
                                                        isActive ? 'text-blue-900' : 'text-slate-700'
                                                    }`}>
                                                        {step.name}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {step.selectionType} · {step.options.length} options
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Accordion: Options Preview */}
                                            {isExpanded && step.options.length > 0 && (
                                                <div className="ml-6 pl-4 border-l-2 border-slate-200 space-y-1 py-1">
                                                    {step.options.map(option => (
                                                        <div
                                                            key={option.id}
                                                            onClick={() => {
                                                                selectStep(step.id);
                                                                selectOption(option.id);
                                                            }}
                                                            className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer transition-all ${
                                                                configuringStepId === step.id && configuringOptionId === option.id
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'text-slate-500 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                            <span className="truncate flex-1">{option.label}</span>
                                                            <span className="text-slate-400 font-mono">
                                                                {option.baseDelta > 0 ? `+$${option.baseDelta}` : '$0'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-3 border-t border-slate-200 bg-slate-50">
                            <button className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1 w-full py-2">
                                <Settings size={14} />
                                Manage Global Rules
                            </button>
                        </div>
                    </aside>

                    {/* Center Pane: Configuration Canvas */}
                    <section className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-hidden">
                        {configuringStep ? (
                            <>
                                {/* Breadcrumb & Title */}
                                <div className="px-6 pt-4 pb-2 bg-white border-b border-slate-200 shrink-0">
                                    <div className="flex justify-between items-end pb-3">
                                        <div>
                                            <h1 className="text-xl font-bold text-slate-900">Step Configuration</h1>
                                            <p className="text-slate-500 text-sm mt-0.5">Configure your step settings and options</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => confirmDeleteStep(configuringStep.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all text-sm font-medium"
                                            >
                                                <Trash2 size={14} />
                                                Delete Step
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:border-blue-300 hover:text-blue-600 transition-all text-sm font-medium">
                                                <Eye size={14} />
                                                Preview
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Canvas Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="grid grid-cols-12 gap-6 max-w-5xl mx-auto">
                                        {/* Main Settings */}
                                        <div className="col-span-12 lg:col-span-8 space-y-6">
                                            {/* General Settings */}
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <Settings size={16} className="text-blue-600" />
                                                    General Settings
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Step Name</label>
                                                        <input
                                                            type="text"
                                                            value={configuringStep.name}
                                                            onChange={(e) => updateStep(configuringStep.id, { name: e.target.value })}
                                                            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Selection Type</label>
                                                        <select
                                                            value={configuringStep.selectionType}
                                                            onChange={(e) => updateStep(configuringStep.id, { selectionType: e.target.value as StepSelectionType })}
                                                            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                                                        >
                                                            {SELECTION_TYPES.map(type => (
                                                                <option key={type.id} value={type.id}>{type.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description (Optional)</label>
                                                        <input
                                                            type="text"
                                                            value={configuringStep.description || ''}
                                                            onChange={(e) => updateStep(configuringStep.id, { description: e.target.value })}
                                                            className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                            placeholder="Help customers understand this step"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 flex items-center gap-6 mt-1">
                                                        <label className="flex items-center gap-2 cursor-pointer group">
                                                            <div 
                                                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                                    configuringStep.required 
                                                                        ? 'bg-blue-600 border-blue-600 text-white' 
                                                                        : 'border-slate-300 bg-white'
                                                                }`}
                                                                onClick={() => updateStep(configuringStep.id, { required: !configuringStep.required })}
                                                            >
                                                                {configuringStep.required && <Check size={12} />}
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700">Required Step</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Options Table */}
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                <div className="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                                                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                        <Layers size={16} className="text-blue-600" />
                                                        Options &amp; Pricing
                                                    </h4>
                                                    <button 
                                                        onClick={() => addOption(configuringStep.id)}
                                                        className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        + Add Option
                                                    </button>
                                                </div>
                                                
                                                {configuringStep.options.length === 0 ? (
                                                    <div className="text-center py-12 text-slate-400 text-sm">
                                                        No options yet. Click &quot;Add Option&quot; to create one.
                                                    </div>
                                                ) : (
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                                                            <tr>
                                                                <th className="px-5 py-3 font-semibold">Label</th>
                                                                <th className="px-5 py-3 font-semibold">Description</th>
                                                                <th className="px-5 py-3 font-semibold">Price Delta</th>
                                                                <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {configuringStep.options.map(option => (
                                                                <tr 
                                                                    key={option.id} 
                                                                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                                                                        configuringOptionId === option.id ? 'bg-blue-50/50' : ''
                                                                    }`}
                                                                    onClick={() => selectOption(option.id)}
                                                                >
                                                                    <td className="px-5 py-3">
                                                                        <input
                                                                            type="text"
                                                                            value={option.label}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                updateOption(configuringStep.id, option.id, { label: e.target.value });
                                                                            }}
                                                                            className="w-full bg-transparent border-none text-sm font-medium text-slate-900 focus:outline-none focus:ring-0"
                                                                        />
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <input
                                                                            type="text"
                                                                            value={option.description || ''}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                updateOption(configuringStep.id, option.id, { description: e.target.value });
                                                                            }}
                                                                            className="w-full bg-transparent border-none text-sm text-slate-500 focus:outline-none focus:ring-0"
                                                                            placeholder="Optional description"
                                                                        />
                                                                    </td>
                                                                    <td className="px-5 py-3">
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="text-slate-400">$</span>
                                                                            <input
                                                                                type="number"
                                                                                value={option.baseDelta}
                                                                                onChange={(e) => {
                                                                                    e.stopPropagation();
                                                                                    updateOption(configuringStep.id, option.id, { baseDelta: parseFloat(e.target.value) || 0 });
                                                                                }}
                                                                                className="w-20 bg-transparent border-none text-sm font-mono text-slate-900 focus:outline-none focus:ring-0"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-3 text-right">
                                                                        <button 
                                                                            onClick={(e) => { 
                                                                                e.stopPropagation(); 
                                                                                removeOption(configuringStep.id, option.id); 
                                                                            }}
                                                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Column: Visual Style */}
                                        <div className="col-span-12 lg:col-span-4 space-y-6">
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky top-0">
                                                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <Palette size={16} className="text-blue-600" />
                                                    Display Style
                                                </h4>
                                                <div className="space-y-3">
                                                    {DISPLAY_STYLES.map(style => (
                                                        <label key={style.id} className="cursor-pointer block">
                                                            <input
                                                                checked={configuringStep.displayStyle === style.id}
                                                                onChange={() => updateStep(configuringStep.id, { displayStyle: style.id as StepDisplayStyle })}
                                                                name="display_style"
                                                                type="radio"
                                                                className="peer sr-only"
                                                            />
                                                            <div className={`p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${
                                                                configuringStep.displayStyle === style.id
                                                                    ? 'border-blue-500 bg-blue-50'
                                                                    : 'border-slate-200 hover:border-slate-300 peer-checked:border-blue-500 peer-checked:bg-blue-50'
                                                            }`}>
                                                                <div className={`size-8 rounded-md flex items-center justify-center text-slate-500 ${
                                                                    configuringStep.displayStyle === style.id
                                                                        ? 'bg-white text-blue-600 shadow-sm'
                                                                        : 'bg-slate-100'
                                                                }`}>
                                                                    <span className="text-xs font-bold">{style.id.charAt(0).toUpperCase()}</span>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-slate-900">{style.label}</div>
                                                                    <div className="text-xs text-slate-500">{style.desc}</div>
                                                                </div>
                                                                {configuringStep.displayStyle === style.id && (
                                                                    <div className="ml-auto text-blue-600">
                                                                        <Check size={16} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Option Images - Show for card-image and card-icon */}
                                            {showImageConfig && (
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                        <ImageIcon size={16} className="text-blue-600" />
                                                        Option Images
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {configuringStep.options.map(option => (
                                                            <div key={option.id} className="flex items-center gap-2">
                                                                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                                                    {option.image ? (
                                                                        <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                            <ImageIcon size={16} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-slate-700 truncate">{option.label}</p>
                                                                    <input
                                                                        type="text"
                                                                        value={option.image || ''}
                                                                        onChange={(e) => updateOption(configuringStep.id, option.id, { image: e.target.value })}
                                                                        className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                                        placeholder="Image URL"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Option Colors - Show for card-color and card-color-pill */}
                                            {showColorConfig && (
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                        <Palette size={16} className="text-blue-600" />
                                                        Option Colors
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {configuringStep.options.map(option => (
                                                            <div key={option.id} className="flex items-center gap-2">
                                                                <div 
                                                                    className="w-8 h-8 rounded-full border border-slate-200 shrink-0"
                                                                    style={{ backgroundColor: option.colorHex || '#e2e8f0' }}
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-slate-700 truncate">{option.label}</p>
                                                                    <input
                                                                        type="text"
                                                                        value={option.colorHex || ''}
                                                                        onChange={(e) => updateOption(configuringStep.id, option.id, { colorHex: e.target.value })}
                                                                        className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                                        placeholder="#hexcode"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400">
                                <div className="text-center">
                                    <Layers size={48} className="mx-auto mb-4 text-slate-300" />
                                    <p className="text-sm">Select a step to configure or create a new one</p>
                                    <button 
                                        onClick={addStep}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        + Add First Step
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            ) : activeTab === 'json' ? (
                <div className="flex-1 p-6 overflow-auto">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-lg font-bold mb-4 text-slate-800">Service Definition (JSON)</h3>
                        <pre className="bg-slate-900 text-slate-50 p-6 rounded-xl overflow-auto text-xs font-mono border-2 border-slate-700 shadow-inner max-h-[600px]">
                            {JSON.stringify(service, null, 2)}
                        </pre>
                    </div>
                </div>
            ) : activeTab === 'logic' ? (
                <div className="flex-1 p-6 overflow-auto">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg mb-6 flex items-start gap-3 border border-indigo-100">
                            <Zap className="shrink-0 mt-0.5 text-indigo-600" size={20} />
                            <div className="text-sm">
                                <p className="font-bold mb-1">Conditional Logic</p>
                                <p className="opacity-90">Create &quot;If This Then That&quot; rules to show/hide steps, enable/disable options, or change prices dynamically.</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                            <Zap size={40} className="mx-auto mb-4 text-slate-300" />
                            <p>Logic rules editor coming soon</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-6 overflow-auto">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 flex items-start gap-3 border border-blue-100">
                            <Network className="shrink-0 mt-0.5 text-blue-600" size={20} />
                            <div className="text-sm">
                                <p className="font-bold mb-1">Visual Graph</p>
                                <p className="opacity-90">See how your steps and rules connect in an interactive graph view.</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                            <Network size={40} className="mx-auto mb-4 text-slate-300" />
                            <p>Visual graph coming soon</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
