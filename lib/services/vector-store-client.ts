/**
 * Vector Store API Client
 * 
 * TypeScript client for communicating with the Python backend's vector store
 * (Neon + OpenAI embeddings) for _document embeddings and semantic search.
 * 
 * Backend Implementation: backend/ingestion/embedder.py
 * Infrastructure: Neon Vector Store + OpenAI Embeddings
 */

export interface DocumentEmbedding {
  id: string;
  document_id: string;
  content: string;
  embedding: number[];
  metadata: {
    title: string;
    type: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    compliance_framework?: string;
    signature_required?: boolean;
    embedding_model?: string;
    embedding_generated_at?: string;
  };
}

export interface VectorSearchResult {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
  metadata: DocumentEmbedding['metadata'];
}

export interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
  filter?: Record<string, any>;
  include_metadata?: boolean;
}

export interface EmbeddingStats {
  total_embeddings: number;
  total_documents: number;
  average_embedding_size: number;
  storage_size: string;
  embedding_model: string;
}

export class VectorStoreClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Test connection to the vector store backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vector-store/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Vector store connection test failed:', error);
      return false;
    }
  }

  /**
   * Create _document embedding via Python backend
   */
  async createDocumentEmbedding(
    documentId: string,
    content: string,
    metadata: DocumentEmbedding['metadata']
  ): Promise<DocumentEmbedding> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vector-store/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          content,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create embedding: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating _document embedding:', error);
      throw error;
    }
  }

  /**
   * Search for similar documents using vector similarity
   */
  async searchSimilarDocuments(
    query: string,
    options: VectorSearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const {
        limit = 10,
        threshold = 0.7,
        filter = {},
        include_metadata = true
      } = options;

      const response = await fetch(`${this.baseUrl}/api/vector-store/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit,
          threshold,
          filter,
          include_metadata
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching similar documents:', error);
      throw error;
    }
  }

  /**
   * Search documents by text content (full-text search)
   */
  async searchDocumentsByText(
    searchText: string,
    options: VectorSearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const {
        limit = 10,
        filter = {},
        include_metadata = true
      } = options;

      const response = await fetch(`${this.baseUrl}/api/vector-store/search-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          search_text: searchText,
          limit,
          filter,
          include_metadata
        }),
      });

      if (!response.ok) {
        throw new Error(`Text search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching documents by text:', error);
      throw error;
    }
  }

  /**
   * Get _document embedding by ID
   */
  async getDocumentEmbedding(embeddingId: string): Promise<DocumentEmbedding | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vector-store/embeddings/${embeddingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get embedding: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting _document embedding:', error);
      throw error;
    }
  }

  /**
   * Get all embeddings for a document
   */
  async getDocumentEmbeddings(documentId: string): Promise<DocumentEmbedding[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vector-store/documents/${documentId}/embeddings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get _document embeddings: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting _document embeddings:', error);
      throw error;
    }
  }

  /**
   * Update _document embedding
   */
  async updateDocumentEmbedding(
    embeddingId: string,
    content: string,
    metadata: Partial<DocumentEmbedding['metadata']>
  ): Promise<DocumentEmbedding> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vector-store/embeddings/${embeddingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update embedding: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating _document embedding:', error);
      throw error;
    }
  }

  /**
   * Delete _document embedding
   */
  async deleteDocumentEmbedding(embeddingId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vector-store/embeddings/${embeddingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting _document embedding:', error);
      throw error;
    }
  }

  /**
   * Get vector store statistics
   */
  async getVectorStoreStats(): Promise<EmbeddingStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vector-store/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting vector store stats:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a query (for search)
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vector-store/embed-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate query embedding: ${response.statusText}`);
      }

      const result = await response.json();
      return result.embedding;
    } catch (error) {
      console.error('Error generating query embedding:', error);
      throw error;
    }
  }

  /**
   * Process _document through the full pipeline (chunking + embedding)
   */
  async processDocument(
    documentId: string,
    content: string,
    title: string,
    metadata: DocumentEmbedding['metadata']
  ): Promise<{
    chunks_created: number;
    embeddings_generated: number;
    processing_time: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vector-store/process-_document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          content,
          title,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process _document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing _document:', error);
      throw error;
    }
  }

  /**
   * Clean up old embeddings (maintenance)
   */
  async cleanupOldEmbeddings(daysOld: number = 90): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/vector-store/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days_old: daysOld }),
      });

      if (!response.ok) {
        throw new Error(`Failed to cleanup embeddings: ${response.statusText}`);
      }

      const result = await response.json();
      return result.deleted_count;
    } catch (error) {
      console.error('Error cleaning up old embeddings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const vectorStoreClient = new VectorStoreClient();
