"""
Service connections for the Neo4j agent.
Connects the Neo4j agent with various services in BuffrSign.
"""

import logging
import os
import json
from typing import Dict, Any, List, Optional
import asyncio
from datetime import datetime

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class ServiceConnection:
    """Base class for service connections."""
    
    def __init__(self, service_id: str):
        self.service_id = service_id
        self.state = {"status": "initialized", "last_update": datetime.utcnow().isoformat()}
        
    async def initialize(self) -> bool:
        """Initialize the service connection."""
        self.state["status"] = "initialized"
        self.state["last_update"] = datetime.utcnow().isoformat()
        return True
        
    async def execute(self, operation: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an operation on the service."""
        raise NotImplementedError("Subclasses must implement the execute method")
        
    async def get_status(self) -> Dict[str, Any]:
        """Get the status of the service connection."""
        return self.state


class SignatureServiceConnection(ServiceConnection):
    """Connection to the signature service."""
    
    async def initialize(self) -> bool:
        """Initialize the signature service connection."""
        try:
            # Import signature service
            try:
                from ..services.signature_service import signature_service
                self.signature_service = signature_service
            except ImportError:
                logger.error("Signature service not available")
                self.state["status"] = "error"
                self.state["error"] = "Signature service not available"
                return False
                
            # Initialize signature service if it has an initialize method
            if hasattr(self.signature_service, "initialize"):
                await self.signature_service.initialize()
                
            self.state["status"] = "ready"
            self.state["last_update"] = datetime.utcnow().isoformat()
            return True
            
        except Exception as e:
            logger.error(f"Error initializing signature service connection: {e}")
            self.state["status"] = "error"
            self.state["error"] = str(e)
            return False
            
    async def execute(self, operation: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an operation on the signature service."""
        try:
            if operation == "create_signature":
                return await self._create_signature(params)
            elif operation == "verify_signature":
                return await self._verify_signature(params)
            elif operation == "get_signature_status":
                return await self._get_signature_status(params)
            else:
                raise ValueError(f"Unknown operation: {operation}")
                
        except Exception as e:
            logger.error(f"Error executing operation {operation} on signature service: {e}")
            return {"status": "error", "error": str(e)}
            
    async def _create_signature(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create a signature."""
        document_id = params.get("document_id")
        user_id = params.get("user_id")
        signature_field_id = params.get("signature_field_id")
        signature_type = params.get("signature_type", "electronic")
        signature_data = params.get("signature_data", {})
        
        result = await self.signature_service.create_signature(
            document_id=document_id,
            user_id=user_id,
            signature_field_id=signature_field_id,
            signature_type=signature_type,
            signature_data=signature_data
        )
        
        return result
        
    async def _verify_signature(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Verify a signature."""
        signature_id = params.get("signature_id")
        
        result = await self.signature_service.verify_signature(signature_id)
        
        return result
        
    async def _get_signature_status(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Get signature status."""
        signature_id = params.get("signature_id")
        
        result = await self.signature_service.get_signature_status(signature_id)
        
        return result


class AuditTrailServiceConnection(ServiceConnection):
    """Connection to the audit trail service."""
    
    async def initialize(self) -> bool:
        """Initialize the audit trail service connection."""
        try:
            # Import audit trail service
            try:
                from ..services.audit_trail_service import audit_trail_service
                self.audit_trail_service = audit_trail_service
            except ImportError:
                logger.error("Audit trail service not available")
                self.state["status"] = "error"
                self.state["error"] = "Audit trail service not available"
                return False
                
            # Initialize audit trail service if it has an initialize method
            if hasattr(self.audit_trail_service, "initialize"):
                await self.audit_trail_service.initialize()
                
            self.state["status"] = "ready"
            self.state["last_update"] = datetime.utcnow().isoformat()
            return True
            
        except Exception as e:
            logger.error(f"Error initializing audit trail service connection: {e}")
            self.state["status"] = "error"
            self.state["error"] = str(e)
            return False
            
    async def execute(self, operation: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an operation on the audit trail service."""
        try:
            if operation == "create_audit_entry":
                return await self._create_audit_entry(params)
            elif operation == "get_audit_trail":
                return await self._get_audit_trail(params)
            elif operation == "verify_audit_trail":
                return await self._verify_audit_trail(params)
            else:
                raise ValueError(f"Unknown operation: {operation}")
                
        except Exception as e:
            logger.error(f"Error executing operation {operation} on audit trail service: {e}")
            return {"status": "error", "error": str(e)}
            
    async def _create_audit_entry(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create an audit trail entry."""
        document_id = params.get("document_id")
        user_id = params.get("user_id")
        action = params.get("action")
        details = params.get("details", {})
        
        result = await self.audit_trail_service.create_entry(
            document_id=document_id,
            user_id=user_id,
            action=action,
            details=details
        )
        
        return result
        
    async def _get_audit_trail(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Get audit trail for a document."""
        document_id = params.get("document_id")
        
        result = await self.audit_trail_service.get_audit_trail(document_id)
        
        return result
        
    async def _verify_audit_trail(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Verify audit trail integrity."""
        document_id = params.get("document_id")
        
        result = await self.audit_trail_service.verify_audit_trail(document_id)
        
        return result


class SupabaseServiceConnection(ServiceConnection):
    """Connection to the Supabase service."""
    
    async def initialize(self) -> bool:
        """Initialize the Supabase service connection."""
        try:
            # Import Supabase service
            try:
                from ..services.supabase_service import supabase_service
                self.supabase_service = supabase_service
            except ImportError:
                logger.error("Supabase service not available")
                self.state["status"] = "error"
                self.state["error"] = "Supabase service not available"
                return False
                
            # Initialize Supabase service
            await self.supabase_service.initialize()
            
            # Test connection
            connection_status = await self.supabase_service.test_connection()
            
            if not connection_status:
                self.state["status"] = "error"
                self.state["error"] = "Failed to connect to Supabase"
                return False
                
            self.state["status"] = "ready"
            self.state["last_update"] = datetime.utcnow().isoformat()
            return True
            
        except Exception as e:
            logger.error(f"Error initializing Supabase service connection: {e}")
            self.state["status"] = "error"
            self.state["error"] = str(e)
            return False
            
    async def execute(self, operation: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an operation on the Supabase service."""
        try:
            if operation == "get_user":
                return await self._get_user(params)
            elif operation == "create_user":
                return await self._create_user(params)
            elif operation == "update_user":
                return await self._update_user(params)
            elif operation == "get_document":
                return await self._get_document(params)
            elif operation == "create_document":
                return await self._create_document(params)
            elif operation == "update_document":
                return await self._update_document(params)
            else:
                raise ValueError(f"Unknown operation: {operation}")
                
        except Exception as e:
            logger.error(f"Error executing operation {operation} on Supabase service: {e}")
            return {"status": "error", "error": str(e)}
            
    async def _get_user(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Get a user from Supabase."""
        user_id = params.get("user_id")
        
        result = await self.supabase_service.get_user(user_id)
        
        return result
        
    async def _create_user(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create a user in Supabase."""
        email = params.get("email")
        password = params.get("password")
        first_name = params.get("first_name")
        last_name = params.get("last_name")
        company = params.get("company")
        
        result = await self.supabase_service.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            company=company
        )
        
        return result
        
    async def _update_user(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Update a user in Supabase."""
        user_id = params.get("user_id")
        user_data = params.get("user_data", {})
        
        result = await self.supabase_service.update_user(
            user_id=user_id,
            user_data=user_data
        )
        
        return result
        
    async def _get_document(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Get a document from Supabase."""
        document_id = params.get("document_id")
        
        result = await self.supabase_service.get_document(document_id)
        
        return result
        
    async def _create_document(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create a document in Supabase."""
        document_data = params.get("document_data", {})
        
        result = await self.supabase_service.create_document(document_data)
        
        return result
        
    async def _update_document(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Update a document in Supabase."""
        document_id = params.get("document_id")
        document_data = params.get("document_data", {})
        
        result = await self.supabase_service.update_document(
            document_id=document_id,
            document_data=document_data
        )
        
        return result


# Factory function to create service connections
def create_service_connection(service_type: str) -> ServiceConnection:
    """Create a service connection for the given service type."""
    if service_type == "signature":
        return SignatureServiceConnection(service_type)
    elif service_type == "audit_trail":
        return AuditTrailServiceConnection(service_type)
    elif service_type == "supabase":
        return SupabaseServiceConnection(service_type)
    else:
        raise ValueError(f"Unknown service type: {service_type}")


# Service connection manager
class ServiceConnectionManager:
    """Manager for service connections."""
    
    def __init__(self):
        self.connections = {}
        
    async def initialize(self) -> bool:
        """Initialize all service connections."""
        try:
            # Create and initialize service connections
            service_types = ["signature", "audit_trail", "supabase"]
            
            for service_type in service_types:
                try:
                    connection = create_service_connection(service_type)
                    success = await connection.initialize()
                    
                    if success:
                        self.connections[service_type] = connection
                        logger.info(f"Service connection {service_type} initialized")
                    else:
                        logger.warning(f"Failed to initialize service connection {service_type}")
                        
                except Exception as e:
                    logger.error(f"Error initializing service connection {service_type}: {e}")
                    
            return True
            
        except Exception as e:
            logger.error(f"Error initializing service connections: {e}")
            return False
            
    async def get_connection(self, service_type: str) -> ServiceConnection:
        """Get a service connection."""
        if service_type not in self.connections:
            raise ValueError(f"Service connection {service_type} not initialized")
            
        return self.connections[service_type]
        
    async def execute(self, service_type: str, operation: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an operation on a service."""
        connection = await self.get_connection(service_type)
        return await connection.execute(operation, params)


# Create a global instance of the service connection manager
service_manager = ServiceConnectionManager()
