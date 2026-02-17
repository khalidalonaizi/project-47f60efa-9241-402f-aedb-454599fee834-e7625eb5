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
      appraisal_requests: {
        Row: {
          appraiser_id: string | null
          city: string
          created_at: string
          estimated_value: number | null
          id: string
          images: string[] | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          notes: string | null
          property_address: string
          property_type: string
          report_url: string | null
          status: string | null
          updated_at: string
          user_id: string
          visit_date: string | null
          visit_notes: string | null
        }
        Insert: {
          appraiser_id?: string | null
          city: string
          created_at?: string
          estimated_value?: number | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          notes?: string | null
          property_address: string
          property_type: string
          report_url?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          visit_date?: string | null
          visit_notes?: string | null
        }
        Update: {
          appraiser_id?: string | null
          city?: string
          created_at?: string
          estimated_value?: number | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          notes?: string | null
          property_address?: string
          property_type?: string
          report_url?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          visit_date?: string | null
          visit_notes?: string | null
        }
        Relationships: []
      }
      developer_project_phases: {
        Row: {
          completion_percentage: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          images: string[] | null
          project_id: string
          sort_order: number | null
          start_date: string | null
          title: string
          videos: string[] | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          images?: string[] | null
          project_id: string
          sort_order?: number | null
          start_date?: string | null
          title: string
          videos?: string[] | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          images?: string[] | null
          project_id?: string
          sort_order?: number | null
          start_date?: string | null
          title?: string
          videos?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "developer_project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "developer_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_projects: {
        Row: {
          address: string | null
          amenities: string[] | null
          area_from: number | null
          area_to: number | null
          available_units: number | null
          city: string | null
          completion_percentage: number | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          latitude: number | null
          longitude: number | null
          plans: string[] | null
          price_from: number | null
          price_to: number | null
          project_type: string
          status: string
          title: string
          total_units: number | null
          updated_at: string
          user_id: string
          videos: string[] | null
          vision_experience: string | null
          vision_innovation: string | null
          vision_quality: string | null
          vision_sustainability: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          area_from?: number | null
          area_to?: number | null
          available_units?: number | null
          city?: string | null
          completion_percentage?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          plans?: string[] | null
          price_from?: number | null
          price_to?: number | null
          project_type?: string
          status?: string
          title: string
          total_units?: number | null
          updated_at?: string
          user_id: string
          videos?: string[] | null
          vision_experience?: string | null
          vision_innovation?: string | null
          vision_quality?: string | null
          vision_sustainability?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          area_from?: number | null
          area_to?: number | null
          available_units?: number | null
          city?: string | null
          completion_percentage?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          plans?: string[] | null
          price_from?: number | null
          price_to?: number | null
          project_type?: string
          status?: string
          title?: string
          total_units?: number | null
          updated_at?: string
          user_id?: string
          videos?: string[] | null
          vision_experience?: string | null
          vision_innovation?: string | null
          vision_quality?: string | null
          vision_sustainability?: string | null
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
          latitude: number | null
          logo_url: string | null
          longitude: number | null
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
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
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
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
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
      financing_requests: {
        Row: {
          created_at: string
          full_name: string
          id: string
          monthly_income: number
          notes: string | null
          offer_id: string
          phone: string
          property_latitude: number | null
          property_longitude: number | null
          property_price: number
          property_type: string
          provider_id: string
          provider_response: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          monthly_income: number
          notes?: string | null
          offer_id: string
          phone: string
          property_latitude?: number | null
          property_longitude?: number | null
          property_price: number
          property_type: string
          provider_id: string
          provider_response?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          monthly_income?: number
          notes?: string | null
          offer_id?: string
          phone?: string
          property_latitude?: number | null
          property_longitude?: number | null
          property_price?: number
          property_type?: string
          provider_id?: string
          provider_response?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financing_requests_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "financing_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financing_requests_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "financing_offers_public"
            referencedColumns: ["id"]
          },
        ]
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
          account_type: Database["public"]["Enums"]["account_type"] | null
          avatar_url: string | null
          bio: string | null
          commercial_registration: string | null
          company_address: string | null
          company_description: string | null
          company_logo: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          latitude: number | null
          license_number: string | null
          longitude: number | null
          phone: string | null
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          bio?: string | null
          commercial_registration?: string | null
          company_address?: string | null
          company_description?: string | null
          company_logo?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          latitude?: number | null
          license_number?: string | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          bio?: string | null
          commercial_registration?: string | null
          company_address?: string | null
          company_description?: string | null
          company_logo?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          latitude?: number | null
          license_number?: string | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
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
      property_management_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          office_id: string
          property_address: string
          property_latitude: number | null
          property_longitude: number | null
          property_type: string
          requester_name: string
          requester_phone: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          office_id: string
          property_address: string
          property_latitude?: number | null
          property_longitude?: number | null
          property_type: string
          requester_name: string
          requester_phone: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          office_id?: string
          property_address?: string
          property_latitude?: number | null
          property_longitude?: number | null
          property_type?: string
          requester_name?: string
          requester_phone?: string
          status?: string
          updated_at?: string
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
      profiles_public: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"] | null
          avatar_url: string | null
          bio: string | null
          company_address: string | null
          company_description: string | null
          company_logo: string | null
          company_name: string | null
          full_name: string | null
          id: string | null
          latitude: number | null
          license_number: string | null
          longitude: number | null
          phone: string | null
          user_id: string | null
          years_of_experience: number | null
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
      get_public_profiles: {
        Args: never
        Returns: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_url: string
          bio: string
          company_address: string
          company_description: string
          company_logo: string
          company_name: string
          full_name: string
          id: string
          latitude: number
          license_number: string
          longitude: number
          phone: string
          user_id: string
          years_of_experience: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_type:
        | "individual"
        | "real_estate_office"
        | "financing_provider"
        | "appraiser"
        | "developer"
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
      account_type: [
        "individual",
        "real_estate_office",
        "financing_provider",
        "appraiser",
        "developer",
      ],
      app_role: ["admin", "user"],
    },
  },
} as const
