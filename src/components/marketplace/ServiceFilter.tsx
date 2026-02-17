"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export type FilterState = {
    search: string;
    organizerId: string | "all";
    pricingType: string | "all"; // "fixed" | "packages" | "per_person"
    hasAddons: boolean;
    minPrice: number;
    maxPrice: number;
};

interface ServiceFilterProps {
    onFilterChange: (filters: FilterState) => void;
    organizers: { id: string; name: string }[];
}

export function ServiceFilter({ onFilterChange, organizers }: ServiceFilterProps) {
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        organizerId: "all",
        pricingType: "all",
        hasAddons: false,
        minPrice: 0,
        maxPrice: 5000,
    });

    const [priceRange, setPriceRange] = useState([0, 5000]);

    // Debounce filter updates to parent
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({
                ...filters,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [filters, priceRange, onFilterChange]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev) => ({ ...prev, search: e.target.value }));
    };

    const clearFilters = () => {
        const reset = {
            search: "",
            organizerId: "all",
            pricingType: "all",
            hasAddons: false,
            minPrice: 0,
            maxPrice: 5000,
        };
        setFilters(reset);
        setPriceRange([0, 5000]);
        onFilterChange(reset);
    };

    const activeFilterCount = [
        filters.organizerId !== "all",
        filters.pricingType !== "all",
        filters.hasAddons,
        priceRange[0] > 0 || priceRange[1] < 5000
    ].filter(Boolean).length;

    return (
        <div className="w-full space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search for services..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="pl-10 h-12 text-base rounded-full shadow-sm border-slate-200 focus-visible:ring-primary"
                />
            </div>

            {/* Desktop Filters Bar */}
            <div className="hidden lg:flex items-center gap-4 flex-wrap">
                <Select
                    value={filters.organizerId}
                    onValueChange={(val) => setFilters((prev) => ({ ...prev, organizerId: val }))}
                >
                    <SelectTrigger className="w-[200px] rounded-full border-slate-200">
                        <SelectValue placeholder="Organizer" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Organizers</SelectItem>
                        {organizers.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                                {org.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.pricingType}
                    onValueChange={(val) => setFilters((prev) => ({ ...prev, pricingType: val }))}
                >
                    <SelectTrigger className="w-[180px] rounded-full border-slate-200">
                        <SelectValue placeholder="Pricing Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="packages">Packages</SelectItem>
                        <SelectItem value="per_person">Per Person</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-full">
                    <Checkbox
                        id="has-addons"
                        checked={filters.hasAddons}
                        onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, hasAddons: checked === true }))}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="has-addons" className="text-sm font-medium cursor-pointer">Has Add-ons</Label>
                </div>

                {/* Price Range Popover/Dropdown simulation or simple display */}
                <div className="flex items-center gap-4 px-4 py-2 bg-white border border-slate-200 rounded-full min-w-[250px]">
                    <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Price:</span>
                    <Slider
                        value={priceRange}
                        min={0}
                        max={5000}
                        step={100}
                        onValueChange={setPriceRange}
                        className="w-full"
                    />
                    <div className="text-xs font-medium whitespace-nowrap text-slate-700">
                        ${priceRange[0]} - ${priceRange[1]}+
                    </div>
                </div>

                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-red-500"
                    >
                        Clear all
                    </Button>
                )}
            </div>

            {/* Mobile Filters Sheet */}
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full gap-2 rounded-full">
                            <Filter className="h-4 w-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="rounded-full h-5 w-5 p-0 flex items-center justify-center bg-primary/10 text-primary">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Filter Services</SheetTitle>
                            <SheetDescription>
                                Refine your search to find the perfect service.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-6">
                            <div className="space-y-2">
                                <Label>Pricing Type</Label>
                                <Select
                                    value={filters.pricingType}
                                    onValueChange={(val) => setFilters((prev) => ({ ...prev, pricingType: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Type</SelectItem>
                                        <SelectItem value="fixed">Fixed Price</SelectItem>
                                        <SelectItem value="packages">Packages</SelectItem>
                                        <SelectItem value="per_person">Per Person</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label>Price Range</Label>
                                    <span className="text-sm text-muted-foreground">${priceRange[0]} - ${priceRange[1]}+</span>
                                </div>
                                <Slider
                                    value={priceRange}
                                    min={0}
                                    max={5000}
                                    step={100}
                                    onValueChange={setPriceRange}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="mobile-addons"
                                    checked={filters.hasAddons}
                                    onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, hasAddons: checked === true }))}
                                />
                                <Label htmlFor="mobile-addons">Has Add-ons available</Label>
                            </div>

                            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => document.body.click()}>
                                Show Results
                            </Button>

                            <Button variant="outline" className="w-full" onClick={clearFilters}>
                                Reset Filters
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
