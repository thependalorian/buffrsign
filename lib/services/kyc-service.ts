// BuffrSign Platform - KYC Integration Service
// Handles Know Your Customer verification and profile generation

import {
  IDDocumentExtraction,
  FinancialDocumentExtraction,
  RiskLevel,
  ComplianceStatus,
  ComplianceDetail
} from '../ai-types';

// ============================================================================
// KYC SERVICE TYPES
// ============================================================================

export interface KYCProfile {
  id: string;
  user_id: string;
  verification_status: KYCStatus;
  verification_level: KYCVerificationLevel;
  documents: KYCDocument[];
  personal_info: PersonalInfo;
  address_info: AddressInfo;
  financial_info: FinancialInfo;
  risk_assessment: KYCRiskAssessment;
  compliance_status: ComplianceStatus;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  expires_at?: string;
}

export enum KYCStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

export enum KYCVerificationLevel {
  BASIC = 'basic',
  ENHANCED = 'enhanced',
  FULL = 'full'
}

export interface KYCDocument {
  id: string;
  type: DocumentType;
  country_code: string;
  document_number: string;
  full_name: string;
  surname: string;
  first_names: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  nationality: string;
  issue_date: string;
  expiry_date: string;
  place_of_birth?: string;
  address?: string;
  confidence_score: number;
  verification_status: DocumentVerificationStatus;
  uploaded_at: string;
  verified_at?: string;
  metadata: Record<string, unknown>;
}

export enum DocumentType {
  NATIONAL_ID = 'national_id',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
  BIRTH_CERTIFICATE = 'birth_certificate',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  EMPLOYMENT_LETTER = 'employment_letter',
  TAX_DOCUMENT = 'tax_document'
}

export enum DocumentVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  SUSPICIOUS = 'suspicious'
}

export interface PersonalInfo {
  full_name: string;
  surname: string;
  first_names: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  nationality: string;
  place_of_birth?: string;
  marital_status?: string;
  occupation?: string;
  employer?: string;
  phone_number?: string;
  email: string;
}

export interface AddressInfo {
  street_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  address_type: 'residential' | 'business' | 'mailing';
  verification_status: 'verified' | 'unverified' | 'pending';
  verified_at?: string;
}

export interface FinancialInfo {
  employment_status: 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired';
  annual_income?: number;
  income_currency?: string;
  source_of_funds: string[];
  bank_accounts: BankAccount[];
  risk_category: 'low' | 'medium' | 'high';
}

export interface BankAccount {
  bank_name: string;
  account_type: string;
  account_number: string;
  currency: string;
  balance?: number;
  verification_status: 'verified' | 'unverified' | 'pending';
}

export interface KYCRiskAssessment {
  overall_risk: RiskLevel;
  risk_score: number;
  risk_factors: KYCRiskFactor[];
  mitigation_strategies: string[];
  enhanced_due_diligence_required: boolean;
  monitoring_frequency: 'low' | 'medium' | 'high';
}

export interface KYCRiskFactor {
  factor: string;
  severity: RiskLevel;
  description: string;
  impact: string;
  probability: number;
  mitigation: string;
}

export interface KYCVerificationRequest {
  user_id: string;
  verification_level: KYCVerificationLevel;
  documents: DocumentUpload[];
  personal_info: Partial<PersonalInfo>;
  address_info: Partial<AddressInfo>;
  financial_info: Partial<FinancialInfo>;
  metadata?: Record<string, unknown>;
}

export interface DocumentUpload {
  type: DocumentType;
  country_code: string;
  file_data: string; // Base64 encoded file
  file_name: string;
  file_size: number;
  mime_type: string;
  metadata?: Record<string, unknown>;
}

export interface KYCVerificationResponse {
  success: boolean;
  profile_id?: string;
  verification_status: KYCStatus;
  verification_level: KYCVerificationLevel;
  documents_verified: number;
  total_documents: number;
  risk_assessment: KYCRiskAssessment;
  compliance_status: ComplianceStatus;
  next_steps: string[];
  estimated_completion_time?: number; // hours
  errors?: string[];
}

// ============================================================================
// KYC SERVICE
// ============================================================================

export class KYCService {
  private profiles: Map<string, KYCProfile>;
  private documentProcessor: DocumentProcessor;
  private riskAssessor: RiskAssessor;
  private complianceChecker: ComplianceChecker;

  constructor() {
    this.profiles = new Map();
    this.documentProcessor = new DocumentProcessor();
    this.riskAssessor = new RiskAssessor();
    this.complianceChecker = new ComplianceChecker();
  }

  // ============================================================================
  // MAIN KYC METHODS
  // ============================================================================

  async initiateKYC(request: KYCVerificationRequest): Promise<KYCVerificationResponse> {
    try {
      // Create KYC profile
      const profile = await this.createKYCProfile(request);
      
      // Process uploaded documents
      const documentResults = await this.processDocuments(request.documents);
      
      // Update profile with document information
      profile.documents = documentResults.verified_documents;
      profile.personal_info = { ...profile.personal_info, ...request.personal_info };
      profile.address_info = { ...profile.address_info, ...request.address_info };
      profile.financial_info = { ...profile.financial_info, ...request.financial_info };
      
      // Perform risk assessment
      const riskAssessment = await this.riskAssessor.assessKYCRisk(profile);
      profile.risk_assessment = riskAssessment;
      
      // Check compliance
      const complianceStatus = await this.complianceChecker.checkKYCCompliance(profile);
      profile.compliance_status = complianceStatus;
      
      // Determine verification status
      const verificationStatus = this.determineVerificationStatus(profile);
      profile.verification_status = verificationStatus;
      
      // Update profile
      profile.updated_at = new Date().toISOString();
      this.profiles.set(profile.id, profile);
      
      // Generate response
      return this.generateVerificationResponse(profile, documentResults);
      
    } catch (error) {
      console.error('KYC initiation failed:', error);
      throw new Error(`KYC initiation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyDocument(
    profileId: string,
    documentId: string,
    verificationData: Record<string, unknown>
  ): Promise<KYCDocument> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`KYC profile '${profileId}' not found`);
    }

    const document = profile.documents.find(d => d.id === documentId);
    if (!document) {
      throw new Error(`Document '${documentId}' not found in profile '${profileId}'`);
    }

    // Update document verification status
    document.verification_status = DocumentVerificationStatus.VERIFIED;
    document.verified_at = new Date().toISOString();
    Object.assign(document, verificationData);

    // Update profile
    profile.updated_at = new Date().toISOString();
    this.profiles.set(profileId, profile);

    return document;
  }

  async updateKYCProfile(
    profileId: string,
    updates: Partial<KYCProfile>
  ): Promise<KYCProfile> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`KYC profile '${profileId}' not found`);
    }

    // Update profile fields
    Object.assign(profile, updates);
    profile.updated_at = new Date().toISOString();

    // Reassess risk and compliance
    profile.risk_assessment = await this.riskAssessor.assessKYCRisk(profile);
    profile.compliance_status = await this.complianceChecker.checkKYCCompliance(profile);

    // Update verification status
    profile.verification_status = this.determineVerificationStatus(profile);

    this.profiles.set(profileId, profile);
    return profile;
  }

  async getKYCProfile(profileId: string): Promise<KYCProfile | null> {
    return this.profiles.get(profileId) || null;
  }

  async getUserKYCProfile(userId: string): Promise<KYCProfile | null> {
    for (const profile of this.profiles.values()) {
      if (profile.user_id === userId) {
        return profile;
      }
    }
    return null;
  }

  async listKYCProfiles(
    status?: KYCStatus,
    verificationLevel?: KYCVerificationLevel,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ profiles: KYCProfile[]; total: number }> {
    let filteredProfiles = Array.from(this.profiles.values());

    // Apply filters
    if (status) {
      filteredProfiles = filteredProfiles.filter(p => p.verification_status === status);
    }
    if (verificationLevel) {
      filteredProfiles = filteredProfiles.filter(p => p.verification_level === verificationLevel);
    }

    const total = filteredProfiles.length;
    const profiles = filteredProfiles.slice(offset, offset + limit);

    return { profiles, total };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async createKYCProfile(request: KYCVerificationRequest): Promise<KYCProfile> {
    const profileId = this.generateProfileId();
    
    const profile: KYCProfile = {
      id: profileId,
      user_id: request.user_id,
      verification_status: KYCStatus.PENDING,
      verification_level: request.verification_level,
      documents: [],
      personal_info: {
        full_name: '',
        surname: '',
        first_names: '',
        date_of_birth: '',
        gender: 'M',
        nationality: '',
        email: request.personal_info.email || ''
      },
      address_info: {
        street_address: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        address_type: 'residential',
        verification_status: 'pending'
      },
      financial_info: {
        employment_status: 'unemployed',
        source_of_funds: [],
        bank_accounts: [],
        risk_category: 'medium'
      },
      risk_assessment: {
        overall_risk: RiskLevel.MEDIUM,
        risk_score: 50,
        risk_factors: [],
        mitigation_strategies: [],
        enhanced_due_diligence_required: false,
        monitoring_frequency: 'medium'
      },
      compliance_status: {
        eta_2019_compliant: false,
        compliance_score: 0,
        compliance_details: [],
        validation_errors: [],
        recommendations: []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.profiles.set(profileId, profile);
    return profile;
  }

  private async processDocuments(
    documents: DocumentUpload[]
  ): Promise<{ verified_documents: KYCDocument[]; errors: string[] }> {
    const verifiedDocuments: KYCDocument[] = [];
    const errors: string[] = [];

    for (const document of documents) {
      try {
        const processedDoc = await this.documentProcessor.processDocument(document);
        verifiedDocuments.push(processedDoc);
      } catch (error) {
        errors.push(`Document processing failed for ${document.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { verified_documents: verifiedDocuments, errors };
  }

  private determineVerificationStatus(profile: KYCProfile): KYCStatus {
    // Check if all required documents are verified
    const requiredDocuments = this.getRequiredDocuments(profile.verification_level);
    const verifiedDocuments = profile.documents.filter(d => 
      d.verification_status === DocumentVerificationStatus.VERIFIED
    );

    if (verifiedDocuments.length < requiredDocuments.length) {
      return KYCStatus.IN_PROGRESS;
    }

    // Check risk assessment
    if (profile.risk_assessment.overall_risk === RiskLevel.CRITICAL) {
      return KYCStatus.SUSPENDED;
    }

    // Check compliance
    if (profile.compliance_status.compliance_score < 0.7) {
      return KYCStatus.IN_PROGRESS;
    }

    return KYCStatus.VERIFIED;
  }

  private getRequiredDocuments(verificationLevel: KYCVerificationLevel): DocumentType[] {
    switch (verificationLevel) {
      case KYCVerificationLevel.BASIC:
        return [DocumentType.NATIONAL_ID, DocumentType.UTILITY_BILL];
      
      case KYCVerificationLevel.ENHANCED:
        return [
          DocumentType.NATIONAL_ID,
          DocumentType.UTILITY_BILL,
          DocumentType.BANK_STATEMENT,
          DocumentType.EMPLOYMENT_LETTER
        ];
      
      case KYCVerificationLevel.FULL:
        return [
          DocumentType.NATIONAL_ID,
          DocumentType.UTILITY_BILL,
          DocumentType.BANK_STATEMENT,
          DocumentType.EMPLOYMENT_LETTER,
          DocumentType.TAX_DOCUMENT,
          DocumentType.BIRTH_CERTIFICATE
        ];
      
      default:
        return [DocumentType.NATIONAL_ID];
    }
  }

  private generateVerificationResponse(
    profile: KYCProfile,
    documentResults: { verified_documents: KYCDocument[]; errors: string[] }
  ): KYCVerificationResponse {
    const verifiedCount = documentResults.verified_documents.filter(d => 
      d.verification_status === DocumentVerificationStatus.VERIFIED
    ).length;

    const totalCount = profile.documents.length;
    const estimatedCompletionTime = this.estimateCompletionTime(profile);

    return {
      success: profile.verification_status !== KYCStatus.REJECTED,
      profile_id: profile.id,
      verification_status: profile.verification_status,
      verification_level: profile.verification_level,
      documents_verified: verifiedCount,
      total_documents: totalCount,
      risk_assessment: profile.risk_assessment,
      compliance_status: profile.compliance_status,
      next_steps: this.generateNextSteps(profile),
      estimated_completion_time: estimatedCompletionTime,
      errors: documentResults.errors
    };
  }

  private generateNextSteps(profile: KYCProfile): string[] {
    const steps: string[] = [];

    if (profile.verification_status === KYCStatus.PENDING) {
      steps.push('Upload required identity documents');
      steps.push('Provide personal information');
      steps.push('Complete address verification');
    } else if (profile.verification_status === KYCStatus.IN_PROGRESS) {
      if (profile.documents.some(d => d.verification_status === DocumentVerificationStatus.PENDING)) {
        steps.push('Wait for document verification');
      }
      if (profile.compliance_status.compliance_score < 0.7) {
        steps.push('Address compliance issues');
      }
      if (profile.risk_assessment.enhanced_due_diligence_required) {
        steps.push('Complete enhanced due diligence');
      }
    } else if (profile.verification_status === KYCStatus.VERIFIED) {
      steps.push('KYC verification complete');
      steps.push('Monitor for changes requiring re-verification');
    }

    return steps;
  }

  private estimateCompletionTime(profile: KYCProfile): number {
    let baseTime = 24; // 24 hours base

    // Add time for document verification
    const pendingDocuments = profile.documents.filter(d => 
      d.verification_status === DocumentVerificationStatus.PENDING
    ).length;
    baseTime += pendingDocuments * 4; // 4 hours per document

    // Add time for risk assessment
    if (profile.risk_assessment.overall_risk === RiskLevel.HIGH) {
      baseTime += 48; // 48 hours for high-risk profiles
    }

    // Add time for compliance issues
    if (profile.compliance_status.compliance_score < 0.7) {
      baseTime += 24; // 24 hours for compliance resolution
    }

    return Math.min(baseTime, 168); // Cap at 1 week
  }

  private generateProfileId(): string {
    return `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// DOCUMENT PROCESSOR
// ============================================================================

class DocumentProcessor {
  async processDocument(
    upload: DocumentUpload
  ): Promise<KYCDocument> {
    // Extract text from document (OCR processing)
    const extractedText = await this.extractTextFromDocument();
    
    // Extract structured data using AI
    const extractedData = await this.extractDocumentData(upload.type, extractedText, upload.country_code);
    
    // Create KYC document record
    const document: KYCDocument = {
      id: this.generateDocumentId(),
      type: upload.type,
      country_code: upload.country_code,
      document_number: 'id_number' in extractedData ? extractedData.id_number || '' : '',
      full_name: 'full_name' in extractedData ? extractedData.full_name || '' : '',
      surname: 'surname' in extractedData ? extractedData.surname || '' : '',
      first_names: 'first_names' in extractedData ? extractedData.first_names || '' : '',
      date_of_birth: 'date_of_birth' in extractedData ? extractedData.date_of_birth || '' : '',
      gender: 'gender' in extractedData ? extractedData.gender || 'M' : 'M',
      nationality: 'nationality' in extractedData ? extractedData.nationality || '' : '',
      issue_date: 'issue_date' in extractedData ? extractedData.issue_date || '' : '',
      expiry_date: 'expiry_date' in extractedData ? extractedData.expiry_date || '' : '',
      place_of_birth: 'place_of_birth' in extractedData ? extractedData.place_of_birth : undefined,
      address: 'address' in extractedData ? extractedData.address : undefined,
      confidence_score: extractedData.confidence_score,
      verification_status: DocumentVerificationStatus.PENDING,
      uploaded_at: new Date().toISOString(),
      metadata: {
        file_name: upload.file_name,
        file_size: upload.file_size,
        mime_type: upload.mime_type,
        ...upload.metadata
      }
    };

    return document;
  }

  private async extractTextFromDocument(): Promise<string> {
    // Mock OCR processing - in production, use actual OCR service
    // This would integrate with services like Tesseract, AWS Textract, or Google Vision
    return 'Mock extracted text from document';
  }

  private async extractDocumentData(
    documentType: DocumentType,
    text: string,
    countryCode: string
  ): Promise<IDDocumentExtraction | FinancialDocumentExtraction> {
    // Mock AI extraction - in production, use actual AI service
    // This would integrate with the DocumentAnalyzer service
    
    if (this.isFinancialDocument(documentType)) {
      return {
        document_type: documentType,
        confidence_score: 0.85
      } as FinancialDocumentExtraction;
    } else {
      return {
        country_code: countryCode,
        document_type: documentType,
        confidence_score: 0.85
      } as IDDocumentExtraction;
    }
  }

  private isFinancialDocument(documentType: DocumentType): boolean {
    return [
      DocumentType.BANK_STATEMENT,
      DocumentType.TAX_DOCUMENT,
      DocumentType.EMPLOYMENT_LETTER
    ].includes(documentType);
  }

  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// RISK ASSESSOR
// ============================================================================

class RiskAssessor {
  async assessKYCRisk(profile: KYCProfile): Promise<KYCRiskAssessment> {
    let riskScore = 0;
    const riskFactors: KYCRiskFactor[] = [];

    // Assess document risks
    const documentRisks = this.assessDocumentRisks(profile.documents);
    riskFactors.push(...documentRisks);
    riskScore += documentRisks.reduce((sum, risk) => sum + this.getRiskScore(risk.severity), 0);

    // Assess personal information risks
    const personalRisks = this.assessPersonalInfoRisks(profile.personal_info);
    riskFactors.push(...personalRisks);
    riskScore += personalRisks.reduce((sum, risk) => sum + this.getRiskScore(risk.severity), 0);

    // Assess financial risks
    const financialRisks = this.assessFinancialRisks(profile.financial_info);
    riskFactors.push(...financialRisks);
    riskScore += financialRisks.reduce((sum, risk) => sum + this.getRiskScore(risk.severity), 0);

    // Determine overall risk level
    const overallRisk = this.determineRiskLevel(riskScore);

    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(riskFactors);

    return {
      overall_risk: overallRisk,
      risk_score: Math.min(riskScore, 100),
      risk_factors: riskFactors,
      mitigation_strategies: mitigationStrategies,
      enhanced_due_diligence_required: overallRisk === RiskLevel.HIGH || overallRisk === RiskLevel.CRITICAL,
      monitoring_frequency: this.determineMonitoringFrequency(overallRisk)
    };
  }

  private assessDocumentRisks(documents: KYCDocument[]): KYCRiskFactor[] {
    const risks: KYCRiskFactor[] = [];

    // Check for expired documents
    const expiredDocuments = documents.filter(d => {
      if (!d.expiry_date) return false;
      return new Date(d.expiry_date) < new Date();
    });

    if (expiredDocuments.length > 0) {
      risks.push({
        factor: 'Expired Documents',
        severity: RiskLevel.MEDIUM,
        description: `${expiredDocuments.length} document(s) are expired`,
        impact: 'Document validity compromised',
        probability: 0.8,
        mitigation: 'Renew expired documents immediately'
      });
    }

    // Check for low confidence documents
    const lowConfidenceDocuments = documents.filter(d => d.confidence_score < 0.7);
    if (lowConfidenceDocuments.length > 0) {
      risks.push({
        factor: 'Low Confidence Documents',
        severity: RiskLevel.MEDIUM,
        description: `${lowConfidenceDocuments.length} document(s) have low confidence scores`,
        impact: 'Document authenticity uncertain',
        probability: 0.6,
        mitigation: 'Request higher quality document scans'
      });
    }

    return risks;
  }

  private assessPersonalInfoRisks(personalInfo: PersonalInfo): KYCRiskFactor[] {
    const risks: KYCRiskFactor[] = [];

    // Check for missing critical information
    const requiredFields = ['full_name', 'date_of_birth', 'nationality'];
    const missingFields = requiredFields.filter(field => !personalInfo[field as keyof PersonalInfo]);

    if (missingFields.length > 0) {
      risks.push({
        factor: 'Missing Critical Information',
        severity: RiskLevel.MEDIUM,
        description: `Missing required fields: ${missingFields.join(', ')}`,
        impact: 'Incomplete profile information',
        probability: 0.7,
        mitigation: 'Complete all required personal information fields'
      });
    }

    // Check for suspicious patterns
    if (personalInfo.date_of_birth) {
      const age = this.calculateAge(personalInfo.date_of_birth);
      if (age < 18) {
        risks.push({
          factor: 'Underage User',
          severity: RiskLevel.HIGH,
          description: 'User is under 18 years old',
          impact: 'Legal compliance issues',
          probability: 1.0,
          mitigation: 'Verify age and legal capacity'
        });
      }
    }

    return risks;
  }

  private assessFinancialRisks(financialInfo: FinancialInfo): KYCRiskFactor[] {
    const risks: KYCRiskFactor[] = [];

    // Check for high-risk employment status
    if (financialInfo.employment_status === 'unemployed') {
      risks.push({
        factor: 'Unemployed Status',
        severity: RiskLevel.MEDIUM,
        description: 'User is currently unemployed',
        impact: 'Income verification challenges',
        probability: 0.6,
        mitigation: 'Provide alternative income sources or employment verification'
      });
    }

    // Check for high-risk source of funds
    const highRiskSources = ['gambling', 'cryptocurrency', 'cash'];
    const riskySources = financialInfo.source_of_funds.filter(source => 
      highRiskSources.includes(source.toLowerCase())
    );

    if (riskySources.length > 0) {
      risks.push({
        factor: 'High-Risk Source of Funds',
        severity: RiskLevel.HIGH,
        description: `High-risk funding sources: ${riskySources.join(', ')}`,
        impact: 'Money laundering risk',
        probability: 0.8,
        mitigation: 'Provide detailed documentation of fund sources'
      });
    }

    return risks;
  }

  private getRiskScore(severity: RiskLevel): number {
    switch (severity) {
      case RiskLevel.LOW: return 10;
      case RiskLevel.MEDIUM: return 25;
      case RiskLevel.HIGH: return 50;
      case RiskLevel.CRITICAL: return 75;
      default: return 0;
    }
  }

  private determineRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 80) return RiskLevel.CRITICAL;
    if (riskScore >= 60) return RiskLevel.HIGH;
    if (riskScore >= 40) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private generateMitigationStrategies(riskFactors: KYCRiskFactor[]): string[] {
    const strategies: string[] = [];
    
    for (const risk of riskFactors) {
      if (risk.mitigation && !strategies.includes(risk.mitigation)) {
        strategies.push(risk.mitigation);
      }
    }
    
    // Add general strategies
    strategies.push('Implement enhanced monitoring');
    strategies.push('Conduct periodic reviews');
    strategies.push('Provide customer education');
    
    return strategies;
  }

  private determineMonitoringFrequency(riskLevel: RiskLevel): 'low' | 'medium' | 'high' {
    switch (riskLevel) {
      case RiskLevel.CRITICAL: return 'high';
      case RiskLevel.HIGH: return 'high';
      case RiskLevel.MEDIUM: return 'medium';
      case RiskLevel.LOW: return 'low';
      default: return 'medium';
    }
  }

  private calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

// ============================================================================
// COMPLIANCE CHECKER
// ============================================================================

class ComplianceChecker {
  async checkKYCCompliance(profile: KYCProfile): Promise<ComplianceStatus> {
    const complianceDetails: ComplianceDetail[] = [];
    let totalScore = 0;
    let sectionCount = 0;

    // Check ETA 2019 compliance
    const eta2019Score = this.checkETA2019Compliance(profile);
    totalScore += eta2019Score;
    sectionCount++;
    complianceDetails.push({
      section: 'ETA 2019',
      requirement: 'Electronic Transactions Act compliance',
      status: eta2019Score > 0.7 ? 'compliant' : 'requires_review',
      description: `ETA 2019 compliance score: ${Math.round(eta2019Score * 100)}%`,
      confidence: 0.9
    });

    // Check data protection compliance
    const dataProtectionScore = this.checkDataProtectionCompliance(profile);
    totalScore += dataProtectionScore;
    sectionCount++;
    complianceDetails.push({
      section: 'Data Protection',
      requirement: 'Data protection and privacy compliance',
      status: dataProtectionScore > 0.7 ? 'compliant' : 'requires_review',
      description: `Data protection compliance score: ${Math.round(dataProtectionScore * 100)}%`,
      confidence: 0.8
    });

    // Check anti-money laundering compliance
    const amlScore = this.checkAMLCompliance(profile);
    totalScore += amlScore;
    sectionCount++;
    complianceDetails.push({
      section: 'AML',
      requirement: 'Anti-Money Laundering compliance',
      status: amlScore > 0.7 ? 'compliant' : 'requires_review',
      description: `AML compliance score: ${Math.round(amlScore * 100)}%`,
      confidence: 0.85
    });

    const complianceScore = totalScore / sectionCount;
    const eta2019Compliant = complianceScore > 0.7;

    return {
      eta_2019_compliant: eta2019Compliant,
      compliance_score: complianceScore,
      compliance_details: complianceDetails,
      validation_errors: [],
      recommendations: this.generateComplianceRecommendations(profile, complianceScore)
    };
  }

  private checkETA2019Compliance(profile: KYCProfile): number {
    // Check if KYC process meets ETA 2019 requirements
    let score = 0;

    // Check document verification
    if (profile.documents.length > 0) {
      score += 0.3;
    }

    // Check personal information completeness
    if (profile.personal_info.full_name && profile.personal_info.date_of_birth) {
      score += 0.3;
    }

    // Check verification status
    if (profile.verification_status === KYCStatus.VERIFIED) {
      score += 0.4;
    }

    return score;
  }

  private checkDataProtectionCompliance(profile: KYCProfile): number {
    // Check data protection compliance
    let score = 0;

    // Check data minimization
    if (profile.documents.length <= 6) { // Reasonable number of documents
      score += 0.5;
    }

    // Check data retention
    if (profile.created_at) {
      const createdDate = new Date(profile.created_at);
      const now = new Date();
      const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceCreation <= 2555) { // 7 years retention
        score += 0.5;
      }
    }

    return score;
  }

  private checkAMLCompliance(profile: KYCProfile): number {
    // Check anti-money laundering compliance
    let score = 0;

    // Check risk assessment
    if (profile.risk_assessment.overall_risk !== RiskLevel.CRITICAL) {
      score += 0.5;
    }

    // Check enhanced due diligence
    if (profile.risk_assessment.enhanced_due_diligence_required) {
      score += 0.5;
    }

    return score;
  }

  private generateComplianceRecommendations(profile: KYCProfile, complianceScore: number): string[] {
    const recommendations: string[] = [];

    if (complianceScore < 0.7) {
      recommendations.push('Improve document verification process');
      recommendations.push('Enhance personal information collection');
      recommendations.push('Implement stronger risk assessment');
    }

    if (profile.risk_assessment.overall_risk === RiskLevel.HIGH) {
      recommendations.push('Conduct enhanced due diligence');
      recommendations.push('Implement additional monitoring');
    }

    recommendations.push('Regular compliance audits recommended');
    recommendations.push('Staff training on KYC requirements');

    return recommendations;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default KYCService;
// All types are already exported as interfaces above
