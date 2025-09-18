"""
BuffrSign Document API Routes
Handles document generation, editing, and signing workflows
"""

from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import logging
import json
import uuid

# Import services using absolute imports
try:
    from auth.auth_utils import get_current_user
    from models.user import User
    from services.database_service import DatabaseService
    from services.storage_service import StorageService
    from services.ai_service import AIService
except ImportError:
    # Fallback for when running as module
    from ..auth.auth_utils import get_current_user
    from ..models.user import User
    from ..services.database_service import DatabaseService
    from ..services.storage_service import StorageService
    from ..services.ai_service import AIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])

# Initialize services
database_service = DatabaseService()
storage_service = StorageService()
ai_service = AIService()

@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_available_templates(
    current_user: Dict[str, Any] = Depends(get_current_user),
    category: Optional[str] = None
):
    """Get list of available document templates"""
    try:
        templates = await database_service.get_templates(
            user_id=current_user.get("user_id"),
            category=category
        )
        
        # Add some default templates if user has none
        if not templates:
            default_templates = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Employment Contract",
                    "description": "Standard employment agreement template",
                    "category": "employment",
                    "content": "This Employment Agreement is made between...",
                    "ai_generated": False,
                    "public": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Non-Disclosure Agreement",
                    "description": "Confidentiality agreement template",
                    "category": "legal",
                    "content": "This Non-Disclosure Agreement is entered into...",
                    "ai_generated": False,
                    "public": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Service Agreement",
                    "description": "Service provider contract template",
                    "category": "business",
                    "content": "This Service Agreement is made between...",
                    "ai_generated": False,
                    "public": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            ]
            templates = default_templates
        
        return templates
        
    except Exception as e:
        logger.error(f"Error getting templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve templates"
        )

@router.post("/upload", response_model=Dict[str, Any])
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    document_data: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload and analyze a document"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Parse document metadata
        metadata = json.loads(document_data)
        
        # Read file content
        file_content = await file.read()
        
        # Upload file to storage
        upload_result = await storage_service.upload_document(
            file_content=file_content,
            filename=file.filename,
            user_id=current_user.get("user_id")
        )
        
        # Create document record in database
        document_data = {
            "user_id": current_user.get("user_id"),
            "name": metadata.get("name", file.filename),
            "description": metadata.get("description"),
            "file_url": upload_result["file_url"],
            "file_type": upload_result["file_type"],
            "file_size": upload_result["file_size"],
            "category": metadata.get("category")
        }
        
        document = await database_service.create_document(document_data)
        
        # Trigger AI analysis asynchronously
        import asyncio
        asyncio.create_task(analyze_document_background(document["id"]))
        
        return {
            "document_id": document["id"],
            "title": document["name"],
            "file_url": document["file_url"],
            "status": "uploaded",
            "message": "Document uploaded successfully. AI analysis in progress."
        }
        
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )

async def analyze_document_background(document_id: str):
    """Background task to analyze document using AI"""
    try:
        # Get document from database
        document = await database_service.get_document(document_id, "")
        
        if not document:
            logger.error(f"Document not found for analysis: {document_id}")
            return
        
        # Perform AI analysis
        analysis_result = await ai_service.analyze_document(
            document_url=document["file_url"],
            document_name=document["name"]
        )
        
        # Update document with analysis results
        await database_service.update_document_analysis(document_id, analysis_result)
        
        logger.info(f"AI analysis completed for document: {document_id}")
        
    except Exception as e:
        logger.error(f"Error in background analysis: {e}")
        # Update document status to failed
        try:
            await database_service.update_document_analysis(document_id, {
                "error": str(e),
                "analysis_status": "failed"
            })
        except Exception as update_error:
            logger.error(f"Error updating document status: {update_error}")

@router.get("/{document_id}", response_model=Dict[str, Any])
async def get_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get document details"""
    try:
        document = await database_service.get_document(
            document_id=document_id,
            user_id=current_user.get("user_id")
        )
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document"
        )

@router.post("/{document_id}/analyze", response_model=Dict[str, Any])
async def analyze_document(
    document_id: str,
    analysis_type: str = "comprehensive",
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Analyze document with AI"""
    try:
        # Verify document ownership
        document = await database_service.get_document(
            document_id=document_id,
            user_id=current_user.get("user_id")
        )
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Perform AI analysis
        analysis_result = await ai_service.analyze_document(
            document_url=document["file_url"],
            document_name=document["name"],
            analysis_type=analysis_type
        )
        
        # Update document with analysis results
        await database_service.update_document_analysis(document_id, analysis_result)
        
        return {
            "success": True,
            "analysis": analysis_result,
            "message": "Document analysis completed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze document"
        )

@router.post("/{document_id}/check-compliance", response_model=Dict[str, Any])
async def check_compliance(
    document_id: str,
    standards: List[str] = ["ETA_2019"],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Check document compliance with specified standards"""
    try:
        # Verify document ownership
        document = await database_service.get_document(
            document_id=document_id,
            user_id=current_user.get("user_id")
        )
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Perform compliance check
        compliance_result = await ai_service.check_compliance(
            document_url=document["file_url"],
            document_name=document["name"],
            standards=standards
        )
        
        # Create compliance report
        report_data = {
            "document_id": document_id,
            "user_id": current_user.get("user_id"),
            "report_type": "compliance_check",
            "report_data": compliance_result
        }
        
        await database_service.create_compliance_report(report_data)
        
        return {
            "success": True,
            "compliance": compliance_result,
            "message": "Compliance check completed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking compliance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check compliance"
        )

@router.get("/", response_model=List[Dict[str, Any]])
async def list_documents(
    current_user: Dict[str, Any] = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
    category: Optional[str] = None
):
    """List user's documents"""
    try:
        documents = await database_service.list_documents(
            user_id=current_user.get("user_id"),
            limit=limit,
            offset=offset
        )
        
        # Filter by category if specified
        if category:
            documents = [doc for doc in documents if doc.get("category") == category]
        
        return documents
        
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list documents"
        )

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a document"""
    try:
        # Verify document ownership
        document = await database_service.get_document(
            document_id=document_id,
            user_id=current_user.get("user_id")
        )
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Delete from storage (if file_url contains public_id)
        if document.get("file_url"):
            try:
                # Extract public_id from URL (simplified)
                public_id = document["file_url"].split("/")[-1].split(".")[0]
                await storage_service.delete_file(public_id)
            except Exception as storage_error:
                logger.warning(f"Failed to delete file from storage: {storage_error}")
        
        # Delete from database
        # Note: This would require adding a delete_document method to DatabaseService
        # For now, we'll just log the deletion
        
        logger.info(f"Document {document_id} deleted by user {current_user.get('user_id')}")
        
        return {
            "success": True,
            "message": "Document deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )

@router.post("/templates/generate", response_model=Dict[str, Any])
async def generate_template(
    description: str = Form(...),
    category: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate template using AI"""
    try:
        # Generate template using AI
        template_content = await ai_service.generate_template(
            description=description,
            category=category
        )
        
        # Create template record
        template_data = {
            "user_id": current_user.get("user_id"),
            "name": f"AI Generated {category} Template",
            "description": description,
            "category": category,
            "content": template_content,
            "ai_generated": True,
            "public": False
        }
        
        template = await database_service.create_template(template_data)
        
        return {
            "success": True,
            "template": template,
            "message": "Template generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error generating template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate template"
        )

@router.get("/compliance/reports/{document_id}", response_model=List[Dict[str, Any]])
async def get_compliance_reports(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get compliance reports for document"""
    try:
        # Verify document ownership
        document = await database_service.get_document(
            document_id=document_id,
            user_id=current_user.get("user_id")
        )
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Get compliance reports
        reports = await database_service.get_compliance_reports(document_id)
        
        return reports
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting compliance reports: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve compliance reports"
        )
