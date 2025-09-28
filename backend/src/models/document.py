# buffrsign-starter/backend/models/document.py
from sqlalchemy import Column, Integer, String, Float, Date, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(50), default='draft')
    created_by = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(Date, default=func.now())
    updated_at = Column(Date, onupdate=func.now())
    
    # New fields for cross-project integration
    source_project = Column(String(100))  # 'buffrlend', 'buffrhost'
    source_id = Column(String(255))      # ID from source project
    integration_type = Column(String(50)) # 'loan_agreement', 'contract'
    
    # Adumo integration for payment processing
    adumo_payment_required = Column(Boolean, default=False)
    adumo_amount = Column(Float)
    adumo_transaction_id = Column(String(255))
