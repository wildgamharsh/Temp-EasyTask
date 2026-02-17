
import { Service, PricingMode, ConfigStep, Rule, RuleType, StepSelectionType, StepDisplayStyle } from "@/types/pricing";

export const WEDDING_SAMPLE_CONFIG: Service = {
    id: "", // Will be assigned on creation
    name: "Wedding Floral & Decor Application",
    description: "Luxurious, personalized wedding decor planning by Sweetie.",
    pricingMode: PricingMode.CONFIGURED,
    basePrice: 1000,
    metadata: {
        author: "Sweetie",
        theme: "Luxury"
    },
    steps: [
        // 1. The Vibe & Foundation
        {
            id: "step-1-theme",
            serviceId: "",
            name: "The Aesthetic",
            order: 0,
            required: true,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-image" as StepDisplayStyle,
            options: [
                {
                    id: "opt-theme-royal",
                    stepId: "step-1-theme",
                    label: "Royal Heritage",
                    description: "Timeless elegance with rich textures and gold accents.",
                    baseDelta: 2000,
                    image: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=300"
                },
                {
                    id: "opt-theme-modern",
                    stepId: "step-1-theme",
                    label: "Modern Minimalist",
                    description: "Clean lines, monochromatic palettes, and understated luxury.",
                    baseDelta: 1500,
                    image: "https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&q=80&w=300"
                },
                {
                    id: "opt-theme-enchanted",
                    stepId: "step-1-theme",
                    label: "Enchanted Forest",
                    description: "Whimsical greenery, fairy lights, and nature-inspired decor.",
                    baseDelta: 1800,
                    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=300"
                },
                {
                    id: "opt-theme-boho",
                    stepId: "step-1-theme",
                    label: "Bohemian Chic",
                    description: "Pampas grass, warm tones, and relaxed vibes.",
                    baseDelta: 1600,
                    image: "https://images.unsplash.com/photo-1507504031981-8237c37e10f3?auto=format&fit=crop&q=80&w=300"
                }
            ]
        },
        {
            id: "step-1-palette",
            serviceId: "",
            name: "Color Palette",
            order: 1,
            required: true,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-color" as StepDisplayStyle,
            options: [
                {
                    id: "opt-pal-rose-sage",
                    stepId: "step-1-palette",
                    label: "Dusty Rose & Sage",
                    baseDelta: 0,
                    colorHex: "#b78a8a" // Dusty Rose-ish
                },
                {
                    id: "opt-pal-midnight",
                    stepId: "step-1-palette",
                    label: "Midnight Gold",
                    baseDelta: 200,
                    colorHex: "#daa520" // Goldenrod
                },
                {
                    id: "opt-pal-ivory-green",
                    stepId: "step-1-palette",
                    label: "Ivory & Forest Green",
                    baseDelta: 0,
                    colorHex: "#228b22" // Forest Green
                },
                {
                    id: "opt-pal-terracotta",
                    stepId: "step-1-palette",
                    label: "Terracotta & Blush",
                    baseDelta: 0,
                    colorHex: "#e2725b" // Terracotta
                }
            ]
        },

        // 2. Floral Deep-Dive
        {
            id: "step-2-material",
            serviceId: "",
            name: "Floral Material",
            order: 2,
            required: true,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-standard" as StepDisplayStyle,
            options: [
                {
                    id: "opt-mat-natural",
                    stepId: "step-2-material",
                    label: "Natural Blooms",
                    description: "High-end, scented, premium fresh flowers.",
                    baseDelta: 3000
                },
                {
                    id: "opt-mat-silk",
                    stepId: "step-2-material",
                    label: "Premium Silk (Artificial)",
                    description: "Sustainable, heat-resistant, and budget-friendly.",
                    baseDelta: 1000
                }
            ]
        },
        {
            id: "step-2-density",
            serviceId: "",
            name: "Floral Density",
            order: 3,
            required: true,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-icon" as StepDisplayStyle,
            options: [
                {
                    id: "opt-dens-lush",
                    stepId: "step-2-density",
                    label: "Lush & Lavish",
                    description: "Flowers covering walls, ceilings, and every surface.",
                    baseDelta: 5000
                },
                {
                    id: "opt-dens-accent",
                    stepId: "step-2-density",
                    label: "Accented Elegance",
                    description: "Clean lines with strategic floral pops.",
                    baseDelta: 1500
                }
            ]
        },
        // Specific Varieties - Hidden by default, shown via rules based on Theme
        {
            id: "step-2-var-royal",
            serviceId: "",
            name: "Royal Varieties",
            order: 4,
            required: false,
            selectionType: "multi" as StepSelectionType,
            displayStyle: "list-toggle" as StepDisplayStyle,
            options: [
                { id: "opt-var-royal-roses", stepId: "step-2-var-royal", label: "imported Red Roses", baseDelta: 500 },
                { id: "opt-var-royal-orchids", stepId: "step-2-var-royal", label: "Cascading Orchids", baseDelta: 800 },
                { id: "opt-var-royal-lilies", stepId: "step-2-var-royal", label: "Calla Lilies", baseDelta: 400 }
            ]
        },
        {
            id: "step-2-var-boho",
            serviceId: "",
            name: "Boho Varieties",
            order: 4, // Same order/slot, conceptually
            required: false,
            selectionType: "multi" as StepSelectionType,
            displayStyle: "list-toggle" as StepDisplayStyle,
            options: [
                { id: "opt-var-boho-pampas", stepId: "step-2-var-boho", label: "Pampas Grass", baseDelta: 300 },
                { id: "opt-var-boho-protea", stepId: "step-2-var-boho", label: "King Protea", baseDelta: 600 },
                { id: "opt-var-boho-dried", stepId: "step-2-var-boho", label: "Dried Palm Leaves", baseDelta: 250 }
            ]
        },

        // 3. Customization Layer (Add-Ons)
        {
            id: "step-3-addons",
            serviceId: "",
            name: "Luxury Add-Ons",
            order: 5,
            required: false,
            selectionType: "multi" as StepSelectionType,
            displayStyle: "card-compact" as StepDisplayStyle,
            options: [
                {
                    id: "opt-add-scent",
                    stepId: "step-3-addons",
                    label: "Scent Mapping",
                    description: "Signature fragrance piped into the venue.",
                    baseDelta: 750
                },
                {
                    id: "opt-add-lighting",
                    stepId: "step-3-addons",
                    label: "Integrated Lighting",
                    description: "Pin-spots, fairy lights, and uplighting.",
                    baseDelta: 1200
                },
                {
                    id: "opt-add-arch",
                    stepId: "step-3-addons",
                    label: "Ceremonial Arch",
                    description: "Floral archway for the ceremony.",
                    baseDelta: 950
                }
            ]
        }
    ],
    rules: [
        // Rule: Show Royal Varieties ONLY if Theme is Royal Heritage
        {
            id: "rule-show-royal",
            serviceId: "",
            condition: {
                dependsOnStepId: "step-1-theme",
                selectedOptionId: "opt-theme-royal"
            },
            effects: [
                {
                    type: RuleType.STEP_SHOW,
                    targetStepId: "step-2-var-royal"
                },
                {
                    type: RuleType.STEP_HIDE, // Ensure others are hidden (simplified logic for demo)
                    targetStepId: "step-2-var-boho"
                }
            ]
        },
        // Rule: Show Boho Varieties ONLY if Theme is Bohemian Chic
        {
            id: "rule-show-boho",
            serviceId: "",
            condition: {
                dependsOnStepId: "step-1-theme",
                selectedOptionId: "opt-theme-boho"
            },
            effects: [
                {
                    type: RuleType.STEP_SHOW,
                    targetStepId: "step-2-var-boho"
                },
                {
                    type: RuleType.STEP_HIDE,
                    targetStepId: "step-2-var-royal"
                }
            ]
        },
        // Rule: Hide specific varieties for other themes (Modern/Enchanted) - simplified for demo
        {
            id: "rule-hide-vars-modern",
            serviceId: "",
            condition: {
                dependsOnStepId: "step-1-theme",
                selectedOptionId: "opt-theme-modern"
            },
            effects: [
                { type: RuleType.STEP_HIDE, targetStepId: "step-2-var-royal" },
                { type: RuleType.STEP_HIDE, targetStepId: "step-2-var-boho" }
            ]
        },
        {
            id: "rule-hide-vars-enchanted",
            serviceId: "",
            condition: {
                dependsOnStepId: "step-1-theme",
                selectedOptionId: "opt-theme-enchanted"
            },
            effects: [
                { type: RuleType.STEP_HIDE, targetStepId: "step-2-var-royal" },
                { type: RuleType.STEP_HIDE, targetStepId: "step-2-var-boho" }
            ]
        },
        // Rule: If "Lush" density, multiply material cost? (Complex logic, maybe just add visuals for now)
    ]
};
