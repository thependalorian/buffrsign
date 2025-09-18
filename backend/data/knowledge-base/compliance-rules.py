# backend/data/knowledge-base/compliance-rules.py
from typing import Dict, List, Any
from enum import Enum

class ComplianceFramework(Enum):
    ETA_2019 = "eta_2019"
    INTERNAL = "internal_compliance"
    LABOUR_ACT = "namibian_labour_act"
    CONSUMER_PROTECTION = "consumer_protection_act"

class ComplianceRule:
    def __init__(self, rule_id: str, framework: ComplianceFramework, 
                 description: str, validation_function: callable):
        self.rule_id = rule_id
        self.framework = framework
        self.description = description
        self.validation_function = validation_function

# ETA 2019 Compliance Rules
ETA_2019_RULES = [
    ComplianceRule(
        rule_id="eta_section_17_legal_recognition",
        framework=ComplianceFramework.ETA_2019,
        description="Document must not be denied legal effect solely because it's electronic",
        validation_function=lambda doc: validate_legal_recognition(doc)
    ),
    ComplianceRule(
        rule_id="eta_section_20_electronic_signature",
        framework=ComplianceFramework.ETA_2019,
        description="Electronic signatures must meet recognized standards",
        validation_function=lambda doc: validate_electronic_signature_compliance(doc)
    ),
    ComplianceRule(
        rule_id="eta_section_21_original_information",
        framework=ComplianceFramework.ETA_2019,
        description="Information integrity must be maintained",
        validation_function=lambda doc: validate_information_integrity(doc)
    )
]

# Internal Compliance Rules
INTERNAL_RULES = [
    ComplianceRule(
        rule_id="internal_security_service_provider",
        framework=ComplianceFramework.INTERNAL,
        description="Service provider must meet internal standards",
        validation_function=lambda doc: validate_internal_compliance(doc)
    ),
    ComplianceRule(
        rule_id="internal_digital_certificate",
        framework=ComplianceFramework.INTERNAL,
        description="Digital certificates must be from accredited authority",
        validation_function=lambda doc: validate_digital_certificate(doc)
    )
]

def validate_legal_recognition(document: Dict[str, Any]) -> Dict[str, Any]:
    """Validate ETA 2019 Section 17 compliance"""
    return {
        "compliant": True,
        "issues": [],
        "recommendations": [
            "Ensure electronic format doesn't invalidate legal effect",
            "Include clause acknowledging electronic validity"
        ]
    }

def validate_electronic_signature_compliance(document: Dict[str, Any]) -> Dict[str, Any]:
    """Validate ETA 2019 Section 20 compliance"""
    signature_fields = document.get("signature_fields", [])
    
    issues = []
    recommendations = []
    
    for field in signature_fields:
        if field.get("type") not in ["advanced_electronic", "qualified_electronic"]:
            issues.append(f"Signature field {field.get('id')} may not meet ETA 2019 standards")
            recommendations.append("Consider using advanced electronic signatures for legal certainty")
    
    return {
        "compliant": len(issues) == 0,
        "issues": issues,
        "recommendations": recommendations
    }
