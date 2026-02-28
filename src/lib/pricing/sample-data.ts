
import { Service, PricingMode, ConfigStep, StepSelectionType, StepDisplayStyle } from "@/types/pricing";

export const WEDDING_SAMPLE_CONFIG: Service = {
    id: "",
    name: "Wedding Decoration Package",
    description: "Choose your perfect wedding decoration package with optional add-ons.",
    pricingMode: PricingMode.CONFIGURED,
    basePrice: 0,
    steps: [
        {
            id: "step-packages",
            serviceId: "",
            name: "Select Package",
            order: 0,
            required: true,
            selectionType: "single" as StepSelectionType,
            displayStyle: "card-image" as StepDisplayStyle,
            description: "Choose your decoration package",
            options: [
                {
                    id: "pkg-basic",
                    stepId: "step-packages",
                    label: "Basic Package",
                    description: "Essential decorations for a beautiful wedding.",
                    baseDelta: 15000,
                    image: "https://img.pikbest.com/photo/20241215/luxury-wedding-stage-decor-with-pink-flowers-and-red-carpet_11258184.jpg!sw800"
                },
                {
                    id: "pkg-standard",
                    stepId: "step-packages",
                    label: "Standard Package",
                    description: "Complete decoration with premium elements.",
                    baseDelta: 25000,
                    image: "https://static.vecteezy.com/system/resources/previews/018/740/503/non_2x/beautiful-wedding-stage-for-groom-and-bride-photo.jpg"
                },
                {
                    id: "pkg-premium",
                    stepId: "step-packages",
                    label: "Premium Package",
                    description: "Luxury decoration with extra floral arrangements.",
                    baseDelta: 40000,
                    image: "https://media.gettyimages.com/id/1445272650/video/luxury-dinner-table-in-a-wedding-invitation-wedding-decoration-wedding-dinner-table-wedding.jpg?s=640x640&k=20&c=n85Uphj0dw3xDDoKkthbSqoejb3Gbc-R3pqsw6_P3yc="
                }
            ]
        },
        {
            id: "step-addons",
            serviceId: "",
            name: "Add-Ons",
            order: 1,
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
                    label: "Extra Floral Arch",
                    description: "Additional decorative arch at venue entrance.",
                    baseDelta: 3000
                }
            ]
        }
    ],
    rules: []
};
