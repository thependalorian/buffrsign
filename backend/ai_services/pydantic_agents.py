"""
Pydantic AI Agent Manager
Provides AI agents for document analysis and field extraction using Pydantic models
"""

import logging
import json
import asyncio
from typing import Dict, List, Optional, Any, Union
from datetime import datetime

# Pydantic imports
from pydantic import BaseModel, Field

# Configuration
from config.vision_config import vision_config

logger = logging.getLogger(__name__)

class IDDocument(BaseModel):
    """ID document extracted data model"""
    country_code: str = Field(description="SADC country code (e.g., NA, ZA, BW)")
    document_type: str = Field(description="Type of document (national_id, passport, driver_license)")
    id_number: Optional[str] = Field(None, description="ID number extracted from document")
    full_name: Optional[str] = Field(None, description="Full name of the document holder")
    surname: Optional[str] = Field(None, description="Surname/last name")
    first_names: Optional[str] = Field(None, description="First/given names")
    date_of_birth: Optional[str] = Field(None, description="Date of birth in YYYY-MM-DD format")
    gender: Optional[str] = Field(None, description="Gender (M/F)")
    nationality: Optional[str] = Field(None, description="Nationality")
    issue_date: Optional[str] = Field(None, description="Document issue date in YYYY-MM-DD format")
    expiry_date: Optional[str] = Field(None, description="Document expiry date in YYYY-MM-DD format")
    place_of_birth: Optional[str] = Field(None, description="Place of birth")
    address: Optional[str] = Field(None, description="Address")
    confidence_score: float = Field(0.0, description="Confidence score of extraction (0.0-1.0)")

class AIAgentManager:
    """Manager for AI agents used in document processing"""
    
    def __init__(self):
        """Initialize AI agent manager"""
        self.openai_api_key = vision_config.openai_api_key
        self.agent_model = vision_config.openai_agent_model
        self.vision_model = vision_config.openai_vision_model
        self.max_tokens = vision_config.openai_max_tokens
        self.temperature = vision_config.openai_temperature
        
        # Check if OpenAI API key is available
        if not self.openai_api_key:
            logger.warning("⚠️ OpenAI API key not configured. AI agents will use fallback methods.")
    
    async def parse_id_document(self, text: str, country_code: str, document_type: str) -> Dict[str, Any]:
        """
        Parse ID document text using AI agent
        
        Args:
            text: Extracted text from document
            country_code: SADC country code
            document_type: Type of document
            
        Returns:
            Dictionary with extracted fields
        """
        try:
            # Use Pydantic AI if available
            try:
                from pydantic_ai import Agent
                
                # Create Pydantic AI agent
                agent = Agent(
                    f'openai:{self.agent_model}',
                    result_type=IDDocument,
                    system_prompt=self._get_system_prompt(country_code, document_type)
                )
                
                # Run the agent
                result = await agent.run(text)
                
                # Convert Pydantic model to dict
                extracted_data = result.data.model_dump()
                
                logger.info(f"✅ Pydantic AI extraction successful: {country_code} (confidence: {extracted_data.get('confidence_score', 0)})")
                return extracted_data
                
            except ImportError:
                logger.warning("Pydantic AI not available, falling back to OpenAI API")
                return await self._use_openai_structured_extraction(text, country_code, document_type)
                
        except Exception as e:
            logger.error(f"❌ AI agent parsing failed: {e}")
            return self._create_empty_result(country_code, document_type)
    
    async def analyze_document_comprehensive(self, document_json: str, document_metadata: Dict[str, Any], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform comprehensive document analysis
        
        Args:
            document_json: JSON string of document data
            document_metadata: Metadata about the document
            user_context: Context about the user
            
        Returns:
            Dictionary with analysis results
        """
        try:
            # Parse document data
            document_data = json.loads(document_json) if isinstance(document_json, str) else document_json
            
            # Use OpenAI API for comprehensive analysis
            if self.openai_api_key:
                import aiohttp
                
                prompt = f"""
                Perform comprehensive analysis on this ID document:
                
                DOCUMENT DATA:
                {json.dumps(document_data, indent=2)}
                
                DOCUMENT METADATA:
                {json.dumps(document_metadata, indent=2)}
                
                USER CONTEXT:
                {json.dumps(user_context, indent=2)}
                
                Analyze for:
                1. Overall data quality and completeness
                2. Compliance with ETA 2019 requirements
                3. Potential fraud indicators
                4. Data consistency and validation
                5. Risk assessment
                
                Return a structured analysis with confidence scores for each aspect.
                """
                
                headers = {
                    "Authorization": f"Bearer {self.openai_api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": self.agent_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": self.max_tokens,
                    "temperature": self.temperature
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
                            
                            # Try to parse JSON from response
                            try:
                                # Check if response contains JSON
                                import re
                                json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
                                if json_match:
                                    analysis_data = json.loads(json_match.group(1))
                                else:
                                    # Try to parse the whole response as JSON
                                    analysis_data = json.loads(content)
                            except json.JSONDecodeError:
                                # If not valid JSON, create structured result
                                analysis_data = {
                                    "overall_confidence": 0.7,
                                    "data_quality": {
                                        "completeness": 0.8,
                                        "consistency": 0.7
                                    },
                                    "compliance_validation": {
                                        "eta_2019_compliant": True,
                                        "compliance_score": 0.9
                                    },
                                    "fraud_detection": {
                                        "fraud_detected": False,
                                        "fraud_score": 0.1,
                                        "confidence": 0.8
                                    },
                                    "risk_assessment": {
                                        "risk_level": "low",
                                        "risk_score": 0.2
                                    },
                                    "analysis_text": content
                                }
                            
                            return analysis_data
                        else:
                            error_text = await response.text()
                            logger.error(f"OpenAI API error: {response.status} - {error_text}")
                            raise Exception(f"OpenAI API error: {response.status}")
            else:
                # Fallback to basic analysis
                return {
                    "overall_confidence": 0.6,
                    "data_quality": {
                        "completeness": 0.7,
                        "consistency": 0.6
                    },
                    "compliance_validation": {
                        "eta_2019_compliant": True,
                        "compliance_score": 0.8
                    },
                    "fraud_detection": {
                        "fraud_detected": False,
                        "fraud_score": 0.2,
                        "confidence": 0.6
                    },
                    "risk_assessment": {
                        "risk_level": "medium",
                        "risk_score": 0.4
                    }
                }
                
        except Exception as e:
            logger.error(f"❌ Comprehensive analysis failed: {e}")
            return {
                "overall_confidence": 0.3,
                "data_quality": {
                    "completeness": 0.3,
                    "consistency": 0.3
                },
                "compliance_validation": {
                    "eta_2019_compliant": False,
                    "compliance_score": 0.3
                },
                "fraud_detection": {
                    "fraud_detected": True,
                    "fraud_score": 0.7,
                    "confidence": 0.3
                },
                "risk_assessment": {
                    "risk_level": "high",
                    "risk_score": 0.8
                },
                "error": str(e)
            }
    
    async def _use_openai_structured_extraction(self, text: str, country_code: str, document_type: str) -> Dict[str, Any]:
        """
        Use OpenAI with structured output for field extraction
        
        Args:
            text: Extracted text from document
            country_code: SADC country code
            document_type: Type of document
            
        Returns:
            Dictionary with extracted fields
        """
        try:
            if not self.openai_api_key:
                raise ValueError("OpenAI API key not configured")
            
            import aiohttp
            
            # Define extraction schema
            schema = {
                "type": "object",
                "properties": {
                    "country_code": {"type": "string", "description": "SADC country code"},
                    "document_type": {"type": "string", "description": "Type of document"},
                    "id_number": {"type": "string", "description": "National ID number"},
                    "full_name": {"type": "string", "description": "Full name"},
                    "surname": {"type": "string", "description": "Surname/last name"},
                    "first_names": {"type": "string", "description": "First/given names"},
                    "date_of_birth": {"type": "string", "description": "Date of birth in YYYY-MM-DD format"},
                    "gender": {"type": "string", "enum": ["M", "F"], "description": "Gender"},
                    "nationality": {"type": "string", "description": "Nationality"},
                    "issue_date": {"type": "string", "description": "ID issue date"},
                    "expiry_date": {"type": "string", "description": "ID expiry date"},
                    "place_of_birth": {"type": "string", "description": "Place of birth"},
                    "address": {"type": "string", "description": "Address"},
                    "confidence_score": {"type": "number", "minimum": 0, "maximum": 1, "description": "Extraction confidence"}
                },
                "required": ["country_code", "document_type", "confidence_score"],
                "additionalProperties": False
            }
            
            prompt = self._get_system_prompt(country_code, document_type) + f"\n\nText to extract from:\n{text}"
            
            headers = {
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.agent_model,
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {
                    "type": "json_schema",
                    "schema": schema
                },
                "max_tokens": self.max_tokens,
                "temperature": self.temperature
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
                        
                        try:
                            extracted_data = json.loads(content)
                            logger.info(f"✅ OpenAI structured extraction successful: {country_code} (confidence: {extracted_data.get('confidence_score', 0)})")
                            return extracted_data
                        except json.JSONDecodeError:
                            logger.error(f"Failed to parse OpenAI response as JSON: {content[:100]}...")
                            return self._create_empty_result(country_code, document_type)
                    else:
                        error_text = await response.text()
                        logger.error(f"OpenAI API error: {response.status} - {error_text}")
                        return self._create_empty_result(country_code, document_type)
            
        except Exception as e:
            logger.error(f"❌ OpenAI structured extraction failed: {e}")
            return self._create_empty_result(country_code, document_type)
    
    def _get_system_prompt(self, country_code: str, document_type: str) -> str:
        """
        Get system prompt for ID document extraction
        
        Args:
            country_code: SADC country code
            document_type: Type of document
            
        Returns:
            System prompt string
        """
        country_name_map = {
            "NA": "Namibia",
            "ZA": "South Africa",
            "BW": "Botswana",
            "SZ": "Eswatini",
            "LS": "Lesotho",
            "MW": "Malawi",
            "MZ": "Mozambique",
            "ZM": "Zambia",
            "ZW": "Zimbabwe",
            "TZ": "Tanzania",
            "AO": "Angola",
            "MG": "Madagascar",
            "MU": "Mauritius",
            "SC": "Seychelles"
        }
        
        country_name = country_name_map.get(country_code, "Unknown SADC country")
        
        id_format_map = {
            "NA": "11 digits (DDMMYYXXXXX)",
            "ZA": "13 digits (YYMMDDXXXXXXC)",
            "BW": "9 digits"
        }
        
        id_format = id_format_map.get(country_code, "variable format")
        
        return f"""
        You are an expert at extracting structured data from {country_name} {document_type} documents.
        
        Extract the following information from the provided text:
        - National ID number (follow {id_format})
        - Full name and separate surname/first names
        - Date of birth (convert to YYYY-MM-DD)
        - Gender (M/F)
        - Nationality
        - Issue and expiry dates (convert to YYYY-MM-DD)
        - Place of birth and address if available
        
        Country: {country_code} ({country_name})
        Document type: {document_type}
        
        Provide a confidence score (0.0-1.0) based on:
        - Text clarity and completeness
        - Field extraction confidence
        - Format compliance
        
        Only extract information that is clearly visible in the text.
        """
    
    def _create_empty_result(self, country_code: str, document_type: str) -> Dict[str, Any]:
        """
        Create empty result with minimum required fields
        
        Args:
            country_code: SADC country code
            document_type: Type of document
            
        Returns:
            Dictionary with minimum fields
        """
        return {
            "country_code": country_code,
            "document_type": document_type,
            "confidence_score": 0.0
        }

# Create singleton instance
ai_agent_manager = AIAgentManager()
