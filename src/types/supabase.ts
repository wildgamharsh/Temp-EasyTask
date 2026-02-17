export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          last_login_at: string | null
          password_hash: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          last_login_at?: string | null
          password_hash: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          last_login_at?: string | null
          password_hash?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string | null
          id: string
          organizer_id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string | null
          id?: string
          organizer_id: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string | null
          id?: string
          organizer_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_time_slots: {
        Row: {
          booking_id: string
          created_at: string | null
          end_time: string
          id: string
          organizer_id: string
          start_time: string
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          end_time: string
          id?: string
          organizer_id: string
          start_time: string
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          end_time?: string
          id?: string
          organizer_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_time_slots_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_id: string
          customer_name: string
          discount_amount: number | null
          discount_id: string | null
          event_date: string
          event_location: string | null
          event_time: string
          guest_count: number
          id: string
          notes: string | null
          organizer_id: string
          organizer_name: string
          original_price: number | null
          payment_status: string | null
          pricing_breakdown: Json | null
          promo_code_id: string | null
          selected_addon_ids: string[] | null
          selected_package_id: string | null
          service_fee: number | null
          service_id: string
          service_name: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_province: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_id: string
          customer_name: string
          discount_amount?: number | null
          discount_id?: string | null
          event_date: string
          event_location?: string | null
          event_time: string
          guest_count: number
          id?: string
          notes?: string | null
          organizer_id: string
          organizer_name: string
          original_price?: number | null
          payment_status?: string | null
          pricing_breakdown?: Json | null
          promo_code_id?: string | null
          selected_addon_ids?: string[] | null
          selected_package_id?: string | null
          service_fee?: number | null
          service_id: string
          service_name: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_province?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_id?: string
          customer_name?: string
          discount_amount?: number | null
          discount_id?: string | null
          event_date?: string
          event_location?: string | null
          event_time?: string
          guest_count?: number
          id?: string
          notes?: string | null
          organizer_id?: string
          organizer_name?: string
          original_price?: number | null
          payment_status?: string | null
          pricing_breakdown?: Json | null
          promo_code_id?: string | null
          selected_addon_ids?: string[] | null
          selected_package_id?: string | null
          service_fee?: number | null
          service_id?: string
          service_name?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_province?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_selected_package_id_fkey"
            columns: ["selected_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      discount_usage_log: {
        Row: {
          applied_at: string | null
          applied_discount_amount: number
          booking_id: string | null
          discount_id: string | null
          discount_type: string
          discount_value: number
          final_amount: number
          id: string
          organizer_id: string
          original_amount: number
          promo_code_id: string | null
          promo_code_used: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          applied_discount_amount: number
          booking_id?: string | null
          discount_id?: string | null
          discount_type: string
          discount_value: number
          final_amount: number
          id?: string
          organizer_id: string
          original_amount: number
          promo_code_id?: string | null
          promo_code_used?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          applied_discount_amount?: number
          booking_id?: string | null
          discount_id?: string | null
          discount_type?: string
          discount_value?: number
          final_amount?: number
          id?: string
          organizer_id?: string
          original_amount?: number
          promo_code_id?: string | null
          promo_code_used?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_usage_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usage_log_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usage_log_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usage_log_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usage_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discounts: {
        Row: {
          applicable_category_ids: string[] | null
          applicable_service_ids: string[] | null
          created_at: string | null
          created_by: string | null
          current_total_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          first_time_customer_only: boolean | null
          id: string
          internal_code: string | null
          is_active: boolean | null
          max_discount_amount: number | null
          max_total_uses: number | null
          max_uses_per_user: number | null
          min_cart_value: number | null
          name: string
          organizer_id: string
          priority: number | null
          scope: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_category_ids?: string[] | null
          applicable_service_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          current_total_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          first_time_customer_only?: boolean | null
          id?: string
          internal_code?: string | null
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_total_uses?: number | null
          max_uses_per_user?: number | null
          min_cart_value?: number | null
          name: string
          organizer_id: string
          priority?: number | null
          scope: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_category_ids?: string[] | null
          applicable_service_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          current_total_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          first_time_customer_only?: boolean | null
          id?: string
          internal_code?: string | null
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_total_uses?: number | null
          max_uses_per_user?: number | null
          min_cart_value?: number | null
          name?: string
          organizer_id?: string
          priority?: number | null
          scope?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discounts_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_bookings: {
        Row: {
          created_at: string | null
          current_step: number | null
          discount_amount: number | null
          event_date: string | null
          event_time: string | null
          expires_at: string | null
          guest_count: number | null
          id: string
          notes: string | null
          organizer_id: string
          pricing_model: string
          promo_code_id: string | null
          selected_addon_ids: string[] | null
          selected_package_id: string | null
          service_id: string
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_step?: number | null
          discount_amount?: number | null
          event_date?: string | null
          event_time?: string | null
          expires_at?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          organizer_id: string
          pricing_model: string
          promo_code_id?: string | null
          selected_addon_ids?: string[] | null
          selected_package_id?: string | null
          service_id: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_step?: number | null
          discount_amount?: number | null
          event_date?: string | null
          event_time?: string | null
          expires_at?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          organizer_id?: string
          pricing_model?: string
          promo_code_id?: string | null
          selected_addon_ids?: string[] | null
          selected_package_id?: string | null
          service_id?: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_bookings_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_bookings_selected_package_id_fkey"
            columns: ["selected_package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      organizer_availability: {
        Row: {
          blocked_dates: string[] | null
          buffer_minutes: number | null
          created_at: string | null
          default_event_duration: number | null
          id: string
          max_advance_days: number | null
          min_advance_hours: number | null
          organizer_id: string
          updated_at: string | null
          weekly_schedule: Json | null
        }
        Insert: {
          blocked_dates?: string[] | null
          buffer_minutes?: number | null
          created_at?: string | null
          default_event_duration?: number | null
          id?: string
          max_advance_days?: number | null
          min_advance_hours?: number | null
          organizer_id: string
          updated_at?: string | null
          weekly_schedule?: Json | null
        }
        Update: {
          blocked_dates?: string[] | null
          buffer_minutes?: number | null
          created_at?: string | null
          default_event_duration?: number | null
          id?: string
          max_advance_days?: number | null
          min_advance_hours?: number | null
          organizer_id?: string
          updated_at?: string | null
          weekly_schedule?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avg_rating: number | null
          business_name: string | null
          created_at: string | null
          custom_domain: string | null
          description: string | null
          differentiators: string | null
          email: string
          features: string[] | null
          gallery: string[] | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          name: string
          role: string
          staff_count: number | null
          storefront_enabled: boolean | null
          subdomain: string | null
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          avg_rating?: number | null
          business_name?: string | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          differentiators?: string | null
          email: string
          features?: string[] | null
          gallery?: string[] | null
          id: string
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          role: string
          staff_count?: number | null
          storefront_enabled?: boolean | null
          subdomain?: string | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_rating?: number | null
          business_name?: string | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          differentiators?: string | null
          email?: string
          features?: string[] | null
          gallery?: string[] | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          role?: string
          staff_count?: number | null
          storefront_enabled?: boolean | null
          subdomain?: string | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          applicable_category_ids: string[] | null
          applicable_service_ids: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          current_total_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          first_time_customer_only: boolean | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          max_total_uses: number | null
          max_uses_per_user: number | null
          min_cart_value: number | null
          organizer_id: string
          scope: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_category_ids?: string[] | null
          applicable_service_ids?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_total_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          first_time_customer_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_total_uses?: number | null
          max_uses_per_user?: number | null
          min_cart_value?: number | null
          organizer_id: string
          scope: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_category_ids?: string[] | null
          applicable_service_ids?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_total_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          first_time_customer_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_total_uses?: number | null
          max_uses_per_user?: number | null
          min_cart_value?: number | null
          organizer_id?: string
          scope?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_codes_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reserved_subdomains: {
        Row: {
          created_at: string | null
          reason: string | null
          subdomain: string
        }
        Insert: {
          created_at?: string | null
          reason?: string | null
          subdomain: string
        }
        Update: {
          created_at?: string | null
          reason?: string | null
          subdomain?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string | null
          customer_id: string
          id: string
          is_verified: boolean | null
          organizer_id: string
          rating: number
          service_id: string
          title: string | null
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          is_verified?: boolean | null
          organizer_id: string
          rating: number
          service_id: string
          title?: string | null
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          is_verified?: boolean | null
          organizer_id?: string
          rating?: number
          service_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_addons: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          package_id: string | null
          price: number
          service_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          package_id?: string | null
          price: number
          service_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          package_id?: string | null
          price?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_addons_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_addons_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_fixed_fees: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          service_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          service_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_fixed_fees_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_popular: boolean | null
          name: string
          price: number
          service_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_popular?: boolean | null
          name: string
          price: number
          service_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_popular?: boolean | null
          name?: string
          price?: number
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number
          created_at: string | null
          description: string
          features: string[] | null
          has_volume_discounts: boolean | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_tax_inclusive: boolean | null
          max_guests: number | null
          min_guests: number | null
          organizer_id: string
          pricing_model: string | null
          pricing_type: string
          province: string | null
          rating: number | null
          reviews: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          description: string
          features?: string[] | null
          has_volume_discounts?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_tax_inclusive?: boolean | null
          max_guests?: number | null
          min_guests?: number | null
          organizer_id: string
          pricing_model?: string | null
          pricing_type: string
          province?: string | null
          rating?: number | null
          reviews?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string
          features?: string[] | null
          has_volume_discounts?: boolean | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_tax_inclusive?: boolean | null
          max_guests?: number | null
          min_guests?: number | null
          organizer_id?: string
          pricing_model?: string | null
          pricing_type?: string
          province?: string | null
          rating?: number | null
          reviews?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_settings: {
        Row: {
          about_text: string | null
          address: string | null
          allow_guest_booking: boolean | null
          banner_url: string | null
          booking_requires_approval: boolean | null
          business_hours: Json | null
          business_name: string
          cancellation_policy: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          custom_css: string | null
          facebook_pixel_id: string | null
          favicon_url: string | null
          font_family: string | null
          gallery_images: string[] | null
          google_analytics_id: string | null
          hero_cta_link: string | null
          hero_cta_text: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          layout_spacing: string | null
          logo_url: string | null
          max_booking_days_ahead: number | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          min_booking_notice_hours: number | null
          og_image: string | null
          organizer_id: string
          privacy_policy: string | null
          show_about: boolean | null
          show_contact: boolean | null
          show_gallery: boolean | null
          show_hero: boolean | null
          show_reviews: boolean | null
          show_services: boolean | null
          show_testimonials: boolean | null
          social_links: Json | null
          tagline: string | null
          template: string | null
          terms_and_conditions: string | null
          testimonials: Json | null
          theme_colors: Json | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          allow_guest_booking?: boolean | null
          banner_url?: string | null
          booking_requires_approval?: boolean | null
          business_hours?: Json | null
          business_name: string
          cancellation_policy?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          custom_css?: string | null
          facebook_pixel_id?: string | null
          favicon_url?: string | null
          font_family?: string | null
          gallery_images?: string[] | null
          google_analytics_id?: string | null
          hero_cta_link?: string | null
          hero_cta_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          layout_spacing?: string | null
          logo_url?: string | null
          max_booking_days_ahead?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          min_booking_notice_hours?: number | null
          og_image?: string | null
          organizer_id: string
          privacy_policy?: string | null
          show_about?: boolean | null
          show_contact?: boolean | null
          show_gallery?: boolean | null
          show_hero?: boolean | null
          show_reviews?: boolean | null
          show_services?: boolean | null
          show_testimonials?: boolean | null
          social_links?: Json | null
          tagline?: string | null
          template?: string | null
          terms_and_conditions?: string | null
          testimonials?: Json | null
          theme_colors?: Json | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          allow_guest_booking?: boolean | null
          banner_url?: string | null
          booking_requires_approval?: boolean | null
          business_hours?: Json | null
          business_name?: string
          cancellation_policy?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          custom_css?: string | null
          facebook_pixel_id?: string | null
          favicon_url?: string | null
          font_family?: string | null
          gallery_images?: string[] | null
          google_analytics_id?: string | null
          hero_cta_link?: string | null
          hero_cta_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          layout_spacing?: string | null
          logo_url?: string | null
          max_booking_days_ahead?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          min_booking_notice_hours?: number | null
          og_image?: string | null
          organizer_id?: string
          privacy_policy?: string | null
          show_about?: boolean | null
          show_contact?: boolean | null
          show_gallery?: boolean | null
          show_hero?: boolean | null
          show_reviews?: boolean | null
          show_services?: boolean | null
          show_testimonials?: boolean | null
          social_links?: Json | null
          tagline?: string | null
          template?: string | null
          terms_and_conditions?: string | null
          testimonials?: Json | null
          theme_colors?: Json | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storefront_settings_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_rates: {
        Row: {
          created_at: string | null
          gst_rate: number
          hst_rate: number
          name: string
          province: string
          pst_rate: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          gst_rate?: number
          hst_rate?: number
          name: string
          province: string
          pst_rate?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          gst_rate?: number
          hst_rate?: number
          name?: string
          province?: string
          pst_rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      volume_discount_tiers: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          min_guests: number
          price_per_person: number
          service_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          min_guests: number
          price_per_person: number
          service_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          min_guests?: number
          price_per_person?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volume_discount_tiers_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
