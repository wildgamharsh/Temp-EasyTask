/**
 * CPQ Data Model
 * 
 * This file defines the rigid structure required to support
 * conditional logic, linear steps, and immutable snapshots.
 */

// --- Enums ---

export enum PricingMode {
  FIXED = 'fixed',
  CONFIGURED = 'configured',
  RENTAL = 'rental'
}

export enum RuleType {
  ENABLE = 'enable',
  DISABLE = 'disable',
  PRICE_OVERRIDE = 'priceOverride',
  PRICE_MULTIPLIER = 'priceMultiplier',
  STEP_SHOW = 'stepShow',
  STEP_HIDE = 'stepHide'
}

// 'single' = Radio, 'multi' = Checkbox, 'quantity' = Input * Price, 'fixed' = Mandatory
export type StepSelectionType = 'single' | 'multi' | 'quantity' | 'fixed';

export type StepDisplayStyle =
  | 'card-standard'
  | 'card-compact'
  | 'card-icon'
  | 'card-image'
  | 'card-color'
  | 'card-color-pill'
  | 'list-toggle';

// --- Configuration Definitions ---

export interface Option {
  id: string;
  stepId: string;
  label: string;
  baseDelta: number; // The default price addition
  description?: string;
  image?: string; // URL for the image-based layout
  colorHex?: string; // For color-based selection styles
}

export interface ConfigStep {
  id: string;
  serviceId: string;
  name: string;
  order: number;
  required: boolean;
  selectionType: StepSelectionType; // Determines interaction model (Logic)
  displayStyle: StepDisplayStyle;   // Determines visual layout (UI)
  defaultOptionIds?: string[]; // Array of default IDs
  description?: string;
  minQuantity?: number;
  maxQuantity?: number;
  options: Option[];
}

export interface RuleCondition {
  dependsOnStepId: string;
  selectedOptionId: string; // If this option is selected in the dependent step...
}

export interface RuleEffect {
  type: RuleType;
  // Multi-target support for bulk actions
  targetOptionIds?: string[]; // For Enable/Disable/Override
  targetStepIds?: string[];   // For Multipliers AND Step Visibility

  // Backward compatibility / Single target (optional, can be deprecated or kept for simplicity)
  targetOptionId?: string;
  targetStepId?: string;

  value?: number;          // For Override (absolute price) or Multiplier (factor, e.g. 1.5)
}

export interface Rule {
  id: string;
  serviceId: string;
  condition: RuleCondition;
  // Support for multiple effects per rule
  effects: RuleEffect[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  pricingMode: PricingMode;
  basePrice: number;
  steps: ConfigStep[];
  rules: Rule[];
  // Metadata for storage, added to match existing usage if needed, or keeping strict to reference
  metadata?: any;
  lastModified?: number;
}

// --- Runtime State ---

// Map of Step ID -> Array of Option IDs
export type SelectionState = Record<string, string[]>;

// Map of Step ID -> User Entered Quantity (for 'quantity' type steps)
export type QuantityState = Record<string, number>;

export interface PriceBreakdownItem {
  label: string;
  basePrice: number;
  finalPrice: number;
  ruleApplied?: string; // Description of the rule that altered this
  type: 'base' | 'option' | 'multiplier';
  quantity?: number; // For per-person steps
}

export interface PricingResult {
  totalPrice: number;
  unitPrice: number;
  breakdown: PriceBreakdownItem[];
  isValid: boolean;
  errors: string[];
}

export interface CartItem {
  id: string; // Unique ID for the cart entry
  service: Service; // Reference to the service (for display metadata)

  // IMMUTABLE SNAPSHOT DATA
  // These fields must never be recalculated from the service definition
  // once the item is added to the cart.
  snapshot: {
    selectedPath: SelectionState;
    stepQuantities: QuantityState;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    breakdown: PriceBreakdownItem[];
    calculatedAt: string; // ISO Date
  }
}
