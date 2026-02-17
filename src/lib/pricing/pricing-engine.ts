import {
  Service,
  SelectionState,
  PricingResult,
  RuleType,
  PriceBreakdownItem,
  Rule,
  Option,
  QuantityState,
  RuleEffect,
  PricingMode
} from '@/types/pricing';

/**
 * THE PRICING ENGINE
 * 
 * This is the core domain logic. It is pure, deterministic, and 
 * independent of the UI.
 */

// Helper: Check if a rule is active based on current selections
const isRuleActive = (rule: Rule, selections: SelectionState): boolean => {
  const selectedOptions = selections[rule.condition.dependsOnStepId] || [];
  // Rule is active if the condition's option ID is present in the selections array
  return selectedOptions.includes(rule.condition.selectedOptionId);
};

/**
 * Determines if a step should be visible based on active rules.
 * Priority: SHOW > HIDE > Default (Visible)
 */
// Helper to get all effects of a certain type from active rules
const getActiveEffects = (service: Service, selections: SelectionState, type: RuleType): RuleEffect[] => {
  if (!service.rules) return [];

  return service.rules
    .filter(r => r && r.condition && isRuleActive(r, selections))
    .flatMap(r => r.effects || []) // Flatten all effects from active rules
    .filter(e => e && e.type === type);
};

// Helper: Check if an ID is targeted by an effect (supports both singular and plural properties)
const isTargeted = (effect: RuleEffect, optionId?: string, stepId?: string): boolean => {
  if (optionId) {
    if (effect.targetOptionId === optionId) return true;
    if (effect.targetOptionIds && effect.targetOptionIds.includes(optionId)) return true;
  }
  if (stepId) {
    if (effect.targetStepId === stepId) return true;
    if (effect.targetStepIds && effect.targetStepIds.includes(stepId)) return true;
  }
  return false;
};

/**
 * Determines if a step should be visible based on active rules.
 * Priority: SHOW > HIDE > Default (Visible)
 */
export const isStepVisible = (
  service: Service,
  stepId: string,
  selections: SelectionState
): boolean => {
  const activeShowEffects = getActiveEffects(service, selections, RuleType.STEP_SHOW);
  if (activeShowEffects.some(e => isTargeted(e, undefined, stepId))) {
    return true;
  }

  const activeHideEffects = getActiveEffects(service, selections, RuleType.STEP_HIDE);
  if (activeHideEffects.some(e => isTargeted(e, undefined, stepId))) {
    return false;
  }

  return true;
};

/**
 * Calculates the display price for a specific option given the current state.
 */
export const getEffectiveOptionPrice = (
  service: Service,
  option: Option,
  selections: SelectionState
): { price: number; isOverridden: boolean } => {

  const overrideEffects = getActiveEffects(service, selections, RuleType.PRICE_OVERRIDE);
  // Find the last matching override (or first? usually last wins in CSS style logic, but here let's take first found for simplicity or last defined)
  // Let's take the first one found for now.
  const match = overrideEffects.find(e => isTargeted(e, option.id));

  if (match && match.value !== undefined) {
    return { price: match.value, isOverridden: true };
  }

  return { price: option.baseDelta, isOverridden: false };
};

/**
 * Checks if an option is currently disabled by a rule.
 */
export const isOptionDisabled = (
  service: Service,
  optionId: string,
  selections: SelectionState
): boolean => {
  const disableEffects = getActiveEffects(service, selections, RuleType.DISABLE);
  if (disableEffects.some(e => isTargeted(e, optionId))) return true;

  // Conceptually we could have ENABLE rules that override DISABLE, but reqs often imply DISABLE wins or simple toggle.
  // Unless we want ENABLE to revive it. Let's assume DISABLE is a hard block for now unless ENABLE is requested.
  // If specific logic "Enable overrides Disable" is needed, check ENABLE effects here.

  return false;
};

/**
 * The Main Evaluation Function.
 * Follows the "Evaluation Steps" from the requirements strictly.
 */
export const evaluatePrice = (
  service: Service,
  selections: SelectionState,
  globalQuantity: number = 1,
  stepQuantities: QuantityState = {}
): PricingResult => {

  const breakdown: PriceBreakdownItem[] = [];
  const errors: string[] = [];
  // Determine effective base price
  // For configured services, the "starting from" price is display-only. Calculation starts at 0.
  const isConfigured = service.pricingMode === PricingMode.CONFIGURED;
  const effectiveBasePrice = isConfigured ? 0 : (service.basePrice || 0);

  let currentUnitPrice = effectiveBasePrice;

  // 1. Initialize with Base Price
  if (effectiveBasePrice > 0) {
    breakdown.push({
      label: 'Base Price',
      basePrice: effectiveBasePrice,
      finalPrice: effectiveBasePrice,
      type: 'base'
    });
  }

  // 2. Add Base Deltas & 3. Apply Conditional Overrides
  service.steps.sort((a, b) => a.order - b.order).forEach(step => {

    // Check Visibility Rule first
    if (!isStepVisible(service, step.id, selections)) {
      return; // Skip this step entirely if hidden
    }

    const selectedIds = selections[step.id] || [];

    // Validation: Required Step
    if (step.required && selectedIds.length === 0) {
      errors.push(`Step '${step.name}' is required.`);
      return;
    }

    // Iterate through ALL selected options in this step (Multi-select support)
    selectedIds.forEach(selectedOptionId => {
      const option = step.options.find(o => o.id === selectedOptionId);

      if (!option) {
        return;
      }

      // Validation: Disabled Options
      if (isOptionDisabled(service, option.id, selections)) {
        errors.push(`Option '${option.label}' is currently unavailable based on previous choices.`);
      }

      // Calculate Price for this Option
      const { price, isOverridden } = getEffectiveOptionPrice(service, option, selections);

      // --- HANDLE QUANTITY STEPS ---
      let finalOptionPrice = price;
      let stepQuantity = 1;

      if (step.selectionType === 'quantity') {
        // Get user input quantity for this step, default to 1 if missing but selected
        stepQuantity = stepQuantities[step.id] || 0;
        finalOptionPrice = price * stepQuantity;

        // Validate step quantity
        if (stepQuantity <= 0 && step.required) {
          errors.push(`Please enter a valid quantity for '${step.name}'.`);
        }
      }

      // Record logic
      currentUnitPrice += finalOptionPrice;

      breakdown.push({
        label: step.selectionType === 'quantity'
          ? `${step.name}: ${option.label} (${stepQuantity}x)`
          : `${step.name}: ${option.label}`,
        basePrice: option.baseDelta,
        finalPrice: finalOptionPrice,
        type: 'option',
        ruleApplied: isOverridden ? 'Conditional Price Override' : undefined,
        quantity: step.selectionType === 'quantity' ? stepQuantity : undefined
      });
    });
  });

  // 4. Apply Multipliers
  const activeMultiplierEffects = getActiveEffects(service, selections, RuleType.PRICE_MULTIPLIER);

  activeMultiplierEffects.forEach(effect => {
    // Find all target steps for this effect
    const targets: string[] = [];
    if (effect.targetStepId) targets.push(effect.targetStepId);
    if (effect.targetStepIds) targets.push(...effect.targetStepIds);

    targets.forEach(targetStepId => {
      const multiplier = effect.value;
      if (multiplier === undefined) return;

      if (!isStepVisible(service, targetStepId, selections)) {
        return;
      }

      const targetStep = service.steps.find(s => s.id === targetStepId);

      if (targetStep) {
        // Find line items corresponding to the target step
        const lineItems = breakdown.filter(b => b.label.startsWith(`${targetStep.name}:`));

        lineItems.forEach(item => {
          const originalPrice = item.finalPrice;
          const adjustment = (originalPrice * multiplier) - originalPrice;

          currentUnitPrice += adjustment;

          // Update the item reference directly for display
          item.finalPrice = originalPrice * multiplier;
          item.ruleApplied = `Multiplier x${multiplier} (Dependent Rule)`;
        });
      }
    });
  });

  // 5. Validation Constraints
  if (currentUnitPrice < 0) {
    errors.push("Configuration results in negative pricing, which is not allowed.");
  }
  if (globalQuantity <= 0) {
    errors.push("Global quantity must be greater than 0.");
  }

  // 6. Apply Quantity
  const finalTotal = currentUnitPrice * globalQuantity;

  return {
    unitPrice: currentUnitPrice,
    totalPrice: finalTotal,
    breakdown,
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculates the price range (Min/Max) for a service based on its configuration.
 * This is a static analysis heuristic and does not fully emulate complex rule interactions.
 */
export const calculatePriceRange = (
  basePrice: number,
  steps: import('@/types/pricing').ConfigStep[],
  rules: import('@/types/pricing').Rule[] = []
): { minPrice: number; maxPrice: number; hasVariation: boolean } => {
  // Safety check: Ensure steps is an array
  if (!Array.isArray(steps)) {
    console.warn("calculatePriceRange received non-array steps:", steps); // Optional debug
    return { minPrice: basePrice, maxPrice: basePrice, hasVariation: false };
  }

  let minPrice = basePrice;
  let maxPrice = basePrice;
  let hasVariation = false;

  steps.forEach(step => {
    if (step.options.length === 0) return;

    const prices = step.options.map(o => o.baseDelta);
    const stepMinOption = Math.min(...prices);
    const stepMaxOption = Math.max(...prices);
    const stepSumOptions = prices.reduce((sum, p) => sum + p, 0);
    const stepSumPositiveOptions = prices.reduce((sum, p) => sum + (p > 0 ? p : 0), 0);

    // --- MIN PRICE ---
    if (step.required) {
      if (step.selectionType === 'fixed') {
        // Fixed: Assume all options are included
        minPrice += stepSumOptions;
      } else if (step.selectionType === 'quantity') {
        // Quantity: Assume min 1 unit of cheapest option
        minPrice += stepMinOption;
      } else {
        // Single/Multi: Must pick at least one
        // For Multi, cheapest combination is just the single cheapest option
        minPrice += stepMinOption;
      }
    }

    // --- MAX PRICE ---
    if (step.selectionType === 'fixed') {
      // Fixed: You get everything
      maxPrice += stepSumOptions;
    } else if (step.selectionType === 'multi') {
      // Multi: You can pick all positive options
      maxPrice += stepSumPositiveOptions;
    } else if (step.selectionType === 'quantity') {
      // Quantity: Unbounded, but for range estimative use max option (1 unit)
      maxPrice += stepMaxOption;
    } else {
      // Single: Pick most expensive
      maxPrice += stepMaxOption;
    }

    if (prices.some(p => p !== 0) || prices.length > 1) {
      hasVariation = true;
    }
  });

  return { minPrice, maxPrice, hasVariation };
};
