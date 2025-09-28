// BuffrSign Platform - Database Utilities
// Direct database connections matching Python backend architecture


import { createClient } from '@supabase/supabase-js';

// ============================================================================
// DATABASE CONNECTION CONFIGURATION
// ============================================================================

// Get database connection from Supabase (PostgreSQL with pgvector)
const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const _supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

// Create service client for server-side operations
const supabaseService = createClient(_supabaseUrl, _supabaseServiceKey);

// ============================================================================
// VECTOR SEARCH UTILITIES
// ============================================================================

export interface ChunkResult {
  chunk_id: string;
  document_id: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
  document_title: string;
  document_source: string;
}

/**
 * Perform vector similarity search using pgvector
 * Matches Python: vector_search(embedding, limit)
 */
export async function vectorSearch(
  embedding: number[],
  limit: number = 10
): Promise<ChunkResult[]> {
  try {
    // Convert embedding to PostgreSQL vector string format
    // PostgreSQL vector format: '[1.0,2.0,3.0]' (no spaces after commas)
    const embeddingStr = '[' + embedding.join(',') + ']';
    
    const { data, error } = await supabaseService.rpc('match_chunks', {
      query_embedding: embeddingStr,
      match_count: limit
    });

    if (error) {
      console.error('Vector search error:', error);
      throw new Error(`Vector search failed: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Vector search error:', error);
    throw new Error(error instanceof Error ? error.message : 'Vector search failed');
  }
}

/**
 * Perform hybrid search (vector + keyword) using pgvector
 * Matches Python: hybrid_search(embedding, query_text, limit, text_weight)
 */
export async function hybridSearch(
  embedding: number[],
  queryText: string,
  limit: number = 10,
  textWeight: number = 0.3
): Promise<ChunkResult[]> {
  try {
    const embeddingStr = '[' + embedding.join(',') + ']';
    
    const { data, error } = await supabaseService.rpc('match_chunks_hybrid', {
      query_embedding: embeddingStr,
      query_text: queryText,
      match_count: limit,
      text_weight: textWeight
    });

    if (error) {
      console.error('Hybrid search error:', error);
      throw new Error(`Hybrid search failed: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Hybrid search error:', error);
    throw new Error(error instanceof Error ? error.message : 'Hybrid search failed');
  }
}

// ============================================================================
// DOCUMENT UTILITIES
// ============================================================================

export interface DocumentMetadata {
  id: string;
  title: string;
  content?: string;
  document_type: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  created_by: string;
  status: string;
  compliance_score?: number;
  risk_level?: string;
  eta_compliant?: boolean;
  cran_accredited?: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  ai_analysis?: Record<string, unknown>;
  analysis_status?: string;
  category?: string;
  description?: string;
}

/**
 * Get _document by ID
 * Matches Python: get_document(document_id)
 */
export async function getDocument(documentId: string): Promise<DocumentMetadata | null> {
  try {
    const { data, error } = await supabaseService
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Document not found
      }
      console.error('Get _document error:', error);
      throw new Error(`Get _document failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Get _document error:', error);
    throw new Error(error instanceof Error ? error.message : 'Get _document failed');
  }
}

/**
 * List documents with pagination
 * Matches Python: list_documents(limit, offset)
 */
export async function listDocuments(
  limit: number = 20,
  offset: number = 0
): Promise<{ documents: DocumentMetadata[]; total: number }> {
  try {
    const { data, error, count } = await supabaseService
      .from('documents')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('List documents error:', error);
      throw new Error(`List documents failed: ${error.message}`);
    }

    return {
      documents: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('List documents error:', error);
    throw new Error(error instanceof Error ? error.message : 'List documents failed');
  }
}

/**
 * Get _document chunks for a specific document
 * Matches Python: get_document_chunks(document_id)
 */
export async function getDocumentChunks(documentId: string): Promise<ChunkResult[]> {
  try {
    const { data, error } = await supabaseService
      .from('document_chunks')
      .select('*')
      .eq('document_id', documentId)
      .order('chunk_index');

    if (error) {
      console.error('Get _document chunks error:', error);
      throw new Error(`Get _document chunks failed: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Get _document chunks error:', error);
    throw new Error(error instanceof Error ? error.message : 'Get _document chunks failed');
  }
}

// ============================================================================
// KNOWLEDGE GRAPH UTILITIES
// ============================================================================

export interface GraphSearchResult {
  entity_id: string;
  entity_type: string;
  entity_name: string;
  properties: Record<string, unknown>;
  relationships: Array<{
    target_entity: string;
    relationship_type: string;
    properties: Record<string, unknown>;
  }>;
  score: number;
}

/**
 * Search knowledge graph using Neo4j/Graphiti
 * Matches Python: search_knowledge_graph(query, limit)
 */
export async function searchKnowledgeGraph(
  query: string,
  limit: number = 10
): Promise<GraphSearchResult[]> {
  try {
    // This would connect to Neo4j via Graphiti
    // For now, we'll use a placeholder that matches the Python interface
    const { data, error } = await supabaseService.rpc('search_knowledge_graph', {
      query_text: query,
      result_limit: limit
    });

    if (error) {
      console.error('Knowledge graph search error:', error);
      throw new Error(`Knowledge graph search failed: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Knowledge graph search error:', error);
    throw new Error(error instanceof Error ? error.message : 'Knowledge graph search failed');
  }
}

/**
 * Get entity relationships from knowledge graph
 * Matches Python: get_entity_relationships(entity_name, depth)
 */
export async function getEntityRelationships(
  entityName: string,
  depth: number = 2
): Promise<Record<string, unknown>> {
  try {
    const { data, error } = await supabaseService.rpc('get_entity_relationships', {
      entity_name: entityName,
      relationship_depth: depth
    });

    if (error) {
      console.error('Get entity relationships error:', error);
      throw new Error(`Get entity relationships failed: ${error.message}`);
    }

    return data || {};
  } catch (error) {
    console.error('Get entity relationships error:', error);
    throw new Error(error instanceof Error ? error.message : 'Get entity relationships failed');
  }
}

/**
 * Get entity timeline from knowledge graph
 * Matches Python: get_entity_timeline(entity_name, start_date, end_date)
 */
export async function getEntityTimeline(
  entityName: string,
  startDate?: string,
  endDate?: string
): Promise<Record<string, unknown>[]> {
  try {
    const { data, error } = await supabaseService.rpc('get_entity_timeline', {
      entity_name: entityName,
      start_date: startDate,
      end_date: endDate
    });

    if (error) {
      console.error('Get entity timeline error:', error);
      throw new Error(`Get entity timeline failed: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Get entity timeline error:', error);
    throw new Error(error instanceof Error ? error.message : 'Get entity timeline failed');
  }
}

// ============================================================================
// EMBEDDING UTILITIES
// ============================================================================

/**
 * Generate embedding for text using OpenAI
 * Matches Python: generate_embedding(text)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('/api/ai/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Embedding generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Generate embedding error:', error);
    throw new Error(error instanceof Error ? error.message : 'Generate embedding failed');
  }
}

// ============================================================================
// SESSION UTILITIES
// ============================================================================

export interface SessionData {
  id: string;
  user_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

/**
 * Create session
 * Matches Python: create_session(user_id, metadata, timeout_minutes)
 */
export async function createSession(
  userId: string,
  metadata: Record<string, unknown> = {},
  timeoutMinutes: number = 60
): Promise<string> {
  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + timeoutMinutes);

    const { data, error } = await supabaseService
      .from('sessions')
      .insert({
        user_id: userId,
        metadata,
        expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Create session error:', error);
      throw new Error(`Create session failed: ${error.message}`);
    }

    return data.id as string;
  } catch (error) {
    console.error('Create session error:', error);
    throw new Error(error instanceof Error ? error.message : 'Create session failed');
  }
}

/**
 * Get session by ID
 * Matches Python: get_session(session_id)
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  try {
    const { data, error } = await supabaseService
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Session not found or expired
      }
      console.error('Get session error:', error);
      throw new Error(`Get session failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Get session error:', error);
    throw new Error(error instanceof Error ? error.message : 'Get session failed');
  }
}

/**
 * Update session
 * Matches Python: update_session(session_id, metadata)
 */
export async function updateSession(
  sessionId: string,
  metadata: Record<string, unknown>
): Promise<boolean> {
  try {
    const { error } = await supabaseService
      .from('sessions')
      .update({
        metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Update session error:', error);
      throw new Error(`Update session failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Update session error:', error);
    throw new Error(error instanceof Error ? error.message : 'Update session failed');
  }
}

/**
 * Delete session
 * Matches Python: delete_session(session_id)
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabaseService
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Delete session error:', error);
      throw new Error(`Delete session failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Delete session error:', error);
    throw new Error(error instanceof Error ? error.message : 'Delete session failed');
  }
}

// ============================================================================
// EMAIL PROVIDER UTILITIES
// ============================================================================

export interface EmailProviderConfig {
  id: string;
  provider_name: string;
  is_active: boolean;
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Get active email provider configuration
 */
export async function getActiveEmailProvider(): Promise<EmailProviderConfig | null> {
  try {
    const { data, error } = await supabaseService
      .from('email_providers')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Get active email provider error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get active email provider error:', error);
    return null;
  }
}

/**
 * Update email provider configuration
 */
export async function updateEmailProviderConfig(
  providerName: string,
  config: Record<string, any>
): Promise<boolean> {
  try {
    const { error } = await supabaseService
      .from('email_providers')
      .update({
        configuration: config,
        updated_at: new Date().toISOString()
      })
      .eq('provider_name', providerName);

    if (error) {
      console.error('Update email provider config error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Update email provider config error:', error);
    return false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  supabaseService,
};
