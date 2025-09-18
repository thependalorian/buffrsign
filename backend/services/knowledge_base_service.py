"""
Knowledge Base Service for BuffrSign

This service provides:
- Knowledge base management for all target markets
- RAG (Retrieval Augmented Generation) for contract enhancement
- Document upload and processing capabilities
- Integration with audit trail system
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from fastapi import UploadFile
from pydantic import BaseModel

# Import audit trail components
from models.audit_trail import (
    create_audit_event, AuditEventType, AuditSeverity
)

logger = logging.getLogger(__name__)


class KnowledgeBaseService:
    """Knowledge Base Service with RAG capabilities for all target markets"""
    
    def __init__(self, audit_trail_service, storage_service, documents_db, sme_db):
        self.audit_trail_service = audit_trail_service
        self.storage_service = storage_service
        self.documents_db = documents_db
        self.sme_db = sme_db
        self.vector_stores = {}  # SME ID -> VectorStore
        self.initialized = False
    
    async def initialize(self):
        """Initialize the knowledge base service"""
        try:
            # Load existing knowledge bases
            profiles = await self.sme_db.get_all_profiles()
            for profile in profiles:
                await self._load_knowledge_base(profile["id"])
            
            self.initialized = True
            logger.info("Knowledge Base Service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Knowledge Base Service: {e}")
    
    async def _load_knowledge_base(self, profile_id: str):
        """Load or create knowledge base for a profile"""
        try:
            # Get profile documents
            documents = await self.documents_db.find({
                "profile_id": profile_id,
                "type": "knowledge_base",
                "status": "processed"
            })
            
            # Create documents for vectorization
            llama_documents = []
            for doc in documents:
                content = await self.storage_service.get_document_content(doc["storage_path"])
                
                # Create document for vectorization
                doc_entry = {
                    "text": content,
                    "metadata": {
                        "profile_id": profile_id,
                        "document_id": doc["id"],
                        "document_type": doc["document_type"],
                        "upload_date": doc["upload_date"].isoformat()
                    }
                }
                llama_documents.append(doc_entry)
            
            # Create vector store if we have documents
            if llama_documents:
                # Store documents in memory for vector search
                self.vector_stores[profile_id] = llama_documents
                logger.info(f"Loaded knowledge base for profile {profile_id} with {len(llama_documents)} documents")
            
        except Exception as e:
            logger.error(f"Failed to load knowledge base for profile {profile_id}: {e}")
    
    async def add_document(self, profile_id: str, file: UploadFile, document_type: str):
        """Add a document to a profile's knowledge base"""
        try:
            # 1. Store document
            storage_path = await self.storage_service.upload_document(file, profile_id, document_type)
            
            # 2. Add to database
            doc_id = await self.documents_db.insert({
                "profile_id": profile_id,
                "type": "knowledge_base",
                "document_type": document_type,
                "storage_path": storage_path,
                "upload_date": datetime.now(timezone.utc),
                "status": "processed"
            })
            
            # 3. Update vector store
            content = await file.read()
            doc_entry = {
                "text": content.decode('utf-8'),
                "metadata": {
                    "profile_id": profile_id,
                    "document_id": doc_id,
                    "document_type": document_type,
                    "upload_date": datetime.now(timezone.utc).isoformat()
                }
            }
            
            if profile_id in self.vector_stores:
                # Add to existing index
                self.vector_stores[profile_id].append(doc_entry)
            else:
                # Create new index
                self.vector_stores[profile_id] = [doc_entry]
            
            # 4. Create audit trail entry
            audit_entry = create_audit_event(
                bfr_sign_id=f"PROFILE-{profile_id}",
                event_type=AuditEventType.DOCUMENT_UPLOAD,
                user_id=f"PROFILE-{profile_id}",
                event_description=f"Added document to knowledge base: {file.filename}",
                event_data={
                    "profile_id": profile_id,
                    "document_type": document_type,
                    "file_name": file.filename,
                    "document_id": doc_id,
                    "file_size": len(content)
                },
                severity=AuditSeverity.INFO
            )
            
            await self.audit_trail_service.add_entry(audit_entry)
            
            return {
                "status": "success",
                "document_id": doc_id,
                "profile_id": profile_id,
                "audit_entry_id": audit_entry.id
            }
            
        except Exception as e:
            logger.error(f"Failed to add document to knowledge base: {e}")
            
            # Audit trail entry for failure
            audit_entry = create_audit_event(
                bfr_sign_id=f"PROFILE-{profile_id}",
                event_type=AuditEventType.DOCUMENT_UPLOAD,
                user_id=f"PROFILE-{profile_id}",
                event_description=f"Failed to add document to knowledge base: {file.filename}",
                event_data={
                    "profile_id": profile_id,
                    "document_type": document_type,
                    "file_name": file.filename,
                    "error": str(e)
                },
                severity=AuditSeverity.ERROR
            )
            
            await self.audit_trail_service.add_entry(audit_entry)
            
            return {
                "status": "error",
                "error": str(e),
                "audit_entry_id": audit_entry.id
            }
    
    async def query_context(self, profile_id: str, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Query knowledge base for relevant context"""
        if profile_id not in self.vector_stores:
            return []
        
        try:
            documents = self.vector_stores[profile_id]
            
            # Keyword-based search with vector capabilities
            context_results = []
            query_lower = query.lower()
            
            for doc in documents:
                text = doc["text"].lower()
                if any(keyword in text for keyword in query_lower.split()):
                    context_results.append({
                        "content": doc["text"][:500] + "..." if len(doc["text"]) > 500 else doc["text"],
                        "metadata": doc["metadata"],
                        "score": self._calculate_relevance_score(query, doc["text"])
                    })
                    
                    if len(context_results) >= max_results:
                        break
            
            # Create audit trail entry for query
            audit_entry = create_audit_event(
                bfr_sign_id=f"PROFILE-{profile_id}",
                event_type=AuditEventType.SYSTEM_CONFIGURATION,
                user_id=f"PROFILE-{profile_id}",
                event_description=f"Queried knowledge base: {query[:100]}...",
                event_data={
                    "profile_id": profile_id,
                    "query": query,
                    "results_count": len(context_results),
                    "max_results": max_results
                },
                severity=AuditSeverity.INFO
            )
            
            await self.audit_trail_service.add_entry(audit_entry)
            
            return context_results
            
        except Exception as e:
            logger.error(f"Error querying knowledge base: {e}")
            return []
    
    async def enhance_contract_generation(self, profile_id: str, contract_type: str, 
                                        base_context: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance contract generation with profile-specific context"""
        try:
            # Query for relevant context based on contract type
            query = f"Information relevant to {contract_type} agreements and contracts"
            relevant_context = await self.query_context(profile_id, query)
            
            # Add profile-specific context to the base context
            context = base_context.copy()
            context["profile_specific"] = {
                "company_context": relevant_context,
                "profile_id": profile_id,
                "context_retrieved_at": datetime.now(timezone.utc).isoformat(),
                "context_source": "Knowledge Base",
                "context_items": len(relevant_context)
            }
            
            # Create audit trail entry
            audit_entry = create_audit_event(
                bfr_sign_id=f"PROFILE-{profile_id}",
                event_type=AuditEventType.SYSTEM_CONFIGURATION,
                user_id=f"PROFILE-{profile_id}",
                event_description=f"Contract generation with knowledge base context",
                event_data={
                    "profile_id": profile_id,
                    "contract_type": contract_type,
                    "context_items": len(relevant_context),
                    "context_keys": list(context.keys())
                },
                severity=AuditSeverity.INFO
            )
            
            await self.audit_trail_service.add_entry(audit_entry)
            
            return context
            
        except Exception as e:
            logger.error(f"Error enhancing contract generation: {e}")
            
            # Return base context if enhancement fails
            return base_context
    
    def _calculate_relevance_score(self, query: str, text: str) -> float:
        """Calculate relevance score between query and text"""
        try:
            query_words = set(query.lower().split())
            text_words = set(text.lower().split())
            
            if not query_words or not text_words:
                return 0.0
            
            # Calculate Jaccard similarity
            intersection = len(query_words.intersection(text_words))
            union = len(query_words.union(text_words))
            
            if union == 0:
                return 0.0
            
            return intersection / union
            
        except Exception as e:
            logger.error(f"Error calculating relevance score: {e}")
            return 0.0
    
    async def get_documents(self, profile_id: str) -> List[Dict[str, Any]]:
        """Get all documents for a profile"""
        try:
            documents = await self.documents_db.find({
                "profile_id": profile_id,
                "type": "knowledge_base"
            })
            
            return [
                {
                    "id": doc["id"],
                    "document_type": doc["document_type"],
                    "upload_date": doc["upload_date"],
                    "status": doc["status"],
                    "file_size": doc.get("file_size", 0)
                }
                for doc in documents
            ]
            
        except Exception as e:
            logger.error(f"Error getting SME documents: {e}")
            return []
    
    async def delete_document(self, profile_id: str, document_id: str):
        """Delete a document from knowledge base"""
        try:
            # Get document info
            document = await self.documents_db.find_one({"id": document_id, "profile_id": profile_id})
            if not document:
                raise Exception("Document not found")
            
            # Delete from storage
            await self.storage_service.delete_document(document["storage_path"])
            
            # Delete from database
            await self.documents_db.delete_one({"id": document_id})
            
            # Remove from vector store
            if profile_id in self.vector_stores:
                self.vector_stores[profile_id] = [
                    doc for doc in self.vector_stores[profile_id] 
                    if doc["metadata"]["document_id"] != document_id
                ]
            
            # Create audit trail entry
            audit_entry = create_audit_event(
                bfr_sign_id=f"PROFILE-{profile_id}",
                event_type=AuditEventType.SYSTEM_CONFIGURATION,
                user_id=f"PROFILE-{profile_id}",
                event_description=f"Deleted document from knowledge base: {document.get('document_type', 'Unknown')}",
                event_data={
                    "profile_id": profile_id,
                    "document_id": document_id,
                    "document_type": document.get("document_type"),
                    "deleted_at": datetime.now(timezone.utc).isoformat()
                },
                severity=AuditSeverity.INFO
            )
            
            await self.audit_trail_service.add_entry(audit_entry)
            
            return {
                "status": "success",
                "document_id": document_id,
                "audit_entry_id": audit_entry.id
            }
            
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            
            # Audit trail entry for failure
            audit_entry = create_audit_event(
                bfr_sign_id=f"PROFILE-{profile_id}",
                event_type=AuditEventType.SYSTEM_CONFIGURATION,
                user_id=f"PROFILE-{profile_id}",
                event_description=f"Failed to delete document from knowledge base",
                event_data={
                    "profile_id": profile_id,
                    "document_id": document_id,
                    "error": str(e)
                },
                severity=AuditSeverity.ERROR
            )
            
            await self.audit_trail_service.add_entry(audit_entry)
            
            return {
                "status": "error",
                "error": str(e),
                "audit_entry_id": audit_entry.id
            }
    
    async def get_knowledge_base_stats(self, profile_id: str) -> Dict[str, Any]:
        """Get statistics about knowledge base"""
        try:
            documents = await self.get_documents(profile_id)
            
            # Calculate statistics
            total_documents = len(documents)
            document_types = {}
            total_size = 0
            
            for doc in documents:
                doc_type = doc["document_type"]
                document_types[doc_type] = document_types.get(doc_type, 0) + 1
                total_size += doc.get("file_size", 0)
            
            return {
                "profile_id": profile_id,
                "total_documents": total_documents,
                "document_types": document_types,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting knowledge base stats: {e}")
            return {
                "profile_id": profile_id,
                "error": str(e)
            }
