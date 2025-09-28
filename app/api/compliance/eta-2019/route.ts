/**
 * ETA 2019 Compliance API Route
 * 
 * Purpose: API endpoint for validating digital signatures against ETA 2019
 * Location: /app/api/compliance/eta-2019/route.ts
 * Features: Real-time compliance validation, comprehensive reporting
 */

import { NextRequest, NextResponse } from 'next/server';
import { etaComplianceService, SignatureData, DocumentData } from '@/lib/services/eta-compliance-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, signatureData } = body;

    if (!documentId || !signatureData) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId and signatureData' },
        { status: 400 }
      );
    }

    // Mock _document data - in production, this would come from database
    const documentData: DocumentData = {
      id: documentId,
      content: signatureData.documentContent || 'Sample _document content for compliance validation',
      hash: signatureData.documentHash || 'sample-_document-hash',
      format: signatureData.documentFormat || 'pdf',
      size: signatureData.documentSize || 1024,
      createdAt: new Date().toISOString(),
      modifiedAt: signatureData.documentModifiedAt
    };

    // Validate compliance
    const complianceResult = await etaComplianceService.validateCompliance(
      signatureData as SignatureData,
      documentData
    );

    return NextResponse.json(complianceResult);
  } catch (error) {
    console.error('ETA compliance validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during compliance validation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'ETA 2019 Compliance API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/compliance/eta-2019 - Validate signature compliance'
    },
    compliance_framework: 'Electronic Transactions Act 4 of 2019 (Namibia)',
    sections: [
      'Section 17 - Legal Recognition of Data Messages',
      'Section 20 - Electronic Signatures',
      'Section 21 - Original Information',
      'Section 25 - Admissibility and Evidential Weight',
      'Chapter 4 - Consumer Protection'
    ]
  });
}
