// BuffrSign Platform - Workflow Engine Service
// LangGraph-based workflow orchestration for signature workflows

import {
  WorkflowNode,
  WorkflowNodeType,
  WorkflowAction,
  WorkflowActionType,
  WorkflowCondition,
  WorkflowState,
  WorkflowStatus,
  WorkflowHistoryEntry,
  WorkflowError,
  ConditionOperator
} from '../ai-types';

// ============================================================================
// WORKFLOW ENGINE SERVICE
// ============================================================================

export class WorkflowEngine {
  private workflows: Map<string, WorkflowNode[]>;
  private activeWorkflows: Map<string, WorkflowState>;
  private workflowTemplates: Map<string, WorkflowTemplate>;

  constructor() {
    this.workflows = new Map();
    this.activeWorkflows = new Map();
    this.workflowTemplates = new Map();
    this.initializeWorkflowTemplates();
  }

  // ============================================================================
  // WORKFLOW TEMPLATES INITIALIZATION
  // ============================================================================

  private initializeWorkflowTemplates() {
    // Employment Contract Workflow
    this.workflowTemplates.set('employment_contract', {
      id: 'employment_contract',
      name: 'Employment Contract Workflow',
      description: 'Standard employment contract signing workflow',
      nodes: [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Workflow Start',
          description: 'Initialize employment contract workflow',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'active' },
            async: false
          },
          conditions: [],
          next_nodes: ['document_analysis']
        },
        {
          id: 'document_analysis',
          type: WorkflowNodeType.DOCUMENT_ANALYSIS,
          name: 'Document Analysis',
          description: 'AI-powered document analysis and compliance checking',
          action: {
            type: WorkflowActionType.ANALYZE_DOCUMENT,
            parameters: { analysis_types: ['compliance_check', 'risk_assessment'] },
            async: true
          },
          conditions: [],
          next_nodes: ['compliance_check']
        },
        {
          id: 'compliance_check',
          type: WorkflowNodeType.COMPLIANCE_CHECK,
          name: 'Compliance Validation',
          description: 'Validate ETA 2019 and Namibian Labour Act compliance',
          action: {
            type: WorkflowActionType.CHECK_COMPLIANCE,
            parameters: { standards: ['ETA_2019', 'Labour_Act'] },
            async: false
          },
          conditions: [
            {
              field: 'compliance_score',
              operator: ConditionOperator.GREATER_THAN_EQUALS,
              value: 0.7,
              logical_operator: 'and',
              description: 'Compliance score must be >= 70%'
            }
          ],
          next_nodes: ['signature_collection'],
          timeout_seconds: 300
        },
        {
          id: 'signature_collection',
          type: WorkflowNodeType.SIGNATURE_COLLECTION,
          name: 'Signature Collection',
          description: 'Collect signatures from employee and employer',
          action: {
            type: WorkflowActionType.COLLECT_SIGNATURE,
            parameters: {
              parties: ['employee', 'employer'],
              signature_order: 'sequential',
              reminder_frequency: 'daily'
            },
            async: true
          },
          conditions: [
            {
              field: 'all_signatures_collected',
              operator: ConditionOperator.EQUALS,
              value: true,
              description: 'All required signatures must be collected'
            }
          ],
          next_nodes: ['completion'],
          timeout_seconds: 604800 // 7 days
        },
        {
          id: 'completion',
          type: WorkflowNodeType.COMPLETION,
          name: 'Workflow Completion',
          description: 'All signatures collected successfully',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'completed' },
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ]
    });

    // Service Agreement Workflow
    this.workflowTemplates.set('service_agreement', {
      id: 'service_agreement',
      name: 'Service Agreement Workflow',
      description: 'Multi-party service agreement workflow with approval gates',
      nodes: [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Workflow Start',
          description: 'Initialize service agreement workflow',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'active' },
            async: false
          },
          conditions: [],
          next_nodes: ['document_analysis']
        },
        {
          id: 'document_analysis',
          type: WorkflowNodeType.DOCUMENT_ANALYSIS,
          name: 'Document Analysis',
          description: 'AI-powered analysis and risk assessment',
          action: {
            type: WorkflowActionType.ANALYZE_DOCUMENT,
            parameters: { analysis_types: ['compliance_check', 'risk_assessment', 'legal_review'] },
            async: true
          },
          conditions: [],
          next_nodes: ['legal_review']
        },
        {
          id: 'legal_review',
          type: WorkflowNodeType.HUMAN_REVIEW,
          name: 'Legal Review',
          description: 'Legal team review for complex agreements',
          action: {
            type: WorkflowActionType.WAIT_FOR_HUMAN,
            parameters: {
              reviewer_role: 'legal_team',
              review_type: 'agreement_terms',
              priority: 'high'
            },
            async: true
          },
          conditions: [
            {
              field: 'legal_approval',
              operator: ConditionOperator.EQUALS,
              value: true,
              description: 'Legal approval required'
            }
          ],
          next_nodes: ['compliance_check'],
          human_review_required: true,
          timeout_seconds: 86400 // 24 hours
        },
        {
          id: 'compliance_check',
          type: WorkflowNodeType.COMPLIANCE_CHECK,
          name: 'Compliance Validation',
          description: 'Validate ETA 2019 and consumer protection compliance',
          action: {
            type: WorkflowActionType.CHECK_COMPLIANCE,
            parameters: { standards: ['ETA_2019', 'Consumer_Protection'] },
            async: false
          },
          conditions: [
            {
              field: 'compliance_score',
              operator: ConditionOperator.GREATER_THAN_EQUALS,
              value: 0.8,
              description: 'Compliance score must be >= 80%'
            }
          ],
          next_nodes: ['approval_gate'],
          timeout_seconds: 300
        },
        {
          id: 'approval_gate',
          type: WorkflowNodeType.APPROVAL_GATE,
          name: 'Management Approval',
          description: 'Management approval for high-value agreements',
          action: {
            type: WorkflowActionType.WAIT_FOR_HUMAN,
            parameters: {
              reviewer_role: 'management',
              review_type: 'financial_approval',
              threshold: 10000
            },
            async: true
          },
          conditions: [
            {
              field: 'agreement_value',
              operator: ConditionOperator.GREATER_THAN,
              value: 10000,
              description: 'Agreements over $10,000 require management approval'
            }
          ],
          next_nodes: ['signature_collection'],
          human_review_required: true,
          timeout_seconds: 86400 // 24 hours
        },
        {
          id: 'signature_collection',
          type: WorkflowNodeType.SIGNATURE_COLLECTION,
          name: 'Signature Collection',
          description: 'Collect signatures from all parties',
          action: {
            type: WorkflowActionType.COLLECT_SIGNATURE,
            parameters: {
              parties: ['service_provider', 'client'],
              signature_order: 'parallel',
              reminder_frequency: 'daily'
            },
            async: true
          },
          conditions: [
            {
              field: 'all_signatures_collected',
              operator: ConditionOperator.EQUALS,
              value: true,
              description: 'All required signatures must be collected'
            }
          ],
          next_nodes: ['completion'],
          timeout_seconds: 604800 // 7 days
        },
        {
          id: 'completion',
          type: WorkflowNodeType.COMPLETION,
          name: 'Workflow Completion',
          description: 'Mark workflow as completed',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'completed' },
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ]
    });

    // NDA Agreement Workflow
    this.workflowTemplates.set('nda_agreement', {
      id: 'nda_agreement',
      name: 'NDA Agreement Workflow',
      description: 'Confidentiality agreement workflow with enhanced security',
      nodes: [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Workflow Start',
          description: 'Initialize NDA workflow',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'active' },
            async: false
          },
          conditions: [],
          next_nodes: ['security_check']
        },
        {
          id: 'security_check',
          type: WorkflowNodeType.COMPLIANCE_CHECK,
          name: 'Security Assessment',
          description: 'Security and confidentiality compliance check',
          action: {
            type: WorkflowActionType.CHECK_COMPLIANCE,
            parameters: { standards: ['ETA_2019', 'Confidentiality_Law', 'Data_Protection'] },
            async: false
          },
          conditions: [
            {
              field: 'security_score',
              operator: ConditionOperator.GREATER_THAN_EQUALS,
              value: 0.9,
              description: 'Security score must be >= 90%'
            }
          ],
          next_nodes: ['legal_review'],
          timeout_seconds: 300
        },
        {
          id: 'legal_review',
          type: WorkflowNodeType.HUMAN_REVIEW,
          name: 'Legal Review',
          description: 'Mandatory legal review for NDA agreements',
          action: {
            type: WorkflowActionType.WAIT_FOR_HUMAN,
            parameters: {
              reviewer_role: 'legal_team',
              review_type: 'nda_terms',
              priority: 'critical'
            },
            async: true
          },
          conditions: [
            {
              field: 'legal_approval',
              operator: ConditionOperator.EQUALS,
              value: true,
              description: 'Legal approval required'
            }
          ],
          next_nodes: ['signature_collection'],
          human_review_required: true,
          timeout_seconds: 86400 // 24 hours
        },
        {
          id: 'signature_collection',
          type: WorkflowNodeType.SIGNATURE_COLLECTION,
          name: 'Signature Collection',
          description: 'Collect signatures with enhanced verification',
          action: {
            type: WorkflowActionType.COLLECT_SIGNATURE,
            parameters: {
              parties: ['disclosing_party', 'receiving_party'],
              signature_order: 'sequential',
              verification_level: 'enhanced',
              reminder_frequency: 'daily'
            },
            async: true
          },
          conditions: [
            {
              field: 'all_signatures_collected',
              operator: ConditionOperator.EQUALS,
              value: true,
              description: 'All required signatures must be collected'
            }
          ],
          next_nodes: ['completion'],
          timeout_seconds: 604800 // 7 days
        },
        {
          id: 'completion',
          type: WorkflowNodeType.COMPLETION,
          name: 'Workflow Completion',
          description: 'Mark workflow as completed with security audit',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'completed' },
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ]
    });
  }

  // ============================================================================
  // WORKFLOW MANAGEMENT
  // ============================================================================

  async createWorkflow(
    templateId: string,
    documentId: string,
    parties: string[],
    metadata?: Record<string, unknown>
  ): Promise<string> {
    const template = this.workflowTemplates.get(templateId);
    if (!template) {
      throw new Error(`Workflow template '${templateId}' not found`);
    }

    const workflowId = this.generateWorkflowId();
    const workflowState: WorkflowState = {
      workflow_id: workflowId,
      current_node: 'start',
      status: WorkflowStatus.DRAFT,
      data: {
        document_id: documentId,
        parties,
        template_id: templateId,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      },
      history: [],
      errors: [],
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.activeWorkflows.set(workflowId, workflowState);
    this.workflows.set(workflowId, template.nodes);

    return workflowId;
  }

  async startWorkflow(workflowId: string): Promise<WorkflowState> {
    const workflowState = this.activeWorkflows.get(workflowId);
    if (!workflowState) {
      throw new Error(`Workflow '${workflowId}' not found`);
    }

    if (workflowState.status !== WorkflowStatus.DRAFT) {
      throw new Error(`Workflow '${workflowId}' cannot be started from status '${workflowState.status}'`);
    }

    // Update workflow status
    workflowState.status = WorkflowStatus.ACTIVE;
    workflowState.current_node = 'start';
    workflowState.updated_at = new Date().toISOString();

    // Execute start node
    await this.executeNode(workflowId, 'start');

    return workflowState;
  }

  async executeWorkflow(workflowId: string): Promise<WorkflowState> {
    const workflowState = this.activeWorkflows.get(workflowId);
    if (!workflowState) {
      throw new Error(`Workflow '${workflowId}' not found`);
    }

    if (workflowState.status !== WorkflowStatus.ACTIVE) {
      throw new Error(`Workflow '${workflowId}' is not active`);
    }

    const workflowNodes = this.workflows.get(workflowId);
    if (!workflowNodes) {
      throw new Error(`Workflow nodes not found for '${workflowId}'`);
    }

    let currentNode = workflowState.current_node;
    const maxIterations = 100; // Prevent infinite loops
    let iteration = 0;

    while (currentNode && iteration < maxIterations) {
      try {
        // Execute current node
        const result = await this.executeNode(workflowId, currentNode);

        // Add to history
        workflowState.history.push({
          timestamp: new Date().toISOString(),
          node_id: currentNode,
          action: 'executed',
          result,
          duration_ms: 0,
          status: 'success'
        });

        // Find next node based on conditions
        const nextNode = this.determineNextNode(workflowId, currentNode);

        if (!nextNode) {
          // Workflow completed
          workflowState.status = WorkflowStatus.COMPLETED;
          workflowState.completed_at = new Date().toISOString();
          break;
        }

        // Move to next node
        workflowState.current_node = nextNode;
        workflowState.updated_at = new Date().toISOString();
        currentNode = nextNode;
        iteration++;

      } catch (error) {
        // Handle node execution error
        await this.handleNodeError(workflowId, currentNode, error);
        break;
      }
    }

    if (iteration >= maxIterations) {
      workflowState.status = WorkflowStatus.FAILED;
      workflowState.errors.push({
        timestamp: new Date().toISOString(),
        node_id: currentNode,
        error_type: 'max_iterations_exceeded',
        message: 'Workflow exceeded maximum iterations',
        recoverable: false
      });
    }

    return workflowState;
  }

  // ============================================================================
  // NODE EXECUTION
  // ============================================================================

  private async executeNode(workflowId: string, nodeId: string): Promise<unknown> {
    const workflowState = this.activeWorkflows.get(workflowId);
    const workflowNodes = this.workflows.get(workflowId);

    if (!workflowState || !workflowNodes) {
      throw new Error(`Workflow or nodes not found for '${workflowId}'`);
    }

    const node = workflowNodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Node '${nodeId}' not found in workflow '${workflowId}'`);
    }

    const startTime = Date.now();
    let result: unknown;
    let status: 'success' | 'failure' | 'skipped' = 'success';

    try {
      // Check node conditions
      if (!this.evaluateConditions(node.conditions, workflowState.data)) {
        status = 'skipped';
        result = { reason: 'Conditions not met' };
      } else {
        // Execute node action
        result = await this.executeAction(node.action, workflowState.data);
      }

      // Record execution in history
      const historyEntry: WorkflowHistoryEntry = {
        timestamp: new Date().toISOString(),
        node_id: nodeId,
        action: node.action.type,
        result,
        duration_ms: Date.now() - startTime,
        status
      };

      workflowState.history.push(historyEntry);

      return result;

    } catch (error) {
      status = 'failure';
      result = { error: error instanceof Error ? error.message : String(error) };

      // Record error in history
      const historyEntry: WorkflowHistoryEntry = {
        timestamp: new Date().toISOString(),
        node_id: nodeId,
        action: node.action.type,
        result,
        duration_ms: Date.now() - startTime,
        status
      };

      workflowState.history.push(historyEntry);
      throw error;
    }
  }

  private async executeAction(action: WorkflowAction, data: Record<string, unknown>): Promise<unknown> {
    switch (action.type) {
      case WorkflowActionType.UPDATE_STATUS:
        return this.executeUpdateStatus(action.parameters, data);

      case WorkflowActionType.ANALYZE_DOCUMENT:
        return this.executeDocumentAnalysis(action.parameters, data);

      case WorkflowActionType.CHECK_COMPLIANCE:
        return this.executeComplianceCheck(action.parameters);

      case WorkflowActionType.COLLECT_SIGNATURE:
        return this.executeSignatureCollection(action.parameters);

      case WorkflowActionType.SEND_NOTIFICATION:
        return this.executeSendNotification(action.parameters);

      case WorkflowActionType.CREATE_AUDIT_LOG:
        return this.executeCreateAuditLog(action.parameters, data);

      case WorkflowActionType.WAIT_FOR_HUMAN:
        return this.executeWaitForHuman(action.parameters);

      case WorkflowActionType.TRIGGER_WEBHOOK:
        return this.executeTriggerWebhook(action.parameters);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // ============================================================================
  // ACTION EXECUTORS
  // ============================================================================

  private async executeUpdateStatus(parameters: Record<string, unknown>, data: Record<string, unknown>): Promise<unknown> {
    const { status } = parameters;
    data.status = status;
    return { status, updated: true };
  }

  private async executeDocumentAnalysis(parameters: Record<string, unknown>, data: Record<string, unknown>): Promise<unknown> {
    // This would integrate with the DocumentAnalyzer service
    const { analysis_types } = parameters;
    const documentId = data.document_id;

    // Mock analysis result - in production, call DocumentAnalyzer
    return {
      analysis_id: `analysis_${Date.now()}`,
      analysis_types,
      document_id: documentId,
      status: 'completed',
      results: {
        compliance_score: 0.85,
        risk_level: 'medium',
        document_type: 'employment_contract'
      }
    };
  }

  private async executeComplianceCheck(parameters: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { standards } = parameters;
    const standardsArray = Array.isArray(standards) ? standards as string[] : [];

    // Mock compliance check - in production, call compliance service
    return {
      compliance_id: `compliance_${Date.now()}`,
      standards: standardsArray,
      overall_score: 0.87,
      compliant: true,
      details: standardsArray.map((standard: string) => ({
        standard,
        score: 0.87,
        compliant: true,
        issues: []
      }))
    };
  }

  private async executeSignatureCollection(parameters: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { parties, signature_order, reminder_frequency } = parameters;
    const partiesArray = Array.isArray(parties) ? parties : [];

    // Mock signature collection - in production, create signature requests
    return {
      signature_request_id: `sig_${Date.now()}`,
      parties: partiesArray,
      signature_order,
      reminder_frequency,
      status: 'pending',
      signatures_needed: partiesArray.length,
      signatures_collected: 0
    };
  }

  private async executeSendNotification(parameters: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { recipients, message, type } = parameters;

    // Mock notification - in production, send actual notifications
    return {
      notification_id: `notif_${Date.now()}`,
      recipients,
      message,
      type,
      status: 'sent',
      sent_at: new Date().toISOString()
    };
  }

  private async executeCreateAuditLog(parameters: Record<string, unknown>, data: Record<string, unknown>): Promise<unknown> {
    const { event_type, details } = parameters;

    // Mock audit log - in production, create actual audit entries
    return {
      audit_id: `audit_${Date.now()}`,
      event_type,
      details,
      timestamp: new Date().toISOString(),
      user_id: data.user_id || 'system'
    };
  }

  private async executeWaitForHuman(parameters: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { reviewer_role, review_type, priority } = parameters;

    // Mock human review request - in production, create review tasks
    return {
      review_id: `review_${Date.now()}`,
      reviewer_role,
      review_type,
      priority,
      status: 'pending',
      created_at: new Date().toISOString(),
      timeout_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
  }

  private async executeTriggerWebhook(parameters: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { url, method, payload } = parameters;

    // Mock webhook - in production, make actual HTTP requests
    return {
      webhook_id: `webhook_${Date.now()}`,
      url,
      method,
      payload,
      status: 'triggered',
      triggered_at: new Date().toISOString()
    };
  }

  // ============================================================================
  // WORKFLOW LOGIC
  // ============================================================================

  private determineNextNode(workflowId: string, currentNodeId: string): string | null {
    const workflowNodes = this.workflows.get(workflowId);
    if (!workflowNodes) return null;

    const currentNode = workflowNodes.find(n => n.id === currentNodeId);
    if (!currentNode) return null;

    // If no next nodes, workflow is complete
    if (currentNode.next_nodes.length === 0) {
      return null;
    }

    // For now, return the first next node
    // In production, this would evaluate conditions and routing logic
    return currentNode.next_nodes[0];
  }

  private evaluateConditions(conditions: WorkflowCondition[], data: Record<string, unknown>): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let logicalOperator = 'and';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, data);

      if (logicalOperator === 'and') {
        result = result && conditionResult;
      } else if (logicalOperator === 'or') {
        result = result || conditionResult;
      }

      logicalOperator = condition.logical_operator || 'and';
    }

    return result;
  }

  private evaluateCondition(condition: WorkflowCondition, data: Record<string, unknown>): boolean {
    const fieldValue = this.getFieldValue(condition.field, data);

    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return fieldValue === condition.value;

      case ConditionOperator.NOT_EQUALS:
        return fieldValue !== condition.value;

      case ConditionOperator.CONTAINS:
        return String(fieldValue).includes(String(condition.value));

      case ConditionOperator.GREATER_THAN:
        return Number(fieldValue) > Number(condition.value);

      case ConditionOperator.LESS_THAN:
        return Number(fieldValue) < Number(condition.value);

      case ConditionOperator.GREATER_THAN_EQUALS:
        return Number(fieldValue) >= Number(condition.value);

      case ConditionOperator.LESS_THAN_EQUALS:
        return Number(fieldValue) <= Number(condition.value);

      case ConditionOperator.IN:
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);

      case ConditionOperator.NOT_IN:
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);

      case ConditionOperator.EXISTS:
        return fieldValue !== undefined && fieldValue !== null;

      case ConditionOperator.NOT_EXISTS:
        return fieldValue === undefined || fieldValue === null;

      default:
        return false;
    }
  }

  private getFieldValue(field: string, data: Record<string, unknown>): unknown {
    const fieldParts = field.split('.');
    let value: unknown = data;

    for (const part of fieldParts) {
      if (value && typeof value === 'object' && part in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  private async handleNodeError(workflowId: string, nodeId: string, error: unknown): Promise<void> {
    const workflowState = this.activeWorkflows.get(workflowId);
    if (!workflowState) return;

    const errorObj = error instanceof Error ? error : new Error(String(error));
    const workflowError: WorkflowError = {
      timestamp: new Date().toISOString(),
      node_id: nodeId,
      error_type: errorObj.name || 'UnknownError',
      message: errorObj.message || 'Unknown error occurred',
      stack_trace: errorObj.stack,
      recoverable: this.isErrorRecoverable(errorObj)
    };

    workflowState.errors.push(workflowError);

    if (!workflowError.recoverable) {
      workflowState.status = WorkflowStatus.FAILED;
    } else {
      workflowState.status = WorkflowStatus.PAUSED;
    }

    workflowState.updated_at = new Date().toISOString();
  }

  private isErrorRecoverable(error: Error): boolean {
    // Determine if error is recoverable based on error type
    const recoverableErrors = [
      'TimeoutError',
      'NetworkError',
      'TemporaryError',
      'ValidationError'
    ];

    return recoverableErrors.includes(error.name || '');
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateWorkflowId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getWorkflowState(workflowId: string): Promise<WorkflowState | null> {
    return this.activeWorkflows.get(workflowId) || null;
  }

  async getWorkflowHistory(workflowId: string): Promise<WorkflowHistoryEntry[]> {
    const workflowState = this.activeWorkflows.get(workflowId);
    return workflowState ? workflowState.history : [];
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    const workflowState = this.activeWorkflows.get(workflowId);
    if (workflowState && workflowState.status === WorkflowStatus.ACTIVE) {
      workflowState.status = WorkflowStatus.PAUSED;
      workflowState.updated_at = new Date().toISOString();
    }
  }

  async resumeWorkflow(workflowId: string): Promise<void> {
    const workflowState = this.activeWorkflows.get(workflowId);
    if (workflowState && workflowState.status === WorkflowStatus.PAUSED) {
      workflowState.status = WorkflowStatus.ACTIVE;
      workflowState.updated_at = new Date().toISOString();
    }
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflowState = this.activeWorkflows.get(workflowId);
    if (workflowState) {
      workflowState.status = WorkflowStatus.CANCELLED;
      workflowState.updated_at = new Date().toISOString();
    }
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.workflowTemplates.keys());
  }

  getTemplateDetails(templateId: string): WorkflowTemplate | null {
    return this.workflowTemplates.get(templateId) || null;
  }

  // ============================================================================
  // ADDITIONAL METHODS FOR TESTING AND DIRECT WORKFLOW CREATION
  // ============================================================================

  createWorkflowFromNodes(nodes: WorkflowNode[], startNodeId: string): string {
    // Validate that start node exists
    const startNode = nodes.find(n => n.id === startNodeId);
    if (!startNode) {
      throw new Error('Starting node not found');
    }

    // Generate workflow ID
    const workflowId = this.generateWorkflowId();

    // Store workflow nodes
    this.workflows.set(workflowId, nodes);

    // Create initial workflow state
    const workflowState: WorkflowState = {
      workflow_id: workflowId,
      current_node: startNodeId,
      status: WorkflowStatus.DRAFT,
      data: {},
      history: [],
      errors: [],
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store workflow state
    this.activeWorkflows.set(workflowId, workflowState);

    return workflowId;
  }

  getWorkflowStatus(workflowId: string): WorkflowState | null {
    return this.activeWorkflows.get(workflowId) || null;
  }

  validateWorkflow(nodes: WorkflowNode[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const nodeIds = new Set<string>();

    // Check for duplicate node IDs
    for (const node of nodes) {
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node ID: ${node.id}`);
      } else {
        nodeIds.add(node.id);
      }
    }

    // Check for invalid node references
    for (const node of nodes) {
      for (const nextNodeId of node.next_nodes) {
        if (!nodeIds.has(nextNodeId)) {
          errors.push(`Node ${node.id} references non-existent node: ${nextNodeId}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// ============================================================================
// WORKFLOW TEMPLATE INTERFACE
// ============================================================================

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
}

// ============================================================================
// EXPORTS
// ============================================================================

export default WorkflowEngine;
export type { WorkflowTemplate };
