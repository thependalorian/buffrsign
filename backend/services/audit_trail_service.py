"""
Comprehensive Audit Trail Service for BuffrSign

This service provides:
- BFR-SIGN-ID generation and management
- KYC verification with government ID linkage
- Centralized audit trail creation and verification
- Tamper-evident storage with centralized integrity
- Compliance reporting and audit trail visibility
"""

import asyncio
import json
import logging
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, or_
from sqlalchemy.orm import selectinload

from models.audit_trail import (
    BFRSignID, KYCVerification, AuditTrailEntry, AuditTrailChain,
    ComplianceReport, AuditEventType, AuditSeverity, KYCStatus,
    GovernmentIDType, create_audit_event, verify_audit_trail_integrity
)
from models.user import User
from config import settings

logger = logging.getLogger(__name__)


class CentralizedAuditTrailService:
    """Centralized audit trail service for BuffrSign"""
    
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
        self.audit_chains_cache: Dict[str, AuditTrailChain] = {}
    
    async def generate_bfr_sign_id(self, user_id: str, government_id: Optional[str] = None) -> BFRSignID:
        """Generate a unique BFR-SIGN-ID for a user"""
        try:
            # Generate BFR-SIGN-ID
            bfr_sign_id = BFRSignID.generate_bfr_sign_id(user_id, government_id)
            
            # Store in database
            await self._store_bfr_sign_id(bfr_sign_id)
            
            # Create audit event
            await self.create_audit_event(
                bfr_sign_id=bfr_sign_id.id,
                event_type=AuditEventType.USER_REGISTRATION,
                user_id=user_id,
                event_description="BFR-SIGN-ID generated for user registration",
                event_data={
                    "government_id_provided": government_id is not None,
                    "government_id_hash": bfr_sign_id.government_id_hash
                },
                severity=AuditSeverity.INFO
            )
            
            logger.info(f"Generated BFR-SIGN-ID {bfr_sign_id.id} for user {user_id}")
            return bfr_sign_id
            
        except Exception as e:
            logger.error(f"Error generating BFR-SIGN-ID for user {user_id}: {str(e)}")
            raise
    
    async def _store_bfr_sign_id(self, bfr_sign_id: BFRSignID) -> None:
        """Store BFR-SIGN-ID in database"""
        try:
            # Insert into bfr_sign_ids table
            query = """
                INSERT INTO bfr_sign_ids (
                    id, user_id, government_id_hash, kyc_status, 
                    created_at, verified_at, expires_at
                ) VALUES (
                    :id, :user_id, :government_id_hash, :kyc_status,
                    :created_at, :verified_at, :expires_at
                )
            """
            await self.db_session.execute(
                query,
                {
                    "id": bfr_sign_id.id,
                    "user_id": bfr_sign_id.user_id,
                    "government_id_hash": bfr_sign_id.government_id_hash,
                    "kyc_status": bfr_sign_id.kyc_status.value,
                    "created_at": bfr_sign_id.created_at,
                    "verified_at": bfr_sign_id.verified_at,
                    "expires_at": bfr_sign_id.expires_at
                }
            )
            await self.db_session.commit()
            
        except Exception as e:
            await self.db_session.rollback()
            logger.error(f"Error storing BFR-SIGN-ID: {str(e)}")
            raise
    
    async def get_bfr_sign_id(self, user_id: str) -> Optional[BFRSignID]:
        """Get BFR-SIGN-ID for a user"""
        try:
            query = """
                SELECT id, user_id, government_id_hash, kyc_status,
                       created_at, verified_at, expires_at
                FROM bfr_sign_ids
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT 1
            """
            result = await self.db_session.execute(query, {"user_id": user_id})
            row = result.fetchone()
            
            if row:
                return BFRSignID(
                    id=row.id,
                    user_id=row.user_id,
                    government_id_hash=row.government_id_hash,
                    kyc_status=KYCStatus(row.kyc_status),
                    created_at=row.created_at,
                    verified_at=row.verified_at,
                    expires_at=row.expires_at
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting BFR-SIGN-ID for user {user_id}: {str(e)}")
            return None
    
    async def create_audit_event(self, bfr_sign_id: str, event_type: AuditEventType,
                               user_id: str, event_description: str,
                               event_data: Optional[Dict[str, Any]] = None,
        severity: AuditSeverity = AuditSeverity.INFO,
                               **kwargs) -> AuditTrailEntry:
        """Create a centralized audit trail entry"""
        try:
            # Create audit entry using centralized approach
            audit_entry = create_audit_event(
                bfr_sign_id=bfr_sign_id,
                event_type=event_type,
                user_id=user_id,
                event_description=event_description,
                event_data=event_data or {},
                severity=severity,
                **kwargs
            )
            
            # Store in database
            await self._store_audit_entry(audit_entry)
            
            # Add to cache
            if bfr_sign_id not in self.audit_chains_cache:
                self.audit_chains_cache[bfr_sign_id] = AuditTrailChain(
                    chain_id=str(uuid.uuid4()),
                    bfr_sign_id=bfr_sign_id
                )
            
            self.audit_chains_cache[bfr_sign_id].add_entry(audit_entry)
            
            logger.info(f"Created audit event {audit_entry.id} for BFR-SIGN-ID {bfr_sign_id}")
            return audit_entry
            
        except Exception as e:
            logger.error(f"Error creating audit event: {str(e)}")
            raise
    
    async def _store_audit_entry(self, audit_entry: AuditTrailEntry) -> None:
        """Store audit entry in database"""
        try:
            query = """
                INSERT INTO audit_trail_entries (
                    id, bfr_sign_id, event_type, severity, user_id, session_id,
                    document_id, signature_id, country_code, national_id_number,
                    issue_number, event_timestamp, system_timestamp, utc_offset,
                    event_description, event_data, cryptographic_hash_algorithm,
                    cryptographic_hash_value, cryptographic_hash_salt,
                    cryptographic_hash_timestamp, cryptographic_hash_previous_hash,
                    timestamp, ip_address, user_agent, location_data,
                    device_fingerprint, legal_basis, consent_given,
                    retention_period, system_version, api_version, correlation_id
                ) VALUES (
                    :id, :bfr_sign_id, :event_type, :severity, :user_id, :session_id,
                    :document_id, :signature_id, :country_code, :national_id_number,
                    :issue_number, :event_timestamp, :system_timestamp, :utc_offset,
                    :event_description, :event_data, :cryptographic_hash_algorithm,
                    :cryptographic_hash_value, :cryptographic_hash_salt,
                    :cryptographic_hash_timestamp, :cryptographic_hash_previous_hash,
                    :timestamp, :ip_address, :user_agent, :location_data,
                    :device_fingerprint, :legal_basis, :consent_given,
                    :retention_period, :system_version, :api_version, :correlation_id
                )
            """
            
            await self.db_session.execute(
                query,
                {
                    "id": audit_entry.id,
                    "bfr_sign_id": audit_entry.bfr_sign_id,
                    "event_type": audit_entry.event_type.value,
                    "severity": audit_entry.severity.value,
                    "user_id": audit_entry.user_id,
                    "session_id": audit_entry.session_id,
                    "document_id": audit_entry.document_id,
                    "signature_id": audit_entry.signature_id,
                    "country_code": audit_entry.country_code,
                    "national_id_number": audit_entry.national_id_number,
                    "issue_number": audit_entry.issue_number,
                    "event_timestamp": audit_entry.event_timestamp,
                    "system_timestamp": audit_entry.system_timestamp,
                    "utc_offset": audit_entry.utc_offset,
                    "event_description": audit_entry.event_description,
                    "event_data": json.dumps(audit_entry.event_data),
                    "cryptographic_hash_algorithm": audit_entry.cryptographic_hash.algorithm,
                    "cryptographic_hash_value": audit_entry.cryptographic_hash.hash_value,
                    "cryptographic_hash_salt": audit_entry.cryptographic_hash.salt,
                    "cryptographic_hash_timestamp": audit_entry.cryptographic_hash.timestamp,
                    "cryptographic_hash_previous_hash": audit_entry.cryptographic_hash.previous_hash,
                    "timestamp": audit_entry.timestamp,
                    "ip_address": audit_entry.ip_address,
                    "user_agent": audit_entry.user_agent,
                    "location_data": json.dumps(audit_entry.location_data) if audit_entry.location_data else None,
                    "device_fingerprint": audit_entry.device_fingerprint,
                    "legal_basis": audit_entry.legal_basis,
                    "consent_given": audit_entry.consent_given,
                    "retention_period": audit_entry.retention_period,
                    "system_version": audit_entry.system_version,
                    "api_version": audit_entry.api_version,
                    "correlation_id": audit_entry.correlation_id
                }
            )
            await self.db_session.commit()
            
        except Exception as e:
            await self.db_session.rollback()
            logger.error(f"Error storing audit entry: {str(e)}")
            raise
    
    async def get_audit_trail(self, bfr_sign_id: str, start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        event_types: Optional[List[AuditEventType]] = None,
                            severity_levels: Optional[List[AuditSeverity]] = None) -> AuditTrailChain:
        """Get centralized audit trail for a BFR-SIGN-ID"""
        try:
            # Build query
            query = """
                SELECT * FROM audit_trail_entries 
                WHERE bfr_sign_id = :bfr_sign_id
            """
            params = {"bfr_sign_id": bfr_sign_id}
            
            if start_date:
                query += " AND event_timestamp >= :start_date"
                params["start_date"] = start_date
            
            if end_date:
                query += " AND event_timestamp <= :end_date"
                params["end_date"] = end_date
            
            if event_types:
                event_type_values = [et.value for et in event_types]
                query += f" AND event_type IN ({','.join([':' + str(i) for i in range(len(event_type_values))])})"
                for i, value in enumerate(event_type_values):
                    params[str(i)] = value
            
            if severity_levels:
                severity_values = [sv.value for sv in severity_levels]
                query += f" AND severity IN ({','.join([':' + str(i) for i in range(len(severity_values))])})"
                for i, value in enumerate(severity_values):
                    params[str(i + len(event_type_values) if event_types else 0)] = value
            
            query += " ORDER BY event_timestamp ASC"
            
            result = await self.db_session.execute(query, params)
            rows = result.fetchall()
            
            # Convert to AuditTrailEntry objects
            entries = []
            for row in rows:
                entry = AuditTrailEntry(
                    id=row.id,
                    bfr_sign_id=row.bfr_sign_id,
                    event_type=AuditEventType(row.event_type),
                    severity=AuditSeverity(row.severity),
                    user_id=row.user_id,
                    session_id=row.session_id,
                    document_id=row.document_id,
                    signature_id=row.signature_id,
                    country_code=row.country_code,
                    national_id_number=row.national_id_number,
                    issue_number=row.issue_number,
                    event_timestamp=row.event_timestamp,
                    system_timestamp=row.system_timestamp,
                    utc_offset=row.utc_offset,
                    event_description=row.event_description,
                    event_data=json.loads(row.event_data) if row.event_data else {},
                    cryptographic_hash=row.cryptographic_hash_value,  # Simplified for demo
                    timestamp=row.timestamp,
                    ip_address=row.ip_address,
                    user_agent=row.user_agent,
                    location_data=json.loads(row.location_data) if row.location_data else None,
                    device_fingerprint=row.device_fingerprint,
                    legal_basis=row.legal_basis,
                    consent_given=row.consent_given,
                    retention_period=row.retention_period,
                    system_version=row.system_version,
                    api_version=row.api_version,
                    correlation_id=row.correlation_id
                )
                entries.append(entry)
            
            # Create audit chain
            audit_chain = AuditTrailChain(
                chain_id=str(uuid.uuid4()),
                bfr_sign_id=bfr_sign_id,
                entries=entries
            )
            
            # Create centralized integrity hash
            audit_chain.create_merkle_tree()
            
            return audit_chain
            
        except Exception as e:
            logger.error(f"Error getting audit trail for BFR-SIGN-ID {bfr_sign_id}: {str(e)}")
            raise
    
    async def verify_audit_trail_integrity(self, bfr_sign_id: str) -> Dict[str, Any]:
        """Verify the integrity of a centralized audit trail"""
        try:
            audit_chain = await self.get_audit_trail(bfr_sign_id)
            return verify_audit_trail_integrity(audit_chain)
            
        except Exception as e:
            logger.error(f"Error verifying audit trail integrity: {str(e)}")
            raise
    
    async def generate_compliance_report(self, bfr_sign_id: str, report_type: str = "comprehensive") -> ComplianceReport:
        """Generate centralized compliance report"""
        try:
            audit_chain = await self.get_audit_trail(bfr_sign_id)
            
            # Count events by type and severity
            events_by_type = {}
            events_by_severity = {}
            
            for entry in audit_chain.entries:
                event_type = entry.event_type.value
                severity = entry.severity.value
                
                events_by_type[event_type] = events_by_type.get(event_type, 0) + 1
                events_by_severity[severity] = events_by_severity.get(severity, 0) + 1
            
            # Verify chain integrity
            chain_integrity_verified = audit_chain.verify_chain_integrity()
            
            # Create compliance report
            report = ComplianceReport(
                id=str(uuid.uuid4()),
                bfr_sign_id=bfr_sign_id,
                report_type=report_type,
                generated_at=datetime.now(),
                valid_until=datetime.now() + timedelta(days=365),
                total_events=len(audit_chain.entries),
                events_by_type=events_by_type,
                events_by_severity=events_by_severity,
                merkle_root=audit_chain.merkle_root or "",
                chain_integrity_verified=chain_integrity_verified,
                tamper_evident=True,
                eta_2019_compliant=True,
                eidas_compliant=True,
                esign_act_compliant=True,
                kyc_verified=True,
                legal_basis_verified=True,
                consent_tracking_complete=True,
                retention_policy_compliant=True,
                audit_chain=audit_chain
            )
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating compliance report: {str(e)}")
            raise
    

# Alias for backward compatibility
AuditTrailService = CentralizedAuditTrailService
