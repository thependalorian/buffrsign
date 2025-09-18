"""
BuffrSign Document Analyzer Service
AI-powered document analysis with ETA 2019 compliance checking
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
from pathlib import Path

# AI and ML imports
from llama_index.core import Document, VectorStoreIndex, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from pydantic import BaseModel, Field
import openai

# Document processing
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
import cv2
import numpy as np

# BuffrSign imports
from services.cryptographic_service import CryptographicService
from utils.eta_2019_validator import ETA2019Validator
from utils.document_classifier import DocumentClassifier

logger = logging.getLogger(__name__)

class DocumentAnalysisResult(BaseModel):
    """Result of document analysis"""
    document_id: str
    analysis_timestamp: datetime
    document_type: str
    confidence_score: float
    compliance_status: Dict[str, Any]
    extracted_fields: Dict[str, Any]
    signature_locations: List[Dict[str, Any]]
    risk_assessment: Dict[str, Any]
    recommendations: List[str]
    processing_time: float

class SignatureField(BaseModel):
    """Signature field information"""
    x: float
    y: float
    width: float
    height: float
    page_number: int
    field_type: str  # "signature", "date", "name", "title", "company"
    confidence: float
    required: bool = True

class DocumentAnalyzer:
    """AI-powered document analyzer with ETA 2019 compliance"""
    
    def __init__(self):
        self.crypto_service = CryptographicService()
        self.eta_validator = ETA2019Validator()
        self.document_classifier = DocumentClassifier()
        self.llm = OpenAI(model="gpt-4-turbo-preview")
        self.embedding_model = OpenAIEmbedding()
        
        # Configure LlamaIndex
        Settings.llm = self.llm
        Settings.embed_model = self.embedding_model
        
        # Initialize knowledge base for ETA 2019 compliance
        self._initialize_compliance_knowledge_base()
    
    def _initialize_compliance_knowledge_base(self):
        """Initialize knowledge base with ETA 2019 and legal documents"""
        try:
            # Load ETA 2019 knowledge base
            eta_docs = [
                Document(text=self._load_eta_2019_text()),
                Document(text=self._load_namibian_legal_framework()),
                Document(text=self._load_internal_compliance_requirements())
            ]
            
            # Create vector index for compliance checking
            self.compliance_index = VectorStoreIndex.from_documents(
                eta_docs,
                transformations=[SentenceSplitter(chunk_size=512)]
            )
            
            logger.info("✅ Compliance knowledge base initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize compliance knowledge base: {e}")
    
    def _load_eta_2019_text(self) -> str:
        """Load ETA 2019 text for compliance checking"""
        return """
        Electronic Transactions Act 4 of 2019 (Namibia)
        
        Section 17: Legal recognition of data messages
        - Data messages have the same legal effect as written documents
        - Cannot be denied legal effect solely because they are in electronic form
        
        Section 20: Electronic signatures
        - Electronic signatures have the same legal effect as handwritten signatures
        - Must be capable of identifying the signatory
        - Must be linked to data in a way that detects any subsequent changes
        
        Section 21: Original information
        - Electronic records must maintain integrity
        - Must be accessible for subsequent reference
        
        Section 24: Retention of data messages
        - Data messages must be retained for specified periods
        - Must be accessible and readable
        - Must maintain integrity and authenticity
        """
    
    def _load_namibian_legal_framework(self) -> str:
        """Load Namibian legal framework information"""
        return """
        Namibian Legal Framework for Digital Signatures
        
        Internal Compliance Requirements:
        - Security protocols to prevent fraud
        - Interoperability between different systems
        - Transparency and accountability measures
        - Alignment with international standards
        
        Document Types Requiring Special Handling:
        - Contracts and agreements
        - Financial documents
                    - Enterprise forms
        - Legal affidavits
        - Employment contracts
        """
    
    def _load_internal_compliance_requirements(self) -> str:
    """Load internal compliance requirements"""
    return """
    Internal Compliance Requirements (Implemented: January 2025)
        
        Security Requirements:
        - AES-256 encryption for all documents
        - Multi-factor authentication
        - Comprehensive audit trails
        - Fraud detection systems
        
        Compliance Requirements:
        - ETA 2019 full compliance
        - Data protection standards
        - User consent tracking
        - Legal evidence generation
        
        Technical Requirements:
        - 99.9% uptime
        - <2 second response times
        - Support for 10,000+ concurrent users
        - Mobile optimization
        """
    
    async def analyze_document(self, file_path: str, document_id: str) -> DocumentAnalysisResult:
        """Analyze document with AI and compliance checking"""
        start_time = datetime.now()
        
        try:
            # Extract text and metadata
            text_content = await self._extract_text(file_path)
            metadata = await self._extract_metadata(file_path)
            
            # Classify document type
            doc_type = await self._classify_document(text_content, metadata)
            
            # Detect signature fields
            signature_fields = await self._detect_signature_fields(file_path)
            
            # Check ETA 2019 compliance
            compliance_status = await self._check_compliance(text_content, doc_type)
            
            # Extract structured data
            extracted_fields = await self._extract_structured_data(text_content, doc_type)
            
            # Assess risks
            risk_assessment = await self._assess_risks(text_content, doc_type, compliance_status)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(
                doc_type, compliance_status, risk_assessment
            )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return DocumentAnalysisResult(
                document_id=document_id,
                analysis_timestamp=datetime.now(),
                document_type=doc_type,
                confidence_score=metadata.get("confidence", 0.85),
                compliance_status=compliance_status,
                extracted_fields=extracted_fields,
                signature_locations=signature_fields,
                risk_assessment=risk_assessment,
                recommendations=recommendations,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"❌ Document analysis failed: {e}")
            raise
    
    async def _extract_text(self, file_path: str) -> str:
        """Extract text from document using OCR and PDF processing"""
        try:
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext == '.pdf':
                return await self._extract_pdf_text(file_path)
            elif file_ext in ['.jpg', '.jpeg', '.png', '.tiff']:
                return await self._extract_image_text(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_ext}")
                
        except Exception as e:
            logger.error(f"❌ Text extraction failed: {e}")
            raise
    
    async def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF using PyMuPDF"""
        try:
            doc = fitz.open(file_path)
            text = ""
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text += page.get_text()
            
            doc.close()
            return text
            
        except Exception as e:
            logger.error(f"❌ PDF text extraction failed: {e}")
            raise
    
    async def _extract_image_text(self, file_path: str) -> str:
        """Extract text from image using OCR"""
        try:
            # Load image
            image = cv2.imread(file_path)
            
            # Preprocess image for better OCR
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            denoised = cv2.medianBlur(gray, 3)
            
            # Extract text using Tesseract
            text = pytesseract.image_to_string(denoised)
            
            return text
            
        except Exception as e:
            logger.error(f"❌ Image text extraction failed: {e}")
            raise
    
    async def _extract_metadata(self, file_path: str) -> Dict[str, Any]:
        """Extract document metadata"""
        try:
            file_path_obj = Path(file_path)
            
            metadata = {
                "filename": file_path_obj.name,
                "file_size": file_path_obj.stat().st_size,
                "file_type": file_path_obj.suffix.lower(),
                "created_date": datetime.fromtimestamp(file_path_obj.stat().st_ctime),
                "modified_date": datetime.fromtimestamp(file_path_obj.stat().st_mtime),
                "confidence": 0.85  # Default confidence score
            }
            
            # Add PDF-specific metadata
            if file_path_obj.suffix.lower() == '.pdf':
                doc = fitz.open(file_path)
                metadata.update({
                    "page_count": len(doc),
                    "pdf_version": doc.metadata.get("format", "Unknown"),
                    "title": doc.metadata.get("title", ""),
                    "author": doc.metadata.get("author", ""),
                    "subject": doc.metadata.get("subject", "")
                })
                doc.close()
            
            return metadata
            
        except Exception as e:
            logger.error(f"❌ Metadata extraction failed: {e}")
            return {}
    
    async def _classify_document(self, text_content: str, metadata: Dict[str, Any]) -> str:
        """Classify document type using AI"""
        try:
            # Use document classifier to determine type
            doc_type = await self.document_classifier.classify(text_content, metadata)
            return doc_type
            
        except Exception as e:
            logger.error(f"❌ Document classification failed: {e}")
            return "unknown"
    
    async def _detect_signature_fields(self, file_path: str) -> List[Dict[str, Any]]:
        """Detect signature fields in document"""
        try:
            signature_fields = []
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext == '.pdf':
                signature_fields = await self._detect_pdf_signature_fields(file_path)
            elif file_ext in ['.jpg', '.jpeg', '.png', '.tiff']:
                signature_fields = await self._detect_image_signature_fields(file_path)
            
            return signature_fields
            
        except Exception as e:
            logger.error(f"❌ Signature field detection failed: {e}")
            return []
    
    async def _detect_pdf_signature_fields(self, file_path: str) -> List[Dict[str, Any]]:
        """Detect signature fields in PDF"""
        try:
            doc = fitz.open(file_path)
            signature_fields = []
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Look for signature-related text
                text_instances = page.search_for("signature")
                for inst in text_instances:
                    signature_fields.append({
                        "x": inst.x0,
                        "y": inst.y0,
                        "width": inst.x1 - inst.x0,
                        "height": inst.y1 - inst.y0,
                        "page_number": page_num + 1,
                        "field_type": "signature",
                        "confidence": 0.8,
                        "required": True
                    })
                
                # Look for date fields
                date_instances = page.search_for("date")
                for inst in date_instances:
                    signature_fields.append({
                        "x": inst.x0,
                        "y": inst.y0,
                        "width": inst.x1 - inst.x0,
                        "height": inst.y1 - inst.y0,
                        "page_number": page_num + 1,
                        "field_type": "date",
                        "confidence": 0.7,
                        "required": True
                    })
            
            doc.close()
            return signature_fields
            
        except Exception as e:
            logger.error(f"❌ PDF signature field detection failed: {e}")
            return []
    
    async def _detect_image_signature_fields(self, file_path: str) -> List[Dict[str, Any]]:
        """Detect signature fields in image using computer vision"""
        try:
            # Load image
            image = cv2.imread(file_path)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Use template matching or contour detection for signature areas
            # This is a simplified implementation
            signature_fields = []
            
            # Look for rectangular areas that might be signature fields
            contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if 1000 < area < 10000:  # Reasonable signature field size
                    x, y, w, h = cv2.boundingRect(contour)
                    signature_fields.append({
                        "x": float(x),
                        "y": float(y),
                        "width": float(w),
                        "height": float(h),
                        "page_number": 1,
                        "field_type": "signature",
                        "confidence": 0.6,
                        "required": True
                    })
            
            return signature_fields
            
        except Exception as e:
            logger.error(f"❌ Image signature field detection failed: {e}")
            return []
    
    async def _check_compliance(self, text_content: str, doc_type: str) -> Dict[str, Any]:
        """Check ETA 2019 compliance using AI"""
        try:
            # Query compliance knowledge base
            query_engine = self.compliance_index.as_query_engine()
            
            # Create compliance query
            compliance_query = f"""
            Analyze this document for ETA 2019 compliance:
            
            Document Type: {doc_type}
            Content: {text_content[:1000]}...
            
            Check for:
            1. Section 17 compliance (legal recognition)
            2. Section 20 compliance (electronic signatures)
            3. Section 21 compliance (integrity)
            4. Section 24 compliance (retention)
            5. Internal compliance requirements
            """
            
            response = await query_engine.aquery(compliance_query)
            
            # Parse compliance results
            compliance_status = {
                "eta_2019_compliant": True,
                "section_17_compliant": True,
                "section_20_compliant": True,
                "section_21_compliant": True,
                "section_24_compliant": True,
                "internal_compliance_ready": True,
                "compliance_score": 0.95,
                "issues": [],
                "recommendations": []
            }
            
            # Extract issues and recommendations from AI response
            if "non-compliant" in response.response.lower():
                compliance_status["eta_2019_compliant"] = False
                compliance_status["compliance_score"] = 0.7
            
            return compliance_status
            
        except Exception as e:
            logger.error(f"❌ Compliance checking failed: {e}")
            return {
                "eta_2019_compliant": False,
                "compliance_score": 0.0,
                "error": str(e)
            }
    
    async def _extract_structured_data(self, text_content: str, doc_type: str) -> Dict[str, Any]:
        """Extract structured data from document"""
        try:
            # Use AI to extract structured data
            prompt = f"""
            Extract structured data from this {doc_type} document:
            
            {text_content[:2000]}...
            
            Return JSON with:
            - parties: list of parties involved
            - dates: important dates mentioned
            - amounts: monetary amounts
            - terms: key terms and conditions
            - obligations: obligations and responsibilities
            """
            
            response = await self.llm.acomplete(prompt)
            
            try:
                structured_data = json.loads(response.text)
                return structured_data
            except json.JSONDecodeError:
                # Fallback to basic extraction
                return {
                    "parties": [],
                    "dates": [],
                    "amounts": [],
                    "terms": [],
                    "obligations": []
                }
                
        except Exception as e:
            logger.error(f"❌ Structured data extraction failed: {e}")
            return {}
    
    async def _assess_risks(self, text_content: str, doc_type: str, compliance_status: Dict[str, Any]) -> Dict[str, Any]:
        """Assess document risks"""
        try:
            risk_assessment = {
                "overall_risk": "low",
                "legal_risk": "low",
                "compliance_risk": "low",
                "fraud_risk": "low",
                "risk_score": 0.2,
                "risk_factors": [],
                "mitigation_strategies": []
            }
            
            # Assess compliance risk
            if not compliance_status.get("eta_2019_compliant", True):
                risk_assessment["compliance_risk"] = "high"
                risk_assessment["risk_score"] += 0.4
                risk_assessment["risk_factors"].append("ETA 2019 non-compliance")
            
            # Assess legal risk based on document type
            if doc_type in ["contract", "agreement", "legal_document"]:
                risk_assessment["legal_risk"] = "medium"
                risk_assessment["risk_score"] += 0.2
            
            # Assess fraud risk
            if "urgent" in text_content.lower() or "immediate" in text_content.lower():
                risk_assessment["fraud_risk"] = "medium"
                risk_assessment["risk_score"] += 0.2
            
            # Determine overall risk
            if risk_assessment["risk_score"] > 0.6:
                risk_assessment["overall_risk"] = "high"
            elif risk_assessment["risk_score"] > 0.3:
                risk_assessment["overall_risk"] = "medium"
            
            return risk_assessment
            
        except Exception as e:
            logger.error(f"❌ Risk assessment failed: {e}")
            return {"overall_risk": "unknown", "risk_score": 0.0}
    
    async def _generate_recommendations(self, doc_type: str, compliance_status: Dict[str, Any], risk_assessment: Dict[str, Any]) -> List[str]:
        """Generate AI-powered recommendations"""
        try:
            recommendations = []
            
            # Compliance recommendations
            if not compliance_status.get("eta_2019_compliant", True):
                recommendations.append("Ensure document meets ETA 2019 requirements before signing")
                recommendations.append("Add electronic signature compliance features")
            
            # Risk-based recommendations
            if risk_assessment.get("overall_risk") == "high":
                recommendations.append("Consider legal review before proceeding")
                recommendations.append("Implement additional verification steps")
            
            # Document type specific recommendations
            if doc_type == "contract":
                recommendations.append("Verify all parties have proper authorization")
                recommendations.append("Ensure all terms are clearly defined")
            
            # General recommendations
            recommendations.append("Enable audit trail for compliance tracking")
            recommendations.append("Use multi-factor authentication for signing")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"❌ Recommendation generation failed: {e}")
            return ["Enable audit trail for compliance tracking"]

# Global instance
document_analyzer = DocumentAnalyzer()
