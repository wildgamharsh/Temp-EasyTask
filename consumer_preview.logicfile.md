# Consumer Preview & Pricing Quote Engine: Logic Specification

This document defines the functional mechanics and reactive logic of the **Consumer Preview** section within the service creation flow. It describes how the pricing engine evaluates selections in real-time to generate a Quote.

---

## 1. Runtime State Management
The preview maintains three primary pieces of reactive state that represent the customer's current session:
- **Selection State**: A map of `Step ID` to an array of `Option IDs`. This tracks which specific items are currently "active" or "chosen."
- **Quantity State**: A map of `Step ID` to a `numeric value`. This is specifically used for steps where the user enters a count (e.g., number of guests, hours) rather than just making a binary choice.
- **Global Quantity**: A single multiplier applied to the entire configuration at the end of the calculation.

---

## 2. Real-Time Logic Engine
The core of the preview is the **Evaluation Loop**. Every time a user interacts with a control, the entire engine re-runs to ensure the quote is accurate and the UI reflects current constraints.

### A. Visibility Evaluation (`isStepVisible`)
Before any pricing is calculated, the engine determines which steps are relevant:
1.  **Default State**: All steps are visible by default.
2.  **Explicit Hide**: If an active selection triggers a `STEP_HIDE` rule for a specific step, that step is removed from the DOM and its prices are excluded from the total.
3.  **Explicit Show**: If a `STEP_SHOW` rule is triggered, it ensures the step is visible (overriding potential defaults).

### B. Selection Logic
- **Single/Quantity Steps**: Selecting an option unsets any previously selected option in that step.
- **Multi Steps**: Toggling an option adds or removes it from the array without affecting others.
- **Auto-Fixed**: Steps marked as `fixed` have their options pre-selected and immutable; the user cannot unselect them.

---

## 3. Pricing Calculation Pipeline
The calculation follows a deterministic 6-step pipeline:

1.  **Base Initialization**: The system starts with the service's `basePrice`. For "Configured" service types, this typically starts at $0, with all value derived from the options.
2.  **Option Evaluation**:
    - The engine iterates through every **Visible Step**.
    - For every **Selected Option**, it calculates the `baseDelta` (the price of that option).
    - It checks for **Price Overrides**: If a logic rule targets a selected option with a new value, the rule's value replaces the `baseDelta`.
3.  **Step Scaling**: If the step is a `quantity` type, the option's value is multiplied by the user's input from the **Quantity State**.
4.  **Global Multipliers**: The engine checks for `PRICE_MULTIPLIER` rules. These look for active conditions and apply a factor (e.g., 1.5x) to the subtotal of specific target steps.
5.  **Validation Check**:
    - **Completeness**: Checks if all `required` steps have at least one selection.
    - **Availability**: Checks if any selected option has been "disabled" by a logic rule triggered by a previous choice.
    - **Sanity**: Ensures the total price hasn't dipped below zero due to negative deltas.
6.  **Final Totaling**: The resulting `unitPrice` is multiplied by the **Global Quantity** to produce the `totalPrice`.

---

## 4. Initialization & Reset Logic
- **Default Application**: When the preview loads or is reset, the system scans for `defaultOptionIds`. 
- **Requirement Fill**: If a step is `required` and has no default, the system remains in an "Invalid" state until the user interacts with it.
- **Shadow Copying**: The preview creates a local copy of the service definition to allow the user to simulate changes without committing them to the permanent service record.
