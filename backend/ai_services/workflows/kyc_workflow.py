"""
BuffrSign LangGraph KYC Workflow
Stateful workflow management for document verification and compliance
with real vision model and agent integration for SADC country ID extraction
"""

import asyncio
import logging
import cv2
import numpy as np
import pytesseract
from PIL import Image
import re
import os
import base64
import requests
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
import json
from enum import Enum
from dataclasses import dataclass

# LangGraph imports
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor
from langgraph.checkpoint.memory import MemorySaver

# Pydantic imports
from pydantic import BaseModel, Field

# BuffrSign imports
from ai_services.pydantic_agents import ai_agent_manager
from services.cryptographic_service import CryptographicService
from utils.eta_2019_validator import ETA2019Validator

logger = logging.getLogger(__name__)

# SADC Country Configuration
SADC_COUNTRIES = {
    "NA": {
        "name": "Namibia",
        "id_format": "11_digits",  # DDMMYYXXXXX
        "id_patterns": [r"\b\d{11}\b"],
        "date_format": "DDMMYY",
        "keywords": ["NAMIBIA", "REPUBLIC OF NAMIBIA", "WINDHOEK"]
    },
    "ZA": {
        "name": "South Africa", 
        "id_format": "13_digits",  # YYMMDDXXXXXX
        "id_patterns": [r"\b\d{13}\b"],
        "date_format": "YYMMDD",
        "keywords": ["SOUTH AFRICA", "RSA", "PRETORIA", "CAPE TOWN"]
    },
    "BW": {
        "name": "Botswana",
        "id_format": "9_digits",
        "id_patterns": [r"\b\d{9}\b"],
        "date_format": "DDMMYY",
        "keywords": ["BOTSWANA", "GABORONE", "OMANG"]
    },
    "SZ": {
        "name": "Eswatini",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["SWAZILAND", "ESWATINI", "MBABANE"]
    },
    "LS": {
        "name": "Lesotho",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["LESOTHO", "MASERU"]
    },
    "MW": {
        "name": "Malawi",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["MALAWI", "LILONGWE", "BLANTYRE"]
    },
    "MZ": {
        "name": "Mozambique",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["MOZAMBIQUE", "MAPUTO"]
    },
    "ZM": {
        "name": "Zambia",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["ZAMBIA", "LUSAKA"]
    },
    "ZW": {
        "name": "Zimbabwe",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["ZIMBABWE", "HARARE"]
    },
    "TZ": {
        "name": "Tanzania",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["TANZANIA", "DAR ES SALAAM", "DODOMA"]
    },
    "AO": {
        "name": "Angola",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["ANGOLA", "LUANDA"]
    },
    "MG": {
        "name": "Madagascar",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["MADAGASCAR", "ANTANANARIVO"]
    },
    "MU": {
        "name": "Mauritius",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["MAURITIUS", "PORT LOUIS"]
    },
    "SC": {
        "name": "Seychelles",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["SEYCHELLES", "VICTORIA"]
    }
}

logger = logging.getLogger(__name__)

class WorkflowState(str, Enum):
    """Automated KYC workflow states for SADC countries"""
    INITIALIZED = "initialized"
    DOCUMENT_UPLOADED = "document_uploaded"
    OCR_EXTRACTION_COMPLETE = "ocr_extraction_complete"
    AI_COUNTRY_DETECTION = "ai_country_detection"
    AI_FIELD_EXTRACTION = "ai_field_extraction"
    SADC_VALIDATION = "sadc_validation"
    COMPLIANCE_CHECKED = "compliance_checked"
    AUTO_APPROVED = "auto_approved"
    AUTO_REJECTED = "auto_rejected"
    COMPLETED = "completed"
    FAILED = "failed"

class ReviewPriority(str, Enum):
    """Review priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class KYCWorkflowState:
    """State for automated SADC KYC workflow"""
    workflow_id: str
    user_id: str
    document_id: str
    current_state: WorkflowState
    document_type: Optional[str] = None
    
    # SADC country detection and processing
    detected_country: Optional[str] = None  # NA, ZA, BW, SZ, LS, MW, MZ, TZ, ZM, ZW, AO, MG, MU, SC
    country_confidence: Optional[float] = None
    
    # OCR and AI extraction results
    ocr_extraction: Optional[Dict[str, Any]] = None
    ai_field_extraction: Optional[Dict[str, Any]] = None
    sadc_validation: Optional[Dict[str, Any]] = None
    
    # Compliance and final results
    compliance_status: Optional[Dict[str, Any]] = None
    final_decision: Optional[str] = None  # "approved" or "rejected"
    decision_confidence: Optional[float] = None
    rejection_reasons: Optional[List[str]] = None
    
    # Audit trail
    audit_trail: List[Dict[str, Any]] = None
    created_at: datetime = None
    updated_at: datetime = None
    
    def __post_init__(self):
        if self.audit_trail is None:
            self.audit_trail = []
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()
    
    def add_audit_entry(self, action: str, details: Dict[str, Any]):
        """Add audit trail entry"""
        self.audit_trail.append({
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "details": details,
            "state": self.current_state.value
        })
        self.updated_at = datetime.now()

class IDExtractionEngine:
    """Real ID extraction engine using OCR and AI"""
    
    def __init__(self):
        self.tesseract_config = '--oem 3 --psm 6'
        self.namibian_id_patterns = {
            'id_number': r'(\d{6}\s+\d{4}\s+\d{1})',
            'name': r'([A-Z\s]+)',
            'surname': r'SURNAME\s*([A-Z\s]+)',
            'first_names': r'FIRST NAME\(S\)\s*([A-Z\s]+)'
        }
    
    async def extract_id_information(self, image_path: str) -> Dict[str, Any]:
        """Extract information from Namibian National ID image"""
        try:
            logger.info(f"🔍 Starting ID extraction from: {image_path}")
            
            # Load and preprocess image
            image = await self._load_and_preprocess_image(image_path)
            
            # Extract text using OCR
            ocr_text = await self._perform_ocr(image)
            
            # Parse extracted text
            extracted_data = await self._parse_namibian_id_text(ocr_text)
            
            # Validate extracted data
            validation_result = await self._validate_extracted_data(extracted_data)
            
            # Add confidence scores
            extracted_data['confidence_score'] = validation_result['confidence_score']
            extracted_data['extraction_timestamp'] = datetime.now().isoformat()
            extracted_data['document_type'] = 'namibian_national_id'
            
            logger.info(f"✅ ID extraction completed with confidence: {validation_result['confidence_score']}")
            
            return {
                "success": validation_result['valid'],
                "extracted_data": extracted_data,
                "validation_result": validation_result,
                "ocr_text": ocr_text,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ ID extraction failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _load_and_preprocess_image(self, image_path: str) -> np.ndarray:
        """Load and preprocess image for OCR"""
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply preprocessing for better OCR
            # Resize if too small
            height, width = gray.shape
            if width < 800:
                scale_factor = 800 / width
                gray = cv2.resize(gray, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)
            
            # Apply noise reduction
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Apply thresholding
            _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Apply morphological operations
            kernel = np.ones((1, 1), np.uint8)
            processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            return processed
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            raise
    
    async def _perform_ocr(self, image: np.ndarray) -> str:
        """Perform OCR on preprocessed image"""
        try:
            # Convert numpy array to PIL Image
            pil_image = Image.fromarray(image)
            
            # Perform OCR
            ocr_text = pytesseract.image_to_string(pil_image, config=self.tesseract_config)
            
            logger.info(f"OCR extracted text length: {len(ocr_text)} characters")
            
            return ocr_text
            
        except Exception as e:
            logger.error(f"OCR failed: {e}")
            raise
    
    async def _parse_namibian_id_text(self, ocr_text: str) -> Dict[str, Any]:
        """Parse OCR text to extract Namibian ID information"""
        try:
            extracted_data = {
                "country_code": "NA",
                "document_type": "namibian_national_id"
            }
            
            # Extract ID number
            id_match = re.search(self.namibian_id_patterns['id_number'], ocr_text)
            if id_match:
                extracted_data['id_number'] = id_match.group(1)
            
            # Extract surname
            surname_match = re.search(self.namibian_id_patterns['surname'], ocr_text, re.IGNORECASE)
            if surname_match:
                extracted_data['surname'] = surname_match.group(1).strip()
            
            # Extract first names
            first_names_match = re.search(self.namibian_id_patterns['first_names'], ocr_text, re.IGNORECASE)
            if first_names_match:
                extracted_data['first_names'] = first_names_match.group(1).strip()
            
            # Combine names
            if 'surname' in extracted_data and 'first_names' in extracted_data:
                extracted_data['full_name'] = f"{extracted_data['first_names']} {extracted_data['surname']}"
            
            # Extract date of birth from ID number (if available)
            if 'id_number' in extracted_data:
                dob = self._extract_dob_from_id_number(extracted_data['id_number'])
                if dob:
                    extracted_data['date_of_birth'] = dob
            
            # Set default expiry date (would be extracted from actual document)
            extracted_data['expiry_date'] = "2030-01-01"  # Default
            
            logger.info(f"Parsed data: {extracted_data}")
            
            return extracted_data
            
        except Exception as e:
            logger.error(f"Text parsing failed: {e}")
            raise
    
    def _extract_dob_from_id_number(self, id_number: str) -> Optional[str]:
        """Extract date of birth from Namibian ID number"""
        try:
            # Remove spaces
            clean_id = id_number.replace(" ", "")
            
            # Namibian ID format: YYMMDD GGGG C
            # First 6 digits: YYMMDD (date of birth)
            if len(clean_id) >= 6:
                dob_part = clean_id[:6]
                year = int(dob_part[:2])
                month = int(dob_part[2:4])
                day = int(dob_part[4:6])
                
                # Assume 19xx for years (would need logic for 20xx)
                full_year = 1900 + year if year > 50 else 2000 + year
                
                return f"{full_year:04d}-{month:02d}-{day:02d}"
            
            return None
            
        except Exception as e:
            logger.error(f"DOB extraction failed: {e}")
            return None
    
    async def _validate_extracted_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate extracted ID data"""
        errors = []
        confidence_score = 0.0
        
        # Check required fields
        required_fields = ["id_number", "surname", "first_names"]
        for field in required_fields:
            if not data.get(field):
                errors.append(f"Missing required field: {field}")
            else:
                confidence_score += 0.3  # 30% per required field
        
        # Validate Namibian ID number format
        if 'id_number' in data:
            id_num = data['id_number']
            if len(id_num.replace(" ", "")) == 11:
                confidence_score += 0.2  # 20% for correct format
            else:
                errors.append("Invalid Namibian ID number format")
        
        # Validate country code
        if data.get("country_code") == "NA":
            confidence_score += 0.1  # 10% for correct country
        else:
            errors.append("Invalid country code for Namibian ID")
        
        # Validate name format
        if data.get("surname") and data.get("first_names"):
            confidence_score += 0.2  # 20% for names
        else:
            errors.append("Invalid name format")
        
        # Validate date of birth
        if data.get("date_of_birth"):
            confidence_score += 0.1  # 10% for DOB
        else:
            errors.append("Could not extract date of birth")
        
        # Cap confidence at 1.0
        confidence_score = min(confidence_score, 1.0)
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "confidence_score": confidence_score
        }

class HumanReviewQueue:
    """Queue management for human reviews"""
    
    def __init__(self):
        self.queue: List[Dict[str, Any]] = []
        self.reviewers: Dict[str, Dict[str, Any]] = {}
        self.sla_hours = 24  # Default SLA
    
    def add_to_queue(self, workflow_id: str, priority: ReviewPriority, deadline: datetime):
        """Add workflow to review queue"""
        queue_item = {
            "workflow_id": workflow_id,
            "priority": priority,
            "deadline": deadline,
            "added_at": datetime.now(),
            "assigned_to": None,
            "status": "pending"
        }
        
        # Insert based on priority
        if priority == ReviewPriority.CRITICAL:
            self.queue.insert(0, queue_item)
        elif priority == ReviewPriority.HIGH:
            # Find position after critical items
            insert_pos = 0
            for item in self.queue:
                if item["priority"] == ReviewPriority.CRITICAL:
                    insert_pos += 1
                else:
                    break
            self.queue.insert(insert_pos, queue_item)
        else:
            self.queue.append(queue_item)
    
    def assign_reviewer(self, workflow_id: str, reviewer_id: str):
        """Assign reviewer to workflow"""
        for item in self.queue:
            if item["workflow_id"] == workflow_id:
                item["assigned_to"] = reviewer_id
                item["status"] = "assigned"
                break
    
    def get_next_item(self, reviewer_id: str) -> Optional[Dict[str, Any]]:
        """Get next item for reviewer"""
        for item in self.queue:
            if item["assigned_to"] == reviewer_id and item["status"] == "assigned":
                return item
        return None
    
    def mark_complete(self, workflow_id: str, result: Dict[str, Any]):
        """Mark review as complete"""
        for item in self.queue:
            if item["workflow_id"] == workflow_id:
                item["status"] = "completed"
                item["result"] = result
                item["completed_at"] = datetime.now()
                break

class KYCWorkflowEngine:
    """Fully automated KYC workflow engine for SADC countries"""
    
    def __init__(self):
        self.workflow_graph = self._build_workflow_graph()
        self.memory = MemorySaver()
        self.workflows = {}  # Store workflow states
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.vision_endpoint = "https://api.openai.com/v1/chat/completions"
        self.sadc_countries = SADC_COUNTRIES
        
        # Auto-approval thresholds
        self.min_confidence_threshold = 0.8
        self.min_field_match_threshold = 0.7
        
        # Initialize workflow executor
        self.workflow_executor = self.workflow_graph.compile(checkpointer=self.memory)
    
    def _build_workflow_graph(self) -> StateGraph:
        """Build fully automated SADC KYC workflow"""
        
        # Define workflow graph
        workflow = StateGraph(KYCWorkflowState)
        
        # Add automated workflow nodes
        workflow.add_node("initialize_workflow", self._initialize_workflow)
        workflow.add_node("upload_document", self._upload_document)
        workflow.add_node("ocr_extraction", self._ocr_extraction)
        workflow.add_node("ai_country_detection", self._ai_country_detection)
        workflow.add_node("ai_field_extraction", self._ai_field_extraction)
        workflow.add_node("sadc_validation", self._sadc_validation)
        workflow.add_node("auto_decision", self._auto_decision)
        workflow.add_node("complete_workflow", self._complete_workflow)
        
        # Define edges
        workflow.set_entry_point("initialize_workflow")
        
        workflow.add_edge("initialize_workflow", "upload_document")
        workflow.add_edge("upload_document", "ocr_extraction")
        workflow.add_edge("ocr_extraction", "ai_country_detection")
        workflow.add_edge("ai_country_detection", "ai_field_extraction")
        workflow.add_edge("ai_field_extraction", "sadc_validation")
        workflow.add_edge("sadc_validation", "auto_decision")
        workflow.add_edge("auto_decision", "complete_workflow")
        workflow.add_edge("complete_workflow", END)
        
        return workflow
    
    async def _initialize_workflow(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Initialize KYC workflow"""
        try:
            state.current_state = WorkflowState.INITIALIZED
            state.add_audit_entry("workflow_initialized", {
                "user_id": state.user_id,
                "document_id": state.document_id
            })
            
            logger.info(f"✅ KYC workflow initialized: {state.workflow_id}")
            return state
            
        except Exception as e:
            logger.error(f"❌ Workflow initialization failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("workflow_failed", {"error": str(e)})
            return state
    
    async def _upload_document(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Handle document upload"""
        try:
            state.current_state = WorkflowState.DOCUMENT_UPLOADED
            state.add_audit_entry("document_uploaded", {
                "document_id": state.document_id
            })
            
            logger.info(f"✅ Document uploaded: {state.document_id}")
            return state
            
        except Exception as e:
            logger.error(f"❌ Document upload failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("upload_failed", {"error": str(e)})
            return state
    
    async def _ocr_extraction(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Extract text using OCR and basic vision processing"""
        try:
            # Get document data from state
            document_data = state.document_data.get("file_content")
            if not document_data:
                raise ValueError("No document content found in state")
            
            # Perform OCR extraction
            ocr_result = await self._perform_ocr_extraction(document_data)
            
            state.ocr_extraction = ocr_result
            state.current_state = WorkflowState.OCR_EXTRACTION_COMPLETE
            
            state.add_audit_entry("ocr_extraction_complete", {
                "text_length": len(ocr_result.get("extracted_text", "")),
                "processing_time": ocr_result.get("processing_time", 0),
                "ocr_confidence": ocr_result.get("confidence", 0)
            })
            
            logger.info(f"✅ OCR extraction complete: {state.workflow_id}")
            return state
            
        except Exception as e:
            logger.error(f"❌ OCR extraction failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("ocr_extraction_failed", {"error": str(e)})
            return state
    
    async def _ai_country_detection(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Use AI to detect SADC country from extracted text"""
        try:
            extracted_text = state.ocr_extraction.get("extracted_text", "")
            
            # Detect SADC country using keyword matching and AI
            country_result = await self._detect_sadc_country(extracted_text)
            
            state.detected_country = country_result["country_code"]
            state.country_confidence = country_result["confidence"]
            state.current_state = WorkflowState.AI_COUNTRY_DETECTION
            
            state.add_audit_entry("country_detection_complete", {
                "detected_country": country_result["country_code"],
                "confidence": country_result["confidence"],
                "detection_method": country_result["method"]
            })
            
            logger.info(f"✅ Country detected: {country_result['country_code']} ({country_result['confidence']:.2f})")
            return state
            
        except Exception as e:
            logger.error(f"❌ Country detection failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("country_detection_failed", {"error": str(e)})
            return state
    
    async def _ai_field_extraction(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Extract structured fields using AI agent based on detected country"""
        try:
            extracted_text = state.ocr_extraction.get("extracted_text", "")
            country_code = state.detected_country
            
            # Use AI agent to extract fields specific to the detected SADC country
            field_result = await self._extract_sadc_fields(extracted_text, country_code)
            
            state.ai_field_extraction = field_result
            state.current_state = WorkflowState.AI_FIELD_EXTRACTION
            
            state.add_audit_entry("field_extraction_complete", {
                "country": country_code,
                "extracted_fields": list(field_result.get("fields", {}).keys()),
                "extraction_confidence": field_result.get("confidence", 0)
            })
            
            logger.info(f"✅ Field extraction complete for {country_code}: {state.workflow_id}")
            return state
            
        except Exception as e:
            logger.error(f"❌ Field extraction failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("field_extraction_failed", {"error": str(e)})
            return state
    
    async def _sadc_validation(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Validate extracted data against SADC country rules"""
        try:
            country_code = state.detected_country
            extracted_fields = state.ai_field_extraction.get("fields", {})
            
            # Validate fields according to SADC country rules
            validation_result = self._validate_sadc_fields(country_code, extracted_fields)
            
            state.sadc_validation = validation_result
            state.current_state = WorkflowState.SADC_VALIDATION
            
            state.add_audit_entry("sadc_validation_complete", {
                "country": country_code,
                "validation_score": validation_result.get("score", 0),
                "passed_validations": len(validation_result.get("passed", [])),
                "failed_validations": len(validation_result.get("failed", []))
            })
            
            logger.info(f"✅ SADC validation complete: {validation_result.get('score', 0):.2f}")
            return state
            
        except Exception as e:
            logger.error(f"❌ SADC validation failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("sadc_validation_failed", {"error": str(e)})
            return state
    
    async def _auto_decision(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Make automated approval/rejection decision"""
        try:
            validation_score = state.sadc_validation.get("score", 0)
            country_confidence = state.country_confidence or 0
            field_confidence = state.ai_field_extraction.get("confidence", 0)
            
            # Calculate overall confidence score
            overall_confidence = (validation_score + country_confidence + field_confidence) / 3
            
            # Auto decision logic
            if overall_confidence >= self.min_confidence_threshold:
                decision = "auto_approved"
                state.current_state = WorkflowState.AUTO_APPROVED
                state.final_decision = "approved"
            else:
                decision = "auto_rejected"
                state.current_state = WorkflowState.AUTO_REJECTED
                state.final_decision = "rejected"
                state.rejection_reasons = self._get_rejection_reasons(state)
            
            state.decision_confidence = overall_confidence
            
            state.add_audit_entry("auto_decision_made", {
                "decision": decision,
                "overall_confidence": overall_confidence,
                "validation_score": validation_score,
                "country_confidence": country_confidence,
                "field_confidence": field_confidence,
                "rejection_reasons": state.rejection_reasons
            })
            
            logger.info(f"✅ Auto decision: {decision} ({overall_confidence:.2f})")
            return state
            
        except Exception as e:
            logger.error(f"❌ Auto decision failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("auto_decision_failed", {"error": str(e)})
            return state
    
    async def _ai_analysis(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Perform AI analysis on extracted data"""
        try:
            # Get extracted data
            extracted_data = state.id_extraction_result.get("extracted_data", {})
            
            # Run comprehensive AI analysis
            analysis_result = await ai_agent_manager.analyze_document_comprehensive(
                json.dumps(extracted_data), 
                {"document_type": "namibian_national_id", "file_size": 1024},
                {"user_type": "new", "previous_uploads": 0}
            )
            
            state.ai_analysis_result = analysis_result
            state.document_type = "namibian_national_id"
            state.current_state = WorkflowState.AI_ANALYSIS_COMPLETE
            
            state.add_audit_entry("ai_analysis_complete", {
                "confidence": analysis_result.get("overall_confidence", 0.0),
                "document_type": state.document_type
            })
            
            logger.info(f"✅ AI analysis complete: {state.workflow_id}")
            return state
            
        except Exception as e:
            logger.error(f"❌ AI analysis failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("ai_analysis_failed", {"error": str(e)})
            return state
    
    async def _compliance_check(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Check ETA 2019 compliance"""
        try:
            # Get compliance validation from AI analysis
            compliance_result = state.ai_analysis_result.get("compliance_validation", {})
            
            state.compliance_status = compliance_result
            state.current_state = WorkflowState.COMPLIANCE_CHECKED
            
            state.add_audit_entry("compliance_checked", {
                "eta_2019_compliant": compliance_result.get("eta_2019_compliant", False),
                "compliance_score": compliance_result.get("compliance_score", 0.0)
            })
            
            logger.info(f"✅ Compliance check complete: {state.workflow_id}")
            return state
            
        except Exception as e:
            logger.error(f"❌ Compliance check failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("compliance_check_failed", {"error": str(e)})
            return state
    
    async def _fraud_detection(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Perform fraud detection"""
        try:
            # Get fraud detection from AI analysis
            fraud_result = state.ai_analysis_result.get("fraud_detection", {})
            
            state.fraud_detection_result = fraud_result
            
            # Determine if human review is required
            fraud_score = fraud_result.get("fraud_score", 0.0)
            confidence = fraud_result.get("confidence", 0.0)
            
            if fraud_score > 0.7 or confidence < 0.6:
                state.human_review_required = True
                state.human_review_priority = ReviewPriority.HIGH if fraud_score > 0.8 else ReviewPriority.MEDIUM
            
            state.add_audit_entry("fraud_detection_complete", {
                "fraud_detected": fraud_result.get("fraud_detected", False),
                "fraud_score": fraud_score,
                "human_review_required": state.human_review_required
            })
            
            logger.info(f"✅ Fraud detection complete: {state.workflow_id}")
            return state
            
        except Exception as e:
            logger.error(f"❌ Fraud detection failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("fraud_detection_failed", {"error": str(e)})
            return state
    
    async def _human_review_decision(self, state: KYCWorkflowState) -> str:
        """Decide if human review is needed"""
        try:
            if state.human_review_required:
                # Add to review queue
                deadline = datetime.now() + timedelta(hours=self.review_queue.sla_hours)
                self.review_queue.add_to_queue(
                    state.workflow_id, 
                    state.human_review_priority, 
                    deadline
                )
                
                state.current_state = WorkflowState.HUMAN_REVIEW_REQUIRED
                state.human_review_deadline = deadline
                
                state.add_audit_entry("human_review_queued", {
                    "priority": state.human_review_priority.value,
                    "deadline": deadline.isoformat()
                })
                
                logger.info(f"✅ Human review queued: {state.workflow_id}")
                return "human_review"
            else:
                # Auto-approve if no human review needed
                state.add_audit_entry("auto_approval_decision", {
                    "reason": "No human review required"
                })
                
                logger.info(f"✅ Auto-approval decision: {state.workflow_id}")
                return "auto_approve"
                
        except Exception as e:
            logger.error(f"❌ Human review decision failed: {e}")
            state.add_audit_entry("human_review_decision_failed", {"error": str(e)})
            return "auto_approve"  # Default to auto-approve on error
    
    async def _human_review(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Handle human review process"""
        try:
            # Simulate human review (in real implementation, this would wait for actual review)
            # For now, we'll simulate an approved review after a delay
            
            await asyncio.sleep(1)  # Simulate processing time
            
            # Simulate human review result
            review_result = {
                "reviewer_id": "reviewer_001",
                "decision": "approved",
                "confidence": 0.95,
                "notes": "Document appears legitimate and compliant",
                "reviewed_at": datetime.now().isoformat()
            }
            
            state.human_review_result = review_result
            state.human_review_assigned_to = review_result["reviewer_id"]
            state.current_state = WorkflowState.HUMAN_REVIEW_COMPLETE
            
            # Mark as complete in queue
            self.review_queue.mark_complete(state.workflow_id, review_result)
            
            state.add_audit_entry("human_review_complete", {
                "reviewer_id": review_result["reviewer_id"],
                "decision": review_result["decision"],
                "confidence": review_result["confidence"]
            })
            
            logger.info(f"✅ Human review complete: {state.workflow_id}")
            return state
            
        except Exception as e:
            logger.error(f"❌ Human review failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("human_review_failed", {"error": str(e)})
            return state
    
    async def _final_decision(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Make final approval/rejection decision"""
        try:
            # Determine final decision based on all results
            if state.human_review_required:
                # Use human review decision
                decision = state.human_review_result.get("decision", "rejected")
            else:
                # Use AI analysis for auto-approval
                overall_confidence = state.ai_analysis_result.get("overall_confidence", 0.0)
                fraud_detected = state.fraud_detection_result.get("fraud_detected", True)
                eta_compliant = state.compliance_status.get("eta_2019_compliant", False)
                
                if overall_confidence > 0.8 and not fraud_detected and eta_compliant:
                    decision = "approved"
                else:
                    decision = "rejected"
            
            state.final_decision = decision
            
            state.add_audit_entry("final_decision_made", {
                "decision": decision,
                "human_review_required": state.human_review_required
            })
            
            logger.info(f"✅ Final decision made: {state.workflow_id} - {decision}")
            return state
            
        except Exception as e:
            logger.error(f"❌ Final decision failed: {e}")
            state.final_decision = "rejected"
            state.add_audit_entry("final_decision_failed", {"error": str(e)})
            return state
    
    async def _complete_workflow(self, state: KYCWorkflowState) -> KYCWorkflowState:
        """Complete workflow"""
        try:
            if state.final_decision == "approved":
                state.current_state = WorkflowState.APPROVED
            else:
                state.current_state = WorkflowState.REJECTED
            
            state.current_state = WorkflowState.COMPLETED
            
            state.add_audit_entry("workflow_completed", {
                "final_decision": state.final_decision,
                "total_duration": (datetime.now() - state.created_at).total_seconds()
            })
            
            logger.info(f"✅ Workflow completed: {state.workflow_id} - {state.final_decision}")
            return state
            
        except Exception as e:
            logger.error(f"❌ Workflow completion failed: {e}")
            state.current_state = WorkflowState.FAILED
            state.add_audit_entry("workflow_completion_failed", {"error": str(e)})
            return state
    
    async def start_workflow(self, user_id: str, document_id: str) -> str:
        """Start a new KYC workflow"""
        try:
            workflow_id = f"kyc_{user_id}_{document_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Create initial state
            initial_state = KYCWorkflowState(
                workflow_id=workflow_id,
                user_id=user_id,
                document_id=document_id,
                current_state=WorkflowState.INITIALIZED
            )
            
            # Start workflow
            config = {"configurable": {"thread_id": workflow_id}}
            result = await self.workflow_executor.ainvoke(initial_state, config)
            
            logger.info(f"✅ KYC workflow started: {workflow_id}")
            return workflow_id
            
        except Exception as e:
            logger.error(f"❌ Failed to start KYC workflow: {e}")
            raise
    
    async def get_workflow_status(self, workflow_id: str) -> Optional[KYCWorkflowState]:
        """Get workflow status"""
        try:
            # Retrieve workflow status from in-memory store
            workflow = self.workflows.get(workflow_id)
            if not workflow:
                logger.warning(f"Workflow {workflow_id} not found")
                return None
            
            return KYCWorkflowState(
                workflow_id=workflow_id,
                current_state=workflow.get("current_state", WorkflowState.INITIALIZED),
                document_data=workflow.get("document_data", {}),
                extracted_data=workflow.get("extracted_data", {}),
                ai_analysis=workflow.get("ai_analysis", {}),
                compliance_result=workflow.get("compliance_result", {}),
                human_review=workflow.get("human_review", {}),
                created_at=workflow.get("created_at", datetime.now()),
                updated_at=workflow.get("updated_at", datetime.now()),
                completed_at=workflow.get("completed_at"),
                error_details=workflow.get("error_details")
            )
            
        except Exception as e:
            logger.error(f"❌ Failed to get workflow status: {e}")
            return None
    
    async def _call_vision_api(self, image_data: bytes) -> Dict[str, Any]:
        """Call OpenAI Vision API for real ID document analysis"""
        try:
            # Convert image to base64
            image_b64 = base64.b64encode(image_data).decode('utf-8')
            
            headers = {
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "gpt-4-vision-preview",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """Analyze this ID document and extract all visible text. Identify the country and document type. Return structured data with:
1. All text found on document
2. Country detected (NA, ZA, BW, etc.)
3. Document type (national_id, passport, driver_license)
4. Confidence score (0-1)
5. Key fields identified (names, numbers, dates)"""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_b64}"
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 2000
            }
            
            start_time = datetime.now()
            
            # Make async HTTP request
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post(self.vision_endpoint, headers=headers, json=payload) as response:
                    if response.status == 200:
                        result = await response.json()
                        
                        # Parse response
                        content = result["choices"][0]["message"]["content"]
                        
                        # Extract structured data from response
                        extracted_data = self._parse_vision_response(content)
                        
                        processing_time = (datetime.now() - start_time).total_seconds()
                        
                        return {
                            "extracted_text": content,
                            "country_detected": extracted_data.get("country", "NA"),
                            "confidence": extracted_data.get("confidence", 0.8),
                            "processing_time": processing_time,
                            "document_type": extracted_data.get("document_type", "national_id")
                        }
                    else:
                        raise Exception(f"Vision API error: {response.status}")
                        
        except Exception as e:
            logger.error(f"Vision API call failed: {e}")
            # Fallback to OCR
            return await self._fallback_ocr_extraction(image_data)
    
    async def _fallback_ocr_extraction(self, image_data: bytes) -> Dict[str, Any]:
        """Fallback OCR using pytesseract when vision API fails"""
        try:
            # Convert bytes to PIL Image
            import io
            image = Image.open(io.BytesIO(image_data))
            
            # Use pytesseract for text extraction
            extracted_text = pytesseract.image_to_string(image)
            
            # Simple country detection based on text patterns
            country = "NA"  # Default to Namibia
            if "SOUTH AFRICA" in extracted_text.upper():
                country = "ZA"
            elif "BOTSWANA" in extracted_text.upper():
                country = "BW"
            elif "NAMIBIA" in extracted_text.upper():
                country = "NA"
            
            return {
                "extracted_text": extracted_text,
                "country_detected": country,
                "confidence": 0.6,  # Lower confidence for OCR fallback
                "processing_time": 2.0,
                "document_type": "national_id"
            }
            
        except Exception as e:
            logger.error(f"OCR fallback failed: {e}")
            return {
                "extracted_text": "",
                "country_detected": "NA",
                "confidence": 0.0,
                "processing_time": 0.0,
                "document_type": "unknown"
            }
    
    def _parse_vision_response(self, response_text: str) -> Dict[str, Any]:
        """Parse structured data from vision API response"""
        try:
            # Extract country pattern
            country = "NA"
            if "country" in response_text.lower():
                if "south africa" in response_text.lower() or " za " in response_text.lower():
                    country = "ZA"
                elif "botswana" in response_text.lower() or " bw " in response_text.lower():
                    country = "BW"
                elif "namibia" in response_text.lower() or " na " in response_text.lower():
                    country = "NA"
            
            # Extract confidence
            confidence = 0.8
            if "confidence" in response_text.lower():
                import re
                conf_match = re.search(r"confidence[:\s]*([0-9.]+)", response_text.lower())
                if conf_match:
                    confidence = float(conf_match.group(1))
            
            # Extract document type
            doc_type = "national_id"
            if "passport" in response_text.lower():
                doc_type = "passport"
            elif "driver" in response_text.lower():
                doc_type = "driver_license"
            
            return {
                "country": country,
                "confidence": confidence,
                "document_type": doc_type
            }
            
        except Exception as e:
            logger.error(f"Error parsing vision response: {e}")
            return {
                "country": "NA",
                "confidence": 0.5,
                "document_type": "national_id"
            }
    
    async def _parse_with_ai_agent(self, extracted_text: str, country_code: str) -> Dict[str, Any]:
        """Parse extracted text using AI agent for structured data"""
        try:
            # Use the AI agent manager to parse text
            agent_response = await ai_agent_manager.parse_id_document(
                text=extracted_text,
                country_code=country_code,
                document_type="national_id"
            )
            
            return agent_response
            
        except Exception as e:
            logger.error(f"AI agent parsing failed: {e}")
            # Fallback to regex parsing
            return self._regex_fallback_parsing(extracted_text, country_code)
    
    async def _perform_ocr_extraction(self, image_data: bytes) -> Dict[str, Any]:
        """Perform OCR extraction prioritizing AI vision methods over traditional OCR"""
        try:
            # PRIORITY 1: OpenAI GPT-4 Vision (best for complex ID documents)
            try:
                vision_result = await self._call_vision_api(image_data)
                if vision_result.get("confidence", 0) > 0.7:
                    logger.info(f"✅ GPT-4 Vision extraction successful (confidence: {vision_result.get('confidence', 0)})")
                    return {
                        "extracted_text": vision_result["extracted_text"],
                        "confidence": vision_result["confidence"],
                        "processing_time": vision_result["processing_time"],
                        "method": "gpt4_vision"
                    }
            except Exception as e:
                logger.warning(f"GPT-4 Vision failed: {e}")
            
            # PRIORITY 2: Google Vision API (if available)
            try:
                google_result = await self._use_google_vision_api(image_data)
                if google_result.get("confidence", 0) > 0.6:
                    logger.info(f"✅ Google Vision extraction successful (confidence: {google_result.get('confidence', 0)})")
                    return {
                        "extracted_text": google_result["extracted_text"],
                        "confidence": google_result["confidence"],
                        "processing_time": google_result["processing_time"],
                        "method": "google_vision"
                    }
            except Exception as e:
                logger.warning(f"Google Vision failed: {e}")
            
            # PRIORITY 3: Azure Cognitive Services (if available)
            try:
                azure_result = await self._use_azure_vision_api(image_data)
                if azure_result.get("confidence", 0) > 0.6:
                    logger.info(f"✅ Azure Vision extraction successful (confidence: {azure_result.get('confidence', 0)})")
                    return {
                        "extracted_text": azure_result["extracted_text"],
                        "confidence": azure_result["confidence"],
                        "processing_time": azure_result["processing_time"],
                        "method": "azure_vision"
                    }
            except Exception as e:
                logger.warning(f"Azure Vision failed: {e}")
            
            # FINAL FALLBACK: pytesseract OCR (only when all AI methods fail)
            logger.warning("All AI vision methods failed, using pytesseract OCR fallback")
            ocr_result = await self._fallback_ocr_extraction(image_data)
            return {
                "extracted_text": ocr_result.get("extracted_text", ""),
                "confidence": ocr_result.get("confidence", 0.3),  # Lower confidence for OCR
                "processing_time": ocr_result.get("processing_time", 0),
                "method": "pytesseract_fallback"
            }
                
        except Exception as e:
            logger.error(f"All OCR extraction methods failed: {e}")
            return {
                "extracted_text": "",
                "confidence": 0.0,
                "processing_time": 0.0,
                "method": "failed"
            }
    
    async def _detect_sadc_country(self, text: str) -> Dict[str, Any]:
        """Detect SADC country from extracted text"""
        try:
            text_upper = text.upper()
            best_match = {"country_code": "NA", "confidence": 0.0, "method": "default"}
            
            # Check each SADC country's keywords
            for code, config in self.sadc_countries.items():
                score = 0
                matches = 0
                
                for keyword in config["keywords"]:
                    if keyword in text_upper:
                        matches += 1
                        score += len(keyword) / len(text_upper)  # Weight by keyword length
                
                # Calculate confidence based on matches and text coverage
                confidence = min(1.0, (matches * 0.3) + (score * 10))
                
                if confidence > best_match["confidence"]:
                    best_match = {
                        "country_code": code,
                        "confidence": confidence,
                        "method": "keyword_matching",
                        "matches": matches
                    }
            
            # If no good match found, use AI for detection
            if best_match["confidence"] < 0.6:
                ai_result = await self._ai_country_detection_fallback(text)
                if ai_result["confidence"] > best_match["confidence"]:
                    best_match = ai_result
            
            return best_match
            
        except Exception as e:
            logger.error(f"Country detection failed: {e}")
            return {"country_code": "NA", "confidence": 0.0, "method": "error"}
    
    async def _ai_country_detection_fallback(self, text: str) -> Dict[str, Any]:
        """Use AI for country detection when keyword matching fails"""
        try:
            if not self.openai_api_key:
                return {"country_code": "NA", "confidence": 0.0, "method": "no_api_key"}
            
            prompt = f"""
            Analyze this text from an ID document and identify which SADC country it's from:
            {text[:1000]}
            
            SADC countries: Namibia (NA), South Africa (ZA), Botswana (BW), Eswatini (SZ), 
            Lesotho (LS), Malawi (MW), Mozambique (MZ), Tanzania (TZ), Zambia (ZM), 
            Zimbabwe (ZW), Angola (AO), Madagascar (MG), Mauritius (MU), Seychelles (SC)
            
            Return only the 2-letter country code (e.g., NA) and confidence (0-1).
            Format: CODE:CONFIDENCE
            """
            
            # Make AI API call
            headers = {
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 50,
                "temperature": 0.1
            }
            
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post("https://api.openai.com/v1/chat/completions", 
                                       headers=headers, json=payload) as response:
                    if response.status == 200:
                        result = await response.json()
                        content = result["choices"][0]["message"]["content"].strip()
                        
                        # Parse response (e.g., "NA:0.85")
                        parts = content.split(":")
                        if len(parts) == 2:
                            code = parts[0].strip().upper()
                            confidence = float(parts[1].strip())
                            
                            if code in self.sadc_countries:
                                return {
                                    "country_code": code,
                                    "confidence": confidence,
                                    "method": "ai_detection"
                                }
            
            return {"country_code": "NA", "confidence": 0.0, "method": "ai_parse_failed"}
            
        except Exception as e:
            logger.error(f"AI country detection failed: {e}")
            return {"country_code": "NA", "confidence": 0.0, "method": "ai_error"}
    
    async def _extract_sadc_fields(self, text: str, country_code: str) -> Dict[str, Any]:
        """Extract fields using OCR + AI agents (primary) with regex as final fallback"""
        try:
            # PRIORITY 1: Use Pydantic AI agent for structured field extraction
            try:
                agent_result = await self._use_pydantic_ai_agent(text, country_code)
                if agent_result and agent_result.get("confidence_score", 0) > 0.6:
                    return {
                        "fields": agent_result,
                        "confidence": agent_result.get("confidence_score", 0.8),
                        "method": "pydantic_ai_agent"
                    }
            except Exception as e:
                logger.warning(f"Pydantic AI agent failed: {e}")
            
            # PRIORITY 2: Use OpenAI structured output for field extraction
            try:
                openai_result = await self._use_openai_structured_extraction(text, country_code)
                if openai_result and openai_result.get("confidence_score", 0) > 0.5:
                    return {
                        "fields": openai_result,
                        "confidence": openai_result.get("confidence_score", 0.7),
                        "method": "openai_structured"
                    }
            except Exception as e:
                logger.warning(f"OpenAI structured extraction failed: {e}")
            
            # PRIORITY 3: Use general AI agent manager (existing)
            try:
                agent_result = await ai_agent_manager.parse_id_document(
                    text=text,
                    country_code=country_code,
                    document_type="national_id"
                )
                if agent_result:
                    return {
                        "fields": agent_result,
                        "confidence": agent_result.get("confidence_score", 0.6),
                        "method": "ai_agent_manager"
                    }
            except Exception as e:
                logger.warning(f"AI agent manager failed: {e}")
            
            # FINAL FALLBACK: Regex parsing (only when AI methods fail)
            logger.warning(f"All AI methods failed, using regex fallback for {country_code}")
            regex_result = self._regex_fallback_parsing(text, country_code)
            return {
                "fields": regex_result,
                "confidence": regex_result.get("confidence_score", 0.3),
                "method": "regex_fallback"
            }
            
        except Exception as e:
            logger.error(f"All extraction methods failed: {e}")
            return {
                "fields": {},
                "confidence": 0.0,
                "method": "failed"
            }
    
    def _validate_sadc_fields(self, country_code: str, fields: Dict[str, Any]) -> Dict[str, Any]:
        """Validate extracted fields against SADC country rules"""
        try:
            country_config = self.sadc_countries.get(country_code, self.sadc_countries["NA"])
            
            validations = {
                "passed": [],
                "failed": [],
                "warnings": []
            }
            
            # ID Number validation
            id_number = fields.get("id_number", "")
            if id_number:
                if country_code == "NA" and len(id_number) == 11 and id_number.isdigit():
                    validations["passed"].append("id_format_valid")
                elif country_code == "ZA" and len(id_number) == 13 and id_number.isdigit():
                    validations["passed"].append("id_format_valid")
                elif country_code == "BW" and len(id_number) == 9 and id_number.isdigit():
                    validations["passed"].append("id_format_valid")
                else:
                    validations["failed"].append("id_format_invalid")
            else:
                validations["failed"].append("id_number_missing")
            
            # Date of birth validation
            dob = fields.get("date_of_birth")
            if dob:
                # Basic date format validation
                if len(str(dob)) >= 8:  # YYYY-MM-DD or similar
                    validations["passed"].append("dob_present")
                else:
                    validations["warnings"].append("dob_format_questionable")
            else:
                validations["failed"].append("dob_missing")
            
            # Name validation
            full_name = fields.get("full_name")
            if full_name and len(full_name.strip()) > 2:
                validations["passed"].append("name_present")
            else:
                validations["failed"].append("name_missing_or_invalid")
            
            # Calculate score
            total_checks = len(validations["passed"]) + len(validations["failed"])
            if total_checks > 0:
                score = len(validations["passed"]) / total_checks
            else:
                score = 0.0
            
            return {
                "score": score,
                "passed": validations["passed"],
                "failed": validations["failed"],
                "warnings": validations["warnings"],
                "country": country_code
            }
            
        except Exception as e:
            logger.error(f"SADC validation failed: {e}")
            return {
                "score": 0.0,
                "passed": [],
                "failed": ["validation_error"],
                "warnings": [],
                "country": country_code
            }
    
    def _get_rejection_reasons(self, state: KYCWorkflowState) -> List[str]:
        """Get specific rejection reasons based on workflow state"""
        reasons = []
        
        # Country detection issues
        if state.country_confidence and state.country_confidence < 0.6:
            reasons.append("Low country detection confidence")
        
        # Field extraction issues
        field_confidence = state.ai_field_extraction.get("confidence", 0) if state.ai_field_extraction else 0
        if field_confidence < 0.6:
            reasons.append("Low field extraction confidence")
        
        # Validation failures
        if state.sadc_validation:
            failed_validations = state.sadc_validation.get("failed", [])
            if "id_number_missing" in failed_validations:
                reasons.append("ID number not found or invalid format")
            if "dob_missing" in failed_validations:
                reasons.append("Date of birth not found")
            if "name_missing_or_invalid" in failed_validations:
                reasons.append("Full name not found or invalid")
        
        # OCR quality issues
        if state.ocr_extraction:
            ocr_confidence = state.ocr_extraction.get("confidence", 0)
            if ocr_confidence < 0.5:
                reasons.append("Poor document image quality")
        
        return reasons if reasons else ["Overall confidence below threshold"]
    
    async def _use_pydantic_ai_agent(self, text: str, country_code: str) -> Dict[str, Any]:
        """Use Pydantic AI agent for structured field extraction"""
        try:
            from pydantic_ai import Agent
            from pydantic import BaseModel, Field
            from typing import Optional
            import asyncio
            
            # Define Pydantic model for ID document fields
            class SADCIDDocument(BaseModel):
                id_number: Optional[str] = Field(None, description="National ID number")
                full_name: Optional[str] = Field(None, description="Full name on ID")
                first_name: Optional[str] = Field(None, description="First name")
                last_name: Optional[str] = Field(None, description="Last name") 
                date_of_birth: Optional[str] = Field(None, description="Date of birth (YYYY-MM-DD format)")
                gender: Optional[str] = Field(None, description="Gender (M/F)")
                nationality: Optional[str] = Field(None, description="Nationality")
                issue_date: Optional[str] = Field(None, description="ID issue date")
                expiry_date: Optional[str] = Field(None, description="ID expiry date")
                place_of_birth: Optional[str] = Field(None, description="Place of birth")
                address: Optional[str] = Field(None, description="Address")
                confidence_score: float = Field(0.8, description="Extraction confidence")
            
            # Create Pydantic AI agent
            agent = Agent(
                'openai:gpt-4o-mini',
                result_type=SADCIDDocument,
                system_prompt=f"""
                You are an expert at extracting structured data from {self.sadc_countries.get(country_code, {}).get('name', 'SADC')} national ID documents.
                
                Extract the following information from the provided text:
                - National ID number (follow {country_code} format)
                - Full name and separate first/last names
                - Date of birth (convert to YYYY-MM-DD)
                - Gender (M/F)
                - Nationality
                - Issue and expiry dates
                - Place of birth and address if available
                
                Country: {country_code} ({self.sadc_countries.get(country_code, {}).get('name', 'Unknown')})
                ID Format: {self.sadc_countries.get(country_code, {}).get('id_format', 'variable')}
                
                Provide a confidence score (0.0-1.0) based on:
                - Text clarity and completeness
                - Field extraction confidence
                - Format compliance
                
                Only extract information that is clearly visible in the text.
                """
            )
            
            # Run the agent
            result = await agent.run(text)
            
            # Convert Pydantic model to dict
            extracted_data = result.data.model_dump()
            
            logger.info(f"✅ Pydantic AI extraction successful: {country_code} (confidence: {extracted_data.get('confidence_score', 0)})")
            return extracted_data
            
        except Exception as e:
            logger.error(f"❌ Pydantic AI agent failed: {e}")
            raise e
    
    async def _use_openai_structured_extraction(self, text: str, country_code: str) -> Dict[str, Any]:
        """Use OpenAI with structured output for field extraction"""
        try:
            if not self.openai_api_key:
                raise ValueError("OpenAI API key not configured")
            
            import aiohttp
            import json
            
            # Define extraction schema
            schema = {
                "type": "object",
                "properties": {
                    "id_number": {"type": "string", "description": "National ID number"},
                    "full_name": {"type": "string", "description": "Full name"},
                    "first_name": {"type": "string", "description": "First name"},
                    "last_name": {"type": "string", "description": "Last name"},
                    "date_of_birth": {"type": "string", "description": "Date of birth in YYYY-MM-DD format"},
                    "gender": {"type": "string", "enum": ["M", "F"], "description": "Gender"},
                    "nationality": {"type": "string", "description": "Nationality"},
                    "issue_date": {"type": "string", "description": "ID issue date"},
                    "expiry_date": {"type": "string", "description": "ID expiry date"},
                    "place_of_birth": {"type": "string", "description": "Place of birth"},
                    "address": {"type": "string", "description": "Address"},
                    "confidence_score": {"type": "number", "minimum": 0, "maximum": 1, "description": "Extraction confidence"}
                },
                "required": ["confidence_score"],
                "additionalProperties": False
            }
            
            prompt = f"""
            Extract structured data from this {self.sadc_countries.get(country_code, {}).get('name', 'SADC')} national ID document text.
            
            Country: {country_code} ({self.sadc_countries.get(country_code, {}).get('name', 'Unknown')})
            Expected ID format: {self.sadc_countries.get(country_code, {}).get('id_format', 'variable')}
            
            Text to extract from:
            {text}
            
            Instructions:
            1. Extract only clearly visible information
            2. Convert dates to YYYY-MM-DD format
            3. Use standard gender codes (M/F)
            4. Provide confidence score based on text clarity and completeness
            5. Leave fields as null if not clearly extractable
            
            Return structured JSON matching the schema.
            """
            
            headers = {
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "id_extraction",
                        "schema": schema
                    }
                },
                "max_tokens": 1000,
                "temperature": 0.1
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        content = result["choices"][0]["message"]["content"]
                        extracted_data = json.loads(content)
                        
                        logger.info(f"✅ OpenAI structured extraction successful: {country_code} (confidence: {extracted_data.get('confidence_score', 0)})")
                        return extracted_data
                    else:
                        error_text = await response.text()
                        raise ValueError(f"OpenAI API error: {response.status} - {error_text}")
            
        except Exception as e:
            logger.error(f"❌ OpenAI structured extraction failed: {e}")
            raise e
    
    async def _use_google_vision_api(self, image_data: bytes) -> Dict[str, Any]:
        """Use Google Vision API for OCR extraction"""
        try:
            # Google Vision API implementation would go here
            # For now, return a placeholder that indicates method not implemented
            raise NotImplementedError("Google Vision API not configured")
        except Exception as e:
            logger.error(f"Google Vision API error: {e}")
            raise e
    
    async def _use_azure_vision_api(self, image_data: bytes) -> Dict[str, Any]:
        """Use Azure Cognitive Services for OCR extraction"""
        try:
            # Azure Vision API implementation would go here
            # For now, return a placeholder that indicates method not implemented
            raise NotImplementedError("Azure Vision API not configured")
        except Exception as e:
            logger.error(f"Azure Vision API error: {e}")
            raise e
    
    def _regex_fallback_parsing(self, text: str, country_code: str) -> Dict[str, Any]:
        """Fallback regex parsing when AI agent fails"""
        try:
            import re
            
            result = {
                "full_name": None,
                "id_number": None,
                "date_of_birth": None,
                "nationality": None,
                "document_number": None,
                "expiry_date": None,
                "confidence_score": 0.6
            }
            
            # Common patterns for SADC countries
            patterns = {
                "NA": {
                    "id_number": r"\b\d{11}\b",
                    "date_of_birth": r"\b\d{2}[/-]\d{2}[/-]\d{4}\b",
                },
                "ZA": {
                    "id_number": r"\b\d{13}\b",
                    "date_of_birth": r"\b\d{2}[/-]\d{2}[/-]\d{4}\b",
                },
                "BW": {
                    "id_number": r"\b\d{9}\b",
                    "date_of_birth": r"\b\d{2}[/-]\d{2}[/-]\d{4}\b",
                }
            }
            
            country_patterns = patterns.get(country_code, patterns["NA"])
            
            for field, pattern in country_patterns.items():
                match = re.search(pattern, text)
                if match:
                    result[field] = match.group()
            
            # Extract names (first words before numbers usually)
            name_match = re.search(r"([A-Z][a-z]+\s+[A-Z][a-z]+)", text)
            if name_match:
                result["full_name"] = name_match.group(1)
            
            return result
            
        except Exception as e:
            logger.error(f"Regex parsing failed: {e}")
            return {"confidence_score": 0.0}
    
    async def assign_reviewer(self, workflow_id: str, reviewer_id: str):
        """Assign reviewer to workflow"""
        try:
            self.review_queue.assign_reviewer(workflow_id, reviewer_id)
            logger.info(f"✅ Reviewer assigned: {workflow_id} -> {reviewer_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to assign reviewer: {e}")
            raise

# Global workflow engine instance
kyc_workflow_engine = KYCWorkflowEngine()
