# backend/data/knowledge-base/ai-training-prompts.py
LEGAL_ANALYSIS_PROMPTS = {
    "document_analysis": """
    You are a legal expert specializing in Namibian law and the Electronic Transactions Act 2019.
    
    Analyze the following document for:
    1. ETA 2019 compliance (Sections 17, 20, 21, 24, Chapter 4)
    2. Internal compliance requirements
    3. Namibian contract law compliance
    4. Consumer protection requirements (if applicable)
    5. Potential legal risks or issues
    
    Document Type: {document_type}
    Jurisdiction: Namibia
    
    Document Content:
    {document_content}
    
    Provide analysis in the following format:
    - Compliance Status: [Compliant/Needs Review/Non-Compliant]
    - Key Issues: [List any legal issues found]
    - Recommendations: [Specific actions to improve compliance]
    - Risk Assessment: [Low/Medium/High risk factors]
    """,
    
    "clause_extraction": """
    Extract and categorize legal clauses from the following document.
    
    Focus on identifying:
    1. Essential clauses (parties, consideration, obligations)
    2. Boilerplate clauses (governing law, dispute resolution)
    3. Namibian law-specific requirements
    4. ETA 2019 compliance clauses
    5. Missing critical clauses
    
    Document: {document_content}
    
    Return structured analysis with:
    - Clause Type
    - Content Summary
    - Legal Significance
    - Compliance Status
    - Recommendations for improvement
    """,
    
    "signature_field_detection": """
    Analyze this document to identify optimal signature field placement.
    
    Consider:
    1. Legal requirements for signature placement
    2. Namibian contract law standards
    3. ETA 2019 electronic signature requirements
    4. User experience best practices
    5. Document flow and readability
    
    Document: {document_content}
    Document Type: {document_type}
    
    Suggest signature fields with:
    - Field ID and description
    - Optimal page and position
    - Required signature type (simple/advanced/qualified)
    - Legal justification
    - ETA 2019 compliance notes
    """
}

TEMPLATE_GENERATION_PROMPTS = {
    # EMPLOYMENT CONTRACTS - 3 Variants
    "employment_contract_standard": """
    Generate a comprehensive employment contract template compliant with:
    1. Namibian Labour Act 11 of 2007
    2. Electronic Transactions Act 4 of 2019
    3. Internal compliance requirements
    4. Best practices for {industry} industry
    
    Requirements:
    {requirements}
    
    Include:
    - All mandatory clauses per Namibian law
    - ETA 2019 compliant signature provisions
    - Consumer protection elements (if applicable)
    - Industry-specific considerations
    - Clear, plain language explanations
    """,
    
    "employment_contract_executive": """
    Generate an executive employment contract template for senior management positions compliant with:
    1. Namibian Labour Act 11 of 2007
    2. Electronic Transactions Act 4 of 2019
    3. Corporate governance requirements
    4. Executive compensation standards
    
    Requirements:
    {requirements}
    
    Include:
    - Executive-specific clauses (non-compete, confidentiality, severance)
    - Performance-based compensation structures
    - Termination provisions for executives
    - Stock option and equity considerations
    - ETA 2019 compliant signature provisions
    """,
    
    "employment_contract_fixed_term": """
    Generate a fixed-term employment contract template compliant with:
    1. Namibian Labour Act 11 of 2007
    2. Electronic Transactions Act 4 of 2019
    3. Fixed-term employment regulations
    
    Requirements:
    {requirements}
    
    Include:
    - Fixed-term duration and renewal provisions
    - Project-specific obligations
    - Termination conditions for fixed-term contracts
    - Transition and handover requirements
    - ETA 2019 compliant signature provisions
    """,
    
    # SERVICE AGREEMENTS - 3 Variants
    "service_agreement_consulting": """
    Generate a consulting service agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Consulting industry standards
    4. Professional liability considerations
    
    Requirements:
    {requirements}
    
    Include:
    - Scope of consulting services
    - Professional standards and ethics
    - Intellectual property provisions
    - Liability limitations
    - ETA 2019 compliant signature provisions
    """,
    
    "service_agreement_outsourcing": """
    Generate an outsourcing service agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Outsourcing industry standards
    4. Data protection requirements
    
    Requirements:
    {requirements}
    
    Include:
    - Service level agreements (SLAs)
    - Performance metrics and penalties
    - Data security and privacy provisions
    - Transition and termination procedures
    - ETA 2019 compliant signature provisions
    """,
    
    "service_agreement_maintenance": """
    Generate a maintenance service agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Maintenance industry standards
    
    Requirements:
    {requirements}
    
    Include:
    - Maintenance schedules and procedures
    - Emergency response protocols
    - Parts and materials provisions
    - Warranty and guarantee terms
    - ETA 2019 compliant signature provisions
    """,
    
    # NON-DISCLOSURE AGREEMENTS - 3 Variants
    "nda_unilateral": """
    Generate a unilateral non-disclosure agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Confidentiality law requirements
    
    Requirements:
    {requirements}
    
    Include:
    - Definition of confidential information
    - Unilateral disclosure obligations
    - Permitted use restrictions
    - Return and destruction obligations
    - ETA 2019 compliant signature provisions
    """,
    
    "nda_mutual": """
    Generate a mutual non-disclosure agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Confidentiality law requirements
    
    Requirements:
    {requirements}
    
    Include:
    - Mutual confidentiality obligations
    - Information exchange protocols
    - Permitted disclosures
    - Duration and survival clauses
    - ETA 2019 compliant signature provisions
    """,
    
    "nda_employee": """
    Generate an employee non-disclosure agreement template compliant with:
    1. Namibian Labour Act 11 of 2007
    2. Electronic Transactions Act 4 of 2019
    3. Employment confidentiality requirements
    
    Requirements:
    {requirements}
    
    Include:
    - Employee confidentiality obligations
    - Post-employment restrictions
    - Intellectual property provisions
    - Return of company property
    - ETA 2019 compliant signature provisions
    """,
    
    # LEASE AGREEMENTS - 3 Variants
    "lease_agreement_commercial": """
    Generate a commercial lease agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Commercial property regulations
    
    Requirements:
    {requirements}
    
    Include:
    - Property description and use restrictions
    - Rent and payment terms
    - Maintenance and repair obligations
    - Insurance requirements
    - ETA 2019 compliant signature provisions
    """,
    
    "lease_agreement_residential": """
    Generate a residential lease agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Residential tenancy regulations
    
    Requirements:
    {requirements}
    
    Include:
    - Property description and occupancy
    - Rent and deposit terms
    - Tenant rights and obligations
    - Landlord responsibilities
    - ETA 2019 compliant signature provisions
    """,
    
    "lease_agreement_equipment": """
    Generate an equipment lease agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Equipment leasing standards
    
    Requirements:
    {requirements}
    
    Include:
    - Equipment description and specifications
    - Lease terms and payment schedule
    - Maintenance and insurance obligations
    - Return and damage provisions
    - ETA 2019 compliant signature provisions
    """,
    
    # PARTNERSHIP AGREEMENTS - 3 Variants
    "partnership_agreement_general": """
    Generate a general partnership agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Partnership law requirements
    
    Requirements:
    {requirements}
    
    Include:
    - Partnership structure and purpose
    - Capital contributions and profit sharing
    - Management and decision-making
    - Dissolution procedures
    - ETA 2019 compliant signature provisions
    """,
    
    "partnership_agreement_limited": """
    Generate a limited partnership agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Limited partnership regulations
    
    Requirements:
    {requirements}
    
    Include:
    - General and limited partner roles
    - Liability limitations
    - Capital contributions and distributions
    - Management structure
    - ETA 2019 compliant signature provisions
    """,
    
    "partnership_agreement_joint_venture": """
    Generate a joint venture agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Joint venture standards
    
    Requirements:
    {requirements}
    
    Include:
    - Joint venture purpose and scope
    - Resource contributions
    - Management and control structure
    - Profit sharing and loss allocation
    - ETA 2019 compliant signature provisions
    """,
    
    # VENDOR AGREEMENTS - 3 Variants
    "vendor_agreement_supplier": """
    Generate a supplier agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Supply chain standards
    
    Requirements:
    {requirements}
    
    Include:
    - Product/service specifications
    - Quality standards and warranties
    - Delivery and payment terms
    - Performance metrics
    - ETA 2019 compliant signature provisions
    """,
    
    "vendor_agreement_distributor": """
    Generate a distributor agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Distribution law requirements
    
    Requirements:
    {requirements}
    
    Include:
    - Distribution territory and rights
    - Sales targets and performance
    - Marketing and promotion obligations
    - Termination and transition
    - ETA 2019 compliant signature provisions
    """,
    
    "vendor_agreement_technology": """
    Generate a technology vendor agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Technology licensing standards
    
    Requirements:
    {requirements}
    
    Include:
    - Technology specifications and licensing
    - Support and maintenance terms
    - Intellectual property rights
    - Data security and privacy
    - ETA 2019 compliant signature provisions
    """,
    
    # LOAN AGREEMENTS - 3 Variants
    "loan_agreement_personal": """
    Generate a personal loan agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Consumer protection requirements
    
    Requirements:
    {requirements}
    
    Include:
    - Loan amount and interest terms
    - Repayment schedule and methods
    - Default and penalty provisions
    - Consumer protection clauses
    - ETA 2019 compliant signature provisions
    """,
    
    "loan_agreement_business": """
    Generate a business loan agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Business lending standards
    
    Requirements:
    {requirements}
    
    Include:
    - Loan purpose and use restrictions
    - Collateral and security provisions
    - Financial covenants
    - Default and enforcement
    - ETA 2019 compliant signature provisions
    """,
    
    "loan_agreement_microfinance": """
    Generate a microfinance loan agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Microfinance regulations
    
    Requirements:
    {requirements}
    
    Include:
    - Simplified loan terms
    - Group lending provisions (if applicable)
    - Financial education requirements
    - Default prevention measures
    - ETA 2019 compliant signature provisions
    """,
    
    # CONSULTING AGREEMENTS - 3 Variants
    "consulting_agreement_management": """
    Generate a management consulting agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Management consulting standards
    
    Requirements:
    {requirements}
    
    Include:
    - Consulting scope and deliverables
    - Professional standards and ethics
    - Conflict of interest provisions
    - Intellectual property rights
    - ETA 2019 compliant signature provisions
    """,
    
    "consulting_agreement_technical": """
    Generate a technical consulting agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Technical consulting standards
    
    Requirements:
    {requirements}
    
    Include:
    - Technical specifications and requirements
    - Quality assurance procedures
    - Testing and validation protocols
    - Warranty and liability provisions
    - ETA 2019 compliant signature provisions
    """,
    
    "consulting_agreement_financial": """
    Generate a financial consulting agreement template compliant with:
    1. Namibian contract law principles
    2. Electronic Transactions Act 4 of 2019
    3. Financial advisory regulations
    
    Requirements:
    {requirements}
    
    Include:
    - Financial advisory scope
    - Regulatory compliance requirements
    - Conflict of interest disclosures
    - Professional liability provisions
    - ETA 2019 compliant signature provisions
    """,
    
    # ENTERPRISE FORMS - 3 Variants
    "enterprise_form_application": """
    Generate an enterprise application form template for {form_type} that complies with:
    1. Namibian business standards
    2. ETA 2019 electronic form requirements
    3. Accessibility standards
    4. Multi-language support (English, Afrikaans, local languages)
    
    Requirements:
    {requirements}
    
    Ensure:
    - Enterprise branding compatibility
    - Digital signature integration
    - Audit trail compliance
    - Data protection compliance
    """,
    
    "enterprise_form_registration": """
    Generate an enterprise registration form template for {form_type} that complies with:
    1. Namibian business registration requirements
    2. ETA 2019 electronic form requirements
    3. Corporate governance standards
    
    Requirements:
    {requirements}
    
    Ensure:
    - Registration compliance
    - Corporate structure documentation
    - Digital signature integration
    - Regulatory reporting requirements
    """,
    
    "enterprise_form_compliance": """
    Generate an enterprise compliance form template for {form_type} that complies with:
    1. Namibian regulatory requirements
    2. ETA 2019 electronic form requirements
    3. Industry-specific compliance standards
    
    Requirements:
    {requirements}
    
    Ensure:
    - Regulatory compliance
    - Audit trail requirements
    - Digital signature integration
    - Reporting obligations
    """
}

# SADC REGIONAL TEMPLATES
SADC_TEMPLATES = {
    "cross_border_agreement": """
    Generate a cross-border agreement template compliant with:
    1. SADC Digital Signature Framework
    2. Cross-border recognition requirements
    3. Regional trade standards
    4. International contract law principles
    
    Requirements:
    {requirements}
    
    Include:
    - Choice of law and jurisdiction
    - Cross-border signature recognition
    - Dispute resolution mechanisms
    - Regional compliance requirements
    """,
    
    "regional_partnership": """
    Generate a regional partnership agreement template compliant with:
    1. SADC regional integration requirements
    2. Cross-border business standards
    3. Regional trade facilitation
    
    Requirements:
    {requirements}
    
    Include:
    - Regional business scope
    - Cross-border operations
    - Regional compliance requirements
    - Dispute resolution mechanisms
    """
}

# COMPLIANCE TEMPLATES
COMPLIANCE_TEMPLATES = {
    "eta_2019_compliance": """
    Generate ETA 2019 compliance documentation for:
    1. Section 17 - Legal recognition of data messages
    2. Section 20 - Electronic signature requirements
    3. Section 21 - Original information integrity
    4. Chapter 4 - Consumer protection
    
    Requirements:
    {requirements}
    
    Include:
    - Compliance checklists
    - Risk assessment frameworks
    - Implementation guidelines
    - Audit trail requirements
    """,
    
    "internal_compliance": """
Generate internal compliance documentation for:
    1. Security service accreditation
    2. Digital certificate standards
    3. Audit trail requirements
    4. Technical compliance
    
    Requirements:
    {requirements}
    
    Include:
    - Accreditation checklists
    - Technical specifications
    - Security requirements
    - Compliance procedures
    """
}
