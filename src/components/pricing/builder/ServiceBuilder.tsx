import React, { useState, useEffect, useRef } from 'react';
import { Service, ConfigStep, Option, StepSelectionType, StepDisplayStyle } from '@/types/pricing';
import { 
    Layers, Zap, Code, Network, Settings, Palette, Image as ImageIcon, 
    Plus, Trash2, Check, Eye, Square, Circle, X, Upload, Link, Search, Grid3X3
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
    { id: 'single', label: 'Single', desc: 'Choose one' },
    { id: 'multi', label: 'Multi', desc: 'Multiple' },
    { id: 'quantity', label: 'Qty', desc: 'By quantity' },
    { id: 'fixed', label: 'Fixed', desc: 'All mandatory' },
];

const MOCK_LIBRARY_IMAGES = [
    'https://img.pikbest.com/photo/20241215/luxury-wedding-stage-decor-with-pink-flowers-and-red-carpet_11258184.jpg!sw800',
    'https://static.vecteezy.com/system/resources/previews/018/740/503/non_2x/beautiful-wedding-stage-for-groom-and-bride-photo.jpg',
    'https://media.gettyimages.com/id/1445272650/video/luxury-dinner-table-in-a-wedding-invitation-wedding-decoration-wedding-dinner-table-wedding.jpg?s=640x640&k=20&c=n85Uphj0dw3xDDoKkthbSqoejb3Gbc-R3pqsw6_P3yc=',
    'https://static.vecteezy.com/system/resources/thumbnails/053/808/762/small_2x/wedding-party-decoration-scene-background-free-photo.jpeg',
    'https://media.gettyimages.com/id/1223909090/video/indian-or-hindu-traditional-ceremony-venue-decoration.jpg?s=640x640&k=20&c=Y32M4JB-gbnsZ936iv_xaTvT9viDFjYKOAZoxd1aIKw=',
    'https://assets.architecturaldigest.in/photos/6698dff393565db77b9beb8d/4:3/w_1424,h_1068,c_limit/DSC00522.jpg.jpg',
];

const DisplayStyleMockup: React.FC<{ style: StepDisplayStyle; selected: boolean }> = ({ style, selected }) => {
    const baseClasses = `w-full rounded-lg border-2 transition-all overflow-hidden ${selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`;
    
    switch (style) {
        case 'card-standard':
            return (
                <div className={baseClasses}>
                    <div className="h-12 bg-slate-100 flex items-center justify-center">
                        <div className="flex gap-1">
                            <div className="w-6 h-6 rounded bg-slate-300" />
                            <div className="w-6 h-6 rounded bg-slate-300" />
                            <div className="w-6 h-6 rounded bg-slate-300" />
                        </div>
                    </div>
                    <div className="p-1.5 bg-white">
                        <div className="h-1.5 w-12 bg-slate-200 rounded mb-1" />
                        <div className="h-1 w-16 bg-slate-100 rounded" />
                    </div>
                </div>
            );
        case 'card-compact':
            return (
                <div className={baseClasses}>
                    <div className="p-1.5 flex gap-1">
                        <div className="w-5 h-5 rounded bg-slate-300" />
                        <div className="flex-1">
                            <div className="h-1.5 w-10 bg-slate-200 rounded mb-0.5" />
                            <div className="h-1 w-12 bg-slate-100 rounded" />
                        </div>
                    </div>
                </div>
            );
        case 'card-icon':
            return (
                <div className={baseClasses}>
                    <div className="h-12 bg-slate-100 flex items-center justify-center">
                        <Square className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="p-1.5 bg-white text-center">
                        <div className="h-1.5 w-10 bg-slate-200 rounded mx-auto" />
                    </div>
                </div>
            );
        case 'card-image':
            return (
                <div className={baseClasses}>
                    <div className="h-12 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="p-1.5 bg-white">
                        <div className="h-1.5 w-10 bg-slate-200 rounded" />
                    </div>
                </div>
            );
        case 'card-color':
            return (
                <div className={baseClasses}>
                    <div className="h-12 bg-slate-100 flex items-center justify-center gap-1">
                        <Circle className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                        <Circle className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                        <Circle className="w-3.5 h-3.5 text-green-400 fill-green-400" />
                    </div>
                </div>
            );
        case 'card-color-pill':
            return (
                <div className={baseClasses}>
                    <div className="h-12 bg-slate-100 flex items-center justify-center gap-1 px-1">
                        <div className="w-4 h-2.5 rounded-full bg-pink-400" />
                        <div className="w-4 h-2.5 rounded-full bg-blue-400" />
                        <div className="w-4 h-2.5 rounded-full bg-green-400" />
                    </div>
                </div>
            );
        case 'list-toggle':
            return (
                <div className={baseClasses}>
                    <div className="p-1.5 space-y-0.5">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded border border-slate-300" />
                            <div className="h-1 w-10 bg-slate-200 rounded" />
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded border border-slate-300" />
                            <div className="h-1 w-12 bg-slate-200 rounded" />
                        </div>
                    </div>
                </div>
            );
        default:
            return <div className={baseClasses}><Grid3X3 className="w-4 h-4 text-slate-400 m-2" /></div>;
    }
};

// Image Modal Component
interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    currentImage?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, onSelect, currentImage }) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
    const [imageUrl, setImageUrl] = useState(currentImage || '');
    const [previewImage, setPreviewImage] = useState(currentImage || '');
    const [selectedLibraryImage, setSelectedLibraryImage] = useState<string | null>(currentImage || null);

    useEffect(() => {
        if (currentImage) {
            setImageUrl(currentImage);
            setPreviewImage(currentImage);
            setSelectedLibraryImage(currentImage);
        }
    }, [currentImage, isOpen]);

    const handleLoadUrl = () => {
        if (imageUrl) {
            setPreviewImage(imageUrl);
        }
    };

    const handleSelect = () => {
        if (activeTab === 'upload' && previewImage) {
            onSelect(previewImage);
        } else if (activeTab === 'library' && selectedLibraryImage) {
            onSelect(selectedLibraryImage);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white shrink-0">
                    <h3 className="text-base font-bold text-slate-900">Select Image</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex border-b border-slate-200 px-5 pt-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${
                            activeTab === 'upload'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-slate-500 border-transparent hover:text-slate-700'
                        }`}
                    >
                        Upload / URL
                    </button>
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-[1px] transition-all ${
                            activeTab === 'library'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-slate-500 border-transparent hover:text-slate-700'
                        }`}
                    >
                        Library
                    </button>
                </div>

                <div className="flex-1 overflow-hidden bg-slate-50 p-5">
                    {activeTab === 'upload' ? (
                        <div className="h-full flex flex-col">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-slate-600 mb-2">Drag & Drop or Browse</label>
                                    <div className="flex-1 border-2 border-dashed border-blue-300/40 bg-white hover:bg-blue-50/30 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors min-h-[160px]">
                                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                            <Upload size={20} />
                                        </div>
                                        <p className="text-slate-800 font-semibold text-sm mb-1">Drop files here</p>
                                        <p className="text-slate-500 text-xs">or click to browse</p>
                                        <div className="mt-3 flex gap-1.5 text-[10px] text-slate-400">
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">JPG</span>
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">PNG</span>
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">SVG</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col h-full">
                                    <div className="mb-3">
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">Import from URL</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                <input
                                                    type="text"
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <button
                                                onClick={handleLoadUrl}
                                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                Load
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <label className="text-xs font-bold text-slate-600 mb-2">Preview</label>
                                        <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative min-h-[120px]">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="max-w-full max-h-[140px] object-contain" />
                                            ) : (
                                                <span className="text-slate-400 text-xs">No image selected</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            <div className="flex gap-3 mb-4 shrink-0">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Search images..."
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 overflow-y-auto">
                                {MOCK_LIBRARY_IMAGES.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedLibraryImage(img)}
                                        className={`group relative aspect-video rounded-lg border-2 cursor-pointer overflow-hidden transition-all ${
                                            selectedLibraryImage === img
                                                ? 'border-blue-500 ring-2 ring-blue-200'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        {selectedLibraryImage === img && (
                                            <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                                                <Check size={12} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-5 py-3.5 bg-white border-t border-slate-100 flex justify-end gap-2 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSelect}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                        Set Image
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ServiceBuilder: React.FC<Props> = ({ service, onChange, fullPage = false }) => {
    const [activeTab, setActiveTab] = useState<'builder' | 'logic' | 'graph' | 'json'>('builder');
    const [configuringStepId, setConfiguringStepId] = useState<string | null>(null);
    const [configuringOptionId, setConfiguringOptionId] = useState<string | null>(null);
    const [deleteConfirmStepId, setDeleteConfirmStepId] = useState<string | null>(null);
    
    // Image modal state
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageModalOption, setImageModalOption] = useState<{ stepId: string; optionId: string } | null>(null);

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

    const openImageModal = (stepId: string, optionId: string) => {
        setImageModalOption({ stepId, optionId });
        setImageModalOpen(true);
    };

    const handleImageSelect = (url: string) => {
        if (imageModalOption) {
            updateOption(imageModalOption.stepId, imageModalOption.optionId, { image: url });
        }
    };

    const isColorStyle = (style: StepDisplayStyle) => ['card-color', 'card-color-pill'].includes(style);
    const isImageStyle = (style: StepDisplayStyle) => ['card-image', 'card-icon'].includes(style);

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Image Modal */}
            <ImageModal
                isOpen={imageModalOpen}
                onClose={() => { setImageModalOpen(false); setImageModalOption(null); }}
                onSelect={handleImageSelect}
                currentImage={imageModalOption ? configuringStep?.options.find(o => o.id === imageModalOption.optionId)?.image : undefined}
            />

            {/* Delete Confirmation Modal */}
            {deleteConfirmStepId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-5 max-w-sm w-full mx-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Delete Step?</h3>
                                <p className="text-sm text-slate-500">Cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">
                            Delete this step and all its options?
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setDeleteConfirmStepId(null)} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button onClick={executeDeleteStep} className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg">Delete</button>
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
                            activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'builder' ? (
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar: Simple Steps List (No Accordion) */}
                    <aside className="w-64 flex flex-col border-r border-slate-200 bg-white shrink-0">
                        <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-slate-700 text-sm">Pricing Steps</h3>
                            <button onClick={addStep} className="p-1 hover:bg-slate-100 rounded text-blue-600">
                                <Plus size={18} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {sortedSteps.length === 0 ? (
                                <div className="text-center py-6 text-slate-400 text-xs">No steps yet</div>
                            ) : (
                                sortedSteps.map((step, index) => {
                                    const isActive = step.id === configuringStepId;
                                    return (
                                        <div
                                            key={step.id}
                                            onClick={() => selectStep(step.id)}
                                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                                isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'
                                            }`}
                                        >
                                            <div className={`flex items-center justify-center rounded bg-slate-100 text-slate-500 size-6 text-xs font-bold ${isActive ? 'bg-white text-blue-600' : ''}`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-sm font-medium truncate block ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                                                    {step.name}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    {/* Center Pane */}
                    <section className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-hidden">
                        {configuringStep ? (
                            <>
                                <div className="px-5 pt-4 pb-2 bg-white border-b border-slate-200 shrink-0">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h1 className="text-lg font-bold text-slate-900">Step Configuration</h1>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => confirmDeleteStep(configuringStep.id)} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 text-xs font-medium hover:bg-red-100">Delete</button>
                                            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white text-xs font-medium hover:bg-slate-50">Preview</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5">
                                    <div className="space-y-5">
                                        {/* General Settings + Display Style */}
                                        <div className="grid grid-cols-12 gap-5">
                                            <div className="col-span-12 lg:col-span-8">
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <Settings size={14} className="text-blue-600" />
                                                        General Settings
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">Step Name</label>
                                                            <input
                                                                type="text"
                                                                value={configuringStep.name}
                                                                onChange={(e) => updateStep(configuringStep.id, { name: e.target.value })}
                                                                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">Selection Type</label>
                                                            <div className="flex gap-0.5 p-0.5 bg-slate-100 rounded-lg">
                                                                {SELECTION_TYPES.map(type => (
                                                                    <button
                                                                        key={type.id}
                                                                        onClick={() => updateStep(configuringStep.id, { selectionType: type.id as StepSelectionType })}
                                                                        className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                                                                            configuringStep.selectionType === type.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                                                        }`}
                                                                    >
                                                                        {type.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                                                            <input
                                                                type="text"
                                                                value={configuringStep.description || ''}
                                                                onChange={(e) => updateStep(configuringStep.id, { description: e.target.value })}
                                                                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                                placeholder="Help customers understand this step"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <div 
                                                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                                        configuringStep.required ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                                                                    }`}
                                                                    onClick={() => updateStep(configuringStep.id, { required: !configuringStep.required })}
                                                                >
                                                                    {configuringStep.required && <Check size={10} />}
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-700">Required Step</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-12 lg:col-span-4">
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
                                                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                        <Palette size={14} className="text-blue-600" />
                                                        Display Style
                                                    </h4>
                                                    <div className="flex gap-3">
                                                        <div className="w-20 shrink-0">
                                                            <DisplayStyleMockup style={configuringStep.displayStyle} selected={true} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <select
                                                                value={configuringStep.displayStyle}
                                                                onChange={(e) => updateStep(configuringStep.id, { displayStyle: e.target.value as StepDisplayStyle })}
                                                                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                            >
                                                                {DISPLAY_STYLES.map(style => (
                                                                    <option key={style.id} value={style.id}>{style.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Options Table */}
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                    <Layers size={14} className="text-blue-600" />
                                                    Options &amp; Pricing
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    {isImageStyle(configuringStep.displayStyle) && <span className="text-[10px] text-slate-500">Image</span>}
                                                    {isColorStyle(configuringStep.displayStyle) && <span className="text-[10px] text-slate-500">Color</span>}
                                                    <button onClick={() => addOption(configuringStep.id)} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">+ Add</button>
                                                </div>
                                            </div>
                                            
                                            {configuringStep.options.length === 0 ? (
                                                <div className="text-center py-8 text-slate-400 text-xs">No options yet</div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs">
                                                        <thead className="bg-slate-50/50 border-b border-slate-200">
                                                            <tr>
                                                                <th className="px-3 py-2 font-semibold text-slate-500 text-left">Label</th>
                                                                <th className="px-3 py-2 font-semibold text-slate-500 text-left">Description</th>
                                                                <th className="px-3 py-2 font-semibold text-slate-500 text-left w-20">Price</th>
                                                                {isImageStyle(configuringStep.displayStyle) && (
                                                                    <th className="px-3 py-2 font-semibold text-slate-500 text-left">Image</th>
                                                                )}
                                                                {isColorStyle(configuringStep.displayStyle) && (
                                                                    <th className="px-3 py-2 font-semibold text-slate-500 text-left w-24">Color</th>
                                                                )}
                                                                <th className="px-3 py-2 font-semibold text-slate-500 text-right w-12">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {configuringStep.options.map(option => (
                                                                <tr key={option.id} className="hover:bg-slate-50">
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={option.label}
                                                                            onChange={(e) => updateOption(configuringStep.id, option.id, { label: e.target.value })}
                                                                            className="w-full bg-transparent border-none text-sm font-medium text-slate-900 focus:outline-none"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={option.description || ''}
                                                                            onChange={(e) => updateOption(configuringStep.id, option.id, { description: e.target.value })}
                                                                            className="w-full bg-transparent border-none text-xs text-slate-500 focus:outline-none"
                                                                            placeholder="Optional"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="flex items-center gap-0.5">
                                                                            <span className="text-slate-400">$</span>
                                                                            <input
                                                                                type="number"
                                                                                value={option.baseDelta}
                                                                                onChange={(e) => updateOption(configuringStep.id, option.id, { baseDelta: parseFloat(e.target.value) || 0 })}
                                                                                className="w-14 bg-transparent border-none text-xs font-mono text-slate-900 focus:outline-none"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    {isImageStyle(configuringStep.displayStyle) && (
                                                                        <td className="px-3 py-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-7 h-7 rounded bg-slate-100 overflow-hidden">
                                                                                    {option.image ? (
                                                                                        <img src={option.image} alt="" className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={12} /></div>
                                                                                    )}
                                                                                </div>
                                                                                <button 
                                                                                    onClick={() => openImageModal(configuringStep.id, option.id)}
                                                                                    className="text-[10px] text-blue-600 hover:underline"
                                                                                >
                                                                                    {option.image ? 'Change' : 'Set'}
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                    {isColorStyle(configuringStep.displayStyle) && (
                                                                        <td className="px-3 py-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="relative">
                                                                                    <input
                                                                                        type="color"
                                                                                        value={option.colorHex || '#e2e8f0'}
                                                                                        onChange={(e) => updateOption(configuringStep.id, option.id, { colorHex: e.target.value })}
                                                                                        className="w-7 h-7 rounded-full border border-slate-200 cursor-pointer p-0"
                                                                                    />
                                                                                </div>
                                                                                <span className="text-[10px] text-slate-400">{option.colorHex || '#'}</span>
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                    <td className="px-3 py-2 text-right">
                                                                        <button onClick={() => removeOption(configuringStep.id, option.id)} className="text-slate-400 hover:text-red-500 p-1">
                                                                            <Trash2 size={12} />
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
                                    <Layers size={40} className="mx-auto mb-3 text-slate-300" />
                                    <p className="text-sm">Select a step to configure</p>
                                    <button onClick={addStep} className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">+ Add Step</button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            ) : activeTab === 'json' ? (
                <div className="flex-1 p-5 overflow-auto">
                    <div className="max-w-4xl mx-auto">
                        <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-auto text-xs font-mono">
                            {JSON.stringify(service, null, 2)}
                        </pre>
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-5 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        {activeTab === 'logic' ? <Zap size={40} className="mx-auto mb-3 text-slate-300" /> : <Network size={40} className="mx-auto mb-3 text-slate-300" />}
                        <p className="text-sm">{activeTab === 'logic' ? 'Logic rules coming soon' : 'Visual graph coming soon'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
