// BuffrSign Platform - KYC Service
'use client';

import { supabase } from '../supabase';
import { Database } from '../database.types';

type KYCData = Database['public']['Tables']['kyc_data']['Row'];

export interface KYCWorkflowData {
  userId: string;
  documentId: string;
  documentType: string;
  country?: string;
}

export class KYCService {
  private supabase = supabase;

  async startKYCWorkflow(
    workflowData: KYCWorkflowData
  ): Promise<{ success: boolean; kycData?: KYCData; error?: string }> {
    try {
      const kycInsert = {
        user_id: workflowData.userId,
        identity_documents: { document_id: workflowData.documentId, type: workflowData.documentType },
        financial_documents: {},
        employment_verification: {},
        consent: { given: false, timestamp: new Date().toISOString() },
        verification_status: 'pending',
        verification_score: 0,
      };

      const { data: kycData, error } = await this.supabase
        .from('kyc_data')
        .insert(kycInsert)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, kycData };
    } catch (error) {
      console.error('Start KYC workflow error:', error);
      return { success: false, error: 'Failed to start KYC workflow' };
    }
  }

  async getUserKYCData(
    userId: string
  ): Promise<{ success: boolean; kycData?: KYCData; error?: string }> {
    try {
      const { data: kycData, error } = await this.supabase
        .from('kyc_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, kycData };
    } catch (error) {
      console.error('Get KYC data error:', error);
      return { success: false, error: 'Failed to fetch KYC data' };
    }
  }
}

export const kycService = new KYCService();
export default kycService;
