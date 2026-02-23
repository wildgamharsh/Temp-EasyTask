-- Add locations_covered field to organizers table
ALTER TABLE "public"."organizers" ADD COLUMN "locations_covered" jsonb DEFAULT '[]'::jsonb;

-- Add location field to bookings table
ALTER TABLE "public"."bookings" ADD COLUMN "location" text;

-- Add location field to draft_bookings table (for consistency)
ALTER TABLE "public"."draft_bookings" ADD COLUMN "location" text;

-- Enable RLS on new columns (existing policies will cover them)
