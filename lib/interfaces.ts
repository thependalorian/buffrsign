
import { Signature, Document, AuditEvent } from './types';

export interface IDatabase {
  saveSignature(signature: Signature): Promise<Signature>;
  getSignature(id: string): Promise<Signature | undefined>;
  saveDocument(_document: Document): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  saveAuditEvent(event: AuditEvent): Promise<AuditEvent>;
  getSignatureAuditTrail(signatureId: string): Promise<AuditEvent[]>;
}

export interface ICrypto {
  generateKeyPair(): Promise<{ publicKey: string; privateKey: string }>;
  sign(data: string, privateKey: string): Promise<string>;
  verify(data: string, signature: string, publicKey: string): Promise<boolean>;
  hash(data: string): Promise<string>;
  generateRandomBytes(size: number): Promise<string>;
}
