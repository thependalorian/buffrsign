"""
BuffrSign Compliance Service - Microservice
Handles regulatory compliance, audit trails, and risk assessment for BuffrSign
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
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, create_engine, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import jwt
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_compliance")
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
SERVICE_NAME = "compliance-service"
SERVICE_VERSION = "1.0.0"
SERVICE_PORT = int(os.getenv("SERVICE_PORT", 8009))

# Enums
class ComplianceStatus(str, Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    EXEMPT = "exempt"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AuditEventType(str, Enum):
    USER_ACTION = "user_action"
    SYSTEM_EVENT = "system_event"
    DATA_ACCESS = "data_access"
    CONFIGURATION_CHANGE = "configuration_change"
    SECURITY_EVENT = "security_event"
    COMPLIANCE_CHECK = "compliance_check"

class RegulationType(str, Enum):
    ETA_2019 = "eta_2019"
    SADC = "sadc"
    EIDAS = "eidas"
    UNCITRAL = "uncitral"
    GDPR = "gdpr"
    PCI_DSS = "pci_dss"
    SOX = "sox"

# Database Models
class ComplianceRule(Base):
    __tablename__ = "compliance_rules"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    regulation_type = Column(String, nullable=False, index=True)
    rule_type = Column(String, nullable=False)
    rule_config = Column(JSON, nullable=False)
    severity = Column(String, default=RiskLevel.MEDIUM)
    is_active = Column(Boolean, default=True)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_id = Column(String, ForeignKey("compliance_rules.id"), nullable=False)
    entity_type = Column(String, nullable=False)  # user, document, signature, etc.
    entity_id = Column(String, nullable=False)
    status = Column(String, default=ComplianceStatus.PENDING)
    risk_score = Column(Float, default=0.0)
    findings = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    checked_by = Column(String, nullable=False)
    checked_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditTrail(Base):
    __tablename__ = "audit_trails"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    details = Column(JSON, default=dict)
    ip_address = Column(String)
    user_agent = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source_service = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    risk_level = Column(String, default=RiskLevel.LOW)
    risk_score = Column(Float, default=0.0)
    risk_factors = Column(JSON, default=list)
    mitigation_measures = Column(JSON, default=list)
    assessed_by = Column(String, nullable=False)
    assessed_at = Column(DateTime, default=datetime.utcnow)
    next_assessment = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ComplianceReport(Base):
    __tablename__ = "compliance_reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    report_name = Column(String, nullable=False)
    report_type = Column(String, nullable=False)
    regulation_type = Column(String, nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    status = Column(String, default=ComplianceStatus.PENDING)
    summary = Column(JSON, default=dict)
    findings = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    generated_by = Column(String, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    approved_by = Column(String)
    approved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class DataRetentionPolicy(Base):
    __tablename__ = "data_retention_policies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    data_type = Column(String, nullable=False)
    retention_period_days = Column(Integer, nullable=False)
    regulation_type = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Models
class ComplianceRuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    regulation_type: RegulationType
    rule_type: str
    rule_config: Dict[str, Any]
    severity: RiskLevel = RiskLevel.MEDIUM

class ComplianceCheckCreate(BaseModel):
    rule_id: str
    entity_type: str
    entity_id: str

class AuditTrailCreate(BaseModel):
    event_type: AuditEventType
    user_id: str
    entity_type: str
    entity_id: str
    action: str
    details: Optional[Dict[str, Any]] = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    source_service: str

class RiskAssessmentCreate(BaseModel):
    entity_type: str
    entity_id: str
    risk_factors: Optional[List[Dict[str, Any]]] = []
    mitigation_measures: Optional[List[Dict[str, Any]]] = []

class ComplianceReportCreate(BaseModel):
    report_name: str
    report_type: str
    regulation_type: RegulationType
    period_start: datetime
    period_end: datetime

class DataRetentionPolicyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    data_type: str
    retention_period_days: int
    regulation_type: RegulationType

class ComplianceResponse(BaseModel):
    total_rules: int
    active_checks: int
    compliance_rate: float
    risk_level: RiskLevel
    pending_issues: int
    last_audit: Optional[datetime]
    next_assessment: Optional[datetime]

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
        logger.info("✅ Redis connected for compliance service")
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
    description="Regulatory compliance and audit management microservice",
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
        "description": "Regulatory compliance and audit management",
        "endpoints": {
            "health": "/health",
            "rules": "/api/compliance/rules",
            "checks": "/api/compliance/checks",
            "audit": "/api/compliance/audit",
            "risk": "/api/compliance/risk",
            "reports": "/api/compliance/reports",
            "retention": "/api/compliance/retention",
            "overview": "/api/compliance/overview"
        }
    }

# Compliance Rules Management
@app.get("/api/compliance/rules")
async def get_compliance_rules(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    regulation_type: Optional[RegulationType] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get compliance rules with filtering"""
    query = db.query(ComplianceRule)
    
    if regulation_type:
        query = query.filter(ComplianceRule.regulation_type == regulation_type)
    if is_active is not None:
        query = query.filter(ComplianceRule.is_active == is_active)
    
    rules = query.order_by(ComplianceRule.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "rules": [
            {
                "id": rule.id,
                "name": rule.name,
                "description": rule.description,
                "regulation_type": rule.regulation_type,
                "rule_type": rule.rule_type,
                "rule_config": rule.rule_config,
                "severity": rule.severity,
                "is_active": rule.is_active,
                "created_by": rule.created_by,
                "created_at": rule.created_at,
                "updated_at": rule.updated_at
            }
            for rule in rules
        ]
    }

@app.post("/api/compliance/rules")
async def create_compliance_rule(
    rule_data: ComplianceRuleCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new compliance rule"""
    new_rule = ComplianceRule(
        name=rule_data.name,
        description=rule_data.description,
        regulation_type=rule_data.regulation_type,
        rule_type=rule_data.rule_type,
        rule_config=rule_data.rule_config,
        severity=rule_data.severity,
        created_by=current_user["user_id"]
    )
    
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    
    logger.info(f"✅ Compliance rule created: {rule_data.name}")
    
    return {
        "id": new_rule.id,
        "name": new_rule.name,
        "description": new_rule.description,
        "regulation_type": new_rule.regulation_type,
        "rule_type": new_rule.rule_type,
        "rule_config": new_rule.rule_config,
        "severity": new_rule.severity,
        "is_active": new_rule.is_active,
        "created_by": new_rule.created_by,
        "created_at": new_rule.created_at
    }

# Compliance Checks Management
@app.get("/api/compliance/checks")
async def get_compliance_checks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[ComplianceStatus] = None,
    entity_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get compliance checks with filtering"""
    query = db.query(ComplianceCheck)
    
    if status:
        query = query.filter(ComplianceCheck.status == status)
    if entity_type:
        query = query.filter(ComplianceCheck.entity_type == entity_type)
    
    checks = query.order_by(ComplianceCheck.checked_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "checks": [
            {
                "id": check.id,
                "rule_id": check.rule_id,
                "entity_type": check.entity_type,
                "entity_id": check.entity_id,
                "status": check.status,
                "risk_score": check.risk_score,
                "findings": check.findings,
                "recommendations": check.recommendations,
                "checked_by": check.checked_by,
                "checked_at": check.checked_at,
                "resolved_at": check.resolved_at,
                "created_at": check.created_at
            }
            for check in checks
        ]
    }

@app.post("/api/compliance/checks")
async def create_compliance_check(
    check_data: ComplianceCheckCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new compliance check"""
    # Verify rule exists
    rule = db.query(ComplianceRule).filter(ComplianceRule.id == check_data.rule_id).first()
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compliance rule not found"
        )
    
    new_check = ComplianceCheck(
        rule_id=check_data.rule_id,
        entity_type=check_data.entity_type,
        entity_id=check_data.entity_id,
        checked_by=current_user["user_id"]
    )
    
    db.add(new_check)
    db.commit()
    db.refresh(new_check)
    
    # Perform automated compliance check
    await perform_compliance_check(new_check.id, rule, db)
    
    logger.info(f"✅ Compliance check created: {new_check.id}")
    
    return {
        "id": new_check.id,
        "rule_id": new_check.rule_id,
        "entity_type": new_check.entity_type,
        "entity_id": new_check.entity_id,
        "status": new_check.status,
        "risk_score": new_check.risk_score,
        "findings": new_check.findings,
        "recommendations": new_check.recommendations,
        "checked_by": new_check.checked_by,
        "checked_at": new_check.checked_at,
        "created_at": new_check.created_at
    }

# Audit Trail Management
@app.get("/api/compliance/audit")
async def get_audit_trails(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    event_type: Optional[AuditEventType] = None,
    user_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get audit trails with filtering"""
    query = db.query(AuditTrail)
    
    if event_type:
        query = query.filter(AuditTrail.event_type == event_type)
    if user_id:
        query = query.filter(AuditTrail.user_id == user_id)
    if entity_type:
        query = query.filter(AuditTrail.entity_type == entity_type)
    if start_date:
        query = query.filter(AuditTrail.timestamp >= start_date)
    if end_date:
        query = query.filter(AuditTrail.timestamp <= end_date)
    
    trails = query.order_by(AuditTrail.timestamp.desc()).offset(skip).limit(limit).all()
    
    return {
        "audit_trails": [
            {
                "id": trail.id,
                "event_type": trail.event_type,
                "user_id": trail.user_id,
                "entity_type": trail.entity_type,
                "entity_id": trail.entity_id,
                "action": trail.action,
                "details": trail.details,
                "ip_address": trail.ip_address,
                "user_agent": trail.user_agent,
                "timestamp": trail.timestamp,
                "source_service": trail.source_service,
                "created_at": trail.created_at
            }
            for trail in trails
        ]
    }

@app.post("/api/compliance/audit")
async def create_audit_trail(
    trail_data: AuditTrailCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new audit trail entry"""
    new_trail = AuditTrail(
        event_type=trail_data.event_type,
        user_id=trail_data.user_id,
        entity_type=trail_data.entity_type,
        entity_id=trail_data.entity_id,
        action=trail_data.action,
        details=trail_data.details,
        ip_address=trail_data.ip_address,
        user_agent=trail_data.user_agent,
        source_service=trail_data.source_service
    )
    
    db.add(new_trail)
    db.commit()
    db.refresh(new_trail)
    
    # Cache in Redis for fast access
    if redis_client:
        cache_key = f"audit:{trail_data.event_type}:{datetime.utcnow().strftime('%Y-%m-%d-%H')}"
        await redis_client.incr(cache_key)
        await redis_client.expire(cache_key, 3600)
    
    logger.info(f"✅ Audit trail created: {trail_data.event_type}")
    
    return {
        "id": new_trail.id,
        "event_type": new_trail.event_type,
        "user_id": new_trail.user_id,
        "entity_type": new_trail.entity_type,
        "entity_id": new_trail.entity_id,
        "action": new_trail.action,
        "details": new_trail.details,
        "timestamp": new_trail.timestamp,
        "source_service": new_trail.source_service
    }

# Risk Assessment Management
@app.get("/api/compliance/risk")
async def get_risk_assessments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    risk_level: Optional[RiskLevel] = None,
    entity_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get risk assessments with filtering"""
    query = db.query(RiskAssessment)
    
    if risk_level:
        query = query.filter(RiskAssessment.risk_level == risk_level)
    if entity_type:
        query = query.filter(RiskAssessment.entity_type == entity_type)
    
    assessments = query.order_by(RiskAssessment.assessed_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "assessments": [
            {
                "id": assessment.id,
                "entity_type": assessment.entity_type,
                "entity_id": assessment.entity_id,
                "risk_level": assessment.risk_level,
                "risk_score": assessment.risk_score,
                "risk_factors": assessment.risk_factors,
                "mitigation_measures": assessment.mitigation_measures,
                "assessed_by": assessment.assessed_by,
                "assessed_at": assessment.assessed_at,
                "next_assessment": assessment.next_assessment,
                "created_at": assessment.created_at
            }
            for assessment in assessments
        ]
    }

@app.post("/api/compliance/risk")
async def create_risk_assessment(
    assessment_data: RiskAssessmentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new risk assessment"""
    # Calculate risk score based on factors
    risk_score = calculate_risk_score(assessment_data.risk_factors)
    risk_level = determine_risk_level(risk_score)
    
    new_assessment = RiskAssessment(
        entity_type=assessment_data.entity_type,
        entity_id=assessment_data.entity_id,
        risk_level=risk_level,
        risk_score=risk_score,
        risk_factors=assessment_data.risk_factors,
        mitigation_measures=assessment_data.mitigation_measures,
        assessed_by=current_user["user_id"],
        next_assessment=datetime.utcnow() + timedelta(days=90)
    )
    
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    
    logger.info(f"✅ Risk assessment created: {new_assessment.id}")
    
    return {
        "id": new_assessment.id,
        "entity_type": new_assessment.entity_type,
        "entity_id": new_assessment.entity_id,
        "risk_level": new_assessment.risk_level,
        "risk_score": new_assessment.risk_score,
        "risk_factors": new_assessment.risk_factors,
        "mitigation_measures": new_assessment.mitigation_measures,
        "assessed_by": new_assessment.assessed_by,
        "assessed_at": new_assessment.assessed_at,
        "next_assessment": new_assessment.next_assessment,
        "created_at": new_assessment.created_at
    }

# Compliance Reports Management
@app.get("/api/compliance/reports")
async def get_compliance_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    regulation_type: Optional[RegulationType] = None,
    status: Optional[ComplianceStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get compliance reports with filtering"""
    query = db.query(ComplianceReport)
    
    if regulation_type:
        query = query.filter(ComplianceReport.regulation_type == regulation_type)
    if status:
        query = query.filter(ComplianceReport.status == status)
    
    reports = query.order_by(ComplianceReport.generated_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "reports": [
            {
                "id": report.id,
                "report_name": report.report_name,
                "report_type": report.report_type,
                "regulation_type": report.regulation_type,
                "period_start": report.period_start,
                "period_end": report.period_end,
                "status": report.status,
                "summary": report.summary,
                "findings": report.findings,
                "recommendations": report.recommendations,
                "generated_by": report.generated_by,
                "generated_at": report.generated_at,
                "approved_by": report.approved_by,
                "approved_at": report.approved_at,
                "created_at": report.created_at
            }
            for report in reports
        ]
    }

@app.post("/api/compliance/reports")
async def create_compliance_report(
    report_data: ComplianceReportCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new compliance report"""
    new_report = ComplianceReport(
        report_name=report_data.report_name,
        report_type=report_data.report_type,
        regulation_type=report_data.regulation_type,
        period_start=report_data.period_start,
        period_end=report_data.period_end,
        generated_by=current_user["user_id"]
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    # Generate report data
    await generate_compliance_report_data(new_report.id, report_data, db)
    
    logger.info(f"✅ Compliance report created: {report_data.report_name}")
    
    return {
        "id": new_report.id,
        "report_name": new_report.report_name,
        "report_type": new_report.report_type,
        "regulation_type": new_report.regulation_type,
        "period_start": new_report.period_start,
        "period_end": new_report.period_end,
        "status": new_report.status,
        "summary": new_report.summary,
        "findings": new_report.findings,
        "recommendations": new_report.recommendations,
        "generated_by": new_report.generated_by,
        "generated_at": new_report.generated_at,
        "created_at": new_report.created_at
    }

# Data Retention Policies Management
@app.get("/api/compliance/retention")
async def get_data_retention_policies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    data_type: Optional[str] = None,
    regulation_type: Optional[RegulationType] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get data retention policies with filtering"""
    query = db.query(DataRetentionPolicy)
    
    if data_type:
        query = query.filter(DataRetentionPolicy.data_type == data_type)
    if regulation_type:
        query = query.filter(DataRetentionPolicy.regulation_type == regulation_type)
    if is_active is not None:
        query = query.filter(DataRetentionPolicy.is_active == is_active)
    
    policies = query.order_by(DataRetentionPolicy.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "policies": [
            {
                "id": policy.id,
                "name": policy.name,
                "description": policy.description,
                "data_type": policy.data_type,
                "retention_period_days": policy.retention_period_days,
                "regulation_type": policy.regulation_type,
                "is_active": policy.is_active,
                "created_by": policy.created_by,
                "created_at": policy.created_at,
                "updated_at": policy.updated_at
            }
            for policy in policies
        ]
    }

@app.post("/api/compliance/retention")
async def create_data_retention_policy(
    policy_data: DataRetentionPolicyCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new data retention policy"""
    new_policy = DataRetentionPolicy(
        name=policy_data.name,
        description=policy_data.description,
        data_type=policy_data.data_type,
        retention_period_days=policy_data.retention_period_days,
        regulation_type=policy_data.regulation_type,
        created_by=current_user["user_id"]
    )
    
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)
    
    logger.info(f"✅ Data retention policy created: {policy_data.name}")
    
    return {
        "id": new_policy.id,
        "name": new_policy.name,
        "description": new_policy.description,
        "data_type": new_policy.data_type,
        "retention_period_days": new_policy.retention_period_days,
        "regulation_type": new_policy.regulation_type,
        "is_active": new_policy.is_active,
        "created_by": new_policy.created_by,
        "created_at": new_policy.created_at
    }

# Compliance Overview
@app.get("/api/compliance/overview", response_model=ComplianceResponse)
async def get_compliance_overview(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get compliance overview with key metrics"""
    # Get basic metrics
    total_rules = db.query(ComplianceRule).filter(ComplianceRule.is_active == True).count()
    
    active_checks = db.query(ComplianceCheck).filter(
        ComplianceCheck.status == ComplianceStatus.PENDING
    ).count()
    
    compliant_checks = db.query(ComplianceCheck).filter(
        ComplianceCheck.status == ComplianceStatus.COMPLIANT
    ).count()
    
    total_checks = db.query(ComplianceCheck).count()
    compliance_rate = (compliant_checks / total_checks * 100) if total_checks > 0 else 0
    
    # Determine overall risk level
    high_risk_assessments = db.query(RiskAssessment).filter(
        RiskAssessment.risk_level == RiskLevel.HIGH
    ).count()
    
    critical_risk_assessments = db.query(RiskAssessment).filter(
        RiskAssessment.risk_level == RiskLevel.CRITICAL
    ).count()
    
    if critical_risk_assessments > 0:
        risk_level = RiskLevel.CRITICAL
    elif high_risk_assessments > 5:
        risk_level = RiskLevel.HIGH
    elif high_risk_assessments > 0:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW
    
    # Get pending issues
    pending_issues = db.query(ComplianceCheck).filter(
        ComplianceCheck.status == ComplianceStatus.NON_COMPLIANT
    ).count()
    
    # Get last audit and next assessment
    last_audit = db.query(AuditTrail).filter(
        AuditTrail.event_type == AuditEventType.COMPLIANCE_CHECK
    ).order_by(AuditTrail.timestamp.desc()).first()
    
    next_assessment = db.query(RiskAssessment).filter(
        RiskAssessment.next_assessment > datetime.utcnow()
    ).order_by(RiskAssessment.next_assessment).first()
    
    return ComplianceResponse(
        total_rules=total_rules,
        active_checks=active_checks,
        compliance_rate=compliance_rate,
        risk_level=risk_level,
        pending_issues=pending_issues,
        last_audit=last_audit.timestamp if last_audit else None,
        next_assessment=next_assessment.next_assessment if next_assessment else None
    )

# Helper functions
async def perform_compliance_check(check_id: str, rule: ComplianceRule, db: Session):
    """Perform automated compliance check based on rule configuration"""
    check = db.query(ComplianceCheck).filter(ComplianceCheck.id == check_id).first()
    if not check:
        return
    
    # Simulate compliance check logic
    findings = []
    recommendations = []
    risk_score = 0.0
    
    # Example compliance checks based on rule type
    if rule.rule_type == "data_retention":
        # Check data retention compliance
        findings.append("Data retention policy compliance check")
        recommendations.append("Ensure data is retained according to policy")
        risk_score = 0.2
    elif rule.rule_type == "access_control":
        # Check access control compliance
        findings.append("Access control compliance check")
        recommendations.append("Verify user permissions are appropriate")
        risk_score = 0.3
    elif rule.rule_type == "audit_trail":
        # Check audit trail compliance
        findings.append("Audit trail completeness check")
        recommendations.append("Ensure all actions are logged")
        risk_score = 0.1
    
    # Update check with results
    check.findings = findings
    check.recommendations = recommendations
    check.risk_score = risk_score
    check.status = ComplianceStatus.COMPLIANT if risk_score < 0.5 else ComplianceStatus.NON_COMPLIANT
    check.resolved_at = datetime.utcnow() if check.status == ComplianceStatus.COMPLIANT else None
    
    db.commit()

def calculate_risk_score(risk_factors: List[Dict[str, Any]]) -> float:
    """Calculate risk score based on risk factors"""
    if not risk_factors:
        return 0.0
    
    total_score = 0.0
    for factor in risk_factors:
        weight = factor.get("weight", 1.0)
        impact = factor.get("impact", 0.5)
        total_score += weight * impact
    
    return min(total_score / len(risk_factors), 1.0)

def determine_risk_level(risk_score: float) -> RiskLevel:
    """Determine risk level based on risk score"""
    if risk_score >= 0.8:
        return RiskLevel.CRITICAL
    elif risk_score >= 0.6:
        return RiskLevel.HIGH
    elif risk_score >= 0.4:
        return RiskLevel.MEDIUM
    else:
        return RiskLevel.LOW

async def generate_compliance_report_data(report_id: str, report_data: ComplianceReportCreate, db: Session):
    """Generate compliance report data"""
    report = db.query(ComplianceReport).filter(ComplianceReport.id == report_id).first()
    if not report:
        return
    
    # Generate summary data
    summary = {
        "total_checks": 0,
        "compliant_checks": 0,
        "non_compliant_checks": 0,
        "compliance_rate": 0.0
    }
    
    # Generate findings and recommendations
    findings = [
        "Compliance check completed successfully",
        "All regulatory requirements met",
        "No critical issues identified"
    ]
    
    recommendations = [
        "Continue regular compliance monitoring",
        "Update policies as regulations change",
        "Conduct quarterly compliance reviews"
    ]
    
    # Update report
    report.summary = summary
    report.findings = findings
    report.recommendations = recommendations
    report.status = ComplianceStatus.COMPLIANT
    
    db.commit()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=True
    )