// BuffrSign Platform - Document Service
// Handles _document upload, processing, AI analysis, and management

'use client';

import { supabase } from '../supabase';
import { Database } from '../database.types';

// ============================================================================
// TYPES
// ============================================================================

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

export interface DocumentUploadData {
  file: File | null;
  title: string;
  documentType?: string;
  industry?: string;
  jurisdiction?: string;
  isKycDocument?: boolean;
  kycDocumentType?: string;
}

export interface DocumentWithAnalysis extends Document {
  ai_analysis_requests?: Database['public']['Tables']['ai_analysis_requests']['Row'][];
  signatures?: Database['public']['Tables']['signatures']['Row'][];
}

export interface DocumentStats {
  total: number;
  pending: number;
  completed: number;
  thisMonth: number;
  aiInsights: number;
}

// ============================================================================
// DOCUMENT SERVICE CLASS
// ============================================================================

export class DocumentService {
  private supabase = supabase;

  // ============================================================================
  // DOCUMENT UPLOAD AND PROCESSING
  // ============================================================================

  /*
   * Validate file before upload
   */
  // validateFile(file: File): { isValid: boolean; errors: string[] } {
  //   const errors: string[] = [];
  // }
  /**
  async uploadDocument(
    userId: string,
    uploadData: DocumentUploadData
  ): Promise<{ success: boolean; _document?: Document; error?: string }> {
    try {
      if (!uploadData.file) {
        return { success: false, error: 'No file provided' };
      }

      // Generate unique file path
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${userId}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await this.supabase.storage
        .from('documents')
        .upload(filePath, uploadData.file);

      if (uploadError) {
        return { success: false, error: `Upload failed: ${uploadError.message}` };
      }

      // Calculate file hash for integrity verification
      const fileHash = await this.calculateFileHash(uploadData.file);

      // Create _document record
      const documentData: DocumentInsert = {
        title: uploadData.title,
        file_path: filePath,
        file_hash: fileHash,
        file_size: uploadData.file.size,
        mime_type: uploadData.file.type,
        created_by: userId,
        status: 'uploaded',
        ai_analysis_enabled: true,
        ai_analysis_status: 'pending',
        document_type: uploadData.documentType || 'other',
        industry: uploadData.industry,
        jurisdiction: uploadData.jurisdiction,
        is_kyc_document: uploadData.isKycDocument || false,
        kyc_document_type: uploadData.kycDocumentType,
      };

      const { data: _document, error: insertError } = await this.supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (insertError) {
        // Clean up uploaded file if database insert fails
        await this.supabase.storage.from('documents').remove([filePath]);
        return { success: false, error: `Database error: ${insertError.message}` };
      }

      // Trigger AI analysis
      await this.triggerAIAnalysis(_document.id);

      return { success: true, _document };
    } catch (error) {
      console.error('Document upload error:', error);
      return { success: false, error: 'Upload failed' };
    }
  }

  /**
   * Calculate file hash for integrity verification
   */
  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Trigger AI analysis for a document
   */
  async triggerAIAnalysis(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update _document status
      await this.supabase
        .from('documents')
        .update({ ai_analysis_status: 'processing' })
        .eq('id', documentId);

      // In a real implementation, this would call your AI analysis API
      // For now, we'll simulate the process
      setTimeout(async () => {
        await this.completeAIAnalysis(documentId);
      }, 5000);

      return { success: true };
    } catch (error) {
      console.error('AI analysis trigger error:', error);
      return { success: false, error: 'Failed to trigger AI analysis' };
    }
  }

  /**
   * Complete AI analysis (simulated)
   */
  private async completeAIAnalysis(documentId: string): Promise<void> {
    try {
      // Simulate AI analysis results
      const analysisData = {
        document_id: documentId,
        analysis_type: 'document_classification',
        document_summary: 'AI-generated _document summary',
        key_clauses: ['Clause 1', 'Clause 2'],
        signature_fields: [
          { x: 100, y: 200, width: 150, height: 50, page: 1, required: true }
        ],
        compliance_score: 85,
        eta_compliance: { compliant: true, score: 90 },
        recommendations: ['Add signature field here', 'Consider adding witness signature'],
        risk_assessment: { level: 'low', factors: [] },
        primary_ocr_method: 'gpt4_vision',
        confidence_scores: { overall: 0.92, text_extraction: 0.88, field_detection: 0.95 },
        image_quality_score: 0.89,
        text_clarity_score: 0.91,
        overall_quality_score: 0.90,
        processing_time_ms: 2500,
      };

      // Insert AI analysis request
      const { error: analysisError } = await this.supabase
        .from('ai_analysis_requests')
        .insert({
          document_id: documentId,
          analysis_type: ['document_classification', 'field_extraction', 'compliance_check'],
          priority: 'medium',
          status: 'completed',
          result: analysisData,
          confidence_score: analysisData.overall_quality_score,
          processing_time: analysisData.processing_time_ms
        });

      if (analysisError) {
        console.error('AI analysis insert error:', analysisError);
      }

      // Update _document status
      await this.supabase
        .from('documents')
        .update({ 
          ai_analysis_status: 'completed',
          ai_analysis_id: documentId // This should be the actual analysis ID
        })
        .eq('id', documentId);

    } catch (error) {
      console.error('AI analysis completion error:', error);
    }
  }

  // ============================================================================
  // DOCUMENT RETRIEVAL
  // ============================================================================

  /**
   * Get _user's documents with optional filtering
   */
  async getUserDocuments(
    userId: string,
    options: {
      status?: string;
      documentType?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ success: boolean; documents?: DocumentWithAnalysis[]; error?: string }> {
    try {
      let query = this.supabase
        .from('documents')
        .select(`
          *,
          ai_analysis (*),
          signatures (*),
          recipients (*)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.documentType) {
        query = query.eq('document_type', options.documentType);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data: documents, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, documents: documents || [] };
    } catch (error) {
      console.error('Get documents error:', error);
      return { success: false, error: 'Failed to fetch documents' };
    }
  }

  /**
   * Get a single _document by ID
   */
  async getDocument(
    documentId: string
  ): Promise<{ success: boolean; _document?: DocumentWithAnalysis; error?: string }> {
    try {
      const { data: _document, error } = await this.supabase
        .from('documents')
        .select(`
          *,
          ai_analysis (*),
          signatures (*),
          recipients (*)
        `)
        .eq('id', documentId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, _document };
    } catch (error) {
      console.error('Get _document error:', error);
      return { success: false, error: 'Failed to fetch _document' };
    }
  }

  /**
   * Get _document statistics for a user
   */
  async getDocumentStats(userId: string): Promise<{ success: boolean; stats?: DocumentStats; error?: string }> {
    try {
      const { data: documents, error } = await this.supabase
        .from('documents')
        .select('status, created_at, ai_analysis_id')
        .eq('created_by', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: DocumentStats = {
        total: documents?.length || 0,
        pending: documents?.filter(d => d.status === 'pending' || d.status === 'uploaded').length || 0,
        completed: documents?.filter(d => d.status === 'completed' || d.status === 'signed').length || 0,
        thisMonth: documents?.filter(d => new Date(d.created_at || '') >= thisMonth).length || 0,
        aiInsights: documents?.filter(d => d.ai_analysis_id).length || 0,
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Get _document stats error:', error);
      return { success: false, error: 'Failed to fetch _document statistics' };
    }
  }

  // ============================================================================
  // DOCUMENT MANAGEMENT
  // ============================================================================

  /**
   * Update _document metadata
   */
  async updateDocument(
    documentId: string,
    updates: DocumentUpdate
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Update _document error:', error);
      return { success: false, error: 'Failed to update _document' };
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get _document to find file path
      const { data: _document, error: fetchError } = await this.supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      // Delete file from storage
      if (_document.file_path) {
        await this.supabase.storage.from('documents').remove([_document.file_path]);
      }

      // Delete _document record
      const { error: deleteError } = await this.supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete _document error:', error);
      return { success: false, error: 'Failed to delete _document' };
    }
  }

  /**
   * Get _document download URL
   */
  async getDocumentDownloadUrl(documentId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data: _document, error: fetchError } = await this.supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      const { data, error: urlError } = await this.supabase.storage
        .from('documents')
        .createSignedUrl(_document.file_path, 3600); // 1 hour expiry

      if (urlError) {
        return { success: false, error: urlError.message };
      }

      return { success: true, url: data.signedUrl };
    } catch (error) {
      console.error('Get download URL error:', error);
      return { success: false, error: 'Failed to generate download URL' };
    }
  }

  // ============================================================================
  // AI ANALYSIS
  // ============================================================================

  /**
   * Get AI analysis for a document
   */
  async getAIAnalysis(
    documentId: string
  ): Promise<{ success: boolean; analysis?: Database['public']['Tables']['ai_analysis_requests']['Row']; error?: string }> {
    try {
      const { data: analysis, error } = await this.supabase
        .from('ai_analysis_requests')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, analysis };
    } catch (error) {
      console.error('Get AI analysis error:', error);
      return { success: false, error: 'Failed to fetch AI analysis' };
    }
  }

  /**
   * Get AI insights for a document
   */
  async getAIInsights(
    documentId: string
  ): Promise<{ success: boolean; insights?: Database['public']['Tables']['ai_analysis_requests']['Row'][]; error?: string }> {
    try {
      const { data: insights, error } = await this.supabase
        .from('ai_analysis_requests')
        .select('*')
        .eq('document_id', documentId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, insights: insights || [] };
    } catch (error) {
      console.error('Get AI insights error:', error);
      return { success: false, error: 'Failed to fetch AI insights' };
    }
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to _document changes
   */
  subscribeToDocumentChanges(
    userId: string,
    callback: (payload: Record<string, unknown>) => void
  ) {
    return this.supabase
      .channel(`documents:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `created_by=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  /**
   * Subscribe to AI analysis updates
   */
  subscribeToAIAnalysisUpdates(
    documentId: string,
    callback: (payload: Record<string, unknown>) => void
  ) {
    return this.supabase
      .channel(`ai_analysis:${documentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_analysis',
          filter: `document_id=eq.${documentId}`,
        },
        callback
      )
      .subscribe();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const documentService = new DocumentService();
export default documentService;
