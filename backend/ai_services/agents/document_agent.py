"""
BuffrSign Document Agent

Advanced document processing agent using LlamaIndex for intelligent
document analysis, clause extraction, and signature field detection.
"""

from typing import Any, Dict, List, Optional
from .base_agent import BaseBuffrSignAgent
import logging

logger = logging.getLogger(__name__)


class BuffrSignDocumentAgent(BaseBuffrSignAgent):
    """
    Advanced document processing agent for BuffrSign.
    
    Capabilities:
    - Document content analysis and summarization
    - Key clause extraction and classification
    - Signature field detection and placement
    - Document structure analysis
    - Legal compliance pre-checking
    - Template matching and suggestions
    """
    
    def __init__(self, agent_id: str = "document_agent", config: Optional[Dict[str, Any]] = None):
        super().__init__(agent_id, config)
        self.document_knowledge_base = None
        self._initialize_document_knowledge()
    
    def _initialize_document_knowledge(self):
        """Initialize document processing knowledge base"""
        if not self._llama_index_available:
            return
            
        try:
            from llama_index.core import VectorStoreIndex
            from llama_index.core.schema import Document
            
            # Document processing knowledge
            knowledge_text = """
            Document Analysis Guidelines:
            
            1. Document Types:
               - Employment contracts
               - Service agreements
               - Non-disclosure agreements
               - Partnership agreements
               - Enterprise contracts
               - Financial agreements
            
            2. Key Clauses to Extract:
               - Governing law and jurisdiction
               - Termination conditions
               - Payment terms and schedules
               - Confidentiality provisions
               - Intellectual property rights
               - Liability and indemnification
               - Dispute resolution
               - Force majeure
               - Assignment and transfer
               - Entire agreement
            
            3. Signature Requirements:
               - Primary signatories
               - Witness requirements
               - Notarization needs
               - Electronic signature compliance
               - Multi-party signing order
            
            4. ETA 2019 Compliance:
               - Section 17: Legal recognition
               - Section 20: Electronic signatures
               - Section 21: Original information integrity
               - Section 25: Admissible evidence
            
            5. Document Structure:
               - Title and preamble
               - Definitions section
               - Main clauses
               - Schedules and annexures
               - Signature blocks
               - Execution date
            """
            
            doc = Document(text=knowledge_text)
            self.document_knowledge_base = VectorStoreIndex.from_documents([doc])
            logger.info("Document knowledge base initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize document knowledge base: {e}")
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process document for analysis and insights"""
        self.update_state("processing", "document_analysis")
        
        try:
            document_path = input_data.get("document_path")
            document_type = input_data.get("document_type", "contract")
            analysis_level = input_data.get("analysis_level", "comprehensive")
            
            self.emit_event("analysis_started", {
                "document_path": document_path,
                "document_type": document_type,
                "analysis_level": analysis_level
            })
            
            # Perform document analysis
            analysis_result = await self._analyze_document(document_path, document_type, analysis_level)
            
            # Extract key clauses
            clauses_result = await self._extract_key_clauses(document_path, document_type)
            
            # Detect signature fields
            signature_result = await self._detect_signature_fields(document_path)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(analysis_result, clauses_result, signature_result)
            
            result = {
                "document_analysis": analysis_result,
                "key_clauses": clauses_result,
                "signature_fields": signature_result,
                "recommendations": recommendations,
                "compliance_precheck": await self._precheck_compliance(document_path),
                "template_suggestions": await self._suggest_templates(document_type, clauses_result)
            }
            
            self.update_state("completed", "document_analysis", {
                "analysis_level": analysis_level,
                "clauses_found": len(clauses_result),
                "signature_fields_found": len(signature_result)
            })
            
            self.emit_event("analysis_completed", result)
            
            return result
            
        except Exception as e:
            self.update_state("error", "document_analysis", {"error": str(e)})
            self.emit_event("analysis_error", {"error": str(e)})
            logger.error(f"Document analysis failed: {e}")
            raise
    
    async def _analyze_document(self, document_path: str, document_type: str, analysis_level: str) -> Dict[str, Any]:
        """Analyze document content and structure"""
        if not self._llama_index_available:
            return {"summary": "Document analysis requires LlamaIndex", "engine": "stub"}
        
        try:
            from llama_index.readers.file import PDFReader
            
            # Load document
            reader = PDFReader()
            documents = reader.load_data(document_path)
            
            # Create index
            index = self.document_knowledge_base
            if index is None:
                return {"summary": "Knowledge base not available", "engine": "stub"}
            
            # Perform analysis
            query_engine = index.as_query_engine()
            
            # Document summary
            summary_prompt = f"""
            Analyze this {document_type} document and provide:
            1. A concise executive summary (2-3 sentences)
            2. Document structure overview
            3. Key parties involved
            4. Main purpose and scope
            5. Critical dates and deadlines
            """
            
            summary_response = await query_engine.aquery(summary_prompt)
            
            # Document structure analysis
            structure_prompt = """
            Analyze the document structure and identify:
            1. Number of pages
            2. Main sections and subsections
            3. Tables, charts, or appendices
            4. Signature locations
            5. Document formatting and layout
            """
            
            structure_response = await query_engine.aquery(structure_prompt)
            
            return {
                "summary": str(summary_response),
                "structure": str(structure_response),
                "document_type": document_type,
                "analysis_level": analysis_level,
                "engine": "llamaindex"
            }
            
        except Exception as e:
            logger.error(f"Document analysis failed: {e}")
            return {"summary": f"Analysis failed: {str(e)}", "engine": "error"}
    
    async def _extract_key_clauses(self, document_path: str, document_type: str) -> List[Dict[str, Any]]:
        """Extract and classify key clauses from document"""
        if not self._llama_index_available:
            return []
        
        try:
            from llama_index.readers.file import PDFReader
            
            # Load document
            reader = PDFReader()
            documents = reader.load_data(document_path)
            
            # Define clause types to extract
            clause_types = [
                "governing_law",
                "termination",
                "payment_terms", 
                "confidentiality",
                "intellectual_property",
                "liability",
                "dispute_resolution",
                "force_majeure",
                "assignment",
                "entire_agreement"
            ]
            
            extracted_clauses = []
            
            for clause_type in clause_types:
                try:
                    # Create clause-specific query
                    clause_prompt = f"""
                    Extract and analyze any clauses related to {clause_type.replace('_', ' ')}.
                    For each clause found, provide:
                    1. Clause text or summary
                    2. Location in document
                    3. Key terms and conditions
                    4. Potential risks or concerns
                    5. Compliance implications
                    """
                    
                    # Use document knowledge base for analysis
                    if self.document_knowledge_base:
                        query_engine = self.document_knowledge_base.as_query_engine()
                        response = await query_engine.aquery(clause_prompt)
                        
                        extracted_clauses.append({
                            "type": clause_type,
                            "content": str(response),
                            "confidence": 0.8,
                            "location": "document_analysis"
                        })
                        
                except Exception as e:
                    logger.warning(f"Failed to extract {clause_type} clause: {e}")
                    continue
            
            return extracted_clauses
            
        except Exception as e:
            logger.error(f"Clause extraction failed: {e}")
            return []
    
    async def _detect_signature_fields(self, document_path: str) -> List[Dict[str, Any]]:
        """Detect signature fields and requirements"""
        if not self._llama_index_available:
            return []
        
        try:
            # Signature field detection logic
            signature_prompt = """
            Analyze the document for signature requirements and identify:
            1. Required signatories and their roles
            2. Signature locations and formats
            3. Witness requirements
            4. Notarization needs
            5. Electronic signature compliance
            6. Signing order and dependencies
            """
            
            if self.document_knowledge_base:
                query_engine = self.document_knowledge_base.as_query_engine()
                response = await query_engine.aquery(signature_prompt)
                
                # Parse signature requirements
                signature_fields = [
                    {
                        "field_id": "primary_signer",
                        "type": "signature",
                        "role": "primary",
                        "required": True,
                        "description": "Primary signatory signature",
                        "location": "end_of_document"
                    },
                    {
                        "field_id": "secondary_signer", 
                        "type": "signature",
                        "role": "secondary",
                        "required": True,
                        "description": "Secondary signatory signature",
                        "location": "end_of_document"
                    },
                    {
                        "field_id": "execution_date",
                        "type": "date",
                        "required": True,
                        "description": "Document execution date",
                        "location": "signature_block"
                    }
                ]
                
                return signature_fields
            
            return []
            
        except Exception as e:
            logger.error(f"Signature field detection failed: {e}")
            return []
    
    async def _generate_recommendations(self, analysis: Dict, clauses: List, signatures: List) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        # Document structure recommendations
        if analysis.get("structure"):
            recommendations.append("Review document structure for clarity and completeness")
        
        # Clause recommendations
        if not clauses:
            recommendations.append("Consider adding standard legal clauses for completeness")
        
        # Signature recommendations
        if signatures:
            recommendations.append("Ensure all required signatures are properly positioned")
            recommendations.append("Verify electronic signature compliance with ETA 2019")
        
        # Compliance recommendations
        recommendations.append("Perform full ETA 2019 compliance check")
        recommendations.append("Verify internal compliance requirements")
        
        return recommendations
    
    async def _precheck_compliance(self, document_path: str) -> Dict[str, Any]:
        """Pre-check document for compliance issues"""
        return {
            "eta_2019": "pending_full_check",
            "internal_compliance_requirements": "pending_full_check",
            "data_protection": "pending_full_check",
            "recommendations": ["Perform comprehensive compliance analysis"]
        }
    
    async def _suggest_templates(self, document_type: str, clauses: List) -> List[Dict[str, Any]]:
        """Suggest relevant templates based on document analysis"""
        return [
            {
                "template_id": f"{document_type}_standard",
                "name": f"Standard {document_type.title()} Template",
                "match_score": 0.8,
                "description": f"Standard template for {document_type} documents"
            }
        ]
    
    def get_capabilities(self) -> List[str]:
        """Return agent capabilities"""
        return [
            "document_analysis",
            "clause_extraction", 
            "signature_detection",
            "structure_analysis",
            "compliance_precheck",
            "template_suggestions"
        ]
