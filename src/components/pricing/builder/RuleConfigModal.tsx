import React, { useState, useEffect } from 'react';
import { RuleType } from '@/types/pricing';
import { X, ArrowRight, Save } from 'lucide-react';

interface RuleConfig {
    type: RuleType;
    value?: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: RuleConfig) => void;
    sourceName: string;
    targetName: string;
    targetType: 'step' | 'option';
}

export const RuleConfigModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSave,
    sourceName,
    targetName,
    targetType
}) => {
    const [type, setType] = useState<RuleType>(
        targetType === 'step' ? RuleType.STEP_SHOW : RuleType.ENABLE
    );
    const [value, setValue] = useState<number>(0);

    // Reset default type when target changes
    useEffect(() => {
        if (isOpen) {
            setType(targetType === 'step' ? RuleType.STEP_SHOW : RuleType.ENABLE);
            setValue(0);
        }
    }, [isOpen, targetType]);

    if (!isOpen) return null;

    const availableTypes = targetType === 'step'
        ? [
            { value: RuleType.STEP_SHOW, label: 'Show Question' },
            { value: RuleType.STEP_HIDE, label: 'Hide Question' },
        ]
        : [
            { value: RuleType.ENABLE, label: 'Enable Option' },
            { value: RuleType.DISABLE, label: 'Disable Option' },
            { value: RuleType.PRICE_OVERRIDE, label: 'Set Price To' },
            { value: RuleType.PRICE_MULTIPLIER, label: 'Multiply Price By' },
        ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ type, value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Create Dependency</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Visual Context */}
                    <div className="flex items-center gap-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700">{sourceName}</span>
                        <ArrowRight size={16} className="text-slate-400" />
                        <span className="font-semibold text-slate-700">{targetName}</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Action
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {availableTypes.map(opt => (
                                    <label
                                        key={opt.value}
                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${type === opt.value
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="ruleType"
                                            value={opt.value}
                                            checked={type === opt.value}
                                            onChange={() => setType(opt.value)}
                                            className="hidden"
                                        />
                                        <span className="font-medium text-sm">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {(type === RuleType.PRICE_OVERRIDE || type === RuleType.PRICE_MULTIPLIER) && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                    {type === RuleType.PRICE_OVERRIDE ? 'New Price Amount ($)' : 'Multiplier Factor'}
                                </label>
                                <input
                                    type="number"
                                    step={type === RuleType.PRICE_MULTIPLIER ? "0.1" : "1"}
                                    value={value}
                                    onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-2 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                        >
                            <Save size={16} />
                            Create Rule
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
