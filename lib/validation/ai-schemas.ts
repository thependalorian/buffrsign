/**
 * AI API Input Validation Schemas
 * Comprehensive validation for all AI endpoints using Zod
 */

import { z } from 'zod';

// Base schemas
const UserTierSchema = z.enum(['standard', 'pro']);
const UUIDSchema = z.string().uuid();
const NonEmptyStringSchema = z.string().min(1).max(10000);

// Common context schemas
const AnalysisContextSchema = z.object({
  document_type: z.string().optional(),
  workflow_stage: z.string().optional(),
  previous_messages: z.array(z.string()).optional(),
  analysis_context: z.string().optional()
}).optional();

const ComplianceFrameworksSchema = z.array(z.string()).default(['ETA 2019', 'Namibian Labour Act']);

// AI Chat Request Schema
export const ChatRequestSchema = z.object({
  message: NonEmptyStringSchema,
  session_id: UUIDSchema.optional(),
  document_id: UUIDSchema.optional(),
  workflow_id: UUIDSchema.optional(),
  context: AnalysisContextSchema,
  userTier: UserTierSchema.default('standard')
});

// AI Analyze Request Schema
export const AnalyzeRequestSchema = z.object({
  document_id: UUIDSchema.optional(),
  document_content: z.string().max(100000).optional(), // 100KB limit
  analysis_type: z.enum(['comprehensive', 'basic']).default('comprehensive'),
  userTier: UserTierSchema.default('standard'),
  context: AnalysisContextSchema
}).refine(
  (data) => data.document_id || data.document_content,
  {
    message: "Either document_id or document_content is required",
    path: ["document_id", "document_content"]
  }
);

// AI Compliance Request Schema
export const ComplianceRequestSchema = z.object({
  document_id: UUIDSchema.optional(),
  document_content: z.string().max(100000).optional(), // 100KB limit
  frameworks: ComplianceFrameworksSchema,
  userTier: UserTierSchema.default('standard')
}).refine(
  (data) => data.document_id || data.document_content,
  {
    message: "Either document_id or document_content is required",
    path: ["document_id", "document_content"]
  }
);

// Groq Request Schema
export const GroqRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: NonEmptyStringSchema
  })).min(1).max(50), // Limit conversation length
  userTier: UserTierSchema,
  type: z.enum(['chat', 'analyze', 'explain', 'compliance']).default('chat'),
  documentContent: z.string().max(100000).optional(),
  analysisType: z.enum(['basic', 'comprehensive']).optional(),
  context: AnalysisContextSchema,
  terms: z.array(z.string()).optional(),
  frameworks: ComplianceFrameworksSchema.optional()
});

// Groq Streaming Request Schema
export const GroqStreamRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: NonEmptyStringSchema
  })).min(1).max(50),
  userTier: UserTierSchema,
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().min(1).max(4000).optional(),
    stream: z.boolean().optional()
  }).optional()
});

// LangGraph Request Schema
export const LangGraphRequestSchema = z.object({
  operation: z.enum([
    'start_workflow',
    'get_workflow_status',
    'execute_service_operation',
    'start_signature_workflow',
    'start_document_workflow',
    'pause_workflow',
    'resume_workflow',
    'cancel_workflow',
    'get_workflow_result',
    'get_workflow_history'
  ]),
  workflow_id: UUIDSchema.optional(),
  input_data: z.record(z.any()).optional(),
  execution_id: UUIDSchema.optional(),
  service_type: z.string().optional(),
  operation_name: z.string().optional(),
  params: z.record(z.any()).optional(),
  document_id: UUIDSchema.optional(),
  signers: z.array(z.string()).optional(),
  workflow_type: z.string().optional(),
  analysis_type: z.string().optional(),
  enable_compliance: z.boolean().optional()
});

// LlamaIndex Request Schema
export const LlamaIndexRequestSchema = z.object({
  operation: z.enum([
    'hybrid_search',
    'get_document',
    'list_documents',
    'get_entity_relationships',
    'get_entity_timeline',
    'analyze_document'
  ]),
  document_id: UUIDSchema.optional(),
  query: z.string().max(1000).optional(),
  limit: z.number().min(1).max(100).optional(),
  text_weight: z.number().min(0).max(1).optional(),
  entity_name: z.string().optional(),
  depth: z.number().min(1).max(10).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  analysis_type: z.string().optional(),
  offset: z.number().min(0).optional()
});

// Pydantic AI Request Schema
export const PydanticAIRequestSchema = z.object({
  operation: z.enum([
    'analyze_document',
    'check_compliance',
    'generate_template',
    'extract_entities',
    'analyze_sentiment',
    'get_available_agents',
    'get_agent_details'
  ]),
  document_id: UUIDSchema.optional(),
  analysis_type: z.string().optional(),
  template_type: z.string().optional(),
  agent_id: z.string().optional()
});

// Embeddings Request Schema
export const EmbeddingsRequestSchema = z.object({
  text: z.string().min(1).max(10000) // Limit text size for embeddings
});

// Validation helper functions
export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    throw error;
  }
};

// Type exports for use in API routes
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type ComplianceRequest = z.infer<typeof ComplianceRequestSchema>;
export type GroqRequest = z.infer<typeof GroqRequestSchema>;
export type GroqStreamRequest = z.infer<typeof GroqStreamRequestSchema>;
export type LangGraphRequest = z.infer<typeof LangGraphRequestSchema>;
export type LlamaIndexRequest = z.infer<typeof LlamaIndexRequestSchema>;
export type PydanticAIRequest = z.infer<typeof PydanticAIRequestSchema>;
export type EmbeddingsRequest = z.infer<typeof EmbeddingsRequestSchema>;
