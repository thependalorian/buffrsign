// BuffrSign Platform - Supabase Database Types
// Generated types for database schema based on actual Supabase database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      // ============================================================================
      // USERS TABLE (Main user table)
      // ============================================================================
      users: {
        Row: {
          id: string
          account_type: string | null
          email: string
          full_name: string
          first_name: string
          last_name: string
          phone: string | null
          namibian_id: string | null
          company_name: string | null
          is_verified: boolean | null
          is_active: boolean | null
          role: string | null
          password_hash: string | null
          last_login_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          account_type?: string | null
          email: string
          full_name: string
          first_name: string
          last_name: string
          phone?: string | null
          namibian_id?: string | null
          company_name?: string | null
          is_verified?: boolean | null
          is_active?: boolean | null
          role?: string | null
          password_hash?: string | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          account_type?: string | null
          email?: string
          full_name?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          namibian_id?: string | null
          company_name?: string | null
          is_verified?: boolean | null
          is_active?: boolean | null
          role?: string | null
          password_hash?: string | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      // ============================================================================
      // PROFILES TABLE (Extended user profile information)
      // ============================================================================
      profiles: {
        Row: {
          id: string
          account_type: string | null
          avatar_url: string | null
          can_access_admin_panel: boolean | null
          can_manage_compliance: boolean | null
          can_manage_documents: boolean | null
          can_manage_kyc: boolean | null
          can_manage_settings: boolean | null
          can_manage_super_admins: boolean | null
          can_manage_templates: boolean | null
          can_manage_users: boolean | null
          can_view_analytics: boolean | null
          can_view_dashboard: boolean | null
          company_name: string | null
          created_at: string | null
          email_notifications: boolean | null
          first_name: string
          full_name: string | null
          is_active: boolean | null
          is_verified: boolean | null
          language: string | null
          last_login_at: string | null
          last_name: string
          namibian_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          sms_notifications: boolean | null
          theme: string | null
          timezone: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          id: string
          account_type?: string | null
          avatar_url?: string | null
          can_access_admin_panel?: boolean | null
          can_manage_compliance?: boolean | null
          can_manage_documents?: boolean | null
          can_manage_kyc?: boolean | null
          can_manage_settings?: boolean | null
          can_manage_super_admins?: boolean | null
          can_manage_templates?: boolean | null
          can_manage_users?: boolean | null
          can_view_analytics?: boolean | null
          can_view_dashboard?: boolean | null
          company_name?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          first_name: string
          full_name?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          last_login_at?: string | null
          last_name: string
          namibian_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sms_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          account_type?: string | null
          avatar_url?: string | null
          can_access_admin_panel?: boolean | null
          can_manage_compliance?: boolean | null
          can_manage_documents?: boolean | null
          can_manage_kyc?: boolean | null
          can_manage_settings?: boolean | null
          can_manage_super_admins?: boolean | null
          can_manage_templates?: boolean | null
          can_manage_users?: boolean | null
          can_view_analytics?: boolean | null
          can_view_dashboard?: boolean | null
          company_name?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          first_name?: string
          full_name?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          last_login_at?: string | null
          last_name?: string
          namibian_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sms_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }

      // ============================================================================
      // DOCUMENTS TABLE
      // ============================================================================
      documents: {
        Row: {
          id: string
          title: string
          file_path: string
          file_hash: string
          file_size: number
          mime_type: string
          created_by: string | null
          expires_at: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          ai_analysis_enabled: boolean | null
          ai_analysis_status: string | null
          ai_analysis_id: string | null
          compliance_analysis_id: string | null
          document_type: string | null
          industry: string | null
          jurisdiction: string | null
          kyc_workflow_id: string | null
          is_kyc_document: boolean | null
          kyc_document_type: string | null
        }
        Insert: {
          id?: string
          title: string
          file_path: string
          file_hash: string
          file_size: number
          mime_type: string
          created_by?: string | null
          expires_at?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          ai_analysis_enabled?: boolean | null
          ai_analysis_status?: string | null
          ai_analysis_id?: string | null
          compliance_analysis_id?: string | null
          document_type?: string | null
          industry?: string | null
          jurisdiction?: string | null
          kyc_workflow_id?: string | null
          is_kyc_document?: boolean | null
          kyc_document_type?: string | null
        }
        Update: {
          id?: string
          title?: string
          file_path?: string
          file_hash?: string
          file_size?: number
          mime_type?: string
          created_by?: string | null
          expires_at?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          ai_analysis_enabled?: boolean | null
          ai_analysis_status?: string | null
          ai_analysis_id?: string | null
          compliance_analysis_id?: string | null
          document_type?: string | null
          industry?: string | null
          jurisdiction?: string | null
          kyc_workflow_id?: string | null
          is_kyc_document?: boolean | null
          kyc_document_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      // ============================================================================
      // SIGNATURES TABLE
      // ============================================================================
      signatures: {
        Row: {
          id: string
          document_id: string
          signer_id: string
          field_name: string
          signature_data: Json
          signature_type: string
          timestamp: string
          ip_address: string
          user_agent: string
          verification_status: string
          certificate_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_id: string
          signer_id: string
          field_name: string
          signature_data: Json
          signature_type: string
          timestamp?: string
          ip_address: string
          user_agent: string
          verification_status?: string
          certificate_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          signer_id?: string
          field_name?: string
          signature_data?: Json
          signature_type?: string
          timestamp?: string
          ip_address?: string
          user_agent?: string
          verification_status?: string
          certificate_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }

      // ============================================================================
      // SIGNATURE WORKFLOWS TABLE
      // ============================================================================
      signature_workflows: {
        Row: {
          id: string
          document_id: string
          initiator_id: string
          participants: Json
          current_step: string
          status: string
          steps: Json
          metadata: Json | null
          audit_trail: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_id: string
          initiator_id: string
          participants: Json
          current_step?: string
          status?: string
          steps: Json
          metadata?: Json | null
          audit_trail?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          initiator_id?: string
          participants?: Json
          current_step?: string
          status?: string
          steps?: Json
          metadata?: Json | null
          audit_trail?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signature_workflows_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_workflows_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }

      // ============================================================================
      // AUDIT EVENTS TABLE
      // ============================================================================
      audit_events: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          details: Json | null
          ip_address: string
          user_agent: string
          session_id: string
          severity: string
          compliance_related: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          details?: Json | null
          ip_address: string
          user_agent: string
          session_id: string
          severity?: string
          compliance_related?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string
          resource_id?: string
          details?: Json | null
          ip_address?: string
          user_agent?: string
          session_id?: string
          severity?: string
          compliance_related?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }

      // ============================================================================
      // COMPLIANCE REPORTS TABLE
      // ============================================================================
      compliance_reports: {
        Row: {
          id: string
          report_type: string
          period: string
          status: string
          findings: Json | null
          recommendations: string[] | null
          generated_by: string
          reviewed_by: string | null
          review_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_type: string
          period: string
          status?: string
          findings?: Json | null
          recommendations?: string[] | null
          generated_by: string
          reviewed_by?: string | null
          review_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_type?: string
          period?: string
          status?: string
          findings?: Json | null
          recommendations?: string[] | null
          generated_by?: string
          reviewed_by?: string | null
          review_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "compliance_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }

      // ============================================================================
      // AI ANALYSIS REQUESTS TABLE
      // ============================================================================
      ai_analysis_requests: {
        Row: {
          id: string
          document_id: string
          analysis_type: string[]
          priority: string
          callback_url: string | null
          metadata: Json | null
          status: string
          result: Json | null
          error: string | null
          processing_time: number | null
          confidence_score: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          document_id: string
          analysis_type: string[]
          priority?: string
          callback_url?: string | null
          metadata?: Json | null
          status?: string
          result?: Json | null
          error?: string | null
          processing_time?: number | null
          confidence_score?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          document_id?: string
          analysis_type?: string[]
          priority?: string
          callback_url?: string | null
          metadata?: Json | null
          status?: string
          result?: Json | null
          error?: string | null
          processing_time?: number | null
          confidence_score?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }

      // ============================================================================
      // KYC DATA TABLE
      // ============================================================================
      kyc_data: {
        Row: {
          id: string
          user_id: string
          identity_documents: Json
          financial_documents: Json
          employment_verification: Json
          consent: Json
          verification_status: string
          verification_score: number | null
          reviewed_by: string | null
          review_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          identity_documents: Json
          financial_documents: Json
          employment_verification: Json
          consent: Json
          verification_status?: string
          verification_score?: number | null
          reviewed_by?: string | null
          review_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          identity_documents?: Json
          financial_documents?: Json
          employment_verification?: Json
          consent?: Json
          verification_status?: string
          verification_score?: number | null
          reviewed_by?: string | null
          review_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "kyc_data_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }

      // ============================================================================
      // ADMIN PERMISSIONS TABLE
      // ============================================================================
      admin_permissions: {
        Row: {
          id: string
          admin_id: string
          level: string
          departments: string[]
          permissions: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          level: string
          departments: string[]
          permissions: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          level?: string
          departments?: string[]
          permissions?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }

      // ============================================================================
      // NOTIFICATIONS TABLE
      // ============================================================================
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          read: boolean
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          read?: boolean
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }

      // ============================================================================
      // TEMPLATES TABLE
      // ============================================================================
      templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: string
          content: Json
          signature_fields: Json
          is_public: boolean
          tags: string[]
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category: string
          content: Json
          signature_fields: Json
          is_public?: boolean
          tags?: string[]
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: string
          content?: Json
          signature_fields?: Json
          is_public?: boolean
          tags?: string[]
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }

    // ============================================================================
    // VIEWS
    // ============================================================================
    Views: {
      [_ in never]: never
    }

    // ============================================================================
    // FUNCTIONS
    // ============================================================================
    Functions: {
      [_ in never]: never
    }

    // ============================================================================
    // ENUMS
    // ============================================================================
    Enums: {
      ai_method:
        | "gpt4_vision"
        | "google_vision"
        | "azure_vision"
        | "pytesseract_fallback"
        | "pydantic_ai_agent"
        | "openai_structured"
        | "ai_agent_manager"
        | "regex_fallback"
      kyc_decision: "approved" | "rejected" | "pending" | "requires_review"
      kyc_workflow_state:
        | "initialized"
        | "document_uploaded"
        | "ocr_extraction_complete"
        | "ai_country_detection"
        | "ai_field_extraction"
        | "sadc_validation"
        | "compliance_checked"
        | "auto_approved"
        | "auto_rejected"
        | "completed"
        | "failed"
      user_role: "user" | "admin" | "super_admin"
    }
  }
}
