// BuffrSign Platform - Document Analyzer Service
// AI-powered _document analysis with ETA 2019 compliance checking

import {
  DocumentAnalysisResult,
  ComplianceStatus,
  SignatureField,
  RiskAssessment,
  RiskLevel,
  RiskFactor,
  ComplianceRisk,
  SignatureFieldType,
  ETA2019Compliance,
  NamibianLegalFramework
} from '../ai-types';
import {
  aiConfig,
  DOCUMENT_CLASSIFICATION_RULES,
  SIGNATURE_DETECTION_RULES
} from '../ai-config';

// ============================================================================
// DOCUMENT ANALYZER SERVICE
// ============================================================================

export class DocumentAnalyzer {
  private openaiApiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor() {
    this.openaiApiKey = aiConfig.openai.api_key;
    this.model = aiConfig.openai.model;
    this.temperature = aiConfig.openai.temperature;
    this.maxTokens = aiConfig.openai.max_tokens;
  }

  // ============================================================================
  // MAIN ANALYSIS METHOD
  // ============================================================================

  async analyzeDocument(
    documentText: string,
    documentId: string,
    documentMetadata?: Record<string, unknown>
  ): Promise<DocumentAnalysisResult> {
    const startTime = Date.now();

    try {
      // Extract text and metadata
      const textContent = documentText;
      const metadata = documentMetadata || {};

      // Classify _document type
      const docType = await this.classifyDocument(textContent);

      // Detect signature fields
      const signatureFields = await this.detectSignatureFields(textContent);

      // Check ETA 2019 compliance
      const complianceStatus = await this.checkDocumentCompliance(textContent, docType);

      // Extract structured data
      const extractedFields = await this.extractStructuredData(textContent, docType);

      // Assess risks
      const riskAssessment = await this.assessRisks(textContent, docType, complianceStatus);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        docType,
        complianceStatus,
        riskAssessment
      );

      const processingTime = (Date.now() - startTime) / 1000;

      return {
        document_id: documentId,
        analysis_timestamp: new Date().toISOString(),
        document_type: docType,
        confidence_score: (metadata.confidence as number) || 0.85,
        compliance_status: complianceStatus,
        extracted_fields: extractedFields,
        signature_locations: signatureFields,
        risk_assessment: riskAssessment,
        recommendations,
        processing_time: processingTime
      };
    } catch (error) {
      console.error('Document analysis failed:', error);
      throw new Error(`Document analysis failed: ${error}`);
    }
  }

  // ============================================================================
  // DOCUMENT CLASSIFICATION
  // ============================================================================

  private async classifyDocument(
    text: string
  ): Promise<string> {
    try {
      // Use AI for _document classification
      if (this.openaiApiKey) {
        return await this.classifyDocumentWithAI(text);
      }

      // Fallback to rule-based classification
      return this.classifyDocumentWithRules(text);
    } catch (error) {
      console.warn('AI classification failed, using rule-based fallback:', error);
      return this.classifyDocumentWithRules(text);
    }
  }

  private async classifyDocumentWithAI(
    text: string
  ): Promise<string> {
    const prompt = `
      Analyze the following _document text and classify it into one of these categories:
      - employment_contract
      - service_agreement
      - nda_agreement
      - financial_document
      - legal_document
      - other

      Document text: ${text.substring(0, 1000)}...
      
      Respond with only the category name.
    `;

    try {
      const response = await this.callOpenAI(prompt);
      return response.trim().toLowerCase();
    } catch (error) {
      throw new Error(`AI classification failed: ${error}`);
    }
  }

  private classifyDocumentWithRules(text: string): string {
    const lowerText = text.toLowerCase();
    let bestMatch = 'other';
    let highestScore = 0;

    for (const [docType, rules] of Object.entries(DOCUMENT_CLASSIFICATION_RULES)) {
      let score = 0;
      
      // Check keyword matches
      for (const keyword of rules.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      // Check for required fields
      for (const field of rules.required_fields) {
        if (lowerText.includes(field.toLowerCase())) {
          score += 2;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = docType;
      }
    }

    return bestMatch;
  }

  // ============================================================================
  // SIGNATURE FIELD DETECTION
  // ============================================================================

  private async detectSignatureFields(
    text: string
  ): Promise<SignatureField[]> {
    try {
      if (this.openaiApiKey) {
        return await this.detectSignatureFieldsWithAI(text);
      }

      return this.detectSignatureFieldsWithRules(text);
    } catch (error) {
      console.warn('AI signature detection failed, using rule-based fallback:', error);
      return this.detectSignatureFieldsWithRules(text);
    }
  }

  private async detectSignatureFieldsWithAI(
    text: string
  ): Promise<SignatureField[]> {
    const prompt = `
      Analyze the following _document and identify signature fields. Return a JSON array with:
      - x, y coordinates (0-100 scale)
      - width, height (0-100 scale)
      - page_number (1-based)
      - field_type (signature, date, name, title, company)
      - confidence (0.0-1.0)
      - required (boolean)
      - label (string)

      Document text: ${text.substring(0, 1000)}...
      
      Respond with valid JSON only.
    `;

    try {
      const response = await this.callOpenAI(prompt);
      const fields = JSON.parse(response);
      
      return fields.map((field: Record<string, unknown>) => ({
        x: field.x || 0,
        y: field.y || 0,
        width: field.width || 20,
        height: field.height || 10,
        page_number: field.page_number || 1,
        field_type: field.field_type || SignatureFieldType.SIGNATURE,
        confidence: field.confidence || 0.8,
        required: field.required !== false,
        label: field.label || '',
        placeholder_text: field.placeholder_text || '',
        validation_rules: field.validation_rules || []
      }));
    } catch (error) {
      throw new Error(`AI signature detection failed: ${error}`);
    }
  }

  private detectSignatureFieldsWithRules(text: string): SignatureField[] {
    const fields: SignatureField[] = [];
    const lowerText = text.toLowerCase();

    // Detect signature fields based on patterns with word boundaries
    for (const [fieldType, rules] of Object.entries(SIGNATURE_DETECTION_RULES)) {
      let found = false;
      
      for (const pattern of rules.patterns) {
        // Use word boundaries to avoid partial matches
        const regex = new RegExp(`\\b${pattern.toLowerCase()}\\b`, 'i');
        if (regex.test(lowerText)) {
          found = true;
          break;
        }
      }

      if (found) {
        fields.push({
          x: 50, // Default positioning
          y: 80,
          width: 25,
          height: 8,
          page_number: 1,
          field_type: fieldType as SignatureFieldType,
          confidence: 0.7,
          required: fieldType === 'signature' || fieldType === 'date',
          label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
          placeholder_text: `Enter ${fieldType}`,
          validation_rules: []
        });
      }
    }

    return fields;
  }

  // ============================================================================
  // COMPLIANCE CHECKING
  // ============================================================================

  private async checkDocumentCompliance(
    text: string,
    documentType: string
  ): Promise<ComplianceStatus> {
    try {
      const eta2019Compliance = await this.checkETA2019Compliance(text);
      const namibianCompliance = await this.checkNamibianLegalCompliance(text, documentType);

      const complianceScore = (eta2019Compliance.compliance_score +
                              namibianCompliance.overall_compliance_score) / 2;

      return {
        eta_2019_compliant: eta2019Compliance.overall_compliance,
        compliance_score: complianceScore,
        compliance_details: [
          ...eta2019Compliance.validation_details.map(detail => ({
            section: detail.section,
            requirement: detail.requirement,
            status: detail.status as 'compliant' | 'non_compliant' | 'requires_review',
            description: detail.description,
            confidence: detail.confidence
          })),
          ...namibianCompliance.legal_risks.map(risk => ({
            section: risk.regulation,
            requirement: risk.risk_description,
            status: (risk.severity === RiskLevel.LOW ? 'compliant' : 'requires_review') as 'compliant' | 'non_compliant' | 'requires_review',
            description: risk.mitigation_strategy,
            confidence: 0.8
          }))
        ],
        validation_errors: [],
        recommendations: [
          ...eta2019Compliance.recommendations,
          ...namibianCompliance.recommendations
        ]
      };
    } catch (error) {
      console.error('Compliance checking failed:', error);
      return {
        eta_2019_compliant: false,
        compliance_score: 0,
        compliance_details: [],
        validation_errors: [`Compliance check failed: ${error}`],
        recommendations: ['Review _document manually for compliance']
      };
    }
  }

  private async checkETA2019Compliance(
    text: string
  ): Promise<ETA2019Compliance> {
    const compliance: ETA2019Compliance = {
      section_17_compliant: true,
      section_20_compliant: true,
      section_21_compliant: true,
      section_24_compliant: true,
      overall_compliance: true,
      compliance_score: 0,
      recommendations: [],
      validation_details: []
    };

    let totalScore = 0;
    let sectionCount = 0;

    // Check Section 17: Legal recognition of data messages
    const section17Score = this.checkSection17Compliance(text);
    compliance.section_17_compliant = section17Score > 0.7;
    totalScore += section17Score;
    sectionCount++;

    // Check Section 20: Electronic signatures
    const section20Score = this.checkSection20Compliance(text);
    compliance.section_20_compliant = section20Score > 0.7;
    totalScore += section20Score;
    sectionCount++;

    // Check Section 21: Original information
    const section21Score = this.checkSection21Compliance(text);
    compliance.section_21_compliant = section21Score > 0.7;
    totalScore += section21Score;
    sectionCount++;

    // Check Section 24: Retention of data messages
    const section24Score = this.checkSection24Compliance(text);
    compliance.section_24_compliant = section24Score > 0.7;
    totalScore += section24Score;
    sectionCount++;

    compliance.compliance_score = totalScore / sectionCount;
    compliance.overall_compliance = compliance.compliance_score > 0.7;

    // Generate recommendations
    if (!compliance.section_17_compliant) {
      compliance.recommendations.push('Ensure _document format is accessible and readable');
    }
    if (!compliance.section_20_compliant) {
      compliance.recommendations.push('Implement proper electronic signature mechanisms');
    }
    if (!compliance.section_21_compliant) {
      compliance.recommendations.push('Maintain _document integrity and authenticity');
    }
    if (!compliance.section_24_compliant) {
      compliance.recommendations.push('Establish proper _document retention policies');
    }

    return compliance;
  }

  private checkSection17Compliance(text: string): number {
    // Check for electronic format acceptance indicators
    const indicators = [
      'electronic',
      'digital',
      'data message',
      'electronic form',
      'digital format'
    ];
    
    let score = 0;
    for (const indicator of indicators) {
      if (text.toLowerCase().includes(indicator)) {
        score += 0.2;
      }
    }
    
    return Math.min(score, 1.0);
  }

  private checkSection20Compliance(text: string): number {
    // Check for electronic signature requirements
    const indicators = [
      'electronic signature',
      'digital signature',
      'signatory',
      'signature verification',
      'authentication'
    ];
    
    let score = 0;
    for (const indicator of indicators) {
      if (text.toLowerCase().includes(indicator)) {
        score += 0.2;
      }
    }
    
    return Math.min(score, 1.0);
  }

  private checkSection21Compliance(text: string): number {
    // Check for information integrity indicators
    const indicators = [
      'integrity',
      'authenticity',
      'original',
      'unaltered',
      'verification'
    ];
    
    let score = 0;
    for (const indicator of indicators) {
      if (text.toLowerCase().includes(indicator)) {
        score += 0.2;
      }
    }
    
    return Math.min(score, 1.0);
  }

  private checkSection24Compliance(text: string): number {
    // Check for retention requirements
    const indicators = [
      'retention',
      'retain',
      'storage',
      'archival',
      'preservation'
    ];
    
    let score = 0;
    for (const indicator of indicators) {
      if (text.toLowerCase().includes(indicator)) {
        score += 0.2;
      }
    }
    
    return Math.min(score, 1.0);
  }

  private async checkNamibianLegalCompliance(
    text: string,
    documentType: string
  ): Promise<NamibianLegalFramework> {
    const compliance: NamibianLegalFramework = {
      eta_2019_compliance: await this.checkETA2019Compliance(text),
      labour_act_compliance: true,
      consumer_protection_compliance: true,
      data_protection_compliance: true,
      overall_compliance_score: 0,
      legal_risks: [],
      recommendations: []
    };

    // Check _document type specific compliance
    if (documentType === 'employment_contract') {
      compliance.labour_act_compliance = this.checkLabourActCompliance(text);
    } else if (documentType === 'service_agreement') {
      compliance.consumer_protection_compliance = this.checkConsumerProtectionCompliance(text);
    }

    // Calculate overall compliance score
    const scores = [
      compliance.eta_2019_compliance.compliance_score,
      compliance.labour_act_compliance ? 1.0 : 0.5,
      compliance.consumer_protection_compliance ? 1.0 : 0.5,
      compliance.data_protection_compliance ? 1.0 : 0.5
    ];

    compliance.overall_compliance_score = scores.reduce((a, b) => a + b, 0) / scores.length;

    return compliance;
  }

  private checkLabourActCompliance(text: string): boolean {
    const requiredElements = [
      'minimum wage',
      'working hours',
      'leave',
      'termination',
      'health and safety'
    ];
    
    let foundElements = 0;
    for (const element of requiredElements) {
      if (text.toLowerCase().includes(element)) {
        foundElements++;
      }
    }
    
    return foundElements >= 3; // At least 3 out of 5 required elements
  }

  private checkConsumerProtectionCompliance(text: string): boolean {
    const requiredElements = [
      'terms and conditions',
      'pricing',
      'cancellation',
      'dispute resolution',
      'privacy'
    ];
    
    let foundElements = 0;
    for (const element of requiredElements) {
      if (text.toLowerCase().includes(element)) {
        foundElements++;
      }
    }
    
    return foundElements >= 3; // At least 3 out of 5 required elements
  }

  // ============================================================================
  // STRUCTURED DATA EXTRACTION
  // ============================================================================

  private async extractStructuredData(
    text: string,
    documentType: string
  ): Promise<Record<string, unknown>> {
    try {
      if (this.openaiApiKey) {
        return await this.extractStructuredDataWithAI(text, documentType);
      }

      return this.extractStructuredDataWithRules(text);
    } catch (error) {
      console.warn('AI extraction failed, using rule-based fallback:', error);
      return this.extractStructuredDataWithRules(text);
    }
  }

  private async extractStructuredDataWithAI(
    text: string,
    documentType: string
  ): Promise<Record<string, unknown>> {
    const prompt = `
      Extract structured data from this ${documentType} _document. Return a JSON object with relevant fields.
      
      Document text: ${text.substring(0, 1000)}...
      
      Respond with valid JSON only.
    `;

    try {
      const response = await this.callOpenAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`AI extraction failed: ${error}`);
    }
  }

  private extractStructuredDataWithRules(
    text: string
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    const lowerText = text.toLowerCase();

    // Extract common fields
    if (lowerText.includes('date')) {
      data.date = this.extractDate(text);
    }
    if (lowerText.includes('amount') || lowerText.includes('price') || lowerText.includes('salary')) {
      data.amount = this.extractAmount(text);
    }
    if (lowerText.includes('party') || lowerText.includes('company') || lowerText.includes('organization')) {
      data.parties = this.extractParties(text);
    }

    return data;
  }

  private extractDate(text: string): string | null {
    // Simple date extraction - in production, use a proper date parsing library
    const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/;
    const match = text.match(datePattern);
    return match ? match[0] : null;
  }

  private extractAmount(text: string): number | null {
    // Simple amount extraction - in production, use a proper currency parsing library
    const amountPattern = /[\$£€]?\s*\d+(?:,\d{3})*(?:\.\d{2})?/;
    const match = text.match(amountPattern);
    if (match) {
      return parseFloat(match[0].replace(/[\$£€,\s]/g, ''));
    }
    return null;
  }

  private extractParties(text: string): string[] {
    // Simple party extraction - in production, use NLP libraries
    const parties: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('party') || 
          line.toLowerCase().includes('company') || 
          line.toLowerCase().includes('organization')) {
        parties.push(line.trim());
      }
    }
    
    return parties.slice(0, 5); // Limit to 5 parties
  }

  // ============================================================================
  // RISK ASSESSMENT
  // ============================================================================

  private async assessRisks(
    text: string,
    documentType: string,
    complianceStatus: ComplianceStatus
  ): Promise<RiskAssessment> {
    const riskFactors: RiskFactor[] = [];
    let overallRisk = RiskLevel.LOW;
    let riskScore = 0;

    // Assess compliance risks
    if (!complianceStatus.eta_2019_compliant) {
      riskFactors.push({
        factor: 'ETA 2019 Non-compliance',
        severity: RiskLevel.HIGH,
        description: 'Document does not meet ETA 2019 requirements',
        impact: 'Legal invalidity and regulatory penalties',
        probability: 0.8,
        mitigation: 'Implement ETA 2019 compliant processes'
      });
      riskScore += 40;
    }

    // Assess _document type specific risks
    const typeRisks = this.assessDocumentTypeRisks(documentType, text);
    riskFactors.push(...typeRisks);
    riskScore += typeRisks.reduce((sum, risk) => sum + this.getRiskScore(risk.severity), 0);

    // Determine overall risk level
    if (riskScore >= 80) overallRisk = RiskLevel.CRITICAL;
    else if (riskScore >= 60) overallRisk = RiskLevel.HIGH;
    else if (riskScore >= 40) overallRisk = RiskLevel.MEDIUM;
    else overallRisk = RiskLevel.LOW;

    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(riskFactors);

    return {
      overall_risk: overallRisk,
      risk_score: Math.min(riskScore, 100),
      risk_factors: riskFactors,
      mitigation_strategies: mitigationStrategies,
      compliance_risks: this.extractComplianceRisks(complianceStatus)
    };
  }

  private assessDocumentTypeRisks(documentType: string, text: string): RiskFactor[] {
    const risks: RiskFactor[] = [];
    
    switch (documentType) {
      case 'employment_contract':
        if (!text.toLowerCase().includes('termination')) {
          risks.push({
            factor: 'Missing Termination Clauses',
            severity: RiskLevel.MEDIUM,
            description: 'Employment contract lacks proper termination procedures',
            impact: 'Legal disputes and regulatory non-compliance',
            probability: 0.6,
            mitigation: 'Include comprehensive termination clauses'
          });
        }
        break;
        
      case 'service_agreement':
        if (!text.toLowerCase().includes('liability')) {
          risks.push({
            factor: 'Missing Liability Clauses',
            severity: RiskLevel.MEDIUM,
            description: 'Service agreement lacks liability limitations',
            impact: 'Unlimited liability exposure',
            probability: 0.5,
            mitigation: 'Include appropriate liability limitations'
          });
        }
        break;
        
      case 'nda_agreement':
        if (!text.toLowerCase().includes('penalty')) {
          risks.push({
            factor: 'Missing Penalty Clauses',
            severity: RiskLevel.HIGH,
            description: 'NDA lacks enforcement mechanisms',
            impact: 'Weak confidentiality protection',
            probability: 0.7,
            mitigation: 'Include penalty and enforcement clauses'
          });
        }
        break;
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

  private generateMitigationStrategies(riskFactors: RiskFactor[]): string[] {
    const strategies: string[] = [];
    
    // Add strategies from risk factors
    for (const risk of riskFactors) {
      if (risk.mitigation && !strategies.includes(risk.mitigation)) {
        strategies.push(risk.mitigation);
      }
    }
    
    // Add general strategies
    strategies.push('Implement comprehensive review process');
    strategies.push('Establish compliance monitoring system');
    strategies.push('Provide staff training on legal requirements');
    
    return [...new Set(strategies)]; // Remove duplicates
  }

  private extractComplianceRisks(complianceStatus: ComplianceStatus): ComplianceRisk[] {
    return complianceStatus.compliance_details
      .filter(detail => detail.status !== 'compliant')
      .map(detail => ({
        regulation: 'ETA 2019',
        section: detail.section,
        risk_description: detail.description,
        severity: detail.status === 'non_compliant' ? RiskLevel.HIGH : RiskLevel.MEDIUM,
        mitigation_required: true
      }));
  }

  // ============================================================================
  // RECOMMENDATIONS GENERATION
  // ============================================================================

  private async generateRecommendations(
    documentType: string,
    complianceStatus: ComplianceStatus,
    riskAssessment: RiskAssessment
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Compliance recommendations
    if (!complianceStatus.eta_2019_compliant) {
      recommendations.push('Ensure _document meets all ETA 2019 requirements');
      recommendations.push('Implement electronic signature mechanisms');
      recommendations.push('Establish _document retention policies');
    }

    // Risk-based recommendations
    if (riskAssessment.overall_risk === RiskLevel.CRITICAL) {
      recommendations.push('Immediate legal review required');
      recommendations.push('Implement enhanced security measures');
      recommendations.push('Consider _document redesign');
    } else if (riskAssessment.overall_risk === RiskLevel.HIGH) {
      recommendations.push('Expert legal review recommended');
      recommendations.push('Implement multi-level validation');
      recommendations.push('Enhanced monitoring required');
    }

    // Document type specific recommendations
    const typeRecommendations = this.getDocumentTypeRecommendations(documentType);
    recommendations.push(...typeRecommendations);

    // General recommendations
    recommendations.push('Regular compliance audits recommended');
    recommendations.push('Staff training on legal requirements');
    recommendations.push('Implement automated compliance checking');

    return recommendations.slice(0, 10); // Limit to 10 recommendations
  }

  private getDocumentTypeRecommendations(documentType: string): string[] {
    switch (documentType) {
      case 'employment_contract':
        return [
          'Ensure compliance with Namibian Labour Act',
          'Include comprehensive termination procedures',
          'Specify working hours and overtime policies'
        ];
        
      case 'service_agreement':
        return [
          'Include clear scope and deliverables',
          'Specify payment terms and schedules',
          'Include dispute resolution procedures'
        ];
        
      case 'nda_agreement':
        return [
          'Define confidential information scope',
          'Include penalty and enforcement clauses',
          'Specify duration and termination conditions'
        ];
        
      default:
        return [
          'Review _document for legal compliance',
          'Ensure proper signature mechanisms',
          'Implement audit trail requirements'
        ];
    }
  }

  // ============================================================================
  // OPENAI API INTEGRATION
  // ============================================================================

  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${process.env.LLM_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a legal _document analysis assistant. Provide accurate, helpful responses.'
            },
            {
              role: '_user',
              content: prompt
            }
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      throw new Error(`OpenAI API call failed: ${error}`);
    }
  }

  // ============================================================================
  // PUBLIC UTILITY METHODS (for testing and external use)
  // ============================================================================

  extractSignatureFields(documentText: string): SignatureField[] {
    return this.detectSignatureFieldsWithRules(documentText);
  }

  assessRisk(documentData: { confidence_score: number; document_type: string }): RiskAssessment {
    const riskFactors: RiskFactor[] = [];
    let riskScore = 0;

    // Assess based on confidence score
    if (documentData.confidence_score < 0.5) {
      riskScore += 30;
      riskFactors.push({
        factor: 'Low Confidence Score',
        severity: RiskLevel.MEDIUM,
        description: 'Document analysis confidence is below acceptable threshold',
        impact: 'Potential misclassification or missed information',
        probability: 0.7,
        mitigation: 'Manual review recommended'
      });
    }

    // Assess based on _document type
    if (documentData.document_type === 'unknown') {
      riskScore += 25;
      riskFactors.push({
        factor: 'Unknown Document Type',
        severity: RiskLevel.MEDIUM,
        description: 'Document type could not be determined',
        impact: 'Inappropriate processing or compliance checks',
        probability: 0.6,
        mitigation: 'Manual classification required'
      });
    }

    // Assess based on _document type complexity
    if (documentData.document_type === 'unknown' || documentData.document_type === 'other') {
      riskScore += 20;
      riskFactors.push({
        factor: 'Unknown Document Type',
        severity: RiskLevel.LOW,
        description: 'Document type could not be determined',
        impact: 'Reduced processing accuracy',
        probability: 0.3,
        mitigation: 'Manual _document type classification required'
      });
    }

    // Determine overall risk level
    let overallRisk = RiskLevel.LOW;
    if (riskScore >= 60) overallRisk = RiskLevel.HIGH;
    else if (riskScore >= 30) overallRisk = RiskLevel.MEDIUM;

    return {
      overall_risk: overallRisk,
      risk_score: Math.min(riskScore / 100, 1),
      risk_factors: riskFactors,
      mitigation_strategies: riskFactors.map(f => f.mitigation),
      compliance_risks: []
    };
  }

  checkCompliance(documentData: { document_type: string; has_electronic_signature: boolean }, standards: string[]): { compliance_score: number; compliance_details: string[]; validation_errors: string[]; recommendations: string[]; eta_2019_compliant: boolean } {
    const result: { compliance_score: number; compliance_details: string[]; validation_errors: string[]; recommendations: string[]; eta_2019_compliant: boolean } = {
      compliance_score: 0.8,
      compliance_details: [],
      validation_errors: [],
      recommendations: [],
      eta_2019_compliant: false
    };

    for (const standard of standards) {
      if (standard === 'eta_2019') {
        const isCompliant = documentData.document_type === 'electronic_contract' && 
                           documentData.has_electronic_signature === true;
        
        result.eta_2019_compliant = isCompliant;
        result.compliance_score = isCompliant ? 0.9 : 0.4;
        
        if (!isCompliant) {
          result.validation_errors.push('Document does not meet ETA 2019 electronic signature requirements');
          result.recommendations.push('Implement electronic signature mechanism');
          result.recommendations.push('Ensure _document format compliance');
        }
      }
    }

    return result;
  }

  extractDocumentMetadata(documentText: string): { title: string; parties: string[]; dates: string[]; amounts: string[]; key_terms: string[] } {
    const metadata = {
      title: '',
      parties: [] as string[],
      dates: [] as string[],
      amounts: [] as string[],
      key_terms: [] as string[]
    };

    // Extract title (first line or line with "Agreement", "Contract", etc.)
    const lines = documentText.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const titleLine = lines.find(line => 
        line.toLowerCase().includes('agreement') || 
        line.toLowerCase().includes('contract') ||
        line.toLowerCase().includes('_document')
      ) || lines[0];
      metadata.title = titleLine.trim();
    }

    // Extract parties
    const partyPatterns = [
      /parties?:\s*([^.\n]+)/gi,
      /between\s+([^.\n]+)\s+and\s+([^.\n]+)/gi,
      /company\s+([a-z\s]+)/gi
    ];
    
    for (const pattern of partyPatterns) {
      const matches = documentText.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) metadata.parties.push(match[1].trim());
        if (match[2]) metadata.parties.push(match[2].trim());
      }
    }

    // Extract dates
    const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g;
    const dateMatches = documentText.matchAll(datePattern);
    for (const match of dateMatches) {
      metadata.dates.push(match[0]);
    }

    // Extract amounts
    const amountPattern = /[\$£€]?\s*\d+(?:,\d{3})*(?:\.\d{2})?/g;
    const amountMatches = documentText.matchAll(amountPattern);
    for (const match of amountMatches) {
      metadata.amounts.push(match[0]);
    }

    // Extract key terms
    const keyTerms = ['duration', 'term', 'liability', 'penalty', 'termination', 'confidential'];
    for (const term of keyTerms) {
      if (documentText.toLowerCase().includes(term)) {
        metadata.key_terms.push(term);
      }
    }

    return metadata;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default DocumentAnalyzer;
