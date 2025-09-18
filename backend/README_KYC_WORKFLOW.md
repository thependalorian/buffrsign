# BuffrSign KYC Workflow Implementation

This document provides an overview of the KYC (Know Your Customer) workflow implementation for BuffrSign, focusing on ID document extraction and verification for SADC (Southern African Development Community) countries.

## Architecture Overview

The KYC workflow uses a state-of-the-art approach combining:

1. **LangGraph** for stateful workflow management
2. **Pydantic AI** for structured data extraction
3. **Vision Models** for document analysis
4. **AI Agents** for intelligent processing

### Key Components

- **KYC Workflow Engine**: Orchestrates the entire KYC process using LangGraph
- **Pydantic AI Agent Manager**: Handles AI-powered document analysis and field extraction
- **SADC Validators**: Provides country-specific validation rules for ID documents
- **Vision Configuration**: Manages environment variables for vision models and AI agents

## Workflow States

The KYC workflow follows these states:

1. **INITIALIZED**: Workflow created
2. **DOCUMENT_UPLOADED**: Document uploaded for processing
3. **OCR_EXTRACTION_COMPLETE**: Text extracted from document
4. **AI_COUNTRY_DETECTION**: Country detected from extracted text
5. **AI_FIELD_EXTRACTION**: Fields extracted from text based on country
6. **SADC_VALIDATION**: Fields validated against country-specific rules
7. **AUTO_APPROVED** / **AUTO_REJECTED**: Automatic decision based on validation
8. **COMPLETED**: Workflow completed

## OCR and AI Agent Priority

The system uses a priority-based approach for OCR and field extraction:

### OCR Extraction Priority:
1. **OpenAI GPT-4 Vision** (confidence > 0.7)
2. **Google Vision API** (confidence > 0.6)
3. **Azure Cognitive Services** (confidence > 0.6)
4. **pytesseract OCR** (final fallback, confidence 0.3)

### Field Extraction Priority:
1. **Pydantic AI Agent** (confidence > 0.6)
2. **OpenAI Structured Output** (confidence > 0.5)
3. **General AI Agent Manager** (confidence > 0.6)
4. **Regex Parsing** (FINAL fallback only, confidence 0.3)

## Supported SADC Countries

The system supports ID documents from 14 SADC countries:

- **NA**: Namibia (11 digits ID)
- **ZA**: South Africa (13 digits ID)
- **BW**: Botswana (9 digits ID)
- **SZ**: Eswatini
- **LS**: Lesotho
- **MW**: Malawi
- **MZ**: Mozambique
- **ZM**: Zambia
- **ZW**: Zimbabwe
- **TZ**: Tanzania
- **AO**: Angola
- **MG**: Madagascar
- **MU**: Mauritius
- **SC**: Seychelles

## API Endpoints

The KYC workflow exposes these API endpoints:

- **POST /kyc/start**: Start a new KYC workflow
- **POST /kyc/upload**: Upload document for KYC processing
- **GET /kyc/status/{workflow_id}**: Get workflow status
- **GET /kyc/audit-trail/{workflow_id}**: Get workflow audit trail
- **POST /kyc/generate-bfr-sign-id**: Generate BFR-SIGN-ID from completed workflow

## Environment Configuration

Configure the system using these environment variables:

```
# Vision Models
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_VISION_MODEL=gpt-4-vision-preview
OPENAI_AGENT_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.1

# Google Cloud Vision (optional)
GOOGLE_VISION_ENABLED=false
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json

# Azure Computer Vision (optional)
AZURE_VISION_ENABLED=false
AZURE_VISION_ENDPOINT=https://your-azure-endpoint.cognitiveservices.azure.com/
AZURE_VISION_KEY=your-azure-key-here

# AWS Rekognition (optional)
AWS_REKOGNITION_ENABLED=false
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# OCR Configuration
TESSERACT_PATH=/usr/bin/tesseract
TESSERACT_CONFIG=--oem 3 --psm 6
EASYOCR_ENABLED=true

# Workflow Configuration
MIN_CONFIDENCE_THRESHOLD=0.8
MIN_FIELD_MATCH_THRESHOLD=0.7
```

## BFR-SIGN-ID Generation

The system generates a unique BFR-SIGN-ID for each verified identity:

- Format: `BFR-{COUNTRY_CODE}-{HASH_PART1}-{HASH_PART2}`
- Example: `BFR-NA-a1b2c3d4-5e6f`

The BFR-SIGN-ID is generated using:
- Country code
- ID number
- Full name
- Date of birth
- Timestamp
- SHA-256 hashing

## Running Tests

Run the integration tests with:

```bash
pytest -xvs tests/test_kyc_workflow.py
```

## Dependencies

- `pydantic-ai==0.0.1`
- `langgraph==0.2.0`
- `langchain==0.2.0`
- `langchain-core==0.2.0`
- `openai==1.3.7`
- `pytesseract==0.3.13`
- `opencv-python==4.8.1.78`
- `Pillow==10.1.0`

## Security Considerations

- All API endpoints require authentication
- Sensitive data is not logged
- Document data is processed in memory and not stored permanently
- Audit trails track all workflow steps for compliance
- Environment variables secure API keys and credentials
