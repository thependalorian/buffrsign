// BuffrSign Platform - AI Service Configuration
// Configuration for LlamaIndex, Pydantic AI, and LangGraph integration

import { AIServiceConfig } from './ai-types';

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const OPENAI_API_KEY = process.env.LLM_API_KEY || '';
const OPENAI_MODEL = process.env.LLM_CHOICE || 'gpt-4.1-mini';
const OPENAI_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || '0.1');
const OPENAI_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || '4000');

// ============================================================================
// AI SERVICE CONFIGURATION
// ============================================================================

export const aiConfig: AIServiceConfig = {
  openai: {
    api_key: OPENAI_API_KEY,
    model: OPENAI_MODEL,
    temperature: OPENAI_TEMPERATURE,
    max_tokens: OPENAI_MAX_TOKENS,
  },
  llamaindex: {
    enabled: true,
    chunk_size: 512,
    chunk_overlap: 50,
    embedding_model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  },
  pydantic_ai: {
    enabled: true,
    model: OPENAI_MODEL,
    validation_strict: true,
  },
  langgraph: {
    enabled: true,
    max_workflow_duration: 3600, // 1 hour
    human_review_timeout: 86400, // 24 hours
  },
  compliance: {
    eta_2019_enabled: true,
    namibian_law_enabled: true,
    international_standards: ['ETA_2019', 'eIDAS', 'ESIGN_ACT', 'UETA'],
  },
};

// ============================================================================
// ETA 2019 COMPLIANCE KNOWLEDGE BASE
// ============================================================================

export const ETA2019_KNOWLEDGE_BASE = {
  section_17: {
    title: 'Legal recognition of data messages',
    content: `
      Section 17: Legal recognition of data messages
      - Data messages have the same legal effect as written documents
      - Cannot be denied legal effect solely because they are in electronic form
      - Must be accessible and readable for subsequent reference
      - Must maintain integrity and authenticity
    `,
    requirements: [
      'Electronic format acceptance',
      'Legal equivalence to paper',
      'Accessibility for reference',
      'Integrity maintenance'
    ]
  },
  section_20: {
    title: 'Electronic signatures',
    content: `
      Section 20: Electronic signatures
      - Electronic signatures have the same legal effect as handwritten signatures
      - Must be capable of identifying the signatory
      - Must be linked to data in a way that detects any subsequent changes
      - Must be created using means that the signatory can maintain under their sole control
    `,
    requirements: [
      'Signatory identification',
      'Data linkage for change detection',
      'Sole control by signatory',
      'Legal equivalence to handwritten'
    ]
  },
  section_21: {
    title: 'Original information',
    content: `
      Section 21: Original information
      - Electronic records must maintain integrity
      - Must be accessible for subsequent reference
      - Must be capable of being displayed to the person to whom it is to be shown
      - Must maintain the same format and content as originally created
    `,
    requirements: [
      'Integrity maintenance',
      'Accessibility for reference',
      'Display capability',
      'Format preservation'
    ]
  },
  section_24: {
    title: 'Retention of data messages',
    content: `
      Section 24: Retention of data messages
      - Data messages must be retained for specified periods
      - Must be accessible and readable
      - Must maintain integrity and authenticity
      - Must be capable of being reproduced in the same format
    `,
    requirements: [
      'Retention period compliance',
      'Accessibility and readability',
      'Integrity and authenticity',
      'Reproduction capability'
    ]
  }
};

// ============================================================================
// NAMIBIAN LEGAL FRAMEWORK KNOWLEDGE
// ============================================================================

export const NAMIBIAN_LEGAL_KNOWLEDGE = {
  labour_act: {
    title: 'Namibian Labour Act',
    content: `
      Employment contracts and agreements must comply with:
      - Minimum wage requirements
      - Working hours and overtime
      - Leave entitlements
      - Termination procedures
      - Health and safety standards
    `,
    compliance_requirements: [
      'Minimum wage compliance',
      'Working hours regulation',
      'Leave entitlement compliance',
      'Proper termination procedures',
      'Health and safety standards'
    ]
  },
  consumer_protection: {
    title: 'Consumer Protection',
    content: `
      Service agreements must include:
      - Clear terms and conditions
      - Fair pricing and fees
      - Cancellation rights
      - Dispute resolution procedures
      - Privacy protection measures
    `,
    compliance_requirements: [
      'Transparent terms and conditions',
      'Fair pricing disclosure',
      'Cancellation rights',
      'Dispute resolution',
      'Privacy protection'
    ]
  },
  data_protection: {
    title: 'Data Protection Standards',
    content: `
      Personal data handling must comply with:
      - Consent requirements
      - Purpose limitation
      - Data minimization
      - Security measures
      - Retention policies
    `,
    compliance_requirements: [
      'Explicit consent',
      'Purpose limitation',
      'Data minimization',
      'Security measures',
      'Retention policies'
    ]
  }
};

// ============================================================================
// DOCUMENT CLASSIFICATION RULES
// ============================================================================

export const DOCUMENT_CLASSIFICATION_RULES = {
  employment_contract: {
    keywords: ['employment', 'contract', 'employee', 'employer', 'salary', 'benefits', 'termination'],
    required_fields: ['employee_name', 'employer_name', 'position', 'salary', 'start_date'],
    compliance_requirements: ['ETA_2019', 'Labour_Act'],
    risk_factors: ['salary_disclosure', 'termination_clauses', 'benefit_terms']
  },
  service_agreement: {
    keywords: ['service', 'agreement', 'provider', 'client', 'scope', 'deliverables', 'payment'],
    required_fields: ['service_provider', 'client', 'service_scope', 'payment_terms', 'duration'],
    compliance_requirements: ['ETA_2019', 'Consumer_Protection'],
    risk_factors: ['scope_definition', 'payment_terms', 'liability_limitations']
  },
  nda_agreement: {
    keywords: ['confidentiality', 'non-disclosure', 'trade_secret', 'proprietary', 'confidential'],
    required_fields: ['disclosing_party', 'receiving_party', 'confidential_information', 'duration'],
    compliance_requirements: ['ETA_2019', 'Confidentiality_Law'],
    risk_factors: ['information_scope', 'duration_terms', 'penalty_clauses']
  },
  financial_document: {
    keywords: ['financial', 'statement', 'balance', 'income', 'expense', 'account', 'transaction'],
    required_fields: ['institution_name', 'account_holder', 'statement_period', 'balance'],
    compliance_requirements: ['ETA_2019', 'Financial_Regulation'],
    risk_factors: ['financial_disclosure', 'accuracy_verification', 'regulatory_compliance']
  }
};

// ============================================================================
// SIGNATURE FIELD DETECTION RULES
// ============================================================================

export const SIGNATURE_DETECTION_RULES = {
  signature: {
    patterns: ['signature', 'sign', 'signed', 'signatory'],
    visual_indicators: ['signature_box', 'signature_line', 'signature_field'],
    required_attributes: ['x', 'y', 'width', 'height', 'page_number'],
    validation_rules: ['required', 'unique_per_party', 'proper_positioning']
  },
  date: {
    patterns: ['date', 'dated', 'effective_date', 'signature_date'],
    visual_indicators: ['date_field', 'date_box', 'date_line'],
    required_attributes: ['x', 'y', 'width', 'height', 'page_number'],
    validation_rules: ['required', 'valid_format', 'logical_sequence']
  },
  name: {
    patterns: ['name', 'full_name', 'printed_name', 'typed_name'],
    visual_indicators: ['name_field', 'name_box', 'name_line'],
    required_attributes: ['x', 'y', 'width', 'height', 'page_number'],
    validation_rules: ['required', 'readable_format', 'proper_identification']
  },
  title: {
    patterns: ['title', 'position', 'job_title', 'designation'],
    visual_indicators: ['title_field', 'title_box', 'title_line'],
    required_attributes: ['x', 'y', 'width', 'height', 'page_number'],
    validation_rules: ['optional', 'professional_format', 'role_clarity']
  },
  company: {
    patterns: ['company', 'organization', 'business', 'corporation'],
    visual_indicators: ['company_field', 'company_box', 'company_line'],
    required_attributes: ['x', 'y', 'width', 'height', 'page_number'],
    validation_rules: ['optional', 'legal_entity_format', 'business_identification']
  }
};

// ============================================================================
// RISK ASSESSMENT CRITERIA
// ============================================================================

export const RISK_ASSESSMENT_CRITERIA = {
  low_risk: {
    score_range: [0, 30],
    characteristics: [
      'Standard document types',
      'Clear compliance requirements',
      'Low financial impact',
      'Standard signature requirements'
    ],
    mitigation: [
      'Standard review process',
      'Template-based validation',
      'Automated compliance checks'
    ]
  },
  medium_risk: {
    score_range: [31, 60],
    characteristics: [
      'Complex document structures',
      'Multiple compliance requirements',
      'Moderate financial impact',
      'Multiple signature parties'
    ],
    mitigation: [
      'Enhanced review process',
      'Multi-level validation',
      'Human oversight required'
    ]
  },
  high_risk: {
    score_range: [61, 80],
    characteristics: [
      'High-value transactions',
      'Complex legal requirements',
      'High financial impact',
      'International compliance'
    ],
    mitigation: [
      'Expert legal review',
      'Multi-factor validation',
      'Enhanced security measures'
    ]
  },
  critical_risk: {
    score_range: [81, 100],
    characteristics: [
      'Regulatory violations',
      'Legal compliance issues',
      'Extreme financial impact',
      'Security vulnerabilities'
    ],
    mitigation: [
      'Immediate legal review',
      'Compliance verification',
      'Security assessment required'
    ]
  }
};

