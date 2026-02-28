import React, { useState } from 'react';
import { Service, Rule, RuleType, RuleEffect, RuleCondition } from '@/types/pricing';
import { Trash2, Plus, Zap, AlertTriangle, X, Search, Filter, Edit, SlidersHorizontal } from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface Props {
    service: Service;
    onChange: (service: Service) => void;
}

type RuleTypeBadge = 'pricing' | 'visibility' | 'validation';

const getRuleType = (effect: RuleEffect): RuleTypeBadge => {
    if (effect.type === RuleType.STEP_HIDE || effect.type === RuleType.STEP_SHOW) {
        return 'visibility';
    }
    if (effect.type === RuleType.DISABLE || effect.type === RuleType.ENABLE) {
        return 'validation';
    }
    return 'pricing';
};

export const RuleList: React.FC<Props> = ({ service, onChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
    const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const [formData, setFormData] = useState({
        dependsOnStepId: '',
        selectedOptionId: '',
        effectType: RuleType.PRICE_OVERRIDE as RuleType,
        targetStepId: '',
        targetOptionId: '',
        value: 0
    });

    const selectedRule = service.rules.find(r => r.id === selectedRuleId);

    const stepOptions = service.steps.map(s => ({ value: s.id, label: s.name }));
    const allOptionOptions = service.steps.flatMap(s => 
        s.options.map(o => ({ value: o.id, label: `${s.name}: ${o.label}`, stepId: s.id }))
    );

    const getStepOptions = (stepId: string) => {
        const step = service.steps.find(s => s.id === stepId);
        return step?.options.map(o => ({ value: o.id, label: o.label })) || [];
    };

    const getTargetStepOptions = () => {
        return service.steps.map(s => ({ value: s.id, label: s.name }));
    };

    const getTargetOptionOptions = () => {
        return service.steps.flatMap(s => 
            s.options.map(o => ({ value: o.id, label: `${s.name}: ${o.label}` }))
        );
    };

    const openAddModal = () => {
        const firstStep = service.steps[0];
        const firstOption = firstStep?.options[0];
        
        if (!firstStep || !firstOption) {
            alert("Please configure your Steps and Options before adding logic rules.");
            return;
        }

        setFormData({
            dependsOnStepId: firstStep.id,
            selectedOptionId: firstOption.id,
            effectType: RuleType.PRICE_OVERRIDE,
            targetStepId: '',
            targetOptionId: '',
            value: 0
        });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const openEditModal = (rule: Rule) => {
        const firstEffect = rule.effects[0];
        setFormData({
            dependsOnStepId: rule.condition.dependsOnStepId,
            selectedOptionId: rule.condition.selectedOptionId,
            effectType: firstEffect?.type || RuleType.PRICE_OVERRIDE,
            targetStepId: firstEffect?.targetStepId || firstEffect?.targetStepIds?.[0] || '',
            targetOptionId: firstEffect?.targetOptionId || firstEffect?.targetOptionIds?.[0] || '',
            value: firstEffect?.value || 0
        });
        setModalMode('edit');
        setEditingRuleId(rule.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRuleId(null);
    };

    const handleSaveRule = () => {
        const isStepAction = [RuleType.PRICE_MULTIPLIER, RuleType.STEP_HIDE, RuleType.STEP_SHOW].includes(formData.effectType);

        const newEffect: RuleEffect = {
            type: formData.effectType,
            targetStepId: isStepAction ? formData.targetStepId : undefined,
            targetStepIds: isStepAction && formData.targetStepId ? [formData.targetStepId] : [],
            targetOptionId: !isStepAction ? formData.targetOptionId : undefined,
            targetOptionIds: !isStepAction && formData.targetOptionId ? [formData.targetOptionId] : [],
            value: formData.value
        };

        if (modalMode === 'add') {
            const newRule: Rule = {
                id: `rule-${Date.now()}`,
                serviceId: service.id,
                condition: {
                    dependsOnStepId: formData.dependsOnStepId,
                    selectedOptionId: formData.selectedOptionId
                },
                effects: [newEffect]
            };
            onChange({ ...service, rules: [...service.rules, newRule] });
        } else if (modalMode === 'edit' && editingRuleId) {
            onChange({
                ...service,
                rules: service.rules.map(r => r.id === editingRuleId ? {
                    ...r,
                    condition: {
                        dependsOnStepId: formData.dependsOnStepId,
                        selectedOptionId: formData.selectedOptionId
                    },
                    effects: [newEffect]
                } : r)
            });
        }

        closeModal();
    };

    const removeRule = (ruleId: string) => {
        onChange({
            ...service,
            rules: service.rules.filter(r => r.id !== ruleId)
        });
        if (selectedRuleId === ruleId) {
            setSelectedRuleId(null);
        }
    };

    const filteredRules = service.rules.filter(rule => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const depStep = service.steps.find(s => s.id === rule.condition.dependsOnStepId);
        const depOption = depStep?.options.find(o => o.id === rule.condition.selectedOptionId);
        const stepName = depStep?.name.toLowerCase() || '';
        const optionName = depOption?.label.toLowerCase() || '';
        return stepName.includes(query) || optionName.includes(query);
    });

    const getRuleTypeBadge = (rule: Rule): RuleTypeBadge => {
        const primaryEffect = rule.effects[0];
        if (!primaryEffect) return 'pricing';
        return getRuleType(primaryEffect);
    };

    const getRuleTypeColor = (type: RuleTypeBadge) => {
        switch (type) {
            case 'pricing': return 'emerald';
            case 'visibility': return 'amber';
            case 'validation': return 'slate';
            default: return 'slate';
        }
    };

    const renderRuleCard = (rule: Rule) => {
        const depStep = service.steps.find(s => s.id === rule.condition.dependsOnStepId);
        const depOption = depStep?.options.find(o => o.id === rule.condition.selectedOptionId);
        const ruleType = getRuleTypeBadge(rule);
        const color = getRuleTypeColor(ruleType);

        const isStepAction = [RuleType.PRICE_MULTIPLIER, RuleType.STEP_HIDE, RuleType.STEP_SHOW].includes(rule.effects[0]?.type);
        
        let targetName = 'Select Target';
        
        if (isStepAction) {
            const targetStep = service.steps.find(s => s.id === rule.effects[0]?.targetStepId);
            targetName = targetStep?.name || 'Select Target';
        } else {
            const targetOptionId = rule.effects[0]?.targetOptionId || rule.effects[0]?.targetOptionIds?.[0];
            if (targetOptionId) {
                const targetStepWithOption = service.steps.find(s => s.options.some(o => o.id === targetOptionId));
                const targetOption = targetStepWithOption?.options.find(o => o.id === targetOptionId);
                if (targetStepWithOption && targetOption) {
                    targetName = `${targetStepWithOption.name}: ${targetOption.label}`;
                }
            }
        }

        return (
            <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                <div className="inline-flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 uppercase tracking-wide">When</span>
                    <span>the</span>
                    <span className="font-bold text-blue-600">{depStep?.name || 'Select Step'}</span>
                    <span>is set to</span>
                    <span className="font-bold text-blue-600">{depOption?.label || 'Select Option'}</span>
                </div>
                <div className="mt-2 pl-4 border-l-2 border-slate-100 dark:border-slate-700">
                    <div className="inline-flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-300 border border-blue-600/20 uppercase tracking-wide">Then</span>
                        <span>
                            {rule.effects[0]?.type === RuleType.PRICE_OVERRIDE ? 'apply' : 
                             rule.effects[0]?.type === RuleType.PRICE_MULTIPLIER ? 'multiply' : 
                             rule.effects[0]?.type === RuleType.STEP_HIDE ? 'hide' : 
                             rule.effects[0]?.type === RuleType.STEP_SHOW ? 'show' : 
                             rule.effects[0]?.type === RuleType.DISABLE ? 'disable' : 'enable'}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-1.5 rounded">{targetName}</span>
                        {(rule.effects[0]?.type === RuleType.PRICE_OVERRIDE || rule.effects[0]?.type === RuleType.PRICE_MULTIPLIER) && (
                            <span className="font-mono text-emerald-600 font-bold">
                                {rule.effects[0]?.type === RuleType.PRICE_MULTIPLIER ? `x${rule.effects[0]?.value}` : `$${rule.effects[0]?.value}`}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (service.steps.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-16 bg-slate-50">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-2">No steps defined</h3>
                    <p className="text-slate-500 text-sm">You must create steps and options in the Builder tab before adding logic rules.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="px-8 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-slate-900 dark:text-white text-2xl font-bold mb-1">Logic Rules Engine</h1>
                        <p className="text-slate-500 text-sm">Define conditional logic for pricing, visibility, and configuration.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Filter size={16} />
                            <span className="text-sm font-medium">Filter</span>
                        </button>
                        <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <SlidersHorizontal size={16} />
                            <span className="text-sm font-medium">Sort</span>
                        </button>
                    </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search rules..."
                        className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Rules List */}
            <div className="px-8 pb-8 pt-4 flex flex-col gap-4">
                {filteredRules.length === 0 && !searchQuery && (
                    <div className="text-center py-12 text-slate-400">
                        <Zap size={40} className="mx-auto mb-3 text-slate-300" />
                        <p>No rules created yet. Add your first rule to get started.</p>
                    </div>
                )}

                {filteredRules.map((rule) => {
                    const ruleType = getRuleTypeBadge(rule);
                    const color = getRuleTypeColor(ruleType);

                    return (
                        <div
                            key={rule.id}
                            onClick={() => setSelectedRuleId(rule.id)}
                            className={`group relative flex flex-col gap-3 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-${color}-500 ${
                                selectedRuleId === rule.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider text-${color}-600 dark:text-${color}-400 bg-${color}-50 dark:bg-${color}-900/30 px-2 py-0.5 rounded`}>
                                        {ruleType === 'pricing' ? 'Pricing' : ruleType === 'visibility' ? 'Visibility' : 'Validation'} Rule
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">Just now</span>
                                </div>
                                <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 ${selectedRuleId === rule.id ? 'opacity-100' : ''}`}>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openEditModal(rule); }}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeRule(rule.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            {renderRuleCard(rule)}
                        </div>
                    );
                })}

                {/* Add New Rule Button */}
                <button
                    onClick={openAddModal}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                >
                    <Plus className="group-hover:scale-110 transition-transform" size={20} />
                    Create New Rule
                </button>
            </div>

            {/* Add/Edit Rule Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={modalMode === 'add' ? 'Create New Rule' : 'Edit Rule'}
                maxWidth="max-w-lg"
            >
                <div className="space-y-5 p-2">
                    {/* Condition Section */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">When (Condition)</label>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1.5 block">Step</label>
                                <CustomSelect
                                    value={formData.dependsOnStepId}
                                    options={stepOptions}
                                    onChange={(val) => {
                                        const step = service.steps.find(s => s.id === val);
                                        setFormData({ 
                                            ...formData, 
                                            dependsOnStepId: val, 
                                            selectedOptionId: step?.options[0]?.id || '' 
                                        });
                                    }}
                                    placeholder="Select step..."
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1.5 block">Option</label>
                                <CustomSelect
                                    value={formData.selectedOptionId}
                                    options={getStepOptions(formData.dependsOnStepId)}
                                    onChange={(val) => setFormData({ ...formData, selectedOptionId: val })}
                                    placeholder="Select option..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Effect Section */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">Then (Action)</label>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1.5 block">Action</label>
                                <CustomSelect
                                    value={formData.effectType}
                                    options={[
                                        { value: RuleType.PRICE_OVERRIDE, label: 'Set Price' },
                                        { value: RuleType.PRICE_MULTIPLIER, label: 'Multiply Cost' },
                                        { value: RuleType.STEP_HIDE, label: 'Hide Step' },
                                        { value: RuleType.STEP_SHOW, label: 'Show Step' },
                                        { value: RuleType.DISABLE, label: 'Disable Option' },
                                        { value: RuleType.ENABLE, label: 'Enable Option' }
                                    ]}
                                    onChange={(val) => setFormData({ ...formData, effectType: val as RuleType, targetStepId: '', targetOptionId: '' })}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 mb-1.5 block">
                                    {[RuleType.PRICE_MULTIPLIER, RuleType.STEP_HIDE, RuleType.STEP_SHOW].includes(formData.effectType) ? 'Target Step' : 'Target Option'}
                                </label>
                                {[RuleType.PRICE_MULTIPLIER, RuleType.STEP_HIDE, RuleType.STEP_SHOW].includes(formData.effectType) ? (
                                    <CustomSelect
                                        value={formData.targetStepId}
                                        options={getTargetStepOptions()}
                                        onChange={(val) => setFormData({ ...formData, targetStepId: val })}
                                        placeholder="Select step..."
                                    />
                                ) : (
                                    <CustomSelect
                                        value={formData.targetOptionId}
                                        options={getTargetOptionOptions()}
                                        onChange={(val) => setFormData({ ...formData, targetOptionId: val })}
                                        placeholder="Select option..."
                                    />
                                )}
                            </div>
                        </div>
                        {(formData.effectType === RuleType.PRICE_OVERRIDE || formData.effectType === RuleType.PRICE_MULTIPLIER) && (
                            <div className="mt-3">
                                <label className="text-xs text-slate-500 mb-1.5 block">Value</label>
                                <div className="flex items-center gap-2">
                                    {formData.effectType === RuleType.PRICE_MULTIPLIER && (
                                        <span className="text-slate-500 font-medium">x</span>
                                    )}
                                    <Input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                                        className="font-mono"
                                        placeholder={formData.effectType === RuleType.PRICE_MULTIPLIER ? "1.5" : "0"}
                                    />
                                    {formData.effectType === RuleType.PRICE_OVERRIDE && (
                                        <span className="text-slate-500">$</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveRule}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {modalMode === 'add' ? 'Create Rule' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
