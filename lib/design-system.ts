/**
 * BuffrSign Design System
 * 
 * Purpose: Comprehensive design system implementation based on strategic business model
 * Location: /lib/design-system.ts
 * Features: TypeScript-based design tokens, components, and business logic integration
 */

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export const designTokens = {
  // Color Palette (Based on Business Model)
  colors: {
    // Primary Colors - Trust & Security
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#1E40AF', // BuffrBlue - Primary
      600: '#1d4ed8',
      700: '#1e3a8a',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary Colors - Growth & Innovation
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#7C3AED', // BuffrPurple - Secondary
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    
    // Accent Colors - Premium Features
    accent: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#4F46E5', // BuffrIndigo - Accent
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    
    // Success Colors - Compliance & Approval
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#059669', // BuffrGreen - Success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Neutral Colors
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Slate - Secondary text
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#1F2937', // Charcoal - Text, headers
    },
    
    // Semantic Colors
    semantic: {
      warning: '#F59E0B', // Amber
      error: '#DC2626',   // Red
      info: '#3B82F6',    // Blue
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
    
    fontSize: {
      'display': ['48px', { lineHeight: '56px' }],
      'h1': ['36px', { lineHeight: '44px' }],
      'h2': ['30px', { lineHeight: '38px' }],
      'h3': ['24px', { lineHeight: '32px' }],
      'body-lg': ['18px', { lineHeight: '28px' }],
      'body': ['16px', { lineHeight: '24px' }],
      'body-sm': ['14px', { lineHeight: '20px' }],
      'caption': ['12px', { lineHeight: '16px' }],
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  }
} as const;

// ============================================================================
// BUSINESS MODEL INTEGRATION
// ============================================================================

export const businessModel = {
  // Pricing Structure
  pricing: {
    standard: {
      documentSigning: 25, // N$25 per document
      aiTokens: 2, // N$2 per 100 tokens
      freeStarterPack: {
        signatures: 3,
        tokens: 500
      },
      minTopUp: 50 // N$50 minimum
    },
    pro: {
      monthlyFee: 199, // N$199/month
      included: {
        signatures: 'unlimited',
        tokens: 10000
      },
      additionalTokens: 2 // N$2 per 100 tokens
    }
  },
  
  // AI Configuration
  ai: {
    groq: {
      llama8B: {
        cost: 0.00000176, // N$ per token
        speed: 750, // tokens/second
        contextWindow: 128000
      },
      llama70B: {
        cost: 0.00002076, // N$ per token
        speed: 200, // tokens/second
        contextWindow: 128000
      }
    },
    deepseek: {
      deepseekChat: {
        inputCost: 0.00014, // N$ per token
        outputCost: 0.00028, // N$ per token
        speed: 150 // tokens/second
      },
      deepseekCoder: {
        inputCost: 0.00014, // N$ per token
        outputCost: 0.00028, // N$ per token
        speed: 150 // tokens/second
      }
    }
  },
  
  // Law Firm Partnership
  lawFirm: {
    capabilities: {
      canDo: [
        'document_analysis',
        'field_detection',
        'basic_legal_explanations',
        'eta_2019_compliance',
        'template_generation',
        'risk_assessment',
        'workflow_orchestration',
        'signature_detection',
        'basic_contract_analysis'
      ],
      cannotDo: [
        'legal_advice',
        'legal_counsel',
        'litigation_handling',
        'legal_strategy',
        'jurisdiction_opinions',
        'complex_legal_interpretation',
        'court_proceedings',
        'legal_representation'
      ]
    },
    escalationTriggers: [
      'risk_score_above_70',
      'complex_legal_questions',
      'litigation_requests',
      'multi_jurisdictional_issues',
      'regulatory_beyond_eta2019'
    ]
  },

  // ETA 2019 Compliance Framework
  eta2019: {
    sections: {
      section17: {
        name: 'Legal Recognition of Data Messages',
        description: 'Data messages shall not be denied legal effect, validity or enforceability',
        requirements: [
          'Must be accessible for subsequent reference',
          'Must be retained in the format in which it was generated, sent or received',
          'Must be capable of being displayed to the person to whom it was sent'
        ]
      },
      section20: {
        name: 'Electronic Signatures',
        description: 'Electronic signature requirements for legal validity',
        requirements: [
          'Electronic signature must be uniquely linked to the signatory',
          'Must be capable of identifying the signatory',
          'Must be created using means that the signatory can maintain under his or her sole control',
          'Must be linked to the data message in such a manner that any subsequent change to the data message is detectable'
        ]
      },
      section21: {
        name: 'Original Information',
        description: 'Requirements for electronic data messages to satisfy original form requirements',
        requirements: [
          'The integrity of the information from the time when it was first generated in its final form',
          'The information is accessible so as to be usable for subsequent reference',
          'The information is presented in the format in which it was generated, sent or received'
        ]
      },
      section25: {
        name: 'Admissibility and Evidential Weight',
        description: 'Electronic data message admissibility as evidence',
        requirements: [
          'Electronic data message shall not be denied admissibility as evidence',
          'Evidential weight assessment criteria must be met',
          'Reliability of generation, storage, and communication methods',
          'Reliability of integrity maintenance',
          'Proper identification of originator'
        ]
      },
      chapter4: {
        name: 'Consumer Protection',
        description: 'Consumer protection requirements for electronic transactions',
        requirements: [
          'Fair and transparent terms and conditions',
          'Clear disclosure of electronic signature requirements',
          'Right to withdraw consent',
          'Cooling-off periods where applicable',
          'Dispute resolution mechanisms',
          'Data protection and privacy rights'
        ]
      }
    },
    complianceThresholds: {
      minimum: 70,
      good: 85,
      excellent: 95
    }
  }
} as const;

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg' | 'xl';
  state: 'default' | 'loading' | 'disabled' | 'success' | 'error';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface FormFieldProps {
  type: 'text' | 'email' | 'password' | 'file' | 'signature';
  validation: 'required' | 'optional' | 'conditional';
  aiAssist: boolean;
  label: string;
  placeholder?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export interface SignatureFieldProps {
  method: 'draw' | 'type' | 'upload' | 'voice';
  validation: SignatureValidation;
  compliance: ComplianceStatus;
  onSignature: (signature: SignatureData) => void;
  onValidation: (validation: ValidationResult) => void;
}

export interface DocumentAnalysisProps {
  _document: File;
  onAnalysis: (analysis: DocumentAnalysis) => void;
  onFieldDetection: (fields: SignatureField[]) => void;
  onComplianceCheck: (compliance: ComplianceStatus) => void;
}

export interface ETAComplianceValidatorProps {
  documentId: string;
  signatureData: unknown;
  onComplianceChange: (result: ETAComplianceResult) => void;
  className?: string;
}

export interface ComplianceDashboardProps {
  documentId: string;
  signatureData: unknown;
  className?: string;
}

export interface ComplianceStatusIndicatorProps {
  compliant: boolean;
  score: number;
  framework: 'ETA2019' | 'eIDAS' | 'ESIGN' | 'POPIA' | 'GDPR';
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showTooltip?: boolean;
  className?: string;
}

// ============================================================================
// BUSINESS LOGIC TYPES
// ============================================================================

export interface SignatureValidation {
  valid: boolean;
  confidence_score: number;
  verification_status: 'pending' | 'verified' | 'failed' | 'expired';
  compliance_status: ComplianceStatus;
  legal_validity: LegalValidity;
  details: VerificationDetails;
  recommendations: string[];
}

export interface ComplianceStatus {
  standards_met: ('eta_2019' | 'eidas' | 'esign_act' | 'ueta' | 'popia' | 'gdpr')[];
  overall_compliant: boolean;
  compliance_score: number;
  missing_requirements: string[];
}

export interface LegalValidity {
  enforceable: boolean;
  admissible: boolean;
  evidence_quality: 'low' | 'medium' | 'high';
  jurisdiction_valid: boolean;
  retention_valid: boolean;
}

export interface VerificationDetails {
  signature_id: string;
  document_id: string;
  signer_id: string;
  timestamp: string;
  certificate_valid: boolean;
  biometric_valid?: boolean;
  device_trusted: boolean;
  location_verified: boolean;
  risk_assessment: RiskAssessment;
}

export interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: RiskFactor[];
  risk_score: number;
  mitigation_required: boolean;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
}

export interface SignatureData {
  image_url?: string;
  digital_signature?: string;
  biometric_data?: BiometricData;
  verification_hash: string;
}

export interface BiometricData {
  type: 'fingerprint' | 'face' | 'voice';
  data_hash: string;
  device_id: string;
  timestamp: string;
}

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

export interface DocumentAnalysis {
  document_type: string;
  confidence: number;
  extracted_fields: ExtractedField[];
  compliance_score: number;
  risk_assessment: RiskAssessment;
  recommendations: Recommendation[];
  signature_locations: SignatureLocation[];
  ai_insights: AIInsight[];
}

export interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  location: FieldLocation;
  field_type: 'text' | 'signature' | 'date' | 'number' | 'email' | 'phone' | 'address';
}

export interface FieldLocation {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SignatureField {
  id: string;
  name: string;
  type: 'text' | 'signature' | 'date' | 'number' | 'email' | 'phone' | 'address';
  required: boolean;
  location: FieldLocation;
  placeholder_text?: string;
  validation_rules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'format' | 'length' | 'custom';
  value: string | number | boolean | RegExp | null;
  message: string;
}

export interface Recommendation {
  type: 'security' | 'compliance' | 'efficiency' | 'user_experience';
  priority: 'low' | 'medium' | 'high';
  description: string;
  action_required: boolean;
}

export interface SignatureLocation {
  field_name: string;
  location: FieldLocation;
  required: boolean;
  signer_role?: string;
  placeholder_text?: string;
}

export interface AIInsight {
  category: string;
  insight: string;
  confidence: number;
  actionable: boolean;
  related_fields: string[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const designUtils = {
  // Color utilities
  getColor: (color: string, shade: number = 500) => {
    const [category, ...rest] = color.split('-');
    const colorName = rest.join('-') || 'primary';
    return designTokens.colors[category as keyof typeof designTokens.colors]?.[colorName as any]?.[shade] || color;
  },
  
  // Spacing utilities
  getSpacing: (size: keyof typeof designTokens.spacing) => {
    return designTokens.spacing[size];
  },
  
  // Typography utilities
  getFontSize: (size: keyof typeof designTokens.typography.fontSize) => {
    return designTokens.typography.fontSize[size];
  },
  
  // Business logic utilities
  calculateTokenCost: (tokens: number, userType: 'standard' | 'pro') => {
    const cost = userType === 'pro' 
      ? businessModel.ai.groq.llama70B.cost 
      : businessModel.ai.groq.llama8B.cost;
    return tokens * cost;
  },
  
  calculateDeepSeekCost: (tokens: number) => {
    return tokens * businessModel.ai.deepseek.deepseekChat.inputCost;
  },
  
  calculateSignatureCost: (userType: 'standard' | 'pro') => {
    return userType === 'pro' ? 0 : businessModel.pricing.standard.documentSigning;
  },
  
  // AI capability checking
  canAIDo: (capability: string) => {
    return businessModel.lawFirm.capabilities.canDo.includes(capability as any);
  },
  
  shouldEscalate: (riskScore: number, triggers: string[]) => {
    return riskScore > 70 || triggers.some(trigger => 
      businessModel.lawFirm.escalationTriggers.includes(trigger as any)
    );
  },

  // ETA 2019 compliance utilities
  getETAComplianceThreshold: (level: 'minimum' | 'good' | 'excellent') => {
    return businessModel.eta2019.complianceThresholds[level];
  },

  isETACompliant: (score: number) => {
    return score >= businessModel.eta2019.complianceThresholds.minimum;
  },

  getETAComplianceLevel: (score: number) => {
    if (score >= businessModel.eta2019.complianceThresholds.excellent) return 'excellent';
    if (score >= businessModel.eta2019.complianceThresholds.good) return 'good';
    if (score >= businessModel.eta2019.complianceThresholds.minimum) return 'minimum';
    return 'non-compliant';
  }
};

// ============================================================================
// COMPONENT STYLES
// ============================================================================

export const componentStyles = {
  button: {
    base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    variants: {
      primary: 'bg-primary-500 text-white hover:bg-primary-600',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
      accent: 'bg-accent-500 text-white hover:bg-accent-600',
      outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-50',
      ghost: 'hover:bg-neutral-100'
    },
    sizes: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
      xl: 'h-14 px-8 text-xl'
    }
  },
  
  input: {
    base: 'flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
    error: 'border-error-500 focus:ring-error-500'
  },
  
  card: {
    base: 'rounded-lg border border-neutral-200 bg-white shadow-sm',
    header: 'flex flex-col space-y-1.5 p-6',
    content: 'p-6 pt-0',
    footer: 'flex items-center p-6 pt-0'
  },
  
  signature: {
    canvas: 'border-2 border-dashed border-neutral-300 rounded-lg cursor-crosshair',
    field: 'border-2 border-primary-500 rounded-md bg-primary-50/50',
    required: 'border-error-500 bg-error-50/50'
  }
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  designTokens,
  businessModel,
  designUtils,
  componentStyles
};
