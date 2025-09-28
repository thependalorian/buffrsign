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
      admin_email_activity: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      ai_analysis: {
        Row: {
          analysis_metadata: Json | null
          analysis_type: string
          compliance_score: number | null
          confidence_scores: Json | null
          created_at: string | null
          document_id: string
          document_summary: string | null
          eta_compliance: Json | null
          extracted_fields: Json | null
          fallback_methods: Database["public"]["Enums"]["ai_method"][] | null
          field_confidences: Json | null
          id: string
          image_quality_score: number | null
          key_clauses: Json | null
          kyc_workflow_id: string | null
          overall_quality_score: number | null
          primary_ocr_method: Database["public"]["Enums"]["ai_method"] | null
          processing_time_ms: number | null
          recommendations: Json | null
          risk_assessment: Json | null
          signature_fields: Json | null
          text_clarity_score: number | null
          updated_at: string | null
        }
        Insert: {
          analysis_metadata?: Json | null
          analysis_type?: string
          compliance_score?: number | null
          confidence_scores?: Json | null
          created_at?: string | null
          document_id: string
          document_summary?: string | null
          eta_compliance?: Json | null
          extracted_fields?: Json | null
          fallback_methods?: Database["public"]["Enums"]["ai_method"][] | null
          field_confidences?: Json | null
          id?: string
          image_quality_score?: number | null
          key_clauses?: Json | null
          kyc_workflow_id?: string | null
          overall_quality_score?: number | null
          primary_ocr_method?: Database["public"]["Enums"]["ai_method"] | null
          processing_time_ms?: number | null
          recommendations?: Json | null
          risk_assessment?: Json | null
          signature_fields?: Json | null
          text_clarity_score?: number | null
          updated_at?: string | null
        }
        Update: {
          analysis_metadata?: Json | null
          analysis_type?: string
          compliance_score?: number | null
          confidence_scores?: Json | null
          created_at?: string | null
          document_id?: string
          document_summary?: string | null
          eta_compliance?: Json | null
          extracted_fields?: Json | null
          fallback_methods?: Database["public"]["Enums"]["ai_method"][] | null
          field_confidences?: Json | null
          id?: string
          image_quality_score?: number | null
          key_clauses?: Json | null
          kyc_workflow_id?: string | null
          overall_quality_score?: number | null
          primary_ocr_method?: Database["public"]["Enums"]["ai_method"] | null
          processing_time_ms?: number | null
          recommendations?: Json | null
          risk_assessment?: Json | null
          signature_fields?: Json | null
          text_clarity_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analysis_kyc_workflow_id_fkey"
            columns: ["kyc_workflow_id"]
            isOneToOne: false
            referencedRelation: "kyc_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          compliance_gaps: Json | null
          confidence_scores: Json | null
          created_at: string | null
          document_id: string
          id: string
          insight_type: string
          key_points: Json | null
          optimization_suggestions: Json | null
          risk_factors: Json | null
          signature_recommendations: Json | null
          updated_at: string | null
        }
        Insert: {
          compliance_gaps?: Json | null
          confidence_scores?: Json | null
          created_at?: string | null
          document_id: string
          id?: string
          insight_type: string
          key_points?: Json | null
          optimization_suggestions?: Json | null
          risk_factors?: Json | null
          signature_recommendations?: Json | null
          updated_at?: string | null
        }
        Update: {
          compliance_gaps?: Json | null
          confidence_scores?: Json | null
          created_at?: string | null
          document_id?: string
          id?: string
          insight_type?: string
          key_points?: Json | null
          optimization_suggestions?: Json | null
          risk_factors?: Json | null
          signature_recommendations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workflows: {
        Row: {
          ai_recommendations: Json | null
          completed_at: string | null
          compliance_checklist: Json | null
          created_at: string | null
          document_id: string
          execution_log: Json | null
          id: string
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_guidance: Json | null
          workflow_config: Json | null
          workflow_type: string
        }
        Insert: {
          ai_recommendations?: Json | null
          completed_at?: string | null
          compliance_checklist?: Json | null
          created_at?: string | null
          document_id: string
          execution_log?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_guidance?: Json | null
          workflow_config?: Json | null
          workflow_type: string
        }
        Update: {
          ai_recommendations?: Json | null
          completed_at?: string | null
          compliance_checklist?: Json | null
          created_at?: string | null
          document_id?: string
          execution_log?: Json | null
          id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_guidance?: Json | null
          workflow_config?: Json | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workflows_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          action: string
          ai_insight_id: string | null
          ai_related: boolean | null
          ai_workflow_id: string | null
          created_at: string | null
          details: Json | null
          document_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          ai_insight_id?: string | null
          ai_related?: boolean | null
          ai_workflow_id?: string | null
          created_at?: string | null
          details?: Json | null
          document_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          ai_insight_id?: string | null
          ai_related?: boolean | null
          ai_workflow_id?: string | null
          created_at?: string | null
          details?: Json | null
          document_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_ai_insight_id_fkey"
            columns: ["ai_insight_id"]
            isOneToOne: false
            referencedRelation: "ai_insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_ai_workflow_id_fkey"
            columns: ["ai_workflow_id"]
            isOneToOne: false
            referencedRelation: "ai_workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_analysis: {
        Row: {
          analysis_metadata: Json | null
          compliance_analysis: string | null
          compliance_score: number | null
          cran_compliance: Json | null
          created_at: string | null
          document_id: string
          eta_sections: Json | null
          frameworks: Json
          id: string
          jurisdiction: string | null
          recommendations: Json | null
          remediation_plan: Json | null
          risk_assessment: Json | null
          updated_at: string | null
        }
        Insert: {
          analysis_metadata?: Json | null
          compliance_analysis?: string | null
          compliance_score?: number | null
          cran_compliance?: Json | null
          created_at?: string | null
          document_id: string
          eta_sections?: Json | null
          frameworks?: Json
          id?: string
          jurisdiction?: string | null
          recommendations?: Json | null
          remediation_plan?: Json | null
          risk_assessment?: Json | null
          updated_at?: string | null
        }
        Update: {
          analysis_metadata?: Json | null
          compliance_analysis?: string | null
          compliance_score?: number | null
          cran_compliance?: Json | null
          created_at?: string | null
          document_id?: string
          eta_sections?: Json | null
          frameworks?: Json
          id?: string
          jurisdiction?: string | null
          recommendations?: Json | null
          remediation_plan?: Json | null
          risk_assessment?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_analysis_enabled: boolean | null
          ai_analysis_id: string | null
          ai_analysis_status: string | null
          compliance_analysis_id: string | null
          created_at: string | null
          created_by: string | null
          document_type: string | null
          expires_at: string | null
          file_hash: string
          file_path: string
          file_size: number
          id: string
          industry: string | null
          is_kyc_document: boolean | null
          jurisdiction: string | null
          kyc_document_type: string | null
          kyc_workflow_id: string | null
          mime_type: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_analysis_enabled?: boolean | null
          ai_analysis_id?: string | null
          ai_analysis_status?: string | null
          compliance_analysis_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string | null
          expires_at?: string | null
          file_hash: string
          file_path: string
          file_size: number
          id?: string
          industry?: string | null
          is_kyc_document?: boolean | null
          jurisdiction?: string | null
          kyc_document_type?: string | null
          kyc_workflow_id?: string | null
          mime_type: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_analysis_enabled?: boolean | null
          ai_analysis_id?: string | null
          ai_analysis_status?: string | null
          compliance_analysis_id?: string | null
          created_at?: string | null
          created_by?: string | null
          document_type?: string | null
          expires_at?: string | null
          file_hash?: string
          file_path?: string
          file_size?: number
          id?: string
          industry?: string | null
          is_kyc_document?: boolean | null
          jurisdiction?: string | null
          kyc_document_type?: string | null
          kyc_workflow_id?: string | null
          mime_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_ai_analysis_id_fkey"
            columns: ["ai_analysis_id"]
            isOneToOne: false
            referencedRelation: "ai_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_compliance_analysis_id_fkey"
            columns: ["compliance_analysis_id"]
            isOneToOne: false
            referencedRelation: "compliance_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_kyc_workflow_id_fkey"
            columns: ["kyc_workflow_id"]
            isOneToOne: false
            referencedRelation: "kyc_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_workflows: {
        Row: {
          ai_field_extraction: Json | null
          audit_trail: Json | null
          completed_at: string | null
          compliance_status: Json | null
          country_confidence: number | null
          country_detection_method:
            | Database["public"]["Enums"]["ai_method"]
            | null
          created_at: string | null
          decision_confidence: number | null
          detected_country: string | null
          document_id: string | null
          final_decision: Database["public"]["Enums"]["kyc_decision"] | null
          id: string
          ocr_extraction: Json | null
          processing_time_ms: number | null
          rejection_reasons: string[] | null
          sadc_validation: Json | null
          total_confidence: number | null
          updated_at: string | null
          user_id: string
          workflow_state: Database["public"]["Enums"]["kyc_workflow_state"]
        }
        Insert: {
          ai_field_extraction?: Json | null
          audit_trail?: Json | null
          completed_at?: string | null
          compliance_status?: Json | null
          country_confidence?: number | null
          country_detection_method?:
            | Database["public"]["Enums"]["ai_method"]
            | null
          created_at?: string | null
          decision_confidence?: number | null
          detected_country?: string | null
          document_id?: string | null
          final_decision?: Database["public"]["Enums"]["kyc_decision"] | null
          id?: string
          ocr_extraction?: Json | null
          processing_time_ms?: number | null
          rejection_reasons?: string[] | null
          sadc_validation?: Json | null
          total_confidence?: number | null
          updated_at?: string | null
          user_id: string
          workflow_state?: Database["public"]["Enums"]["kyc_workflow_state"]
        }
        Update: {
          ai_field_extraction?: Json | null
          audit_trail?: Json | null
          completed_at?: string | null
          compliance_status?: Json | null
          country_confidence?: number | null
          country_detection_method?:
            | Database["public"]["Enums"]["ai_method"]
            | null
          created_at?: string | null
          decision_confidence?: number | null
          detected_country?: string | null
          document_id?: string | null
          final_decision?: Database["public"]["Enums"]["kyc_decision"] | null
          id?: string
          ocr_extraction?: Json | null
          processing_time_ms?: number | null
          rejection_reasons?: string[] | null
          sadc_validation?: Json | null
          total_confidence?: number | null
          updated_at?: string | null
          user_id?: string
          workflow_state?: Database["public"]["Enums"]["kyc_workflow_state"]
        }
        Relationships: [
          {
            foreignKeyName: "kyc_workflows_detected_country_fkey"
            columns: ["detected_country"]
            isOneToOne: false
            referencedRelation: "sadc_countries"
            referencedColumns: ["country_code"]
          },
          {
            foreignKeyName: "kyc_workflows_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
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
          id: string
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
          id: string
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
          id?: string
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
      recipients: {
        Row: {
          created_at: string | null
          document_id: string | null
          email: string
          full_name: string
          id: string
          role: string | null
          signed_at: string | null
          signing_order: number | null
          status: string | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          email: string
          full_name: string
          id?: string
          role?: string | null
          signed_at?: string | null
          signing_order?: number | null
          status?: string | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string | null
          signed_at?: string | null
          signing_order?: number | null
          status?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipients_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      sadc_countries: {
        Row: {
          country_code: string
          country_name: string
          created_at: string | null
          date_format: string
          id: string
          id_format: string
          id_patterns: string[]
          is_active: boolean | null
          keywords: string[]
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string | null
          date_format: string
          id?: string
          id_format: string
          id_patterns: string[]
          is_active?: boolean | null
          keywords: string[]
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string | null
          date_format?: string
          id?: string
          id_format?: string
          id_patterns?: string[]
          is_active?: boolean | null
          keywords?: string[]
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: []
      }
      signatures: {
        Row: {
          ai_analysis_method: Database["public"]["Enums"]["ai_method"] | null
          ai_confidence_score: number | null
          ai_detected: boolean | null
          ai_quality_assessment: Json | null
          certificate_id: string | null
          compliance_verified: boolean | null
          created_at: string | null
          document_id: string | null
          eta_compliance_status: string | null
          id: string
          ip_address: unknown | null
          recipient_id: string | null
          signature_data: string
          signature_field_id: string | null
          signature_type: string
          timestamp_token: string | null
          user_agent: string | null
        }
        Insert: {
          ai_analysis_method?: Database["public"]["Enums"]["ai_method"] | null
          ai_confidence_score?: number | null
          ai_detected?: boolean | null
          ai_quality_assessment?: Json | null
          certificate_id?: string | null
          compliance_verified?: boolean | null
          created_at?: string | null
          document_id?: string | null
          eta_compliance_status?: string | null
          id?: string
          ip_address?: unknown | null
          recipient_id?: string | null
          signature_data: string
          signature_field_id?: string | null
          signature_type: string
          timestamp_token?: string | null
          user_agent?: string | null
        }
        Update: {
          ai_analysis_method?: Database["public"]["Enums"]["ai_method"] | null
          ai_confidence_score?: number | null
          ai_detected?: boolean | null
          ai_quality_assessment?: Json | null
          certificate_id?: string | null
          compliance_verified?: boolean | null
          created_at?: string | null
          document_id?: string | null
          eta_compliance_status?: string | null
          id?: string
          ip_address?: unknown | null
          recipient_id?: string | null
          signature_data?: string
          signature_field_id?: string | null
          signature_type?: string
          timestamp_token?: string | null
          user_agent?: string | null
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
            foreignKeyName: "signatures_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          ai_template_id: string | null
          category: string | null
          compliance_metadata: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          fields: Json
          file_path: string
          id: string
          industry: string | null
          is_ai_generated: boolean | null
          is_public: boolean | null
          jurisdiction: string | null
          name: string
          signature_field_specs: Json | null
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          ai_template_id?: string | null
          category?: string | null
          compliance_metadata?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields: Json
          file_path: string
          id?: string
          industry?: string | null
          is_ai_generated?: boolean | null
          is_public?: boolean | null
          jurisdiction?: string | null
          name: string
          signature_field_specs?: Json | null
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_template_id?: string | null
          category?: string | null
          compliance_metadata?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fields?: Json
          file_path?: string
          id?: string
          industry?: string | null
          is_ai_generated?: boolean | null
          is_public?: boolean | null
          jurisdiction?: string | null
          name?: string
          signature_field_specs?: Json | null
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_type: string | null
          company_name: string | null
          created_at: string | null
          email: string
          first_name: string
          full_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_login_at: string | null
          last_name: string
          namibian_id: string | null
          password_hash: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          first_name: string
          full_name: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_name: string
          namibian_id?: string | null
          password_hash?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_name?: string
          namibian_id?: string | null
          password_hash?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_document_audit_trail: {
        Args: { doc_uuid: string }
        Returns: {
          action: string
          created_at: string
          details: Json
          user_name: string
        }[]
      }
    }
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