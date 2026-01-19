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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          click_count: number
          created_at: string
          display_locations: string[]
          end_date: string
          id: string
          image_url: string
          is_active: boolean
          start_date: string
          target_url: string
          title: string
          updated_at: string
        }
        Insert: {
          click_count?: number
          created_at?: string
          display_locations?: string[]
          end_date: string
          id?: string
          image_url: string
          is_active?: boolean
          start_date: string
          target_url: string
          title: string
          updated_at?: string
        }
        Update: {
          click_count?: number
          created_at?: string
          display_locations?: string[]
          end_date?: string
          id?: string
          image_url?: string
          is_active?: boolean
          start_date?: string
          target_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_public"
            referencedColumns: ["id"]
          },
        ]
      }
      financing_offers: {
        Row: {
          company_name: string
          company_type: string
          created_at: string
          description: string | null
          email: string | null
          features: string[] | null
          id: string
          interest_rate: number
          is_approved: boolean | null
          is_featured: boolean | null
          logo_url: string | null
          max_amount: number
          max_dti: number
          max_tenure: number
          min_salary: number
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name: string
          company_type?: string
          created_at?: string
          description?: string | null
          email?: string | null
          features?: string[] | null
          id?: string
          interest_rate: number
          is_approved?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          max_amount: number
          max_dti?: number
          max_tenure?: number
          min_salary: number
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          company_type?: string
          created_at?: string
          description?: string | null
          email?: string | null
          features?: string[] | null
          id?: string
          interest_rate?: number
          is_approved?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          max_amount?: number
          max_dti?: number
          max_tenure?: number
          min_salary?: number
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          property_id: string | null
          receiver_id: string
          sender_id: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          property_id?: string | null
          receiver_id: string
          sender_id: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          property_id?: string | null
          receiver_id?: string
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_public"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          property_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          property_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          property_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_public"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          city: string
          created_at: string
          id: string
          is_active: boolean
          max_price: number
          property_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_price: number
          property_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_price?: number
          property_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[] | null
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_approved: boolean | null
          is_featured: boolean | null
          latitude: number | null
          listing_type: string
          longitude: number | null
          neighborhood: string | null
          price: number
          property_type: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          listing_type?: string
          longitude?: number | null
          neighborhood?: string | null
          price: number
          property_type?: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          listing_type?: string
          longitude?: number | null
          neighborhood?: string | null
          price?: number
          property_type?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_comparisons: {
        Row: {
          created_at: string
          id: string
          property_ids: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_ids: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_ids?: string[]
          user_id?: string
        }
        Relationships: []
      }
      property_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          property_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          property_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          property_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_public"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_financing_reports: {
        Row: {
          age: number
          car_loan_installment: number | null
          created_at: string
          credit_card_limit: number | null
          down_payment: number
          dti: number
          eligible_banks_count: number | null
          has_car_loan: boolean | null
          has_credit_card: boolean | null
          has_personal_loan: boolean | null
          id: string
          interest_rate: number
          is_eligible: boolean
          loan_amount: number
          monthly_payment: number
          other_income: number | null
          personal_loan_amount: number | null
          property_price: number
          remaining_income: number
          report_name: string
          salary: number
          sector: string
          tenure: number
          total_interest: number
          total_obligations: number | null
          total_payment: number
          user_id: string
        }
        Insert: {
          age: number
          car_loan_installment?: number | null
          created_at?: string
          credit_card_limit?: number | null
          down_payment: number
          dti: number
          eligible_banks_count?: number | null
          has_car_loan?: boolean | null
          has_credit_card?: boolean | null
          has_personal_loan?: boolean | null
          id?: string
          interest_rate: number
          is_eligible: boolean
          loan_amount: number
          monthly_payment: number
          other_income?: number | null
          personal_loan_amount?: number | null
          property_price: number
          remaining_income: number
          report_name: string
          salary: number
          sector: string
          tenure: number
          total_interest: number
          total_obligations?: number | null
          total_payment: number
          user_id: string
        }
        Update: {
          age?: number
          car_loan_installment?: number | null
          created_at?: string
          credit_card_limit?: number | null
          down_payment?: number
          dti?: number
          eligible_banks_count?: number | null
          has_car_loan?: boolean | null
          has_credit_card?: boolean | null
          has_personal_loan?: boolean | null
          id?: string
          interest_rate?: number
          is_eligible?: boolean
          loan_amount?: number
          monthly_payment?: number
          other_income?: number | null
          personal_loan_amount?: number | null
          property_price?: number
          remaining_income?: number
          report_name?: string
          salary?: number
          sector?: string
          tenure?: number
          total_interest?: number
          total_obligations?: number | null
          total_payment?: number
          user_id?: string
        }
        Relationships: []
      }
      saved_search_filters: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      financing_offers_public: {
        Row: {
          company_name: string | null
          company_type: string | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string | null
          interest_rate: number | null
          is_approved: boolean | null
          is_featured: boolean | null
          logo_url: string | null
          max_amount: number | null
          max_dti: number | null
          max_tenure: number | null
          min_salary: number | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          company_name?: string | null
          company_type?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string | null
          interest_rate?: number | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          max_amount?: number | null
          max_dti?: number | null
          max_tenure?: number | null
          min_salary?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string | null
          company_type?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string | null
          interest_rate?: number | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          max_amount?: number | null
          max_dti?: number | null
          max_tenure?: number | null
          min_salary?: number | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      properties_public: {
        Row: {
          address: string | null
          amenities: string[] | null
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string | null
          description: string | null
          id: string | null
          images: string[] | null
          is_approved: boolean | null
          is_featured: boolean | null
          latitude: number | null
          listing_type: string | null
          longitude: number | null
          neighborhood: string | null
          price: number | null
          property_type: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: string[] | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          listing_type?: string | null
          longitude?: number | null
          neighborhood?: string | null
          price?: number | null
          property_type?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: string[] | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          listing_type?: string | null
          longitude?: number | null
          neighborhood?: string | null
          price?: number | null
          property_type?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
