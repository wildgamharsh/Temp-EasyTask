import React, { useState } from 'react';
import { Service, Rule, RuleType, RuleEffect, RuleCondition } from '@/types/pricing';
import { Trash2, Plus, GitBranch, Zap, AlertTriangle, X, Info } from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface Props {
    service: Service;
    onChange: (service: Service) => void;
}

export const RuleList: React.FC<Props> = ({ service, onChange }) => {
    const [showHelp, setShowHelp] = useState(false);

    const addRule = () => {
        const firstStep = service.steps[0];
        const firstOption = firstStep?.options[0];

        if (!firstStep || !firstOption) {
            alert("Please configure your Steps and Options before adding logic rules.");
            return;
        }

        const newRule: Rule = {
            id: `rule-${Date.now()}`,
            serviceId: service.id,
            condition: {
                dependsOnStepId: firstStep.id,
                selectedOptionId: firstOption.id
            },
            effects: [{
                type: RuleType.PRICE_OVERRIDE,
                targetOptionId: '',
                value: 0
            }]
        };
        onChange({ ...service, rules: [...service.rules, newRule] });
    };

    const removeRule = (ruleId: string) => {
        onChange({
            ...service,
            rules: service.rules.filter(r => r.id !== ruleId)
        });
    };

    const updateCondition = (ruleId: string, updates: Partial<RuleCondition>) => {
        const rule = service.rules.find(r => r.id === ruleId);
        if (!rule) return;
        
        onChange({
            ...service,
            rules: service.rules.map(r => r.id === ruleId ? 
                { ...r, condition: { ...r.condition, ...updates } } 
                : r
            )
        });
    };

    const addEffect = (ruleId: string) => {
        const rule = service.rules.find(r => r.id === ruleId);
        if (!rule) return;

        const newEffect: RuleEffect = {
            type: RuleType.DISABLE,
            targetOptionIds: [],
            targetStepIds: []
        };
        
        onChange({
            ...service,
            rules: service.rules.map(r => r.id === ruleId ? 
                { ...r, effects: [...r.effects, newEffect] } 
                : r
            )
        });
    };

    const removeEffect = (ruleId: string, effectIndex: number) => {
        const rule = service.rules.find(r => r.id === ruleId);
        if (!rule) return;

        const newEffects = [...rule.effects];
        newEffects.splice(effectIndex, 1);
        
        onChange({
            ...service,
            rules: service.rules.map(r => r.id === ruleId ? { ...r, effects: newEffects } : r)
        });
    };

    const updateEffect = (ruleId: string, effectIndex: number, updates: Partial<RuleEffect>) => {
        const rule = service.rules.find(r => r.id === ruleId);
        if (!rule) return;

        const newEffects = [...rule.effects];
        newEffects[effectIndex] = { ...newEffects[effectIndex], ...updates };
        
        onChange({
            ...service,
            rules: service.rules.map(r => r.id === ruleId ? { ...r, effects: newEffects } : r)
        });
    };

    const effectTypeOptions = [
        {
            label: "Option Actions",
            options: [
                { value: RuleType.PRICE_OVERRIDE, label: "Set Price" },
                { value: RuleType.DISABLE, label: "Disable" },
                { value: RuleType.ENABLE, label: "Enable" }
            ]
        },
        {
            label: "Step Actions",
            options: [
                { value: RuleType.STEP_HIDE, label: "Hide Step" },
                { value: RuleType.STEP_SHOW, label: "Show Step" },
                { value: RuleType.PRICE_MULTIPLIER, label: "Multiply Cost" }
            ]
        }
    ];

    const stepOptions = service.steps.map(s => ({ value: s.id, label: s.name }));

    return (
        <div className="space-y-6">
            {service.steps.length === 0 ? (
                <div className="text-center p-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <AlertTriangle className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-slate-900 font-bold text-lg mb-2">No steps defined</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">You must create steps and options before adding logic.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-800 font-bold flex items-center gap-2">
                            <Zap size={18} className="text-blue-500" />
                            Logic Rules ({service.rules.length})
                        </h3>
                        <button
                            onClick={() => setShowHelp(true)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <Info size={14} /> Help
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {service.rules.map((rule) => {
                            const depStep = service.steps.find(s => s.id === rule.condition.dependsOnStepId);
                            const conditionOptionOptions = depStep?.options.map(o => ({ value: o.id, label: o.label })) || [];

                            return (
                                <div key={rule.id} className="group bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col overflow-hidden relative">
                                    {/* Top: Condition (WHEN) */}
                                    <div className="bg-slate-50 border-b border-slate-100 p-3 flex items-start gap-2">
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0 mt-1.5">
                                            <GitBranch size={10} /> If
                                        </div>
                                        
                                        <div className="flex-1 flex gap-2 w-full min-w-0">
                                            <div className="flex-1 min-w-0">
                                                <CustomSelect
                                                    size="sm"
                                                    value={rule.condition.dependsOnStepId}
                                                    options={stepOptions}
                                                    onChange={(val) => updateCondition(rule.id, { dependsOnStepId: val, selectedOptionId: service.steps.find(s => s.id === val)?.options[0]?.id || '' })}
                                                    placeholder="Step..."
                                                />
                                            </div>
                                            <div className="flex-[1.2] min-w-0">
                                                <CustomSelect
                                                    size="sm"
                                                    value={rule.condition.selectedOptionId}
                                                    options={conditionOptionOptions}
                                                    onChange={(val) => updateCondition(rule.id, { selectedOptionId: val })}
                                                    placeholder="Option..."
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeRule(rule.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Rule"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {/* Bottom: Effects (THEN) */}
                                    <div className="p-3 bg-white flex-1 flex flex-col justify-center">
                                        {rule.effects.map((effect, effIndex) => {
                                            const isStepAction = [RuleType.PRICE_MULTIPLIER, RuleType.STEP_HIDE, RuleType.STEP_SHOW].includes(effect.type);
                                            
                                            // Options for Target
                                            const targetOptions = isStepAction 
                                                ? stepOptions
                                                : service.steps.map(s => ({
                                                    label: s.name,
                                                    options: s.options.map(o => ({ value: o.id, label: `${s.name}: ${o.label}` }))
                                                }));

                                            return (
                                                <div key={effIndex} className="flex items-center gap-2 mb-2 last:mb-0 group/effect">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
                                                        Then
                                                    </div>

                                                    <div className="flex-1 flex gap-2 w-full min-w-0">
                                                        <div className="w-24 shrink-0">
                                                            <CustomSelect
                                                                size="sm"
                                                                value={effect.type}
                                                                options={effectTypeOptions}
                                                                onChange={(val) => updateEffect(rule.id, effIndex, { type: val as RuleType })}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                             <CustomSelect
                                                                size="sm"
                                                                value={isStepAction ? (effect.targetStepId || '') : (effect.targetOptionId || effect.targetOptionIds?.[0] || '')}
                                                                options={targetOptions}
                                                                onChange={(val) => updateEffect(rule.id, effIndex, isStepAction ? { targetStepId: val, targetStepIds: [val] } : { targetOptionId: val, targetOptionIds: [val] })}
                                                                placeholder="Target..."
                                                            />
                                                        </div>
                                                        {(effect.type === RuleType.PRICE_OVERRIDE || effect.type === RuleType.PRICE_MULTIPLIER) && (
                                                            <div className="w-16 shrink-0 relative">
                                                                <Input
                                                                    size="sm"
                                                                    type="number"
                                                                    value={effect.value}
                                                                    onChange={(e) => updateEffect(rule.id, effIndex, { value: parseFloat(e.target.value) || 0 })}
                                                                    className="font-mono text-center"
                                                                />
                                                                 {effect.type === RuleType.PRICE_MULTIPLIER && (
                                                                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 text-xs text-[9px] pointer-events-none">x</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Effect Actions */}
                                                    <div className="flex gap-1">
                                                        {rule.effects.length > 1 && (
                                                            <button 
                                                                onClick={() => removeEffect(rule.id, effIndex)}
                                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover/effect:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <button
                                            onClick={() => addEffect(rule.id)}
                                            className="mt-2 self-start text-[10px] font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors pl-1"
                                        >
                                            <Plus size={10} /> Add Effect
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Rule Button (Last item in grid) */}
                        <button
                            onClick={addRule}
                            className="min-h-[100px] border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all gap-2 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                <Plus size={16} />
                            </div>
                            <span className="text-xs font-semibold">New Rule</span>
                        </button>
                    </div>
                </>
            )}

            {/* Help Modal */}
            <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Logic Rules Guide" maxWidth="max-w-2xl">
                 <div className="space-y-6 text-sm text-slate-600">
                    <p>
                        Logic rules allow you to change the behavior of the calculator based on user selections.
                        Structure your rules as <strong>&quot;IF this happens, THEN do that&quot;</strong>.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                            <h4 className="font-bold text-slate-900 mb-2">Triggers (IF)</h4>
                            <p className="text-xs mb-2">A rule activates when a user selects a specific option.</p>
                            <code className="bg-slate-200 px-1 py-0.5 rounded text-xs block w-fit">IF [Step A] IS [Option 1]</code>
                        </div>
                        <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
                            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">Actions (THEN)</h4>
                             <ul className="list-disc pl-4 space-y-1 text-xs">
                                <li><strong>Set Price:</strong> Override option price.</li>
                                <li><strong>Disable:</strong> Prevent selecting incompatible options.</li>
                                <li><strong>Show/Hide:</strong> Reveal or remove entire steps.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
