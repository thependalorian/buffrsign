"""
KYC Workflow Integration Tests
"""

import os
import pytest
import asyncio
from typing import Dict, Any
from datetime import datetime

# Import workflow engine
from ai_services.workflows.kyc_workflow import kyc_workflow_engine, KYCWorkflowState, WorkflowState
from utils.sadc_validators import sadc_validator

@pytest.mark.asyncio
async def test_kyc_workflow_initialization():
    """Test KYC workflow initialization"""
    # Generate test IDs
    user_id = f"test_user_{datetime.now().timestamp()}"
    document_id = f"test_document_{datetime.now().timestamp()}"
    
    # Start workflow
    workflow_id = await kyc_workflow_engine.start_workflow(
        user_id=user_id,
        document_id=document_id
    )
    
    # Check workflow ID format
    assert workflow_id.startswith("kyc_")
    assert user_id in workflow_id
    assert document_id in workflow_id
    
    # Get workflow status
    workflow = await kyc_workflow_engine.get_workflow_status(workflow_id)
    
    # Check workflow state
    assert workflow is not None
    assert workflow.current_state == WorkflowState.INITIALIZED
    assert workflow.user_id == user_id
    assert workflow.document_id == document_id
    assert workflow.audit_trail is not None
    assert len(workflow.audit_trail) > 0

@pytest.mark.asyncio
async def test_sadc_id_validation():
    """Test SADC ID validation"""
    # Test Namibian ID validation
    is_valid, confidence, messages = sadc_validator.validate_id_number("12345678901", "NA")
    assert is_valid is True
    assert confidence > 0.5
    assert len(messages) > 0
    
    # Test South African ID validation
    is_valid, confidence, messages = sadc_validator.validate_id_number("1234567890123", "ZA")
    assert is_valid is True
    assert confidence > 0.5
    assert len(messages) > 0
    
    # Test invalid ID
    is_valid, confidence, messages = sadc_validator.validate_id_number("123", "NA")
    assert is_valid is False
    assert confidence < 0.5
    assert len(messages) > 0

@pytest.mark.asyncio
async def test_bfr_sign_id_generation():
    """Test BFR-SIGN-ID generation"""
    # Test fields
    fields = {
        "id_number": "12345678901",
        "full_name": "John Doe",
        "date_of_birth": "1990-01-01"
    }
    
    # Generate BFR-SIGN-ID
    bfr_sign_id = sadc_validator.generate_bfr_sign_id(fields, "NA")
    
    # Check BFR-SIGN-ID format
    assert bfr_sign_id.startswith("BFR-NA-")
    assert len(bfr_sign_id) > 10

@pytest.mark.asyncio
async def test_name_validation():
    """Test name validation"""
    # Test valid name
    is_valid, confidence, messages = sadc_validator.validate_name("John Doe")
    assert is_valid is True
    assert confidence > 0.5
    assert len(messages) > 0
    
    # Test invalid name (too short)
    is_valid, confidence, messages = sadc_validator.validate_name("Jo")
    assert is_valid is False
    assert confidence < 0.5
    assert len(messages) > 0
    
    # Test invalid name (no last name)
    is_valid, confidence, messages = sadc_validator.validate_name("John")
    assert is_valid is False
    assert confidence < 0.5
    assert len(messages) > 0

@pytest.mark.asyncio
async def test_date_validation():
    """Test date validation"""
    # Test valid date
    is_valid, confidence, messages = sadc_validator.validate_date_of_birth("1990-01-01", "NA")
    assert is_valid is True
    assert confidence > 0.5
    assert len(messages) > 0
    
    # Test invalid date (future)
    future_date = (datetime.now().year + 1).__str__() + "-01-01"
    is_valid, confidence, messages = sadc_validator.validate_date_of_birth(future_date, "NA")
    assert is_valid is False
    assert confidence < 0.5
    assert len(messages) > 0
    
    # Test invalid date (too old)
    is_valid, confidence, messages = sadc_validator.validate_date_of_birth("1800-01-01", "NA")
    assert is_valid is False
    assert confidence < 0.5
    assert len(messages) > 0
