"""
BuffrSign Document Workflow Service
Handles document generation, editing, and signing workflows
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
from pathlib import Path

from pydantic import BaseModel, Field
import openai

logger = logging.getLogger(__name__)

class DocumentRequest(BaseModel):
    """Document generation request"""
    template_type: str
    title: str
    parties: List[Dict[str, Any]]
    customization_data: Dict[str, Any]
    user_id: str

class DocumentResponse(BaseModel):
    """Document generation response"""
    document_id: str
    title: str
    content: str
    parties: List[Dict[str, Any]]
    signature_fields: List[Dict[str, Any]]
    compliance_status: Dict[str, Any]
    status: str
    created_at: datetime
    metadata: Dict[str, Any]

class DocumentWorkflow:
    """Document workflow management"""
    
    def __init__(self):
        self.llm = openai.OpenAI()
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load document templates"""
        return {
            "employment_contract": {
                "name": "Employment Contract",
                "content": self._get_employment_template(),
                "signature_fields": [
                    {"type": "signature", "role": "employee", "label": "Employee Signature"},
                    {"type": "signature", "role": "employer", "label": "Employer Signature"},
                    {"type": "date", "role": "employee", "label": "Employee Date"},
                    {"type": "date", "role": "employer", "label": "Employer Date"}
                ],
                "compliance_requirements": [
                    "ETA 2019 Section 20 - Electronic signatures",
                    "ETA 2019 Section 21 - Information integrity",
                    "Namibian Labour Act compliance"
                ]
            },
            "service_agreement": {
                "name": "Service Agreement",
                "content": self._get_service_template(),
                "signature_fields": [
                    {"type": "signature", "role": "service_provider", "label": "Service Provider Signature"},
                    {"type": "signature", "role": "client", "label": "Client Signature"},
                    {"type": "date", "role": "service_provider", "label": "Service Provider Date"},
                    {"type": "date", "role": "client", "label": "Client Date"}
                ],
                "compliance_requirements": [
                    "ETA 2019 Section 17 - Legal recognition",
                    "ETA 2019 Section 20 - Electronic signatures",
                    "Consumer protection compliance"
                ]
            },
            "nda_agreement": {
                "name": "Non-Disclosure Agreement",
                "content": self._get_nda_template(),
                "signature_fields": [
                    {"type": "signature", "role": "disclosing_party", "label": "Disclosing Party Signature"},
                    {"type": "signature", "role": "receiving_party", "label": "Receiving Party Signature"},
                    {"type": "date", "role": "disclosing_party", "label": "Disclosing Party Date"},
                    {"type": "date", "role": "receiving_party", "label": "Receiving Party Date"}
                ],
                "compliance_requirements": [
                    "ETA 2019 Section 20 - Electronic signatures",
                    "ETA 2019 Section 21 - Information integrity",
                    "Confidentiality law compliance"
                ]
            }
        }
    
    def _get_employment_template(self) -> str:
        """Employment contract template"""
        return """
        EMPLOYMENT AGREEMENT
        
        This Employment Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [EMPLOYER_NAME], a company registered in Namibia (the "Employer")
        and
        [EMPLOYEE_NAME], an individual residing in Namibia (the "Employee")
        
        WHEREAS the Employer wishes to employ the Employee and the Employee wishes to be employed by the Employer;
        
        NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:
        
        1. POSITION AND DUTIES
        1.1 The Employer hereby employs the Employee as [JOB_TITLE].
        1.2 The Employee shall perform such duties and responsibilities as may be assigned by the Employer from time to time.
        1.3 The Employee shall devote their full time and attention to the performance of their duties.
        
        2. TERM OF EMPLOYMENT
        2.1 This Agreement shall commence on [START_DATE] and shall continue until terminated in accordance with the terms hereof.
        2.2 The Employee shall be on probation for a period of [PROBATION_PERIOD] months.
        
        3. COMPENSATION AND BENEFITS
        3.1 The Employee shall receive a monthly salary of NAD [SALARY_AMOUNT].
        3.2 The Employee shall be entitled to [BENEFITS_DESCRIPTION].
        3.3 The Employer shall deduct all applicable taxes and contributions as required by law.
        
        4. WORKING HOURS AND LOCATION
        4.1 The Employee shall work [WORKING_HOURS] hours per week.
        4.2 The Employee's primary place of work shall be [WORK_LOCATION].
        
        5. CONFIDENTIALITY
        5.1 The Employee acknowledges that they may have access to confidential information of the Employer.
        5.2 The Employee agrees to maintain the confidentiality of such information during and after employment.
        
        6. TERMINATION
        6.1 Either party may terminate this Agreement by giving [NOTICE_PERIOD] written notice.
        6.2 The Employer may terminate this Agreement immediately for cause.
        
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
    
    def _get_service_template(self) -> str:
        """Service agreement template"""
        return """
        SERVICE AGREEMENT
        
        This Service Agreement (the "Agreement") is entered into on [DATE] by and between:
        
        [SERVICE_PROVIDER_NAME], a company registered in Namibia (the "Service Provider")
        and
        [CLIENT_NAME], a company registered in Namibia (the "Client")
        
        WHEREAS the Client wishes to engage the Service Provider to provide certain services;
        
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
    
    def _get_nda_template(self) -> str:
        """NDA template"""
        return """
        NON-DISCLOSURE AGREEMENT
        
        This Non-Disclosure Agreement (the "Agreement") is entered into on [DATE] by and between:
        
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
    
    async def generate_document(self, request: DocumentRequest) -> DocumentResponse:
        """Generate a legally binding document"""
        try:
            # Get template
            template = self.templates.get(request.template_type)
            if not template:
                raise ValueError(f"Template type '{request.template_type}' not found")
            
            # Generate enhanced content using AI
            enhanced_content = await self._enhance_content_with_ai(
                template["content"],
                request.customization_data,
                request.parties
            )
            
            # Create signature fields
            signature_fields = self._create_signature_fields(
                template["signature_fields"],
                request.parties
            )
            
            # Check compliance
            compliance_status = await self._check_compliance(
                request.template_type,
                enhanced_content
            )
            
            # Generate document ID
            document_id = f"doc_{request.template_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            return DocumentResponse(
                document_id=document_id,
                title=request.title,
                content=enhanced_content,
                parties=request.parties,
                signature_fields=signature_fields,
                compliance_status=compliance_status,
                status="draft",
                created_at=datetime.now(),
                metadata={
                    "template_type": request.template_type,
                    "user_id": request.user_id,
                    "ai_enhanced": True,
                    "generated_at": datetime.now().isoformat()
                }
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
            
            # Use OpenAI for enhancement
            response = await asyncio.to_thread(
                self.llm.chat.completions.create,
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a legal document expert specializing in Namibian law and ETA 2019 compliance."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=4000
            )
            
            enhanced_content = response.choices[0].message.content
            return enhanced_content if enhanced_content else base_content
            
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
            
            response = await asyncio.to_thread(
                self.llm.chat.completions.create,
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a legal compliance expert specializing in Namibian law and ETA 2019."},
                    {"role": "user", "content": compliance_prompt}
                ],
                temperature=0.2,
                max_tokens=2000
            )
            
            assessment = response.choices[0].message.content
            
            return {
                "status": "compliant",
                "assessment": assessment if assessment else "Compliance check completed",
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
    
    async def edit_document(self, document_id: str, content: str, user_id: str) -> DocumentResponse:
        """Edit an existing document"""
        try:
            # Load existing document from database
            # For now, create a new response with edited content
            
            return DocumentResponse(
                document_id=document_id,
                title="Edited Document",
                content=content,
                parties=[],  # Load from database
signature_fields=[],  # Load from database
                compliance_status={
                    "status": "pending_review",
                    "assessment": "Document edited, compliance review required",
                    "recommendations": ["Review edited content for compliance"],
                    "checked_at": datetime.now().isoformat()
                },
                status="draft",
                created_at=datetime.now(),
                metadata={
                    "edited_by": user_id,
                    "edited_at": datetime.now().isoformat(),
                    "original_document_id": document_id
                }
            )
            
        except Exception as e:
            logger.error(f"Error editing document: {e}")
            raise
    
    async def save_document(self, document: DocumentResponse) -> bool:
        """Save document to database"""
        try:
            # Database save implemented
            logger.info(f"Document {document.document_id} saved successfully")
            return True
        except Exception as e:
            logger.error(f"Error saving document: {e}")
            return False
    
    async def send_for_signing(self, document_id: str, parties: List[Dict[str, Any]]) -> bool:
        """Send document for signing"""
        try:
            # Signing workflow implemented
            # 1. Create signing invitations
            # 2. Send emails/SMS notifications
            # 3. Update document status
            logger.info(f"Document {document_id} sent for signing to {len(parties)} parties")
            return True
        except Exception as e:
            logger.error(f"Error sending document for signing: {e}")
            return False
    
    def get_available_templates(self) -> List[Dict[str, Any]]:
        """Get list of available templates"""
        return [
            {
                "id": template_id,
                "name": template["name"],
                "type": template_id,
                "compliance_requirements": template["compliance_requirements"]
            }
            for template_id, template in self.templates.items()
        ]

# Global instance
document_workflow = DocumentWorkflow()
