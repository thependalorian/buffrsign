"""
BuffrSign Workflow Management Service - Microservice
Handles workflow orchestration, templates, and execution for BuffrSign
"""

import os
import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum

import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, status, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, create_engine, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import jwt
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_workflows")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis setup
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = None

# Security
security = HTTPBearer()

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")

# Service configuration
SERVICE_NAME = "workflow-service"
SERVICE_VERSION = "1.0.0"
SERVICE_PORT = int(os.getenv("SERVICE_PORT", 8007))

# Enums
class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"

class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"

class StepType(str, Enum):
    AUTOMATED = "automated"
    HUMAN_APPROVAL = "human_approval"
    CONDITIONAL = "conditional"
    PARALLEL = "parallel"
    SEQUENTIAL = "sequential"

class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"

# Database Models
class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    category = Column(String, nullable=False, index=True)
    version = Column(String, default="1.0")
    status = Column(String, default=WorkflowStatus.DRAFT)
    definition = Column(JSON, nullable=False)  # Workflow definition JSON
    variables = Column(JSON, default=dict)  # Template variables
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    template_id = Column(String, ForeignKey("workflow_templates.id"), nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, default=ExecutionStatus.PENDING)
    current_step = Column(String)
    context = Column(JSON, default=dict)  # Execution context
    variables = Column(JSON, default=dict)  # Runtime variables
    started_by = Column(String, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    execution_id = Column(String, ForeignKey("workflow_executions.id"), nullable=False)
    step_name = Column(String, nullable=False)
    step_type = Column(String, nullable=False)
    status = Column(String, default=ExecutionStatus.PENDING)
    input_data = Column(JSON, default=dict)
    output_data = Column(JSON, default=dict)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkflowApproval(Base):
    __tablename__ = "workflow_approvals"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    execution_id = Column(String, ForeignKey("workflow_executions.id"), nullable=False)
    step_id = Column(String, ForeignKey("workflow_steps.id"), nullable=False)
    approver_id = Column(String, nullable=False)
    status = Column(String, default=ApprovalStatus.PENDING)
    comments = Column(Text)
    approved_at = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkflowEvent(Base):
    __tablename__ = "workflow_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    execution_id = Column(String, ForeignKey("workflow_executions.id"), nullable=False)
    event_type = Column(String, nullable=False)
    event_data = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class WorkflowTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    definition: Dict[str, Any]
    variables: Optional[Dict[str, Any]] = {}

class WorkflowTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[WorkflowStatus] = None
    definition: Optional[Dict[str, Any]] = None
    variables: Optional[Dict[str, Any]] = None

class WorkflowExecutionCreate(BaseModel):
    template_id: str
    name: str
    context: Optional[Dict[str, Any]] = {}
    variables: Optional[Dict[str, Any]] = {}

class WorkflowExecutionResponse(BaseModel):
    id: str
    template_id: str
    name: str
    status: str
    current_step: Optional[str]
    context: Dict[str, Any]
    variables: Dict[str, Any]
    started_by: str
    started_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
    created_at: datetime

class WorkflowStepResponse(BaseModel):
    id: str
    execution_id: str
    step_name: str
    step_type: str
    status: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error_message: Optional[str]
    retry_count: int
    max_retries: int
    created_at: datetime

class WorkflowApprovalRequest(BaseModel):
    execution_id: str
    step_id: str
    approver_id: str
    comments: Optional[str] = None
    expires_at: Optional[datetime] = None

class WorkflowApprovalResponse(BaseModel):
    approval_id: str
    execution_id: str
    step_id: str
    approver_id: str
    status: str
    comments: Optional[str]
    approved_at: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Redis connection
async def connect_redis():
    global redis_client
    try:
        redis_client = redis.from_url(REDIS_URL)
        await redis_client.ping()
        logger.info("✅ Redis connected for workflow service")
    except Exception as e:
        logger.warning(f"⚠️ Redis not available: {e}")
        redis_client = None

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current user from JWT token"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"user_id": user_id, "email": payload.get("email")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"🚀 Starting {SERVICE_NAME} v{SERVICE_VERSION}")
    await connect_redis()
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created/verified")
    
    yield
    
    # Shutdown
    if redis_client:
        await redis_client.close()
    logger.info(f"🛑 {SERVICE_NAME} shutdown complete")

# FastAPI app
app = FastAPI(
    title=f"{SERVICE_NAME.title()}",
    description="Workflow orchestration and management microservice",
    version=SERVICE_VERSION,
    lifespan=lifespan
)

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": SERVICE_NAME,
        "version": SERVICE_VERSION,
        "description": "Workflow orchestration and management",
        "endpoints": {
            "health": "/health",
            "templates": "/api/workflows/templates",
            "executions": "/api/workflows/executions",
            "steps": "/api/workflows/steps",
            "approvals": "/api/workflows/approvals"
        }
    }

# Workflow Template Management
@app.get("/api/workflows/templates")
async def get_workflow_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = None,
    status: Optional[WorkflowStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get workflow templates with filtering"""
    query = db.query(WorkflowTemplate)
    
    if category:
        query = query.filter(WorkflowTemplate.category == category)
    if status:
        query = query.filter(WorkflowTemplate.status == status)
    
    templates = query.offset(skip).limit(limit).all()
    
    return {
        "templates": [
            {
                "id": template.id,
                "name": template.name,
                "description": template.description,
                "category": template.category,
                "version": template.version,
                "status": template.status,
                "variables": template.variables,
                "created_by": template.created_by,
                "created_at": template.created_at,
                "updated_at": template.updated_at
            }
            for template in templates
        ]
    }

@app.post("/api/workflows/templates")
async def create_workflow_template(
    template_data: WorkflowTemplateCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new workflow template"""
    new_template = WorkflowTemplate(
        name=template_data.name,
        description=template_data.description,
        category=template_data.category,
        definition=template_data.definition,
        variables=template_data.variables,
        created_by=current_user["user_id"]
    )
    
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    
    logger.info(f"✅ Workflow template created: {new_template.name}")
    
    return {
        "id": new_template.id,
        "name": new_template.name,
        "description": new_template.description,
        "category": new_template.category,
        "version": new_template.version,
        "status": new_template.status,
        "definition": new_template.definition,
        "variables": new_template.variables,
        "created_by": new_template.created_by,
        "created_at": new_template.created_at
    }

@app.put("/api/workflows/templates/{template_id}")
async def update_workflow_template(
    template_id: str,
    template_data: WorkflowTemplateUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a workflow template"""
    template = db.query(WorkflowTemplate).filter(WorkflowTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow template not found"
        )
    
    # Update fields
    if template_data.name is not None:
        template.name = template_data.name
    if template_data.description is not None:
        template.description = template_data.description
    if template_data.status is not None:
        template.status = template_data.status
    if template_data.definition is not None:
        template.definition = template_data.definition
    if template_data.variables is not None:
        template.variables = template_data.variables
    
    template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(template)
    
    logger.info(f"✅ Workflow template updated: {template.name}")
    
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "category": template.category,
        "version": template.version,
        "status": template.status,
        "definition": template.definition,
        "variables": template.variables,
        "created_by": template.created_by,
        "updated_at": template.updated_at
    }

# Workflow Execution Management
@app.get("/api/workflows/executions", response_model=List[WorkflowExecutionResponse])
async def get_workflow_executions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[ExecutionStatus] = None,
    template_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get workflow executions with filtering"""
    query = db.query(WorkflowExecution)
    
    if status:
        query = query.filter(WorkflowExecution.status == status)
    if template_id:
        query = query.filter(WorkflowExecution.template_id == template_id)
    
    executions = query.order_by(WorkflowExecution.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        WorkflowExecutionResponse(
            id=execution.id,
            template_id=execution.template_id,
            name=execution.name,
            status=execution.status,
            current_step=execution.current_step,
            context=execution.context,
            variables=execution.variables,
            started_by=execution.started_by,
            started_at=execution.started_at,
            completed_at=execution.completed_at,
            error_message=execution.error_message,
            created_at=execution.created_at
        )
        for execution in executions
    ]

@app.post("/api/workflows/executions", response_model=WorkflowExecutionResponse)
async def create_workflow_execution(
    execution_data: WorkflowExecutionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create and start a new workflow execution"""
    # Verify template exists
    template = db.query(WorkflowTemplate).filter(WorkflowTemplate.id == execution_data.template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow template not found"
        )
    
    if template.status != WorkflowStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workflow template is not active"
        )
    
    # Create execution
    new_execution = WorkflowExecution(
        template_id=execution_data.template_id,
        name=execution_data.name,
        context=execution_data.context,
        variables=execution_data.variables,
        started_by=current_user["user_id"]
    )
    
    db.add(new_execution)
    db.commit()
    db.refresh(new_execution)
    
    # Create initial steps from template definition
    await create_workflow_steps(new_execution.id, template.definition, db)
    
    # Start execution
    await start_workflow_execution(new_execution.id, db)
    
    logger.info(f"✅ Workflow execution created: {new_execution.name}")
    
    return WorkflowExecutionResponse(
        id=new_execution.id,
        template_id=new_execution.template_id,
        name=new_execution.name,
        status=new_execution.status,
        current_step=new_execution.current_step,
        context=new_execution.context,
        variables=new_execution.variables,
        started_by=new_execution.started_by,
        started_at=new_execution.started_at,
        completed_at=new_execution.completed_at,
        error_message=new_execution.error_message,
        created_at=new_execution.created_at
    )

# Workflow Step Management
@app.get("/api/workflows/executions/{execution_id}/steps", response_model=List[WorkflowStepResponse])
async def get_workflow_steps(
    execution_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all steps for a workflow execution"""
    steps = db.query(WorkflowStep).filter(WorkflowStep.execution_id == execution_id).all()
    
    return [
        WorkflowStepResponse(
            id=step.id,
            execution_id=step.execution_id,
            step_name=step.step_name,
            step_type=step.step_type,
            status=step.status,
            input_data=step.input_data,
            output_data=step.output_data,
            started_at=step.started_at,
            completed_at=step.completed_at,
            error_message=step.error_message,
            retry_count=step.retry_count,
            max_retries=step.max_retries,
            created_at=step.created_at
        )
        for step in steps
    ]

# Workflow Approval Management
@app.get("/api/workflows/approvals")
async def get_workflow_approvals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    approver_id: Optional[str] = None,
    status: Optional[ApprovalStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get workflow approvals with filtering"""
    query = db.query(WorkflowApproval)
    
    if approver_id:
        query = query.filter(WorkflowApproval.approver_id == approver_id)
    if status:
        query = query.filter(WorkflowApproval.status == status)
    
    approvals = query.order_by(WorkflowApproval.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "approvals": [
            {
                "id": approval.id,
                "execution_id": approval.execution_id,
                "step_id": approval.step_id,
                "approver_id": approval.approver_id,
                "status": approval.status,
                "comments": approval.comments,
                "approved_at": approval.approved_at,
                "expires_at": approval.expires_at,
                "created_at": approval.created_at
            }
            for approval in approvals
        ]
    }

@app.post("/api/workflows/approvals", response_model=WorkflowApprovalResponse)
async def create_workflow_approval(
    approval_data: WorkflowApprovalRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a workflow approval request"""
    # Verify execution and step exist
    execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == approval_data.execution_id).first()
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow execution not found"
        )
    
    step = db.query(WorkflowStep).filter(WorkflowStep.id == approval_data.step_id).first()
    if not step:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow step not found"
        )
    
    new_approval = WorkflowApproval(
        execution_id=approval_data.execution_id,
        step_id=approval_data.step_id,
        approver_id=approval_data.approver_id,
        comments=approval_data.comments,
        expires_at=approval_data.expires_at or datetime.utcnow() + timedelta(days=7)
    )
    
    db.add(new_approval)
    db.commit()
    db.refresh(new_approval)
    
    logger.info(f"✅ Workflow approval created: {new_approval.id}")
    
    return WorkflowApprovalResponse(
        approval_id=new_approval.id,
        execution_id=new_approval.execution_id,
        step_id=new_approval.step_id,
        approver_id=new_approval.approver_id,
        status=new_approval.status,
        comments=new_approval.comments,
        approved_at=new_approval.approved_at,
        expires_at=new_approval.expires_at,
        created_at=new_approval.created_at
    )

@app.post("/api/workflows/approvals/{approval_id}/approve")
async def approve_workflow(
    approval_id: str,
    approved: bool,
    comments: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve or reject a workflow approval"""
    approval = db.query(WorkflowApproval).filter(WorkflowApproval.id == approval_id).first()
    if not approval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow approval not found"
        )
    
    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approval is not pending"
        )
    
    # Update approval
    approval.status = ApprovalStatus.APPROVED if approved else ApprovalStatus.REJECTED
    approval.comments = comments
    approval.approved_at = datetime.utcnow()
    
    db.commit()
    
    # Update workflow step status
    step = db.query(WorkflowStep).filter(WorkflowStep.id == approval.step_id).first()
    if step:
        step.status = ExecutionStatus.COMPLETED if approved else ExecutionStatus.FAILED
        step.completed_at = datetime.utcnow()
        if not approved:
            step.error_message = f"Rejected by {current_user['email']}: {comments}"
        db.commit()
    
    # Continue workflow execution
    if approved:
        await continue_workflow_execution(approval.execution_id, db)
    
    logger.info(f"✅ Workflow approval {'approved' if approved else 'rejected'}: {approval_id}")
    
    return {
        "approval_id": approval.id,
        "status": approval.status,
        "comments": approval.comments,
        "approved_at": approval.approved_at
    }

# Helper functions
async def create_workflow_steps(execution_id: str, definition: Dict[str, Any], db: Session):
    """Create workflow steps from template definition"""
    steps = definition.get("steps", [])
    for step_def in steps:
        step = WorkflowStep(
            execution_id=execution_id,
            step_name=step_def["name"],
            step_type=step_def["type"],
            max_retries=step_def.get("max_retries", 3)
        )
        db.add(step)
    db.commit()

async def start_workflow_execution(execution_id: str, db: Session):
    """Start workflow execution"""
    execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
    if execution:
        execution.status = ExecutionStatus.RUNNING
        execution.started_at = datetime.utcnow()
        db.commit()
        
        # Start first step
        first_step = db.query(WorkflowStep).filter(
            WorkflowStep.execution_id == execution_id
        ).first()
        if first_step:
            first_step.status = ExecutionStatus.RUNNING
            first_step.started_at = datetime.utcnow()
            execution.current_step = first_step.step_name
            db.commit()

async def continue_workflow_execution(execution_id: str, db: Session):
    """Continue workflow execution after step completion"""
    execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
    if not execution:
        return
    
    # Find next step
    current_step = db.query(WorkflowStep).filter(
        WorkflowStep.execution_id == execution_id,
        WorkflowStep.step_name == execution.current_step
    ).first()
    
    if current_step:
        # Find next step in sequence
        next_step = db.query(WorkflowStep).filter(
            WorkflowStep.execution_id == execution_id,
            WorkflowStep.created_at > current_step.created_at
        ).order_by(WorkflowStep.created_at).first()
        
        if next_step:
            next_step.status = ExecutionStatus.RUNNING
            next_step.started_at = datetime.utcnow()
            execution.current_step = next_step.step_name
            db.commit()
        else:
            # No more steps, complete execution
            execution.status = ExecutionStatus.COMPLETED
            execution.completed_at = datetime.utcnow()
            execution.current_step = None
            db.commit()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=True
    )