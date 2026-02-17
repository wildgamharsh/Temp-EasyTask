"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search } from "lucide-react";

const CANADIAN_PROVINCES = [
    { name: "Alberta", code: "AB", taxRate: 5 },
    { name: "British Columbia", code: "BC", taxRate: 12 },
    { name: "Manitoba", code: "MB", taxRate: 12 },
    { name: "New Brunswick", code: "NB", taxRate: 15 },
    { name: "Newfoundland and Labrador", code: "NL", taxRate: 15 },
    { name: "Northwest Territories", code: "NT", taxRate: 5 },
    { name: "Nova Scotia", code: "NS", taxRate: 15 },
    { name: "Nunavut", code: "NU", taxRate: 5 },
    { name: "Ontario", code: "ON", taxRate: 13 },
    { name: "Prince Edward Island", code: "PE", taxRate: 15 },
    { name: "Quebec", code: "QC", taxRate: 14.975 },
    { name: "Saskatchewan", code: "SK", taxRate: 11 },
    { name: "Yukon", code: "YT", taxRate: 5 },
];

interface ProvinceDropdownProps {
    value: string;
    onChange: (province: string, taxRate: number) => void;
    label?: string;
    error?: string;
}

export function ProvinceDropdown({ value, onChange, label, error }: ProvinceDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedProvince = CANADIAN_PROVINCES.find(p => p.name === value);

    const filteredProvinces = CANADIAN_PROVINCES.filter(province =>
        province.name.toLowerCase().includes(search.toLowerCase()) ||
        province.code.toLowerCase().includes(search.toLowerCase())
    );

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (province: typeof CANADIAN_PROVINCES[0]) => {
        onChange(province.name, province.taxRate);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className="space-y-1.5" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition-all duration-200",
                        "hover:border-blue-300",
                        "focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/10",
                        error ? "border-red-300" : "border-gray-200",
                        isOpen && "border-blue-500 ring-[3px] ring-blue-500/10"
                    )}
                >
                    <span className={cn(
                        "truncate",
                        !selectedProvince && "text-gray-400"
                    )}>
                        {selectedProvince ? (
                            <span>
                                {selectedProvince.name} <span className="text-gray-400 text-xs">({selectedProvince.taxRate}%)</span>
                            </span>
                        ) : (
                            "Select province..."
                        )}
                    </span>
                    <ChevronDown className={cn(
                        "h-4 w-4 text-gray-400 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Search Input */}
                        <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search provinces..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        {/* Province List */}
                        <div className="max-h-60 overflow-y-auto p-1">
                            {filteredProvinces.length > 0 ? (
                                filteredProvinces.map((province) => {
                                    const isSelected = selectedProvince?.code === province.code;
                                    return (
                                        <button
                                            key={province.code}
                                            type="button"
                                            onClick={() => handleSelect(province)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                                                isSelected
                                                    ? "bg-blue-50 text-blue-700 font-medium"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span>{province.name}</span>
                                                <span className="text-xs text-gray-400">({province.code})</span>
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">{province.taxRate}%</span>
                                                {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                            </span>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-3 py-8 text-center text-sm text-gray-500">
                                    No provinces found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    );
}
