import React, { useState, useEffect } from 'react';
import { Service, ConfigStep, Option, StepSelectionType, StepDisplayStyle } from '@/types/pricing';
import { ColorPicker } from './ColorPicker';
import { ImagePickerModal } from './ImagePickerModal';
import { 
    Layers, Zap, Code, Network, Settings, Palette, Image as ImageIcon, 
    Plus, Trash2, Check, Eye, Grid, List, Square, Circle
} from 'lucide-react';

interface Props {
    service: Service;
    onChange: (service: Service) => void;
    fullPage?: boolean;
}

const DISPLAY_STYLES: { id: StepDisplayStyle; label: string; type: 'layout' | 'color' }[] = [
    { id: 'card-standard', label: 'Card Standard', type: 'layout' },
    { id: 'card-compact', label: 'Card Compact', type: 'layout' },
    { id: 'card-icon', label: 'Icon Card', type: 'layout' },
    { id: 'card-image', label: 'Image Card', type: 'layout' },
    { id: 'card-color', label: 'Color Swatch', type: 'color' },
    { id: 'card-color-pill', label: 'Color Pill', type: 'color' },
    { id: 'list-toggle', label: 'List Toggle', type: 'layout' },
];

const SELECTION_TYPES = [
    { id: 'single', label: 'Single Select', desc: 'Choose one option' },
    { id: 'multi', label: 'Multi Select', desc: 'Select multiple options' },
    { id: 'quantity', label: 'Quantity Based', desc: 'Price by quantity' },
    { id: 'fixed', label: 'Fixed', desc: 'All mandatory' },
];

const DisplayStyleMockup: React.FC<{ style: StepDisplayStyle; selected: boolean }> = ({ style, selected }) => {
    const baseClasses = `w-full rounded-lg border-2 transition-all overflow-hidden ${selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`;
    
    switch (style) {
        case 'card-standard':
            return (
                <div className={baseClasses}>
                    <div className="h-16 bg-slate-100 flex items-center justify-center">
                        <div className="flex gap-1">
                            <div className="w-8 h-8 rounded bg-slate-300" />
                            <div className="w-8 h-8 rounded bg-slate-300" />
                            <div className="w-8 h-8 rounded bg-slate-300" />
                        </div>
                    </div>
                    <div className="p-2 bg-white">
                        <div className="h-2 w-16 bg-slate-200 rounded mb-1" />
                        <div className="h-1.5 w-24 bg-slate-100 rounded" />
                    </div>
                </div>
            );
        case 'card-compact':
            return (
                <div className={baseClasses}>
                    <div className="p-2 flex gap-1">
                        <div className="w-6 h-6 rounded bg-slate-300" />
                        <div className="flex-1">
                            <div className="h-2 w-12 bg-slate-200 rounded mb-1" />
                            <div className="h-1.5 w-16 bg-slate-100 rounded" />
                        </div>
                    </div>
                    <div className="px-2 pb-2 flex gap-1">
                        <div className="w-6 h-6 rounded bg-slate-300" />
                        <div className="flex-1">
                            <div className="h-2 w-12 bg-slate-200 rounded mb-1" />
                            <div className="h-1.5 w-16 bg-slate-100 rounded" />
                        </div>
                    </div>
                </div>
            );
        case 'card-icon':
            return (
                <div className={baseClasses}>
                    <div className="h-16 bg-slate-100 flex items-center justify-center">
                        <Square className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="p-2 bg-white text-center">
                        <div className="h-2 w-12 bg-slate-200 rounded mx-auto mb-1" />
                    </div>
                </div>
            );
        case 'card-image':
            return (
                <div className={baseClasses}>
                    <div className="h-16 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="p-2 bg-white">
                        <div className="h-2 w-14 bg-slate-200 rounded mb-1" />
                        <div className="h-1.5 w-20 bg-slate-100 rounded" />
                    </div>
                </div>
            );
        case 'card-color':
            return (
                <div className={baseClasses}>
                    <div className="h-16 bg-slate-100 flex items-center justify-center gap-2">
                        <Circle className="w-5 h-5 text-pink-400 fill-pink-400" />
                        <Circle className="w-5 h-5 text-blue-400 fill-blue-400" />
                        <Circle className="w-5 h-5 text-green-400 fill-green-400" />
                    </div>
                    <div className="p-2 bg-white text-center">
                        <div className="h-2 w-12 bg-slate-200 rounded mx-auto" />
                    </div>
                </div>
            );
        case 'card-color-pill':
            return (
                <div className={baseClasses}>
                    <div className="h-16 bg-slate-100 flex items-center justify-center gap-2 px-2">
                        <div className="w-6 h-4 rounded-full bg-pink-400" />
                        <div className="w-6 h-4 rounded-full bg-blue-400" />
                        <div className="w-6 h-4 rounded-full bg-green-400" />
                    </div>
                    <div className="p-2 bg-white text-center">
                        <div className="h-2 w-12 bg-slate-200 rounded mx-auto" />
                    </div>
                </div>
            );
        case 'list-toggle':
            return (
                <div className={baseClasses}>
                    <div className="p-2 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-slate-300" />
                            <div className="h-2 w-16 bg-slate-200 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-slate-300" />
                            <div className="h-2 w-20 bg-slate-200 rounded" />
                        </div>
                    </div>
                </div>
            );
        default:
            return (
                <div className={baseClasses}>
                    <div className="h-16 bg-slate-100 flex items-center justify-center">
                        <Grid className="w-6 h-6 text-slate-400" />
                    </div>
                </div>
            );
    }
};

export const ServiceBuilder: React.FC<Props> = ({ service, onChange, fullPage = false }) => {
    const [activeTab, setActiveTab] = useState<'builder' | 'logic' | 'graph' | 'json'>('builder');
    const [configuringStepId, setConfiguringStepId] = useState<string | null>(null);
    const [configuringOptionId, setConfiguringOptionId] = useState<string | null>(null);
    const [deleteConfirmStepId, setDeleteConfirmStepId] = useState<string | null>(null);
    const [imagePickerState, setImagePickerState] = useState<{ isOpen: boolean; optionId: string | null }>({ isOpen: false, optionId: null });

    useEffect(() => {
        if (!configuringStepId && service.steps.length > 0) {
            const firstStep = [...service.steps].sort((a, b) => a.order - b.order)[0];
            setConfiguringStepId(firstStep.id);
        }
    }, [service.steps, configuringStepId]);

    const generatingId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const configuringStep = service.steps.find(s => s.id === configuringStepId);
    const sortedSteps = [...service.steps].sort((a, b) => a.order - b.order);

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

    const updateStep = (stepId: string, updates: Partial<ConfigStep>) => {
        const updatedSteps = service.steps.map(s => s.id === stepId ? { ...s, ...updates } : s);
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
        updateStep(stepId, { options: step.options.filter(o => o.id !== optionId) });
        if (configuringOptionId === optionId) {
            setConfiguringOptionId(null);
        }
    };

    const updateOption = (stepId: string, optionId: string, updates: Partial<Option>) => {
        const step = service.steps.find(s => s.id === stepId);
        if (!step) return;
        const updatedOptions = step.options.map(o => o.id === optionId ? { ...o, ...updates } : o);
        updateStep(stepId, { options: updatedOptions });
    };

    const selectStep = (stepId: string) => {
        setConfiguringStepId(stepId);
        setConfiguringOptionId(null);
    };

    const selectOption = (optionId: string) => {
        setConfiguringOptionId(optionId);
    };

    const openImagePicker = (optionId: string) => {
        setImagePickerState({ isOpen: true, optionId });
    };

    const handleImageSelect = (imageUrl: string) => {
        if (imagePickerState.optionId && configuringStepId) {
            updateOption(configuringStepId, imagePickerState.optionId, { image: imageUrl });
        }
        setImagePickerState({ isOpen: false, optionId: null });
    };

    const isColorStyle = (style: StepDisplayStyle) => ['card-color', 'card-color-pill'].includes(style);
    const isImageStyle = (style: StepDisplayStyle) => ['card-image', 'card-icon'].includes(style);

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
                            Are you sure you want to delete this step and all its options?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirmStepId(null)}
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
                            <button onClick={addStep} className="p-1 hover:bg-slate-100 rounded text-blue-600 transition-colors">
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
                                    
                                    return (
                                        <div
                                            key={step.id}
                                            onClick={() => selectStep(step.id)}
                                            className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                                isActive
                                                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                                                    : 'bg-white border border-transparent hover:border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className={`flex items-center justify-center rounded-md bg-slate-100 text-slate-500 shrink-0 size-7 ${isActive ? 'bg-white text-blue-600 shadow-sm' : ''}`}>
                                                <span className="text-xs font-bold">{index + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-sm font-medium truncate block ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                                                    {step.name}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {step.selectionType} · {step.options.length} options
                                                </span>
                                            </div>
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
                                {/* Header */}
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

                                {/* Content - General Settings + Display Style side by side, Options below */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="space-y-6">
                                        {/* Top Row: General Settings + Display Style */}
                                        <div className="grid grid-cols-12 gap-6">
                                            {/* General Settings - Wider now */}
                                            <div className="col-span-12 lg:col-span-8">
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
                                                            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                                                                {SELECTION_TYPES.map(type => (
                                                                    <button
                                                                        key={type.id}
                                                                        onClick={() => updateStep(configuringStep.id, { selectionType: type.id as StepSelectionType })}
                                                                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                                                                            configuringStep.selectionType === type.id
                                                                                ? 'bg-white text-blue-600 shadow-sm'
                                                                                : 'text-slate-500 hover:text-slate-700'
                                                                        }`}
                                                                    >
                                                                        {type.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                                                            <input
                                                                type="text"
                                                                value={configuringStep.description || ''}
                                                                onChange={(e) => updateStep(configuringStep.id, { description: e.target.value })}
                                                                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                                placeholder="Help customers understand this step"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
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
                                            </div>

                                            {/* Display Style - Compact with dropdown */}
                                            <div className="col-span-12 lg:col-span-4">
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <Palette size={16} className="text-blue-600" />
                                                        Display Style
                                                    </h4>
                                                    
                                                    {/* Preview + Dropdown */}
                                                    <div className="flex gap-3">
                                                        {/* Preview */}
                                                        <div className="w-24 shrink-0">
                                                            <DisplayStyleMockup style={configuringStep.displayStyle} selected={true} />
                                                        </div>
                                                        
                                                        {/* Dropdown */}
                                                        <div className="flex-1">
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">Select Style</label>
                                                            <select
                                                                value={configuringStep.displayStyle}
                                                                onChange={(e) => updateStep(configuringStep.id, { displayStyle: e.target.value as StepDisplayStyle })}
                                                                className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                            >
                                                                {DISPLAY_STYLES.map(style => (
                                                                    <option key={style.id} value={style.id}>{style.label}</option>
                                                                ))}
                                                            </select>
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                {configuringStep.displayStyle === 'card-image' && 'Shows large image cards'}
                                                                {configuringStep.displayStyle === 'card-color' && 'Circular color selectors'}
                                                                {configuringStep.displayStyle === 'list-toggle' && 'Simple list with toggles'}
                                                                {configuringStep.displayStyle === 'card-standard' && 'Large cards with details'}
                                                                {configuringStep.displayStyle === 'card-compact' && 'Compact card layout'}
                                                                {configuringStep.displayStyle === 'card-icon' && 'Cards with icons'}
                                                                {configuringStep.displayStyle === 'card-color-pill' && 'Pill-shaped color options'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Row: Options & Pricing - Full Width */}
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <Layers size={16} className="text-blue-600" />
                                                    Options &amp; Pricing
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    {isImageStyle(configuringStep.displayStyle) && (
                                                        <span className="text-xs text-slate-500">Image field available</span>
                                                    )}
                                                    {isColorStyle(configuringStep.displayStyle) && (
                                                        <span className="text-xs text-slate-500">Color field available</span>
                                                    )}
                                                    <button 
                                                        onClick={() => addOption(configuringStep.id)}
                                                        className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        + Add Option
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {configuringStep.options.length === 0 ? (
                                                <div className="text-center py-12 text-slate-400 text-sm">
                                                    No options yet. Click &quot;Add Option&quot; to create one.
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                                                            <tr>
                                                                <th className="px-4 py-3 font-semibold w-40">Label</th>
                                                                <th className="px-4 py-3 font-semibold">Description</th>
                                                                <th className="px-4 py-3 font-semibold w-24">Price</th>
                                                                {isImageStyle(configuringStep.displayStyle) && (
                                                                    <th className="px-4 py-3 font-semibold w-24">Image</th>
                                                                )}
                                                                {isColorStyle(configuringStep.displayStyle) && (
                                                                    <th className="px-4 py-3 font-semibold w-20">Color</th>
                                                                )}
                                                                <th className="px-4 py-3 font-semibold text-right w-16">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {configuringStep.options.map(option => (
                                                                <tr 
                                                                    key={option.id} 
                                                                    className={`hover:bg-slate-50 transition-colors ${configuringOptionId === option.id ? 'bg-blue-50/50' : ''}`}
                                                                >
                                                                    <td className="px-4 py-3">
                                                                        <input
                                                                            type="text"
                                                                            value={option.label}
                                                                            onChange={(e) => updateOption(configuringStep.id, option.id, { label: e.target.value })}
                                                                            className="w-full bg-transparent border-none text-sm font-medium text-slate-900 focus:outline-none focus:ring-0"
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <input
                                                                            type="text"
                                                                            value={option.description || ''}
                                                                            onChange={(e) => updateOption(configuringStep.id, option.id, { description: e.target.value })}
                                                                            className="w-full bg-transparent border-none text-sm text-slate-500 focus:outline-none focus:ring-0"
                                                                            placeholder="Optional"
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-1 bg-slate-50 rounded px-2 py-1 border border-slate-200">
                                                                            <span className="text-slate-400 text-xs">$</span>
                                                                            <input
                                                                                type="number"
                                                                                value={option.baseDelta}
                                                                                onChange={(e) => updateOption(configuringStep.id, option.id, { baseDelta: parseFloat(e.target.value) || 0 })}
                                                                                className="w-16 bg-transparent border-none text-sm font-mono text-slate-900 focus:outline-none focus:ring-0 [-moz-appearance:textfield]"
                                                                                style={{ WebkitAppearance: 'none' }}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    {isImageStyle(configuringStep.displayStyle) && (
                                                                        <td className="px-4 py-3">
                                                                            <button
                                                                                onClick={() => openImagePicker(option.id)}
                                                                                className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-xs font-medium text-slate-600"
                                                                            >
                                                                                <div className="w-5 h-5 rounded bg-slate-100 overflow-hidden shrink-0">
                                                                                    {option.image ? (
                                                                                        <img src={option.image} alt="" className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                                            <ImageIcon size={10} />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {option.image ? 'Change' : 'Set'}
                                                                            </button>
                                                                        </td>
                                                                    )}
                                                                    {isColorStyle(configuringStep.displayStyle) && (
                                                                        <td className="px-4 py-3">
                                                                            <ColorPicker
                                                                                value={option.colorHex || ''}
                                                                                onChange={(color) => updateOption(configuringStep.id, option.id, { colorHex: color })}
                                                                            />
                                                                        </td>
                                                                    )}
                                                                    <td className="px-4 py-3 text-right">
                                                                        <button 
                                                                            onClick={() => removeOption(configuringStep.id, option.id)}
                                                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
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
                                <p className="opacity-90">Create rules to show/hide steps, enable/disable options, or change prices.</p>
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
                                <p className="opacity-90">See how your steps and rules connect.</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
                            <Network size={40} className="mx-auto mb-4 text-slate-300" />
                            <p>Visual graph coming soon</p>
                        </div>
                    </div>
                </div>
            )}

            <ImagePickerModal
                isOpen={imagePickerState.isOpen}
                onClose={() => setImagePickerState({ isOpen: false, optionId: null })}
                onSelect={handleImageSelect}
                currentValue={configuringStep?.options.find(o => o.id === imagePickerState.optionId)?.image}
            />
        </div>
    );
};
