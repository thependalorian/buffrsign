"""
BuffrSign Analytics Service - Microservice
Handles business intelligence, reporting, and analytics for BuffrSign
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
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/buffrsign_analytics")
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
SERVICE_NAME = "analytics-service"
SERVICE_VERSION = "1.0.0"
SERVICE_PORT = int(os.getenv("SERVICE_PORT", 8008))

# Enums
class MetricType(str, Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    SUMMARY = "summary"

class ReportType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"
    CUSTOM = "custom"

class DashboardType(str, Enum):
    EXECUTIVE = "executive"
    OPERATIONAL = "operational"
    TECHNICAL = "technical"
    CUSTOM = "custom"

# Database Models
class AnalyticsMetric(Base):
    __tablename__ = "analytics_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    metric_name = Column(String, nullable=False, index=True)
    metric_type = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    labels = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source_service = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AnalyticsReport(Base):
    __tablename__ = "analytics_reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    report_type = Column(String, nullable=False)
    query_config = Column(JSON, nullable=False)
    schedule_config = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_by = Column(String, nullable=False)
    last_run = Column(DateTime)
    next_run = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AnalyticsDashboard(Base):
    __tablename__ = "analytics_dashboards"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    dashboard_type = Column(String, nullable=False)
    layout_config = Column(JSON, nullable=False)
    widgets = Column(JSON, default=list)
    is_public = Column(Boolean, default=False)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AnalyticsWidget(Base):
    __tablename__ = "analytics_widgets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    widget_type = Column(String, nullable=False)
    data_source = Column(String, nullable=False)
    query_config = Column(JSON, nullable=False)
    visualization_config = Column(JSON, default=dict)
    refresh_interval = Column(Integer, default=300)  # seconds
    is_active = Column(Boolean, default=True)
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_name = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    session_id = Column(String, nullable=False, index=True)
    properties = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source_service = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AnalyticsKPI(Base):
    __tablename__ = "analytics_kpis"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    metric_name = Column(String, nullable=False)
    target_value = Column(Float)
    current_value = Column(Float)
    unit = Column(String, default="")
    trend = Column(String, default="stable")  # up, down, stable
    status = Column(String, default="normal")  # normal, warning, critical
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class MetricCreate(BaseModel):
    metric_name: str
    metric_type: MetricType
    value: float
    labels: Optional[Dict[str, str]] = {}
    source_service: str

class MetricQuery(BaseModel):
    metric_name: Optional[str] = None
    source_service: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    labels: Optional[Dict[str, str]] = {}

class ReportCreate(BaseModel):
    name: str
    description: Optional[str] = None
    report_type: ReportType
    query_config: Dict[str, Any]
    schedule_config: Optional[Dict[str, Any]] = {}

class DashboardCreate(BaseModel):
    name: str
    description: Optional[str] = None
    dashboard_type: DashboardType
    layout_config: Dict[str, Any]
    widgets: Optional[List[str]] = []
    is_public: bool = False

class WidgetCreate(BaseModel):
    name: str
    widget_type: str
    data_source: str
    query_config: Dict[str, Any]
    visualization_config: Optional[Dict[str, Any]] = {}
    refresh_interval: int = 300

class EventCreate(BaseModel):
    event_name: str
    user_id: str
    session_id: str
    properties: Optional[Dict[str, Any]] = {}
    source_service: str

class KPICreate(BaseModel):
    name: str
    description: Optional[str] = None
    metric_name: str
    target_value: Optional[float] = None
    unit: str = ""

class AnalyticsResponse(BaseModel):
    total_users: int
    active_sessions: int
    documents_processed: int
    signatures_completed: int
    workflow_executions: int
    system_uptime: float
    error_rate: float
    response_time_avg: float
    revenue: float
    conversion_rate: float

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
        logger.info("✅ Redis connected for analytics service")
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
    description="Business intelligence and analytics microservice",
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
        "description": "Business intelligence and analytics",
        "endpoints": {
            "health": "/health",
            "metrics": "/api/analytics/metrics",
            "reports": "/api/analytics/reports",
            "dashboards": "/api/analytics/dashboards",
            "widgets": "/api/analytics/widgets",
            "events": "/api/analytics/events",
            "kpis": "/api/analytics/kpis",
            "overview": "/api/analytics/overview"
        }
    }

# Metrics Management
@app.post("/api/analytics/metrics")
async def create_metric(
    metric_data: MetricCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new analytics metric"""
    new_metric = AnalyticsMetric(
        metric_name=metric_data.metric_name,
        metric_type=metric_data.metric_type,
        value=metric_data.value,
        labels=metric_data.labels,
        source_service=metric_data.source_service
    )
    
    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)
    
    # Cache in Redis for fast access
    if redis_client:
        cache_key = f"metric:{metric_data.metric_name}:{datetime.utcnow().strftime('%Y-%m-%d-%H')}"
        await redis_client.setex(cache_key, 3600, str(new_metric.value))
    
    logger.info(f"✅ Metric created: {metric_data.metric_name}")
    
    return {
        "id": new_metric.id,
        "metric_name": new_metric.metric_name,
        "metric_type": new_metric.metric_type,
        "value": new_metric.value,
        "labels": new_metric.labels,
        "timestamp": new_metric.timestamp,
        "source_service": new_metric.source_service
    }

@app.get("/api/analytics/metrics")
async def get_metrics(
    query: MetricQuery = Depends(),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics metrics with filtering"""
    query_obj = db.query(AnalyticsMetric)
    
    if query.metric_name:
        query_obj = query_obj.filter(AnalyticsMetric.metric_name == query.metric_name)
    if query.source_service:
        query_obj = query_obj.filter(AnalyticsMetric.source_service == query.source_service)
    if query.start_time:
        query_obj = query_obj.filter(AnalyticsMetric.timestamp >= query.start_time)
    if query.end_time:
        query_obj = query_obj.filter(AnalyticsMetric.timestamp <= query.end_time)
    
    metrics = query_obj.order_by(AnalyticsMetric.timestamp.desc()).offset(skip).limit(limit).all()
    
    return {
        "metrics": [
            {
                "id": metric.id,
                "metric_name": metric.metric_name,
                "metric_type": metric.metric_type,
                "value": metric.value,
                "labels": metric.labels,
                "timestamp": metric.timestamp,
                "source_service": metric.source_service
            }
            for metric in metrics
        ]
    }

# Reports Management
@app.get("/api/analytics/reports")
async def get_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    report_type: Optional[ReportType] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics reports with filtering"""
    query = db.query(AnalyticsReport)
    
    if report_type:
        query = query.filter(AnalyticsReport.report_type == report_type)
    if is_active is not None:
        query = query.filter(AnalyticsReport.is_active == is_active)
    
    reports = query.order_by(AnalyticsReport.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "reports": [
            {
                "id": report.id,
                "name": report.name,
                "description": report.description,
                "report_type": report.report_type,
                "query_config": report.query_config,
                "schedule_config": report.schedule_config,
                "is_active": report.is_active,
                "created_by": report.created_by,
                "last_run": report.last_run,
                "next_run": report.next_run,
                "created_at": report.created_at
            }
            for report in reports
        ]
    }

@app.post("/api/analytics/reports")
async def create_report(
    report_data: ReportCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new analytics report"""
    new_report = AnalyticsReport(
        name=report_data.name,
        description=report_data.description,
        report_type=report_data.report_type,
        query_config=report_data.query_config,
        schedule_config=report_data.schedule_config,
        created_by=current_user["user_id"]
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    logger.info(f"✅ Report created: {report_data.name}")
    
    return {
        "id": new_report.id,
        "name": new_report.name,
        "description": new_report.description,
        "report_type": new_report.report_type,
        "query_config": new_report.query_config,
        "schedule_config": new_report.schedule_config,
        "is_active": new_report.is_active,
        "created_by": new_report.created_by,
        "created_at": new_report.created_at
    }

# Dashboards Management
@app.get("/api/analytics/dashboards")
async def get_dashboards(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    dashboard_type: Optional[DashboardType] = None,
    is_public: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics dashboards with filtering"""
    query = db.query(AnalyticsDashboard)
    
    if dashboard_type:
        query = query.filter(AnalyticsDashboard.dashboard_type == dashboard_type)
    if is_public is not None:
        query = query.filter(AnalyticsDashboard.is_public == is_public)
    
    dashboards = query.order_by(AnalyticsDashboard.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "dashboards": [
            {
                "id": dashboard.id,
                "name": dashboard.name,
                "description": dashboard.description,
                "dashboard_type": dashboard.dashboard_type,
                "layout_config": dashboard.layout_config,
                "widgets": dashboard.widgets,
                "is_public": dashboard.is_public,
                "created_by": dashboard.created_by,
                "created_at": dashboard.created_at
            }
            for dashboard in dashboards
        ]
    }

@app.post("/api/analytics/dashboards")
async def create_dashboard(
    dashboard_data: DashboardCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new analytics dashboard"""
    new_dashboard = AnalyticsDashboard(
        name=dashboard_data.name,
        description=dashboard_data.description,
        dashboard_type=dashboard_data.dashboard_type,
        layout_config=dashboard_data.layout_config,
        widgets=dashboard_data.widgets,
        is_public=dashboard_data.is_public,
        created_by=current_user["user_id"]
    )
    
    db.add(new_dashboard)
    db.commit()
    db.refresh(new_dashboard)
    
    logger.info(f"✅ Dashboard created: {dashboard_data.name}")
    
    return {
        "id": new_dashboard.id,
        "name": new_dashboard.name,
        "description": new_dashboard.description,
        "dashboard_type": new_dashboard.dashboard_type,
        "layout_config": new_dashboard.layout_config,
        "widgets": new_dashboard.widgets,
        "is_public": new_dashboard.is_public,
        "created_by": new_dashboard.created_by,
        "created_at": new_dashboard.created_at
    }

# Widgets Management
@app.get("/api/analytics/widgets")
async def get_widgets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    widget_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics widgets with filtering"""
    query = db.query(AnalyticsWidget)
    
    if widget_type:
        query = query.filter(AnalyticsWidget.widget_type == widget_type)
    if is_active is not None:
        query = query.filter(AnalyticsWidget.is_active == is_active)
    
    widgets = query.order_by(AnalyticsWidget.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "widgets": [
            {
                "id": widget.id,
                "name": widget.name,
                "widget_type": widget.widget_type,
                "data_source": widget.data_source,
                "query_config": widget.query_config,
                "visualization_config": widget.visualization_config,
                "refresh_interval": widget.refresh_interval,
                "is_active": widget.is_active,
                "created_by": widget.created_by,
                "created_at": widget.created_at
            }
            for widget in widgets
        ]
    }

@app.post("/api/analytics/widgets")
async def create_widget(
    widget_data: WidgetCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new analytics widget"""
    new_widget = AnalyticsWidget(
        name=widget_data.name,
        widget_type=widget_data.widget_type,
        data_source=widget_data.data_source,
        query_config=widget_data.query_config,
        visualization_config=widget_data.visualization_config,
        refresh_interval=widget_data.refresh_interval,
        created_by=current_user["user_id"]
    )
    
    db.add(new_widget)
    db.commit()
    db.refresh(new_widget)
    
    logger.info(f"✅ Widget created: {widget_data.name}")
    
    return {
        "id": new_widget.id,
        "name": new_widget.name,
        "widget_type": new_widget.widget_type,
        "data_source": new_widget.data_source,
        "query_config": new_widget.query_config,
        "visualization_config": new_widget.visualization_config,
        "refresh_interval": new_widget.refresh_interval,
        "is_active": new_widget.is_active,
        "created_by": new_widget.created_by,
        "created_at": new_widget.created_at
    }

# Events Management
@app.post("/api/analytics/events")
async def create_event(
    event_data: EventCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new analytics event"""
    new_event = AnalyticsEvent(
        event_name=event_data.event_name,
        user_id=event_data.user_id,
        session_id=event_data.session_id,
        properties=event_data.properties,
        source_service=event_data.source_service
    )
    
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    # Cache in Redis for real-time analytics
    if redis_client:
        cache_key = f"event:{event_data.event_name}:{datetime.utcnow().strftime('%Y-%m-%d-%H')}"
        await redis_client.incr(cache_key)
        await redis_client.expire(cache_key, 3600)
    
    logger.info(f"✅ Event created: {event_data.event_name}")
    
    return {
        "id": new_event.id,
        "event_name": new_event.event_name,
        "user_id": new_event.user_id,
        "session_id": new_event.session_id,
        "properties": new_event.properties,
        "timestamp": new_event.timestamp,
        "source_service": new_event.source_service
    }

# KPIs Management
@app.get("/api/analytics/kpis")
async def get_kpis(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics KPIs with filtering"""
    query = db.query(AnalyticsKPI)
    
    if status:
        query = query.filter(AnalyticsKPI.status == status)
    
    kpis = query.order_by(AnalyticsKPI.last_updated.desc()).offset(skip).limit(limit).all()
    
    return {
        "kpis": [
            {
                "id": kpi.id,
                "name": kpi.name,
                "description": kpi.description,
                "metric_name": kpi.metric_name,
                "target_value": kpi.target_value,
                "current_value": kpi.current_value,
                "unit": kpi.unit,
                "trend": kpi.trend,
                "status": kpi.status,
                "last_updated": kpi.last_updated
            }
            for kpi in kpis
        ]
    }

@app.post("/api/analytics/kpis")
async def create_kpi(
    kpi_data: KPICreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new analytics KPI"""
    new_kpi = AnalyticsKPI(
        name=kpi_data.name,
        description=kpi_data.description,
        metric_name=kpi_data.metric_name,
        target_value=kpi_data.target_value,
        unit=kpi_data.unit
    )
    
    db.add(new_kpi)
    db.commit()
    db.refresh(new_kpi)
    
    logger.info(f"✅ KPI created: {kpi_data.name}")
    
    return {
        "id": new_kpi.id,
        "name": new_kpi.name,
        "description": new_kpi.description,
        "metric_name": new_kpi.metric_name,
        "target_value": new_kpi.target_value,
        "current_value": new_kpi.current_value,
        "unit": new_kpi.unit,
        "trend": new_kpi.trend,
        "status": new_kpi.status,
        "last_updated": new_kpi.last_updated
    }

# Analytics Overview
@app.get("/api/analytics/overview", response_model=AnalyticsResponse)
async def get_analytics_overview(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics overview with key metrics"""
    # Get metrics from last 24 hours
    yesterday = datetime.utcnow() - timedelta(days=1)
    
    # Calculate key metrics
    total_users = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.event_name == "user_login",
        AnalyticsEvent.timestamp >= yesterday
    ).count()
    
    active_sessions = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.event_name == "session_start",
        AnalyticsEvent.timestamp >= yesterday
    ).count()
    
    documents_processed = db.query(AnalyticsMetric).filter(
        AnalyticsMetric.metric_name == "documents_processed",
        AnalyticsMetric.timestamp >= yesterday
    ).count()
    
    signatures_completed = db.query(AnalyticsMetric).filter(
        AnalyticsMetric.metric_name == "signatures_completed",
        AnalyticsMetric.timestamp >= yesterday
    ).count()
    
    workflow_executions = db.query(AnalyticsMetric).filter(
        AnalyticsMetric.metric_name == "workflow_executions",
        AnalyticsMetric.timestamp >= yesterday
    ).count()
    
    # Calculate system metrics
    error_events = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.event_name == "error",
        AnalyticsEvent.timestamp >= yesterday
    ).count()
    
    total_events = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.timestamp >= yesterday
    ).count()
    
    error_rate = (error_events / total_events * 100) if total_events > 0 else 0
    
    # Mock data for demonstration
    system_uptime = 99.9
    response_time_avg = 150.5
    revenue = 125000.0
    conversion_rate = 12.5
    
    return AnalyticsResponse(
        total_users=total_users,
        active_sessions=active_sessions,
        documents_processed=documents_processed,
        signatures_completed=signatures_completed,
        workflow_executions=workflow_executions,
        system_uptime=system_uptime,
        error_rate=error_rate,
        response_time_avg=response_time_avg,
        revenue=revenue,
        conversion_rate=conversion_rate
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=SERVICE_PORT,
        reload=True
    )