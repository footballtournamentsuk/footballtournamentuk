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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alert_deliveries: {
        Row: {
          alert_id: string | null
          error: string | null
          id: string
          item_count: number
          sent_at: string | null
          status: string
        }
        Insert: {
          alert_id?: string | null
          error?: string | null
          id?: string
          item_count: number
          sent_at?: string | null
          status: string
        }
        Update: {
          alert_id?: string | null
          error?: string | null
          id?: string
          item_count?: number
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_deliveries_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "tournament_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          properties: Json
          session_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          properties: Json
          session_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          properties?: Json
          session_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          content: string | null
          cover_alt: string | null
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          og_image_url: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          sources: Json | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          content?: string | null
          cover_alt?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          sources?: Json | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          content?: string | null
          cover_alt?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          sources?: Json | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          consent_date: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          data_processing_consent: boolean | null
          email_change_token: string | null
          full_name: string | null
          id: string
          pending_email_change: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_date?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          data_processing_consent?: boolean | null
          email_change_token?: string | null
          full_name?: string | null
          id?: string
          pending_email_change?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_date?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          data_processing_consent?: boolean | null
          email_change_token?: string | null
          full_name?: string | null
          id?: string
          pending_email_change?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          age_groups: string[]
          banner_url: string | null
          city: string
          country: string
          created_at: string
          facebook: string | null
          formats: string[]
          genders: string[]
          id: string
          instagram: string | null
          is_published: boolean
          logo_url: string | null
          name: string
          owner_id: string
          region: string
          twitter: string | null
          updated_at: string
          venue_address: string | null
          venue_latitude: number | null
          venue_longitude: number | null
          website: string | null
        }
        Insert: {
          age_groups?: string[]
          banner_url?: string | null
          city: string
          country: string
          created_at?: string
          facebook?: string | null
          formats?: string[]
          genders?: string[]
          id?: string
          instagram?: string | null
          is_published?: boolean
          logo_url?: string | null
          name: string
          owner_id: string
          region: string
          twitter?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_latitude?: number | null
          venue_longitude?: number | null
          website?: string | null
        }
        Update: {
          age_groups?: string[]
          banner_url?: string | null
          city?: string
          country?: string
          created_at?: string
          facebook?: string | null
          formats?: string[]
          genders?: string[]
          id?: string
          instagram?: string | null
          is_published?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string
          region?: string
          twitter?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_latitude?: number | null
          venue_longitude?: number | null
          website?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_email: string | null
          author_name: string
          created_at: string
          id: string
          published: boolean
          rating: number
          source: string
          text: string
          updated_at: string
        }
        Insert: {
          author_email?: string | null
          author_name: string
          created_at?: string
          id?: string
          published?: boolean
          rating: number
          source?: string
          text: string
          updated_at?: string
        }
        Update: {
          author_email?: string | null
          author_name?: string
          created_at?: string
          id?: string
          published?: boolean
          rating?: number
          source?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournament_alerts: {
        Row: {
          consent_source: string
          consent_timestamp: string
          created_at: string | null
          email: string
          filters: Json
          frequency: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          management_token: string
          updated_at: string | null
          verification_token: string
          verified_at: string | null
        }
        Insert: {
          consent_source: string
          consent_timestamp?: string
          created_at?: string | null
          email: string
          filters: Json
          frequency: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          management_token: string
          updated_at?: string | null
          verification_token: string
          verified_at?: string | null
        }
        Update: {
          consent_source?: string
          consent_timestamp?: string
          created_at?: string | null
          email?: string
          filters?: Json
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          management_token?: string
          updated_at?: string | null
          verification_token?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      tournament_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          tournament_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          tournament_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          tournament_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      tournament_review_emails_sent: {
        Row: {
          id: string
          sent_at: string
          tournament_id: string
        }
        Insert: {
          id?: string
          sent_at?: string
          tournament_id: string
        }
        Update: {
          id?: string
          sent_at?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_review_emails_sent_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: true
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          accommodation_info: string | null
          additional_notes: string | null
          age_groups: string[]
          banner_url: string | null
          computed_status: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          cost_amount: number | null
          cost_currency: string | null
          country: string
          created_at: string
          description: string | null
          end_date: string
          extended_description: string | null
          features: string[] | null
          format: string
          gallery_images: string[] | null
          id: string
          latitude: number
          location_name: string
          longitude: number
          max_teams: number | null
          name: string
          organizer_id: string | null
          postcode: string
          prize_information: string | null
          region: string
          registered_teams: number | null
          registration_deadline: string | null
          rules_and_regulations: string | null
          schedule_details: string | null
          share_cover_alt: string | null
          share_cover_url: string | null
          share_cover_variant: string | null
          slug: string | null
          social_media_links: Json | null
          sponsor_info: string | null
          start_date: string
          status: string
          team_types: string[]
          type: string
          updated_at: string
          venue_details: string | null
          website: string | null
          what_to_bring: string | null
        }
        Insert: {
          accommodation_info?: string | null
          additional_notes?: string | null
          age_groups: string[]
          banner_url?: string | null
          computed_status?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          cost_amount?: number | null
          cost_currency?: string | null
          country?: string
          created_at?: string
          description?: string | null
          end_date: string
          extended_description?: string | null
          features?: string[] | null
          format: string
          gallery_images?: string[] | null
          id?: string
          latitude: number
          location_name: string
          longitude: number
          max_teams?: number | null
          name: string
          organizer_id?: string | null
          postcode: string
          prize_information?: string | null
          region: string
          registered_teams?: number | null
          registration_deadline?: string | null
          rules_and_regulations?: string | null
          schedule_details?: string | null
          share_cover_alt?: string | null
          share_cover_url?: string | null
          share_cover_variant?: string | null
          slug?: string | null
          social_media_links?: Json | null
          sponsor_info?: string | null
          start_date: string
          status?: string
          team_types: string[]
          type: string
          updated_at?: string
          venue_details?: string | null
          website?: string | null
          what_to_bring?: string | null
        }
        Update: {
          accommodation_info?: string | null
          additional_notes?: string | null
          age_groups?: string[]
          banner_url?: string | null
          computed_status?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          cost_amount?: number | null
          cost_currency?: string | null
          country?: string
          created_at?: string
          description?: string | null
          end_date?: string
          extended_description?: string | null
          features?: string[] | null
          format?: string
          gallery_images?: string[] | null
          id?: string
          latitude?: number
          location_name?: string
          longitude?: number
          max_teams?: number | null
          name?: string
          organizer_id?: string | null
          postcode?: string
          prize_information?: string | null
          region?: string
          registered_teams?: number | null
          registration_deadline?: string | null
          rules_and_regulations?: string | null
          schedule_details?: string | null
          share_cover_alt?: string | null
          share_cover_url?: string | null
          share_cover_variant?: string | null
          slug?: string | null
          social_media_links?: Json | null
          sponsor_info?: string | null
          start_date?: string
          status?: string
          team_types?: string[]
          type?: string
          updated_at?: string
          venue_details?: string | null
          website?: string | null
          what_to_bring?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_reading_time: {
        Args: { content_text: string }
        Returns: number
      }
      compute_tournament_status: {
        Args: {
          end_date: string
          registration_deadline: string
          start_date: string
        }
        Returns: string
      }
      generate_blog_slug: {
        Args: { post_title: string }
        Returns: string
      }
      generate_tournament_slug: {
        Args: { tournament_name: string }
        Returns: string
      }
      get_email_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          pending_review_emails: number
          total_tournaments: number
          tournaments_with_review_emails: number
        }[]
      }
      get_funnel_metrics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          detail_views: number
          drop_off_rate: number
          list_views: number
          registration_completions: number
          registration_starts: number
        }[]
      }
      get_performance_metrics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          avg_api_latency: number
          avg_cls: number
          avg_fid: number
          avg_lcp: number
          error_rate: number
        }[]
      }
      get_pwa_metrics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          conversion_rate: number
          installs_completed: number
          prompts_shown: number
          retention_7d: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_storage_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      send_review_request_emails: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_tournament_status: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
  public: {
    Enums: {},
  },
} as const
