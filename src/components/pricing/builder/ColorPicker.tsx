import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
    '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb',
    '#f3f4f6', '#ffffff',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={popoverRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
                <div 
                    className="w-6 h-6 rounded-full border border-slate-200 shrink-0"
                    style={{ backgroundColor: value || '#e2e8f0' }}
                />
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 p-3 bg-white rounded-xl shadow-xl border border-slate-200 min-w-[220px]">
                    <div className="grid grid-cols-6 gap-1.5">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => {
                                    onChange(color);
                                    setIsOpen(false);
                                }}
                                className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                                    value === color ? 'border-slate-800 scale-110' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                            >
                                {value === color && <Check size={12} className="mx-auto text-white drop-shadow-md" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
