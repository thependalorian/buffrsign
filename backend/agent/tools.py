"""
Tools for the Pydantic AI agent.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import uuid

from pydantic import BaseModel, Field
from dotenv import load_dotenv

from .db_utils import (
    vector_search,
    hybrid_search,
    get_document,
    list_documents,
    get_document_chunks
)
from .graph_utils import (
    search_knowledge_graph,
    get_entity_relationships,
    graph_client
)
from .models import ChunkResult, GraphSearchResult, DocumentMetadata
from .providers import get_embedding_client, get_embedding_model

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Initialize embedding client with flexible provider
embedding_client = get_embedding_client()
EMBEDDING_MODEL = get_embedding_model()


async def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding for text using OpenAI.
    
    Args:
        text: Text to embed
    
    Returns:
        Embedding vector
    """
    try:
        response = await embedding_client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}")
        raise


# Tool Input Models
class VectorSearchInput(BaseModel):
    """Input for vector search tool."""
    query: str = Field(..., description="Search query")
    limit: int = Field(default=10, description="Maximum number of results")


class GraphSearchInput(BaseModel):
    """Input for graph search tool."""
    query: str = Field(..., description="Search query")


class HybridSearchInput(BaseModel):
    """Input for hybrid search tool."""
    query: str = Field(..., description="Search query")
    limit: int = Field(default=10, description="Maximum number of results")
    text_weight: float = Field(default=0.3, description="Weight for text similarity (0-1)")


class DocumentInput(BaseModel):
    """Input for document retrieval."""
    document_id: str = Field(..., description="Document ID to retrieve")


class DocumentListInput(BaseModel):
    """Input for listing documents."""
    limit: int = Field(default=20, description="Maximum number of documents")
    offset: int = Field(default=0, description="Number of documents to skip")


class EntityRelationshipInput(BaseModel):
    """Input for entity relationship query."""
    entity_name: str = Field(..., description="Name of the entity")
    depth: int = Field(default=2, description="Maximum traversal depth")


class EntityTimelineInput(BaseModel):
    """Input for entity timeline query."""
    entity_name: str = Field(..., description="Name of the entity")
    start_date: Optional[str] = Field(None, description="Start date (ISO format)")
    end_date: Optional[str] = Field(None, description="End date (ISO format)")


# Tool Implementation Functions
async def vector_search_tool(input_data: VectorSearchInput) -> List[ChunkResult]:
    """
    Perform vector similarity search.
    
    Args:
        input_data: Search parameters
    
    Returns:
        List of matching chunks
    """
    try:
        # Generate embedding for the query
        embedding = await generate_embedding(input_data.query)
        
        # Perform vector search
        results = await vector_search(
            embedding=embedding,
            limit=input_data.limit
        )

        # Convert to ChunkResult models
        return [
            ChunkResult(
                chunk_id=str(r["chunk_id"]),
                document_id=str(r["document_id"]),
                content=r["content"],
                score=r["similarity"],
                metadata=r["metadata"],
                document_title=r["document_title"],
                document_source=r["document_source"]
            )
            for r in results
        ]
        
    except Exception as e:
        logger.error(f"Vector search failed: {e}")
        return []


async def graph_search_tool(input_data: GraphSearchInput) -> List[GraphSearchResult]:
    """
    Search the knowledge graph.
    
    Args:
        input_data: Search parameters
    
    Returns:
        List of graph search results
    """
    try:
        results = await search_knowledge_graph(
            query=input_data.query
        )
        
        # Convert to GraphSearchResult models
        return [
            GraphSearchResult(
                fact=r["fact"],
                uuid=r["uuid"],
                valid_at=r.get("valid_at"),
                invalid_at=r.get("invalid_at"),
                source_node_uuid=r.get("source_node_uuid")
            )
            for r in results
        ]
        
    except Exception as e:
        logger.error(f"Graph search failed: {e}")
        return []


async def hybrid_search_tool(input_data: HybridSearchInput) -> List[ChunkResult]:
    """
    Perform hybrid search (vector + keyword).
    
    Args:
        input_data: Search parameters
    
    Returns:
        List of matching chunks
    """
    try:
        # Generate embedding for the query
        embedding = await generate_embedding(input_data.query)
        
        # Perform hybrid search
        results = await hybrid_search(
            embedding=embedding,
            query_text=input_data.query,
            limit=input_data.limit,
            text_weight=input_data.text_weight
        )
        
        # Convert to ChunkResult models
        return [
            ChunkResult(
                chunk_id=str(r["chunk_id"]),
                document_id=str(r["document_id"]),
                content=r["content"],
                score=r["combined_score"],
                metadata=r["metadata"],
                document_title=r["document_title"],
                document_source=r["document_source"]
            )
            for r in results
        ]
        
    except Exception as e:
        logger.error(f"Hybrid search failed: {e}")
        return []


async def get_document_tool(input_data: DocumentInput) -> Optional[Dict[str, Any]]:
    """
    Retrieve a complete document.
    
    Args:
        input_data: Document retrieval parameters
    
    Returns:
        Document data or None
    """
    try:
        document = await get_document(input_data.document_id)
        
        if document:
            # Also get all chunks for the document
            chunks = await get_document_chunks(input_data.document_id)
            document["chunks"] = chunks
        
        return document
        
    except Exception as e:
        logger.error(f"Document retrieval failed: {e}")
        return None


async def list_documents_tool(input_data: DocumentListInput) -> List[DocumentMetadata]:
    """
    List available documents.
    
    Args:
        input_data: Listing parameters
    
    Returns:
        List of document metadata
    """
    try:
        documents = await list_documents(
            limit=input_data.limit,
            offset=input_data.offset
        )
        
        # Convert to DocumentMetadata models
        return [
            DocumentMetadata(
                id=d["id"],
                title=d["title"],
                source=d["source"],
                metadata=d["metadata"],
                created_at=datetime.fromisoformat(d["created_at"]),
                updated_at=datetime.fromisoformat(d["updated_at"]),
                chunk_count=d.get("chunk_count")
            )
            for d in documents
        ]
        
    except Exception as e:
        logger.error(f"Document listing failed: {e}")
        return []


async def get_entity_relationships_tool(input_data: EntityRelationshipInput) -> Dict[str, Any]:
    """
    Get relationships for an entity.
    
    Args:
        input_data: Entity relationship parameters
    
    Returns:
        Entity relationships
    """
    try:
        return await get_entity_relationships(
            entity=input_data.entity_name,
            depth=input_data.depth
        )
        
    except Exception as e:
        logger.error(f"Entity relationship query failed: {e}")
        return {
            "central_entity": input_data.entity_name,
            "related_entities": [],
            "relationships": [],
            "depth": input_data.depth,
            "error": str(e)
        }


async def get_entity_timeline_tool(input_data: EntityTimelineInput) -> List[Dict[str, Any]]:
    """
    Get timeline of facts for an entity.
    
    Args:
        input_data: Timeline query parameters
    
    Returns:
        Timeline of facts
    """
    try:
        # Parse dates if provided
        start_date = None
        end_date = None
        
        if input_data.start_date:
            start_date = datetime.fromisoformat(input_data.start_date)
        if input_data.end_date:
            end_date = datetime.fromisoformat(input_data.end_date)
        
        # Get timeline from graph
        timeline = await graph_client.get_entity_timeline(
            entity_name=input_data.entity_name,
            start_date=start_date,
            end_date=end_date
        )
        
        return timeline
        
    except Exception as e:
        logger.error(f"Entity timeline query failed: {e}")
        return []


# Combined search function for agent use
async def perform_comprehensive_search(
    query: str,
    use_vector: bool = True,
    use_graph: bool = True,
    limit: int = 10
) -> Dict[str, Any]:
    """
    Perform a comprehensive search using multiple methods.
    
    Args:
        query: Search query
        use_vector: Whether to use vector search
        use_graph: Whether to use graph search
        limit: Maximum results per search type (only applies to vector search)
    
    Returns:
        Combined search results
    """
    results = {
        "query": query,
        "vector_results": [],
        "graph_results": [],
        "total_results": 0
    }
    
    tasks = []
    
    if use_vector:
        tasks.append(vector_search_tool(VectorSearchInput(query=query, limit=limit)))
    
    if use_graph:
        tasks.append(graph_search_tool(GraphSearchInput(query=query)))
    
    if tasks:
        search_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        if use_vector and not isinstance(search_results[0], Exception):
            results["vector_results"] = search_results[0]
        
        if use_graph:
            graph_idx = 1 if use_vector else 0
            if not isinstance(search_results[graph_idx], Exception):
                results["graph_results"] = search_results[graph_idx]
    
    results["total_results"] = len(results["vector_results"]) + len(results["graph_results"])
    
    return results


# Additional Input Models for Missing Tools
class DocumentAnalysisInput(BaseModel):
    """Input for document analysis tool."""
    document_id: str = Field(..., description="Document ID to analyze")
    analysis_type: str = Field(default="comprehensive", description="Type of analysis to perform")


class TemplateGenerationInput(BaseModel):
    """Input for template generation tool."""
    template_type: str = Field(..., description="Type of template to generate")
    customization_data: Dict[str, Any] = Field(default={}, description="Customization parameters")


class ComplianceCheckInput(BaseModel):
    """Input for compliance check tool."""
    document_id: str = Field(..., description="Document ID to check")
    compliance_standards: List[str] = Field(default=["ETA_2019"], description="Standards to check against")


class WorkflowSetupInput(BaseModel):
    """Input for workflow setup tool."""
    workflow_type: str = Field(..., description="Type of workflow to set up")
    parties: List[Dict[str, Any]] = Field(..., description="List of parties involved")
    document_id: str = Field(..., description="Document ID for the workflow")


class DocumentIntelligenceInput(BaseModel):
    """Input for document intelligence tool."""
    document_id: str = Field(..., description="Document ID to analyze")
    intelligence_type: str = Field(default="full", description="Type of intelligence analysis")


# Missing Tools Implementation
async def analyze_document_tool(input_data: DocumentAnalysisInput) -> Dict[str, Any]:
    """
    Analyze a document for structure, content, and compliance.
    
    Args:
        input_data: Document analysis parameters
    
    Returns:
        Document analysis results
    """
    try:
        # Get document
        document = await get_document_tool(DocumentInput(document_id=input_data.document_id))
        
        if not document:
            return {
                "error": "Document not found",
                "document_id": input_data.document_id
            }
        
        # Perform analysis based on type
        analysis_result = {
            "document_id": input_data.document_id,
            "analysis_type": input_data.analysis_type,
            "document_title": document.get("title", "Unknown"),
            "document_type": "unknown",
            "signature_fields": [],
            "compliance_score": 0.0,
            "risk_assessment": "low",
            "recommendations": []
        }
        
        # Basic content analysis
        content = document.get("content", "")
        if content:
            # Detect document type
            if "employment" in content.lower() or "contract" in content.lower():
                analysis_result["document_type"] = "employment_contract"
            elif "nda" in content.lower() or "non-disclosure" in content.lower():
                analysis_result["document_type"] = "nda_agreement"
            elif "service" in content.lower() and "agreement" in content.lower():
                analysis_result["document_type"] = "service_agreement"
            
            # Count potential signature fields
            signature_indicators = ["signature", "signed", "date", "witness"]
            signature_count = sum(1 for indicator in signature_indicators if indicator in content.lower())
            analysis_result["signature_fields"] = [f"field_{i+1}" for i in range(signature_count)]
            
            # Basic compliance score
            compliance_keywords = ["eta", "electronic", "digital", "signature", "legal"]
            compliance_matches = sum(1 for keyword in compliance_keywords if keyword in content.lower())
            analysis_result["compliance_score"] = min(1.0, compliance_matches / len(compliance_keywords))
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Document analysis failed: {e}")
        return {
            "error": str(e),
            "document_id": input_data.document_id
        }


async def generate_template_tool(input_data: TemplateGenerationInput) -> Dict[str, Any]:
    """
    Generate a legal document template.
    
    Args:
        input_data: Template generation parameters
    
    Returns:
        Generated template
    """
    try:
        template_type = input_data.template_type.lower()
        customization = input_data.customization_data
        
        # Template library
        templates = {
            "employment_contract": {
                "title": "Employment Contract",
                "content": """
# EMPLOYMENT CONTRACT

**Employer:** {employer_name}
**Employee:** {employee_name}
**Position:** {position}
**Start Date:** {start_date}
**Salary:** {salary}

## Terms and Conditions

1. **Employment Period**: This contract is effective from {start_date} until terminated.

2. **Duties**: The Employee shall perform the duties of {position} as directed by the Employer.

3. **Compensation**: The Employee shall receive a salary of {salary} per {pay_period}.

4. **Termination**: Either party may terminate this contract with {notice_period} notice.

**Signed:**

Employer: _________________ Date: _________________
Employee: _________________ Date: _________________
                """,
                "required_fields": ["employer_name", "employee_name", "position", "start_date", "salary"]
            },
            "nda_agreement": {
                "title": "Non-Disclosure Agreement",
                "content": """
# NON-DISCLOSURE AGREEMENT

**Disclosing Party:** {disclosing_party}
**Receiving Party:** {receiving_party}
**Effective Date:** {effective_date}

## Confidentiality Terms

1. **Definition**: Confidential information includes {confidential_scope}.

2. **Obligations**: The Receiving Party agrees to maintain confidentiality.

3. **Duration**: This agreement remains in effect for {duration}.

4. **Return**: Upon termination, all confidential materials must be returned.

**Signed:**

Disclosing Party: _________________ Date: _________________
Receiving Party: _________________ Date: _________________
                """,
                "required_fields": ["disclosing_party", "receiving_party", "effective_date"]
            },
            "service_agreement": {
                "title": "Service Agreement",
                "content": """
# SERVICE AGREEMENT

**Service Provider:** {provider_name}
**Client:** {client_name}
**Service:** {service_description}
**Effective Date:** {effective_date}

## Service Terms

1. **Services**: The Provider shall deliver {service_description}.

2. **Payment**: Client shall pay {payment_amount} {payment_terms}.

3. **Timeline**: Services shall be completed by {completion_date}.

4. **Termination**: Agreement may be terminated with {notice_period} notice.

**Signed:**

Service Provider: _________________ Date: _________________
Client: _________________ Date: _________________
                """,
                "required_fields": ["provider_name", "client_name", "service_description", "effective_date"]
            }
        }
        
        if template_type not in templates:
            return {
                "error": f"Template type '{template_type}' not supported",
                "available_templates": list(templates.keys())
            }
        
        template = templates[template_type]
        
        # Fill in template with customization data
        content = template["content"]
        for field, value in customization.items():
            content = content.replace(f"{{{field}}}", str(value))
        
        return {
            "template_type": template_type,
            "title": template["title"],
            "content": content,
            "required_fields": template["required_fields"],
            "customization_applied": customization
        }
        
    except Exception as e:
        logger.error(f"Template generation failed: {e}")
        return {
            "error": str(e),
            "template_type": input_data.template_type
        }


async def check_compliance_tool(input_data: ComplianceCheckInput) -> Dict[str, Any]:
    """
    Check document compliance with specified standards.
    
    Args:
        input_data: Compliance check parameters
    
    Returns:
        Compliance check results
    """
    try:
        # Get document
        document = await get_document_tool(DocumentInput(document_id=input_data.document_id))
        
        if not document:
            return {
                "error": "Document not found",
                "document_id": input_data.document_id
            }
        
        content = document.get("content", "")
        compliance_results = {
            "document_id": input_data.document_id,
            "standards_checked": input_data.compliance_standards,
            "overall_compliance": True,
            "detailed_results": {}
        }
        
        # Check ETA 2019 compliance
        if "ETA_2019" in input_data.compliance_standards:
            eta_checks = {
                "section_20_compliant": "electronic signature" in content.lower(),
                "section_17_compliant": "legal recognition" in content.lower(),
                "section_21_compliant": "original information" in content.lower(),
                "section_24_compliant": "retention" in content.lower(),
                "consumer_protection": "consumer" in content.lower() or "protection" in content.lower()
            }
            
            compliance_results["detailed_results"]["ETA_2019"] = {
                "compliant": all(eta_checks.values()),
                "checks": eta_checks,
                "score": sum(eta_checks.values()) / len(eta_checks)
            }
        
        # Check internal compliance
        if "INTERNAL" in input_data.compliance_standards:
            internal_checks = {
                "security_standards": "security" in content.lower() or "encryption" in content.lower(),
                "audit_trail": "audit" in content.lower() or "trail" in content.lower(),
                "cryptographic_standards": "cryptographic" in content.lower() or "hash" in content.lower()
            }
            
            compliance_results["detailed_results"]["INTERNAL"] = {
                "compliant": all(internal_checks.values()),
                "checks": internal_checks,
                "score": sum(internal_checks.values()) / len(internal_checks)
            }
        
        # Calculate overall compliance
        all_scores = [result["score"] for result in compliance_results["detailed_results"].values()]
        compliance_results["overall_compliance"] = all(score >= 0.8 for score in all_scores)
        compliance_results["overall_score"] = sum(all_scores) / len(all_scores) if all_scores else 0.0
        
        return compliance_results
        
    except Exception as e:
        logger.error(f"Compliance check failed: {e}")
        return {
            "error": str(e),
            "document_id": input_data.document_id
        }


async def setup_workflow_tool(input_data: WorkflowSetupInput) -> Dict[str, Any]:
    """
    Set up a multi-party workflow.
    
    Args:
        input_data: Workflow setup parameters
    
    Returns:
        Workflow setup results
    """
    try:
        workflow_id = str(uuid.uuid4())
        
        workflow_config = {
            "workflow_id": workflow_id,
            "workflow_type": input_data.workflow_type,
            "document_id": input_data.document_id,
            "parties": input_data.parties,
            "status": "created",
            "created_at": datetime.utcnow().isoformat(),
            "current_step": 0,
            "total_steps": len(input_data.parties)
        }
        
        # Validate workflow type
        valid_types = ["sequential", "parallel", "conditional"]
        if input_data.workflow_type not in valid_types:
            return {
                "error": f"Invalid workflow type. Must be one of: {valid_types}",
                "workflow_type": input_data.workflow_type
            }
        
        # Set up party order for sequential workflows
        if input_data.workflow_type == "sequential":
            for i, party in enumerate(input_data.parties):
                party["signing_order"] = i + 1
                party["status"] = "pending"
        
        # Set up parallel workflows
        elif input_data.workflow_type == "parallel":
            for party in input_data.parties:
                party["signing_order"] = 1
                party["status"] = "pending"
        
        return {
            "success": True,
            "workflow": workflow_config,
            "message": f"Workflow '{input_data.workflow_type}' created successfully"
        }
        
    except Exception as e:
        logger.error(f"Workflow setup failed: {e}")
        return {
            "error": str(e),
            "workflow_type": input_data.workflow_type
        }


async def analyze_document_intelligence_tool(input_data: DocumentIntelligenceInput) -> Dict[str, Any]:
    """
    Perform advanced document intelligence analysis.
    
    Args:
        input_data: Document intelligence parameters
    
    Returns:
        Document intelligence results
    """
    try:
        # Get document
        document = await get_document_tool(DocumentInput(document_id=input_data.document_id))
        
        if not document:
            return {
                "error": "Document not found",
                "document_id": input_data.document_id
            }
        
        content = document.get("content", "")
        
        intelligence_result = {
            "document_id": input_data.document_id,
            "intelligence_type": input_data.intelligence_type,
            "document_metadata": {
                "title": document.get("title", "Unknown"),
                "source": document.get("source", "Unknown"),
                "created_at": document.get("created_at", ""),
                "word_count": len(content.split()),
                "character_count": len(content)
            },
            "content_analysis": {
                "key_topics": [],
                "entities": [],
                "sentiment": "neutral",
                "complexity_score": 0.0
            },
            "legal_analysis": {
                "legal_terms": [],
                "obligations": [],
                "risks": [],
                "recommendations": []
            },
            "compliance_analysis": {
                "eta_2019_compliance": False,
                "missing_requirements": [],
                "compliance_score": 0.0
            }
        }
        
        # Basic content analysis
        words = content.lower().split()
        
        # Extract key topics
        legal_keywords = ["contract", "agreement", "terms", "conditions", "obligations", "rights"]
        intelligence_result["content_analysis"]["key_topics"] = [
            word for word in set(words) if word in legal_keywords
        ]
        
        # Extract entities (simple approach)
        entities = []
        for word in words:
            if word.istitle() and len(word) > 2:
                entities.append(word)
        intelligence_result["content_analysis"]["entities"] = list(set(entities))[:10]
        
        # Basic sentiment analysis
        positive_words = ["agree", "benefit", "positive", "good", "fair"]
        negative_words = ["terminate", "penalty", "breach", "damage", "liability"]
        
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        
        if positive_count > negative_count:
            intelligence_result["content_analysis"]["sentiment"] = "positive"
        elif negative_count > positive_count:
            intelligence_result["content_analysis"]["sentiment"] = "negative"
        
        # Complexity score (simple word length average)
        avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
        intelligence_result["content_analysis"]["complexity_score"] = min(1.0, avg_word_length / 10)
        
        # Legal analysis
        legal_terms = ["party", "obligation", "liability", "indemnify", "warranty", "representation"]
        intelligence_result["legal_analysis"]["legal_terms"] = [
            term for term in legal_terms if term in words
        ]
        
        # Compliance analysis
        eta_requirements = ["electronic signature", "digital signature", "legal recognition"]
        missing_requirements = []
        for requirement in eta_requirements:
            if requirement not in content.lower():
                missing_requirements.append(requirement)
        
        intelligence_result["compliance_analysis"]["missing_requirements"] = missing_requirements
        intelligence_result["compliance_analysis"]["eta_2019_compliance"] = len(missing_requirements) == 0
        intelligence_result["compliance_analysis"]["compliance_score"] = (
            1.0 - len(missing_requirements) / len(eta_requirements)
        )
        
        return intelligence_result
        
    except Exception as e:
        logger.error(f"Document intelligence analysis failed: {e}")
        return {
            "error": str(e),
            "document_id": input_data.document_id
        }