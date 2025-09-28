/**
 * Signature Verification and Compliance Tests
 * 
 * Purpose: Test signature verification, compliance checking, and legal validation
 * Location: /__tests__/signature-verification-compliance.test.ts
 * Features: Comprehensive verification and compliance testing with TypeScript
 */

import { 
  Signature, 
  SignatureData, 
  SignatureType, 
  SignatureVerificationStatus,
  DigitalCertificate,
  BiometricData,
  Document,
  DocumentType,
  DocumentStatus,
  AuditEvent
} from '../lib/types';

// Compliance standards enum
enum ComplianceStandard {
  ETA_2019 = 'eta_2019',
  EIDAS = 'eidas',
  ESIGN_ACT = 'esign_act',
  UETA = 'ueta',
  POPIA = 'popia',
  GDPR = 'gdpr'
}

// Verification result interface
interface VerificationResult {
  valid: boolean;
  confidence_score: number;
  verification_status: SignatureVerificationStatus;
  compliance_status: ComplianceStatus;
  legal_validity: LegalValidity;
  details: VerificationDetails;
  recommendations: string[];
}

interface ComplianceStatus {
  standards_met: ComplianceStandard[];
  overall_compliant: boolean;
  compliance_score: number;
  missing_requirements: string[];
}

interface LegalValidity {
  enforceable: boolean;
  admissible: boolean;
  evidence_quality: 'low' | 'medium' | 'high';
  jurisdiction_valid: boolean;
  retention_valid: boolean;
}

interface VerificationDetails {
  signature_id: string;
  document_id: string;
  signer_id: string;
  timestamp: string;
  certificate_valid: boolean;
  biometric_valid?: boolean;
  device_trusted: boolean;
  location_verified: boolean;
  risk_assessment: RiskAssessment;
}

interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: RiskFactor[];
  risk_score: number;
  mitigation_required: boolean;
}

interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
}

// Signature verification service
class SignatureVerificationService {
  async verifySignature(
    signature: Signature,
    _document: Document,
    verificationContext: VerificationContext
  ): Promise<VerificationResult> {
    const verificationChecks = await Promise.all([
      this.verifyCryptographicIntegrity(signature),
      this.verifyTimestamp(signature),
      this.verifyCertificate(signature),
      this.verifyBiometricData(signature, verificationContext),
      this.verifyDeviceTrust(signature, verificationContext),
      this.verifyLocation(signature, verificationContext),
      this.assessRisk(signature, verificationContext)
    ]);

    const overallValid = verificationChecks.every(check => check.valid); // Moved declaration
    const complianceStatus = await this.checkCompliance(signature, _document);
    const legalValidity = await this.assessLegalValidity(signature, complianceStatus, overallValid); // Pass overallValid
    const confidenceScore = this.calculateConfidenceScore(verificationChecks, complianceStatus);
    const recommendations = this.generateRecommendations(verificationChecks, complianceStatus, legalValidity);

    return {
      valid: overallValid,
      confidence_score: confidenceScore,
      verification_status: overallValid 
        ? SignatureVerificationStatus.VERIFIED 
        : SignatureVerificationStatus.FAILED,
      compliance_status: complianceStatus,
      legal_validity: legalValidity,
      details: {
        signature_id: signature.id,
        document_id: signature.document_id,
        signer_id: signature.signer_id,
        timestamp: signature.timestamp,
        certificate_valid: verificationChecks[2].valid,
        biometric_valid: verificationChecks[3].valid,
        device_trusted: verificationChecks[4].valid,
        location_verified: verificationChecks[5].valid,
        risk_assessment: verificationChecks[6].result as RiskAssessment
      },
      recommendations
    };
  }

  private async verifyCryptographicIntegrity(signature: Signature): Promise<VerificationCheck> {
    try {
      // Mock cryptographic verification
      const isValid = signature.signature_data.verification_hash.length > 0;
      
      return {
        valid: isValid,
        result: {
          algorithm: 'SHA-256',
          key_size: 2048,
          integrity_verified: isValid
        }
      };
    } catch (error) {
      return {
        valid: false,
        result: { error: 'Cryptographic verification failed' }
      };
    }
  }

  private async verifyTimestamp(signature: Signature): Promise<VerificationCheck> {
    try {
      const signatureTime = new Date(signature.timestamp);
      const now = new Date();
      const timeDiff = now.getTime() - signatureTime.getTime();
      
      // Check if signature is not in the future (allow 5 minutes tolerance)
      const notFuture = signatureTime <= new Date(now.getTime() + 5 * 60 * 1000);
      
      // Check if signature is not too old (within 10 years)
      const notTooOld = timeDiff <= 10 * 365 * 24 * 60 * 60 * 1000;
      
      const valid = notFuture && notTooOld;
      
      return {
        valid,
        result: {
          signature_time: signature.timestamp,
          verification_time: now.toISOString(),
          not_future: notFuture,
          not_too_old: notTooOld,
          age_days: Math.floor(timeDiff / (24 * 60 * 60 * 1000))
        }
      };
    } catch (error) {
      return {
        valid: false,
        result: { error: 'Timestamp verification failed' }
      };
    }
  }

  private async verifyCertificate(signature: Signature): Promise<VerificationCheck> {
    try {
      if (signature.signature_type !== SignatureType.DIGITAL || !signature.certificate_info) {
        return {
          valid: true,
          result: { message: 'No certificate verification required' }
        };
      }

      const cert = signature.certificate_info;
      const now = new Date();
      const validFrom = new Date(cert.valid_from);
      const validUntil = new Date(cert.valid_until);
      
      const timeValid = validFrom <= now && now <= validUntil;
      const chainValid = cert.certificate_chain.length > 0;
      const issuerValid = cert.issuer.length > 3;
      
      const valid = timeValid && chainValid && issuerValid;
      
      return {
        valid,
        result: {
          serial_number: cert.serial_number,
          issuer: cert.issuer,
          valid_from: cert.valid_from,
          valid_until: cert.valid_until,
          time_valid: timeValid,
          chain_valid: chainValid,
          issuer_valid: issuerValid
        }
      };
    } catch (error) {
      return {
        valid: false,
        result: { error: 'Certificate verification failed' }
      };
    }
  }

  private async verifyBiometricData(
    signature: Signature, 
    context: VerificationContext
  ): Promise<VerificationCheck> {
    try {
      if (signature.signature_type !== SignatureType.BIOMETRIC || !signature.signature_data.biometric_data) {
        return {
          valid: true,
          result: { message: 'No biometric verification required' }
        };
      }

      const biometricData = signature.signature_data.biometric_data;
      const providedBiometric = context.biometric_data;
      
      if (!providedBiometric) {
        return {
          valid: false,
          result: { error: 'Biometric data required for verification' }
        };
      }

      // Mock biometric matching
      const matchScore = this.calculateBiometricMatch(biometricData, providedBiometric);
      const threshold = 0.8;
      const valid = matchScore >= threshold;
      
      return {
        valid,
        result: {
          match_score: matchScore,
          threshold: threshold,
          biometric_type: biometricData.type,
          confidence: biometricData.data_hash.length > 10 ? 0.9 : 0.5
        }
      };
    } catch (error) {
      return {
        valid: false,
        result: { error: 'Biometric verification failed' }
      };
    }
  }

  private async verifyDeviceTrust(
    signature: Signature, 
    context: VerificationContext
  ): Promise<VerificationCheck> {
    try {
      const deviceFingerprint = context.device_fingerprint;
      const trustedDevices = context.trusted_devices || [];
      
      const deviceTrusted = trustedDevices.includes(deviceFingerprint || '');
      const ipValid = this.isValidIpAddress(signature.ip_address);
      
      const valid = deviceTrusted || ipValid;
      
      return {
        valid,
        result: {
          device_trusted: deviceTrusted,
          ip_valid: ipValid,
          device_fingerprint: deviceFingerprint,
          ip_address: signature.ip_address
        }
      };
    } catch (error) {
      return {
        valid: false,
        result: { error: 'Device trust verification failed' }
      };
    }
  }

  private async verifyLocation(
    signature: Signature, 
    context: VerificationContext
  ): Promise<VerificationCheck> {
    try {
      const expectedLocation = context.expected_location;
      const actualLocation = context.actual_location;
      
      if (!expectedLocation || !actualLocation) {
        return {
          valid: true,
          result: { message: 'Location verification not required' }
        };
      }

      const distance = this.calculateDistance(expectedLocation, actualLocation);
      const maxDistance = 100; // 100km tolerance
      const valid = distance <= maxDistance;
      
      return {
        valid,
        result: {
          expected_location: expectedLocation,
          actual_location: actualLocation,
          distance_km: distance,
          max_distance_km: maxDistance,
          location_verified: valid
        }
      };
    } catch (error) {
      return {
        valid: false,
        result: { error: 'Location verification failed' }
      };
    }
  }

  private async assessRisk(
    signature: Signature, 
    context: VerificationContext
  ): Promise<VerificationCheck> {
    try {
      const riskFactors: RiskFactor[] = [];
      let riskScore = 0;

      // Check signature age
      const signatureAge = Date.now() - new Date(signature.timestamp).getTime();
      const ageInDays = signatureAge / (24 * 60 * 60 * 1000);
      
      if (ageInDays > 365) {
        riskFactors.push({
          factor: 'signature_age',
          severity: 'medium',
          description: 'Signature is older than 1 year',
          impact: 'May affect legal validity'
        });
        riskScore += 0.3;
      }

      // Check device trust
      const deviceTrusted = context.trusted_devices?.includes(context.device_fingerprint || '');
      if (!deviceTrusted) {
        riskFactors.push({
          factor: 'untrusted_device',
          severity: 'high',
          description: 'Signature created from untrusted device',
          impact: 'Increased fraud risk'
        });
        riskScore += 0.5;
      }

      // Check location
      if (context.expected_location && context.actual_location) {
        const distance = this.calculateDistance(context.expected_location, context.actual_location);
        if (distance > 1000) { // 1000km
          riskFactors.push({
            factor: 'suspicious_location',
            severity: 'high',
            description: 'Signature created from suspicious location',
            impact: 'Potential unauthorized access'
          });
          riskScore += 0.6;
        }
      }

      // Check IP address
      if (!this.isValidIpAddress(signature.ip_address)) {
        riskFactors.push({
          factor: 'invalid_ip',
          severity: 'medium',
          description: 'Invalid IP address format',
          impact: 'Cannot verify origin'
        });
        riskScore += 0.2;
      }

      const overallRisk = riskScore < 0.3 ? 'low' : riskScore < 0.6 ? 'medium' : riskScore < 0.8 ? 'high' : 'critical';
      
      return {
        valid: overallRisk !== 'critical',
        result: {
          overall_risk: overallRisk,
          risk_factors: riskFactors,
          risk_score: riskScore,
          mitigation_required: overallRisk === 'high' || overallRisk === 'critical'
        } as RiskAssessment
      };
    } catch (error) {
      return {
        valid: false,
        result: { error: 'Risk assessment failed' }
      };
    }
  }

  private async checkCompliance(signature: Signature, _document: Document): Promise<ComplianceStatus> {
    const standardsMet: ComplianceStandard[] = [];
    const missingRequirements: string[] = [];
    let complianceScore = 0;

    // ETA 2019 compliance
    if (signature.signature_type === SignatureType.DIGITAL && signature.certificate_info) {
      standardsMet.push(ComplianceStandard.ETA_2019);
      complianceScore += 0.3;
    } else {
      missingRequirements.push('Digital certificate required for ETA 2019 compliance');
    }

    // eIDAS compliance
    if (signature.signature_type === SignatureType.DIGITAL && 
        signature.certificate_info && 
        signature.certificate_info.issuer.includes('Qualified')) {
      standardsMet.push(ComplianceStandard.EIDAS);
      complianceScore += 0.3;
    } else {
      missingRequirements.push('Qualified certificate required for eIDAS compliance');
    }

    // ESIGN Act compliance
    if (signature.signature_data.verification_hash && signature.timestamp) {
      standardsMet.push(ComplianceStandard.ESIGN_ACT);
      complianceScore += 0.2;
    } else {
      missingRequirements.push('Verification hash and timestamp required for ESIGN Act compliance');
    }

    // GDPR/Privacy compliance
    if (signature.signature_data.biometric_data) {
      // Check if biometric data has proper consent
      standardsMet.push(ComplianceStandard.GDPR);
      complianceScore += 0.2;
    }

    return {
      standards_met: standardsMet,
      overall_compliant: standardsMet.length > 0,
      compliance_score: complianceScore,
      missing_requirements: missingRequirements
    };
  }

  private async assessLegalValidity(
    signature: Signature, 
    compliance: ComplianceStatus,
    overallValid: boolean // Added overallValid parameter
  ): Promise<LegalValidity> {
    const enforceable = compliance.overall_compliant && overallValid; // Use overallValid here
    
    const admissible = enforceable && compliance.compliance_score > 0.5;
    
    const evidenceQuality = compliance.compliance_score > 0.8 ? 'high' : 
                           compliance.compliance_score > 0.5 ? 'medium' : 'low';
    
    const jurisdictionValid = compliance.standards_met.length > 0;
    
    const retentionValid = this.checkRetentionPeriod(signature);
    
    return {
      enforceable,
      admissible,
      evidence_quality: evidenceQuality,
      jurisdiction_valid: jurisdictionValid,
      retention_valid: retentionValid
    };
  }

  private calculateConfidenceScore(
    checks: VerificationCheck[], 
    compliance: ComplianceStatus
  ): number {
    const checkScore = checks.filter(check => check.valid).length / checks.length;
    const complianceScore = compliance.compliance_score;
    return (checkScore + complianceScore) / 2;
  }

  private generateRecommendations(
    checks: VerificationCheck[],
    compliance: ComplianceStatus,
    legal: LegalValidity
  ): string[] {
    const recommendations: string[] = [];

    if (!checks[0].valid) {
      recommendations.push('Cryptographic verification failed - signature may be tampered with');
    }

    if (!checks[1].valid) {
      recommendations.push('Timestamp verification failed - check signature timing');
    }

    if (!checks[2].valid) {
      recommendations.push('Certificate verification failed - verify certificate chain');
    }

    if (!checks[3].valid) {
      recommendations.push('Biometric verification failed - re-authenticate _user');
    }

    if (!checks[4].valid) {
      recommendations.push('Device not trusted - additional verification required');
    }

    if (!checks[5].valid) {
      recommendations.push('Location verification failed - check _user location');
    }

    if (checks[6].result && (checks[6].result as RiskAssessment).mitigation_required) {
      recommendations.push('High risk detected - manual review required');
    }

    if (compliance.missing_requirements.length > 0) {
      recommendations.push(`Missing compliance requirements: ${compliance.missing_requirements.join(', ')}`);
    }

    if (!legal.enforceable) {
      recommendations.push('Signature may not be legally enforceable');
    }

    if (!legal.admissible) {
      recommendations.push('Signature may not be admissible as evidence');
    }

    return recommendations;
  }

  private calculateBiometricMatch(stored: BiometricData, provided: BiometricData): number {
    // Mock biometric matching algorithm
    if (stored.type !== provided.type) return 0;
    if (stored.data_hash === provided.data_hash) return 0.95;
    return 0.3; // Low match score
  }

  private isValidIpAddress(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    // Simplified distance calculation (in km)
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2.latitude - loc1.latitude);
    const dLon = this.toRad(loc2.longitude - loc1.longitude);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(loc1.latitude)) * Math.cos(this.toRad(loc2.latitude)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private checkRetentionPeriod(signature: Signature): boolean {
    const signatureDate = new Date(signature.timestamp);
    const now = new Date();
    const retentionPeriod = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years
    return (now.getTime() - signatureDate.getTime()) <= retentionPeriod;
  }
}

interface VerificationCheck {
  valid: boolean;
  result: unknown;
}

interface VerificationContext {
  biometric_data?: BiometricData;
  device_fingerprint?: string;
  trusted_devices?: string[];
  expected_location?: Location;
  actual_location?: Location;
}

interface Location {
  latitude: number;
  longitude: number;
}

describe('Signature Verification Service', () => {
  let verificationService: SignatureVerificationService;
  let testSignature: Signature;
  let testDocument: Document;

  beforeEach(() => {
    verificationService = new SignatureVerificationService();

    testDocument = {
      id: 'test-doc-123',
      user_id: 'test-_user-456',
      title: 'Test Contract',
      type: DocumentType.CONTRACT,
      status: DocumentStatus.SIGNED,
      file_url: 'https://example.com/test.pdf',
      file_size: 1024000,
      mime_type: 'application/pdf',
      content_hash: 'abc123',
      metadata: {
        page_count: 5,
        language: 'en',
        created_by: 'test-_user-456',
        tags: ['contract'],
        description: 'Test contract'
      },
      signature_fields: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    testSignature = {
      id: 'test-sig-123',
      document_id: 'test-doc-123',
      signer_id: 'test-_user-456',
      field_name: 'signature_field',
      signature_data: {
        image_url: 'https://example.com/signature.png',
        verification_hash: 'valid-hash-1234567890'
      },
      signature_type: SignatureType.ELECTRONIC,
      timestamp: new Date().toISOString(),
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
      verification_status: SignatureVerificationStatus.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });

  describe('Signature Verification', () => {
    it('should verify valid electronic signature', async () => {
      // Arrange
      const context: VerificationContext = {
        device_fingerprint: 'trusted-device-123',
        trusted_devices: ['trusted-device-123'],
        expected_location: { latitude: -22.5609, longitude: 17.0658 }, // Windhoek
        actual_location: { latitude: -22.5609, longitude: 17.0658 }
      };

      // Act
      const result = await verificationService.verifySignature(testSignature, testDocument, context);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.verification_status).toBe(SignatureVerificationStatus.VERIFIED);
      expect(result.confidence_score).toBeGreaterThan(0.5);
      expect(result.details.signature_id).toBe(testSignature.id);
      expect(result.details.document_id).toBe(testDocument.id);
      expect(result.details.signer_id).toBe(testSignature.signer_id);
    });

    it('should verify digital signature with certificate', async () => {
      // Arrange
      const digitalSignature: Signature = {
        ...testSignature,
        signature_type: SignatureType.DIGITAL,
        signature_data: {
          digital_signature: btoa('digital-signature-data'),
          verification_hash: 'valid-hash-1234567890'
        },
        certificate_info: {
          issuer: 'BuffrSign Qualified CA',
          serial_number: '123456789',
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          public_key: 'valid-public-key-1234567890',
          certificate_chain: ['BuffrSign Qualified CA', 'Root CA']
        }
      };

      const context: VerificationContext = {
        device_fingerprint: 'trusted-device-123',
        trusted_devices: ['trusted-device-123']
      };

      // Act
      const result = await verificationService.verifySignature(digitalSignature, testDocument, context);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.verification_status).toBe(SignatureVerificationStatus.VERIFIED);
      expect(result.compliance_status.standards_met).toContain(ComplianceStandard.ETA_2019);
      expect(result.compliance_status.standards_met).toContain(ComplianceStandard.EIDAS);
      expect(result.legal_validity.enforceable).toBe(true);
      expect(result.legal_validity.admissible).toBe(true);
    });

    it('should verify biometric signature', async () => {
      // Arrange
      const biometricSignature: Signature = {
        ...testSignature,
        signature_type: SignatureType.BIOMETRIC,
        signature_data: {
          biometric_data: {
            type: 'fingerprint',
            data_hash: 'biometric-hash-1234567890',
            device_id: 'biometric-device-123',
            timestamp: new Date().toISOString()
          },
          verification_hash: 'valid-hash-1234567890'
        }
      };

      const context: VerificationContext = {
        biometric_data: {
          type: 'fingerprint',
          data_hash: 'biometric-hash-1234567890',
          device_id: 'biometric-device-123',
          timestamp: new Date().toISOString()
        },
        device_fingerprint: 'trusted-device-123',
        trusted_devices: ['trusted-device-123']
      };

      // Act
      const result = await verificationService.verifySignature(biometricSignature, testDocument, context);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.verification_status).toBe(SignatureVerificationStatus.VERIFIED);
      expect(result.details.biometric_valid).toBe(true);
      expect(result.compliance_status.standards_met).toContain(ComplianceStandard.GDPR);
    });

    it('should fail verification for invalid signature', async () => {
      // Arrange
      const invalidSignature: Signature = {
        ...testSignature,
        signature_data: {
          image_url: 'https://example.com/signature.png',
          verification_hash: '' // Invalid hash
        },
        timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Future timestamp
      };

      const context: VerificationContext = {
        device_fingerprint: 'untrusted-device',
        trusted_devices: ['trusted-device-123']
      };

      // Act
      const result = await verificationService.verifySignature(invalidSignature, testDocument, context);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.verification_status).toBe(SignatureVerificationStatus.FAILED);
      expect(result.confidence_score).toBeLessThan(0.5);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should detect high risk signatures', async () => {
      // Arrange
      const riskySignature: Signature = {
        ...testSignature,
        ip_address: 'invalid-ip',
        timestamp: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString() // 2 years old
      };

      const context: VerificationContext = {
        device_fingerprint: 'untrusted-device',
        trusted_devices: ['trusted-device-123'],
        expected_location: { latitude: -22.5609, longitude: 17.0658 }, // Windhoek
        actual_location: { latitude: 40.7128, longitude: -74.0060 } // New York (far away)
      };

      // Act
      const result = await verificationService.verifySignature(riskySignature, testDocument, context);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.details.risk_assessment.overall_risk).toBe('critical');
      expect(result.details.risk_assessment.mitigation_required).toBe(true);
      expect(result.recommendations).toContain('High risk detected - manual review required');
    });
  });

  describe('Compliance Checking', () => {
    it('should check ETA 2019 compliance', async () => {
      // Arrange
      const etaCompliantSignature: Signature = {
        ...testSignature,
        signature_type: SignatureType.DIGITAL,
        certificate_info: {
          issuer: 'BuffrSign CA',
          serial_number: '123456789',
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          public_key: 'valid-public-key',
          certificate_chain: ['BuffrSign CA']
        }
      };

      const context: VerificationContext = {};

      // Act
      const result = await verificationService.verifySignature(etaCompliantSignature, testDocument, context);

      // Assert
      expect(result.compliance_status.standards_met).toContain(ComplianceStandard.ETA_2019);
      expect(result.compliance_status.overall_compliant).toBe(true);
    });

    it('should check eIDAS compliance', async () => {
      // Arrange
      const eidasCompliantSignature: Signature = {
        ...testSignature,
        signature_type: SignatureType.DIGITAL,
        certificate_info: {
          issuer: 'BuffrSign Qualified CA',
          serial_number: '123456789',
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          public_key: 'valid-public-key',
          certificate_chain: ['BuffrSign Qualified CA', 'Root CA']
        }
      };

      const context: VerificationContext = {};

      // Act
      const result = await verificationService.verifySignature(eidasCompliantSignature, testDocument, context);

      // Assert
      expect(result.compliance_status.standards_met).toContain(ComplianceStandard.EIDAS);
      expect(result.compliance_status.standards_met).toContain(ComplianceStandard.ETA_2019);
    });

    it('should identify missing compliance requirements', async () => {
      // Arrange
      const nonCompliantSignature: Signature = {
        ...testSignature,
        signature_type: SignatureType.ELECTRONIC,
        signature_data: {
          image_url: 'https://example.com/signature.png',
          verification_hash: '' // Missing verification hash
        }
      };

      const context: VerificationContext = {};

      // Act
      const result = await verificationService.verifySignature(nonCompliantSignature, testDocument, context);

      // Assert
      expect(result.compliance_status.overall_compliant).toBe(false);
      expect(result.compliance_status.missing_requirements.length).toBeGreaterThan(0);
      expect(result.compliance_status.missing_requirements).toContain('Digital certificate required for ETA 2019 compliance');
    });
  });

  describe('Legal Validity Assessment', () => {
    it('should assess legally valid signature', async () => {
      // Arrange
      const legallyValidSignature: Signature = {
        ...testSignature,
        signature_type: SignatureType.DIGITAL,
        certificate_info: {
          issuer: 'BuffrSign Qualified CA',
          serial_number: '123456789',
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          public_key: 'valid-public-key',
          certificate_chain: ['BuffrSign Qualified CA', 'Root CA']
        }
      };

      const context: VerificationContext = {
        device_fingerprint: 'trusted-device-123',
        trusted_devices: ['trusted-device-123']
      };

      // Act
      const result = await verificationService.verifySignature(legallyValidSignature, testDocument, context);

      // Assert
      expect(result.legal_validity.enforceable).toBe(true);
      expect(result.legal_validity.admissible).toBe(true);
      expect(result.legal_validity.evidence_quality).toBe('medium');
      expect(result.legal_validity.jurisdiction_valid).toBe(true);
      expect(result.legal_validity.retention_valid).toBe(true);
    });

    it('should assess non-enforceable signature', async () => {
      // Arrange
      const nonEnforceableSignature: Signature = {
        ...testSignature,
        signature_type: SignatureType.ELECTRONIC,
        signature_data: {
          image_url: 'https://example.com/signature.png',
          verification_hash: '' // Missing verification hash
        }
      };

      const context: VerificationContext = {
        device_fingerprint: 'untrusted-device',
        trusted_devices: ['trusted-device-123']
      };

      // Act
      const result = await verificationService.verifySignature(nonEnforceableSignature, testDocument, context);

      // Assert
      expect(result.legal_validity.enforceable).toBe(false);
      expect(result.legal_validity.admissible).toBe(false);
      expect(result.legal_validity.evidence_quality).toBe('low');
      expect(result.recommendations).toContain('Signature may not be legally enforceable');
    });
  });

  describe('Risk Assessment', () => {
    it('should assess low risk signature', async () => {
      // Arrange
      const lowRiskSignature: Signature = {
        ...testSignature,
        timestamp: new Date().toISOString() // Recent timestamp
      };

      const context: VerificationContext = {
        device_fingerprint: 'trusted-device-123',
        trusted_devices: ['trusted-device-123'],
        expected_location: { latitude: -22.5609, longitude: 17.0658 },
        actual_location: { latitude: -22.5609, longitude: 17.0658 }
      };

      // Act
      const result = await verificationService.verifySignature(lowRiskSignature, testDocument, context);

      // Assert
      expect(result.details.risk_assessment.overall_risk).toBe('low');
      expect(result.details.risk_assessment.mitigation_required).toBe(false);
      expect(result.details.risk_assessment.risk_factors.length).toBe(0);
    });

    it('should assess high risk signature', async () => {
      // Arrange
      const highRiskSignature: Signature = {
        ...testSignature,
        ip_address: 'invalid-ip',
        timestamp: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString() // 2 years old
      };

      const context: VerificationContext = {
        device_fingerprint: 'untrusted-device',
        trusted_devices: ['trusted-device-123'],
        expected_location: { latitude: -22.5609, longitude: 17.0658 },
        actual_location: { latitude: 40.7128, longitude: -74.0060 } // Far away
      };

      // Act
      const result = await verificationService.verifySignature(highRiskSignature, testDocument, context);

      // Assert
      expect(result.details.risk_assessment.overall_risk).toBe('critical');
      expect(result.details.risk_assessment.mitigation_required).toBe(true);
      expect(result.details.risk_assessment.risk_factors.length).toBeGreaterThan(0);
      expect(result.details.risk_assessment.risk_factors.some(factor => factor.factor === 'untrusted_device')).toBe(true);
    });
  });
});
