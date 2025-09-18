"""
Orchestration engine for the Neo4j agent.
Enables the Neo4j agent to coordinate all workflows and services in BuffrSign.
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional, Callable, Type
import uuid
from datetime import datetime

from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class OrchestratorRegistry:
    """Registry for workflows, tools, agents, and services."""
    
    def __init__(self):
        self.workflows = {}
        self.tools = {}
        self.agents = {}
        self.services = {}
        self.active_workflows = {}
        
    def register_workflow(self, workflow_id: str, workflow_class) -> None:
        """Register a workflow with the registry."""
        self.workflows[workflow_id] = workflow_class
        logger.info(f"Workflow {workflow_id} registered")
        
    def get_workflow(self, workflow_id: str):
        """Get a workflow by ID."""
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow {workflow_id} not registered")
        return self.workflows[workflow_id]
        
    def register_tool(self, tool_id: str, tool_function: Callable) -> None:
        """Register a tool with the registry."""
        self.tools[tool_id] = tool_function
        logger.info(f"Tool {tool_id} registered")
        
    def get_tool(self, tool_id: str) -> Callable:
        """Get a tool by ID."""
        if tool_id not in self.tools:
            raise ValueError(f"Tool {tool_id} not registered")
        return self.tools[tool_id]
        
    def register_agent(self, agent_id: str, agent_instance) -> None:
        """Register an agent with the registry."""
        self.agents[agent_id] = agent_instance
        logger.info(f"Agent {agent_id} registered")
        
    def get_agent(self, agent_id: str):
        """Get an agent by ID."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not registered")
        return self.agents[agent_id]
        
    def register_service(self, service_id: str, service_instance) -> None:
        """Register a service with the registry."""
        self.services[service_id] = service_instance
        logger.info(f"Service {service_id} registered")
        
    def get_service(self, service_id: str):
        """Get a service by ID."""
        if service_id not in self.services:
            raise ValueError(f"Service {service_id} not registered")
        return self.services[service_id]
        
    def track_workflow(self, workflow_instance_id: str, workflow_instance) -> None:
        """Track an active workflow."""
        self.active_workflows[workflow_instance_id] = workflow_instance
        logger.info(f"Workflow instance {workflow_instance_id} tracked")
        
    def get_active_workflow(self, workflow_instance_id: str):
        """Get an active workflow by ID."""
        if workflow_instance_id not in self.active_workflows:
            return None
        return self.active_workflows[workflow_instance_id]


class OrchestratorEngine:
    """
    Central orchestration engine for the Neo4j agent.
    Coordinates all workflows and maintains global state.
    """
    
    def __init__(self):
        self.registry = OrchestratorRegistry()
        
    async def initialize(self):
        """Initialize the orchestration engine."""
        logger.info("Initializing orchestration engine")
        
        # Initialize services
        await self._initialize_services()
        
        # Register agents
        await self._register_agents()
        
        # Register tools
        await self._register_tools()
        
        # Register workflows
        await self._register_workflows()
        
        logger.info("Orchestration engine initialized")
        
    async def _initialize_services(self):
        """Initialize services."""
        try:
            # Import services
            from ..services.signature_service import signature_service
            from ..services.audit_trail_service import audit_trail_service
            from ..services.storage_service import storage_service
            
            # Try to import Supabase service
            try:
                from ..services.supabase_service import supabase_service
                self.registry.register_service("supabase", supabase_service)
                await supabase_service.initialize()
            except ImportError:
                logger.warning("Supabase service not available")
            
            # Register core services
            self.registry.register_service("signature", signature_service)
            self.registry.register_service("audit_trail", audit_trail_service)
            self.registry.register_service("storage", storage_service)
            
        except Exception as e:
            logger.error(f"Error initializing services: {e}")
            
    async def _register_agents(self):
        """Register agents."""
        try:
            # Try to import AI service agents
            try:
                from ..ai_services.agents.document_agent import document_agent
                from ..ai_services.agents.compliance_agent import compliance_agent
                from ..ai_services.agents.workflow_agent import workflow_agent
                
                self.registry.register_agent("document", document_agent)
                self.registry.register_agent("compliance", compliance_agent)
                self.registry.register_agent("workflow", workflow_agent)
            except ImportError:
                logger.warning("AI service agents not available")
                
        except Exception as e:
            logger.error(f"Error registering agents: {e}")
            
    async def _register_tools(self):
        """Register tools."""
        try:
            # Import tools from agent module
            from .tools import (
                vector_search_tool, graph_search_tool, hybrid_search_tool,
                get_document_tool, list_documents_tool, get_entity_relationships_tool,
                get_entity_timeline_tool, analyze_document_tool, generate_template_tool,
                check_compliance_tool, setup_workflow_tool, analyze_document_intelligence_tool
            )
            
            # Register core tools
            self.registry.register_tool("vector_search", vector_search_tool)
            self.registry.register_tool("graph_search", graph_search_tool)
            self.registry.register_tool("hybrid_search", hybrid_search_tool)
            self.registry.register_tool("get_document", get_document_tool)
            self.registry.register_tool("list_documents", list_documents_tool)
            self.registry.register_tool("get_entity_relationships", get_entity_relationships_tool)
            self.registry.register_tool("get_entity_timeline", get_entity_timeline_tool)
            self.registry.register_tool("analyze_document", analyze_document_tool)
            self.registry.register_tool("generate_template", generate_template_tool)
            self.registry.register_tool("check_compliance", check_compliance_tool)
            self.registry.register_tool("setup_workflow", setup_workflow_tool)
            self.registry.register_tool("analyze_document_intelligence", analyze_document_intelligence_tool)
            
        except Exception as e:
            logger.error(f"Error registering tools: {e}")
            
    async def _register_workflows(self):
        """Register workflows."""
        try:
            # Try to import workflows
            try:
                from ..ai_services.workflows.kyc_workflow import kyc_workflow_engine
                from ..ai_services.workflows.buffrsign_workflow import BuffrSignWorkflow
                
                # Register workflows
                self.registry.register_workflow("kyc", kyc_workflow_engine)
                self.registry.register_workflow("buffrsign", BuffrSignWorkflow)
            except ImportError:
                logger.warning("AI service workflows not available")
                
            # Try to import workflow orchestrator
            try:
                from ..workflow.orchestrator import workflow_orchestrator
                self.registry.register_workflow("general", workflow_orchestrator)
            except ImportError:
                logger.warning("General workflow orchestrator not available")
                
        except Exception as e:
            logger.error(f"Error registering workflows: {e}")
            
    async def start_workflow(self, workflow_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Start a workflow with the given input data."""
        try:
            workflow = self.registry.get_workflow(workflow_id)
            workflow_instance_id = str(uuid.uuid4())
            
            logger.info(f"Starting workflow {workflow_id} with instance ID {workflow_instance_id}")
            
            # Handle different workflow types
            if workflow_id == "kyc":
                # KYC workflow has a start_workflow method
                result_id = await workflow.start_workflow(input_data)
                result = {"workflow_instance_id": result_id}
                self.registry.track_workflow(workflow_instance_id, {"id": result_id, "type": "kyc"})
            elif workflow_id == "buffrsign":
                # BuffrSignWorkflow needs to be instantiated
                workflow_instance = workflow(workflow_instance_id, input_data.get("config"))
                result = await workflow_instance.execute_comprehensive_workflow(input_data)
                self.registry.track_workflow(workflow_instance_id, workflow_instance)
            elif workflow_id == "general":
                # General workflow orchestrator has a create_workflow method
                workflow_request = input_data.get("request")
                result = await workflow.create_workflow(workflow_request)
                self.registry.track_workflow(workflow_instance_id, result)
            else:
                raise ValueError(f"Unknown workflow type: {workflow_id}")
            
            return {
                "workflow_instance_id": workflow_instance_id,
                "status": "started",
                "result": result
            }
            
        except Exception as e:
            logger.error(f"Error starting workflow {workflow_id}: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
            
    async def get_workflow_status(self, workflow_instance_id: str) -> Dict[str, Any]:
        """Get the status of a workflow."""
        try:
            workflow_instance = self.registry.get_active_workflow(workflow_instance_id)
            
            if not workflow_instance:
                return {"status": "not_found"}
            
            # Handle different workflow types
            if isinstance(workflow_instance, dict) and workflow_instance.get("type") == "kyc":
                kyc_workflow = self.registry.get_workflow("kyc")
                status = await kyc_workflow.get_workflow_status(workflow_instance.get("id"))
                return status
            elif hasattr(workflow_instance, "get_status"):
                status = await workflow_instance.get_status()
                return status
            else:
                # Return the workflow instance itself if it has no get_status method
                return workflow_instance
                
        except Exception as e:
            logger.error(f"Error getting workflow status for {workflow_instance_id}: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
            
    async def execute_tool(self, tool_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool with the given input data."""
        try:
            tool = self.registry.get_tool(tool_id)
            result = await tool(input_data)
            return result
        except Exception as e:
            logger.error(f"Error executing tool {tool_id}: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
            
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request using the appropriate workflow or tool."""
        request_type = request.get("type", "tool")
        
        try:
            if request_type == "workflow":
                workflow_id = request.get("workflow_id")
                return await self.start_workflow(workflow_id, request)
            elif request_type == "tool":
                tool_id = request.get("tool_id")
                return await self.execute_tool(tool_id, request)
            elif request_type == "status":
                workflow_instance_id = request.get("workflow_instance_id")
                return await self.get_workflow_status(workflow_instance_id)
            else:
                raise ValueError(f"Unknown request type: {request_type}")
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return {
                "status": "error",
                "error": str(e)
            }


# Create a global instance of the orchestrator
orchestrator = OrchestratorEngine()
