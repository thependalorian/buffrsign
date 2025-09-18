"""
BuffrSign Workflow Orchestration

Main workflow orchestration system that coordinates multiple agents
for comprehensive document processing and signature workflows.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime
import logging
import asyncio

from ..agents.document_agent import BuffrSignDocumentAgent
from ..agents.compliance_agent import ETAComplianceAgent, InternalComplianceAgent
from ..agents.workflow_agent import SignatureWorkflowAgent

logger = logging.getLogger(__name__)


class BuffrSignWorkflow:
    """
    Main BuffrSign workflow orchestration system.
    
    Coordinates multiple agents to provide comprehensive document processing,
    compliance checking, and signature workflow management for individuals and SMEs.
    """
    
    def __init__(self, workflow_id: str, config: Optional[Dict[str, Any]] = None):
        self.workflow_id = workflow_id
        self.config = config or {}
        self.status = "initialized"
        self.created_at = datetime.utcnow()
        self.steps: List[Dict[str, Any]] = []
        self.results: Dict[str, Any] = {}
        
        # Initialize agents
        self.document_agent = BuffrSignDocumentAgent(f"{workflow_id}_document")
        self.eta_compliance_agent = ETAComplianceAgent(f"{workflow_id}_eta")
        self.internal_compliance_agent = InternalComplianceAgent(f"{workflow_id}_internal_compliance")
        self.workflow_agent = SignatureWorkflowAgent(f"{workflow_id}_workflow")
        
        # Agent registry
        self.agents = {
            "document": self.document_agent,
            "eta_compliance": self.eta_compliance_agent,
            "internal_compliance": self.internal_compliance_agent,
            "signature_workflow": self.workflow_agent
        }
    
    async def execute_comprehensive_workflow(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute comprehensive BuffrSign workflow.
        
        This workflow coordinates all agents to provide end-to-end
        document processing, compliance checking, and signature management
        for individual and SME users.
        """
        self.status = "executing"
        self.steps = []
        
        try:
            logger.info(f"Starting comprehensive workflow {self.workflow_id}")
            
            # Step 1: Document Analysis
            step1_result = await self._execute_document_analysis(input_data)
            self.steps.append({
                "step_id": 1,
                "name": "document_analysis",
                "status": "completed",
                "result": step1_result,
                "timestamp": datetime.utcnow()
            })
            
            # Step 2: ETA Compliance Check
            step2_result = await self._execute_eta_compliance_check(input_data, step1_result)
            self.steps.append({
                "step_id": 2,
                "name": "eta_compliance_check",
                "status": "completed",
                "result": step2_result,
                "timestamp": datetime.utcnow()
            })
            
            # Step 3: Internal Compliance Check
            step3_result = await self._execute_internal_compliance_check(input_data)
            self.steps.append({
                "step_id": 3,
                "name": "internal_compliance_check",
                "status": "completed",
                "result": step3_result,
                "timestamp": datetime.utcnow()
            })
            
            # Step 4: Signature Workflow Setup
            step4_result = await self._execute_signature_workflow_setup(input_data, step1_result)
            self.steps.append({
                "step_id": 4,
                "name": "signature_workflow_setup",
                "status": "completed",
                "result": step4_result,
                "timestamp": datetime.utcnow()
            })
            
            # Compile final results
            final_result = await self._compile_workflow_results()
            
            self.status = "completed"
            self.results = final_result
            
            logger.info(f"Workflow {self.workflow_id} completed successfully")
            return final_result
            
        except Exception as e:
            self.status = "error"
            error_result = {
                "workflow_id": self.workflow_id,
                "status": "error",
                "error": str(e),
                "steps": self.steps,
                "timestamp": datetime.utcnow()
            }
            self.results = error_result
            logger.error(f"Workflow {self.workflow_id} failed: {e}")
            return error_result
    
    async def _execute_document_analysis(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute document analysis using document agent"""
        logger.info(f"Executing document analysis for workflow {self.workflow_id}")
        
        document_data = {
            "document_path": input_data.get("document_path"),
            "document_type": input_data.get("document_type", "contract"),
            "user_id": input_data.get("user_id"),
            "analysis_type": "comprehensive"
        }
        
        return await self.document_agent.process(document_data)
    
    async def _execute_eta_compliance_check(self, input_data: Dict[str, Any], document_result: Dict[str, Any]) -> Dict[str, Any]:
        """Execute ETA compliance check using ETA compliance agent"""
        logger.info(f"Executing ETA compliance check for workflow {self.workflow_id}")
        
        compliance_data = {
            "document_id": input_data.get("document_id"),
            "document_type": input_data.get("document_type"),
            "user_id": input_data.get("user_id"),
            "document_analysis": document_result,
            "compliance_frameworks": ["ETA_2019"]
        }
        
        return await self.eta_compliance_agent.process(compliance_data)
    
    async def _execute_internal_compliance_check(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute internal compliance check using internal compliance agent"""
        logger.info(f"Executing internal compliance check for workflow {self.workflow_id}")
        
        internal_compliance_data = {
            "platform_config": input_data.get("platform_config", {}),
            "security_measures": input_data.get("security_measures", {}),
            "compliance_requirements": ["Internal_standards", "ISO_27001"]
        }
        
        return await self.internal_compliance_agent.process(internal_compliance_data)
    
    async def _execute_signature_workflow_setup(self, input_data: Dict[str, Any], document_result: Dict[str, Any]) -> Dict[str, Any]:
        """Execute signature workflow setup using workflow agent"""
        logger.info(f"Executing signature workflow setup for workflow {self.workflow_id}")
        
        workflow_data = {
            "document_id": input_data.get("document_id"),
            "workflow_type": input_data.get("workflow_type", "sequential"),
            "parties": input_data.get("parties", []),
            "signature_fields": document_result.get("signature_fields", []),
            "user_id": input_data.get("user_id"),
            "document_analysis": document_result
        }
        
        return await self.workflow_agent.process(workflow_data)
    
    async def _compile_workflow_results(self) -> Dict[str, Any]:
        """Compile results from all workflow steps"""
        step_results = {}
        
        for step in self.steps:
            step_results[step["name"]] = step["result"]
        
        # Generate comprehensive recommendations
        recommendations = []
        
        # Document analysis recommendations
        if "document_analysis" in step_results:
            doc_analysis = step_results["document_analysis"]
            if doc_analysis.get("result", {}).get("recommendations"):
                recommendations.extend(doc_analysis["result"]["recommendations"])
        
        # ETA compliance recommendations
        if "eta_compliance_check" in step_results:
            eta_compliance = step_results["eta_compliance_check"]
            if eta_compliance.get("result", {}).get("recommendations"):
                recommendations.extend(eta_compliance["result"]["recommendations"])
        
        # Internal compliance recommendations
        if "internal_compliance_check" in step_results:
            internal_compliance = step_results["internal_compliance_check"]
            if internal_compliance.get("result", {}).get("recommendations"):
                recommendations.extend(internal_compliance["result"]["recommendations"])
        
        # Signature workflow recommendations
        if "signature_workflow_setup" in step_results:
            signature_workflow = step_results["signature_workflow_setup"]
            if signature_workflow.get("result", {}).get("recommendations"):
                recommendations.extend(signature_workflow["result"]["recommendations"])
        
        # Determine overall compliance status
        overall_compliance = "compliant"
        compliance_issues = []
        
        for step_name, step_result in step_results.items():
            if step_result.get("result", {}).get("compliance_status") == "non_compliant":
                overall_compliance = "non_compliant"
                compliance_issues.append(f"{step_name}: Non-compliant")
            elif step_result.get("result", {}).get("compliance_status") == "needs_review":
                if overall_compliance == "compliant":
                    overall_compliance = "needs_review"
                compliance_issues.append(f"{step_name}: Needs review")
        
        return {
            "workflow_id": self.workflow_id,
            "status": "completed",
            "overall_compliance": overall_compliance,
            "compliance_issues": compliance_issues,
            "step_results": step_results,
            "recommendations": recommendations,
            "timestamp": datetime.utcnow(),
            "total_steps": len(self.steps),
            "completed_steps": len([s for s in self.steps if s["status"] == "completed"])
        }
    
    async def get_workflow_status(self) -> Dict[str, Any]:
        """Get current workflow status"""
        return {
            "workflow_id": self.workflow_id,
            "status": self.status,
            "steps": self.steps,
            "results": self.results,
            "created_at": self.created_at.isoformat(),
            "total_steps": len(self.steps),
            "completed_steps": len([s for s in self.steps if s["status"] == "completed"])
        }
    
    async def cancel_workflow(self) -> Dict[str, Any]:
        """Cancel the workflow"""
        self.status = "cancelled"
        return {
            "workflow_id": self.workflow_id,
            "status": "cancelled",
            "timestamp": datetime.utcnow(),
            "message": "Workflow cancelled by user"
        }
    
    async def retry_failed_step(self, step_id: int) -> Dict[str, Any]:
        """Retry a failed workflow step"""
        if step_id < 1 or step_id > len(self.steps):
            raise ValueError(f"Invalid step ID: {step_id}")
        
        step = self.steps[step_id - 1]
        if step["status"] != "error":
            raise ValueError(f"Step {step_id} is not in error status")
        
        # Retry the step
        try:
            if step["name"] == "document_analysis":
                result = await self._execute_document_analysis(self.config)
            elif step["name"] == "eta_compliance_check":
                doc_result = next((s["result"] for s in self.steps if s["name"] == "document_analysis"), {})
                result = await self._execute_eta_compliance_check(self.config, doc_result)
            elif step["name"] == "internal_compliance_check":
                result = await self._execute_internal_compliance_check(self.config)
            elif step["name"] == "signature_workflow_setup":
                doc_result = next((s["result"] for s in self.steps if s["name"] == "document_analysis"), {})
                result = await self._execute_signature_workflow_setup(self.config, doc_result)
            else:
                raise ValueError(f"Unknown step type: {step['name']}")
            
            # Update step
            step["status"] = "completed"
            step["result"] = result
            step["timestamp"] = datetime.utcnow()
            
            return {
                "step_id": step_id,
                "status": "retried",
                "result": result,
                "timestamp": datetime.utcnow()
            }
            
        except Exception as e:
            step["status"] = "error"
            step["error"] = str(e)
            step["timestamp"] = datetime.utcnow()
            
            return {
                "step_id": step_id,
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow()
            }
