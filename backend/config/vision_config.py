"""
Vision Model Configuration
Provides configuration for vision models and AI agents used in KYC workflows
"""

import os
import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class VisionModelConfig(BaseModel):
    """Configuration for vision models"""
    
    # OpenAI Vision API
    openai_api_key: Optional[str] = Field(
        default_factory=lambda: os.getenv("OPENAI_API_KEY"),
        description="OpenAI API key for vision models"
    )
    openai_vision_model: str = Field(
        default_factory=lambda: os.getenv("OPENAI_VISION_MODEL", "gpt-4-vision-preview"),
        description="OpenAI vision model to use"
    )
    openai_agent_model: str = Field(
        default_factory=lambda: os.getenv("OPENAI_AGENT_MODEL", "gpt-4o-mini"),
        description="OpenAI model to use for agent tasks"
    )
    openai_max_tokens: int = Field(
        default_factory=lambda: int(os.getenv("OPENAI_MAX_TOKENS", "2000")),
        description="Maximum tokens for OpenAI responses"
    )
    openai_temperature: float = Field(
        default_factory=lambda: float(os.getenv("OPENAI_TEMPERATURE", "0.1")),
        description="Temperature for OpenAI responses"
    )
    
    # Google Cloud Vision API
    google_vision_enabled: bool = Field(
        default_factory=lambda: os.getenv("GOOGLE_VISION_ENABLED", "false").lower() == "true",
        description="Whether Google Cloud Vision API is enabled"
    )
    google_credentials_path: Optional[str] = Field(
        default_factory=lambda: os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
        description="Path to Google Cloud credentials file"
    )
    
    # Azure Computer Vision API
    azure_vision_enabled: bool = Field(
        default_factory=lambda: os.getenv("AZURE_VISION_ENABLED", "false").lower() == "true",
        description="Whether Azure Computer Vision API is enabled"
    )
    azure_vision_endpoint: Optional[str] = Field(
        default_factory=lambda: os.getenv("AZURE_VISION_ENDPOINT"),
        description="Azure Computer Vision API endpoint"
    )
    azure_vision_key: Optional[str] = Field(
        default_factory=lambda: os.getenv("AZURE_VISION_KEY"),
        description="Azure Computer Vision API key"
    )
    
    # AWS Rekognition
    aws_rekognition_enabled: bool = Field(
        default_factory=lambda: os.getenv("AWS_REKOGNITION_ENABLED", "false").lower() == "true",
        description="Whether AWS Rekognition is enabled"
    )
    aws_access_key_id: Optional[str] = Field(
        default_factory=lambda: os.getenv("AWS_ACCESS_KEY_ID"),
        description="AWS access key ID"
    )
    aws_secret_access_key: Optional[str] = Field(
        default_factory=lambda: os.getenv("AWS_SECRET_ACCESS_KEY"),
        description="AWS secret access key"
    )
    aws_region: str = Field(
        default_factory=lambda: os.getenv("AWS_REGION", "us-east-1"),
        description="AWS region"
    )
    
    # OCR Configuration
    tesseract_path: Optional[str] = Field(
        default_factory=lambda: os.getenv("TESSERACT_PATH"),
        description="Path to Tesseract OCR executable"
    )
    tesseract_config: str = Field(
        default_factory=lambda: os.getenv("TESSERACT_CONFIG", "--oem 3 --psm 6"),
        description="Tesseract OCR configuration"
    )
    easyocr_enabled: bool = Field(
        default_factory=lambda: os.getenv("EASYOCR_ENABLED", "true").lower() == "true",
        description="Whether EasyOCR is enabled"
    )
    
    # Workflow Configuration
    min_confidence_threshold: float = Field(
        default_factory=lambda: float(os.getenv("MIN_CONFIDENCE_THRESHOLD", "0.8")),
        description="Minimum confidence threshold for auto-approval"
    )
    min_field_match_threshold: float = Field(
        default_factory=lambda: float(os.getenv("MIN_FIELD_MATCH_THRESHOLD", "0.7")),
        description="Minimum field match threshold"
    )
    
    def get_available_vision_services(self) -> Dict[str, bool]:
        """Get available vision services based on configuration"""
        return {
            "openai_vision": bool(self.openai_api_key),
            "google_vision": self.google_vision_enabled and bool(self.google_credentials_path),
            "azure_vision": self.azure_vision_enabled and bool(self.azure_vision_endpoint) and bool(self.azure_vision_key),
            "aws_rekognition": self.aws_rekognition_enabled and bool(self.aws_access_key_id) and bool(self.aws_secret_access_key),
            "tesseract_ocr": bool(self.tesseract_path) or True,  # Default to True if not specified
            "easyocr": self.easyocr_enabled
        }
    
    def get_service_priority(self) -> Dict[str, int]:
        """Get service priority based on configuration"""
        services = self.get_available_vision_services()
        priority = {}
        
        # Set priority based on availability and assumed quality
        if services.get("openai_vision"):
            priority["openai_vision"] = 1
        if services.get("google_vision"):
            priority["google_vision"] = 2
        if services.get("azure_vision"):
            priority["azure_vision"] = 3
        if services.get("aws_rekognition"):
            priority["aws_rekognition"] = 4
        if services.get("easyocr"):
            priority["easyocr"] = 5
        if services.get("tesseract_ocr"):
            priority["tesseract_ocr"] = 6
            
        return priority
    
    def log_configuration(self) -> None:
        """Log the current configuration"""
        services = self.get_available_vision_services()
        available = [name for name, enabled in services.items() if enabled]
        
        logger.info(f"Vision services configuration:")
        logger.info(f"Available services: {', '.join(available)}")
        logger.info(f"OpenAI Vision model: {self.openai_vision_model}")
        logger.info(f"OpenAI Agent model: {self.openai_agent_model}")
        logger.info(f"Min confidence threshold: {self.min_confidence_threshold}")
        logger.info(f"Min field match threshold: {self.min_field_match_threshold}")

# Create singleton instance
vision_config = VisionModelConfig()

# Log configuration on startup
vision_config.log_configuration()
