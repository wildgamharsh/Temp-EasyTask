# Implementation Plan: Storefront Fixes

## Goal Description
The purpose of this plan is to address three core issues in the Storefront:
1. Fix the Google OAuth flow on the Storefront Login Page so that it redirects users to the storefront page instead of the central Zaaro landing page.
2. Standardise the UI for the "Pricing & Customization" section across the platform, specifically replacing the custom design on the Storefront Service Detail Page with the standard design used in the Consumer Preview (Pricing Builder) and Booking Modal.
3. Make the Pricing Framework Options unselectable across all parts of the application as requested.

## User Review Required

> [!IMPORTANT]
> **Clarification needed regarding "unselectable options"**
> The requirement states that pricing framework options should be "unselectable in all the parts". This could be interpreted in two ways:
> 1. **Interaction Disabled (Display Only):** Users cannot click/interact with the options outside of the booking modal (e.g., on the Service Detail Page or Consumer Preview, they just view what's included).
> 2. **Text Selection Disabled:** You don't want the text formatting to highlight blue accidentally when users click quickly (in CSS, `user-select: none`).
> 
> *The plan currently assumes interpretation #1 (Display Only) outside of the active Booking modal workflow (where users must select them to book), alongside #2 for general UX.* 

## Proposed Changes

---

### Storefront Login & Google Auth Flow

#### [MODIFY] [src/app/storefront/[subdomain]/login/page.tsx](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/app/storefront/%5Bsubdomain%5D/login/page.tsx)
- In [handleGoogleLogin()](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/app/storefront/%5Bsubdomain%5D/login/page.tsx#55-92), the query parameters for the OAuth redirect currently dictate: `next: '/'`. 
- **Change:** Update the `next` value to `next: \`/storefront/\${subdomain}\`` to ensure that upon a successful Google login, the user lands back on the target storefront page rather than the global Zaaro landing page.

---

### Pricing Framework UI Standardisation & Selectability

#### [NEW] `src/components/pricing/SharedPricingDisplay.tsx`
- Create a reusable component containing the pricing framework option rendering logic currently found in [DynamicBookingForm.tsx](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/components/marketplace/booking/steps/DynamicBookingForm.tsx) (e.g., the grid layouts for `card-standard`, `card-image`, `card-color`, etc.).
- Add a `readonly: boolean` prop to disable the `onClick / handleSelectionChange` actions for instances where the options should be non-interactive.
- Add `select-none` utility classes to the option wrapper elements to prevent accidental text highlighting across the board.

#### [MODIFY] [src/components/marketplace/booking/steps/DynamicBookingForm.tsx](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/components/marketplace/booking/steps/DynamicBookingForm.tsx)
- Refactor the component to use the new `SharedPricingDisplay` component for rendering the configurable step options, passing down the necessary selection states and handlers.
- `readonly` will be `false` here, since consumers must interact with options to book the service.

#### [MODIFY] [src/app/storefront/[subdomain]/services/[id]/StorefrontServiceDetail.tsx](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/app/storefront/%5Bsubdomain%5D/services/%5Bid%5D/StorefrontServiceDetail.tsx)
- **Issue:** Currently, this page has its own custom, hard-coded UI for rendering the `richService.steps` (lines 395-502), which diverges from the standard design.
- **Change:** Strip out the custom UI mapping. Import and use the `SharedPricingDisplay` component.
- Pass `readonly={true}` to make the options unselectable (display-only) on the service detail page view, driving them to use the checkout modal to make their actual choices.

#### [MODIFY] [src/components/dashboard/pricing/PricingPreview.tsx](file:///home/s-harshveer/Documents/MAIN%20CODEBASES/Zaaro%20%28%20CD%20%29/src/components/dashboard/pricing/PricingPreview.tsx) (and related preview components)
- Replace any hard-coded pricing option layouts with the newly created `SharedPricingDisplay` component.
- Pass `readonly={true}` or apply the same `select-none` configurations to enforce unselectability in the preview environments.

## Verification Plan

### Manual Verification
1. **Google Login Navigation:**
   - Navigate to `/storefront/[subdomain]/login`.
   - Complete Google login.
   - Verify that the redirect lands directly on `/storefront/[subdomain]` rather than `/`.
2. **Pricing Design Standardisation:**
   - Navigate to a Storefront Service Detail Page with configured pricing steps.
   - Verify that the design perfectly matches the UI seen inside the 'Book Now' modal.
3. **Unselectable Options:**
   - On the Storefront Service Detail Page, verify that clicking on options does not select them or trigger interactions, and that text cannot be unintentionally highlighted.
   - On the Booking Modal, confirm that the options *can* be selected appropriately for completing an order.
