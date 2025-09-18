"""
Database Service for BuffrSign
Handles all database operations with proper error handling and audit trails
"""

import os
import logging
import asyncpg
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from enum import Enum

from ..database.supabase_client import get_supabase_client
from ..models.kyc_models import KYCWorkflow, KYCWorkflowState, KYCDecision

logger = logging.getLogger(__name__)

class UserRole(str, Enum):
    INDIVIDUAL = "individual"
    SME_USER = "sme_user"
    ENTERPRISE_USER = "enterprise_user"
    ADMIN = "admin"

class SignatureType(str, Enum):
    SIMPLE = "simple"
    QUALIFIED = "qualified"

class SignatureStatus(str, Enum):
    PENDING = "pending"
    SIGNED = "signed"
    VERIFIED = "verified"
    REVOKED = "revoked"
    EXPIRED = "expired"

class DatabaseService:
    def __init__(self):
        self.pool = None
        self.database_url = os.getenv("DATABASE_URL")
        self.supabase_client = get_supabase_client()
        
    async def initialize(self):
        """Initialize database connection pool"""
        try:
            if not self.database_url:
                raise ValueError("DATABASE_URL environment variable not set")
            
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            logger.info("✅ Database connection pool initialized")
            
            # Create tables if they don't exist
            await self.create_tables()
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup database connections"""
        if self.pool:
            await self.pool.close()
            logger.info("✅ Database connections closed")
    
    async def test_connection(self):
        """Test database connection"""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute("SELECT 1")
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False
    
    async def health_check(self):
        """Health check for database service"""
        return await self.test_connection()
    
    async def create_tables(self):
        """Create database tables if they don't exist"""
        try:
            async with self.pool.acquire() as conn:
                # Enable UUID extension
                await conn.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
                
                # Users table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        first_name VARCHAR(100) NOT NULL,
                        last_name VARCHAR(100) NOT NULL,
                        company VARCHAR(255),
                        role VARCHAR(20) DEFAULT 'individual',
                        plan VARCHAR(20) DEFAULT 'free',
                        mfa_enabled BOOLEAN DEFAULT FALSE,
                        mfa_secret VARCHAR(255),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """)
                
                # Documents table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS documents (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        file_url VARCHAR(500) NOT NULL,
                        file_type VARCHAR(50),
                        file_size INTEGER,
                        category VARCHAR(100),
                        ai_analysis JSONB,
                        analysis_status VARCHAR(20) DEFAULT 'pending',
                        compliance_status VARCHAR(20) DEFAULT 'pending',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """)
                
                # Signature requests table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS signature_requests (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
                        requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
                        signer_email VARCHAR(255) NOT NULL,
                        signature_type VARCHAR(20) DEFAULT 'simple',
                        message TEXT,
                        redirect_url VARCHAR(500),
                        status VARCHAR(20) DEFAULT 'pending',
                        signature_data TEXT,
                        signed_at TIMESTAMP WITH TIME ZONE,
                        notification_sent BOOLEAN DEFAULT FALSE,
                        expires_at TIMESTAMP WITH TIME ZONE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """)
                
                # Audit trail table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS audit_trail (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        signature_id UUID REFERENCES signature_requests(id) ON DELETE CASCADE,
                        action VARCHAR(100) NOT NULL,
                        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                        details JSONB,
                        ip_address VARCHAR(45),
                        user_agent TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """)
                
                # Templates table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS templates (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        category VARCHAR(100),
                        content TEXT NOT NULL,
                        ai_generated BOOLEAN DEFAULT FALSE,
                        public BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """)
                
                # Contacts table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS contacts (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                        email VARCHAR(255) NOT NULL,
                        first_name VARCHAR(100),
                        last_name VARCHAR(100),
                        company VARCHAR(255),
                        phone VARCHAR(20),
                        group_name VARCHAR(100),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """)
                
                # Compliance reports table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS compliance_reports (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
                        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                        report_type VARCHAR(50) NOT NULL,
                        report_data JSONB NOT NULL,
                        generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """)
                
                # Create indexes for better performance
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_signature_requests_document_id ON signature_requests(document_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_signature_requests_requester_id ON signature_requests(requester_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_signature_requests_signer_email ON signature_requests(signer_email)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_trail_signature_id ON audit_trail(signature_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_compliance_reports_document_id ON compliance_reports(document_id)")
                
            logger.info("✅ Database tables created/verified")
            
        except Exception as e:
            logger.error(f"❌ Failed to create tables: {e}")
            raise
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile from database"""
        try:
            async with self.pool.acquire() as conn:
                user = await conn.fetchrow(
                    "SELECT * FROM users WHERE id = $1",
                    user_id
                )
                
                if user:
                    return dict(user)
                return None
                
        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            raise
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new user in database"""
        try:
            async with self.pool.acquire() as conn:
                user = await conn.fetchrow(
                    """INSERT INTO users (email, password_hash, first_name, last_name, company, role, plan)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *""",
                    user_data["email"],
                    user_data["password_hash"],
                    user_data["first_name"],
                    user_data["last_name"],
                    user_data.get("company"),
                    user_data.get("role", UserRole.INDIVIDUAL),
                    user_data.get("plan", "free")
                )
                
                return dict(user)
                
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user in database"""
        try:
            async with self.pool.acquire() as conn:
                # Build dynamic update query
                set_clauses = []
                values = []
                param_count = 1
                
                for key, value in update_data.items():
                    if key in ["first_name", "last_name", "company", "role", "plan", "mfa_enabled", "mfa_secret"]:
                        set_clauses.append(f"{key} = ${param_count}")
                        values.append(value)
                        param_count += 1
                
                if not set_clauses:
                    raise ValueError("No valid fields to update")
                
                set_clauses.append("updated_at = NOW()")
                values.append(user_id)
                
                query = f"""
                    UPDATE users 
                    SET {', '.join(set_clauses)}
                    WHERE id = ${param_count}
                    RETURNING *
                """
                
                user = await conn.fetchrow(query, *values)
                
                if user:
                    return dict(user)
                else:
                    raise ValueError("User not found")
                
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            raise
    
    async def create_document(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new document in database"""
        try:
            async with self.pool.acquire() as conn:
                document = await conn.fetchrow(
                    """INSERT INTO documents 
                    (user_id, name, description, file_url, file_type, file_size, category)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *""",
                    document_data["user_id"],
                    document_data["name"],
                    document_data.get("description"),
                    document_data["file_url"],
                    document_data.get("file_type"),
                    document_data.get("file_size"),
                    document_data.get("category")
                )
                
                return dict(document)
                
        except Exception as e:
            logger.error(f"Error creating document: {e}")
            raise
    
    async def get_document(self, document_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID and user"""
        try:
            async with self.pool.acquire() as conn:
                document = await conn.fetchrow(
                    "SELECT * FROM documents WHERE id = $1 AND user_id = $2",
                    document_id, user_id
                )
                
                if document:
                    return dict(document)
                return None
                
        except Exception as e:
            logger.error(f"Error getting document: {e}")
            raise
    
    async def list_documents(self, user_id: str, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """List user's documents"""
        try:
            async with self.pool.acquire() as conn:
                documents = await conn.fetch(
                    """SELECT * FROM documents 
                    WHERE user_id = $1 
                    ORDER BY created_at DESC 
                    LIMIT $2 OFFSET $3""",
                    user_id, limit, offset
                )
                
                return [dict(doc) for doc in documents]
                
        except Exception as e:
            logger.error(f"Error listing documents: {e}")
            raise
    
    async def update_document_analysis(self, document_id: str, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update document with AI analysis results"""
        try:
            async with self.pool.acquire() as conn:
                document = await conn.fetchrow(
                    """UPDATE documents 
                    SET ai_analysis = $1, analysis_status = 'completed', updated_at = NOW()
                    WHERE id = $2 RETURNING *""",
                    json.dumps(analysis_data), document_id
                )
                
                if document:
                    return dict(document)
                else:
                    raise ValueError("Document not found")
                
        except Exception as e:
            logger.error(f"Error updating document analysis: {e}")
            raise
    
    async def create_signature_request(self, signature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new signature request"""
        try:
            async with self.pool.acquire() as conn:
                signature = await conn.fetchrow(
                    """INSERT INTO signature_requests 
                    (document_id, requester_id, signer_email, signature_type, message, redirect_url, expires_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *""",
                    signature_data["document_id"],
                    signature_data["requester_id"],
                    signature_data["signer_email"],
                    signature_data.get("signature_type", SignatureType.SIMPLE),
                    signature_data.get("message"),
                    signature_data.get("redirect_url"),
                    signature_data.get("expires_at")
                )
                
                return dict(signature)
                
        except Exception as e:
            logger.error(f"Error creating signature request: {e}")
            raise
    
    async def get_signature_request(self, signature_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get signature request by ID"""
        try:
            async with self.pool.acquire() as conn:
                signature = await conn.fetchrow(
                    """SELECT sr.*, d.name as document_name, d.file_url
                    FROM signature_requests sr
                    JOIN documents d ON sr.document_id = d.id
                    WHERE sr.id = $1 AND (sr.requester_id = $2 OR sr.signer_email = $3)""",
                    signature_id, user_id, user_id
                )
                
                if signature:
                    return dict(signature)
                return None
                
        except Exception as e:
            logger.error(f"Error getting signature request: {e}")
            raise
    
    async def update_signature_status(self, signature_id: str, status: str, signature_data: str = None) -> Dict[str, Any]:
        """Update signature request status"""
        try:
            async with self.pool.acquire() as conn:
                if signature_data:
                    signature = await conn.fetchrow(
                        """UPDATE signature_requests 
                        SET status = $1, signature_data = $2, signed_at = NOW(), updated_at = NOW()
                        WHERE id = $3 RETURNING *""",
                        status, signature_data, signature_id
                    )
                else:
                    signature = await conn.fetchrow(
                        """UPDATE signature_requests 
                        SET status = $1, updated_at = NOW()
                        WHERE id = $2 RETURNING *""",
                        status, signature_id
                    )
                
                if signature:
                    return dict(signature)
                else:
                    raise ValueError("Signature request not found")
                
        except Exception as e:
            logger.error(f"Error updating signature status: {e}")
            raise
    
    async def create_audit_entry(self, audit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create audit trail entry"""
        try:
            async with self.pool.acquire() as conn:
                audit_entry = await conn.fetchrow(
                    """INSERT INTO audit_trail 
                    (signature_id, action, user_id, details, ip_address, user_agent)
                    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *""",
                    audit_data.get("signature_id"),
                    audit_data["action"],
                    audit_data.get("user_id"),
                    json.dumps(audit_data.get("details", {})),
                    audit_data.get("ip_address"),
                    audit_data.get("user_agent")
                )
                
                return dict(audit_entry)
                
        except Exception as e:
            logger.error(f"Error creating audit entry: {e}")
            raise
    
    async def get_audit_trail(self, signature_id: str) -> List[Dict[str, Any]]:
        """Get audit trail for signature"""
        try:
            async with self.pool.acquire() as conn:
                audit_entries = await conn.fetch(
                    """SELECT at.*, u.email as user_email, u.first_name, u.last_name
                    FROM audit_trail at
                    LEFT JOIN users u ON at.user_id = u.id
                    WHERE at.signature_id = $1 
                    ORDER BY at.created_at""",
                    signature_id
                )
                
                return [dict(entry) for entry in audit_entries]
                
        except Exception as e:
            logger.error(f"Error getting audit trail: {e}")
            raise
    
    async def create_template(self, template_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new template"""
        try:
            async with self.pool.acquire() as conn:
                template = await conn.fetchrow(
                    """INSERT INTO templates 
                    (user_id, name, description, category, content, ai_generated, public)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *""",
                    template_data["user_id"],
                    template_data["name"],
                    template_data.get("description"),
                    template_data.get("category"),
                    template_data["content"],
                    template_data.get("ai_generated", False),
                    template_data.get("public", False)
                )
                
                return dict(template)
                
        except Exception as e:
            logger.error(f"Error creating template: {e}")
            raise
    
    async def get_templates(self, user_id: str, category: str = None) -> List[Dict[str, Any]]:
        """Get templates for user"""
        try:
            async with self.pool.acquire() as conn:
                if category:
                    templates = await conn.fetch(
                        "SELECT * FROM templates WHERE (user_id = $1 OR public = true) AND category = $2",
                        user_id, category
                    )
                else:
                    templates = await conn.fetch(
                        "SELECT * FROM templates WHERE user_id = $1 OR public = true",
                        user_id
                    )
                
                return [dict(template) for template in templates]
                
        except Exception as e:
            logger.error(f"Error getting templates: {e}")
            raise
    
    async def create_contact(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new contact"""
        try:
            async with self.pool.acquire() as conn:
                contact = await conn.fetchrow(
                    """INSERT INTO contacts 
                    (user_id, email, first_name, last_name, company, phone, group_name)
                    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *""",
                    contact_data["user_id"],
                    contact_data["email"],
                    contact_data.get("first_name"),
                    contact_data.get("last_name"),
                    contact_data.get("company"),
                    contact_data.get("phone"),
                    contact_data.get("group_name")
                )
                
                return dict(contact)
                
        except Exception as e:
            logger.error(f"Error creating contact: {e}")
            raise
    
    async def get_contacts(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's contacts"""
        try:
            async with self.pool.acquire() as conn:
                contacts = await conn.fetch(
                    "SELECT * FROM contacts WHERE user_id = $1 ORDER BY created_at DESC",
                    user_id
                )
                
                return [dict(contact) for contact in contacts]
                
        except Exception as e:
            logger.error(f"Error getting contacts: {e}")
            raise
    
    async def create_compliance_report(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create compliance report"""
        try:
            async with self.pool.acquire() as conn:
                report = await conn.fetchrow(
                    """INSERT INTO compliance_reports 
                    (document_id, user_id, report_type, report_data)
                    VALUES ($1, $2, $3, $4) RETURNING *""",
                    report_data["document_id"],
                    report_data["user_id"],
                    report_data["report_type"],
                    json.dumps(report_data["report_data"])
                )
                
                return dict(report)
                
        except Exception as e:
            logger.error(f"Error creating compliance report: {e}")
            raise
    
    async def get_compliance_reports(self, document_id: str) -> List[Dict[str, Any]]:
        """Get compliance reports for document"""
        try:
            async with self.pool.acquire() as conn:
                reports = await conn.fetch(
                    "SELECT * FROM compliance_reports WHERE document_id = $1 ORDER BY generated_at DESC",
                    document_id
                )
                
                return [dict(report) for report in reports]
                
        except Exception as e:
            logger.error(f"Error getting compliance reports: {e}")
            raise
    
    async def execute_cli_command(self, command: str, user_id: str) -> str:
        """Execute CLI command and log it"""
        try:
            # Log the command execution
            await self.create_audit_entry({
                "action": "cli_command_executed",
                "user_id": user_id,
                "details": {"command": command}
            })
            
            # In a real implementation, you would execute the command here
            # For now, return a success message
            return f"Command '{command}' executed successfully"
            
        except Exception as e:
            logger.error(f"Error executing CLI command: {e}")
            raise
    
    async def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard statistics for user"""
        try:
            async with self.pool.acquire() as conn:
                # Get document count
                doc_count = await conn.fetchval(
                    "SELECT COUNT(*) FROM documents WHERE user_id = $1",
                    user_id
                )
                
                # Get pending signatures
                pending_signatures = await conn.fetchval(
                    """SELECT COUNT(*) FROM signature_requests sr
                    JOIN documents d ON sr.document_id = d.id
                    WHERE d.user_id = $1 AND sr.status = 'pending'""",
                    user_id
                )
                
                # Get completed signatures
                completed_signatures = await conn.fetchval(
                    """SELECT COUNT(*) FROM signature_requests sr
                    JOIN documents d ON sr.document_id = d.id
                    WHERE d.user_id = $1 AND sr.status = 'signed'""",
                    user_id
                )
                
                # Get recent activity
                recent_activity = await conn.fetch(
                    """SELECT at.action, at.created_at, d.name as document_name
                    FROM audit_trail at
                    JOIN signature_requests sr ON at.signature_id = sr.id
                    JOIN documents d ON sr.document_id = d.id
                    WHERE d.user_id = $1
                    ORDER BY at.created_at DESC
                    LIMIT 10""",
                    user_id
                )
                
                return {
                    "total_documents": doc_count,
                    "pending_signatures": pending_signatures,
                    "completed_signatures": completed_signatures,
                    "recent_activity": [dict(activity) for activity in recent_activity]
                }
                
        except Exception as e:
            logger.error(f"Error getting dashboard stats: {e}")
            raise
    
    async def get_user_signature_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get signature statistics for user"""
        try:
            async with self.pool.acquire() as conn:
                # Get total signatures
                total_signatures = await conn.fetchval(
                    """SELECT COUNT(*) FROM signature_requests sr
                    JOIN documents d ON sr.document_id = d.id
                    WHERE d.user_id = $1""",
                    user_id
                )
                
                # Get pending signatures
                pending_signatures = await conn.fetchval(
                    """SELECT COUNT(*) FROM signature_requests sr
                    JOIN documents d ON sr.document_id = d.id
                    WHERE d.user_id = $1 AND sr.status = 'pending'""",
                    user_id
                )
                
                # Get completed signatures
                completed_signatures = await conn.fetchval(
                    """SELECT COUNT(*) FROM signature_requests sr
                    JOIN documents d ON sr.document_id = d.id
                    WHERE d.user_id = $1 AND sr.status = 'signed'""",
                    user_id
                )
                
                # Get signature types distribution
                signature_types = await conn.fetch(
                    """SELECT sr.signature_type, COUNT(*) as count
                    FROM signature_requests sr
                    JOIN documents d ON sr.document_id = d.id
                    WHERE d.user_id = $1
                    GROUP BY sr.signature_type""",
                    user_id
                )
                
                # Get recent signatures
                recent_signatures = await conn.fetch(
                    """SELECT sr.*, d.name as document_name
                    FROM signature_requests sr
                    JOIN documents d ON sr.document_id = d.id
                    WHERE d.user_id = $1
                    ORDER BY sr.created_at DESC
                    LIMIT 10""",
                    user_id
                )
                
                return {
                    "total_signatures": total_signatures,
                    "pending_signatures": pending_signatures,
                    "completed_signatures": completed_signatures,
                    "signature_types": [dict(st) for st in signature_types],
                    "recent_signatures": [dict(rs) for rs in recent_signatures],
                    "success_rate": (completed_signatures / total_signatures * 100) if total_signatures > 0 else 0
                }
                
        except Exception as e:
            logger.error(f"Error getting signature statistics: {e}")
            raise
    
    # KYC Workflow Methods using Supabase
    async def create_kyc_workflow(self, user_id: str, document_id: str = None) -> str:
        """Create a new KYC workflow using Supabase"""
        try:
            from ..types.supabase_types import KYCWorkflowInsert
            
            workflow_data = KYCWorkflowInsert()
            workflow_data.user_id = user_id
            workflow_data.document_id = document_id
            
            workflow_id = await self.supabase_client.create_kyc_workflow(workflow_data)
            logger.info(f"✅ Created KYC workflow {workflow_id} for user {user_id}")
            return workflow_id
        except Exception as e:
            logger.error(f"❌ Error creating KYC workflow: {e}")
            raise
    
    async def get_kyc_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get KYC workflow by ID using Supabase"""
        try:
            workflow = await self.supabase_client.get_kyc_workflow(workflow_id)
            return workflow
        except Exception as e:
            logger.error(f"❌ Error fetching KYC workflow {workflow_id}: {e}")
            raise
    
    async def update_kyc_workflow_state(self, workflow_id: str, state: str, 
                                       confidence: float = None, **kwargs) -> bool:
        """Update KYC workflow state using Supabase"""
        try:
            from ..types.supabase_types import KYCWorkflowUpdate
            
            updates = KYCWorkflowUpdate()
            updates.workflow_state = KYCWorkflowState(state)
            if confidence is not None:
                updates.total_confidence = confidence
            
            # Add any additional fields from kwargs
            for key, value in kwargs.items():
                if hasattr(updates, key):
                    setattr(updates, key, value)
            
            success = await self.supabase_client.update_kyc_workflow(workflow_id, updates)
            if success:
                logger.info(f"✅ Updated KYC workflow {workflow_id} state to {state}")
            return success
        except Exception as e:
            logger.error(f"❌ Error updating KYC workflow state: {e}")
            raise
    
    async def get_user_kyc_status(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's current KYC status using Supabase"""
        try:
            status = await self.supabase_client.get_user_kyc_status(user_id)
            return status
        except Exception as e:
            logger.error(f"❌ Error fetching user KYC status: {e}")
            raise
    
    async def record_ai_metrics(self, model_name: str, metrics: Dict[str, Any]) -> str:
        """Record AI model performance metrics using Supabase"""
        try:
            metrics_data = {
                "model_name": model_name,
                "model_version": metrics.get("version", "1.0"),
                "accuracy": metrics.get("accuracy"),
                "total_predictions": metrics.get("total_predictions", 0),
                "period_start": metrics.get("period_start", datetime.utcnow().isoformat()),
                "period_end": metrics.get("period_end", datetime.utcnow().isoformat())
            }
            
            metric_id = await self.supabase_client.record_model_metrics(metrics_data)
            logger.info(f"✅ Recorded AI metrics for model {model_name}")
            return metric_id
        except Exception as e:
            logger.error(f"❌ Error recording AI metrics: {e}")
            raise
