import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    label: string;
    value: string;
}

export interface SelectGroup {
    label: string;
    options: SelectOption[];
}

interface CustomSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: (SelectOption | SelectGroup)[];
    placeholder?: string;
    className?: string;
    variant?: 'standard' | 'icon';
    triggerIcon?: React.ReactNode;
    size?: 'default' | 'sm';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder = "Select an option",
    className = "",
    variant = 'standard',
    triggerIcon,
    size = 'default'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                const dropdownEl = document.getElementById('custom-select-dropdown');
                if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            }
        };

        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const width = variant === 'icon' ? 240 : rect.width;
            const dropdownHeight = 300; // Estimated max height
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            let top = rect.bottom + window.scrollY + 8;
            let left = rect.left + window.scrollX;

            // If not enough space below AND more space above, open upwards
            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                top = rect.top + window.scrollY - dropdownHeight - 8;
            }

            if (variant === 'icon') {
                if (left + width > window.innerWidth) {
                    left = (rect.right + window.scrollX) - width;
                }
            }

            setDropdownPosition({
                top: top,
                left: left,
                width: width
            });
        }
    }, [isOpen, variant]);

    const findLabel = (val: string): string => {
        for (const item of options) {
            if ('options' in item) {
                const found = item.options.find(opt => opt.value === val);
                if (found) return found.label;
            } else {
                if (item.value === val) return item.label;
            }
        }
        return val;
    };

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const selectedLabel = value ? findLabel(value) : placeholder;

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-xs font-semibold mb-2 text-gray-700">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-between w-full
                    bg-white border-2 rounded-lg text-left
                    transition-all duration-200
                    ${size === 'sm' ? 'h-8 px-2 py-1 text-xs font-semibold' : 'h-10 px-3 py-2 text-sm font-medium'}
                    ${isOpen
                        ? 'border-blue-500 ring-2 ring-blue-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }
                    ${variant === 'icon' ? 'w-auto' : ''}
                `}
            >
                <span className={`flex items-center gap-2 ${!value ? 'text-gray-400' : 'text-gray-900'}`}>
                    {triggerIcon && <span className="shrink-0">{triggerIcon}</span>}
                    <span className="truncate">{selectedLabel}</span>
                </span>
                <ChevronDown
                    size={16}
                    className={`ml-2 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* Dropdown Portal */}
            {isOpen && createPortal(
                <div
                    id="custom-select-dropdown"
                    className="fixed z-50 bg-white border-2 border-gray-200 rounded-lg shadow-xl overflow-hidden"
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                        maxHeight: '300px'
                    }}
                >
                    <div className="overflow-y-auto max-h-[300px] py-1">
                        {options.map((item, idx) => {
                            if ('options' in item) {
                                // Group
                                return (
                                    <div key={idx}>
                                        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500 bg-gray-50">
                                            {item.label}
                                        </div>
                                        {item.options.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleSelect(opt.value)}
                                                className={`
                                                    w-full px-3 py-2 text-sm text-left flex items-center justify-between
                                                    transition-colors duration-150
                                                    ${value === opt.value
                                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                <span>{opt.label}</span>
                                                {value === opt.value && (
                                                    <Check size={16} className="text-blue-600" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                );
                            } else {
                                // Single Option
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => handleSelect(item.value)}
                                        className={`
                                            w-full px-3 py-2 text-sm text-left flex items-center justify-between
                                            transition-colors duration-150
                                            ${value === item.value
                                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <span>{item.label}</span>
                                        {value === item.value && (
                                            <Check size={16} className="text-blue-600" />
                                        )}
                                    </button>
                                );
                            }
                        })}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
