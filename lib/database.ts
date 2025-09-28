
import { IDatabase } from './interfaces';
import { Signature, Document, AuditEvent } from './types';

export class InMemoryDatabase implements IDatabase {
  private signatures = new Map<string, Signature>();
  private documents = new Map<string, Document>();
  private auditEvents = new Map<string, AuditEvent[]>();

  async saveSignature(signature: Signature): Promise<Signature> {
    this.signatures.set(signature.id, signature);
    return Promise.resolve(signature);
  }

  async getSignature(id: string): Promise<Signature | undefined> {
    return Promise.resolve(this.signatures.get(id));
  }

  async saveDocument(_document: Document): Promise<Document> {
    this.documents.set(_document.id, _document);
    return Promise.resolve(_document);
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return Promise.resolve(this.documents.get(id));
  }

  async saveAuditEvent(event: AuditEvent): Promise<AuditEvent> {
    const events = this.auditEvents.get(event.resource_id) || [];
    events.push(event);
    this.auditEvents.set(event.resource_id, events);
    return Promise.resolve(event);
  }

  async getSignatureAuditTrail(signatureId: string): Promise<AuditEvent[]> {
    const events = this.auditEvents.get(signatureId) || [];
    return events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // Helper to clear data for tests
  clear() {
    this.signatures.clear();
    this.documents.clear();
    this.auditEvents.clear();
  }
}
