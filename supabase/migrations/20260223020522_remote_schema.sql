


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."admin_role" AS ENUM (
    'super_admin',
    'support',
    'moderator'
);


ALTER TYPE "public"."admin_role" OWNER TO "postgres";


CREATE TYPE "public"."booking_status" AS ENUM (
    'pending',
    'confirmed',
    'rejected',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."booking_status" OWNER TO "postgres";


CREATE TYPE "public"."discount_scope" AS ENUM (
    'global',
    'service_specific',
    'category_specific'
);


ALTER TYPE "public"."discount_scope" OWNER TO "postgres";


CREATE TYPE "public"."discount_type" AS ENUM (
    'percentage',
    'flat_amount',
    'percentage_capped',
    'free_service'
);


ALTER TYPE "public"."discount_type" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'paid',
    'refunded'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."pricing_mode" AS ENUM (
    'fixed',
    'configured',
    'quote',
    'rental'
);


ALTER TYPE "public"."pricing_mode" OWNER TO "postgres";


CREATE TYPE "public"."template_category" AS ENUM (
    'variant-claude-sonnet-4'
);


ALTER TYPE "public"."template_category" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'customer',
    'organizer',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_role user_role;
  v_organizer_id uuid;
  v_platform_origin text;
  v_raw_meta jsonb;
BEGIN
  v_raw_meta := COALESCE(new.raw_user_meta_data, '{}'::jsonb);
  v_platform_origin := v_raw_meta->>'platform_origin';
  
  -- Determine role STRICTLY
  IF v_platform_origin = 'platform' THEN
      v_role := 'organizer';
  ELSIF v_platform_origin = 'storefront' THEN
      v_role := 'customer';
  ELSE
      -- Fallback: Use 'role' metadata if present, BUT DO NOT DEFAULT TO CUSTOMER if missing
      BEGIN
        IF (v_raw_meta->>'role') IS NOT NULL THEN
            v_role := (v_raw_meta->>'role')::public.user_role;
        ELSE
            v_role := NULL; -- Explicitly NULL
        END IF;
      EXCEPTION WHEN OTHERS THEN
        v_role := NULL; -- Error means undefined
      END;
  END IF;

  -- === ORGANIZER CREATION ===
  IF v_role = 'organizer' THEN
    INSERT INTO public.organizers (id, email, name, phone)
    VALUES (
      new.id,
      new.email,
      COALESCE(v_raw_meta->>'full_name', v_raw_meta->>'name', new.email),
      v_raw_meta->>'phone'
    )
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, organizers.name);

  -- === CUSTOMER CREATION ===
  ELSIF v_role = 'customer' THEN
    -- Extract organizer_id safely
    BEGIN
        IF (v_raw_meta->>'organizer_id') IS NOT NULL AND (v_raw_meta->>'organizer_id') <> '' THEN
            v_organizer_id := (v_raw_meta->>'organizer_id')::uuid;
        ELSE
            v_organizer_id := NULL;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_organizer_id := NULL;
    END;
    
    -- Insert Customer
    INSERT INTO public.customers (id, email, name, organizer_id, platform_origin)
    VALUES (
      new.id,
      new.email,
      COALESCE(v_raw_meta->>'full_name', v_raw_meta->>'name', new.email),
      v_organizer_id,
      COALESCE(v_platform_origin, 'storefront')
    )
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        organizer_id = COALESCE(customers.organizer_id, EXCLUDED.organizer_id);
  
  ELSE
    -- === DO NOTHING ===
    -- If we are unsure, we rely on the Auth Callback to Create the user.
    -- This prevents accidental "Customer" creation for attempted Organizers.
    NULL;
  END IF;

  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_messages"("p_conversation_id" "uuid", "p_query" "text") RETURNS TABLE("id" "uuid", "content" "text", "created_at" timestamp with time zone, "sender_id" "uuid", "rank" real)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.content,
        m.created_at,
        m.sender_id,
        ts_rank(to_tsvector('english', m.content), plainto_tsquery('english', p_query)) as rank
    FROM messages m
    WHERE
        (m.conversation_id = p_conversation_id OR m.quote_id = p_conversation_id)
        AND to_tsvector('english', m.content) @@ plainto_tsquery('english', p_query)
    ORDER BY rank DESC;
END;
$$;


ALTER FUNCTION "public"."search_messages"("p_conversation_id" "uuid", "p_query" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_conversation_summary"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE conversations SET last_message = NEW.content, last_message_at = NEW.created_at, updated_at = NOW() WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_conversation_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_review_submission"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.booking_id IS NOT NULL THEN
        -- Check if booking actually belongs to this customer/organizer and is completed
        IF NOT EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = NEW.booking_id 
            AND customer_id = NEW.customer_id 
            AND organizer_id = NEW.organizer_id
            AND status = 'completed'
        ) THEN
            RAISE EXCEPTION 'Invalid booking for review verification';
        END IF;
        NEW.is_verified := true;
    ELSE
        NEW.is_verified := false;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."verify_review_submission"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "role" "public"."admin_role" DEFAULT 'moderator'::"public"."admin_role",
    "last_login_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_conversations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."ai_conversations" REPLICA IDENTITY FULL;


ALTER TABLE "public"."ai_conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "content" "text",
    "tool_calls" "jsonb",
    "tool_call_id" "text",
    "model" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."ai_messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."ai_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "admin_id" "uuid",
    "action" "text" NOT NULL,
    "resource_type" "text" NOT NULL,
    "resource_id" "text",
    "details" "jsonb",
    "ip_address" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blocked_dates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "blocked_date" "date" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blocked_dates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "customer_name" "text" NOT NULL,
    "customer_email" "text" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "service_name" "text" NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "organizer_name" "text" NOT NULL,
    "event_date" "date" NOT NULL,
    "status" "public"."booking_status" DEFAULT 'pending'::"public"."booking_status" NOT NULL,
    "payment_status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "configuration_snapshot" "jsonb",
    "selection_state" "jsonb" DEFAULT '{}'::"jsonb",
    "step_quantities" "jsonb" DEFAULT '{}'::"jsonb",
    "organizer_completed_at" timestamp with time zone,
    "customer_completed_at" timestamp with time zone,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "pricing_display" boolean DEFAULT true,
    "proposed_price" numeric(10,2)
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_submissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contact_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "booking_id" "uuid",
    "last_message" "text",
    "last_message_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."conversations" REPLICA IDENTITY FULL;


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "organizer_id" "uuid",
    "platform_origin" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."discount_usage_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "discount_id" "uuid",
    "promo_code_id" "uuid",
    "organizer_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "booking_id" "uuid",
    "discount_type" "public"."discount_type",
    "discount_value" numeric(10,2),
    "applied_discount_amount" numeric(10,2),
    "original_amount" numeric(10,2),
    "final_amount" numeric(10,2),
    "promo_code_used" "text",
    "applied_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."discount_usage_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."discounts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "internal_code" "text",
    "is_active" boolean DEFAULT true,
    "discount_type" "public"."discount_type" NOT NULL,
    "discount_value" numeric(10,2) NOT NULL,
    "max_discount_amount" numeric(10,2),
    "scope" "public"."discount_scope" DEFAULT 'global'::"public"."discount_scope" NOT NULL,
    "applicable_service_ids" "uuid"[],
    "applicable_category_ids" "text"[],
    "min_cart_value" numeric(10,2),
    "first_time_customer_only" boolean DEFAULT false,
    "valid_from" timestamp with time zone,
    "valid_until" timestamp with time zone,
    "max_total_uses" integer,
    "max_uses_per_user" integer,
    "current_total_uses" integer DEFAULT 0,
    "priority" integer DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."discounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."draft_bookings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "service_id" "uuid" NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "selection_state" "jsonb",
    "step_quantities" "jsonb",
    "guest_count" integer,
    "subtotal" numeric(10,2),
    "tax_amount" numeric(10,2),
    "total_amount" numeric(10,2),
    "event_date" "date",
    "promo_code_id" "uuid",
    "discount_amount" numeric(10,2),
    "notes" "text",
    "current_step" integer DEFAULT 1,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "start_time" time without time zone,
    "end_time" time without time zone,
    "proposed_price" numeric(10,2)
);


ALTER TABLE "public"."draft_bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_details" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "event_date" timestamp with time zone NOT NULL,
    "customer_name" "text" NOT NULL,
    "organizer_name" "text" NOT NULL,
    "services_taken" "text",
    "images" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."event_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."message_reactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "emoji" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."message_reactions" REPLICA IDENTITY FULL;


ALTER TABLE "public"."message_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "conversation_id" "uuid",
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "quote_id" "uuid",
    CONSTRAINT "message_parent_check" CHECK (((("conversation_id" IS NOT NULL) AND ("quote_id" IS NULL)) OR (("conversation_id" IS NULL) AND ("quote_id" IS NOT NULL))))
);

ALTER TABLE ONLY "public"."messages" REPLICA IDENTITY FULL;


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizers" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "business_name" "text",
    "subdomain" "text",
    "storefront_enabled" boolean DEFAULT false,
    "custom_domain" "text",
    "logo_url" "text",
    "description" "text",
    "staff_count" integer,
    "features" "text"[],
    "gallery" "text"[],
    "differentiators" "text",
    "is_verified" boolean DEFAULT false,
    "avg_rating" numeric(3,2) DEFAULT 0,
    "total_reviews" integer DEFAULT 0,
    "onboarding_completed" boolean DEFAULT false,
    "storefront_settings" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "phone" "text"
);


ALTER TABLE "public"."organizers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pricing_configurations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "steps" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "rules" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "organizer_id" "uuid"
);


ALTER TABLE "public"."pricing_configurations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promo_codes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "discount_type" "public"."discount_type" NOT NULL,
    "discount_value" numeric(10,2) NOT NULL,
    "max_discount_amount" numeric(10,2),
    "scope" "public"."discount_scope" DEFAULT 'global'::"public"."discount_scope" NOT NULL,
    "applicable_service_ids" "uuid"[],
    "applicable_category_ids" "text"[],
    "min_cart_value" numeric(10,2),
    "first_time_customer_only" boolean DEFAULT false,
    "valid_from" timestamp with time zone,
    "valid_until" timestamp with time zone,
    "max_total_uses" integer,
    "max_uses_per_user" integer,
    "current_total_uses" integer DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."promo_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "booking_id" "uuid",
    "status" "text" NOT NULL,
    "quote_data" "jsonb",
    "proposed_price" numeric(10,2),
    "last_message" "text",
    "last_message_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "quotes_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'finalizing'::"text", 'completed'::"text", 'cancelled'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "booking_id" "uuid",
    "customer_id" "uuid" NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "rating" integer,
    "title" "text",
    "comment" "text",
    "is_verified" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "features" "text"[],
    "images" "text"[],
    "rating" numeric(3,2) DEFAULT 0,
    "reviews" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "pricing_configuration_id" "uuid"
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storefront_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organizer_id" "uuid" NOT NULL,
    "business_name" "text" NOT NULL,
    "tagline" "text",
    "logo_url" "text",
    "banner_url" "text",
    "favicon_url" "text",
    "auth_description" "text",
    "login_heading" "text",
    "login_description" "text",
    "signup_heading" "text",
    "signup_description" "text",
    "auth_background_url" "text",
    "template" "text",
    "template_category" "public"."template_category",
    "theme_colors" "jsonb",
    "primary_color" "text",
    "secondary_color" "text",
    "accent_color" "text",
    "background_color" "text",
    "text_color" "text",
    "font_family" "text",
    "show_hero" boolean DEFAULT true,
    "show_about" boolean DEFAULT true,
    "show_services" boolean DEFAULT true,
    "show_testimonials" boolean DEFAULT true,
    "show_gallery" boolean DEFAULT true,
    "show_contact" boolean DEFAULT true,
    "show_reviews" boolean DEFAULT true,
    "hero_title" "text",
    "hero_subtitle" "text",
    "hero_cta_text" "text",
    "hero_cta_link" "text",
    "about_text" "text",
    "welcome_message" "text",
    "contact_email" "text",
    "contact_phone" "text",
    "address" "text",
    "social_links" "jsonb",
    "testimonials" "jsonb",
    "gallery_images" "text"[],
    "meta_title" "text",
    "meta_description" "text",
    "meta_keywords" "text"[],
    "og_image" "text",
    "booking_requires_approval" boolean DEFAULT false,
    "allow_guest_booking" boolean DEFAULT false,
    "min_booking_notice_hours" integer,
    "max_booking_days_ahead" integer,
    "business_hours" "jsonb",
    "cancellation_policy" "text",
    "terms_and_conditions" "text",
    "privacy_policy" "text",
    "google_analytics_id" "text",
    "facebook_pixel_id" "text",
    "custom_css" "text",
    "layout_spacing" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "gallery_testimonials" "jsonb" DEFAULT '[]'::"jsonb",
    "show_social_links" boolean DEFAULT true,
    "pricing_display" boolean DEFAULT true
);


ALTER TABLE "public"."storefront_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tax_rates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "province" "text" NOT NULL,
    "name" "text" NOT NULL,
    "gst_rate" numeric(5,4) DEFAULT 0 NOT NULL,
    "pst_rate" numeric(5,4) DEFAULT 0 NOT NULL,
    "hst_rate" numeric(5,4) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tax_rates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."typing_users" (
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."typing_users" REPLICA IDENTITY FULL;


ALTER TABLE "public"."typing_users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_conversations"
    ADD CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_messages"
    ADD CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blocked_dates"
    ADD CONSTRAINT "blocked_dates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_submissions"
    ADD CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_customer_id_organizer_id_key" UNIQUE ("customer_id", "organizer_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discount_usage_logs"
    ADD CONSTRAINT "discount_usage_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discounts"
    ADD CONSTRAINT "discounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."draft_bookings"
    ADD CONSTRAINT "draft_bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_details"
    ADD CONSTRAINT "event_details_booking_id_key" UNIQUE ("booking_id");



ALTER TABLE ONLY "public"."event_details"
    ADD CONSTRAINT "event_details_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."message_reactions"
    ADD CONSTRAINT "message_reactions_message_id_user_id_emoji_key" UNIQUE ("message_id", "user_id", "emoji");



ALTER TABLE ONLY "public"."message_reactions"
    ADD CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizers"
    ADD CONSTRAINT "organizers_custom_domain_key" UNIQUE ("custom_domain");



ALTER TABLE ONLY "public"."organizers"
    ADD CONSTRAINT "organizers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizers"
    ADD CONSTRAINT "organizers_subdomain_key" UNIQUE ("subdomain");



ALTER TABLE ONLY "public"."pricing_configurations"
    ADD CONSTRAINT "pricing_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_organizer_id_code_key" UNIQUE ("organizer_id", "code");



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storefront_settings"
    ADD CONSTRAINT "storefront_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tax_rates"
    ADD CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tax_rates"
    ADD CONSTRAINT "tax_rates_province_key" UNIQUE ("province");



ALTER TABLE ONLY "public"."typing_users"
    ADD CONSTRAINT "typing_users_pkey" PRIMARY KEY ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."storefront_settings"
    ADD CONSTRAINT "unique_storefront_organizer" UNIQUE ("organizer_id");



CREATE INDEX "idx_bookings_customer_organizer" ON "public"."bookings" USING "btree" ("customer_id", "organizer_id");



CREATE INDEX "idx_bookings_status" ON "public"."bookings" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "check_review_verification" BEFORE INSERT ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."verify_review_submission"();



CREATE OR REPLACE TRIGGER "on_new_message_update_conversation" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_conversation_summary"();



CREATE OR REPLACE TRIGGER "update_pricing_config_modtime" BEFORE UPDATE ON "public"."pricing_configurations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_services_modtime" BEFORE UPDATE ON "public"."services" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_storefront_modtime" BEFORE UPDATE ON "public"."storefront_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_messages"
    ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."discount_usage_logs"
    ADD CONSTRAINT "discount_usage_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."discount_usage_logs"
    ADD CONSTRAINT "discount_usage_logs_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id");



ALTER TABLE ONLY "public"."discount_usage_logs"
    ADD CONSTRAINT "discount_usage_logs_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id");



ALTER TABLE ONLY "public"."draft_bookings"
    ADD CONSTRAINT "draft_bookings_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id");



ALTER TABLE ONLY "public"."draft_bookings"
    ADD CONSTRAINT "draft_bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_details"
    ADD CONSTRAINT "event_details_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_reactions"
    ADD CONSTRAINT "message_reactions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_reactions"
    ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_reactions"
    ADD CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizers"
    ADD CONSTRAINT "organizers_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pricing_configurations"
    ADD CONSTRAINT "pricing_configurations_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pricing_configuration_id_fkey" FOREIGN KEY ("pricing_configuration_id") REFERENCES "public"."pricing_configurations"("id");



ALTER TABLE ONLY "public"."storefront_settings"
    ADD CONSTRAINT "storefront_settings_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."typing_users"
    ADD CONSTRAINT "typing_users_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."typing_users"
    ADD CONSTRAINT "typing_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins view audit logs" ON "public"."audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admins"
  WHERE ("admins"."id" = "auth"."uid"()))));



CREATE POLICY "Admins view self" ON "public"."admins" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Authenticated users submit reviews" ON "public"."reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "customer_id"));



CREATE POLICY "Customers can create bookings" ON "public"."bookings" FOR INSERT WITH CHECK (("auth"."uid"() = "customer_id"));



CREATE POLICY "Customers can view event details" ON "public"."event_details" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."bookings"
  WHERE (("bookings"."id" = "event_details"."booking_id") AND ("bookings"."customer_id" = "auth"."uid"())))));



CREATE POLICY "Customers manage self" ON "public"."customers" USING (("auth"."uid"() = "id"));



CREATE POLICY "Organizers can create bookings" ON "public"."bookings" FOR INSERT WITH CHECK (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers can create event details" ON "public"."event_details" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."bookings"
  WHERE (("bookings"."id" = "event_details"."booking_id") AND ("bookings"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can manage own services" ON "public"."services" USING (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers can update their own bookings" ON "public"."bookings" FOR UPDATE USING (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers can view event details" ON "public"."event_details" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."bookings"
  WHERE (("bookings"."id" = "event_details"."booking_id") AND ("bookings"."organizer_id" = "auth"."uid"())))));



CREATE POLICY "Organizers can view their own bookings" ON "public"."bookings" FOR SELECT USING (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers manage blocked dates" ON "public"."blocked_dates" USING (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers manage discounts" ON "public"."discounts" USING (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers manage pricing configs" ON "public"."pricing_configurations" USING (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers manage promo codes" ON "public"."promo_codes" USING (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers manage self" ON "public"."organizers" USING (("auth"."uid"() = "id"));



CREATE POLICY "Organizers manage storefront settings" ON "public"."storefront_settings" USING (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers view contact submissions" ON "public"."contact_submissions" FOR SELECT USING (("auth"."uid"() = "organizer_id"));



CREATE POLICY "Organizers view their customers" ON "public"."customers" FOR SELECT USING ((("organizer_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."bookings"
  WHERE (("bookings"."customer_id" = "customers"."id") AND ("bookings"."organizer_id" = "auth"."uid"()))))));



CREATE POLICY "Organizers view usage logs" ON "public"."discount_usage_logs" FOR SELECT USING (("organizer_id" = "auth"."uid"()));



CREATE POLICY "Organizers/Customers can update own bookings" ON "public"."bookings" FOR UPDATE USING ((("auth"."uid"() = "customer_id") OR ("auth"."uid"() = "organizer_id")));



CREATE POLICY "Public insert contact submissions" ON "public"."contact_submissions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public organizers viewable" ON "public"."organizers" FOR SELECT USING (true);



CREATE POLICY "Public view blocked dates" ON "public"."blocked_dates" FOR SELECT USING (true);



CREATE POLICY "Public view discounts" ON "public"."discounts" FOR SELECT USING (true);



CREATE POLICY "Public view pricing configs" ON "public"."pricing_configurations" FOR SELECT USING (true);



CREATE POLICY "Public view promo codes" ON "public"."promo_codes" FOR SELECT USING (true);



CREATE POLICY "Public view reviews" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Public view storefront settings" ON "public"."storefront_settings" FOR SELECT USING (true);



CREATE POLICY "Public view tax rates" ON "public"."tax_rates" FOR SELECT USING (true);



CREATE POLICY "Reaction add" ON "public"."message_reactions" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "message_reactions"."conversation_id") AND (("conversations"."customer_id" = "auth"."uid"()) OR ("conversations"."organizer_id" = "auth"."uid"())))))));



CREATE POLICY "Reaction del" ON "public"."message_reactions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Reaction view" ON "public"."message_reactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "message_reactions"."conversation_id") AND (("conversations"."customer_id" = "auth"."uid"()) OR ("conversations"."organizer_id" = "auth"."uid"()))))));



CREATE POLICY "Services are viewable by everyone" ON "public"."services" FOR SELECT USING (true);



CREATE POLICY "Typing manage" ON "public"."typing_users" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Typing view" ON "public"."typing_users" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "typing_users"."conversation_id") AND (("conversations"."customer_id" = "auth"."uid"()) OR ("conversations"."organizer_id" = "auth"."uid"()))))));



CREATE POLICY "Users can insert quotes" ON "public"."quotes" FOR INSERT WITH CHECK ((("auth"."uid"() = "customer_id") OR ("auth"."uid"() = "organizer_id")));



CREATE POLICY "Users can update their quotes" ON "public"."quotes" FOR UPDATE USING ((("auth"."uid"() = "customer_id") OR ("auth"."uid"() = "organizer_id")));



CREATE POLICY "Users can view their quotes" ON "public"."quotes" FOR SELECT USING ((("auth"."uid"() = "customer_id") OR ("auth"."uid"() = "organizer_id")));



CREATE POLICY "Users create convers" ON "public"."conversations" FOR INSERT WITH CHECK ((("auth"."uid"() = "customer_id") OR ("auth"."uid"() = "organizer_id")));



CREATE POLICY "Users delete own reviews" ON "public"."reviews" FOR DELETE USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users insert usage logs" ON "public"."discount_usage_logs" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users manage draft bookings" ON "public"."draft_bookings" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own AI conversations" ON "public"."ai_conversations" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users manage own AI messages" ON "public"."ai_messages" USING ((EXISTS ( SELECT 1
   FROM "public"."ai_conversations"
  WHERE (("ai_conversations"."id" = "ai_messages"."conversation_id") AND ("ai_conversations"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users manage own reviews" ON "public"."reviews" FOR UPDATE USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users send msgs" ON "public"."messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND ((("conversation_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."customer_id" = "auth"."uid"()) OR ("conversations"."organizer_id" = "auth"."uid"())))))) OR (("quote_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."quotes"
  WHERE (("quotes"."id" = "messages"."quote_id") AND (("quotes"."customer_id" = "auth"."uid"()) OR ("quotes"."organizer_id" = "auth"."uid"())))))))));



CREATE POLICY "Users update msgs" ON "public"."messages" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."customer_id" = "auth"."uid"()) OR ("conversations"."organizer_id" = "auth"."uid"()))))));



CREATE POLICY "Users view convers" ON "public"."conversations" FOR SELECT USING ((("auth"."uid"() = "customer_id") OR ("auth"."uid"() = "organizer_id")));



CREATE POLICY "Users view msgs" ON "public"."messages" FOR SELECT USING (((("conversation_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "messages"."conversation_id") AND (("conversations"."customer_id" = "auth"."uid"()) OR ("conversations"."organizer_id" = "auth"."uid"())))))) OR (("quote_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."quotes"
  WHERE (("quotes"."id" = "messages"."quote_id") AND (("quotes"."customer_id" = "auth"."uid"()) OR ("quotes"."organizer_id" = "auth"."uid"()))))))));



CREATE POLICY "Users view own bookings" ON "public"."bookings" FOR SELECT USING ((("auth"."uid"() = "customer_id") OR ("auth"."uid"() = "organizer_id")));



CREATE POLICY "Users view usage logs" ON "public"."discount_usage_logs" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "View reactions" ON "public"."message_reactions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "View typing" ON "public"."typing_users" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blocked_dates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discount_usage_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."draft_bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."message_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pricing_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promo_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storefront_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tax_rates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."typing_users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."ai_conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."ai_messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."message_reactions";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."quotes";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."typing_users";



REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_messages"("p_conversation_id" "uuid", "p_query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_messages"("p_conversation_id" "uuid", "p_query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_messages"("p_conversation_id" "uuid", "p_query" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_conversation_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_conversation_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_conversation_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_review_submission"() TO "anon";
GRANT ALL ON FUNCTION "public"."verify_review_submission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_review_submission"() TO "service_role";


















GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."admins" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."admins" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."admins" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."ai_conversations" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."ai_conversations" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."ai_conversations" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."ai_messages" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."ai_messages" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."ai_messages" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."audit_logs" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."audit_logs" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."audit_logs" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."blocked_dates" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."blocked_dates" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."blocked_dates" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."bookings" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."bookings" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."bookings" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."contact_submissions" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."contact_submissions" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."contact_submissions" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."conversations" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."conversations" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."conversations" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."customers" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."customers" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."customers" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."discount_usage_logs" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."discount_usage_logs" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."discount_usage_logs" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."discounts" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."discounts" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."discounts" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."draft_bookings" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."draft_bookings" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."draft_bookings" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."event_details" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."event_details" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."event_details" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."message_reactions" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."message_reactions" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."message_reactions" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."messages" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."messages" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."messages" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."organizers" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."organizers" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."organizers" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."pricing_configurations" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."pricing_configurations" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."pricing_configurations" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."promo_codes" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."promo_codes" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."promo_codes" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."quotes" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."quotes" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."quotes" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."reviews" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."reviews" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."reviews" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."services" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."services" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."services" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."storefront_settings" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."storefront_settings" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."storefront_settings" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."tax_rates" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."tax_rates" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."tax_rates" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."typing_users" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."typing_users" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."typing_users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO "service_role";




























drop extension if exists "pg_net";

revoke references on table "public"."admins" from "anon";

revoke trigger on table "public"."admins" from "anon";

revoke truncate on table "public"."admins" from "anon";

revoke references on table "public"."admins" from "authenticated";

revoke trigger on table "public"."admins" from "authenticated";

revoke truncate on table "public"."admins" from "authenticated";

revoke references on table "public"."admins" from "service_role";

revoke trigger on table "public"."admins" from "service_role";

revoke truncate on table "public"."admins" from "service_role";

revoke references on table "public"."ai_conversations" from "anon";

revoke trigger on table "public"."ai_conversations" from "anon";

revoke truncate on table "public"."ai_conversations" from "anon";

revoke references on table "public"."ai_conversations" from "authenticated";

revoke trigger on table "public"."ai_conversations" from "authenticated";

revoke truncate on table "public"."ai_conversations" from "authenticated";

revoke references on table "public"."ai_conversations" from "service_role";

revoke trigger on table "public"."ai_conversations" from "service_role";

revoke truncate on table "public"."ai_conversations" from "service_role";

revoke references on table "public"."ai_messages" from "anon";

revoke trigger on table "public"."ai_messages" from "anon";

revoke truncate on table "public"."ai_messages" from "anon";

revoke references on table "public"."ai_messages" from "authenticated";

revoke trigger on table "public"."ai_messages" from "authenticated";

revoke truncate on table "public"."ai_messages" from "authenticated";

revoke references on table "public"."ai_messages" from "service_role";

revoke trigger on table "public"."ai_messages" from "service_role";

revoke truncate on table "public"."ai_messages" from "service_role";

revoke references on table "public"."audit_logs" from "anon";

revoke trigger on table "public"."audit_logs" from "anon";

revoke truncate on table "public"."audit_logs" from "anon";

revoke references on table "public"."audit_logs" from "authenticated";

revoke trigger on table "public"."audit_logs" from "authenticated";

revoke truncate on table "public"."audit_logs" from "authenticated";

revoke references on table "public"."audit_logs" from "service_role";

revoke trigger on table "public"."audit_logs" from "service_role";

revoke truncate on table "public"."audit_logs" from "service_role";

revoke references on table "public"."blocked_dates" from "anon";

revoke trigger on table "public"."blocked_dates" from "anon";

revoke truncate on table "public"."blocked_dates" from "anon";

revoke references on table "public"."blocked_dates" from "authenticated";

revoke trigger on table "public"."blocked_dates" from "authenticated";

revoke truncate on table "public"."blocked_dates" from "authenticated";

revoke references on table "public"."blocked_dates" from "service_role";

revoke trigger on table "public"."blocked_dates" from "service_role";

revoke truncate on table "public"."blocked_dates" from "service_role";

revoke references on table "public"."bookings" from "anon";

revoke trigger on table "public"."bookings" from "anon";

revoke truncate on table "public"."bookings" from "anon";

revoke references on table "public"."bookings" from "authenticated";

revoke trigger on table "public"."bookings" from "authenticated";

revoke truncate on table "public"."bookings" from "authenticated";

revoke references on table "public"."bookings" from "service_role";

revoke trigger on table "public"."bookings" from "service_role";

revoke truncate on table "public"."bookings" from "service_role";

revoke references on table "public"."contact_submissions" from "anon";

revoke trigger on table "public"."contact_submissions" from "anon";

revoke truncate on table "public"."contact_submissions" from "anon";

revoke references on table "public"."contact_submissions" from "authenticated";

revoke trigger on table "public"."contact_submissions" from "authenticated";

revoke truncate on table "public"."contact_submissions" from "authenticated";

revoke references on table "public"."contact_submissions" from "service_role";

revoke trigger on table "public"."contact_submissions" from "service_role";

revoke truncate on table "public"."contact_submissions" from "service_role";

revoke references on table "public"."conversations" from "anon";

revoke trigger on table "public"."conversations" from "anon";

revoke truncate on table "public"."conversations" from "anon";

revoke references on table "public"."conversations" from "authenticated";

revoke trigger on table "public"."conversations" from "authenticated";

revoke truncate on table "public"."conversations" from "authenticated";

revoke references on table "public"."conversations" from "service_role";

revoke trigger on table "public"."conversations" from "service_role";

revoke truncate on table "public"."conversations" from "service_role";

revoke references on table "public"."customers" from "anon";

revoke trigger on table "public"."customers" from "anon";

revoke truncate on table "public"."customers" from "anon";

revoke references on table "public"."customers" from "authenticated";

revoke trigger on table "public"."customers" from "authenticated";

revoke truncate on table "public"."customers" from "authenticated";

revoke references on table "public"."customers" from "service_role";

revoke trigger on table "public"."customers" from "service_role";

revoke truncate on table "public"."customers" from "service_role";

revoke references on table "public"."discount_usage_logs" from "anon";

revoke trigger on table "public"."discount_usage_logs" from "anon";

revoke truncate on table "public"."discount_usage_logs" from "anon";

revoke references on table "public"."discount_usage_logs" from "authenticated";

revoke trigger on table "public"."discount_usage_logs" from "authenticated";

revoke truncate on table "public"."discount_usage_logs" from "authenticated";

revoke references on table "public"."discount_usage_logs" from "service_role";

revoke trigger on table "public"."discount_usage_logs" from "service_role";

revoke truncate on table "public"."discount_usage_logs" from "service_role";

revoke references on table "public"."discounts" from "anon";

revoke trigger on table "public"."discounts" from "anon";

revoke truncate on table "public"."discounts" from "anon";

revoke references on table "public"."discounts" from "authenticated";

revoke trigger on table "public"."discounts" from "authenticated";

revoke truncate on table "public"."discounts" from "authenticated";

revoke references on table "public"."discounts" from "service_role";

revoke trigger on table "public"."discounts" from "service_role";

revoke truncate on table "public"."discounts" from "service_role";

revoke references on table "public"."draft_bookings" from "anon";

revoke trigger on table "public"."draft_bookings" from "anon";

revoke truncate on table "public"."draft_bookings" from "anon";

revoke references on table "public"."draft_bookings" from "authenticated";

revoke trigger on table "public"."draft_bookings" from "authenticated";

revoke truncate on table "public"."draft_bookings" from "authenticated";

revoke references on table "public"."draft_bookings" from "service_role";

revoke trigger on table "public"."draft_bookings" from "service_role";

revoke truncate on table "public"."draft_bookings" from "service_role";

revoke references on table "public"."event_details" from "anon";

revoke trigger on table "public"."event_details" from "anon";

revoke truncate on table "public"."event_details" from "anon";

revoke references on table "public"."event_details" from "authenticated";

revoke trigger on table "public"."event_details" from "authenticated";

revoke truncate on table "public"."event_details" from "authenticated";

revoke references on table "public"."event_details" from "service_role";

revoke trigger on table "public"."event_details" from "service_role";

revoke truncate on table "public"."event_details" from "service_role";

revoke references on table "public"."message_reactions" from "anon";

revoke trigger on table "public"."message_reactions" from "anon";

revoke truncate on table "public"."message_reactions" from "anon";

revoke references on table "public"."message_reactions" from "authenticated";

revoke trigger on table "public"."message_reactions" from "authenticated";

revoke truncate on table "public"."message_reactions" from "authenticated";

revoke references on table "public"."message_reactions" from "service_role";

revoke trigger on table "public"."message_reactions" from "service_role";

revoke truncate on table "public"."message_reactions" from "service_role";

revoke references on table "public"."messages" from "anon";

revoke trigger on table "public"."messages" from "anon";

revoke truncate on table "public"."messages" from "anon";

revoke references on table "public"."messages" from "authenticated";

revoke trigger on table "public"."messages" from "authenticated";

revoke truncate on table "public"."messages" from "authenticated";

revoke references on table "public"."messages" from "service_role";

revoke trigger on table "public"."messages" from "service_role";

revoke truncate on table "public"."messages" from "service_role";

revoke references on table "public"."organizers" from "anon";

revoke trigger on table "public"."organizers" from "anon";

revoke truncate on table "public"."organizers" from "anon";

revoke references on table "public"."organizers" from "authenticated";

revoke trigger on table "public"."organizers" from "authenticated";

revoke truncate on table "public"."organizers" from "authenticated";

revoke references on table "public"."organizers" from "service_role";

revoke trigger on table "public"."organizers" from "service_role";

revoke truncate on table "public"."organizers" from "service_role";

revoke references on table "public"."pricing_configurations" from "anon";

revoke trigger on table "public"."pricing_configurations" from "anon";

revoke truncate on table "public"."pricing_configurations" from "anon";

revoke references on table "public"."pricing_configurations" from "authenticated";

revoke trigger on table "public"."pricing_configurations" from "authenticated";

revoke truncate on table "public"."pricing_configurations" from "authenticated";

revoke references on table "public"."pricing_configurations" from "service_role";

revoke trigger on table "public"."pricing_configurations" from "service_role";

revoke truncate on table "public"."pricing_configurations" from "service_role";

revoke references on table "public"."promo_codes" from "anon";

revoke trigger on table "public"."promo_codes" from "anon";

revoke truncate on table "public"."promo_codes" from "anon";

revoke references on table "public"."promo_codes" from "authenticated";

revoke trigger on table "public"."promo_codes" from "authenticated";

revoke truncate on table "public"."promo_codes" from "authenticated";

revoke references on table "public"."promo_codes" from "service_role";

revoke trigger on table "public"."promo_codes" from "service_role";

revoke truncate on table "public"."promo_codes" from "service_role";

revoke references on table "public"."quotes" from "anon";

revoke trigger on table "public"."quotes" from "anon";

revoke truncate on table "public"."quotes" from "anon";

revoke references on table "public"."quotes" from "authenticated";

revoke trigger on table "public"."quotes" from "authenticated";

revoke truncate on table "public"."quotes" from "authenticated";

revoke references on table "public"."quotes" from "service_role";

revoke trigger on table "public"."quotes" from "service_role";

revoke truncate on table "public"."quotes" from "service_role";

revoke references on table "public"."reviews" from "anon";

revoke trigger on table "public"."reviews" from "anon";

revoke truncate on table "public"."reviews" from "anon";

revoke references on table "public"."reviews" from "authenticated";

revoke trigger on table "public"."reviews" from "authenticated";

revoke truncate on table "public"."reviews" from "authenticated";

revoke references on table "public"."reviews" from "service_role";

revoke trigger on table "public"."reviews" from "service_role";

revoke truncate on table "public"."reviews" from "service_role";

revoke references on table "public"."services" from "anon";

revoke trigger on table "public"."services" from "anon";

revoke truncate on table "public"."services" from "anon";

revoke references on table "public"."services" from "authenticated";

revoke trigger on table "public"."services" from "authenticated";

revoke truncate on table "public"."services" from "authenticated";

revoke references on table "public"."services" from "service_role";

revoke trigger on table "public"."services" from "service_role";

revoke truncate on table "public"."services" from "service_role";

revoke references on table "public"."storefront_settings" from "anon";

revoke trigger on table "public"."storefront_settings" from "anon";

revoke truncate on table "public"."storefront_settings" from "anon";

revoke references on table "public"."storefront_settings" from "authenticated";

revoke trigger on table "public"."storefront_settings" from "authenticated";

revoke truncate on table "public"."storefront_settings" from "authenticated";

revoke references on table "public"."storefront_settings" from "service_role";

revoke trigger on table "public"."storefront_settings" from "service_role";

revoke truncate on table "public"."storefront_settings" from "service_role";

revoke references on table "public"."tax_rates" from "anon";

revoke trigger on table "public"."tax_rates" from "anon";

revoke truncate on table "public"."tax_rates" from "anon";

revoke references on table "public"."tax_rates" from "authenticated";

revoke trigger on table "public"."tax_rates" from "authenticated";

revoke truncate on table "public"."tax_rates" from "authenticated";

revoke references on table "public"."tax_rates" from "service_role";

revoke trigger on table "public"."tax_rates" from "service_role";

revoke truncate on table "public"."tax_rates" from "service_role";

revoke references on table "public"."typing_users" from "anon";

revoke trigger on table "public"."typing_users" from "anon";

revoke truncate on table "public"."typing_users" from "anon";

revoke references on table "public"."typing_users" from "authenticated";

revoke trigger on table "public"."typing_users" from "authenticated";

revoke truncate on table "public"."typing_users" from "authenticated";

revoke references on table "public"."typing_users" from "service_role";

revoke trigger on table "public"."typing_users" from "service_role";

revoke truncate on table "public"."typing_users" from "service_role";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Auth users upload images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'images'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Public read images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'images'::text));



