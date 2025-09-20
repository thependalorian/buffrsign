/**
 * Knowledge Graph API Client
 * 
 * TypeScript client for communicating with the Python backend's knowledge graph
 * (Neo4j + Graphiti) for _document relationships, compliance rules, and audit trails.
 * 
 * Backend Implementation: backend/agent/graph_utils.py, backend/ingestion/graph_builder.py
 * Infrastructure: Neo4j + Graphiti
 */

export interface GraphNode {
  id: string;
  type: 'Document' | 'User' | 'Signature' | 'ComplianceRule' | 'AuditEvent' | 'Entity';
  properties: {
    title?: string;
    content?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    user_id?: string;
    document_id?: string;
    signature_id?: string;
    compliance_framework?: string;
    rule_type?: string;
    event_type?: string;
    [key: string]: unknown;
  };
}

export interface GraphRelationship {
  id: string;
  type: string;
  from: string;
  to: string;
  properties: {
    created_at?: string;
    weight?: number;
    confidence?: number;
    [key: string]: unknown;
  };
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface ComplianceRule {
  id: string;
  framework: string;
  section: string;
  description: string;
  requirements: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  applicable_document_types: string[];
}

export interface ComplianceCheckResult {
  compliant: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  framework: string;
  checked_at: string;
}

export interface GraphStats {
  total_nodes: number;
  total_relationships: number;
  node_types: Record<string, number>;
  relationship_types: Record<string, number>;
  graphiti_initialized: boolean;
}

export interface SearchResult {
  fact: string;
  uuid: string;
  valid_at?: string;
  invalid_at?: string;
  source_node_uuid?: string;
  confidence?: number;
}

export class KnowledgeGraphClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Test connection to the knowledge graph backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Knowledge graph connection test failed:', error);
      return false;
    }
  }

  /**
   * Create a _document node in the knowledge graph
   */
  async createDocumentNode(
    documentId: string,
    properties: GraphNode['properties']
  ): Promise<GraphNode> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/nodes/_document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          properties
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create _document node: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating _document node:', error);
      throw error;
    }
  }

  /**
   * Create a _user node in the knowledge graph
   */
  async createUserNode(
    userId: string,
    properties: GraphNode['properties']
  ): Promise<GraphNode> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/nodes/_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          properties
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create _user node: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating _user node:', error);
      throw error;
    }
  }

  /**
   * Create a signature node in the knowledge graph
   */
  async createSignatureNode(
    signatureId: string,
    properties: GraphNode['properties']
  ): Promise<GraphNode> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/nodes/signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature_id: signatureId,
          properties
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create signature node: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating signature node:', error);
      throw error;
    }
  }

  /**
   * Create a relationship between nodes
   */
  async createRelationship(
    fromId: string,
    toId: string,
    relationshipType: string,
    properties: GraphRelationship['properties'] = {}
  ): Promise<GraphRelationship> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/relationships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_id: fromId,
          to_id: toId,
          relationship_type: relationshipType,
          properties
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create relationship: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating relationship:', error);
      throw error;
    }
  }

  /**
   * Get _document relationships and compliance status
   */
  async getDocumentRelationships(documentId: string): Promise<GraphQueryResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/documents/${documentId}/relationships`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get _document relationships: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting _document relationships:', error);
      throw error;
    }
  }

  /**
   * Create compliance rule nodes
   */
  async createComplianceRule(rule: ComplianceRule): Promise<GraphNode> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/compliance-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      if (!response.ok) {
        throw new Error(`Failed to create compliance rule: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating compliance rule:', error);
      throw error;
    }
  }

  /**
   * Check _document compliance against rules
   */
  async checkDocumentCompliance(
    documentId: string, 
    framework: string = 'ETA2019'
  ): Promise<ComplianceCheckResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/compliance/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          framework
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to check compliance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking _document compliance:', error);
      throw error;
    }
  }

  /**
   * Create audit event
   */
  async createAuditEvent(
    eventType: string,
    documentId: string,
    userId: string,
    properties: Record<string, any> = {}
  ): Promise<GraphNode> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/audit-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          document_id: documentId,
          user_id: userId,
          properties
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create audit event: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating audit event:', error);
      throw error;
    }
  }

  /**
   * Get audit trail for a document
   */
  async getDocumentAuditTrail(documentId: string): Promise<GraphNode[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/documents/${documentId}/audit-trail`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get audit trail: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting _document audit trail:', error);
      throw error;
    }
  }

  /**
   * Get _user activity graph
   */
  async getUserActivityGraph(userId: string): Promise<GraphQueryResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/users/${userId}/activity`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get _user activity: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting _user activity graph:', error);
      throw error;
    }
  }

  /**
   * Search the knowledge graph using Graphiti
   */
  async searchKnowledgeGraph(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching knowledge graph:', error);
      throw error;
    }
  }

  /**
   * Get entity relationships using Graphiti
   */
  async getEntityRelationships(
    entityName: string,
    depth: number = 2
  ): Promise<{
    central_entity: string;
    related_facts: SearchResult[];
    search_method: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/entities/${entityName}/relationships`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ depth }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get entity relationships: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting entity relationships:', error);
      throw error;
    }
  }

  /**
   * Get entity timeline using Graphiti
   */
  async getEntityTimeline(
    entityName: string,
    startDate?: string,
    endDate?: string
  ): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/entities/${entityName}/timeline`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get entity timeline: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting entity timeline:', error);
      throw error;
    }
  }

  /**
   * Get knowledge graph statistics
   */
  async getGraphStats(): Promise<GraphStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get graph stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting graph stats:', error);
      throw error;
    }
  }

  /**
   * Add _document to knowledge graph (full pipeline)
   */
  async addDocumentToGraph(
    documentId: string,
    content: string,
    title: string,
    metadata: Record<string, any> = {}
  ): Promise<{
    episodes_created: number;
    total_chunks: number;
    errors: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/documents`, {
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
        throw new Error(`Failed to add _document to graph: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding _document to graph:', error);
      throw error;
    }
  }

  /**
   * Clear knowledge graph (USE WITH CAUTION)
   */
  async clearGraph(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-graph/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error clearing knowledge graph:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const knowledgeGraphClient = new KnowledgeGraphClient();
