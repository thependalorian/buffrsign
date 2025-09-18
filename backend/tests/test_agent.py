"""
Test suite for BuffrSign AI Agent

This module tests the AI agent functionality with proper environment variable handling
and no hardcoded secrets or credentials.
"""

import os
import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from typing import Dict, Any

# Import the agent module
from agent.agent import BuffrSignAgent
from agent.models import AgentRequest, AgentResponse

# Test configuration - NO HARDCODED SECRETS
@pytest.fixture(scope="session")
def test_config():
    """Get test configuration from environment variables"""
    required_vars = [
        "LLM_API_KEY",
        "EMBEDDING_API_KEY", 
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        pytest.skip(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    return {
        "llm_api_key": os.getenv("LLM_API_KEY"),
        "embedding_api_key": os.getenv("EMBEDDING_API_KEY"),
        "supabase_url": os.getenv("SUPABASE_URL"),
        "supabase_service_key": os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    }

@pytest.fixture
def mock_llm_client():
    """Mock LLM client for testing"""
    mock_client = Mock()
    mock_client.generate_text.return_value = "Mock AI response"
    mock_client.analyze_document.return_value = {
        "compliance_score": 0.95,
        "risk_level": "low",
        "key_clauses": ["clause1", "clause2"]
    }
    return mock_client

@pytest.fixture
def mock_embedding_client():
    """Mock embedding client for testing"""
    mock_client = Mock()
    mock_client.embed_text.return_value = [0.1] * 1536
    mock_client.embed_document.return_value = [0.1] * 1536
    return mock_client

@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client for testing"""
    mock_client = Mock()
    mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value = {
        "data": [],
        "error": None
    }
    return mock_client

@pytest.fixture
def sample_agent_request():
    """Sample agent request for testing"""
    return AgentRequest(
        query="Analyze this document for ETA 2019 compliance",
        document_content="Sample document content",
        user_id="test-user-id",
        session_id="test-session-id"
    )

@pytest.fixture
def buffrsign_agent(test_config, mock_llm_client, mock_embedding_client, mock_supabase_client):
    """Create BuffrSign agent instance for testing"""
    with patch('agent.agent.get_llm_client', return_value=mock_llm_client), \
         patch('agent.agent.get_embedding_client', return_value=mock_embedding_client), \
         patch('agent.agent.get_supabase_client', return_value=mock_supabase_client):
            
            agent = BuffrSignAgent(
            llm_api_key=test_config["llm_api_key"],
            embedding_api_key=test_config["embedding_api_key"],
            supabase_url=test_config["supabase_url"],
            supabase_service_key=test_config["supabase_service_key"]
        )
        return agent

class TestBuffrSignAgent:
    """Test cases for BuffrSignAgent"""
    
    def test_agent_initialization(self, buffrsign_agent):
        """Test agent initialization"""
        assert buffrsign_agent is not None
        assert hasattr(buffrsign_agent, 'llm_client')
        assert hasattr(buffrsign_agent, 'embedding_client')
        assert hasattr(buffrsign_agent, 'supabase_client')
    
    @pytest.mark.asyncio
    async def test_document_analysis(self, buffrsign_agent, sample_agent_request):
        """Test document analysis functionality"""
        response = await buffrsign_agent.analyze_document(sample_agent_request)
        
        assert response is not None
        assert hasattr(response, 'analysis_result')
        assert hasattr(response, 'compliance_score')
        assert hasattr(response, 'recommendations')
    
    @pytest.mark.asyncio
    async def test_compliance_checking(self, buffrsign_agent, sample_agent_request):
        """Test ETA 2019 compliance checking"""
        response = await buffrsign_agent.check_compliance(sample_agent_request)
        
        assert response is not None
        assert hasattr(response, 'is_compliant')
        assert hasattr(response, 'compliance_score')
        assert hasattr(response, 'issues')
        assert hasattr(response, 'recommendations')
    
    @pytest.mark.asyncio
    async def test_template_generation(self, buffrsign_agent):
        """Test AI template generation"""
        template_request = AgentRequest(
            query="Generate an employment contract template",
            document_content="",
            user_id="test-user-id",
            session_id="test-session-id"
        )
        
        response = await buffrsign_agent.generate_template(template_request)
        
        assert response is not None
        assert hasattr(response, 'template_content')
        assert hasattr(response, 'template_fields')
        assert hasattr(response, 'compliance_notes')
    
    @pytest.mark.asyncio
    async def test_signature_validation(self, buffrsign_agent):
        """Test signature validation"""
        signature_data = {
            "signature_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "signer_id": "test-user-id",
            "document_id": "test-doc-id"
        }
        
        response = await buffrsign_agent.validate_signature(signature_data)
        
        assert response is not None
        assert hasattr(response, 'is_valid')
        assert hasattr(response, 'verification_score')
        assert hasattr(response, 'verification_details')
    
    @pytest.mark.asyncio
    async def test_audit_trail_creation(self, buffrsign_agent, sample_agent_request):
        """Test audit trail creation"""
        audit_data = {
            "action": "document_analyzed",
            "user_id": sample_agent_request.user_id,
            "document_id": "test-doc-id",
            "details": {"compliance_score": 0.95}
        }
        
        response = await buffrsign_agent.create_audit_trail(audit_data)
        
        assert response is not None
        assert hasattr(response, 'audit_id')
        assert hasattr(response, 'timestamp')
    
    def test_error_handling_invalid_request(self, buffrsign_agent):
        """Test error handling for invalid requests"""
        with pytest.raises(ValueError):
            buffrsign_agent.validate_request(None)
    
    @pytest.mark.asyncio
    async def test_error_handling_llm_failure(self, buffrsign_agent, sample_agent_request):
        """Test error handling when LLM client fails"""
        # Mock LLM client to raise an exception
        buffrsign_agent.llm_client.analyze_document.side_effect = Exception("LLM service unavailable")
        
        with pytest.raises(Exception):
            await buffrsign_agent.analyze_document(sample_agent_request)
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self, buffrsign_agent):
        """Test handling of concurrent requests"""
        requests = [
            AgentRequest(
                query=f"Analyze document {i}",
                document_content=f"Document content {i}",
                user_id="test-user-id",
                session_id=f"session-{i}"
            )
            for i in range(5)
        ]
        
        # Execute concurrent requests
        tasks = [buffrsign_agent.analyze_document(req) for req in requests]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All requests should complete successfully
        assert len(responses) == 5
        assert all(not isinstance(response, Exception) for response in responses)
    
    def test_agent_configuration_validation(self):
        """Test agent configuration validation"""
        # Test with missing API keys
        with pytest.raises(ValueError):
            BuffrSignAgent(
                llm_api_key="",
                embedding_api_key="",
                supabase_url="https://test.supabase.co",
                supabase_service_key="test-key"
            )
        
        # Test with invalid Supabase URL
        with pytest.raises(ValueError):
            BuffrSignAgent(
                llm_api_key="test-key",
                embedding_api_key="test-key",
                supabase_url="invalid-url",
                supabase_service_key="test-key"
            )

class TestAgentIntegration:
    """Integration tests for agent functionality"""
    
    @pytest.mark.asyncio
    async def test_end_to_end_document_workflow(self, buffrsign_agent):
        """Test complete document workflow"""
        # 1. Document analysis
        analysis_request = AgentRequest(
            query="Analyze this employment contract",
            document_content="This is an employment contract between...",
            user_id="test-user-id",
            session_id="test-session-id"
        )
        
        analysis_response = await buffrsign_agent.analyze_document(analysis_request)
        assert analysis_response.compliance_score > 0
        
        # 2. Compliance checking
        compliance_response = await buffrsign_agent.check_compliance(analysis_request)
        assert hasattr(compliance_response, 'is_compliant')
        
        # 3. Template generation
        template_request = AgentRequest(
            query="Generate a compliant employment contract template",
            document_content="",
            user_id="test-user-id",
            session_id="test-session-id"
        )
        
        template_response = await buffrsign_agent.generate_template(template_request)
        assert template_response.template_content is not None
        
        # 4. Audit trail
        audit_data = {
            "action": "workflow_completed",
            "user_id": "test-user-id",
            "document_id": "test-doc-id",
            "details": {
                "analysis_score": analysis_response.compliance_score,
                "compliance_status": compliance_response.is_compliant
            }
        }
        
        audit_response = await buffrsign_agent.create_audit_trail(audit_data)
        assert audit_response.audit_id is not None

# Performance tests
class TestAgentPerformance:
    """Performance tests for agent functionality"""
    
    @pytest.mark.asyncio
    async def test_large_document_analysis(self, buffrsign_agent):
        """Test analysis of large documents"""
        large_content = "Large document content " * 1000  # ~25KB
        
        request = AgentRequest(
            query="Analyze this large document",
            document_content=large_content,
            user_id="test-user-id",
            session_id="test-session-id"
        )
        
        start_time = asyncio.get_event_loop().time()
        response = await buffrsign_agent.analyze_document(request)
        end_time = asyncio.get_event_loop().time()
        
        # Analysis should complete within reasonable time
        assert end_time - start_time < 30  # 30 seconds max
        assert response is not None
    
    @pytest.mark.asyncio
    async def test_concurrent_large_requests(self, buffrsign_agent):
        """Test concurrent processing of large requests"""
        requests = [
            AgentRequest(
                query=f"Analyze large document {i}",
                document_content=f"Large content {i} " * 500,
                user_id="test-user-id",
                session_id=f"session-{i}"
            )
            for i in range(3)
        ]
        
        start_time = asyncio.get_event_loop().time()
        tasks = [buffrsign_agent.analyze_document(req) for req in requests]
        responses = await asyncio.gather(*tasks)
        end_time = asyncio.get_event_loop().time()
        
        # All requests should complete successfully
        assert len(responses) == 3
        assert all(response is not None for response in responses)
        assert end_time - start_time < 60  # 60 seconds max for 3 concurrent requests
