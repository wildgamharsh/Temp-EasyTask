import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    group?: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    icon?: React.ReactNode;
}

export const CustomSelect: React.FC<Props> = ({ value, onChange, options, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Group options
    const groupedOptions = options.reduce((acc, opt) => {
        const group = opt.group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(opt);
        return acc;
    }, {} as Record<string, Option[]>);

    const groups = Object.keys(groupedOptions);
    // If only one group and it's 'Other', treat as ungrouped
    const isGrouped = groups.length > 1 || (groups.length === 1 && groups[0] !== 'Other');

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 text-sm bg-white text-slate-900 border-2 border-slate-200 rounded-lg flex items-center justify-between gap-3 transition-all hover:border-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
                <div className="flex items-center gap-2 truncate">
                    {icon && <span className="text-slate-400">{icon}</span>}
                    <span className={`truncate ${!selectedOption ? 'text-slate-400' : ''}`}>
                        {selectedOption ? selectedOption.label : 'Select...'}
                    </span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {isGrouped ? (
                        groups.map(group => (
                            <div key={group} className="py-1">
                                <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50">{group}</div>
                                {groupedOptions[group].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${opt.value === value ? 'bg-indigo-50 text-indigo-900 font-medium' : 'text-slate-700'}`}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {opt.value === value && <Check size={16} className="text-indigo-600" />}
                                    </button>
                                ))}
                            </div>
                        ))
                    ) : (
                        options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${opt.value === value ? 'bg-indigo-50 text-indigo-900 font-medium' : 'text-slate-700'}`}
                            >
                                <span className="truncate">{opt.label}</span>
                                {opt.value === value && <Check size={16} className="text-indigo-600" />}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
