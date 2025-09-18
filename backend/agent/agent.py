"""
Main Pydantic AI agent for agentic RAG with knowledge graph.
"""

import os
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from pydantic_ai import Agent, RunContext
from dotenv import load_dotenv

from .prompts import SYSTEM_PROMPT
from .providers import get_llm_model
from .tools import (
    vector_search_tool,
    graph_search_tool,
    hybrid_search_tool,
    get_document_tool,
    list_documents_tool,
    get_entity_relationships_tool,
    get_entity_timeline_tool,
    analyze_document_tool,
    generate_template_tool,
    check_compliance_tool,
    setup_workflow_tool,
    analyze_document_intelligence_tool,
    VectorSearchInput,
    GraphSearchInput,
    HybridSearchInput,
    DocumentInput,
    DocumentListInput,
    EntityRelationshipInput,
    EntityTimelineInput,
    DocumentAnalysisInput,
    TemplateGenerationInput,
    ComplianceCheckInput,
    WorkflowSetupInput,
    DocumentIntelligenceInput
)

# Import orchestration tools
from .orchestration_tools import (
    start_workflow_tool,
    get_workflow_status_tool,
    execute_service_operation_tool,
    start_kyc_workflow_tool,
    start_signature_workflow_tool,
    start_document_workflow_tool,
    WorkflowStartInput,
    WorkflowStatusInput,
    ServiceOperationInput,
    KYCWorkflowInput,
    SignatureWorkflowInput,
    DocumentWorkflowInput
)

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


@dataclass
class AgentDependencies:
    """Dependencies for the agent."""
    session_id: str
    user_id: Optional[str] = None
    search_preferences: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.search_preferences is None:
            self.search_preferences = {
                "use_vector": True,
                "use_graph": True,
                "default_limit": 10
            }


# Initialize the agent with flexible model configuration
rag_agent = Agent(
    get_llm_model(),
    deps_type=AgentDependencies,
    system_prompt=SYSTEM_PROMPT
)


# Register tools with proper docstrings (no description parameter)
@rag_agent.tool
async def vector_search(
    ctx: RunContext[AgentDependencies],
    query: str,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Search for relevant information using semantic similarity.
    
    This tool performs vector similarity search across document chunks
    to find semantically related content. Returns the most relevant results
    regardless of similarity score.
    
    Args:
        query: Search query to find similar content
        limit: Maximum number of results to return (1-50)
    
    Returns:
        List of matching chunks ordered by similarity (best first)
    """
    input_data = VectorSearchInput(
        query=query,
        limit=limit
    )
    
    results = await vector_search_tool(input_data)
    
    # Convert results to dict for agent
    return [chunk.dict() for chunk in results]


@rag_agent.tool
async def graph_search(
    ctx: RunContext[AgentDependencies],
    query: str
) -> List[Dict[str, Any]]:
    """
    Search the knowledge graph for relevant information.
    
    This tool searches the knowledge graph for information related to
    the query. It returns nodes and relationships that match the query,
    providing context and connections between concepts.
    
    Args:
        query: Search query to find related information in the graph
    
    Returns:
        List of matching graph nodes and relationships
    """
    input_data = GraphSearchInput(
        query=query
    )
    
    results = await graph_search_tool(input_data)
    
    # Convert results to dict for agent
    return [result.dict() for result in results]


@rag_agent.tool
async def hybrid_search(
    ctx: RunContext[AgentDependencies],
    query: str,
    limit: int = 10,
    text_weight: float = 0.3
) -> List[Dict[str, Any]]:
    """
    Search using both semantic similarity and text matching.
    
    This tool combines vector search and text search to find the most
    relevant results. It balances semantic understanding with keyword
    matching for more precise results.
    
    Args:
        query: Search query
        limit: Maximum number of results to return (1-50)
        text_weight: Weight for text search vs vector search (0-1)
    
    Returns:
        List of matching chunks ordered by combined score
    """
    input_data = HybridSearchInput(
        query=query,
        limit=limit,
        text_weight=text_weight
    )
    
    results = await hybrid_search_tool(input_data)
    
    # Convert results to dict for agent
    return [chunk.dict() for chunk in results]


@rag_agent.tool
async def get_document(
    ctx: RunContext[AgentDependencies],
    document_id: str
) -> Dict[str, Any]:
    """
    Retrieve a document by ID.
    
    This tool fetches a document by its unique identifier and returns
    its metadata and content. Use this when you need to access a specific
    document that has already been identified.
    
    Args:
        document_id: Unique document identifier
    
    Returns:
        Document metadata and content
    """
    input_data = DocumentInput(
        document_id=document_id
    )
    
    result = await get_document_tool(input_data)
    
    return result.dict() if result else {"error": "Document not found"}


@rag_agent.tool
async def list_documents(
    ctx: RunContext[AgentDependencies],
    limit: int = 20,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    List available documents.
    
    This tool lists available documents with their metadata, ordered by
    recency. Use this to discover what documents are available for
    searching or analysis.
    
    Args:
        limit: Maximum number of documents to return
        offset: Number of documents to skip
    
    Returns:
        List of document metadata
    """
    input_data = DocumentListInput(
        limit=limit,
        offset=offset
    )
    
    results = await list_documents_tool(input_data)
    
    # Convert results to dict for agent
    return [doc.dict() for doc in results]


@rag_agent.tool
async def get_entity_relationships(
    ctx: RunContext[AgentDependencies],
    entity_name: str,
    depth: int = 2
) -> Dict[str, Any]:
    """
    Explore relationships for a specific entity.
    
    This tool explores the knowledge graph to find relationships
    connected to a specific entity. It returns the entity and its
    connections up to the specified depth.
    
    Args:
        entity_name: Name of the entity to explore
        depth: Maximum relationship depth to traverse
    
    Returns:
        Entity and its relationships
    """
    input_data = EntityRelationshipInput(
        entity_name=entity_name,
        depth=depth
    )
    
    result = await get_entity_relationships_tool(input_data)
    
    return result


@rag_agent.tool
async def get_entity_timeline(
    ctx: RunContext[AgentDependencies],
    entity_name: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get timeline events for an entity.
    
    This tool retrieves timeline events related to a specific entity
    within an optional date range. It returns events ordered chronologically
    with their metadata.
    
    Args:
        entity_name: Name of the entity
        start_date: Optional start date (ISO format)
        end_date: Optional end date (ISO format)
    
    Returns:
        Timeline events for the entity
    """
    input_data = EntityTimelineInput(
        entity_name=entity_name,
        start_date=start_date,
        end_date=end_date
    )
    
    result = await get_entity_timeline_tool(input_data)
    
    return result


@rag_agent.tool
async def analyze_document(
    ctx: RunContext[AgentDependencies],
    document_id: str,
    analysis_type: str = "comprehensive"
) -> Dict[str, Any]:
    """
    Analyze a document for key information and compliance.
    
    This tool analyzes a document to extract key information, identify
    potential issues, and check compliance with relevant frameworks.
    Supports different analysis types for various needs.
    
    Args:
        document_id: Document ID to analyze
        analysis_type: Type of analysis (comprehensive, compliance, summary)
    
    Returns:
        Analysis results with key information and findings
    """
    input_data = DocumentAnalysisInput(
        document_id=document_id,
        analysis_type=analysis_type
    )
    
    return await analyze_document_tool(input_data)


@rag_agent.tool
async def generate_template(
    ctx: RunContext[AgentDependencies],
    template_type: str,
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate a document template with customized fields.
    
    This tool generates a document template based on the specified type
    and parameters. It creates a customized template that can be used
    for various document types.
    
    Args:
        template_type: Type of template to generate
        parameters: Template parameters for customization
    
    Returns:
        Generated template with metadata
    """
    input_data = TemplateGenerationInput(
        template_type=template_type,
        parameters=parameters
    )
    
    return await generate_template_tool(input_data)


@rag_agent.tool
async def check_compliance(
    ctx: RunContext[AgentDependencies],
    document_id: str,
    frameworks: List[str] = ["ETA_2019"],
    jurisdiction: str = "Namibia",
    detailed_analysis: bool = True
) -> Dict[str, Any]:
    """
    Check document compliance with legal frameworks.
    
    This tool checks a document for compliance with specified legal
    frameworks and jurisdictions. It identifies potential compliance
    issues and provides recommendations.
    
    Args:
        document_id: Document ID to check
        frameworks: List of compliance frameworks to check against
        jurisdiction: Legal jurisdiction
        detailed_analysis: Whether to provide detailed analysis
    
    Returns:
        Compliance check results with findings and recommendations
    """
    input_data = ComplianceCheckInput(
        document_id=document_id,
        frameworks=frameworks,
        jurisdiction=jurisdiction,
        detailed_analysis=detailed_analysis
    )
    
    return await check_compliance_tool(input_data)


@rag_agent.tool
async def setup_workflow(
    ctx: RunContext[AgentDependencies],
    document_id: str,
    workflow_type: str,
    parties: List[Dict[str, Any]],
    signature_fields: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Set up a digital signature workflow with proper party management.
    
    This tool configures digital signature workflows including party
    management, signature field placement, and workflow automation.
    Essential for multi-party document signing processes.
    
    Args:
        document_id: Document ID
        workflow_type: Type of workflow (sequential, parallel, custom)
        parties: List of parties and their roles
        signature_fields: Signature field configurations
    
    Returns:
        Workflow configuration and status
    """
    input_data = WorkflowSetupInput(
        document_id=document_id,
        workflow_type=workflow_type,
        parties=parties,
        signature_fields=signature_fields,
        user_id=ctx.deps.user_id or "unknown"
    )
    
    return await setup_workflow_tool(input_data)


@rag_agent.tool
async def analyze_document_intelligence(
    ctx: RunContext[AgentDependencies],
    file_path: str,
    document_type: str = "contract"
) -> Dict[str, Any]:
    """
    Perform intelligent document analysis for summary and key information.
    
    This tool provides intelligent document analysis including summary
    generation, key clause extraction, and compliance hints. Useful for
    quick document understanding and assessment.
    
    Args:
        file_path: Path to the document file
        document_type: Type of document
    
    Returns:
        Document intelligence analysis results
    """
    input_data = DocumentIntelligenceInput(
        file_path=file_path,
        document_type=document_type
    )
    
    return await analyze_document_intelligence_tool(input_data)


# Orchestration Tools
@rag_agent.tool
async def start_workflow(
    ctx: RunContext[AgentDependencies],
    workflow_id: str,
    input_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Start a workflow using the orchestration engine.
    
    This tool starts a workflow with the given input data. It supports
    various workflow types including KYC, signature, and document workflows.
    
    Args:
        workflow_id: ID of the workflow to start (kyc, signature, document)
        input_data: Input data for the workflow
    
    Returns:
        Dictionary with workflow instance ID and status
    """
    workflow_input = WorkflowStartInput(
        workflow_id=workflow_id,
        input_data=input_data
    )
    
    return await start_workflow_tool(workflow_input)


@rag_agent.tool
async def get_workflow_status(
    ctx: RunContext[AgentDependencies],
    workflow_instance_id: str
) -> Dict[str, Any]:
    """
    Get the status of a workflow.
    
    This tool retrieves the current status of a workflow using the orchestration engine.
    
    Args:
        workflow_instance_id: ID of the workflow instance
    
    Returns:
        Dictionary with workflow status information
    """
    status_input = WorkflowStatusInput(
        workflow_instance_id=workflow_instance_id
    )
    
    return await get_workflow_status_tool(status_input)


@rag_agent.tool
async def execute_service_operation(
    ctx: RunContext[AgentDependencies],
    service_type: str,
    operation: str,
    params: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Execute an operation on a service.
    
    This tool executes an operation on a service using the service connection manager.
    It supports various service types including signature, audit_trail, and supabase.
    
    Args:
        service_type: Type of service (signature, audit_trail, supabase)
        operation: Operation to execute
        params: Operation parameters
    
    Returns:
        Dictionary with operation result
    """
    service_input = ServiceOperationInput(
        service_type=service_type,
        operation=operation,
        params=params
    )
    
    return await execute_service_operation_tool(service_input)


@rag_agent.tool
async def start_kyc_workflow(
    ctx: RunContext[AgentDependencies],
    user_id: str,
    document_id: Optional[str] = None,
    document_type: str = "national_id",
    country_hint: Optional[str] = None
) -> Dict[str, Any]:
    """
    Start a KYC workflow for identity verification.
    
    This tool starts a KYC workflow for verifying a user's identity using
    the provided document. It supports various ID document types and SADC countries.
    
    Args:
        user_id: User ID for KYC verification
        document_id: Document ID if already uploaded
        document_type: Type of ID document
        country_hint: Country code hint (e.g., NA, ZA)
    
    Returns:
        Dictionary with workflow instance ID and status
    """
    kyc_input = KYCWorkflowInput(
        user_id=user_id,
        document_id=document_id,
        document_type=document_type,
        country_hint=country_hint
    )
    
    return await start_kyc_workflow_tool(kyc_input)


@rag_agent.tool
async def start_signature_workflow(
    ctx: RunContext[AgentDependencies],
    document_id: str,
    workflow_type: str = "sequential",
    parties: List[Dict[str, Any]] = [],
    signature_fields: List[Dict[str, Any]] = [],
    compliance_level: str = "standard"
) -> Dict[str, Any]:
    """
    Start a signature workflow for document signing.
    
    This tool starts a signature workflow for collecting signatures on a document.
    It supports various workflow types and compliance levels.
    
    Args:
        document_id: Document to set up for signing
        workflow_type: Workflow type: sequential, parallel, or custom
        parties: List of signing parties with roles
        signature_fields: Signature field configurations
        compliance_level: Compliance level: basic, standard, or enhanced
    
    Returns:
        Dictionary with workflow instance ID and status
    """
    signature_input = SignatureWorkflowInput(
        document_id=document_id,
        workflow_type=workflow_type,
        parties=parties,
        signature_fields=signature_fields,
        compliance_level=compliance_level
    )
    
    return await start_signature_workflow_tool(signature_input)


@rag_agent.tool
async def start_document_workflow(
    ctx: RunContext[AgentDependencies],
    document_path: str,
    document_type: str,
    compliance_frameworks: List[str] = ["ETA_2019"],
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Start a document workflow for document processing.
    
    This tool starts a document workflow for processing and analyzing a document.
    It supports various document types and compliance frameworks.
    
    Args:
        document_path: Path to document file
        document_type: Type of document (contract, agreement, etc.)
        compliance_frameworks: Compliance frameworks to check
        user_id: User ID for audit trail
    
    Returns:
        Dictionary with workflow instance ID and status
    """
    document_input = DocumentWorkflowInput(
        document_path=document_path,
        document_type=document_type,
        compliance_frameworks=compliance_frameworks,
        user_id=user_id or ctx.deps.user_id or "unknown"
    )
    
    return await start_document_workflow_tool(document_input)


# Main agent function
async def process_message(
    message: str,
    session_id: str,
    user_id: Optional[str] = None,
    search_preferences: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Process a user message with the agent.
    
    Args:
        message: User message to process
        session_id: Session identifier
        user_id: User identifier
        search_preferences: Search preferences
    
    Returns:
        Agent response with tools used
    """
    try:
        # Create dependencies
        deps = AgentDependencies(
            session_id=session_id,
            user_id=user_id,
            search_preferences=search_preferences
        )
        
        # Process with agent
        response = await rag_agent.run(message, deps)
        
        return {
            "response": response.content,
            "tools_used": response.tool_calls,
            "session_id": session_id,
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        return {
            "error": str(e),
            "session_id": session_id,
            "user_id": user_id
        }