import pytest
from src.workflow import MultiPartyWorkflow

def test_add_party():
    workflow = MultiPartyWorkflow(document_id="doc1", initiator_id="user1")
    workflow.add_party(email="test@example.com", role="signer")
    assert len(workflow.parties) == 1
    assert workflow.parties[0]["email"] == "test@example.com"
    assert workflow.parties[0]["role"] == "signer"
    assert workflow.parties[0]["status"] == "pending"
