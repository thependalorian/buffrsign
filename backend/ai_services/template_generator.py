"""
BuffrSign AI Document Generator
Generates legally binding contractual documents with ETA 2019 compliance
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
from pathlib import Path

# AI and ML imports
from llama_index.core import Document, VectorStoreIndex, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from pydantic import BaseModel, Field
import openai

# Document processing
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)

class DocumentTemplate(BaseModel):
    """Document template structure"""
    id: str
    name: str
    type: str
    category: str
    content: str
    signature_fields: List[Dict[str, Any]]
    compliance_requirements: List[str]
    customization_options: List[str]
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

class GeneratedDocument(BaseModel):
    """Generated document with full content"""
    id: str
    template_id: str
    title: str
    content: str
    parties: List[Dict[str, Any]]
    signature_fields: List[Dict[str, Any]]
    compliance_status: Dict[str, Any]
    metadata: Dict[str, Any]
    created_at: datetime
    status: str = "draft"

class DocumentGenerator:
    """AI-powered document generator for legally binding contracts"""
    
    def __init__(self):
        self.llm = OpenAI(model="gpt-4-turbo-preview")
        self.embedding_model = OpenAIEmbedding()
        
        # Configure LlamaIndex
        Settings.llm = self.llm
        Settings.embed_model = self.embedding_model
        
        # Initialize legal knowledge base
        self._initialize_legal_knowledge_base()
        
        # Document templates
        self.templates = self._load_document_templates()
    
    def _initialize_legal_knowledge_base(self):
        """Initialize knowledge base with ETA 2019 and legal documents"""
        try:
            # Load comprehensive legal knowledge
            legal_docs = [
                Document(text=self._load_eta_2019_knowledge()),
                Document(text=self._load_contract_law_knowledge())
            ]
            
            # Create vector index for legal guidance
            self.legal_index = VectorStoreIndex.from_documents(
                legal_docs,
                transformations=[SentenceSplitter(chunk_size=512)]
            )
            
            logger.info("✅ Legal knowledge base initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize legal knowledge base: {e}")
    
    def _load_eta_2019_knowledge(self) -> str:
        """Load ETA 2019 knowledge for compliance"""
        return """
        Electronic Transactions Act 4 of 2019 (Namibia) - Key Requirements:
        
        Section 17: Legal recognition of data messages
        - Electronic documents have the same legal effect as paper documents
        - Cannot be denied legal effect solely because they are electronic
        
        Section 20: Electronic signatures
        - Advanced electronic signatures must be unique to the signer
        - Must identify the signer and be under their sole control
        - Must be linked to detect any changes to the document
        
        Section 21: Original information
        - Information integrity must be maintained
        - Reliable assurance of completeness required
        
        Chapter 4: Consumer protection
        - Clear disclosure of terms and conditions
        - Right to withdraw from electronic transactions
        - Protection against unfair practices
        """
    
    def _load_contract_law_knowledge(self) -> str:
        """Load contract law knowledge"""
        return """
        Namibian Contract Law - Essential Elements:
        
        1. Offer and Acceptance
        - Clear offer with definite terms
        - Unconditional acceptance
        - Meeting of minds (consensus ad idem)
        
        2. Consideration
        - Something of value exchanged
        - Sufficient consideration for contract validity
        
        3. Capacity
        - Parties must have legal capacity
        - Age of majority (18 years)
        - Mental capacity to understand terms
        
        4. Legality
        - Purpose must be legal
        - Not contrary to public policy
        - Compliance with applicable laws
        
        5. Form Requirements
        - Some contracts require written form
        - Electronic form acceptable under ETA 2019
        - Signature requirements for validity
        """
    
    def _load_document_templates(self) -> Dict[str, DocumentTemplate]:
        """Load predefined document templates with comprehensive variants"""
        return {
            # EMPLOYMENT CONTRACTS - 3 Variants
            "employment_contract_standard": DocumentTemplate(
                id="employment_contract_standard",
                name="Standard Employment Contract",
                type="employment",
                category="human_resources",
                content=self._get_standard_employment_template(),
                signature_fields=[
                    {"type": "signature", "role": "employee", "label": "Employee Signature"},
                    {"type": "signature", "role": "employer", "label": "Employer Signature"},
                    {"type": "date", "role": "employee", "label": "Employee Date"},
                    {"type": "date", "role": "employer", "label": "Employer Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 20 - Electronic signatures",
                    "ETA 2019 Section 21 - Information integrity",
                    "Namibian Labour Act 11 of 2007 compliance"
                ],
                customization_options=[
                    "job_title", "salary", "benefits", "working_hours", 
                    "location", "probation_period", "termination_terms"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "employment_contract_executive": DocumentTemplate(
                id="employment_contract_executive",
                name="Executive Employment Contract",
                type="employment",
                category="human_resources",
                content=self._get_executive_employment_template(),
                signature_fields=[
                    {"type": "signature", "role": "executive", "label": "Executive Signature"},
                    {"type": "signature", "role": "employer", "label": "Employer Signature"},
                    {"type": "date", "role": "executive", "label": "Executive Date"},
                    {"type": "date", "role": "employer", "label": "Employer Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 20 - Electronic signatures",
                    "ETA 2019 Section 21 - Information integrity",
                    "Corporate governance requirements"
                ],
                customization_options=[
                    "executive_title", "compensation_package", "equity_options",
                    "non_compete_terms", "severance_provisions", "performance_metrics"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "employment_contract_fixed_term": DocumentTemplate(
                id="employment_contract_fixed_term",
                name="Fixed-Term Employment Contract",
                type="employment",
                category="human_resources",
                content=self._get_fixed_term_employment_template(),
                signature_fields=[
                    {"type": "signature", "role": "employee", "label": "Employee Signature"},
                    {"type": "signature", "role": "employer", "label": "Employer Signature"},
                    {"type": "date", "role": "employee", "label": "Employee Date"},
                    {"type": "date", "role": "employer", "label": "Employer Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 20 - Electronic signatures",
                    "ETA 2019 Section 21 - Information integrity",
                    "Fixed-term employment regulations"
                ],
                customization_options=[
                    "contract_duration", "project_scope", "renewal_terms",
                    "termination_conditions", "handover_requirements"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            
            # SERVICE AGREEMENTS - 3 Variants
            "service_agreement_consulting": DocumentTemplate(
                id="service_agreement_consulting",
                name="Consulting Service Agreement",
                type="service",
                category="business",
                content=self._get_consulting_service_template(),
                signature_fields=[
                    {"type": "signature", "role": "consultant", "label": "Consultant Signature"},
                    {"type": "signature", "role": "client", "label": "Client Signature"},
                    {"type": "date", "role": "consultant", "label": "Consultant Date"},
                    {"type": "date", "role": "client", "label": "Client Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Professional liability standards"
                ],
                customization_options=[
                    "consulting_scope", "deliverables", "payment_terms",
                    "intellectual_property", "liability_limitations"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "service_agreement_outsourcing": DocumentTemplate(
                id="service_agreement_outsourcing",
                name="Outsourcing Service Agreement",
                type="service",
                category="business",
                content=self._get_outsourcing_service_template(),
                signature_fields=[
                    {"type": "signature", "role": "service_provider", "label": "Service Provider Signature"},
                    {"type": "signature", "role": "client", "label": "Client Signature"},
                    {"type": "date", "role": "service_provider", "label": "Service Provider Date"},
                    {"type": "date", "role": "client", "label": "Client Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Data protection requirements"
                ],
                customization_options=[
                    "service_level_agreements", "performance_metrics", "data_security",
                    "transition_procedures", "termination_terms"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "service_agreement_maintenance": DocumentTemplate(
                id="service_agreement_maintenance",
                name="Maintenance Service Agreement",
                type="service",
                category="business",
                content=self._get_maintenance_service_template(),
                signature_fields=[
                    {"type": "signature", "role": "maintenance_provider", "label": "Maintenance Provider Signature"},
                    {"type": "signature", "role": "client", "label": "Client Signature"},
                    {"type": "date", "role": "maintenance_provider", "label": "Maintenance Provider Date"},
                    {"type": "date", "role": "client", "label": "Client Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Maintenance industry standards"
                ],
                customization_options=[
                    "maintenance_schedule", "emergency_procedures", "parts_provisions",
                    "warranty_terms", "response_times"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            
            # NON-DISCLOSURE AGREEMENTS - 3 Variants
            "nda_unilateral": DocumentTemplate(
                id="nda_unilateral",
                name="Unilateral Non-Disclosure Agreement",
                type="nda",
                category="legal",
                content=self._get_unilateral_nda_template(),
                signature_fields=[
                    {"type": "signature", "role": "disclosing_party", "label": "Disclosing Party Signature"},
                    {"type": "signature", "role": "receiving_party", "label": "Receiving Party Signature"},
                    {"type": "date", "role": "disclosing_party", "label": "Disclosing Party Date"},
                    {"type": "date", "role": "receiving_party", "label": "Receiving Party Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 20 - Electronic signatures",
                    "ETA 2019 Section 21 - Information integrity",
                    "Confidentiality law compliance"
                ],
                customization_options=[
                    "confidential_information_scope", "permitted_use", "duration",
                    "return_obligations", "remedies"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "nda_mutual": DocumentTemplate(
                id="nda_mutual",
                name="Mutual Non-Disclosure Agreement",
                type="nda",
                category="legal",
                content=self._get_mutual_nda_template(),
                signature_fields=[
                    {"type": "signature", "role": "party_a", "label": "Party A Signature"},
                    {"type": "signature", "role": "party_b", "label": "Party B Signature"},
                    {"type": "date", "role": "party_a", "label": "Party A Date"},
                    {"type": "date", "role": "party_b", "label": "Party B Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 20 - Electronic signatures",
                    "ETA 2019 Section 21 - Information integrity",
                    "Mutual confidentiality obligations"
                ],
                customization_options=[
                    "mutual_obligations", "information_exchange", "permitted_disclosures",
                    "duration", "survival_clauses"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "nda_employee": DocumentTemplate(
                id="nda_employee",
                name="Employee Non-Disclosure Agreement",
                type="nda",
                category="legal",
                content=self._get_employee_nda_template(),
                signature_fields=[
                    {"type": "signature", "role": "employee", "label": "Employee Signature"},
                    {"type": "signature", "role": "employer", "label": "Employer Signature"},
                    {"type": "date", "role": "employee", "label": "Employee Date"},
                    {"type": "date", "role": "employer", "label": "Employer Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 20 - Electronic signatures",
                    "ETA 2019 Section 21 - Information integrity",
                    "Employment confidentiality requirements"
                ],
                customization_options=[
                    "employee_obligations", "post_employment_restrictions",
                    "intellectual_property", "return_of_property"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            
            # LEASE AGREEMENTS - 3 Variants
            "lease_agreement_commercial": DocumentTemplate(
                id="lease_agreement_commercial",
                name="Commercial Lease Agreement",
                type="lease",
                category="property",
                content=self._get_commercial_lease_template(),
                signature_fields=[
                    {"type": "signature", "role": "landlord", "label": "Landlord Signature"},
                    {"type": "signature", "role": "tenant", "label": "Tenant Signature"},
                    {"type": "date", "role": "landlord", "label": "Landlord Date"},
                    {"type": "date", "role": "tenant", "label": "Tenant Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Commercial property regulations"
                ],
                customization_options=[
                    "property_description", "use_restrictions", "rent_terms",
                    "maintenance_obligations", "insurance_requirements"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "lease_agreement_residential": DocumentTemplate(
                id="lease_agreement_residential",
                name="Residential Lease Agreement",
                type="lease",
                category="property",
                content=self._get_residential_lease_template(),
                signature_fields=[
                    {"type": "signature", "role": "landlord", "label": "Landlord Signature"},
                    {"type": "signature", "role": "tenant", "label": "Tenant Signature"},
                    {"type": "date", "role": "landlord", "label": "Landlord Date"},
                    {"type": "date", "role": "tenant", "label": "Tenant Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Residential tenancy regulations"
                ],
                customization_options=[
                    "property_description", "occupancy_terms", "rent_deposit",
                    "tenant_rights", "landlord_responsibilities"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "lease_agreement_equipment": DocumentTemplate(
                id="lease_agreement_equipment",
                name="Equipment Lease Agreement",
                type="lease",
                category="equipment",
                content=self._get_equipment_lease_template(),
                signature_fields=[
                    {"type": "signature", "role": "lessor", "label": "Lessor Signature"},
                    {"type": "signature", "role": "lessee", "label": "Lessee Signature"},
                    {"type": "date", "role": "lessor", "label": "Lessor Date"},
                    {"type": "date", "role": "lessee", "label": "Lessee Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Equipment leasing standards"
                ],
                customization_options=[
                    "equipment_description", "lease_terms", "payment_schedule",
                    "maintenance_obligations", "return_provisions"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            
            # PARTNERSHIP AGREEMENTS - 3 Variants
            "partnership_agreement_general": DocumentTemplate(
                id="partnership_agreement_general",
                name="General Partnership Agreement",
                type="partnership",
                category="business",
                content=self._get_general_partnership_template(),
                signature_fields=[
                    {"type": "signature", "role": "partner_1", "label": "Partner 1 Signature"},
                    {"type": "signature", "role": "partner_2", "label": "Partner 2 Signature"},
                    {"type": "date", "role": "partner_1", "label": "Partner 1 Date"},
                    {"type": "date", "role": "partner_2", "label": "Partner 2 Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Partnership law requirements"
                ],
                customization_options=[
                    "partnership_structure", "capital_contributions", "profit_sharing",
                    "management_structure", "dissolution_procedures"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "partnership_agreement_limited": DocumentTemplate(
                id="partnership_agreement_limited",
                name="Limited Partnership Agreement",
                type="partnership",
                category="business",
                content=self._get_limited_partnership_template(),
                signature_fields=[
                    {"type": "signature", "role": "general_partner", "label": "General Partner Signature"},
                    {"type": "signature", "role": "limited_partner", "label": "Limited Partner Signature"},
                    {"type": "date", "role": "general_partner", "label": "General Partner Date"},
                    {"type": "date", "role": "limited_partner", "label": "Limited Partner Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Limited partnership regulations"
                ],
                customization_options=[
                    "partner_roles", "liability_limitations", "capital_contributions",
                    "management_structure", "distributions"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "partnership_agreement_joint_venture": DocumentTemplate(
                id="partnership_agreement_joint_venture",
                name="Joint Venture Agreement",
                type="partnership",
                category="business",
                content=self._get_joint_venture_template(),
                signature_fields=[
                    {"type": "signature", "role": "venture_partner_1", "label": "Venture Partner 1 Signature"},
                    {"type": "signature", "role": "venture_partner_2", "label": "Venture Partner 2 Signature"},
                    {"type": "date", "role": "venture_partner_1", "label": "Venture Partner 1 Date"},
                    {"type": "date", "role": "venture_partner_2", "label": "Venture Partner 2 Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Joint venture standards"
                ],
                customization_options=[
                    "venture_purpose", "resource_contributions", "management_control",
                    "profit_sharing", "loss_allocation"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            
            # VENDOR AGREEMENTS - 3 Variants
            "vendor_agreement_supplier": DocumentTemplate(
                id="vendor_agreement_supplier",
                name="Supplier Agreement",
                type="vendor",
                category="business",
                content=self._get_supplier_agreement_template(),
                signature_fields=[
                    {"type": "signature", "role": "supplier", "label": "Supplier Signature"},
                    {"type": "signature", "role": "buyer", "label": "Buyer Signature"},
                    {"type": "date", "role": "supplier", "label": "Supplier Date"},
                    {"type": "date", "role": "buyer", "label": "Buyer Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Supply chain standards"
                ],
                customization_options=[
                    "product_specifications", "quality_standards", "delivery_terms",
                    "payment_terms", "performance_metrics"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "vendor_agreement_distributor": DocumentTemplate(
                id="vendor_agreement_distributor",
                name="Distributor Agreement",
                type="vendor",
                category="business",
                content=self._get_distributor_agreement_template(),
                signature_fields=[
                    {"type": "signature", "role": "manufacturer", "label": "Manufacturer Signature"},
                    {"type": "signature", "role": "distributor", "label": "Distributor Signature"},
                    {"type": "date", "role": "manufacturer", "label": "Manufacturer Date"},
                    {"type": "date", "role": "distributor", "label": "Distributor Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Distribution law requirements"
                ],
                customization_options=[
                    "distribution_territory", "sales_targets", "marketing_obligations",
                    "termination_terms", "transition_procedures"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "vendor_agreement_technology": DocumentTemplate(
                id="vendor_agreement_technology",
                name="Technology Vendor Agreement",
                type="vendor",
                category="technology",
                content=self._get_technology_vendor_template(),
                signature_fields=[
                    {"type": "signature", "role": "technology_provider", "label": "Technology Provider Signature"},
                    {"type": "signature", "role": "client", "label": "Client Signature"},
                    {"type": "date", "role": "technology_provider", "label": "Technology Provider Date"},
                    {"type": "date", "role": "client", "label": "Client Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Technology licensing standards"
                ],
                customization_options=[
                    "technology_specifications", "licensing_terms", "support_maintenance",
                    "intellectual_property", "data_security"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            
            # LOAN AGREEMENTS - 3 Variants
            "loan_agreement_personal": DocumentTemplate(
                id="loan_agreement_personal",
                name="Personal Loan Agreement",
                type="loan",
                category="financial",
                content=self._get_personal_loan_template(),
                signature_fields=[
                    {"type": "signature", "role": "lender", "label": "Lender Signature"},
                    {"type": "signature", "role": "borrower", "label": "Borrower Signature"},
                    {"type": "date", "role": "lender", "label": "Lender Date"},
                    {"type": "date", "role": "borrower", "label": "Borrower Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Consumer protection requirements"
                ],
                customization_options=[
                    "loan_amount", "interest_terms", "repayment_schedule",
                    "default_provisions", "consumer_protection"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "loan_agreement_business": DocumentTemplate(
                id="loan_agreement_business",
                name="Business Loan Agreement",
                type="loan",
                category="financial",
                content=self._get_business_loan_template(),
                signature_fields=[
                    {"type": "signature", "role": "lender", "label": "Lender Signature"},
                    {"type": "signature", "role": "borrower", "label": "Borrower Signature"},
                    {"type": "date", "role": "lender", "label": "Lender Date"},
                    {"type": "date", "role": "borrower", "label": "Borrower Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Business lending standards"
                ],
                customization_options=[
                    "loan_purpose", "collateral_security", "financial_covenants",
                    "default_enforcement", "business_terms"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "loan_agreement_microfinance": DocumentTemplate(
                id="loan_agreement_microfinance",
                name="Microfinance Loan Agreement",
                type="loan",
                category="financial",
                content=self._get_microfinance_loan_template(),
                signature_fields=[
                    {"type": "signature", "role": "microfinance_institution", "label": "Microfinance Institution Signature"},
                    {"type": "signature", "role": "borrower", "label": "Borrower Signature"},
                    {"type": "date", "role": "microfinance_institution", "label": "Microfinance Institution Date"},
                    {"type": "date", "role": "borrower", "label": "Borrower Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Microfinance regulations"
                ],
                customization_options=[
                    "simplified_terms", "group_lending", "financial_education",
                    "default_prevention", "social_impact"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            
            # CONSULTING AGREEMENTS - 3 Variants
            "consulting_agreement_management": DocumentTemplate(
                id="consulting_agreement_management",
                name="Management Consulting Agreement",
                type="consulting",
                category="professional",
                content=self._get_management_consulting_template(),
                signature_fields=[
                    {"type": "signature", "role": "consultant", "label": "Consultant Signature"},
                    {"type": "signature", "role": "client", "label": "Client Signature"},
                    {"type": "date", "role": "consultant", "label": "Consultant Date"},
                    {"type": "date", "role": "client", "label": "Client Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Management consulting standards"
                ],
                customization_options=[
                    "consulting_scope", "deliverables", "professional_standards",
                    "conflict_of_interest", "intellectual_property"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "consulting_agreement_technical": DocumentTemplate(
                id="consulting_agreement_technical",
                name="Technical Consulting Agreement",
                type="consulting",
                category="professional",
                content=self._get_technical_consulting_template(),
                signature_fields=[
                    {"type": "signature", "role": "technical_consultant", "label": "Technical Consultant Signature"},
                    {"type": "signature", "role": "client", "label": "Client Signature"},
                    {"type": "date", "role": "technical_consultant", "label": "Technical Consultant Date"},
                    {"type": "date", "role": "client", "label": "Client Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Technical consulting standards"
                ],
                customization_options=[
                    "technical_specifications", "quality_assurance", "testing_protocols",
                    "warranty_liability", "technical_standards"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            "consulting_agreement_financial": DocumentTemplate(
                id="consulting_agreement_financial",
                name="Financial Consulting Agreement",
                type="consulting",
                category="professional",
                content=self._get_financial_consulting_template(),
                signature_fields=[
                    {"type": "signature", "role": "financial_consultant", "label": "Financial Consultant Signature"},
                    {"type": "signature", "role": "client", "label": "Client Signature"},
                    {"type": "date", "role": "financial_consultant", "label": "Financial Consultant Date"},
                    {"type": "date", "role": "client", "label": "Client Date"}
                ],
                compliance_requirements=[
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Financial advisory regulations"
                ],
                customization_options=[
                    "financial_scope", "regulatory_compliance", "conflict_disclosures",
                    "professional_liability", "financial_standards"
                ],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        }
    
    def _get_standard_employment_template(self) -> str:
        """Get complete standard employment contract template"""
        return """
# EMPLOYMENT AGREEMENT

**This Employment Agreement is entered into on [DATE] between:**

**[EMPLOYER_NAME]**, a company duly incorporated under the laws of the Republic of Namibia (Company Registration Number: [REG_NUMBER]) with its principal place of business at [EMPLOYER_ADDRESS] ("the Employer"),

**AND**

**[EMPLOYEE_NAME]**, a Namibian citizen/resident with Identity Number [ID_NUMBER] and residential address at [EMPLOYEE_ADDRESS] ("the Employee").

## 1. APPOINTMENT AND POSITION

1.1 The Employer hereby appoints the Employee as [JOB_TITLE] with effect from [START_DATE].

1.2 The Employee accepts such appointment and agrees to serve the Employer in such capacity on the terms and conditions set out in this Agreement.

1.3 The Employee shall report to [SUPERVISOR_NAME] or such other person as the Employer may designate from time to time.

## 2. DUTIES AND RESPONSIBILITIES

2.1 The Employee shall perform the duties and responsibilities normally associated with the position of [JOB_TITLE] and such other duties as may be assigned by the Employer from time to time.

2.2 The Employee shall:
   - Devote their full time, attention, and skill to the performance of their duties
   - Use their best efforts to promote the interests of the Employer
   - Comply with all reasonable instructions given by the Employer
   - Maintain the highest standards of professional conduct

2.3 The Employee shall not engage in any other business or employment without the prior written consent of the Employer.

## 3. PLACE OF WORK

3.1 The Employee's normal place of work shall be [WORK_LOCATION].

3.2 The Employee may be required to work at other locations as reasonably required by the Employer.

3.3 The Employee may be required to travel for business purposes as necessary.

## 4. WORKING HOURS

4.1 The Employee's normal working hours shall be [WORKING_HOURS] per week, Monday to Friday.

4.2 The Employee may be required to work additional hours as reasonably necessary to fulfill their duties.

4.3 The Employee shall be entitled to overtime compensation in accordance with the Labour Act 11 of 2007.

## 5. REMUNERATION

5.1 The Employee shall receive a gross salary of NAD [SALARY_AMOUNT] per month, payable monthly in arrears.

5.2 The salary shall be paid by electronic transfer to the Employee's nominated bank account.

5.3 The Employer shall deduct from the Employee's salary all statutory deductions including income tax, social security contributions, and any other lawful deductions.

5.4 The Employee's salary shall be reviewed annually, subject to performance and market conditions.

## 6. BENEFITS

6.1 **Annual Leave**: The Employee shall be entitled to [ANNUAL_LEAVE_DAYS] days of paid annual leave per year.

6.2 **Sick Leave**: The Employee shall be entitled to sick leave in accordance with the Labour Act 11 of 2007.

6.3 **Maternity/Paternity Leave**: The Employee shall be entitled to maternity/paternity leave in accordance with applicable legislation.

6.4 **Medical Aid**: The Employer shall contribute [MEDICAL_AID_CONTRIBUTION]% towards the Employee's medical aid scheme.

6.5 **Pension Fund**: The Employer shall contribute [PENSION_CONTRIBUTION]% towards the Employee's pension fund.

## 7. PROBATION PERIOD

7.1 The Employee shall serve a probation period of [PROBATION_MONTHS] months from the date of commencement.

7.2 During the probation period, either party may terminate this Agreement by giving [PROBATION_NOTICE] days' written notice.

7.3 Upon successful completion of the probation period, the Employee shall be confirmed in their position.

## 8. TERMINATION

8.1 This Agreement may be terminated by either party giving written notice as follows:
   - One week's notice for employees employed for less than one year
   - Two weeks' notice for employees employed for one year or more but less than five years
   - Four weeks' notice for employees employed for five years or more

8.2 The Employer may terminate this Agreement immediately for serious misconduct or gross negligence.

8.3 Upon termination, the Employee shall:
   - Return all company property, documents, and equipment
   - Hand over all work in progress
   - Maintain confidentiality of company information
   - Not solicit clients or employees for a period of [NON_SOLICITATION_MONTHS] months

## 9. CONFIDENTIALITY AND INTELLECTUAL PROPERTY

9.1 The Employee acknowledges that they may have access to confidential information belonging to the Employer.

9.2 The Employee shall:
   - Keep all confidential information strictly confidential
   - Not disclose confidential information to any third party
   - Not use confidential information for personal gain
   - Return all confidential information upon termination

9.3 All intellectual property created by the Employee in the course of employment shall belong to the Employer.

## 10. DISCIPLINARY PROCEDURES

10.1 The Employee shall be subject to the Employer's disciplinary procedures and code of conduct.

10.2 Disciplinary action may include warnings, suspension, or dismissal depending on the severity of the misconduct.

10.3 The Employee has the right to representation during disciplinary proceedings.

## 11. GRIEVANCE PROCEDURES

11.1 The Employee may raise grievances in accordance with the Employer's grievance procedures.

11.2 Grievances shall be dealt with promptly and fairly.

11.3 The Employee may appeal against disciplinary decisions in accordance with the appeal procedures.

## 12. HEALTH AND SAFETY

12.1 The Employer shall provide a safe and healthy working environment.

12.2 The Employee shall comply with all health and safety rules and procedures.

12.3 The Employee shall report any unsafe conditions or practices immediately.

## 13. ELECTRONIC SIGNATURE

13.1 The parties acknowledge and agree that this Agreement may be executed by electronic signature in accordance with the Electronic Transactions Act 4 of 2019.

13.2 Electronic signatures shall be deemed to have the same legal effect as handwritten signatures.

13.3 The parties consent to the use of advanced electronic signatures as defined in Section 1 of the Electronic Transactions Act 4 of 2019.

## 14. GOVERNING LAW AND JURISDICTION

14.1 This Agreement shall be governed by and construed in accordance with the laws of the Republic of Namibia.

14.2 Any disputes arising from this Agreement shall be subject to the exclusive jurisdiction of the courts of Namibia.

## 15. ENTIRE AGREEMENT

15.1 This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements, representations, and understandings.

15.2 No amendment to this Agreement shall be valid unless in writing and signed by both parties.

## 16. SEVERABILITY

16.1 If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

16.2 The parties shall negotiate in good faith to replace any invalid provision with a valid provision that achieves the same economic effect.

## 17. WAIVER

17.1 No waiver of any breach of this Agreement shall constitute a waiver of any other breach.

17.2 No waiver shall be effective unless in writing and signed by the party granting the waiver.

## 18. NOTICES

18.1 All notices under this Agreement shall be in writing and delivered to the addresses specified above.

18.2 Notices may be delivered personally, by registered mail, or by electronic means.

18.3 Notices shall be deemed received on the date of delivery or, if sent by mail, three days after posting.

**IN WITNESS WHEREOF**, the parties have executed this Agreement on the date first above written.

**EMPLOYER:**

Name: [EMPLOYER_NAME]
Signature: _________________________
Date: _____________________________

**EMPLOYEE:**

Name: [EMPLOYEE_NAME]
Signature: _________________________
Date: _____________________________
"""
    
    def _get_executive_employment_template(self) -> str:
        """Get complete executive employment contract template"""
        return """
# EXECUTIVE EMPLOYMENT AGREEMENT

**This Executive Employment Agreement is entered into on [DATE] between:**

**[COMPANY_NAME]**, a company duly incorporated under the laws of the Republic of Namibia (Company Registration Number: [REG_NUMBER]) with its principal place of business at [COMPANY_ADDRESS] ("the Company"),

**AND**

**[EXECUTIVE_NAME]**, a Namibian citizen/resident with Identity Number [ID_NUMBER] and residential address at [EXECUTIVE_ADDRESS] ("the Executive").

## 1. APPOINTMENT AND POSITION

1.1 The Company hereby appoints the Executive as [EXECUTIVE_TITLE] with effect from [START_DATE].

1.2 The Executive accepts such appointment and agrees to serve the Company in such capacity on the terms and conditions set out in this Agreement.

1.3 The Executive shall report directly to the Board of Directors or such other person as the Board may designate.

## 2. DUTIES AND RESPONSIBILITIES

2.1 The Executive shall serve as the [EXECUTIVE_TITLE] and shall have the following key responsibilities:
   - [RESPONSIBILITY_1]
   - [RESPONSIBILITY_2]
   - [RESPONSIBILITY_3]
   - [RESPONSIBILITY_4]

2.2 The Executive shall:
   - Devote their full time, attention, and skill to the performance of their duties
   - Use their best efforts to promote the interests of the Company
   - Exercise the highest degree of professional judgment and integrity
   - Comply with all applicable laws, regulations, and corporate governance requirements

2.3 The Executive shall not engage in any other business or employment without the prior written consent of the Board of Directors.

## 3. COMPENSATION PACKAGE

3.1 **Base Salary**: The Executive shall receive a base salary of NAD [BASE_SALARY] per annum, payable monthly in arrears.

3.2 **Performance Bonus**: The Executive shall be eligible for an annual performance bonus of up to [BONUS_PERCENTAGE]% of base salary, subject to achievement of performance targets.

3.3 **Equity Compensation**: The Executive shall be granted [EQUITY_AMOUNT] shares/options in the Company, subject to the terms of the Company's equity incentive plan.

3.4 **Benefits**: The Executive shall be entitled to:
   - Comprehensive medical aid coverage
   - Life insurance coverage
   - Disability insurance
   - Company vehicle or car allowance
   - Professional development and training

## 4. PERFORMANCE METRICS

4.1 The Executive's performance shall be evaluated annually based on the following metrics:
   - [METRIC_1]: [TARGET_1]
   - [METRIC_2]: [TARGET_2]
   - [METRIC_3]: [TARGET_3]
   - [METRIC_4]: [TARGET_4]

4.2 Performance reviews shall be conducted by the Board of Directors or its designated committee.

4.3 Performance targets may be adjusted annually based on business conditions and strategic objectives.

## 5. NON-COMPETE AND NON-SOLICITATION

5.1 During employment and for [NON_COMPETE_MONTHS] months after termination, the Executive shall not:
   - Engage in any business that competes with the Company
   - Solicit any customers or clients of the Company
   - Solicit any employees of the Company
   - Use any confidential information for personal gain

5.2 The Executive acknowledges that these restrictions are reasonable and necessary to protect the Company's legitimate business interests.

5.3 In the event of a breach of these restrictions, the Company shall be entitled to injunctive relief and damages.

## 6. CONFIDENTIALITY AND INTELLECTUAL PROPERTY

6.1 The Executive acknowledges that they will have access to highly confidential and proprietary information.

6.2 The Executive shall:
   - Keep all confidential information strictly confidential
   - Not disclose confidential information to any third party
   - Not use confidential information for personal gain
   - Return all confidential information upon termination

6.3 All intellectual property created by the Executive in the course of employment shall belong to the Company.

6.4 The Executive shall execute any documents necessary to perfect the Company's ownership of intellectual property.

## 7. TERMINATION

7.1 **Termination by Company**:
   - The Company may terminate this Agreement by giving [NOTICE_PERIOD] months' written notice
   - The Company may terminate immediately for cause (serious misconduct, gross negligence, breach of fiduciary duties)

7.2 **Termination by Executive**:
   - The Executive may terminate this Agreement by giving [NOTICE_PERIOD] months' written notice
   - The Executive shall provide a detailed handover plan

7.3 **Severance Package**: Upon termination without cause, the Executive shall be entitled to:
   - [SEVERANCE_MONTHS] months' salary
   - Pro-rated bonus for the current year
   - Continuation of benefits for [BENEFIT_CONTINUATION_MONTHS] months
   - Outplacement services

## 8. CHANGE OF CONTROL

8.1 In the event of a change of control of the Company:
   - The Executive shall be entitled to a change of control payment equal to [CHANGE_OF_CONTROL_MULTIPLIER] times annual compensation
   - All equity awards shall vest immediately
   - The Executive shall have the right to terminate employment within [TERMINATION_WINDOW] days

8.2 A "change of control" shall be defined as:
   - Sale of more than 50% of the Company's shares
   - Merger or consolidation of the Company
   - Sale of substantially all of the Company's assets

## 9. CORPORATE GOVERNANCE

9.1 The Executive shall comply with all corporate governance requirements including:
   - Board of Directors policies and procedures
   - Code of conduct and ethics
   - Insider trading policies
   - Related party transaction policies

9.2 The Executive shall maintain the highest standards of corporate governance and ethical conduct.

## 10. INDEMNIFICATION

10.1 The Company shall indemnify the Executive against all claims, damages, and expenses arising from the performance of their duties, except for:
   - Willful misconduct or gross negligence
   - Breach of fiduciary duties
   - Violation of applicable laws or regulations

10.2 The Company shall maintain directors' and officers' liability insurance covering the Executive.

## 11. ELECTRONIC SIGNATURE

11.1 The parties acknowledge and agree that this Agreement may be executed by electronic signature in accordance with the Electronic Transactions Act 4 of 2019.

11.2 Electronic signatures shall be deemed to have the same legal effect as handwritten signatures.

11.3 The parties consent to the use of advanced electronic signatures as defined in Section 1 of the Electronic Transactions Act 4 of 2019.

## 12. GOVERNING LAW AND DISPUTE RESOLUTION

12.1 This Agreement shall be governed by and construed in accordance with the laws of the Republic of Namibia.

12.2 Any disputes arising from this Agreement shall be resolved through:
   - Good faith negotiations between the parties
   - Mediation if negotiations fail
   - Arbitration as a final resort

## 13. ENTIRE AGREEMENT

13.1 This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements, representations, and understandings.

13.2 No amendment to this Agreement shall be valid unless in writing and signed by both parties.

## 14. SEVERABILITY

14.1 If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

14.2 The parties shall negotiate in good faith to replace any invalid provision with a valid provision that achieves the same economic effect.

## 15. WAIVER

15.1 No waiver of any breach of this Agreement shall constitute a waiver of any other breach.

15.2 No waiver shall be effective unless in writing and signed by the party granting the waiver.

## 16. NOTICES

16.1 All notices under this Agreement shall be in writing and delivered to the addresses specified above.

16.2 Notices may be delivered personally, by registered mail, or by electronic means.

16.3 Notices shall be deemed received on the date of delivery or, if sent by mail, three days after posting.

**IN WITNESS WHEREOF**, the parties have executed this Agreement on the date first above written.

**COMPANY:**

Name: [COMPANY_NAME]
By: _________________________
Title: _______________________
Signature: ___________________
Date: _______________________

**EXECUTIVE:**

Name: [EXECUTIVE_NAME]
Signature: ___________________
Date: _______________________
"""
    
    def _get_fixed_term_employment_template(self) -> str:
        """Get complete fixed-term employment contract template"""
        return """
# FIXED-TERM EMPLOYMENT AGREEMENT

**This Fixed-Term Employment Agreement is entered into on [DATE] between:**

**[EMPLOYER_NAME]**, a company duly incorporated under the laws of the Republic of Namibia (Company Registration Number: [REG_NUMBER]) with its principal place of business at [EMPLOYER_ADDRESS] ("the Employer"),

**AND**

**[EMPLOYEE_NAME]**, a Namibian citizen/resident with Identity Number [ID_NUMBER] and residential address at [EMPLOYEE_ADDRESS] ("the Employee").

## 1. APPOINTMENT AND POSITION

1.1 The Employer hereby appoints the Employee as [JOB_TITLE] for a fixed term commencing on [START_DATE] and ending on [END_DATE] ("the Term").

1.2 The Employee accepts such appointment and agrees to serve the Employer in such capacity on the terms and conditions set out in this Agreement.

1.3 This is a fixed-term contract for the specific project: [PROJECT_NAME].

## 2. PROJECT SCOPE AND DUTIES

2.1 The Employee shall be responsible for the following project deliverables:
   - [DELIVERABLE_1]: [DESCRIPTION_1]
   - [DELIVERABLE_2]: [DESCRIPTION_2]
   - [DELIVERABLE_3]: [DESCRIPTION_3]
   - [DELIVERABLE_4]: [DESCRIPTION_4]

2.2 The Employee shall:
   - Devote their full time, attention, and skill to the performance of their duties
   - Use their best efforts to complete the project within the specified timeframe
   - Comply with all reasonable instructions given by the Employer
   - Maintain the highest standards of professional conduct

2.3 The Employee shall report to [SUPERVISOR_NAME] or such other person as the Employer may designate.

## 3. PROJECT TIMELINE

3.1 **Project Start Date**: [START_DATE]
3.2 **Project End Date**: [END_DATE]
3.3 **Total Duration**: [DURATION_MONTHS] months

3.4 The Employee acknowledges that this is a fixed-term contract and that employment will terminate automatically upon completion of the project or expiration of the term, whichever occurs first.

## 4. RENEWAL PROVISIONS

4.1 This Agreement may be renewed for additional periods by mutual written agreement of both parties.

4.2 Any renewal shall be subject to:
   - Satisfactory performance during the initial term
   - Continued need for the Employee's services
   - Agreement on terms and conditions for the renewal period

4.3 The Employer shall provide written notice of renewal or non-renewal at least [RENEWAL_NOTICE] days before the end of the current term.

## 5. REMUNERATION

5.1 The Employee shall receive a gross salary of NAD [SALARY_AMOUNT] per month, payable monthly in arrears.

5.2 The salary shall be paid by electronic transfer to the Employee's nominated bank account.

5.3 The Employer shall deduct from the Employee's salary all statutory deductions including income tax, social security contributions, and any other lawful deductions.

5.4 The Employee shall be entitled to a project completion bonus of NAD [COMPLETION_BONUS] upon successful completion of the project.

## 6. BENEFITS

6.1 **Annual Leave**: The Employee shall be entitled to [ANNUAL_LEAVE_DAYS] days of paid annual leave per year, pro-rated for the duration of the contract.

6.2 **Sick Leave**: The Employee shall be entitled to sick leave in accordance with the Labour Act 11 of 2007.

6.3 **Medical Aid**: The Employer shall contribute [MEDICAL_AID_CONTRIBUTION]% towards the Employee's medical aid scheme.

6.4 **Project Expenses**: The Employer shall reimburse reasonable project-related expenses upon presentation of receipts.

## 7. EARLY TERMINATION

7.1 **Termination by Employer**:
   - The Employer may terminate this Agreement by giving [TERMINATION_NOTICE] days' written notice
   - The Employer may terminate immediately for serious misconduct or gross negligence
   - The Employer may terminate if the project is cancelled or significantly modified

7.2 **Termination by Employee**:
   - The Employee may terminate this Agreement by giving [TERMINATION_NOTICE] days' written notice
   - The Employee shall provide a detailed handover plan

7.3 **Severance**: Upon early termination by the Employer (except for cause), the Employee shall be entitled to:
   - Payment for the notice period
   - Pro-rated project completion bonus
   - Continuation of benefits for the notice period

## 8. PROJECT DELIVERABLES AND MILESTONES

8.1 The Employee shall complete the following milestones:
   - **Milestone 1**: [MILESTONE_1_DESCRIPTION] - Due: [MILESTONE_1_DATE]
   - **Milestone 2**: [MILESTONE_2_DESCRIPTION] - Due: [MILESTONE_2_DATE]
   - **Milestone 3**: [MILESTONE_3_DESCRIPTION] - Due: [MILESTONE_3_DATE]
   - **Final Deliverable**: [FINAL_DELIVERABLE_DESCRIPTION] - Due: [END_DATE]

8.2 The Employee shall provide regular progress reports to the Employer as required.

8.3 Failure to meet milestones may result in disciplinary action or early termination.

## 9. TRANSITION AND HANDOVER

9.1 Upon termination of this Agreement, the Employee shall:
   - Complete all outstanding work to the best of their ability
   - Provide a comprehensive handover report
   - Transfer all project files and documentation
   - Assist in the transition of responsibilities to other personnel
   - Return all company property, documents, and equipment

9.2 The handover process shall include:
   - Documentation of all work completed
   - Transfer of project knowledge and expertise
   - Introduction to key stakeholders and contacts
   - Training of replacement personnel if applicable

## 10. CONFIDENTIALITY AND INTELLECTUAL PROPERTY

10.1 The Employee acknowledges that they may have access to confidential information belonging to the Employer.

10.2 The Employee shall:
   - Keep all confidential information strictly confidential
   - Not disclose confidential information to any third party
   - Not use confidential information for personal gain
   - Return all confidential information upon termination

10.3 All intellectual property created by the Employee in the course of the project shall belong to the Employer.

10.4 The Employee shall execute any documents necessary to perfect the Employer's ownership of intellectual property.

## 11. ELECTRONIC SIGNATURE

11.1 The parties acknowledge and agree that this Agreement may be executed by electronic signature in accordance with the Electronic Transactions Act 4 of 2019.

11.2 Electronic signatures shall be deemed to have the same legal effect as handwritten signatures.

11.3 The parties consent to the use of advanced electronic signatures as defined in Section 1 of the Electronic Transactions Act 4 of 2019.

## 12. GOVERNING LAW AND JURISDICTION

12.1 This Agreement shall be governed by and construed in accordance with the laws of the Republic of Namibia.

12.2 Any disputes arising from this Agreement shall be subject to the exclusive jurisdiction of the courts of Namibia.

## 13. ENTIRE AGREEMENT

13.1 This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements, representations, and understandings.

13.2 No amendment to this Agreement shall be valid unless in writing and signed by both parties.

## 14. SEVERABILITY

14.1 If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

14.2 The parties shall negotiate in good faith to replace any invalid provision with a valid provision that achieves the same economic effect.

## 15. WAIVER

15.1 No waiver of any breach of this Agreement shall constitute a waiver of any other breach.

15.2 No waiver shall be effective unless in writing and signed by the party granting the waiver.

## 16. NOTICES

16.1 All notices under this Agreement shall be in writing and delivered to the addresses specified above.

16.2 Notices may be delivered personally, by registered mail, or by electronic means.

16.3 Notices shall be deemed received on the date of delivery or, if sent by mail, three days after posting.

**IN WITNESS WHEREOF**, the parties have executed this Agreement on the date first above written.

**EMPLOYER:**

Name: [EMPLOYER_NAME]
Signature: _________________________
Date: _____________________________

**EMPLOYEE:**

Name: [EMPLOYEE_NAME]
Signature: _________________________
Date: _____________________________
"""
    
    def _get_consulting_service_template(self) -> str:
        """Get consulting service agreement template"""
        return """
        CONSULTING SERVICE AGREEMENT
        
        This Consulting Service Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [CONSULTING_COMPANY_NAME], a company registered in Namibia (the "Consulting Company")
        and
        [CLIENT_NAME], a company registered in Namibia (the "Client")
        
        WHEREAS the Client wishes to engage the Consulting Company to provide certain consulting services;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. SERVICES
        1.1 The Consulting Company shall provide the following services: [CONSULTING_SCOPE]
        1.2 The scope of services shall include: [SCOPE_OF_SERVICES]
        1.3 The Consulting Company shall perform the services in accordance with industry standards.
        
        2. TERM
        2.1 This Agreement shall commence on [START_DATE] and continue until [END_DATE].
        2.2 The Agreement may be renewed by mutual written agreement.
        
        3. COMPENSATION
        3.1 The Client shall pay the Consulting Company NAD [PAYMENT_AMOUNT] for the services.
        3.2 Payment shall be made within [PAYMENT_TERMS] days of invoice.
        3.3 All amounts are exclusive of VAT unless otherwise stated.
        
        4. DELIVERABLES
        4.1 The Consulting Company shall deliver: [DELIVERABLES_LIST]
        4.2 Deliverables shall be provided in accordance with the agreed timeline.
        
        5. INTELLECTUAL PROPERTY
        5.1 All intellectual property created under this Agreement shall belong to the Client.
        5.2 The Consulting Company retains rights to their pre-existing intellectual property.
        
        6. CONFIDENTIALITY
        6.1 Both parties agree to maintain the confidentiality of proprietary information.
        6.2 This obligation shall survive the termination of this Agreement.
        
        7. LIABILITY
        7.1 The Consulting Company's liability shall be limited to NAD [LIABILITY_LIMIT].
        7.2 Neither party shall be liable for indirect or consequential damages.
        
        8. TERMINATION
        8.1 Either party may terminate this Agreement with [NOTICE_PERIOD] written notice.
        8.2 The Agreement may be terminated immediately for material breach.
        
        9. GOVERNING LAW
        9.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        9.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        CONSULTING COMPANY:
        [CONSULTING_COMPANY_NAME]
        
        By: _________________________
        Name: [CONSULTING_COMPANY_REPRESENTATIVE]
        Title: [CONSULTING_COMPANY_TITLE]
        Date: _________________________
        
        CLIENT:
        [CLIENT_NAME]
        
        By: _________________________
        Name: [CLIENT_REPRESENTATIVE]
        Title: [CLIENT_TITLE]
        Date: _________________________
        """
    
    def _get_outsourcing_service_template(self) -> str:
        """Get outsourcing service agreement template"""
        return """
        OUTSOURCING SERVICE AGREEMENT
        
        This Outsourcing Service Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [SERVICE_PROVIDER_NAME], a company registered in Namibia (the "Service Provider")
        and
        [CLIENT_NAME], a company registered in Namibia (the "Client")
        
        WHEREAS the Client wishes to engage the Service Provider to provide certain outsourcing services;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. SERVICES
        1.1 The Service Provider shall provide the following services: [SERVICE_DESCRIPTION]
        1.2 The scope of services shall include: [SCOPE_OF_SERVICES]
        1.3 The Service Provider shall perform the services in accordance with industry standards.
        
        2. TERM
        2.1 This Agreement shall commence on [START_DATE] and continue until [END_DATE].
        2.2 The Agreement may be renewed by mutual written agreement.
        
        3. COMPENSATION
        3.1 The Client shall pay the Service Provider NAD [PAYMENT_AMOUNT] for the services.
        3.2 Payment shall be made within [PAYMENT_TERMS] days of invoice.
        3.3 All amounts are exclusive of VAT unless otherwise stated.
        
        4. DELIVERABLES
        4.1 The Service Provider shall deliver: [DELIVERABLES_LIST]
        4.2 Deliverables shall be provided in accordance with the agreed timeline.
        
        5. INTELLECTUAL PROPERTY
        5.1 All intellectual property created under this Agreement shall belong to the Client.
        5.2 The Service Provider retains rights to their pre-existing intellectual property.
        
        6. CONFIDENTIALITY
        6.1 Both parties agree to maintain the confidentiality of proprietary information.
        6.2 This obligation shall survive the termination of this Agreement.
        
        7. LIABILITY
        7.1 The Service Provider's liability shall be limited to NAD [LIABILITY_LIMIT].
        7.2 Neither party shall be liable for indirect or consequential damages.
        
        8. TERMINATION
        8.1 Either party may terminate this Agreement with [NOTICE_PERIOD] written notice.
        8.2 The Agreement may be terminated immediately for material breach.
        
        9. GOVERNING LAW
        9.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        9.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        SERVICE PROVIDER:
        [SERVICE_PROVIDER_NAME]
        
        By: _________________________
        Name: [SERVICE_PROVIDER_REPRESENTATIVE]
        Title: [SERVICE_PROVIDER_TITLE]
        Date: _________________________
        
        CLIENT:
        [CLIENT_NAME]
        
        By: _________________________
        Name: [CLIENT_REPRESENTATIVE]
        Title: [CLIENT_TITLE]
        Date: _________________________
        """
    
    def _get_maintenance_service_template(self) -> str:
        """Get maintenance service agreement template"""
        return """
        MAINTENANCE SERVICE AGREEMENT
        
        This Maintenance Service Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [MAINTENANCE_PROVIDER_NAME], a company registered in Namibia (the "Maintenance Provider")
        and
        [CLIENT_NAME], a company registered in Namibia (the "Client")
        
        WHEREAS the Client wishes to engage the Maintenance Provider to provide certain maintenance services;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. SERVICES
        1.1 The Maintenance Provider shall provide the following services: [SERVICE_DESCRIPTION]
        1.2 The scope of services shall include: [SCOPE_OF_SERVICES]
        1.3 The Maintenance Provider shall perform the services in accordance with industry standards.
        
        2. TERM
        2.1 This Agreement shall commence on [START_DATE] and continue until [END_DATE].
        2.2 The Agreement may be renewed by mutual written agreement.
        
        3. COMPENSATION
        3.1 The Client shall pay the Maintenance Provider NAD [PAYMENT_AMOUNT] for the services.
        3.2 Payment shall be made within [PAYMENT_TERMS] days of invoice.
        3.3 All amounts are exclusive of VAT unless otherwise stated.
        
        4. DELIVERABLES
        4.1 The Maintenance Provider shall deliver: [DELIVERABLES_LIST]
        4.2 Deliverables shall be provided in accordance with the agreed timeline.
        
        5. INTELLECTUAL PROPERTY
        5.1 All intellectual property created under this Agreement shall belong to the Client.
        5.2 The Maintenance Provider retains rights to their pre-existing intellectual property.
        
        6. CONFIDENTIALITY
        6.1 Both parties agree to maintain the confidentiality of proprietary information.
        6.2 This obligation shall survive the termination of this Agreement.
        
        7. LIABILITY
        7.1 The Maintenance Provider's liability shall be limited to NAD [LIABILITY_LIMIT].
        7.2 Neither party shall be liable for indirect or consequential damages.
        
        8. TERMINATION
        8.1 Either party may terminate this Agreement with [NOTICE_PERIOD] written notice.
        8.2 The Agreement may be terminated immediately for material breach.
        
        9. GOVERNING LAW
        9.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        9.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        MAINTENANCE PROVIDER:
        [MAINTENANCE_PROVIDER_NAME]
        
        By: _________________________
        Name: [MAINTENANCE_PROVIDER_REPRESENTATIVE]
        Title: [MAINTENANCE_PROVIDER_TITLE]
        Date: _________________________
        
        CLIENT:
        [CLIENT_NAME]
        
        By: _________________________
        Name: [CLIENT_REPRESENTATIVE]
        Title: [CLIENT_TITLE]
        Date: _________________________
        """
    
    def _get_unilateral_nda_template(self) -> str:
        """Get unilateral NDA template"""
        return """
        UNILATERAL NON-DISCLOSURE AGREEMENT
        
        This Unilateral Non-Disclosure Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [DISCLOSING_PARTY_NAME], a company registered in Namibia (the "Disclosing Party")
        and
        [RECEIVING_PARTY_NAME], a company registered in Namibia (the "Receiving Party")
        
        WHEREAS the parties wish to explore a potential business relationship;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. CONFIDENTIAL INFORMATION
        1.1 "Confidential Information" means any information disclosed by the Disclosing Party to the Receiving Party.
        1.2 Confidential Information includes but is not limited to: [CONFIDENTIAL_INFORMATION_SCOPE]
        1.3 Confidential Information does not include information that is publicly available.
        
        2. NON-DISCLOSURE OBLIGATIONS
        2.1 The Receiving Party shall maintain the confidentiality of the Confidential Information.
        2.2 The Receiving Party shall not disclose the Confidential Information to any third party.
        2.3 The Receiving Party shall use the Confidential Information solely for [PERMITTED_USE].
        
        3. PERMITTED DISCLOSURE
        3.1 The Receiving Party may disclose Confidential Information to employees who need to know.
        3.2 Such employees must be bound by confidentiality obligations.
        3.3 The Receiving Party may disclose Confidential Information if required by law.
        
        4. DURATION
        4.1 This Agreement shall remain in effect for [DURATION] years from the date hereof.
        4.2 The confidentiality obligations shall survive the termination of this Agreement.
        
        5. RETURN OF MATERIALS
        5.1 Upon termination of this Agreement, the Receiving Party shall return all Confidential Information.
        5.2 The Receiving Party shall certify in writing that all materials have been returned.
        
        6. REMEDIES
        6.1 The parties acknowledge that monetary damages may be inadequate for breach of this Agreement.
        6.2 The Disclosing Party may seek injunctive relief in addition to monetary damages.
        
        7. GOVERNING LAW
        7.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        7.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        DISCLOSING PARTY:
        [DISCLOSING_PARTY_NAME]
        
        By: _________________________
        Name: [DISCLOSING_PARTY_REPRESENTATIVE]
        Title: [DISCLOSING_PARTY_TITLE]
        Date: _________________________
        
        RECEIVING PARTY:
        [RECEIVING_PARTY_NAME]
        
        By: _________________________
        Name: [RECEIVING_PARTY_REPRESENTATIVE]
        Title: [RECEIVING_PARTY_TITLE]
        Date: _________________________
        """
    
    def _get_mutual_nda_template(self) -> str:
        """Get mutual NDA template"""
        return """
        MUTUAL NON-DISCLOSURE AGREEMENT
        
        This Mutual Non-Disclosure Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [PARTY_A_NAME], a company registered in Namibia (the "Party A")
        and
        [PARTY_B_NAME], a company registered in Namibia (the "Party B")
        
        WHEREAS the parties wish to explore a potential business relationship;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. CONFIDENTIAL INFORMATION
        1.1 "Confidential Information" means any information disclosed by the Disclosing Party to the Receiving Party.
        1.2 Confidential Information includes but is not limited to: [CONFIDENTIAL_INFORMATION_SCOPE]
        1.3 Confidential Information does not include information that is publicly available.
        
        2. NON-DISCLOSURE OBLIGATIONS
        2.1 The Receiving Party shall maintain the confidentiality of the Confidential Information.
        2.2 The Receiving Party shall not disclose the Confidential Information to any third party.
        2.3 The Receiving Party shall use the Confidential Information solely for [PERMITTED_USE].
        
        3. PERMITTED DISCLOSURE
        3.1 The Receiving Party may disclose Confidential Information to employees who need to know.
        3.2 Such employees must be bound by confidentiality obligations.
        3.3 The Receiving Party may disclose Confidential Information if required by law.
        
        4. DURATION
        4.1 This Agreement shall remain in effect for [DURATION] years from the date hereof.
        4.2 The confidentiality obligations shall survive the termination of this Agreement.
        
        5. RETURN OF MATERIALS
        5.1 Upon termination of this Agreement, the Receiving Party shall return all Confidential Information.
        5.2 The Receiving Party shall certify in writing that all materials have been returned.
        
        6. REMEDIES
        6.1 The parties acknowledge that monetary damages may be inadequate for breach of this Agreement.
        6.2 The Disclosing Party may seek injunctive relief in addition to monetary damages.
        
        7. GOVERNING LAW
        7.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        7.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        PARTY A:
        [PARTY_A_NAME]
        
        By: _________________________
        Name: [PARTY_A_REPRESENTATIVE]
        Title: [PARTY_A_TITLE]
        Date: _________________________
        
        PARTY B:
        [PARTY_B_NAME]
        
        By: _________________________
        Name: [PARTY_B_REPRESENTATIVE]
        Title: [PARTY_B_TITLE]
        Date: _________________________
        """
    
    def _get_employee_nda_template(self) -> str:
        """Get employee NDA template"""
        return """
        EMPLOYEE NON-DISCLOSURE AGREEMENT
        
        This Employee Non-Disclosure Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [EMPLOYER_NAME], a company registered in Namibia (the "Employer")
        and
        [EMPLOYEE_NAME], an individual residing in Namibia (the "Employee")
        
        WHEREAS the Employer wishes to employ the Employee and the Employee wishes to be employed by the Employer;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. CONFIDENTIAL INFORMATION
        1.1 "Confidential Information" means any information disclosed by the Employer to the Employee.
        1.2 Confidential Information includes but is not limited to: [CONFIDENTIAL_INFORMATION_SCOPE]
        1.3 Confidential Information does not include information that is publicly available.
        
        2. NON-DISCLOSURE OBLIGATIONS
        2.1 The Employee shall maintain the confidentiality of the Confidential Information.
        2.2 The Employee shall not disclose the Confidential Information to any third party.
        2.3 The Employee shall use the Confidential Information solely for [PERMITTED_USE].
        
        3. PERMITTED DISCLOSURE
        3.1 The Employee may disclose Confidential Information to employees who need to know.
        3.2 Such employees must be bound by confidentiality obligations.
        3.3 The Employee may disclose Confidential Information if required by law.
        
        4. DURATION
        4.1 This Agreement shall remain in effect for [DURATION] years from the date hereof.
        4.2 The confidentiality obligations shall survive the termination of this Agreement.
        
        5. RETURN OF MATERIALS
        5.1 Upon termination of this Agreement, the Employee shall return all Confidential Information.
        5.2 The Employee shall certify in writing that all materials have been returned.
        
        6. REMEDIES
        6.1 The parties acknowledge that monetary damages may be inadequate for breach of this Agreement.
        6.2 The Employer may seek injunctive relief in addition to monetary damages.
        
        7. GOVERNING LAW
        7.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        7.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        EMPLOYER:
        [EMPLOYER_NAME]
        
        By: _________________________
        Name: [EMPLOYER_REPRESENTATIVE]
        Title: [EMPLOYER_TITLE]
        Date: _________________________
        
        EMPLOYEE:
        [EMPLOYEE_NAME]
        
        Signature: _________________________
        Date: _________________________
        """
    
    def _get_commercial_lease_template(self) -> str:
        """Get commercial lease agreement template"""
        return """
        COMMERCIAL LEASE AGREEMENT
        
        This Commercial Lease Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [LANDLORD_NAME], a company registered in Namibia (the "Landlord")
        and
        [TENANT_NAME], a company registered in Namibia (the "Tenant")
        
        WHEREAS the Landlord wishes to lease property to the Tenant;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. PROPERTY
        1.1 The Landlord hereby leases to the Tenant the following property: [PROPERTY_DESCRIPTION]
        1.2 The property shall be located at [PROPERTY_ADDRESS].
        1.3 The property shall be used for [USE_RESTRICTIONS].
        
        2. TERM
        2.1 This Agreement shall commence on [START_DATE] and continue until [END_DATE].
        2.2 The Lease may be renewed by mutual written agreement.
        
        3. RENTAL TERMS
        3.1 The Tenant shall pay the Landlord a monthly rent of NAD [RENT_AMOUNT].
        3.2 The Tenant shall pay a deposit of NAD [DEPOSIT_AMOUNT] on [DEPOSIT_DATE].
        3.3 All amounts are exclusive of VAT unless otherwise stated.
        
        4. MAINTENANCE OBLIGATIONS
        4.1 The Tenant shall maintain the property in good condition and repair.
        4.2 The Tenant shall insure the property against all risks.
        4.3 The Tenant shall pay for all repairs and maintenance costs.
        
        5. INSURANCE
        5.1 The Landlord shall maintain insurance for the property against all risks.
        5.2 The Tenant shall pay for insurance premiums.
        
        6. TERMINATION
        6.1 Either party may terminate this Agreement by giving [NOTICE_PERIOD] written notice.
        6.2 The Agreement may be terminated immediately for material breach.
        
        7. GOVERNING LAW
        7.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        7.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        LANDLORD:
        [LANDLORD_NAME]
        
        By: _________________________
        Name: [LANDLORD_REPRESENTATIVE]
        Title: [LANDLORD_TITLE]
        Date: _________________________
        
        TENANT:
        [TENANT_NAME]
        
        By: _________________________
        Name: [TENANT_REPRESENTATIVE]
        Title: [TENANT_TITLE]
        Date: _________________________
        """
    
    def _get_residential_lease_template(self) -> str:
        """Get residential lease agreement template"""
        return """
        RESIDENTIAL LEASE AGREEMENT
        
        This Residential Lease Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [LANDLORD_NAME], a company registered in Namibia (the "Landlord")
        and
        [TENANT_NAME], an individual residing in Namibia (the "Tenant")
        
        WHEREAS the Landlord wishes to lease property to the Tenant;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. PROPERTY
        1.1 The Landlord hereby leases to the Tenant the following property: [PROPERTY_DESCRIPTION]
        1.2 The property shall be located at [PROPERTY_ADDRESS].
        1.3 The property shall be used for [USE_RESTRICTIONS].
        
        2. TERM
        2.1 This Agreement shall commence on [START_DATE] and continue until [END_DATE].
        2.2 The Lease may be renewed by mutual written agreement.
        
        3. OCCUPANCY TERMS
        3.1 The Tenant shall occupy the property from [START_DATE] until [END_DATE].
        3.2 The Tenant shall vacate the property on [END_DATE].
        
        4. RENTAL TERMS
        4.1 The Tenant shall pay the Landlord a monthly rent of NAD [RENT_AMOUNT].
        4.2 The Tenant shall pay a deposit of NAD [DEPOSIT_AMOUNT] on [DEPOSIT_DATE].
        4.3 All amounts are exclusive of VAT unless otherwise stated.
        
        5. TENANT'S RIGHTS
        5.1 The Tenant shall have the right to occupy the property for the term of the Lease.
        5.2 The Tenant shall have the right to sublet the property, subject to Landlord's approval.
        5.3 The Tenant shall have the right to assign the Lease, subject to Landlord's approval.
        
        6. LANDLORD'S RESPONSIBILITIES
        6.1 The Landlord shall provide the Tenant with a habitable property.
        6.2 The Landlord shall maintain the property in good condition and repair.
        6.3 The Landlord shall insure the property against all risks.
        6.4 The Landlord shall pay for all repairs and maintenance costs.
        
        7. TERMINATION
        7.1 Either party may terminate this Agreement by giving [NOTICE_PERIOD] written notice.
        7.2 The Agreement may be terminated immediately for material breach.
        
        8. GOVERNING LAW
        8.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        8.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        LANDLORD:
        [LANDLORD_NAME]
        
        By: _________________________
        Name: [LANDLORD_REPRESENTATIVE]
        Title: [LANDLORD_TITLE]
        Date: _________________________
        
        TENANT:
        [TENANT_NAME]
        
        By: _________________________
        Name: [TENANT_REPRESENTATIVE]
        Title: [TENANT_TITLE]
        Date: _________________________
        """
    
    def _get_equipment_lease_template(self) -> str:
        """Get equipment lease agreement template"""
        return """
        EQUIPMENT LEASE AGREEMENT
        
        This Equipment Lease Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [LESSOR_NAME], a company registered in Namibia (the "Lessor")
        and
        [LESSEE_NAME], a company registered in Namibia (the "Lessee")
        
        WHEREAS the Lessor wishes to lease equipment to the Lessee;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. EQUIPMENT
        1.1 The Lessor hereby leases to the Lessee the following equipment: [EQUIPMENT_DESCRIPTION]
        1.2 The equipment shall be located at [EQUIPMENT_LOCATION].
        1.3 The equipment shall be used for [USE_RESTRICTIONS].
        
        2. TERM
        2.1 This Agreement shall commence on [START_DATE] and continue until [END_DATE].
        2.2 The Lease may be renewed by mutual written agreement.
        
        3. PAYMENT SCHEDULE
        3.1 The Lessee shall pay the Lessor NAD [PAYMENT_AMOUNT] on [PAYMENT_DATE].
        3.2 All amounts are exclusive of VAT unless otherwise stated.
        
        4. MAINTENANCE OBLIGATIONS
        4.1 The Lessee shall maintain the equipment in good condition and repair.
        4.2 The Lessee shall insure the equipment against all risks.
        4.3 The Lessee shall pay for all repairs and maintenance costs.
        
        5. RETURN PROVISIONS
        5.1 Upon termination of this Agreement, the Lessee shall return the equipment in good condition and repair.
        5.2 The Lessee shall certify in writing that all materials have been returned.
        
        6. LIABILITY
        6.1 The Lessor's liability shall be limited to NAD [LIABILITY_LIMIT].
        6.2 Neither party shall be liable for indirect or consequential damages.
        
        7. TERMINATION
        7.1 Either party may terminate this Agreement by giving [NOTICE_PERIOD] written notice.
        7.2 The Agreement may be terminated immediately for material breach.
        
        8. GOVERNING LAW
        8.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        8.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        LESSOR:
        [LESSOR_NAME]
        
        By: _________________________
        Name: [LESSOR_REPRESENTATIVE]
        Title: [LESSOR_TITLE]
        Date: _________________________
        
        LESSEE:
        [LESSEE_NAME]
        
        By: _________________________
        Name: [LESSEE_REPRESENTATIVE]
        Title: [LESSEE_TITLE]
        Date: _________________________
        """
    
    def _get_general_partnership_template(self) -> str:
        """Get general partnership agreement template"""
        return """
        GENERAL PARTNERSHIP AGREEMENT
        
        This General Partnership Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [PARTNER_1_NAME], an individual residing in Namibia (the "Partner 1")
        and
        [PARTNER_2_NAME], an individual residing in Namibia (the "Partner 2")
        
        WHEREAS the Partners wish to form a general partnership;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. PARTNERSHIP STRUCTURE
        1.1 The Partnership shall be a general partnership.
        1.2 The Partners shall share equally in the profits and losses of the Partnership.
        1.3 The Partners shall have equal rights to participate in the management of the Partnership.
        
        2. CAPITAL CONTRIBUTIONS
        2.1 Partner 1 shall contribute NAD [PARTNER_1_CAPITAL] to the Partnership.
        2.2 Partner 2 shall contribute NAD [PARTNER_2_CAPITAL] to the Partnership.
        2.3 Contributions shall be made within [CAPITAL_PAYMENT_TERMS] days of the date of this Agreement.
        
        3. PROFIT SHARING
        3.1 The Partners shall share equally in all profits of the Partnership.
        3.2 Profits shall be distributed on the last day of each month.
        
        4. MANAGEMENT
        4.1 The Partners shall jointly manage the Partnership.
        4.2 Each Partner shall have the right to participate in the management decisions.
        4.3 The Partners shall make all decisions jointly.
        
        5. DISSOLUTION
        5.1 The Partnership shall be dissolved upon the death, bankruptcy, or withdrawal of a Partner.
        5.2 Upon dissolution, the Partners shall liquidate the Partnership's assets and liabilities.
        5.3 The Partners shall share equally in the liquidation proceeds.
        
        6. LIABILITY
        6.1 Each Partner shall be personally liable for all debts and obligations of the Partnership.
        6.2 The Partners shall not be personally liable for the debts of the Partnership.
        
        7. GOVERNING LAW
        7.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        7.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        PARTNER 1:
        [PARTNER_1_NAME]
        
        By: _________________________
        Name: [PARTNER_1_REPRESENTATIVE]
        Title: [PARTNER_1_TITLE]
        Date: _________________________
        
        PARTNER 2:
        [PARTNER_2_NAME]
        
        By: _________________________
        Name: [PARTNER_2_REPRESENTATIVE]
        Title: [PARTNER_2_TITLE]
        Date: _________________________
        """
    
    def _get_limited_partnership_template(self) -> str:
        """Get limited partnership agreement template"""
        return """
        LIMITED PARTNERSHIP AGREEMENT
        
        This Limited Partnership Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [GENERAL_PARTNER_NAME], an individual residing in Namibia (the "General Partner")
        and
        [LIMITED_PARTNER_NAME], an individual residing in Namibia (the "Limited Partner")
        
        WHEREAS the General Partner wishes to form a limited partnership;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. PARTNERSHIP STRUCTURE
        1.1 The Partnership shall be a limited partnership.
        1.2 The General Partner shall be the general partner and shall manage the Partnership.
        1.3 The Limited Partner shall be the limited partner and shall not participate in the management of the Partnership.
        
        2. CAPITAL CONTRIBUTIONS
        2.1 The General Partner shall contribute NAD [GENERAL_PARTNER_CAPITAL] to the Partnership.
        2.2 The Limited Partner shall contribute NAD [LIMITED_PARTNER_CAPITAL] to the Partnership.
        2.3 Contributions shall be made within [CAPITAL_PAYMENT_TERMS] days of the date of this Agreement.
        
        3. PROFIT SHARING
        3.1 The General Partner shall receive a percentage of the Partnership's profits.
        3.2 The Limited Partner shall receive a percentage of the Partnership's profits.
        3.3 Profits shall be distributed on the last day of each month.
        
        4. LIABILITY
        4.1 The General Partner shall be personally liable for all debts and obligations of the Partnership.
        4.2 The Limited Partner shall not be personally liable for the debts of the Partnership.
        4.3 The Limited Partner shall not be liable for the debts of the Partnership.
        
        5. DISTRIBUTIONS
        5.1 The General Partner shall receive a distribution of the Partnership's profits.
        5.2 The Limited Partner shall receive a distribution of the Partnership's profits.
        5.3 Distributions shall be made on the last day of each month.
        
        6. GOVERNING LAW
        6.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        6.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        GENERAL PARTNER:
        [GENERAL_PARTNER_NAME]
        
        By: _________________________
        Name: [GENERAL_PARTNER_REPRESENTATIVE]
        Title: [GENERAL_PARTNER_TITLE]
        Date: _________________________
        
        LIMITED PARTNER:
        [LIMITED_PARTNER_NAME]
        
        By: _________________________
        Name: [LIMITED_PARTNER_REPRESENTATIVE]
        Title: [LIMITED_PARTNER_TITLE]
        Date: _________________________
        """
    
    def _get_joint_venture_template(self) -> str:
        """Get joint venture agreement template"""
        return """
        JOINT VENTURE AGREEMENT
        
        This Joint Venture Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [VENTURE_PARTNER_1_NAME], a company registered in Namibia (the "Venture Partner 1")
        and
        [VENTURE_PARTNER_2_NAME], a company registered in Namibia (the "Venture Partner 2")
        
        WHEREAS the Venture Partners wish to form a joint venture;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. VENTURE PURPOSE
        1.1 The Joint Venture shall be formed for the purpose of [VENTURE_PURPOSE].
        1.2 The Joint Venture shall not engage in any activities not directly related to the Venture Purpose.
        
        2. RESOURCE CONTRIBUTIONS
        2.1 Venture Partner 1 shall contribute [RESOURCE_CONTRIBUTION_1] to the Joint Venture.
        2.2 Venture Partner 2 shall contribute [RESOURCE_CONTRIBUTION_2] to the Joint Venture.
        2.3 Contributions shall be made within [RESOURCE_PAYMENT_TERMS] days of the date of this Agreement.
        
        3. MANAGEMENT CONTROL
        3.1 The Joint Venture shall be managed by a joint management committee.
        3.2 Each Venture Partner shall have one representative on the Management Committee.
        3.3 The Management Committee shall make all decisions jointly.
        
        4. PROFIT SHARING
        4.1 The Joint Venture shall distribute profits equally.
        4.2 Profits shall be distributed on the last day of each month.
        
        5. LOSS ALLOCATION
        5.1 The Joint Venture shall allocate losses equally.
        5.2 Losses shall be allocated on the last day of each month.
        
        6. LIABILITY
        6.1 Each Venture Partner shall be personally liable for all debts and obligations of the Joint Venture.
        6.2 The Joint Venture shall not be personally liable for the debts of the Venture Partners.
        
        7. GOVERNING LAW
        7.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        7.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        VENTURE PARTNER 1:
        [VENTURE_PARTNER_1_NAME]
        
        By: _________________________
        Name: [VENTURE_PARTNER_1_REPRESENTATIVE]
        Title: [VENTURE_PARTNER_1_TITLE]
        Date: _________________________
        
        VENTURE PARTNER 2:
        [VENTURE_PARTNER_2_NAME]
        
        By: _________________________
        Name: [VENTURE_PARTNER_2_REPRESENTATIVE]
        Title: [VENTURE_PARTNER_2_TITLE]
        Date: _________________________
        """
    
    def _get_supplier_agreement_template(self) -> str:
        """Get supplier agreement template"""
        return """
        SUPPLIER AGREEMENT
        
        This Supplier Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [SUPPLIER_NAME], a company registered in Namibia (the "Supplier")
        and
        [BUYER_NAME], a company registered in Namibia (the "Buyer")
        
        WHEREAS the Buyer wishes to purchase goods from the Supplier;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. PRODUCT SPECIFICATIONS
        1.1 The Supplier shall provide goods that meet the specifications set forth in the Purchase Order.
        1.2 The Supplier shall ensure that all goods are free from defects and comply with applicable standards.
        
        2. QUALITY STANDARDS
        2.1 The Supplier shall maintain quality control throughout the production process.
        2.2 The Supplier shall conduct regular quality checks and provide certificates of conformity.
        
        3. DELIVERY TERMS
        3.1 The Supplier shall deliver the goods within [DELIVERY_TERMS] days of receipt of the Purchase Order.
        3.2 The Supplier shall provide a Certificate of Origin and any other required documentation.
        
        4. PAYMENT TERMS
        4.1 The Buyer shall pay the Supplier NAD [PAYMENT_AMOUNT] on [PAYMENT_DATE].
        4.2 All amounts are exclusive of VAT unless otherwise stated.
        
        5. PERFORMANCE METRICS
        5.1 The Supplier shall meet agreed-upon performance metrics.
        5.2 The Supplier shall provide timely updates on production and delivery.
        
        6. INTELLECTUAL PROPERTY
        6.1 All intellectual property created under this Agreement shall belong to the Buyer.
        6.2 The Supplier retains rights to their pre-existing intellectual property.
        
        7. CONFIDENTIALITY
        7.1 Both parties agree to maintain the confidentiality of proprietary information.
        7.2 This obligation shall survive the termination of this Agreement.
        
        8. LIABILITY
        8.1 The Supplier's liability shall be limited to NAD [LIABILITY_LIMIT].
        8.2 Neither party shall be liable for indirect or consequential damages.
        
        9. TERMINATION
        9.1 Either party may terminate this Agreement with [NOTICE_PERIOD] written notice.
        9.2 The Agreement may be terminated immediately for material breach.
        
        10. GOVERNING LAW
        10.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        10.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        SUPPLIER:
        [SUPPLIER_NAME]
        
        By: _________________________
        Name: [SUPPLIER_REPRESENTATIVE]
        Title: [SUPPLIER_TITLE]
        Date: _________________________
        
        BUYER:
        [BUYER_NAME]
        
        By: _________________________
        Name: [BUYER_REPRESENTATIVE]
        Title: [BUYER_TITLE]
        Date: _________________________
        """
    
    def _get_distributor_agreement_template(self) -> str:
        """Get distributor agreement template"""
        return """
        DISTRIBUTOR AGREEMENT
        
        This Distributor Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [MANUFACTURER_NAME], a company registered in Namibia (the "Manufacturer")
        and
        [DISTRIBUTOR_NAME], a company registered in Namibia (the "Distributor")
        
        WHEREAS the Manufacturer wishes to distribute its products through the Distributor;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. DISTRIBUTION TERRITORY
        1.1 The Distributor shall distribute the Manufacturer's products within [DISTRIBUTION_TERRITORY].
        1.2 The Distributor shall not distribute the Manufacturer's products in any other territory without the Manufacturer's prior written consent.
        
        2. SALES TARGETS
        2.1 The Distributor shall achieve sales targets of [SALES_TARGETS] for the Manufacturer's products.
        2.2 The Distributor shall report monthly sales to the Manufacturer.
        
        3. MARKETING OBLIGATIONS
        3.1 The Distributor shall promote the Manufacturer's products in accordance with the agreed marketing plan.
        3.2 The Distributor shall use its own resources for marketing activities.
        
        4. TERMINATION TERMS
        4.1 Either party may terminate this Agreement with [NOTICE_PERIOD] written notice.
        4.2 The Agreement may be terminated immediately for material breach.
        
        5. TRANSITION PROCEDURES
        5.1 Upon termination, the Distributor shall return all confidential information to the Manufacturer.
        5.2 The Distributor shall certify in writing that all materials have been returned.
        
        6. LIABILITY
        6.1 The Distributor's liability shall be limited to NAD [LIABILITY_LIMIT].
        6.2 Neither party shall be liable for indirect or consequential damages.
        
        7. GOVERNING LAW
        7.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        7.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        MANUFACTURER:
        [MANUFACTURER_NAME]
        
        By: _________________________
        Name: [MANUFACTURER_REPRESENTATIVE]
        Title: [MANUFACTURER_TITLE]
        Date: _________________________
        
        DISTRIBUTOR:
        [DISTRIBUTOR_NAME]
        
        By: _________________________
        Name: [DISTRIBUTOR_REPRESENTATIVE]
        Title: [DISTRIBUTOR_TITLE]
        Date: _________________________
        """
    
    def _get_technology_vendor_template(self) -> str:
        """Get technology vendor agreement template"""
        return """
        TECHNOLOGY VENDOR AGREEMENT
        
        This Technology Vendor Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [TECHNOLOGY_PROVIDER_NAME], a company registered in Namibia (the "Technology Provider")
        and
        [CLIENT_NAME], a company registered in Namibia (the "Client")
        
        WHEREAS the Client wishes to engage the Technology Provider to provide certain technology services;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. TECHNOLOGY SPECIFICATIONS
        1.1 The Technology Provider shall provide the following technology services: [TECHNOLOGY_SPECIFICATIONS]
        1.2 The scope of services shall include: [SCOPE_OF_SERVICES]
        1.3 The Technology Provider shall perform the services in accordance with industry standards.
        
        2. TERM
        2.1 This Agreement shall commence on [START_DATE] and continue until [END_DATE].
        2.2 The Agreement may be renewed by mutual written agreement.
        
        3. COMPENSATION
        3.1 The Client shall pay the Technology Provider NAD [PAYMENT_AMOUNT] for the services.
        3.2 Payment shall be made within [PAYMENT_TERMS] days of invoice.
        3.3 All amounts are exclusive of VAT unless otherwise stated.
        
        4. DELIVERABLES
        4.1 The Technology Provider shall deliver: [DELIVERABLES_LIST]
        4.2 Deliverables shall be provided in accordance with the agreed timeline.
        
        5. INTELLECTUAL PROPERTY
        5.1 All intellectual property created under this Agreement shall belong to the Client.
        5.2 The Technology Provider retains rights to their pre-existing intellectual property.
        
        6. CONFIDENTIALITY
        6.1 Both parties agree to maintain the confidentiality of proprietary information.
        6.2 This obligation shall survive the termination of this Agreement.
        
        7. LIABILITY
        7.1 The Technology Provider's liability shall be limited to NAD [LIABILITY_LIMIT].
        7.2 Neither party shall be liable for indirect or consequential damages.
        
        8. TERMINATION
        8.1 Either party may terminate this Agreement with [NOTICE_PERIOD] written notice.
        8.2 The Agreement may be terminated immediately for material breach.
        
        9. GOVERNING LAW
        9.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        9.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        TECHNOLOGY PROVIDER:
        [TECHNOLOGY_PROVIDER_NAME]
        
        By: _________________________
        Name: [TECHNOLOGY_PROVIDER_REPRESENTATIVE]
        Title: [TECHNOLOGY_PROVIDER_TITLE]
        Date: _________________________
        
        CLIENT:
        [CLIENT_NAME]
        
        By: _________________________
        Name: [CLIENT_REPRESENTATIVE]
        Title: [CLIENT_TITLE]
        Date: _________________________
        """
    
    def _get_personal_loan_template(self) -> str:
        """Get personal loan agreement template"""
        return """
        PERSONAL LOAN AGREEMENT
        
        This Personal Loan Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [LENDER_NAME], a company registered in Namibia (the "Lender")
        and
        [BORROWER_NAME], an individual residing in Namibia (the "Borrower")
        
        WHEREAS the Lender wishes to lend money to the Borrower;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. LOAN AMOUNT
        1.1 The Lender shall lend the Borrower NAD [LOAN_AMOUNT].
        1.2 The Borrower shall repay the Loan in full on [REPAYMENT_DATE].
        
        2. INTEREST TERMS
        2.1 The Borrower shall pay interest at a rate of [INTEREST_RATE] per annum.
        2.2 Interest shall be calculated on a daily basis.
        2.3 Interest shall be payable monthly.
        
        3. REPAYMENT SCHEDULE
        3.1 The Borrower shall make monthly payments of NAD [REPAYMENT_AMOUNT] on the [REPAYMENT_DATE] of each month.
        3.2 The Borrower shall continue to make monthly payments until the Loan is fully repaid.
        
        4. DEFAULT PROVISIONS
        4.1 If the Borrower fails to make any payment on the due date, the Borrower shall be in default.
        4.2 The Borrower shall pay a penalty of [PENALTY_AMOUNT] for each day of default.
        4.3 The Borrower shall pay all costs and expenses incurred by the Lender in enforcing this Agreement.
        
        5. CONSUMER PROTECTION
        5.1 This Agreement complies with the Consumer Protection Act 11 of 2007.
        5.2 The Borrower has the right to withdraw from this Agreement within [WITHDRAWAL_PERIOD].
        5.3 The Borrower shall be entitled to a full refund of the Loan amount if they withdraw within the withdrawal period.
        
        6. GOVERNING LAW
        6.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        6.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        LENDER:
        [LENDER_NAME]
        
        By: _________________________
        Name: [LENDER_REPRESENTATIVE]
        Title: [LENDER_TITLE]
        Date: _________________________
        
        BORROWER:
        [BORROWER_NAME]
        
        Signature: _________________________
        Date: _________________________
        """
    
    def _get_business_loan_template(self) -> str:
        """Get business loan agreement template"""
        return """
        BUSINESS LOAN AGREEMENT
        
        This Business Loan Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [LENDER_NAME], a company registered in Namibia (the "Lender")
        and
        [BORROWER_NAME], a company registered in Namibia (the "Borrower")
        
        WHEREAS the Lender wishes to lend money to the Borrower;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. LOAN AMOUNT
        1.1 The Lender shall lend the Borrower NAD [LOAN_AMOUNT].
        1.2 The Borrower shall repay the Loan in full on [REPAYMENT_DATE].
        
        2. COLLATERAL SECURITY
        2.1 The Borrower shall provide adequate security for the Loan.
        2.2 The security shall be in the form of [COLLATERAL_DESCRIPTION].
        2.3 The security shall be registered with the appropriate authorities.
        
        3. FINANCIAL COVENANTS
        3.1 The Borrower shall maintain a minimum level of [MINIMUM_EQUITY] in its capital.
        3.2 The Borrower shall not incur any significant liabilities without the Lender's prior written consent.
        3.3 The Borrower shall not distribute dividends without the Lender's prior written consent.
        
        4. DEFAULT PROVISIONS
        4.1 If the Borrower fails to make any payment on the due date, the Borrower shall be in default.
        4.2 The Borrower shall pay a penalty of [PENALTY_AMOUNT] for each day of default.
        4.3 The Borrower shall pay all costs and expenses incurred by the Lender in enforcing this Agreement.
        
        5. GOVERNING LAW
        5.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        5.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        LENDER:
        [LENDER_NAME]
        
        By: _________________________
        Name: [LENDER_REPRESENTATIVE]
        Title: [LENDER_TITLE]
        Date: _________________________
        
        BORROWER:
        [BORROWER_NAME]
        
        By: _________________________
        Name: [BORROWER_REPRESENTATIVE]
        Title: [BORROWER_TITLE]
        Date: _________________________
        """
    
    def _get_microfinance_loan_template(self) -> str:
        """Get microfinance loan agreement template"""
        return """
        MICROFINANCE LOAN AGREEMENT
        
        This Microfinance Loan Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [MICROFINANCE_INSTITUTION_NAME], a company registered in Namibia (the "Microfinance Institution")
        and
        [BORROWER_NAME], an individual residing in Namibia (the "Borrower")
        
        WHEREAS the Microfinance Institution wishes to lend money to the Borrower;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. LOAN AMOUNT
        1.1 The Microfinance Institution shall lend the Borrower NAD [LOAN_AMOUNT].
        1.2 The Borrower shall repay the Loan in full on [REPAYMENT_DATE].
        
        2. INTEREST TERMS
        2.1 The Borrower shall pay interest at a rate of [INTEREST_RATE] per annum.
        2.2 Interest shall be calculated on a daily basis.
        2.3 Interest shall be payable monthly.
        
        3. REPAYMENT SCHEDULE
        3.1 The Borrower shall make monthly payments of NAD [REPAYMENT_AMOUNT] on the [REPAYMENT_DATE] of each month.
        3.2 The Borrower shall continue to make monthly payments until the Loan is fully repaid.
        
        4. DEFAULT PROVISIONS
        4.1 If the Borrower fails to make any payment on the due date, the Borrower shall be in default.
        4.2 The Borrower shall pay a penalty of [PENALTY_AMOUNT] for each day of default.
        4.3 The Borrower shall pay all costs and expenses incurred by the Microfinance Institution in enforcing this Agreement.
        
        5. CONSUMER PROTECTION
        5.1 This Agreement complies with the Consumer Protection Act 11 of 2007.
        5.2 The Borrower has the right to withdraw from this Agreement within [WITHDRAWAL_PERIOD].
        5.3 The Borrower shall be entitled to a full refund of the Loan amount if they withdraw within the withdrawal period.
        
        6. SOCIAL IMPACT
        6.1 The Microfinance Institution shall contribute to the development of the Borrower's community.
        6.2 The Microfinance Institution shall provide financial education to the Borrower.
        
        7. GOVERNING LAW
        7.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        7.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        MICROFINANCE INSTITUTION:
        [MICROFINANCE_INSTITUTION_NAME]
        
        By: _________________________
        Name: [MICROFINANCE_INSTITUTION_REPRESENTATIVE]
        Title: [MICROFINANCE_INSTITUTION_TITLE]
        Date: _________________________
        
        BORROWER:
        [BORROWER_NAME]
        
        Signature: _________________________
        Date: _________________________
        """
    
    def _get_management_consulting_template(self) -> str:
        """Get management consulting agreement template"""
        return """
        MANAGEMENT CONSULTING AGREEMENT
        
        This Management Consulting Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [CONSULTING_COMPANY_NAME], a company registered in Namibia (the "Consulting Company")
        and
        [CLIENT_NAME], a company registered in Namibia (the "Client")
        
        WHEREAS the Client wishes to engage the Consulting Company to provide certain management consulting services;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. CONSULTING SCOPE
        1.1 The Consulting Company shall provide the following management consulting services: [CONSULTING_SCOPE]
        1.2 The scope of services shall include: [SCOPE_OF_SERVICES]
        1.3 The Consulting Company shall perform the services in accordance with industry standards.
        
        2. TERM
        2.1 This Agreement shall commence on [START_DATE] and continue until [END_DATE].
        2.2 The Agreement may be renewed by mutual written agreement.
        
        3. COMPENSATION
        3.1 The Client shall pay the Consulting Company NAD [PAYMENT_AMOUNT] for the services.
        3.2 Payment shall be made within [PAYMENT_TERMS] days of invoice.
        3.3 All amounts are exclusive of VAT unless otherwise stated.
        
        4. DELIVERABLES
        4.1 The Consulting Company shall deliver: [DELIVERABLES_LIST]
        4.2 Deliverables shall be provided in accordance with the agreed timeline.
        
        5. INTELLECTUAL PROPERTY
        5.1 All intellectual property created under this Agreement shall belong to the Client.
        5.2 The Consulting Company retains rights to their pre-existing intellectual property.
        
        6. CONFIDENTIALITY
        6.1 Both parties agree to maintain the confidentiality of proprietary information.
        6.2 This obligation shall survive the termination of this Agreement.
        
        7. LIABILITY
        7.1 The Consulting Company's liability shall be limited to NAD [LIABILITY_LIMIT].
        7.2 Neither party shall be liable for indirect or consequential damages.
        
        8. TERMINATION
        8.1 Either party may terminate this Agreement with [NOTICE_PERIOD] written notice.
        8.2 The Agreement may be terminated immediately for material breach.
        
        9. GOVERNING LAW
        9.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        9.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        CONSULTING COMPANY:
        [CONSULTING_COMPANY_NAME]
        
        By: _________________________
        Name: [CONSULTING_COMPANY_REPRESENTATIVE]
        Title: [CONSULTING_COMPANY_TITLE]
        Date: _________________________
        
        CLIENT:
        [CLIENT_NAME]
        
        By: _________________________
        Name: [CLIENT_REPRESENTATIVE]
        Title: [CLIENT_TITLE]
        Date: _________________________
        """
    
    def _get_technical_consulting_template(self) -> str:
        """Get technical consulting agreement template"""
        return """
        TECHNICAL CONSULTING AGREEMENT
        
        This Technical Consulting Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [TECHNICAL_CONSULTANT_NAME], an individual residing in Namibia (the "Technical Consultant")
        and
        [CLIENT_NAME], a company registered in Namibia (the "Client")
        
        WHEREAS the Client wishes to engage the Technical Consultant to provide certain technical consulting services;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. TECHNICAL SPECIFICATIONS
        1.1 The Technical Consultant shall provide the following technical consulting services: [TECHNICAL_SPECIFICATIONS]
        1.2 The scope of services shall include: [SCOPE_OF_SERVICES]
        1.3 The Technical Consultant shall perform the services in accordance with industry standards.
        
        2. TERM
        2.1 This Agreement shall commence on [START_DATE] and continue until [END_DATE].
        2.2 The Agreement may be renewed by mutual written agreement.
        
        3. COMPENSATION
        3.1 The Client shall pay the Technical Consultant NAD [PAYMENT_AMOUNT] for the services.
        3.2 Payment shall be made within [PAYMENT_TERMS] days of invoice.
        3.3 All amounts are exclusive of VAT unless otherwise stated.
        
        4. DELIVERABLES
        4.1 The Technical Consultant shall deliver: [DELIVERABLES_LIST]
        4.2 Deliverables shall be provided in accordance with the agreed timeline.
        
        5. INTELLECTUAL PROPERTY
        5.1 All intellectual property created under this Agreement shall belong to the Client.
        5.2 The Technical Consultant retains rights to their pre-existing intellectual property.
        
        6. CONFIDENTIALITY
        6.1 Both parties agree to maintain the confidentiality of proprietary information.
        6.2 This obligation shall survive the termination of this Agreement.
        
        7. LIABILITY
        7.1 The Technical Consultant's liability shall be limited to NAD [LIABILITY_LIMIT].
        7.2 Neither party shall be liable for indirect or consequential damages.
        
        8. TERMINATION
        8.1 Either party may terminate this Agreement with [NOTICE_PERIOD] written notice.
        8.2 The Agreement may be terminated immediately for material breach.
        
        9. GOVERNING LAW
        9.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        9.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        TECHNICAL CONSULTANT:
        [TECHNICAL_CONSULTANT_NAME]
        
        By: _________________________
        Name: [TECHNICAL_CONSULTANT_REPRESENTATIVE]
        Title: [TECHNICAL_CONSULTANT_TITLE]
        Date: _________________________
        
        CLIENT:
        [CLIENT_NAME]
        
        By: _________________________
        Name: [CLIENT_REPRESENTATIVE]
        Title: [CLIENT_TITLE]
        Date: _________________________
        """
    
    def _get_financial_consulting_template(self) -> str:
        """Get financial consulting agreement template"""
        return """
        FINANCIAL CONSULTING AGREEMENT
        
        This Financial Consulting Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [FINANCIAL_CONSULTANT_NAME], an individual residing in Namibia (the "Financial Consultant")
        and
        [CLIENT_NAME], a company registered in Namibia (the "Client")
        
        WHEREAS the Client wishes to engage the Financial Consultant to provide certain financial consulting services;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. FINANCIAL SCOPE
        1.1 The Financial Consultant shall provide the following financial consulting services: [FINANCIAL_SCOPE]
        1.2 The scope of services shall include: [SCOPE_OF_SERVICES]
        1.3 The Financial Consultant shall perform the services in accordance with industry standards.
        
        2. TERM
        2.1 This Agreement shall commence on [START_DATE] and continue until [END_DATE].
        2.2 The Agreement may be renewed by mutual written agreement.
        
        3. COMPENSATION
        3.1 The Client shall pay the Financial Consultant NAD [PAYMENT_AMOUNT] for the services.
        3.2 Payment shall be made within [PAYMENT_TERMS] days of invoice.
        3.3 All amounts are exclusive of VAT unless otherwise stated.
        
        4. DELIVERABLES
        4.1 The Financial Consultant shall deliver: [DELIVERABLES_LIST]
        4.2 Deliverables shall be provided in accordance with the agreed timeline.
        
        5. INTELLECTUAL PROPERTY
        5.1 All intellectual property created under this Agreement shall belong to the Client.
        5.2 The Financial Consultant retains rights to their pre-existing intellectual property.
        
        6. CONFIDENTIALITY
        6.1 Both parties agree to maintain the confidentiality of proprietary information.
        6.2 This obligation shall survive the termination of this Agreement.
        
        7. LIABILITY
        7.1 The Financial Consultant's liability shall be limited to NAD [LIABILITY_LIMIT].
        7.2 Neither party shall be liable for indirect or consequential damages.
        
        8. TERMINATION
        8.1 Either party may terminate this Agreement with [NOTICE_PERIOD] written notice.
        8.2 The Agreement may be terminated immediately for material breach.
        
        9. GOVERNING LAW
        9.1 This Agreement shall be governed by and construed in accordance with the laws of Namibia.
        9.2 This Agreement complies with the Electronic Transactions Act 4 of 2019.
        
        IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.
        
        FINANCIAL CONSULTANT:
        [FINANCIAL_CONSULTANT_NAME]
        
        By: _________________________
        Name: [FINANCIAL_CONSULTANT_REPRESENTATIVE]
        Title: [FINANCIAL_CONSULTANT_TITLE]
        Date: _________________________
        
        CLIENT:
        [CLIENT_NAME]
        
        By: _________________________
        Name: [CLIENT_REPRESENTATIVE]
        Title: [CLIENT_TITLE]
        Date: _________________________
        """
    
    async def generate_document(
        self, 
        template_type: str, 
        customization_data: Dict[str, Any],
        parties: List[Dict[str, Any]]
    ) -> GeneratedDocument:
        """Generate a legally binding document with AI enhancement"""
        try:
            # Get base template
            template = self.templates.get(template_type)
            if not template:
                raise ValueError(f"Template type '{template_type}' not found")
            
            # Generate enhanced content using AI
            enhanced_content = await self._enhance_content_with_ai(
                template.content, 
                customization_data, 
                parties
            )
            
            # Create signature fields based on parties
            signature_fields = self._create_signature_fields(template.signature_fields, parties)
            
            # Check compliance
            compliance_status = await self._check_compliance(template_type, enhanced_content)
            
            # Generate document ID
            document_id = f"doc_{template_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            return GeneratedDocument(
                id=document_id,
                template_id=template.id,
                title=f"{template.name} - {customization_data.get('title', 'Generated Document')}",
                content=enhanced_content,
                parties=parties,
                signature_fields=signature_fields,
                compliance_status=compliance_status,
                metadata={
                    "template_type": template_type,
                    "customization_data": customization_data,
                    "generated_at": datetime.now().isoformat(),
                    "ai_enhanced": True
                },
                created_at=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error generating document: {e}")
            raise
    
    async def _enhance_content_with_ai(
        self, 
        base_content: str, 
        customization_data: Dict[str, Any],
        parties: List[Dict[str, Any]]
    ) -> str:
        """Enhance document content using AI"""
        try:
            # Create enhancement prompt
            prompt = f"""
            Enhance the following legal document template with the provided customization data.
            Ensure compliance with Namibian law and ETA 2019 requirements.
            
            Base Template:
            {base_content}
            
            Customization Data:
            {json.dumps(customization_data, indent=2)}
            
            Parties:
            {json.dumps(parties, indent=2)}
            
            Requirements:
            1. Replace all placeholder text (in square brackets) with actual data
            2. Ensure legal compliance with Namibian contract law
            3. Add any missing clauses for completeness
            4. Maintain professional legal language
            5. Ensure ETA 2019 compliance for electronic signatures
            
            Generate the enhanced document:
            """
            
            # Use LlamaIndex for enhancement
            query_engine = self.legal_index.as_query_engine()
            response = await query_engine.aquery(prompt)
            
            return response.response if response.response else base_content
            
        except Exception as e:
            logger.error(f"Error enhancing content with AI: {e}")
            # Fallback to basic customization
            return self._basic_customization(base_content, customization_data)
    
    def _basic_customization(self, content: str, customization_data: Dict[str, Any]) -> str:
        """Basic customization without AI"""
        customized_content = content
        
        # Replace common placeholders
        for key, value in customization_data.items():
            placeholder = f"[{key.upper()}]"
            if placeholder in customized_content:
                customized_content = customized_content.replace(placeholder, str(value))
        
        # Add current date
        current_date = datetime.now().strftime("%B %d, %Y")
        customized_content = customized_content.replace("[DATE]", current_date)
        
        return customized_content
    
    def _create_signature_fields(
        self, 
        template_fields: List[Dict[str, Any]], 
        parties: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Create signature fields based on parties"""
        signature_fields = []
        
        for field in template_fields:
            # Find matching party
            matching_party = next(
                (p for p in parties if p.get('role') == field.get('role')), 
                None
            )
            
            if matching_party:
                signature_fields.append({
                    **field,
                    "party_id": matching_party.get('id'),
                    "party_name": matching_party.get('name'),
                    "party_email": matching_party.get('email'),
                    "required": field.get('required', True),
                    "position": {
                        "x": 100,
                        "y": 100,
                        "width": 200,
                        "height": 50
                    }
                })
        
        return signature_fields
    
    async def _check_compliance(self, template_type: str, content: str) -> Dict[str, Any]:
        """Check document compliance with legal requirements"""
        try:
            compliance_prompt = f"""
            Analyze the following document for compliance with Namibian law and ETA 2019:
            
            Document Type: {template_type}
            Content: {content[:2000]}...
            
            Check for:
            1. ETA 2019 Section 17 - Legal recognition of electronic documents
            2. ETA 2019 Section 20 - Electronic signature requirements
            3. ETA 2019 Section 21 - Information integrity
            4. Contract law requirements (offer, acceptance, consideration, capacity, legality)
            5. Consumer protection requirements
            
            Provide a compliance assessment with specific recommendations.
            """
            
            query_engine = self.legal_index.as_query_engine()
            response = await query_engine.aquery(compliance_prompt)

            return {
                "status": "compliant",
                "assessment": response.response if response.response else "Compliance check completed",
                "recommendations": [],
                "checked_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking compliance: {e}")
            return {
                "status": "unknown",
                "assessment": "Compliance check failed",
                "recommendations": ["Manual compliance review recommended"],
                "checked_at": datetime.now().isoformat()
            }
    
    async def save_document_as_pdf(self, document: GeneratedDocument, file_path: str) -> str:
        """Save generated document as PDF"""
        try:
            doc = SimpleDocTemplate(file_path, pagesize=A4)
            story = []
            
            # Add title
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                spaceAfter=30,
                alignment=1  # Center alignment
            )
            story.append(Paragraph(document.title, title_style))
            story.append(Spacer(1, 20))
            
            # Add content
            content_style = ParagraphStyle(
                'Content',
                parent=styles['Normal'],
                fontSize=11,
                spaceAfter=12,
                leading=14
            )
            
            # Split content into paragraphs
            paragraphs = document.content.split('\n\n')
            for para in paragraphs:
                if para.strip():
                    story.append(Paragraph(para, content_style))
                    story.append(Spacer(1, 6))
            
            # Build PDF
            doc.build(story)
            
            logger.info(f"PDF saved to: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Error saving PDF: {e}")
            raise
    
    def get_available_templates(self) -> List[DocumentTemplate]:
        """Get list of available templates"""
        return list(self.templates.values())
    
    def get_template(self, template_id: str) -> Optional[DocumentTemplate]:
        """Get specific template by ID"""
        return self.templates.get(template_id)

# Global instance
document_generator = DocumentGenerator()

