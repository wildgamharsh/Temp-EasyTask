# Pricing Engine & Service Configuration: Technical Specification

This document provides a comprehensive breakdown of the "Services/New" flow and the underlying Dynamic Pricing Engine (CPQ - Configure, Price, Quote). The focus is on functionality, logic, and data structure.

---

## 1. Service Creation Workflow (Page 1: General Details)

The first stage of service creation captures the base identity and marketing attributes of the service. These fields are independent of the pricing logic but provide context for the storefront.

- **Identity**: Title (Internal/Display Name) and a detailed Description.
- **Visuals**: A collection of Gallery Images (URLs) used for the storefront slider.
- **Highlights**: A list of "Features" or "Selling Points" displayed as bullet points.
- **Synchronization**: The Title and Description are automatically synced to the Pricing Engine config to ensure consistency between the service record and the dynamic pricing framework.

---

## 2. Dynamic Pricing Engine (Page 2: Pricing Configuration)

The Pricing Engine is a step-based configuration system that allows for reactive, rule-based pricing instead of static fees. It is composed of five core functional modules:

### A. The Builder (Step Definition)
The system is organized into a linear sequence of **Steps**. Each step represents a decision point for the consumer.

- **Step Types (Interaction Logic)**:
    - **Single**: Radio-button selection (allows exactly one choice).
    - **Multi**: Checkbox selection (allows zero or many choices).
    - **Quantity**: Numeric input (multiplies a unit price by the user-entered value).
    - **Fixed**: Mandatory selection (automatically applied, cannot be unselected).
- **Step Configuration**:
    - **Required Flag**: Forces the user to complete the step before proceeding.
    - **Display Styles**: Technical identifiers that tell the UI how to render the options (e.g., standard cards, compact cards, image-based cards, color swatches, or list toggles).
- **Options**: Each step contains multiple options. Each option has a `baseDelta` (technical field representing the absolute price addition/subtraction for that choice).

### B. Logic Rules (The "If-This-Then-That" Engine)
Rules create dependencies between steps and options. They enable "reactive" forms where choices in one step alter the availability or price of choices in later steps.

- **Condition (The Trigger)**: 
    - `dependsOnStepId`: The step being monitored.
    - `selectedOptionId`: The specific selection that triggers the rule.
- **Effects (The Actions)**:
    - **Enable/Disable**: Makes specific **Options** in other steps selectable or grayed out.
    - **Step Show/Hide**: Controls visibility of entire **Steps** based on previous choices.
    - **Price Override**: Changes the `baseDelta` of a target option to a specific absolute value.
    - **Price Multiplier**: Multiplies the value of a target step or option by a factor (e.g., 1.5x for "Premium" or "Peak Season").

### C. Visual Graph (Dependency Logic)
This is a visual representation of the JSON structure. It treats **Steps** as nodes and **Rules** as directed edges (arrows).
- **Edges**: Lines originate from a specific **Option** and point to the **Step** or **Option** they affect.
- **Color Coding**: Edges are color-coded based on the rule type (e.g., Green for price changes, Blue for availability changes, Orange for visibility changes).
- **Interactivity**: Clicking a node reveals the underlying metadata; clicking a rule (edge) explains the conditional logic connecting the two points.

### D. JSON Source (The Data Model)
The entire configuration is stored as a single, valid JSON object following the [Service](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/types/pricing.ts#90-102) interface. This is the "Source of Truth" transmitted between the database and the storefront.

```json
{
  "id": "srv-123",
  "name": "Service Name",
  "pricingMode": "configured",
  "basePrice": 0,
  "steps": [
    {
      "id": "step-1",
      "name": "Category",
      "selectionType": "single",
      "displayStyle": "card-image",
      "options": [
        { "id": "opt-a", "label": "Option A", "baseDelta": 100 }
      ]
    }
  ],
  "rules": [
    {
      "id": "rule-1",
      "condition": { "dependsOnStepId": "step-1", "selectedOptionId": "opt-a" },
      "effects": [{ "type": "enable", "targetOptionIds": ["opt-b"] }]
    }
  ]
}
```

### E. AI assistant (The Automated Architect)
A prompt-driven interface that translates natural language into the `steps` and `rules` JSON structure.
- **Logic**: It takes a user description (e.g., "Build a wedding service with 3 tiers and catering per person") and sends it to an LLM along with the current configuration schema.
- **Output**: The AI generates a complete JSON framework that can be "Applied" to the builder, instantly populating the steps, options, and complex logic rules.

---

## 3. System Integration

The integration between the Pricing Engine and the Service record follows a "Shadow Configuration" pattern:

1.  **Storage**: The basic service details (title, images) are stored in a standard relational table (`services`).
2.  **Configuration Injection**: Upon publication, the `steps` and `rules` arrays are extracted from the Pricing Engine and saved into a specialized pricing configuration table (or a JSONB column).
3.  **Runtime Execution**:
    - When a customer visits the storefront, the system fetches the JSON configuration.
    - The **Selection State** is tracked as the user moves through steps.
    - After every selection change, the **Logic Engine** re-evaluates all `rules`.
    - It calculates the `finalPrice` by summing the `basePrice` and the `baseDelta` of every active selection, modified by any active `Price Overrides` or `Multipliers`.
    - **Snapshotting**: When added to a cart, the system takes an immutable snapshot of the logic results to prevent price changes if the vendor modifies the service later.
