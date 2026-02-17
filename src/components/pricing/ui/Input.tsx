import React, { InputHTMLAttributes, useState } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    size?: 'default' | 'sm';
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    fullWidth = false,
    className = '',
    icon,
    size = 'default',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className={`block text-xs font-semibold mb-2 transition-colors duration-200 ${isFocused
                    ? 'text-blue-600'
                    : error
                        ? 'text-red-500'
                        : 'text-gray-700'
                    }`}>
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                        {icon}
                    </div>
                )}
                <input
                    className={`
                        flex w-full rounded-lg border-2 bg-white px-3 py-2 text-sm
                        transition-all duration-200
                        placeholder:text-gray-400
                        focus:outline-none 
                        disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400
                        ${size === 'sm' ? 'h-8 py-1 text-xs' : 'h-10'}
                        ${icon ? 'pl-10' : ''}
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : isFocused
                                ? 'border-blue-500 ring-2 ring-blue-100'
                                : 'border-gray-200 hover:border-gray-300'
                        }
                        ${fullWidth ? 'w-full' : ''}
                        ${className}
                    `}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};
