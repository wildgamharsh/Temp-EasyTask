/**
 * Canadian Tax Calculation Utilities
 * Handles GST, HST, PST, and QST calculations using rates from the database
 */

import { TaxRate } from "./database.types";

export type { CanadianProvince } from "./database.types";

export interface TaxBreakdown {
    gst: number;        // Goods and Services Tax
    pst: number;        // Provincial Sales Tax
    hst: number;        // Harmonized Sales Tax
    qst: number;        // Quebec Sales Tax
    total: number;      // Total tax amount
    rate: number;       // Combined tax rate (as decimal, e.g., 0.13 for 13%)
    label: string;      // Display label (e.g., "HST (13% - Ontario)")
    breakdown: string[]; // List of tax components (e.g., ["GST 5%", "PST 7%"])
}

/**
 * Calculate tax for a given amount using a TaxRate object from the database
 * @param amount - The pre-tax amount
 * @param rates - The TaxRate object fetched from the database
 * @returns Tax breakdown with all applicable taxes
 */
export function calculateTaxFromRates(amount: number, rates: TaxRate): TaxBreakdown {
    // Calculate individual tax components
    // Note: Database stores rates as decimals (e.g., 0.05 for 5%)
    const gst = amount * (rates.gst_rate || 0);
    const pst = amount * (rates.pst_rate || 0);
    const hst = amount * (rates.hst_rate || 0);

    // Total tax is sum of all applicable taxes
    const total = gst + pst + hst;

    // Combined rate
    const combinedRate = (rates.gst_rate || 0) + (rates.pst_rate || 0) + (rates.hst_rate || 0);

    // Generate display label and breakdown
    const breakdown: string[] = [];
    if (rates.gst_rate > 0) breakdown.push(`GST ${Math.round(rates.gst_rate * 100)}%`);
    if (rates.pst_rate > 0) breakdown.push(`PST ${Math.round(rates.pst_rate * 100)}%`);
    if (rates.hst_rate > 0) breakdown.push(`HST ${Math.round(rates.hst_rate * 100)}%`);

    let label = "";
    if (rates.hst_rate > 0) {
        label = `HST (${Math.round(rates.hst_rate * 100)}% - ${rates.name})`;
    } else {
        label = breakdown.join(" + ") + ` (${rates.name})`;
    }

    return {
        gst,
        pst,
        hst,
        qst: 0, // QST is usually handled as PST in our DB schema or separate decimal
        total,
        rate: combinedRate,
        label,
        breakdown
    };
}

/**
 * Format currency as CAD
 */
export function formatCAD(amount: number): string {
    return `$${amount.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Legacy compatibility layer (DEPRECATED: Prefer calculateTaxFromRates)
 * Uses hardcoded rates as fallback.
 */
export function calculateTax(amount: number, province: string): any {
    const config = CANADIAN_TAX_RATES[province];
    if (!config) {
        return {
            gst: 0, pst: 0, hst: 0, qst: 0,
            total: 0, rate: 0,
            label: `Tax Not Calculated (${province})`,
            breakdown: [],
            taxAmount: 0 // For some legacy components
        };
    }

    const taxAmount = amount * config.rate;
    return {
        gst: 0, pst: 0, hst: 0, qst: 0,
        total: amount + taxAmount,
        rate: config.rate,
        label: config.name,
        breakdown: config.breakdown,
        taxAmount: taxAmount,
        taxRate: config.rate // For some legacy components
    };
}

/**
 * Get short tax label from a TaxRate object
 */
export function getShortTaxLabelFromRates(rates: TaxRate): string {
    const totalRate = ((rates.gst_rate || 0) + (rates.pst_rate || 0) + (rates.hst_rate || 0)) * 100;

    if (rates.hst_rate > 0) {
        return `HST ${totalRate.toFixed(0)}%`;
    } else if (rates.pst_rate > 1) { // Check for QST which might be high or special
        return `GST+PST ${totalRate.toFixed(1)}%`;
    } else if (rates.pst_rate > 0) {
        return `GST+PST ${totalRate.toFixed(0)}%`;
    } else {
        return `GST ${totalRate.toFixed(0)}%`;
    }
}

/**
 * List of Canadian provinces for UI selection (names)
 */
export const CANADIAN_PROVINCE_NAMES = [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick",
    "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia",
    "Nunavut", "Ontario", "Prince Edward Island", "Quebec",
    "Saskatchewan", "Yukon"
];

// Re-export as legacy name for compatibility
export const CANADIAN_PROVINCES = CANADIAN_PROVINCE_NAMES;

/**
 * List of Canadian province codes for UI selection (codes)
 */
export const CANADIAN_PROVINCE_CODES = [
    "AB", "BC", "MB", "NB", "NL", "NT", "NS", "NU", "ON", "PE", "QC", "SK", "YT"
];

/**
 * Legacy tax rates (HARDCODED - DO NOT USE FOR NEW CODE)
 * Provided for backward compatibility during transition.
 */
export const CANADIAN_TAX_RATES: any = {
    "Alberta": { name: "GST (5%)", rate: 0.05, breakdown: ["GST 5%"] },
    "British Columbia": { name: "GST + PST (12%)", rate: 0.12, breakdown: ["GST 5%", "PST 7%"] },
    "Manitoba": { name: "GST + PST (12%)", rate: 0.12, breakdown: ["GST 5%", "PST 7%"] },
    "New Brunswick": { name: "HST (15%)", rate: 0.15, breakdown: ["HST 15%"] },
    "Newfoundland and Labrador": { name: "HST (15%)", rate: 0.15, breakdown: ["HST 15%"] },
    "Northwest Territories": { name: "GST (5%)", rate: 0.05, breakdown: ["GST 5%"] },
    "Nova Scotia": { name: "HST (15%)", rate: 0.15, breakdown: ["HST 15%"] },
    "Nunavut": { name: "GST (5%)", rate: 0.05, breakdown: ["GST 5%"] },
    "Ontario": { name: "HST (13%)", rate: 0.13, breakdown: ["HST 13%"] },
    "Prince Edward Island": { name: "HST (15%)", rate: 0.15, breakdown: ["HST 15%"] },
    "Quebec": { name: "GST + QST (14.975%)", rate: 0.14975, breakdown: ["GST 5%", "QST 9.975%"] },
    "Saskatchewan": { name: "GST + PST (11%)", rate: 0.11, breakdown: ["GST 5%", "PST 6%"] },
    "Yukon": { name: "GST (5%)", rate: 0.05, breakdown: ["GST 5%"] },
};
