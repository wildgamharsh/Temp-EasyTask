
import { Service, PricingMode, ConfigStep, Rule, RuleType, StepSelectionType, StepDisplayStyle } from "@/types/pricing";

export const WEDDING_SAMPLE_CONFIG: Service = {
    id: "",
    name: "Premium Wedding Decoration",
    description: "Transform your special day into a magical celebration with our comprehensive wedding decoration packages. From elegant themes to exquisite catering and bar services.",
    pricingMode: PricingMode.CONFIGURED,
    basePrice: 0,
    metadata: {
        author: "Sweetie",
        theme: "Luxury"
    },
    steps: [
        // ============================================
        // SECTION 1: PACKAGE TIERS (Fixed Selection)
        // ============================================
        {
            id: "step-package-tier",
            serviceId: "",
            name: "Select Your Package",
            order: 0,
            required: true,
            selectionType: "fixed" as StepSelectionType,
            displayStyle: "card-image" as StepDisplayStyle,
            description: "Choose your preferred decoration package tier",
            options: [
                {
                    id: "pkg-basic",
                    stepId: "step-package-tier",
                    label: "Basic Elegance",
                    description: "Essential decorations with elegant simplicity. Includes basic stage, entrance, and standard lighting.",
                    baseDelta: 15000,
                    image: "https://img.pikbest.com/photo/20241215/luxury-wedding-stage-decor-with-pink-flowers-and-red-carpet_11258184.jpg!sw800"
                },
                {
                    id: "pkg-gold",
                    stepId: "step-package-tier",
                    label: "Gold Premium",
                    description: "Enhanced luxury with premium florals, golden accents, and upgraded lighting effects.",
                    baseDelta: 28000,
                    image: "https://static.vecteezy.com/system/resources/previews/018/740/503/non_2x/beautiful-wedding-stage-for-groom-and-bride-photo.jpg"
                },
                {
                    id: "pkg-diamond",
                    stepId: "step-package-tier",
                    label: "Diamond Royal",
                    description: "The ultimate luxury experience with premium draping, imported flowers, crystal decorations, and VIP treatment.",
                    baseDelta: 45000,
                    image: "https://media.gettyimages.com/id/1445272650/video/luxury-dinner-table-in-a-wedding-invitation-wedding-decoration-wedding-dinner-table-wedding.jpg?s=640x640&k=20&c=n85Uphj0dw3xDDoKkthbSqoejb3Gbc-R3pqsw6_P3yc="
                }
            ]
        },

        // ============================================
        // SECTION 2: WEDDING THEMES (5 Themes with Images)
        // ============================================
        {
            id: "step-wedding-theme",
            serviceId: "",
            name: "Wedding Theme",
            order: 1,
            required: true,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-image" as StepDisplayStyle,
            description: "Select your dream wedding theme",
            options: [
                {
                    id: "theme-royal",
                    stepId: "step-wedding-theme",
                    label: "Royal Heritage",
                    description: "Timeless elegance with rich velvets, gold accents, and regal draping.",
                    baseDelta: 5000,
                    image: "https://img.pikbest.com/photo/20241215/luxury-wedding-stage-decor-with-pink-flowers-and-red-carpet_11258184.jpg!sw800"
                },
                {
                    id: "theme-modern",
                    stepId: "step-wedding-theme",
                    label: "Modern Minimalist",
                    description: "Clean lines, contemporary florals, and sleek metallic accents.",
                    baseDelta: 3000,
                    image: "https://static.vecteezy.com/system/resources/previews/018/740/503/non_2x/beautiful-wedding-stage-for-groom-and-bride-photo.jpg"
                },
                {
                    id: "theme-garden",
                    stepId: "step-wedding-theme",
                    label: "Enchanted Garden",
                    description: "Lush greenery, wildflowers, fairy lights, and nature-inspired beauty.",
                    baseDelta: 4000,
                    image: "https://static.vecteezy.com/system/resources/thumbnails/053/808/762/small_2x/wedding-party-decoration-scene-background-free-photo.jpeg"
                },
                {
                    id: "theme-boho",
                    stepId: "step-wedding-theme",
                    label: "Bohemian Chic",
                    description: "Rustic romance with pampas grass, warm earth tones, and relaxed elegance.",
                    baseDelta: 3500,
                    image: "https://media.gettyimages.com/id/1223909090/video/indian-or-hindu-traditional-ceremony-venue-decoration.jpg?s=640x640&k=20&c=Y32M4JB-gbnsZ936iv_xaTvT9viDFjYKOAZoxd1aIKw="
                },
                {
                    id: "theme-blush",
                    stepId: "step-wedding-theme",
                    label: "Blush & Ivory",
                    description: "Soft romantic vibes with blush pink, ivory, and subtle rose gold touches.",
                    baseDelta: 2500,
                    image: "https://assets.architecturaldigest.in/photos/6698dff393565db77b9beb8d/4:3/w_1424,h_1068,c_limit/DSC00522.jpg.jpg"
                }
            ]
        },

        // ============================================
        // SECTION 3: STAGE DECORATION
        // ============================================
        {
            id: "step-stage",
            serviceId: "",
            name: "Stage Decoration",
            order: 2,
            required: true,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-standard" as StepDisplayStyle,
            description: "Design your ceremonial stage",
            options: [
                {
                    id: "stage-floral-backdrop",
                    stepId: "step-stage",
                    label: "Floral Backdrop",
                    description: "Full wall covered with fresh flowers in your chosen palette.",
                    baseDelta: 8000
                },
                {
                    id: "stage-draping",
                    stepId: "step-stage",
                    label: "Premium Draping",
                    description: "Elegant fabric draping with fairy light integration.",
                    baseDelta: 6000
                },
                {
                    id: "stage-mandap",
                    stepId: "step-stage",
                    label: "Traditional Mandap",
                    description: "Classic four-pillar mandap with floral garlands.",
                    baseDelta: 12000
                },
                {
                    id: "stage-arch",
                    stepId: "step-stage",
                    label: "Floral Archway",
                    description: "Circular or rectangular arch covered in flowers.",
                    baseDelta: 7500
                }
            ]
        },

        // ============================================
        // SECTION 4: ENTRANCE GATE
        // ============================================
        {
            id: "step-entrance",
            serviceId: "",
            name: "Entrance Gate",
            order: 3,
            required: false,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-icon" as StepDisplayStyle,
            description: "Welcome your guests in style",
            options: [
                {
                    id: "entrance-floral-arch",
                    stepId: "step-entrance",
                    label: "Floral Arch Entry",
                    description: "Grand entrance with flower-covered arch.",
                    baseDelta: 5000
                },
                {
                    id: "entrance-balloon",
                    stepId: "step-entrance",
                    label: "Balloon Cluster",
                    description: "Colorful balloon arrangements with organic shapes.",
                    baseDelta: 2000
                },
                {
                    id: "entrance-draped",
                    stepId: "step-entrance",
                    label: "Draped Entry",
                    description: "Elegant fabric entrance with lighting effects.",
                    baseDelta: 3500
                },
                {
                    id: "entrance-rustic",
                    stepId: "step-entrance",
                    label: "Rustic Welcome",
                    description: "Wooden signage with floral accents.",
                    baseDelta: 2500
                }
            ]
        },

        // ============================================
        // SECTION 5: LIGHTING
        // ============================================
        {
            id: "step-lighting",
            serviceId: "",
            name: "Lighting Effects",
            order: 4,
            required: false,
            selectionType: "multi" as StepSelectionType,
            displayStyle: "card-compact" as StepDisplayStyle,
            description: "Set the perfect mood with lighting",
            options: [
                {
                    id: "light-uplighting",
                    stepId: "step-lighting",
                    label: "Uplighting",
                    description: "Colored lights highlighting architectural features.",
                    baseDelta: 3000
                },
                {
                    id: "light-fairy",
                    stepId: "step-lighting",
                    label: "Fairy Lights",
                    description: "Twinkling lights throughout the venue.",
                    baseDelta: 2000
                },
                {
                    id: "light-chandelier",
                    stepId: "step-lighting",
                    label: "Chandeliers",
                    description: "Crystal chandeliers for elegant ambiance.",
                    baseDelta: 5000
                },
                {
                    id: "light-spotlight",
                    stepId: "step-lighting",
                    label: "Spotlight Package",
                    description: "Spotlights on stage and key areas.",
                    baseDelta: 2500
                },
                {
                    id: "light-dancefloor",
                    stepId: "step-lighting",
                    label: "Dance Floor Lights",
                    description: "Dynamic dance floor lighting effects.",
                    baseDelta: 3500
                }
            ]
        },

        // ============================================
        // SECTION 6: CENTERPIECES
        // ============================================
        {
            id: "step-centerpieces",
            serviceId: "",
            name: "Table Centerpieces",
            order: 5,
            required: true,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-standard" as StepDisplayStyle,
            description: "Choose your table centerpiece style",
            options: [
                {
                    id: "cp-floral-low",
                    stepId: "step-centerpieces",
                    label: "Low Floral Arrangement",
                    description: "Elegant low arrangements allowing conversation.",
                    baseDelta: 1500
                },
                {
                    id: "cp-floral-tall",
                    stepId: "step-centerpieces",
                    label: "Tall Floral Tower",
                    description: "Dramatic tall arrangements as focal points.",
                    baseDelta: 2500
                },
                {
                    id: "cp-candle",
                    stepId: "step-centerpieces",
                    label: "Candlelight Centerpiece",
                    description: "Romantic candle arrangements with scattered petals.",
                    baseDelta: 1200
                },
                {
                    id: "cp-mixed",
                    stepId: "step-centerpieces",
                    label: "Mixed Element",
                    description: "Combination of flowers, candles, and decorative elements.",
                    baseDelta: 2000
                }
            ]
        },

        // ============================================
        // SECTION 7: BACKDROP STYLES (Image Cards)
        // ============================================
        {
            id: "step-backdrop",
            serviceId: "",
            name: "Photo Booth Backdrop",
            order: 6,
            required: false,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-image" as StepDisplayStyle,
            description: "Create the perfect photo opportunity",
            options: [
                {
                    id: "backdrop-floral-wall",
                    stepId: "step-backdrop",
                    label: "Floral Wall",
                    description: "Full wall of fresh flowers in your palette.",
                    baseDelta: 4000,
                    image: "https://img.pikbest.com/photo/20241215/luxury-wedding-stage-decor-with-pink-flowers-and-red-carpet_11258184.jpg!sw800"
                },
                {
                    id: "backdrop-neon",
                    stepId: "step-backdrop",
                    label: "Neon Sign",
                    description: "Custom neon sign with your names.",
                    baseDelta: 3000,
                    image: "https://static.vecteezy.com/system/resources/previews/018/740/503/non_2x/beautiful-wedding-stage-for-groom-and-bride-photo.jpg"
                },
                {
                    id: "backdrop-drape",
                    stepId: "step-backdrop",
                    label: "Draped Backdrop",
                    description: "Elegant fabric draping with lighting.",
                    baseDelta: 2500,
                    image: "https://static.vecteezy.com/system/resources/thumbnails/053/808/762/small_2x/wedding-party-decoration-scene-background-free-photo.jpeg"
                },
                {
                    id: "backdrop-thematic",
                    stepId: "step-backdrop",
                    label: "Thematic Setup",
                    description: "Custom themed backdrop matching your wedding style.",
                    baseDelta: 5000,
                    image: "https://media.gettyimages.com/id/1223909090/video/indian-or-hindu-traditional-ceremony-venue-decoration.jpg?s=640x640&k=20&c=Y32M4JB-gbnsZ936iv_xaTvT9viDFjYKOAZoxd1aIKw="
                }
            ]
        },

        // ============================================
        // SECTION 8: CATERING - QUANTITY BASED
        // ============================================
        {
            id: "step-catering-style",
            serviceId: "",
            name: "Catering Style",
            order: 7,
            required: true,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-standard" as StepDisplayStyle,
            description: "Select your catering service style",
            options: [
                {
                    id: "cater-buffet",
                    stepId: "step-catering-style",
                    label: "Grand Buffet",
                    description: "Multiple stations with international cuisine.",
                    baseDelta: 0
                },
                {
                    id: "cater-plated",
                    stepId: "step-catering-style",
                    label: "Plated Dinner",
                    description: "Sit-down multi-course meal service.",
                    baseDelta: 5000
                },
                {
                    id: "cater-family",
                    stepId: "step-catering-style",
                    label: "Family Style",
                    description: "Shared platters served at each table.",
                    baseDelta: 3000
                },
                {
                    id: "cater-mix",
                    stepId: "step-catering-style",
                    label: "Mixed Service",
                    description: "Combination of plated and buffet.",
                    baseDelta: 4000
                }
            ]
        },
        {
            id: "step-dining-plates",
            serviceId: "",
            name: "Dining Plates (Per Person)",
            order: 8,
            required: true,
            selectionType: "quantity" as StepSelectionType,
            displayStyle: "card-standard" as StepDisplayStyle,
            description: "Number of guests for dining",
            minQuantity: 50,
            maxQuantity: 500,
            options: [
                {
                    id: "plate-standard",
                    stepId: "step-dining-plates",
                    label: "Standard Menu",
                    description: "Per person rate for standard catering",
                    baseDelta: 150
                },
                {
                    id: "plate-premium",
                    stepId: "step-dining-plates",
                    label: "Premium Menu",
                    description: "Per person rate for premium menu",
                    baseDelta: 225
                },
                {
                    id: "plate-luxury",
                    stepId: "step-dining-plates",
                    label: "Luxury Menu",
                    description: "Per person rate for luxury menu with premium ingredients",
                    baseDelta: 350
                }
            ]
        },

        // ============================================
        // SECTION 9: BAR SERVICES - QUANTITY BASED
        // ============================================
        {
            id: "step-bar-package",
            serviceId: "",
            name: "Bar Package",
            order: 9,
            required: true,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-standard" as StepDisplayStyle,
            description: "Select your bar service package",
            options: [
                {
                    id: "bar-open",
                    stepId: "step-bar-package",
                    label: "Open Bar",
                    description: "Full unlimited bar service throughout the event.",
                    baseDelta: 0
                },
                {
                    id: "bar-cash",
                    stepId: "step-bar-package",
                    label: "Cash Bar",
                    description: "Guests pay for their own drinks.",
                    baseDelta: 0
                },
                {
                    id: "bar-limited",
                    stepId: "step-bar-package",
                    label: "Limited Bar",
                    description: "House wine and beer only, plus signature cocktails.",
                    baseDelta: 5000
                },
                {
                    id: "bar-hybrid",
                    stepId: "step-bar-package",
                    label: "Hybrid Bar",
                    description: "Open bar for first hour, then cash bar.",
                    baseDelta: 8000
                }
            ]
        },
        {
            id: "step-bar-guests",
            serviceId: "",
            name: "Bar Guests (Per Person)",
            order: 10,
            required: true,
            selectionType: "quantity" as StepSelectionType,
            displayStyle: "card-standard" as StepDisplayStyle,
            description: "Number of guests for bar service",
            minQuantity: 25,
            maxQuantity: 500,
            options: [
                {
                    id: "bar-std-perhead",
                    stepId: "step-bar-guests",
                    label: "Standard Bar",
                    description: "Per person rate for house drinks",
                    baseDelta: 45
                },
                {
                    id: "bar-premium-perhead",
                    stepId: "step-bar-guests",
                    label: "Premium Bar",
                    description: "Per person rate for premium spirits",
                    baseDelta: 75
                },
                {
                    id: "bar-topshelf-perhead",
                    stepId: "step-bar-guests",
                    label: "Top Shelf",
                    description: "Per person rate for top shelf liquor",
                    baseDelta: 120
                }
            ]
        },

        // ============================================
        // SECTION 10: ADD-ONS
        // ============================================
        {
            id: "step-addons",
            serviceId: "",
            name: "Premium Add-Ons",
            order: 11,
            required: false,
            selectionType: "multi" as StepSelectionType,
            displayStyle: "card-compact" as StepDisplayStyle,
            description: "Enhance your celebration with extras",
            options: [
                {
                    id: "addon-dj",
                    stepId: "step-addons",
                    label: "Professional DJ",
                    description: "4-hour DJ service with dance floor lighting.",
                    baseDelta: 2500
                },
                {
                    id: "addon-photobooth",
                    stepId: "step-addons",
                    label: "Photo Booth",
                    description: "Instant photo printing with props.",
                    baseDelta: 1500
                },
                {
                    id: "addon-flower-arch",
                    stepId: "step-addons",
                    label: "Extra Floral Arches",
                    description: "Additional decorative arches around venue.",
                    baseDelta: 3500
                },
                {
                    id: "addon-ice sculpture",
                    stepId: "step-addons",
                    label: "Ice Sculpture",
                    description: "Custom ice sculpture for entrance or bar.",
                    baseDelta: 4000
                },
                {
                    id: "addon-vip-lounge",
                    stepId: "step-addons",
                    label: "VIP Lounge Area",
                    description: "Exclusive lounge area for VIP guests.",
                    baseDelta: 6000
                },
                {
                    id: "addon-coordinator",
                    stepId: "step-addons",
                    label: "Event Coordinator",
                    description: "Professional on-site coordination.",
                    baseDelta: 2000
                }
            ]
        },

        // ============================================
        // SECTION 11: FIXED CHARGES
        // ============================================
        {
            id: "step-fixed-charges",
            serviceId: "",
            name: "Event Essentials (Fixed)",
            order: 12,
            required: true,
            selectionType: "fixed" as StepSelectionType,
            displayStyle: "list-toggle" as StepDisplayStyle,
            description: "Mandatory charges for event setup",
            options: [
                {
                    id: "fixed-setup",
                    stepId: "step-fixed-charges",
                    label: "Setup & Teardown",
                    description: "Professional setup and post-event cleanup.",
                    baseDelta: 3500
                },
                {
                    id: "fixed-transport",
                    stepId: "step-fixed-charges",
                    label: "Delivery & Transport",
                    description: "Transportation of all decoration materials.",
                    baseDelta: 2500
                },
                {
                    id: "fixed-staff",
                    stepId: "step-fixed-charges",
                    label: "Event Staff",
                    description: "On-site decorators and setup team (8 hours).",
                    baseDelta: 4000
                }
            ]
        },

        // ============================================
        // SECTION 12: COLOR PALETTE (Optional)
        // ============================================
        {
            id: "step-color-palette",
            serviceId: "",
            name: "Color Palette",
            order: 13,
            required: false,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-color" as StepDisplayStyle,
            description: "Select your preferred color scheme",
            options: [
                {
                    id: "color-blush-gold",
                    stepId: "step-color-palette",
                    label: "Blush & Gold",
                    baseDelta: 0,
                    colorHex: "#f8d7da"
                },
                {
                    id: "color-red-gold",
                    stepId: "step-color-palette",
                    label: "Royal Red & Gold",
                    baseDelta: 0,
                    colorHex: "#dc3545"
                },
                {
                    id: "color-ivory-sage",
                    stepId: "step-color-palette",
                    label: "Ivory & Sage",
                    baseDelta: 0,
                    colorHex: "#e8f5e9"
                },
                {
                    id: "color-purple-gold",
                    stepId: "step-color-palette",
                    label: "Royal Purple & Gold",
                    baseDelta: 500,
                    colorHex: "#6f42c1"
                },
                {
                    id: "color-blue-silver",
                    stepId: "step-color-palette",
                    label: "Navy & Silver",
                    baseDelta: 0,
                    colorHex: "#0d6efd"
                },
                {
                    id: "color-peach-coral",
                    stepId: "step-color-palette",
                    label: "Peach & Coral",
                    baseDelta: 0,
                    colorHex: "#fd7e14"
                }
            ]
        }
    ],
    rules: [
        // Rule: Diamond package shows premium options
        {
            id: "rule-diamond-premium",
            serviceId: "",
            condition: {
                dependsOnStepId: "step-package-tier",
                selectedOptionId: "pkg-diamond"
            },
            effects: [
                {
                    type: RuleType.ENABLE,
                    targetOptionIds: ["cp-floral-tall", "light-chandelier", "backdrop-thematic", "addon-vip-lounge"]
                }
            ]
        },
        // Rule: Basic package hides some premium options
        {
            id: "rule-basic-limits",
            serviceId: "",
            condition: {
                dependsOnStepId: "step-package-tier",
                selectedOptionId: "pkg-basic"
            },
            effects: [
                {
                    type: RuleType.DISABLE,
                    targetOptionIds: ["light-chandelier", "backdrop-neon", "addon-vip-lounge", "addon-ice sculpture"]
                }
            ]
        },
        // Rule: Garden theme shows nature-inspired centerpieces
        {
            id: "rule-garden-centerpiece",
            serviceId: "",
            condition: {
                dependsOnStepId: "step-wedding-theme",
                selectedOptionId: "theme-garden"
            },
            effects: [
                {
                    type: RuleType.PRICE_OVERRIDE,
                    targetOptionId: "cp-floral-low",
                    value: 1200
                }
            ]
        }
    ]
};
