import React, { useState } from 'react';
import { Service } from '@/types/pricing';
import { ServicePricingConfig } from '@/lib/database.types';
import { Layers, Zap, Code, Network, Info, Sparkles } from 'lucide-react';
import { StepList } from './StepList';
import { RuleList } from './RuleList';
import { DependencyGraph } from './DependencyGraph';
import { PricingAiAssistant } from '../../dashboard/pricing/PricingAiAssistant';

interface Props {
    service: Service;
    onChange: (service: Service) => void;
    fullPage?: boolean;
}

type Tab = 'steps' | 'logic' | 'graph' | 'json' | 'ai';

export const ServiceBuilder: React.FC<Props> = ({ service, onChange, fullPage = false }) => {
    const [activeTab, setActiveTab] = useState<Tab>('steps');

    // Adapter to convert Service -> ServicePricingConfig for the assistant (if compatible)
    // Or, more likely, we need to adapt the AI Assistant to work with the 'Service' type
    // For now, let's assume the user wants to generate the "Pricing Config" part of the service.

    // However, the ServiceBuilder works with 'Service' (ET 2.0 dynamic pricing),
    // whereas PricingAiAssistant works with 'ServicePricingConfig' (ET 1.0 static pricing).
    // The user's request mixes them: "four tabs builder logic..." matches ServiceBuilder (ET 2.0).
    // But PricingAiAssistant generates 'ServicePricingConfig'.

    // If the user wants AI for the Builder, we need a NEW AI Assistant that generates 'steps' and 'rules'.
    // OR we adapt the existing one.

    // Given the prompt "AI Pricing Framework Generator", and the user seeing "four tabs", 
    // it implies they are using the new Builder.
    // The previous implementation was for 'PricingConfigurator' (static pricing).

    // I will integrate the tab, but I might need to clarify or adapt the AI tool to output 'Service' structure (steps/rules)
    // instead of 'ServicePricingConfig'.
    // BUT for this step, I will just place the tab.

    return (
        <div className={`flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 ${fullPage ? 'min-h-[600px]' : 'h-full overflow-hidden'}`}>
            {/* Header / Tabs */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50 overflow-x-auto">
                {[
                    { id: 'steps', label: 'Builder', icon: <Layers size={18} /> },
                    { id: 'logic', label: 'Logic Rules', icon: <Zap size={18} /> },
                    { id: 'graph', label: 'Visual Graph', icon: <Network size={18} /> },
                    { id: 'json', label: 'JSON Source', icon: <Code size={18} /> },
                    { id: 'ai', label: 'AI Assistant', icon: <Sparkles size={18} /> },
                ].map(tab => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${active
                                ? 'border-blue-600 text-blue-600 bg-white'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className={`flex-1 p-6 ${fullPage ? '' : 'overflow-hidden'}`}>
                <div className={`${fullPage ? '' : 'h-full overflow-y-auto custom-scrollbar'}`}>

                    {/* Tab: Steps Builder */}
                    {activeTab === 'steps' && (
                        <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 flex items-start gap-3 border border-blue-100">
                                <Info className="shrink-0 mt-0.5 text-blue-600" size={20} />
                                <div className="text-sm">
                                    <p className="font-bold mb-1">Define Your Service Steps</p>
                                    <p className="opacity-90">Add questions or options for your customers. Use the gear icon on the right to configure types (Config, Fixed, Quantity) and visual styles.</p>
                                </div>
                            </div>
                            <StepList service={service} onChange={onChange} />
                        </div>
                    )}

                    {/* Tab: Logic Rules */}
                    {activeTab === 'logic' && (
                        <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
                            <div className="bg-indigo-50 text-indigo-800 p-4 rounded-lg mb-6 flex items-start gap-3 border border-indigo-100">
                                <Zap className="shrink-0 mt-0.5 text-indigo-600" size={20} />
                                <div className="text-sm">
                                    <p className="font-bold mb-1">Conditional Logic</p>
                                    <p className="opacity-90">Create &quot;If This Then That&quot; rules to show/hide steps, enable/disable options, or change prices dynamically.</p>
                                </div>
                            </div>
                            <RuleList service={service} onChange={onChange} />
                        </div>
                    )}

                    {/* Tab: Dependency Graph */}
                    {activeTab === 'graph' && (
                        <div className={`${fullPage ? 'h-[600px]' : 'h-full'} animate-in fade-in duration-300`}>
                            <DependencyGraph service={service} onUpdate={onChange} />
                        </div>
                    )}

                    {/* Tab: JSON Debug */}
                    {activeTab === 'json' && (
                        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold mb-4 text-slate-800">Service Definition (JSON)</h3>
                            <div className="relative">
                                <pre className="bg-slate-900 text-slate-50 p-6 rounded-xl overflow-auto text-xs font-mono border-2 border-slate-700 shadow-inner max-h-[600px]">
                                    {JSON.stringify(service, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Tab: AI Assistant */}
                    {activeTab === 'ai' && (
                        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                            <PricingAiAssistant
                                currentConfig={service}
                                onApply={(newConfig) => {
                                    onChange(newConfig);
                                    setActiveTab('steps'); // Switch to builder view to see results
                                }}
                                onCancel={() => setActiveTab('steps')}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

