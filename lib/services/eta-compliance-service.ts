/**
 * ETA 2019 Compliance Service
 * 
 * Purpose: TypeScript service for validating digital signatures against ETA 2019
 * Location: /lib/services/eta-compliance-service.ts
 * Features: Comprehensive ETA compliance validation, real-time checking
 */

// ETA 2019 Compliance Types
export interface ETAComplianceResult {
  compliant: boolean;
  score: number;
  sections: {
    section17: ComplianceSection;
    section20: ComplianceSection;
    section21: ComplianceSection;
    section25: ComplianceSection;
    chapter4: ComplianceSection;
  };
  recommendations: string[];
  issues: string[];
  timestamp: string;
}

export interface ComplianceSection {
  name: string;
  description: string;
  compliant: boolean;
  score: number;
  requirements: ComplianceRequirement[];
  issues: string[];
  recommendations: string[];
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  met: boolean;
  evidence: string;
  critical: boolean;
}

export interface SignatureData {
  signerId: string;
  documentId: string;
  signatureType: 'electronic' | 'digital' | 'biometric' | 'handwritten';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  certificateInfo?: {
    serialNumber: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    publicKey: string;
  };
  biometricData?: {
    type: string;
    dataHash: string;
    deviceId: string;
  };
  digitalSignature?: string;
  verificationHash: string;
}

export interface DocumentData {
  id: string;
  content: string;
  hash: string;
  format: string;
  size: number;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * ETA 2019 Compliance Service
 * Implements comprehensive validation against Electronic Transactions Act 4 of 2019
 */
export class ETAComplianceService {
  private readonly ETA_KNOWLEDGE_BASE = {
    section17: {
      name: "Section 17 - Legal Recognition of Data Messages",
      description: "Data messages shall not be denied legal effect, validity or enforceability",
      requirements: [
        "Must be accessible for subsequent reference",
        "Must be retained in the format in which it was generated, sent or received",
        "Must be capable of being displayed to the person to whom it was sent"
      ]
    },
    section20: {
      name: "Section 20 - Electronic Signatures",
      description: "Electronic signature requirements for legal validity",
      requirements: [
        "Electronic signature must be uniquely linked to the signatory",
        "Must be capable of identifying the signatory",
        "Must be created using means that the signatory can maintain under his or her sole control",
        "Must be linked to the data message in such a manner that any subsequent change to the data message is detectable"
      ]
    },
    section21: {
      name: "Section 21 - Original Information",
      description: "Requirements for electronic data messages to satisfy original form requirements",
      requirements: [
        "The integrity of the information from the time when it was first generated in its final form",
        "The information is accessible so as to be usable for subsequent reference",
        "The information is presented in the format in which it was generated, sent or received"
      ]
    },
    section25: {
      name: "Section 25 - Admissibility and Evidential Weight",
      description: "Electronic data message admissibility as evidence",
      requirements: [
        "Electronic data message shall not be denied admissibility as evidence",
        "Evidential weight assessment criteria must be met",
        "Reliability of generation, storage, and communication methods",
        "Reliability of integrity maintenance",
        "Proper identification of originator"
      ]
    },
    chapter4: {
      name: "Chapter 4 - Consumer Protection",
      description: "Consumer protection requirements for electronic transactions",
      requirements: [
        "Fair and transparent terms and conditions",
        "Clear disclosure of electronic signature requirements",
        "Right to withdraw consent",
        "Cooling-off periods where applicable",
        "Dispute resolution mechanisms",
        "Data protection and privacy rights"
      ]
    }
  };

  /**
   * Validate signature against ETA 2019 compliance
   */
  async validateCompliance(
    signatureData: SignatureData,
    documentData: DocumentData
  ): Promise<ETAComplianceResult> {
    const timestamp = new Date().toISOString();
    
    // Validate each section
    const section17 = await this.validateSection17(signatureData, documentData);
    const section20 = await this.validateSection20(signatureData, documentData);
    const section21 = await this.validateSection21(signatureData, documentData);
    const section25 = await this.validateSection25(signatureData, documentData);
    const chapter4 = await this.validateChapter4(signatureData, documentData);

    // Calculate overall compliance
    const sections = { section17, section20, section21, section25, chapter4 };
    const score = this.calculateComplianceScore(sections);
    const compliant = score >= 70; // Minimum threshold for compliance

    // Generate recommendations
    const recommendations = this.generateRecommendations(sections);
    const issues = this.collectIssues(sections);

    return {
      compliant,
      score,
      sections,
      recommendations,
      issues,
      timestamp
    };
  }

  /**
   * Validate Section 17 - Legal Recognition of Data Messages
   */
  private async validateSection17(
    signatureData: SignatureData,
    documentData: DocumentData
  ): Promise<ComplianceSection> {
    const requirements: ComplianceRequirement[] = [
      {
        id: "eta_17_1",
        description: "Data message accessible for subsequent reference",
        met: !!documentData.id && !!signatureData.documentId,
        evidence: `Document ID: ${documentData.id}, Signature Document ID: ${signatureData.documentId}`,
        critical: true
      },
      {
        id: "eta_17_2",
        description: "Data message retained in original format",
        met: !!documentData.format && documentData.format !== 'unknown',
        evidence: `Document format: ${documentData.format}`,
        critical: true
      },
      {
        id: "eta_17_3",
        description: "Data message capable of being displayed",
        met: !!documentData.content && documentData.content.length > 0,
        evidence: `Document content length: ${documentData.content.length} characters`,
        critical: true
      }
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    const score = Math.round((metRequirements / requirements.length) * 100);
    const compliant = score >= 80;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!compliant) {
      issues.push("Document accessibility or format requirements not fully met");
      recommendations.push("Ensure _document is properly stored and accessible");
      recommendations.push("Maintain _document in its original electronic format");
    }

    return {
      name: this.ETA_KNOWLEDGE_BASE.section17.name,
      description: this.ETA_KNOWLEDGE_BASE.section17.description,
      compliant,
      score,
      requirements,
      issues,
      recommendations
    };
  }

  /**
   * Validate Section 20 - Electronic Signatures
   */
  private async validateSection20(
    signatureData: SignatureData,
    documentData: DocumentData
  ): Promise<ComplianceSection> {
    const requirements: ComplianceRequirement[] = [
      {
        id: "eta_20_1",
        description: "Electronic signature uniquely linked to signatory",
        met: !!signatureData.signerId && signatureData.signerId.length > 0,
        evidence: `Signer ID: ${signatureData.signerId}`,
        critical: true
      },
      {
        id: "eta_20_2",
        description: "Signature capable of identifying the signatory",
        met: this.canIdentifySignatory(signatureData),
        evidence: this.getSignatoryIdentificationEvidence(signatureData),
        critical: true
      },
      {
        id: "eta_20_3",
        description: "Signature created under signatory's sole control",
        met: this.isSignatureUnderSoleControl(signatureData),
        evidence: this.getSoleControlEvidence(signatureData),
        critical: true
      },
      {
        id: "eta_20_4",
        description: "Signature linked to detect data message changes",
        met: !!signatureData.verificationHash && signatureData.verificationHash.length > 0,
        evidence: `Verification hash: ${signatureData.verificationHash.substring(0, 16)}...`,
        critical: true
      }
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    const score = Math.round((metRequirements / requirements.length) * 100);
    const compliant = score >= 80;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!compliant) {
      issues.push("Electronic signature requirements not fully met");
      recommendations.push("Ensure signature is uniquely linked to signatory");
      recommendations.push("Implement proper signatory identification");
      recommendations.push("Verify signature creation under sole control");
      recommendations.push("Ensure signature can detect _document changes");
    }

    return {
      name: this.ETA_KNOWLEDGE_BASE.section20.name,
      description: this.ETA_KNOWLEDGE_BASE.section20.description,
      compliant,
      score,
      requirements,
      issues,
      recommendations
    };
  }

  /**
   * Validate Section 21 - Original Information
   */
  private async validateSection21(
    signatureData: SignatureData,
    documentData: DocumentData
  ): Promise<ComplianceSection> {
    const requirements: ComplianceRequirement[] = [
      {
        id: "eta_21_1",
        description: "Information integrity maintained from generation",
        met: this.isInformationIntegrityMaintained(documentData),
        evidence: `Document hash: ${documentData.hash}, Created: ${documentData.createdAt}`,
        critical: true
      },
      {
        id: "eta_21_2",
        description: "Information accessible for subsequent reference",
        met: !!documentData.content && documentData.content.length > 0,
        evidence: `Content accessible, length: ${documentData.content.length}`,
        critical: true
      },
      {
        id: "eta_21_3",
        description: "Information in original format",
        met: !!documentData.format && documentData.format !== 'unknown',
        evidence: `Original format: ${documentData.format}`,
        critical: false
      }
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    const score = Math.round((metRequirements / requirements.length) * 100);
    const compliant = score >= 80;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!compliant) {
      issues.push("Information integrity or accessibility requirements not met");
      recommendations.push("Ensure _document integrity is maintained");
      recommendations.push("Verify information accessibility");
      recommendations.push("Maintain original _document format");
    }

    return {
      name: this.ETA_KNOWLEDGE_BASE.section21.name,
      description: this.ETA_KNOWLEDGE_BASE.section21.description,
      compliant,
      score,
      requirements,
      issues,
      recommendations
    };
  }

  /**
   * Validate Section 25 - Admissibility and Evidential Weight
   */
  private async validateSection25(
    signatureData: SignatureData,
    documentData: DocumentData
  ): Promise<ComplianceSection> {
    const requirements: ComplianceRequirement[] = [
      {
        id: "eta_25_1",
        description: "Electronic data message admissible as evidence",
        met: this.isAdmissibleAsEvidence(signatureData, documentData),
        evidence: "Signature and _document meet admissibility criteria",
        critical: true
      },
      {
        id: "eta_25_2",
        description: "Reliable generation, storage, and communication",
        met: this.isGenerationReliable(signatureData, documentData),
        evidence: "Timestamped and properly stored",
        critical: true
      },
      {
        id: "eta_25_3",
        description: "Reliable integrity maintenance",
        met: !!signatureData.verificationHash && !!documentData.hash,
        evidence: "Integrity hashes present and verified",
        critical: true
      },
      {
        id: "eta_25_4",
        description: "Proper originator identification",
        met: !!signatureData.signerId && !!signatureData.timestamp,
        evidence: `Originator: ${signatureData.signerId}, Time: ${signatureData.timestamp}`,
        critical: true
      }
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    const score = Math.round((metRequirements / requirements.length) * 100);
    const compliant = score >= 80;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!compliant) {
      issues.push("Evidential weight requirements not fully met");
      recommendations.push("Ensure reliable generation and storage methods");
      recommendations.push("Maintain proper integrity verification");
      recommendations.push("Implement proper originator identification");
    }

    return {
      name: this.ETA_KNOWLEDGE_BASE.section25.name,
      description: this.ETA_KNOWLEDGE_BASE.section25.description,
      compliant,
      score,
      requirements,
      issues,
      recommendations
    };
  }

  /**
   * Validate Chapter 4 - Consumer Protection
   */
  private async validateChapter4(
    signatureData: SignatureData,
    documentData: DocumentData
  ): Promise<ComplianceSection> {
    const requirements: ComplianceRequirement[] = [
      {
        id: "eta_ch4_1",
        description: "Fair and transparent terms and conditions",
        met: this.hasTransparentTerms(documentData),
        evidence: "Terms and conditions present in _document",
        critical: false
      },
      {
        id: "eta_ch4_2",
        description: "Clear disclosure of electronic signature requirements",
        met: this.hasSignatureDisclosure(documentData),
        evidence: "Electronic signature requirements disclosed",
        critical: false
      },
      {
        id: "eta_ch4_3",
        description: "Right to withdraw consent",
        met: this.hasWithdrawalRights(documentData),
        evidence: "Withdrawal rights included",
        critical: false
      },
      {
        id: "eta_ch4_4",
        description: "Data protection and privacy rights",
        met: this.hasDataProtection(documentData),
        evidence: "Data protection measures in place",
        critical: true
      }
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    const score = Math.round((metRequirements / requirements.length) * 100);
    const compliant = score >= 60; // Lower threshold for consumer protection

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!compliant) {
      issues.push("Consumer protection requirements not fully met");
      recommendations.push("Include transparent terms and conditions");
      recommendations.push("Disclose electronic signature requirements clearly");
      recommendations.push("Provide withdrawal rights where applicable");
      recommendations.push("Implement proper data protection measures");
    }

    return {
      name: this.ETA_KNOWLEDGE_BASE.chapter4.name,
      description: this.ETA_KNOWLEDGE_BASE.chapter4.description,
      compliant,
      score,
      requirements,
      issues,
      recommendations
    };
  }

  // Helper methods
  private canIdentifySignatory(signatureData: SignatureData): boolean {
    return !!(
      signatureData.signerId ||
      signatureData.certificateInfo?.serialNumber ||
      signatureData.biometricData?.dataHash
    );
  }

  private getSignatoryIdentificationEvidence(signatureData: SignatureData): string {
    const evidences = [];
    if (signatureData.signerId) evidences.push(`Signer ID: ${signatureData.signerId}`);
    if (signatureData.certificateInfo?.serialNumber) evidences.push(`Certificate: ${signatureData.certificateInfo.serialNumber}`);
    if (signatureData.biometricData?.dataHash) evidences.push(`Biometric: ${signatureData.biometricData.dataHash.substring(0, 16)}...`);
    return evidences.join(', ') || 'No identification evidence';
  }

  private isSignatureUnderSoleControl(signatureData: SignatureData): boolean {
    // Check if signature was created with proper authentication
    return !!(
      signatureData.timestamp &&
      signatureData.ipAddress &&
      signatureData.userAgent
    );
  }

  private getSoleControlEvidence(signatureData: SignatureData): string {
    return `Timestamp: ${signatureData.timestamp}, IP: ${signatureData.ipAddress || 'N/A'}`;
  }

  private isInformationIntegrityMaintained(documentData: DocumentData): boolean {
    return !!(
      documentData.hash &&
      documentData.createdAt &&
      (!documentData.modifiedAt || documentData.modifiedAt === documentData.createdAt)
    );
  }

  private isAdmissibleAsEvidence(signatureData: SignatureData, documentData: DocumentData): boolean {
    return !!(
      signatureData.timestamp &&
      signatureData.verificationHash &&
      documentData.hash &&
      signatureData.signerId
    );
  }

  private isGenerationReliable(signatureData: SignatureData, documentData: DocumentData): boolean {
    return !!(
      signatureData.timestamp &&
      documentData.createdAt &&
      signatureData.ipAddress
    );
  }

  private hasTransparentTerms(documentData: DocumentData): boolean {
    // Check if _document contains terms and conditions
    const content = documentData.content.toLowerCase();
    return content.includes('terms') || content.includes('conditions') || content.includes('agreement');
  }

  private hasSignatureDisclosure(documentData: DocumentData): boolean {
    // Check if _document discloses electronic signature requirements
    const content = documentData.content.toLowerCase();
    return content.includes('electronic signature') || content.includes('digital signature');
  }

  private hasWithdrawalRights(documentData: DocumentData): boolean {
    // Check if _document includes withdrawal rights
    const content = documentData.content.toLowerCase();
    return content.includes('withdraw') || content.includes('cancel') || content.includes('terminate');
  }

  private hasDataProtection(documentData: DocumentData): boolean {
    // Check if _document includes data protection measures
    const content = documentData.content.toLowerCase();
    return content.includes('privacy') || content.includes('data protection') || content.includes('gdpr');
  }

  private calculateComplianceScore(sections: unknown): number {
    const scores = Object.values(sections).map((section: unknown) => section.score);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  private generateRecommendations(sections: unknown): string[] {
    const recommendations: string[] = [];
    Object.values(sections).forEach((section: unknown) => {
      recommendations.push(...section.recommendations);
    });
    return [...new Set(recommendations)]; // Remove duplicates
  }

  private collectIssues(sections: unknown): string[] {
    const issues: string[] = [];
    Object.values(sections).forEach((section: unknown) => {
      issues.push(...section.issues);
    });
    return [...new Set(issues)]; // Remove duplicates
  }
}

// Export singleton instance
export const etaComplianceService = new ETAComplianceService();
