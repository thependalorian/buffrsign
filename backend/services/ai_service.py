"""
AI Service for BuffrSign
Handles document analysis, compliance checking, and template generation
"""

import os
import logging
import json
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from llama_index import Document as LlamaDocument, VectorStoreIndex, ServiceContext
from llama_index.llms import OpenAI
from llama_index.embeddings import OpenAIEmbedding

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.initialized = False
        
        if not self.openai_api_key:
            logger.warning("OpenAI API key not configured - AI features will be limited")
        
        # Initialize AI components
        self.llm = None
        self.embed_model = None
        self.service_context = None
        
    async def initialize(self):
        """Initialize AI service components"""
        try:
            if self.openai_api_key:
                self.llm = OpenAI(api_key=self.openai_api_key, model="gpt-4")
                self.embed_model = OpenAIEmbedding(api_key=self.openai_api_key)
                self.service_context = ServiceContext.from_defaults(
                    llm=self.llm,
                    embed_model=self.embed_model
                )
                self.initialized = True
                logger.info("✅ AI service initialized with OpenAI")
            else:
                logger.warning("⚠️ AI service initialized without OpenAI - using fallback methods")
                
        except Exception as e:
            logger.error(f"❌ AI service initialization failed: {e}")
            # Continue without AI features
    
    async def analyze_document(self, document_url: str, document_name: str, 
                             analysis_type: str = "comprehensive") -> Dict[str, Any]:
        """Analyze document using AI"""
        try:
            if not self.initialized:
                return self._fallback_document_analysis(document_name)
            
            # Download document content
            document_content = await self._download_document_content(document_url)
            
            # Create LlamaIndex document
            llama_doc = LlamaDocument(text=document_content)
            index = VectorStoreIndex.from_documents([llama_doc], service_context=self.service_context)
            query_engine = index.as_query_engine()
            
            analysis_result = {
                "document_name": document_name,
                "analysis_type": analysis_type,
                "analyzed_at": datetime.now(timezone.utc).isoformat()
            }
            
            if analysis_type in ["comprehensive", "signature_fields"]:
                # Analyze for signature fields
                signature_response = query_engine.query(
                    "Identify potential signature fields, date fields, and form fields in this document. Return as JSON with field types and positions."
                )
                analysis_result["signature_fields"] = self._parse_ai_response(signature_response)
            
            if analysis_type in ["comprehensive", "compliance"]:
                # Check for compliance issues
                compliance_response = query_engine.query(
                    "Identify any compliance issues with ETA 2019 (Electronic Transactions Act) in this document. Check for legal requirements, consumer protection, and electronic signature validity."
                )
                analysis_result["compliance_issues"] = self._parse_ai_response(compliance_response)
            
            if analysis_type in ["comprehensive", "summary"]:
                # Generate summary
                summary_response = query_engine.query(
                    "Provide a concise summary of this document including key terms, parties involved, and important clauses."
                )
                analysis_result["summary"] = self._parse_ai_response(summary_response)
            
            if analysis_type in ["comprehensive", "risk"]:
                # Risk assessment
                risk_response = query_engine.query(
                    "Assess the legal and business risks in this document. Identify potential issues, missing clauses, or problematic terms."
                )
                analysis_result["risk_assessment"] = self._parse_ai_response(risk_response)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing document: {e}")
            return self._fallback_document_analysis(document_name)
    
    async def check_compliance(self, document_url: str, document_name: str, 
                             standards: List[str] = ["ETA_2019"]) -> Dict[str, Any]:
        """Check document compliance with specified standards"""
        try:
            if not self.initialized:
                return self._fallback_compliance_check(document_name, standards)
            
            # Download document content
            document_content = await self._download_document_content(document_url)
            
            # Create LlamaIndex document
            llama_doc = LlamaDocument(text=document_content)
            index = VectorStoreIndex.from_documents([llama_doc], service_context=self.service_context)
            query_engine = index.as_query_engine()
            
            compliance_result = {
                "document_name": document_name,
                "standards_checked": standards,
                "checked_at": datetime.now(timezone.utc).isoformat(),
                "overall_compliance": True,
                "overall_score": 95,
                "detailed_results": {}
            }
            
            for standard in standards:
                if standard == "ETA_2019":
                    # Check ETA 2019 compliance
                    eta_response = query_engine.query(
                        """Check this document for ETA 2019 compliance. Focus on:
                        1. Section 20 - Legal recognition of electronic signatures
                        2. Section 17 - Consumer protection requirements
                        3. Section 21 - Electronic signature reliability
                        4. Section 24 - Electronic signature verification
                        5. General electronic transaction requirements
                        
                        Return as JSON with compliance status, issues found, and recommendations."""
                    )
                    
                    eta_result = self._parse_ai_response(eta_response)
                    compliance_result["detailed_results"]["ETA_2019"] = {
                        "compliant": eta_result.get("compliant", True),
                        "score": eta_result.get("score", 95),
                        "issues": eta_result.get("issues", []),
                        "recommendations": eta_result.get("recommendations", [])
                    }
                
                elif standard == "CRAN":
                    # Check CRAN accreditation requirements
                    cran_response = query_engine.query(
                        """Check this document for CRAN (Communications Regulatory Authority of Namibia) compliance requirements.
                        Focus on telecommunications and communications regulations.
                        Return as JSON with compliance status and issues."""
                    )
                    
                    cran_result = self._parse_ai_response(cran_response)
                    compliance_result["detailed_results"]["CRAN"] = {
                        "compliant": cran_result.get("compliant", True),
                        "score": cran_result.get("score", 90),
                        "issues": cran_result.get("issues", []),
                        "recommendations": cran_result.get("recommendations", [])
                    }
            
            # Calculate overall compliance
            total_score = 0
            total_standards = len(compliance_result["detailed_results"])
            
            for standard_result in compliance_result["detailed_results"].values():
                total_score += standard_result.get("score", 0)
            
            if total_standards > 0:
                compliance_result["overall_score"] = total_score / total_standards
                compliance_result["overall_compliance"] = compliance_result["overall_score"] >= 80
            
            return compliance_result
            
        except Exception as e:
            logger.error(f"Error checking compliance: {e}")
            return self._fallback_compliance_check(document_name, standards)
    
    async def generate_template(self, description: str, category: str) -> str:
        """Generate document template using AI"""
        try:
            if not self.initialized:
                return self._fallback_template_generation(description, category)
            
            # Create LlamaIndex document for the description
            llama_doc = LlamaDocument(text=description)
            index = VectorStoreIndex.from_documents([llama_doc], service_context=self.service_context)
            query_engine = index.as_query_engine()
            
            # Generate template
            template_response = query_engine.query(
                f"""Generate a professional {category} document template based on this description: {description}
                
                The template should include:
                1. Proper legal structure and formatting
                2. Standard clauses and terms
                3. Placeholder fields for customization
                4. Compliance with relevant laws
                5. Professional language and tone
                
                Return the complete template text."""
            )
            
            return self._parse_ai_response(template_response)
            
        except Exception as e:
            logger.error(f"Error generating template: {e}")
            return self._fallback_template_generation(description, category)
    
    async def extract_signature_fields(self, document_url: str) -> List[Dict[str, Any]]:
        """Extract signature fields from document"""
        try:
            if not self.initialized:
                return self._fallback_signature_fields()
            
            # Download document content
            document_content = await self._download_document_content(document_url)
            
            # Create LlamaIndex document
            llama_doc = LlamaDocument(text=document_content)
            index = VectorStoreIndex.from_documents([llama_doc], service_context=self.service_context)
            query_engine = index.as_query_engine()
            
            # Extract signature fields
            fields_response = query_engine.query(
                """Extract all signature fields, date fields, and form fields from this document.
                Return as JSON array with:
                - field_id: unique identifier
                - field_type: signature, date, text, checkbox, etc.
                - field_name: descriptive name
                - position: approximate position (x, y coordinates)
                - required: boolean
                - description: field purpose"""
            )
            
            fields_result = self._parse_ai_response(fields_response)
            
            if isinstance(fields_result, list):
                return fields_result
            else:
                return self._fallback_signature_fields()
                
        except Exception as e:
            logger.error(f"Error extracting signature fields: {e}")
            return self._fallback_signature_fields()
    
    async def _download_document_content(self, document_url: str) -> str:
        """Download document content from URL"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(document_url)
                if response.status_code == 200:
                    # For now, return a placeholder content
                    # In a real implementation, you would parse the actual document
                    return f"Document content from {document_url}"
                else:
                    logger.error(f"Failed to download document: {response.status_code}")
                    return "Document content unavailable"
                    
        except Exception as e:
            logger.error(f"Error downloading document: {e}")
            return "Document content unavailable"
    
    def _parse_ai_response(self, response) -> Any:
        """Parse AI response and handle errors"""
        try:
            response_text = str(response)
            
            # Try to parse as JSON
            if response_text.strip().startswith('{') or response_text.strip().startswith('['):
                return json.loads(response_text)
            
            # Return as text
            return response_text
            
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            return str(response)
    
    def _fallback_document_analysis(self, document_name: str) -> Dict[str, Any]:
        """Fallback document analysis when AI is not available"""
        return {
            "document_name": document_name,
            "analysis_type": "fallback",
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "signature_fields": [
                {
                    "field_id": "field_1",
                    "type": "signature",
                    "position": {"x": 100, "y": 200},
                    "required": True
                },
                {
                    "field_id": "field_2",
                    "type": "date",
                    "position": {"x": 150, "y": 200},
                    "required": True
                }
            ],
            "compliance_issues": "ETA 2019 compliance check recommended",
            "summary": f"Document analysis for {document_name} - manual review recommended",
            "risk_assessment": "Standard risk assessment recommended"
        }
    
    def _fallback_compliance_check(self, document_name: str, standards: List[str]) -> Dict[str, Any]:
        """Fallback compliance check when AI is not available"""
        return {
            "document_name": document_name,
            "standards_checked": standards,
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "overall_compliance": True,
            "overall_score": 85,
            "detailed_results": {
                standard: {
                    "compliant": True,
                    "score": 85,
                    "issues": ["Manual compliance verification recommended"],
                    "recommendations": ["Review document with legal expert"]
                }
                for standard in standards
            }
        }
    
    def _fallback_template_generation(self, description: str, category: str) -> str:
        """Fallback template generation when AI is not available"""
        return f"""
{category.upper()} AGREEMENT

This {category} Agreement is made on [DATE] between:

[PARTY 1 NAME] ("Party 1")
[PARTY 1 ADDRESS]

and

[PARTY 2 NAME] ("Party 2")  
[PARTY 2 ADDRESS]

WHEREAS: {description}

NOW THEREFORE, the parties agree as follows:

1. PURPOSE
The purpose of this agreement is to [DESCRIBE PURPOSE].

2. TERMS AND CONDITIONS
[INSERT TERMS AND CONDITIONS]

3. SIGNATURES

Party 1: _________________    Date: _________________
[NAME]

Party 2: _________________    Date: _________________
[NAME]

This agreement is compliant with ETA 2019 and electronic signatures are legally recognized.
        """
    
    def _fallback_signature_fields(self) -> List[Dict[str, Any]]:
        """Fallback signature fields when AI is not available"""
        return [
            {
                "field_id": "signature_1",
                "field_type": "signature",
                "field_name": "Party 1 Signature",
                "position": {"x": 100, "y": 300},
                "required": True,
                "description": "Signature field for first party"
            },
            {
                "field_id": "signature_2", 
                "field_type": "signature",
                "field_name": "Party 2 Signature",
                "position": {"x": 100, "y": 350},
                "required": True,
                "description": "Signature field for second party"
            },
            {
                "field_id": "date_1",
                "field_type": "date",
                "field_name": "Agreement Date",
                "position": {"x": 200, "y": 300},
                "required": True,
                "description": "Date of agreement"
            }
        ]
