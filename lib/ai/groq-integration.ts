// BuffrSign Platform - Groq AI Integration
// User tier-based Groq LLM integration for BuffrSign AI services

'use client';

import type {
  UserTier,
  GroqConfig,
  GroqMessage,
  GroqResponse,
  GroqAnalysisRequest,
  GroqComplianceRequest,
  GroqLegalExplanationRequest,
  APIResponse
} from './ai-types';

// ============================================================================
// GROQ AI INTEGRATION SERVICE
// ============================================================================

export class GroqAIIntegration {
  private config: GroqConfig;
  private apiBaseUrl: string;
  private apiKey?: string;

  constructor(apiBaseUrl: string = '/api/ai', apiKey?: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.apiKey = apiKey;
    
    // Initialize with environment-based config
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
      baseUrl: process.env.NEXT_PUBLIC_GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
      standardModel: process.env.NEXT_PUBLIC_GROQ_LLM_STANDARD || 'llama-3.1-8b-instant',
      proModel: process.env.NEXT_PUBLIC_GROQ_LLM_PRO || 'llama-3.1-70b-versatile'
    };
  }

  // ============================================================================
  // CORE GROQ METHODS
  // ============================================================================

  /**
   * Get the appropriate Groq model based on user tier
   */
  getModelForTier(userTier: UserTier): string {
    return userTier === 'pro' ? this.config.proModel : this.config.standardModel;
  }

  /**
   * Generate a response using the appropriate model for the user tier
   */
  async generateResponse(
    messages: GroqMessage[],
    userTier: UserTier,
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    }
  ): Promise<APIResponse<GroqResponse>> {
    try {
      const response = await this.makeAPICall('/groq', {
        messages,
        userTier,
        type: 'chat',
        options
      });

      return {
        success: true,
        data: response.data,
        metadata: {
          timestamp: new Date(),
          requestId: response.metadata?.requestId || '',
          processingTime: response.metadata?.processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          requestId: '',
        }
      };
    }
  }

  /**
   * Generate a streaming response for real-time chat
   */
  async generateStreamingResponse(
    messages: GroqMessage[],
    userTier: UserTier,
    onChunk: (chunk: string) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/groq/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          messages,
          userTier,
          options
        }),
      });

      if (!response.ok) {
        throw new Error('Streaming request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk') {
                  onChunk(data.content);
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Groq streaming error:', error);
      throw error;
    }
  }

  // ============================================================================
  // DOCUMENT ANALYSIS METHODS
  // ============================================================================

  /**
   * Analyze a document with tier-appropriate model
   */
  async analyzeDocument(
    request: GroqAnalysisRequest
  ): Promise<APIResponse<GroqResponse>> {
    try {
      const response = await this.makeAPICall('/groq', {
        type: 'analyze',
        ...request
      });

      return {
        success: true,
        data: response.data,
        metadata: {
          timestamp: new Date(),
          requestId: response.metadata?.requestId || '',
          processingTime: response.metadata?.processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          requestId: '',
        }
      };
    }
  }

  /**
   * Explain legal terms with tier-appropriate detail
   */
  async explainLegalTerms(
    request: GroqLegalExplanationRequest
  ): Promise<APIResponse<GroqResponse>> {
    const systemPrompt = `You are a qualified legal counsel specializing in Namibian law and ETA 2019. 

MANDATORY REQUIREMENTS FOR LEGAL TERM EXPLANATIONS:
1. **Always cite the specific legal source for each term**
2. **Provide exact legal definitions from relevant statutes**
3. **Include practical examples and applications**
4. **Reference relevant case law and precedents**
5. **Explain legal implications and consequences**

CITATION FORMAT REQUIRED:
**Legal Source**: [Document Title], [Section/Clause], [Jurisdiction]
**Definition**: [Exact legal definition]
**Authority**: [Regulatory body or legal authority]
**Context**: [Legal context and application]

RESPONSE STRUCTURE:
1. Legal Definition with source citation
2. Legal Context and Application
3. Practical Examples
4. Legal Implications
5. Related Legal Concepts
6. Legal Disclaimer`;

    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Explain these legal terms with detailed citations and legal context:\n\nTerms: ${request.terms.join(', ')}\nContext: ${request.context}\nUser Tier: ${request.userTier}` }
    ];

    return this.generateResponse(messages, request.userTier, {
      temperature: 0.1, // Lower temperature for precise legal definitions
      maxTokens: request.userTier === 'pro' ? 3000 : 1500,
    });
  }

  /**
   * Check compliance with tier-appropriate thoroughness
   */
  async checkCompliance(
    request: GroqComplianceRequest
  ): Promise<APIResponse<GroqResponse>> {
    try {
      const response = await this.makeAPICall('/groq', {
        type: 'compliance',
        ...request
      });

      return {
        success: true,
        data: response.data,
        metadata: {
          timestamp: new Date(),
          requestId: response.metadata?.requestId || '',
          processingTime: response.metadata?.processingTime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          requestId: '',
        }
      };
    }
  }

  // ============================================================================
  // BUFFRSIGN-SPECIFIC METHODS
  // ============================================================================

  /**
   * Get BuffrSign AI assistant response for document signing workflow
   */
  async getBuffrSignAssistantResponse(
    userMessage: string,
    userTier: UserTier,
    context?: {
      documentType?: string;
      workflowStage?: string;
      previousMessages?: GroqMessage[];
    }
  ): Promise<APIResponse<GroqResponse>> {
    const systemPrompt = this.getBuffrSignSystemPrompt(userTier);
    
    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(context?.previousMessages || []),
      { role: 'user', content: userMessage }
    ];

    return this.generateResponse(messages, userTier, {
      temperature: 0.2,
      maxTokens: userTier === 'pro' ? 4000 : 2000,
    });
  }

  /**
   * Analyze contract for signature requirements
   */
  async analyzeContractForSignatures(
    contractContent: string,
    userTier: UserTier
  ): Promise<APIResponse<GroqResponse>> {
    const systemPrompt = userTier === 'pro'
      ? this.getProContractAnalysisPrompt()
      : this.getStandardContractAnalysisPrompt();

    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this contract for signature requirements:\n\n${contractContent}` }
    ];

    return this.generateResponse(messages, userTier, {
      temperature: 0.1,
      maxTokens: userTier === 'pro' ? 5000 : 2500,
    });
  }

  /**
   * Check ETA 2019 compliance with enhanced legal citation
   */
  async checkETA2019Compliance(
    documentContent: string,
    userTier: UserTier
  ): Promise<APIResponse<GroqResponse>> {
    const systemPrompt = `You are a qualified legal counsel specializing in ETA 2019 compliance analysis. 

MANDATORY REQUIREMENTS:
1. **Always cite specific ETA 2019 sections and clauses**
2. **Reference CRAN regulations and guidelines**
3. **Provide detailed legal analysis with case law references**
4. **Include compliance assessment with specific clause violations**
5. **Provide actionable legal recommendations**

CITATION FORMAT REQUIRED:
**Legal Source**: [Document Title], [Section/Clause], [Jurisdiction]
**Reference**: [Specific clause or section number]
**Authority**: [Regulatory body or legal authority]

RESPONSE STRUCTURE:
1. Legal Analysis with specific ETA 2019 references
2. Compliance Assessment with clause-by-clause analysis
3. Risk Analysis with legal implications
4. Recommendations with specific legal actions
5. Legal Disclaimer`;

    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this document for ETA 2019 compliance with detailed legal citations:\n\n${documentContent}` }
    ];

    return this.generateResponse(messages, userTier, {
      temperature: 0.1, // Lower temperature for more precise legal analysis
      maxTokens: userTier === 'pro' ? 4000 : 2000,
    });
  }

  // ============================================================================
  // PROMPT GENERATION METHODS
  // ============================================================================

  private getBuffrSignSystemPrompt(userTier: UserTier): string {
    const basePrompt = `You are BuffrSign AI, a qualified legal counsel specializing in Namibian digital signature law and ETA 2019 compliance. You provide expert legal guidance with professional standards, always citing sources and referencing specific legal clauses like a practicing attorney.

## LEGAL COUNSEL MODE - PROFESSIONAL STANDARDS:

### MANDATORY SOURCE CITATION REQUIREMENTS:
**EVERY response MUST include:**

1. **Primary Legal Sources** (Always cite):
   - ETA 2019 sections with specific clause numbers
   - CRAN regulations and guidelines
   - Namibian case law and precedents
   - Relevant court decisions

2. **Citation Format** (Required for all legal references):
   **Legal Source**: [Document Title], [Section/Clause], [Jurisdiction]
   **Reference**: [Specific clause or section number]
   **Authority**: [Regulatory body or legal authority]
   **Date**: [Relevant date or version]

3. **Example Citation Format**:
   **Legal Source**: Electronic Transactions Act 2019, Section 17(1)(a), Namibia
   **Reference**: "A digital signature certificate must be issued by a licensed Certification Authority"
   **Authority**: Communications Regulatory Authority of Namibia (CRAN)
   **Date**: 2019

### PROFESSIONAL LEGAL STANDARDS:
- **Accuracy**: All legal information must be verified and current
- **Completeness**: Provide comprehensive legal analysis
- **Clarity**: Explain complex legal concepts clearly
- **Professionalism**: Maintain attorney-client privilege standards
- **Precision**: Use exact legal terminology and references

### YOUR EXPERTISE INCLUDES:
- **ETA 2019 (Electronic Transactions Act)**: Complete digital signature legal framework
- **CRAN Regulations**: Licensing, compliance, and operational requirements
- **Namibian Contract Law**: General contract principles and digital signature integration
- **Consumer Protection Act**: User rights, dispute resolution, and legal remedies
- **Data Protection Act**: Privacy and data security requirements
- **SADC Digital Signature Framework**: Regional standards and cross-border recognition
- **International Standards**: ISO 27001, ISO 14533, eIDAS, UNCITRAL

### RESPONSE STRUCTURE (MANDATORY):
1. **Legal Analysis**: Professional legal assessment
2. **Source Citations**: Specific legal references with clause numbers
3. **Compliance Assessment**: Detailed compliance analysis
4. **Risk Analysis**: Legal risks and implications
5. **Recommendations**: Actionable legal advice
6. **Disclaimer**: Professional legal disclaimer

### LEGAL DISCLAIMER (REQUIRED):
"**Legal Disclaimer**: This response constitutes general legal information and should not be construed as specific legal advice. For specific legal matters, consult with a qualified attorney licensed to practice law in Namibia. BuffrSign AI provides general guidance based on current Namibian law and ETA 2019."`;

    if (userTier === 'pro') {
      return basePrompt + `

## PRO LEGAL COUNSEL CAPABILITIES:
- **Advanced Legal Analysis**: Provide detailed legal reasoning with comprehensive case law references
- **Complex Workflow Design**: Handle sophisticated multi-party signing scenarios with legal risk assessment
- **Comprehensive Compliance**: Deep-dive compliance analysis across multiple legal frameworks
- **Expert Source Citation**: Provide extensive legal citations with case law, precedents, and regulatory guidance
- **Legal Risk Assessment**: Detailed analysis of legal risks, liabilities, and mitigation strategies
- **Regulatory Interpretation**: Expert interpretation of complex regulatory requirements
- **Cross-Jurisdictional Analysis**: Analysis of international and regional legal implications
- **Legal Precedent Research**: Reference to relevant case law and legal precedents
- **Compliance Strategy Development**: Comprehensive compliance strategies and implementation plans
- **Risk Assessment**: Detailed risk analysis and mitigation strategies
- **Professional Documentation**: Generate detailed reports and recommendations

Provide comprehensive, professional-grade assistance suitable for legal professionals and complex business transactions.`;
    }

    return basePrompt + `

## Standard User Focus:
- **Simple Explanations**: Break down complex processes into easy-to-understand steps
- **Practical Guidance**: Focus on getting tasks done quickly and efficiently
- **Basic Compliance**: Cover essential legal requirements without overwhelming detail
- **User-Friendly**: Use clear, non-technical language
- **Quick Solutions**: Provide fast, actionable answers

Keep responses practical and easy to understand for business users.`;
  }

  private getStandardContractAnalysisPrompt(): string {
    return `You are BuffrSign AI, analyzing contracts for signature requirements.
    Provide clear, practical analysis focusing on:
    - Document type identification
    - Basic signature field detection
    - Simple legal term explanations
    - Standard compliance checks
    
    Keep responses practical and easy to understand for business users.`;
  }

  private getProContractAnalysisPrompt(): string {
    return `You are BuffrSign AI Pro, providing advanced contract analysis with deep legal expertise.
    Provide comprehensive analysis including:
    - Detailed document structure analysis
    - Advanced signature field detection and validation
    - Complex legal term explanations with case law references
    - Thorough compliance checking against multiple frameworks
    - Risk assessment and recommendations
    - Cross-reference with Namibian Constitution and relevant legislation
    
    Provide detailed, professional analysis suitable for legal professionals and complex business transactions.`;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async makeAPICall(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return response.json();
  }

  /**
   * Get model information for a user tier
   */
  getModelInfo(userTier: UserTier): { model: string; tier: UserTier; capabilities: string[] } {
    const model = this.getModelForTier(userTier);
    
    const capabilities = userTier === 'pro' 
      ? [
          'Advanced legal analysis',
          'Complex workflow design',
          'Comprehensive compliance checking',
          'Risk assessment',
          'Professional documentation'
        ]
      : [
          'Basic document analysis',
          'Simple workflow guidance',
          'Standard compliance checks',
          'User-friendly explanations',
          'Quick solutions'
        ];

    return {
      model,
      tier: userTier,
      capabilities
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default GroqAIIntegration;
