"""
Initialization script for the Neo4j agent orchestration engine.
"""

import asyncio
import logging
from typing import Dict, Any, Optional

from .orchestrator import orchestrator
from .service_connections import service_manager

logger = logging.getLogger(__name__)


async def initialize_orchestration() -> bool:
    """
    Initialize the Neo4j agent orchestration engine.
    
    This function initializes the orchestration engine and service connections.
    It should be called at application startup.
    
    Returns:
        True if initialization was successful, False otherwise
    """
    try:
        logger.info("Initializing Neo4j agent orchestration engine")
        
        # Initialize orchestrator
        await orchestrator.initialize()
        orchestrator._initialized = True
        
        # Initialize service connections
        await service_manager.initialize()
        service_manager._initialized = True
        
        logger.info("Neo4j agent orchestration engine initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error initializing Neo4j agent orchestration engine: {e}")
        return False


async def shutdown_orchestration() -> bool:
    """
    Shutdown the Neo4j agent orchestration engine.
    
    This function shuts down the orchestration engine and service connections.
    It should be called at application shutdown.
    
    Returns:
        True if shutdown was successful, False otherwise
    """
    try:
        logger.info("Shutting down Neo4j agent orchestration engine")
        
        # Shutdown service connections
        if hasattr(service_manager, "shutdown"):
            await service_manager.shutdown()
        
        # Shutdown orchestrator
        if hasattr(orchestrator, "shutdown"):
            await orchestrator.shutdown()
        
        logger.info("Neo4j agent orchestration engine shut down successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error shutting down Neo4j agent orchestration engine: {e}")
        return False


def get_orchestration_status() -> Dict[str, Any]:
    """
    Get the status of the Neo4j agent orchestration engine.
    
    This function returns the current status of the orchestration engine
    and service connections.
    
    Returns:
        Dictionary with status information
    """
    try:
        orchestrator_initialized = hasattr(orchestrator, "_initialized") and orchestrator._initialized
        service_manager_initialized = hasattr(service_manager, "_initialized") and service_manager._initialized
        
        registered_workflows = len(orchestrator.registry.workflows) if hasattr(orchestrator, "registry") else 0
        registered_tools = len(orchestrator.registry.tools) if hasattr(orchestrator, "registry") else 0
        registered_agents = len(orchestrator.registry.agents) if hasattr(orchestrator, "registry") else 0
        registered_services = len(orchestrator.registry.services) if hasattr(orchestrator, "registry") else 0
        
        active_workflows = len(orchestrator.registry.active_workflows) if hasattr(orchestrator, "registry") else 0
        
        return {
            "orchestrator_initialized": orchestrator_initialized,
            "service_manager_initialized": service_manager_initialized,
            "registered_workflows": registered_workflows,
            "registered_tools": registered_tools,
            "registered_agents": registered_agents,
            "registered_services": registered_services,
            "active_workflows": active_workflows,
            "status": "ready" if orchestrator_initialized and service_manager_initialized else "not_ready"
        }
        
    except Exception as e:
        logger.error(f"Error getting orchestration status: {e}")
        return {
            "status": "error",
            "error": str(e)
        }


# Initialize orchestration on module import
async def initialize_on_import():
    """Initialize orchestration on module import."""
    try:
        await initialize_orchestration()
    except Exception as e:
        logger.error(f"Error initializing orchestration on import: {e}")

# Create initialization task
initialization_task = asyncio.create_task(initialize_on_import())
