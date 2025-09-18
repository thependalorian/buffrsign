"""
Supabase Client and Database Helper for BuffrSign
Provides centralized database access with KYC and AI workflow support
"""

import os
import asyncio
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import asyncpg
from supabase import create_client, Client
import logging

from ..types.supabase_types import (
    KYCWorkflowState, KYCDecision, AIMethod,
    KYCWorkflowRow, KYCWorkflowInsert, KYCWorkflowUpdate,
    SADCCountryRow, AIAnalysisRow, UserKYCStatusRow
)

logger = logging.getLogger(__name__)

class SupabaseKYCClient:
    """Enhanced Supabase client with KYC and AI workflow support"""
    
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not all([self.supabase_url, self.supabase_key]):
            raise ValueError("Missing required Supabase environment variables")
        
        # Public client for user operations
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        
        # Service client for admin operations
        if self.supabase_service_key:
            self.service_client: Client = create_client(self.supabase_url, self.supabase_service_key)
        else:
            self.service_client = self.client
    
    # SADC Countries Operations
    async def get_sadc_countries(self, active_only: bool = True) -> List[SADCCountryRow]:
        """Get all SADC countries with validation rules"""
        try:
            query = self.client.table("sadc_countries").select("*")
            if active_only:
                query = query.eq("is_active", True)
            
            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching SADC countries: {e}")
            raise
    
    async def get_sadc_country(self, country_code: str) -> Optional[SADCCountryRow]:
        """Get specific SADC country by code"""
        try:
            response = self.client.table("sadc_countries")\
                .select("*")\
                .eq("country_code", country_code)\
                .single()\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching SADC country {country_code}: {e}")
            return None
    
    # KYC Workflow Operations
    async def create_kyc_workflow(self, workflow_data: KYCWorkflowInsert) -> str:
        """Create a new KYC workflow"""
        try:
            data = {
                "user_id": workflow_data.user_id,
                "document_id": workflow_data.document_id,
                "workflow_state": workflow_data.workflow_state.value,
                "ocr_extraction": workflow_data.ocr_extraction or {},
                "ai_field_extraction": workflow_data.ai_field_extraction or {},
                "sadc_validation": workflow_data.sadc_validation or {},
                "compliance_status": workflow_data.compliance_status or {},
                "audit_trail": workflow_data.audit_trail or []
            }
            
            response = self.client.table("kyc_workflows")\
                .insert(data)\
                .execute()
            
            return response.data[0]["id"]
        except Exception as e:
            logger.error(f"Error creating KYC workflow: {e}")
            raise
    
    async def get_kyc_workflow(self, workflow_id: str) -> Optional[KYCWorkflowRow]:
        """Get KYC workflow by ID"""
        try:
            response = self.client.table("kyc_workflows")\
                .select("*")\
                .eq("id", workflow_id)\
                .single()\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching KYC workflow {workflow_id}: {e}")
            return None
    
    async def update_kyc_workflow(self, workflow_id: str, updates: KYCWorkflowUpdate) -> bool:
        """Update KYC workflow"""
        try:
            data = {}
            
            if updates.workflow_state:
                data["workflow_state"] = updates.workflow_state.value
            if updates.detected_country:
                data["detected_country"] = updates.detected_country
            if updates.country_confidence is not None:
                data["country_confidence"] = updates.country_confidence
            if updates.country_detection_method:
                data["country_detection_method"] = updates.country_detection_method.value
            if updates.ocr_extraction is not None:
                data["ocr_extraction"] = updates.ocr_extraction
            if updates.ai_field_extraction is not None:
                data["ai_field_extraction"] = updates.ai_field_extraction
            if updates.sadc_validation is not None:
                data["sadc_validation"] = updates.sadc_validation
            if updates.final_decision:
                data["final_decision"] = updates.final_decision.value
            if updates.decision_confidence is not None:
                data["decision_confidence"] = updates.decision_confidence
            if updates.rejection_reasons is not None:
                data["rejection_reasons"] = updates.rejection_reasons
            if updates.compliance_status is not None:
                data["compliance_status"] = updates.compliance_status
            if updates.audit_trail is not None:
                data["audit_trail"] = updates.audit_trail
            if updates.processing_time_ms is not None:
                data["processing_time_ms"] = updates.processing_time_ms
            if updates.total_confidence is not None:
                data["total_confidence"] = updates.total_confidence
            if updates.completed_at:
                data["completed_at"] = updates.completed_at
            
            data["updated_at"] = datetime.utcnow().isoformat()
            
            response = self.client.table("kyc_workflows")\
                .update(data)\
                .eq("id", workflow_id)\
                .execute()
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating KYC workflow {workflow_id}: {e}")
            raise
    
    async def get_user_kyc_workflows(self, user_id: str, limit: int = 10) -> List[KYCWorkflowRow]:
        """Get user's KYC workflows"""
        try:
            response = self.client.table("kyc_workflows")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching user KYC workflows: {e}")
            raise
    
    # KYC Analysis Steps
    async def create_analysis_step(self, workflow_id: str, step_data: Dict[str, Any]) -> str:
        """Create KYC analysis step"""
        try:
            data = {
                "workflow_id": workflow_id,
                "step_name": step_data["step_name"],
                "step_order": step_data["step_order"],
                "status": step_data.get("status", "pending"),
                "ai_method": step_data.get("ai_method"),
                "confidence_score": step_data.get("confidence_score"),
                "processing_time_ms": step_data.get("processing_time_ms"),
                "input_data": step_data.get("input_data", {}),
                "output_data": step_data.get("output_data", {}),
                "error_details": step_data.get("error_details", {}),
                "started_at": step_data.get("started_at"),
                "completed_at": step_data.get("completed_at")
            }
            
            response = self.client.table("kyc_analysis_steps")\
                .insert(data)\
                .execute()
            
            return response.data[0]["id"]
        except Exception as e:
            logger.error(f"Error creating analysis step: {e}")
            raise
    
    async def update_analysis_step(self, step_id: str, updates: Dict[str, Any]) -> bool:
        """Update analysis step"""
        try:
            updates["updated_at"] = datetime.utcnow().isoformat()
            
            response = self.client.table("kyc_analysis_steps")\
                .update(updates)\
                .eq("id", step_id)\
                .execute()
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating analysis step {step_id}: {e}")
            raise
    
    async def get_workflow_steps(self, workflow_id: str) -> List[Dict[str, Any]]:
        """Get all steps for a workflow"""
        try:
            response = self.client.table("kyc_analysis_steps")\
                .select("*")\
                .eq("workflow_id", workflow_id)\
                .order("step_order")\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching workflow steps: {e}")
            raise
    
    # AI Model Metrics
    async def record_model_metrics(self, metrics_data: Dict[str, Any]) -> str:
        """Record AI model performance metrics"""
        try:
            response = self.client.table("ai_model_metrics")\
                .insert(metrics_data)\
                .execute()
            return response.data[0]["id"]
        except Exception as e:
            logger.error(f"Error recording model metrics: {e}")
            raise
    
    async def get_model_metrics(self, model_name: str, days_back: int = 7) -> List[Dict[str, Any]]:
        """Get model performance metrics"""
        try:
            from_date = (datetime.utcnow() - datetime.timedelta(days=days_back)).isoformat()
            
            response = self.client.table("ai_model_metrics")\
                .select("*")\
                .eq("model_name", model_name)\
                .gte("created_at", from_date)\
                .order("created_at", desc=True)\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching model metrics: {e}")
            raise
    
    # User KYC Status
    async def get_user_kyc_status(self, user_id: str) -> Optional[UserKYCStatusRow]:
        """Get user's current KYC status"""
        try:
            response = self.client.table("user_kyc_status")\
                .select("*")\
                .eq("user_id", user_id)\
                .single()\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching user KYC status: {e}")
            return None
    
    async def update_user_kyc_status(self, user_id: str, status_data: Dict[str, Any]) -> bool:
        """Update or create user KYC status"""
        try:
            # Check if status exists
            existing = await self.get_user_kyc_status(user_id)
            
            status_data["updated_at"] = datetime.utcnow().isoformat()
            
            if existing:
                response = self.client.table("user_kyc_status")\
                    .update(status_data)\
                    .eq("user_id", user_id)\
                    .execute()
            else:
                status_data["user_id"] = user_id
                status_data["created_at"] = datetime.utcnow().isoformat()
                response = self.client.table("user_kyc_status")\
                    .insert(status_data)\
                    .execute()
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating user KYC status: {e}")
            raise
    
    # AI Confidence Metrics
    async def record_confidence_metrics(self, metrics: List[Dict[str, Any]]) -> List[str]:
        """Record confidence breakdown metrics"""
        try:
            response = self.client.table("ai_confidence_metrics")\
                .insert(metrics)\
                .execute()
            return [item["id"] for item in response.data]
        except Exception as e:
            logger.error(f"Error recording confidence metrics: {e}")
            raise
    
    # Enhanced AI Analysis
    async def update_ai_analysis(self, analysis_id: str, ai_data: Dict[str, Any]) -> bool:
        """Update AI analysis with KYC-specific fields"""
        try:
            ai_data["updated_at"] = datetime.utcnow().isoformat()
            
            response = self.client.table("ai_analysis")\
                .update(ai_data)\
                .eq("id", analysis_id)\
                .execute()
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating AI analysis: {e}")
            raise
    
    # Document Operations with KYC Support
    async def mark_document_as_kyc(self, document_id: str, kyc_workflow_id: str, document_type: str) -> bool:
        """Mark document as KYC document"""
        try:
            data = {
                "kyc_workflow_id": kyc_workflow_id,
                "is_kyc_document": True,
                "kyc_document_type": document_type,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = self.client.table("documents")\
                .update(data)\
                .eq("id", document_id)\
                .execute()
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error marking document as KYC: {e}")
            raise
    
    # Utility Methods
    async def health_check(self) -> Dict[str, Any]:
        """Check database connection health"""
        try:
            # Simple query to test connection
            response = self.client.table("sadc_countries")\
                .select("count")\
                .limit(1)\
                .execute()
            
            return {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "connection": "active"
            }
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }
    
    async def get_kyc_analytics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get KYC processing analytics"""
        try:
            base_query = self.service_client.table("kyc_workflows").select("*")
            
            if user_id:
                base_query = base_query.eq("user_id", user_id)
            
            # Get workflow counts by state
            workflows = base_query.execute().data
            
            analytics = {
                "total_workflows": len(workflows),
                "by_state": {},
                "by_decision": {},
                "avg_processing_time": 0,
                "success_rate": 0
            }
            
            # Calculate statistics
            processing_times = []
            decisions = []
            
            for workflow in workflows:
                state = workflow.get("workflow_state", "unknown")
                analytics["by_state"][state] = analytics["by_state"].get(state, 0) + 1
                
                if workflow.get("final_decision"):
                    decision = workflow["final_decision"]
                    analytics["by_decision"][decision] = analytics["by_decision"].get(decision, 0) + 1
                    decisions.append(decision)
                
                if workflow.get("processing_time_ms"):
                    processing_times.append(workflow["processing_time_ms"])
            
            if processing_times:
                analytics["avg_processing_time"] = sum(processing_times) / len(processing_times)
            
            if decisions:
                approved = sum(1 for d in decisions if d == "approved")
                analytics["success_rate"] = (approved / len(decisions)) * 100
            
            return analytics
        except Exception as e:
            logger.error(f"Error getting KYC analytics: {e}")
            raise

# Global client instance
_supabase_client: Optional[SupabaseKYCClient] = None

def get_supabase_client() -> SupabaseKYCClient:
    """Get or create Supabase client instance"""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = SupabaseKYCClient()
    return _supabase_client
