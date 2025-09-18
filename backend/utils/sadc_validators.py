"""
SADC Country ID Validators
Provides validation rules for ID documents from Southern African Development Community countries
"""

import re
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

logger = logging.getLogger(__name__)

# SADC Country Configuration
SADC_COUNTRIES = {
    "NA": {
        "name": "Namibia",
        "id_format": "11_digits",  # DDMMYYXXXXX
        "id_patterns": [r"\b\d{11}\b"],
        "date_format": "DDMMYY",
        "keywords": ["NAMIBIA", "REPUBLIC OF NAMIBIA", "WINDHOEK"]
    },
    "ZA": {
        "name": "South Africa", 
        "id_format": "13_digits",  # YYMMDDXXXXXX
        "id_patterns": [r"\b\d{13}\b"],
        "date_format": "YYMMDD",
        "keywords": ["SOUTH AFRICA", "RSA", "PRETORIA", "CAPE TOWN"]
    },
    "BW": {
        "name": "Botswana",
        "id_format": "9_digits",
        "id_patterns": [r"\b\d{9}\b"],
        "date_format": "DDMMYY",
        "keywords": ["BOTSWANA", "GABORONE", "OMANG"]
    },
    "SZ": {
        "name": "Eswatini",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["SWAZILAND", "ESWATINI", "MBABANE"]
    },
    "LS": {
        "name": "Lesotho",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["LESOTHO", "MASERU"]
    },
    "MW": {
        "name": "Malawi",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["MALAWI", "LILONGWE", "BLANTYRE"]
    },
    "MZ": {
        "name": "Mozambique",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["MOZAMBIQUE", "MAPUTO"]
    },
    "ZM": {
        "name": "Zambia",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["ZAMBIA", "LUSAKA"]
    },
    "ZW": {
        "name": "Zimbabwe",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["ZIMBABWE", "HARARE"]
    },
    "TZ": {
        "name": "Tanzania",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["TANZANIA", "DAR ES SALAAM", "DODOMA"]
    },
    "AO": {
        "name": "Angola",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["ANGOLA", "LUANDA"]
    },
    "MG": {
        "name": "Madagascar",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["MADAGASCAR", "ANTANANARIVO"]
    },
    "MU": {
        "name": "Mauritius",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["MAURITIUS", "PORT LOUIS"]
    },
    "SC": {
        "name": "Seychelles",
        "id_format": "variable",
        "id_patterns": [r"\b\d{8,12}\b"],
        "date_format": "DDMMYY",
        "keywords": ["SEYCHELLES", "VICTORIA"]
    }
}

class SADCValidator:
    """Validator for SADC country ID documents"""
    
    def __init__(self):
        self.countries = SADC_COUNTRIES
        
    def validate_id_number(self, id_number: str, country_code: str) -> Tuple[bool, float, List[str]]:
        """
        Validate ID number format for specific SADC country
        
        Args:
            id_number: ID number to validate
            country_code: SADC country code (NA, ZA, BW, etc.)
            
        Returns:
            Tuple of (is_valid, confidence_score, validation_messages)
        """
        if not id_number:
            return False, 0.0, ["ID number is empty"]
        
        country_config = self.countries.get(country_code, self.countries["NA"])
        validation_messages = []
        
        # Clean ID number (remove spaces, etc.)
        clean_id = id_number.replace(" ", "").replace("-", "")
        
        # Check format based on country
        if country_code == "NA":
            # Namibian ID: 11 digits
            if len(clean_id) != 11 or not clean_id.isdigit():
                validation_messages.append(f"Invalid Namibian ID format: expected 11 digits, got {len(clean_id)}")
                return False, 0.3, validation_messages
            
            # Check date part (first 6 digits)
            try:
                day = int(clean_id[0:2])
                month = int(clean_id[2:4])
                year = int(clean_id[4:6])
                
                if not (1 <= day <= 31 and 1 <= month <= 12):
                    validation_messages.append(f"Invalid date in Namibian ID: {day}/{month}/{year}")
                    return False, 0.5, validation_messages
                    
                validation_messages.append(f"Valid Namibian ID format")
                return True, 0.9, validation_messages
            except ValueError:
                validation_messages.append("Invalid date format in Namibian ID")
                return False, 0.3, validation_messages
                
        elif country_code == "ZA":
            # South African ID: 13 digits
            if len(clean_id) != 13 or not clean_id.isdigit():
                validation_messages.append(f"Invalid South African ID format: expected 13 digits, got {len(clean_id)}")
                return False, 0.3, validation_messages
            
            # Check date part (first 6 digits)
            try:
                year = int(clean_id[0:2])
                month = int(clean_id[2:4])
                day = int(clean_id[4:6])
                
                if not (1 <= day <= 31 and 1 <= month <= 12):
                    validation_messages.append(f"Invalid date in South African ID: {day}/{month}/{year}")
                    return False, 0.5, validation_messages
                
                # Check citizenship digit (11th digit)
                citizenship = int(clean_id[10])
                if citizenship not in [0, 1]:
                    validation_messages.append(f"Invalid citizenship indicator in South African ID")
                    return False, 0.7, validation_messages
                
                validation_messages.append(f"Valid South African ID format")
                return True, 0.9, validation_messages
            except ValueError:
                validation_messages.append("Invalid date format in South African ID")
                return False, 0.3, validation_messages
                
        elif country_code == "BW":
            # Botswana ID: 9 digits
            if len(clean_id) != 9 or not clean_id.isdigit():
                validation_messages.append(f"Invalid Botswana ID format: expected 9 digits, got {len(clean_id)}")
                return False, 0.3, validation_messages
            
            validation_messages.append(f"Valid Botswana ID format")
            return True, 0.9, validation_messages
            
        else:
            # Generic validation for other SADC countries
            patterns = country_config.get("id_patterns", [r"\b\d{8,12}\b"])
            
            for pattern in patterns:
                if re.match(pattern, clean_id):
                    validation_messages.append(f"ID matches expected pattern for {country_config.get('name', country_code)}")
                    return True, 0.7, validation_messages
            
            validation_messages.append(f"ID does not match expected pattern for {country_config.get('name', country_code)}")
            return False, 0.3, validation_messages
    
    def validate_date_of_birth(self, dob: str, country_code: str) -> Tuple[bool, float, List[str]]:
        """
        Validate date of birth format and reasonability
        
        Args:
            dob: Date of birth string
            country_code: SADC country code
            
        Returns:
            Tuple of (is_valid, confidence_score, validation_messages)
        """
        if not dob:
            return False, 0.0, ["Date of birth is empty"]
        
        validation_messages = []
        
        # Try multiple date formats
        formats = [
            "%Y-%m-%d",
            "%d/%m/%Y",
            "%m/%d/%Y",
            "%d-%m-%Y",
            "%m-%d-%Y",
            "%d.%m.%Y",
            "%Y/%m/%d"
        ]
        
        parsed_date = None
        for fmt in formats:
            try:
                parsed_date = datetime.strptime(dob, fmt)
                break
            except ValueError:
                continue
        
        if not parsed_date:
            validation_messages.append(f"Could not parse date: {dob}")
            return False, 0.3, validation_messages
        
        # Check if date is reasonable (not in future, not too old)
        now = datetime.now()
        if parsed_date > now:
            validation_messages.append(f"Date of birth is in the future")
            return False, 0.3, validation_messages
        
        age = now.year - parsed_date.year - ((now.month, now.day) < (parsed_date.month, parsed_date.day))
        if age > 120:
            validation_messages.append(f"Age is unreasonably high: {age}")
            return False, 0.5, validation_messages
        
        if age < 16:
            validation_messages.append(f"Age is below minimum for ID: {age}")
            return False, 0.7, validation_messages
        
        validation_messages.append(f"Valid date of birth: {parsed_date.strftime('%Y-%m-%d')}, age: {age}")
        return True, 0.9, validation_messages
    
    def validate_name(self, name: str) -> Tuple[bool, float, List[str]]:
        """
        Validate name format and reasonability
        
        Args:
            name: Full name string
            
        Returns:
            Tuple of (is_valid, confidence_score, validation_messages)
        """
        if not name:
            return False, 0.0, ["Name is empty"]
        
        validation_messages = []
        clean_name = name.strip()
        
        # Check minimum length
        if len(clean_name) < 3:
            validation_messages.append(f"Name is too short: {len(clean_name)} chars")
            return False, 0.3, validation_messages
        
        # Check for at least two parts (first and last name)
        name_parts = clean_name.split()
        if len(name_parts) < 2:
            validation_messages.append(f"Name should have at least first and last name")
            return False, 0.5, validation_messages
        
        # Check for reasonable characters
        if not re.match(r"^[A-Za-z\s\-']+$", clean_name):
            validation_messages.append(f"Name contains invalid characters")
            return False, 0.7, validation_messages
        
        # Check for reasonable name length
        if len(clean_name) > 100:
            validation_messages.append(f"Name is unreasonably long: {len(clean_name)} chars")
            return False, 0.5, validation_messages
        
        validation_messages.append(f"Valid name format: {clean_name}")
        return True, 0.9, validation_messages
    
    def validate_extracted_fields(self, fields: Dict[str, Any], country_code: str) -> Dict[str, Any]:
        """
        Validate all extracted fields against SADC country rules
        
        Args:
            fields: Dictionary of extracted fields
            country_code: SADC country code
            
        Returns:
            Dictionary with validation results
        """
        validations = {
            "passed": [],
            "failed": [],
            "warnings": []
        }
        
        # ID Number validation
        id_number = fields.get("id_number")
        if id_number:
            is_valid, confidence, messages = self.validate_id_number(id_number, country_code)
            if is_valid:
                validations["passed"].append("id_format_valid")
            else:
                validations["failed"].append("id_format_invalid")
                validations["warnings"].extend(messages)
        else:
            validations["failed"].append("id_number_missing")
        
        # Date of birth validation
        dob = fields.get("date_of_birth")
        if dob:
            is_valid, confidence, messages = self.validate_date_of_birth(dob, country_code)
            if is_valid:
                validations["passed"].append("dob_valid")
            else:
                validations["warnings"].append("dob_questionable")
                validations["warnings"].extend(messages)
        else:
            validations["failed"].append("dob_missing")
        
        # Name validation
        full_name = fields.get("full_name")
        if full_name:
            is_valid, confidence, messages = self.validate_name(full_name)
            if is_valid:
                validations["passed"].append("name_valid")
            else:
                validations["warnings"].append("name_questionable")
                validations["warnings"].extend(messages)
        else:
            # Try first name + last name
            first_name = fields.get("first_name") or fields.get("first_names")
            last_name = fields.get("last_name") or fields.get("surname")
            
            if first_name and last_name:
                combined_name = f"{first_name} {last_name}"
                is_valid, confidence, messages = self.validate_name(combined_name)
                if is_valid:
                    validations["passed"].append("name_valid")
                else:
                    validations["warnings"].append("name_questionable")
                    validations["warnings"].extend(messages)
            else:
                validations["failed"].append("name_missing")
        
        # Calculate validation score
        total_checks = len(validations["passed"]) + len(validations["failed"])
        if total_checks > 0:
            score = len(validations["passed"]) / total_checks
        else:
            score = 0.0
        
        return {
            "score": score,
            "passed": validations["passed"],
            "failed": validations["failed"],
            "warnings": validations["warnings"],
            "country": country_code
        }
    
    def generate_bfr_sign_id(self, fields: Dict[str, Any], country_code: str) -> str:
        """
        Generate a unique BFR-SIGN-ID based on extracted fields
        
        Args:
            fields: Dictionary of extracted fields
            country_code: SADC country code
            
        Returns:
            BFR-SIGN-ID string
        """
        import hashlib
        import time
        
        # Get key fields
        id_number = fields.get("id_number", "")
        full_name = fields.get("full_name", "")
        if not full_name:
            first_name = fields.get("first_name", "") or fields.get("first_names", "")
            last_name = fields.get("last_name", "") or fields.get("surname", "")
            full_name = f"{first_name} {last_name}".strip()
        
        dob = fields.get("date_of_birth", "")
        
        # Create base string for hashing
        timestamp = int(time.time())
        base_string = f"{country_code}:{id_number}:{full_name}:{dob}:{timestamp}"
        
        # Create hash
        hash_object = hashlib.sha256(base_string.encode())
        hash_hex = hash_object.hexdigest()
        
        # Format BFR-SIGN-ID: BFR-{COUNTRY}-{FIRST 8 CHARS OF HASH}-{LAST 4 CHARS OF HASH}
        bfr_sign_id = f"BFR-{country_code}-{hash_hex[:8]}-{hash_hex[-4:]}"
        
        return bfr_sign_id

# Create singleton instance
sadc_validator = SADCValidator()
