// BuffrSign Platform - AI Workflow Orchestrator
// LangGraph-inspired workflow orchestration with TypeScript
// Based on LlamaIndex and Pydantic AI principles

'use client';


// ============================================================================
// WORKFLOW STATE MANAGEMENT
// ============================================================================

export interface WorkflowState {
  id: string;
  status: WorkflowStatus;
  currentStep: string;
  data: Record<string, unknown>;
  history: WorkflowStep[];
  errors: WorkflowError[];
  metadata: WorkflowMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum WorkflowStatus {
  INITIALIZED = 'initialized',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  status: StepStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  retryCount: number;
  maxRetries: number;
}

export enum WorkflowStepType {
  DOCUMENT_ANALYSIS = 'document_analysis',
  AI_EXTRACTION = 'ai_extraction',
  COMPLIANCE_CHECK = 'compliance_check',
  SIGNATURE_PLACEMENT = 'signature_placement',
  KYC_VERIFICATION = 'kyc_verification',
  NOTIFICATION = 'notification',
  HUMAN_REVIEW = 'human_review'
}

export enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

export interface WorkflowError {
  id: string;
  stepId: string;
  message: string;
  code: string;
  severity: ErrorSeverity;
  timestamp: Date;
  resolved: boolean;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface WorkflowMetadata {
  documentId: string;
  userId: string;
  documentType: string;
  priority: WorkflowPriority;
  estimatedDuration: number;
  actualDuration?: number;
  aiModels: string[];
  complianceRequirements: string[];
}

export enum WorkflowPriority {
  LOW = 'low',
  NORMAL = 'normal',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// ============================================================================
// WORKFLOW NODES
// ============================================================================

export interface WorkflowNode {
  id: string;
  name: string;
  type: WorkflowStepType;
  config: NodeConfig;
  dependencies: string[];
  conditions: NodeCondition[];
  retryPolicy: RetryPolicy;
  timeout: number;
}

export interface NodeConfig {
  aiModel?: string;
  parameters: Record<string, unknown>;
  validationRules: ValidationRule[];
  outputSchema: Record<string, unknown>;
}

export interface NodeCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  action: ConditionAction;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  EXISTS = 'exists',
  REGEX = 'regex'
}

export enum ConditionAction {
  CONTINUE = 'continue',
  SKIP = 'skip',
  FAIL = 'fail',
  RETRY = 'retry'
}

export interface ValidationRule {
  field: string;
  type: ValidationType;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: string;
}

export enum ValidationType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  EMAIL = 'email',
  URL = 'url',
  DATE = 'date'
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors: string[];
}

export enum BackoffStrategy {
  FIXED = 'fixed',
  EXPONENTIAL = 'exponential',
  LINEAR = 'linear'
}

// ============================================================================
// WORKFLOW ORCHESTRATOR
// ============================================================================

export class WorkflowOrchestrator {
  private workflows: Map<string, WorkflowState> = new Map();
  private nodes: Map<string, WorkflowNode> = new Map();
  private eventListeners: Map<string, WorkflowEventListener[]> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.initializeDefaultNodes();
  }

  // ============================================================================
  // WORKFLOW CREATION AND MANAGEMENT
  // ============================================================================

  createWorkflow(workflowData: {
    name: string;
    description: string;
    steps: Array<{
      id: string;
      type: WorkflowStepType;
      name: string;
      config: Record<string, unknown>;
    }>;
  }): string {
    // Validate workflow data
    if (!workflowData.name || workflowData.name.trim() === '') {
      throw new Error('Workflow name is required');
    }
    
    if (!workflowData.steps || workflowData.steps.length === 0) {
      throw new Error('Workflow must have at least one step');
    }

    // Validate each step
    for (const step of workflowData.steps) {
      const validation = this.validateWorkflowStep(step);
      if (!validation.isValid) {
        throw new Error(`Invalid step: ${validation.errors.join(', ')}`);
      }
    }

    const workflowId = this.generateWorkflowId();
    
    const workflow: WorkflowState = {
      id: workflowId,
      status: WorkflowStatus.INITIALIZED,
      currentStep: workflowData.steps[0]?.id || '',
      data: {
        name: workflowData.name,
        description: workflowData.description,
      },
      history: [],
      errors: [],
      metadata: {
        documentId: '',
        userId: '',
        documentType: 'unknown',
        priority: WorkflowPriority.MEDIUM,
        estimatedDuration: 300000, // 5 minutes
        aiModels: [process.env.LLM_CHOICE || 'gpt-4.1-mini'],
        complianceRequirements: ['eta_2019']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Register workflow steps as nodes
    for (const step of workflowData.steps) {
      const node: WorkflowNode = {
        id: step.id,
        name: step.name,
        type: step.type,
        config: {
          parameters: step.config || {},
          validationRules: [],
          outputSchema: {}
        },
        dependencies: [],
        conditions: [],
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: BackoffStrategy.EXPONENTIAL,
          retryableErrors: []
        },
        timeout: 30000
      };
      this.nodes.set(step.id, node);
    }

    this.workflows.set(workflowId, workflow);
    return workflowId;
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // ============================================================================
  // WORKFLOW MANAGEMENT
  // ============================================================================

  async createDocumentWorkflow(
    documentId: string,
    userId: string,
    documentType: string,
    priority: WorkflowPriority = WorkflowPriority.NORMAL
  ): Promise<WorkflowState> {
    const workflowId = this.generateWorkflowId();
    
    const workflow: WorkflowState = {
      id: workflowId,
      status: WorkflowStatus.INITIALIZED,
      currentStep: 'start',
      data: {
        documentId,
        userId,
        documentType,
        priority
      },
      history: [],
      errors: [],
      metadata: {
        documentId,
        userId,
        documentType,
        priority,
        estimatedDuration: this.calculateEstimatedDuration(documentType),
        aiModels: this.getRequiredAIModels(documentType),
        complianceRequirements: this.getComplianceRequirements(documentType)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(workflowId, workflow);
    this.emitEvent('workflow:created', workflow);
    
    return workflow;
  }

  async startWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status !== WorkflowStatus.INITIALIZED) {
      throw new Error(`Workflow ${workflowId} is not in initialized state`);
    }

    workflow.status = WorkflowStatus.RUNNING;
    workflow.updatedAt = new Date();
    
    // Add a step to history
    const step: WorkflowStep = {
      id: 'start',
      name: 'Workflow Started',
      type: WorkflowStepType.DOCUMENT_ANALYSIS,
      status: StepStatus.COMPLETED,
      input: {},
      output: { started: true },
      startedAt: new Date(),
      completedAt: new Date(),
      duration: 0,
      retryCount: 0,
      maxRetries: 0
    };
    workflow.history.push(step);
    
    this.emitEvent('workflow:started', workflow);
    
    // For testing, don't auto-execute the workflow
    // this.executeWorkflow(workflowId);
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status !== WorkflowStatus.RUNNING) {
      throw new Error(`Workflow ${workflowId} is not running`);
    }

    workflow.status = WorkflowStatus.PAUSED;
    workflow.updatedAt = new Date();
    
    this.emitEvent('workflow:paused', workflow);
  }

  async resumeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status !== WorkflowStatus.PAUSED) {
      throw new Error(`Workflow ${workflowId} is not paused`);
    }

    workflow.status = WorkflowStatus.RUNNING;
    workflow.updatedAt = new Date();
    
    this.emitEvent('workflow:resumed', workflow);
    
    // Resume the workflow execution
    this.executeWorkflow(workflowId);
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = WorkflowStatus.CANCELLED;
    workflow.updatedAt = new Date();
    
    this.emitEvent('workflow:cancelled', workflow);
  }

  // ============================================================================
  // WORKFLOW EXECUTION
  // ============================================================================

  private async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    try {
      while (workflow.status === WorkflowStatus.RUNNING) {
        const nextStep = this.getNextStep(workflow);
        if (!nextStep) {
          // Workflow completed
          workflow.status = WorkflowStatus.COMPLETED;
          workflow.updatedAt = new Date();
          this.emitEvent('workflow:completed', workflow);
          break;
        }

        await this.executeStep(workflow, nextStep);
      }
    } catch (error) {
      workflow.status = WorkflowStatus.FAILED;
      workflow.updatedAt = new Date();
      
      const workflowError: WorkflowError = {
        id: this.generateErrorId(),
        stepId: workflow.currentStep,
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'WORKFLOW_EXECUTION_ERROR',
        severity: ErrorSeverity.HIGH,
        timestamp: new Date(),
        resolved: false
      };
      
      workflow.errors.push(workflowError);
      this.emitEvent('workflow:failed', workflow);
    }
  }

  private async executeStep(workflow: WorkflowState, stepId: string): Promise<void> {
    const node = this.nodes.get(stepId);
    if (!node) {
      throw new Error(`Node ${stepId} not found`);
    }

    const step: WorkflowStep = {
      id: this.generateStepId(),
      name: node.name,
      type: node.type,
      status: StepStatus.RUNNING,
      input: { ...workflow.data },
      output: {},
      startedAt: new Date(),
      retryCount: 0,
      maxRetries: node.retryPolicy.maxRetries
    };

    workflow.history.push(step);
    workflow.currentStep = stepId;
    workflow.updatedAt = new Date();

    this.emitEvent('step:started', { workflow, step });

    try {
      // Check conditions
      if (!this.evaluateConditions(workflow, node.conditions)) {
        step.status = StepStatus.SKIPPED;
        step.completedAt = new Date();
        step.duration = step.completedAt.getTime() - step.startedAt.getTime();
        this.emitEvent('step:skipped', { workflow, step });
        return;
      }

      // Execute the step
      const output = await this.executeNode(workflow, node);
      
      // Validate output
      this.validateOutput(output, node.config.outputSchema);
      
      step.output = output;
      step.status = StepStatus.COMPLETED;
      step.completedAt = new Date();
      step.duration = step.completedAt.getTime() - step.startedAt.getTime();
      
      // Update workflow data
      workflow.data = { ...workflow.data, ...output };
      workflow.updatedAt = new Date();

      this.emitEvent('step:completed', { workflow, step });
    } catch (error) {
      step.status = StepStatus.FAILED;
      step.completedAt = new Date();
      step.duration = step.completedAt.getTime() - step.startedAt.getTime();
      
      const stepError: WorkflowError = {
        id: this.generateErrorId(),
        stepId: step.id,
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'STEP_EXECUTION_ERROR',
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
        resolved: false
      };
      
      workflow.errors.push(stepError);
      this.emitEvent('step:failed', { workflow, step, error: stepError });

      // Handle retry logic
      if (step.retryCount < step.maxRetries) {
        step.retryCount++;
        step.status = StepStatus.PENDING;
        this.emitEvent('step:retry', { workflow, step });
        
        // Wait before retry
        await this.delay(this.calculateRetryDelay(step.retryCount, node.retryPolicy.backoffStrategy));
        await this.executeStep(workflow, stepId);
      } else {
        throw error;
      }
    }
  }

  // ============================================================================
  // NODE EXECUTION
  // ============================================================================

  private async executeNode(workflow: WorkflowState, node: WorkflowNode): Promise<Record<string, unknown>> {
    switch (node.type) {
      case WorkflowStepType.DOCUMENT_ANALYSIS:
        return await this.executeDocumentAnalysis(workflow);
      case WorkflowStepType.AI_EXTRACTION:
        return await this.executeAIExtraction(workflow);
      case WorkflowStepType.COMPLIANCE_CHECK:
        return await this.executeComplianceCheck(workflow);
      case WorkflowStepType.SIGNATURE_PLACEMENT:
        return await this.executeSignaturePlacement(workflow);
      case WorkflowStepType.KYC_VERIFICATION:
        return await this.executeKYCVerification(workflow);
      case WorkflowStepType.NOTIFICATION:
        return await this.executeNotification(workflow);
      case WorkflowStepType.HUMAN_REVIEW:
        return await this.executeHumanReview(workflow);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private async executeDocumentAnalysis(workflow: WorkflowState): Promise<Record<string, unknown>> {
    // Simulate _document analysis
    await this.delay(1000);
    
    return {
      documentSummary: 'AI-generated _document summary',
      keyClauses: [
        { type: 'payment', content: 'Payment terms clause', confidence: 0.95 },
        { type: 'liability', content: 'Liability limitation clause', confidence: 0.88 }
      ],
      documentType: workflow.data.documentType,
      confidence: 0.92
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async executeAIExtraction(workflow: WorkflowState): Promise<Record<string, unknown>> {
    // Simulate AI extraction
    await this.delay(1500);
    
    return {
      extractedFields: {
        parties: ['John Doe', 'ABC Corp'],
        dates: ['2024-01-15', '2024-12-31'],
        amounts: ['$10,000', '$500/month']
      },
      signatureFields: [
        { x: 100, y: 200, width: 150, height: 50, page: 1, required: true },
        { x: 300, y: 400, width: 150, height: 50, page: 2, required: true }
      ],
      confidence: 0.89
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async executeComplianceCheck(workflow: WorkflowState): Promise<Record<string, unknown>> {
    // Simulate compliance check
    await this.delay(800);
    
    return {
      etaCompliance: {
        section17: 'compliant',
        section20: 'compliant',
        section21: 'needs_review',
        chapter4: 'compliant'
      },
      cranCompliance: {
        accredited: true,
        requirements: ['data_protection', 'audit_trail']
      },
      complianceScore: 85,
      recommendations: ['Review section 21 requirements']
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async executeSignaturePlacement(workflow: WorkflowState): Promise<Record<string, unknown>> {
    // Simulate signature placement
    await this.delay(600);
    
    return {
      signatureFields: [
        { id: 'sig1', x: 100, y: 200, width: 150, height: 50, page: 1, type: 'electronic' },
        { id: 'sig2', x: 300, y: 400, width: 150, height: 50, page: 2, type: 'electronic' }
      ],
      placementConfidence: 0.94
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async executeKYCVerification(workflow: WorkflowState): Promise<Record<string, unknown>> {
    // Simulate KYC verification
    await this.delay(2000);
    
    return {
      kycStatus: 'verified',
      verificationLevel: 'enhanced',
      riskScore: 0.15,
      complianceChecks: ['identity_verified', 'address_verified', 'sanctions_check']
    };
  }

  private async executeNotification(workflow: WorkflowState): Promise<Record<string, unknown>> {
    // Simulate notification
    await this.delay(300);
    
    return {
      notificationsSent: ['email', 'sms'],
      recipients: [workflow.data.userId],
      message: 'Document processing completed'
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async executeHumanReview(workflow: WorkflowState): Promise<Record<string, unknown>> {
    // Simulate human review
    await this.delay(500);
    
    return {
      reviewStatus: 'approved',
      reviewerId: 'reviewer_001',
      comments: 'Document approved for processing',
      reviewTimestamp: new Date()
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getNextStep(workflow: WorkflowState): string | null {
    const allNodes = Array.from(this.nodes.keys());
    const currentIndex = allNodes.indexOf(workflow.currentStep);
    
    if (currentIndex < allNodes.length - 1) {
      return allNodes[currentIndex + 1];
    }
    
    return null;
  }

  private evaluateConditions(workflow: WorkflowState, conditions: NodeCondition[]): boolean {
    return conditions.every(condition => {
      const value = this.getNestedValue(workflow.data, condition.field);
      
      switch (condition.operator) {
        case ConditionOperator.EQUALS:
          return value === condition.value;
        case ConditionOperator.NOT_EQUALS:
          return value !== condition.value;
        case ConditionOperator.GREATER_THAN:
          return typeof value === 'number' && typeof condition.value === 'number' ? value > condition.value : false;
        case ConditionOperator.LESS_THAN:
          return typeof value === 'number' && typeof condition.value === 'number' ? value < condition.value : false;
        case ConditionOperator.CONTAINS:
          return String(value).includes(String(condition.value));
        case ConditionOperator.EXISTS:
          return value !== undefined && value !== null;
        case ConditionOperator.REGEX:
          return new RegExp(String(condition.value)).test(String(value));
        default:
          return true;
      }
    });
  }

  private validateOutput(output: Record<string, unknown>, schema: Record<string, unknown>): void {
    // Simple validation - in production, use a proper schema validation library
    for (const [key, rules] of Object.entries(schema)) {
      const rulesObj = rules as Record<string, unknown>;
      if (rulesObj.required && !(key in output)) {
        throw new Error(`Required field ${key} is missing`);
      }
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      const currentObj = current as Record<string, unknown>;
      return currentObj?.[key];
    }, obj as unknown);
  }

  private calculateRetryDelay(retryCount: number, strategy: BackoffStrategy): number {
    const baseDelay = 1000; // 1 second
    
    switch (strategy) {
      case BackoffStrategy.FIXED:
        return baseDelay;
      case BackoffStrategy.EXPONENTIAL:
        return baseDelay * Math.pow(2, retryCount);
      case BackoffStrategy.LINEAR:
        return baseDelay * retryCount;
      default:
        return baseDelay;
    }
  }

  private calculateEstimatedDuration(documentType: string): number {
    const durations: Record<string, number> = {
      'contract': 300000, // 5 minutes
      'agreement': 240000, // 4 minutes
      'invoice': 120000, // 2 minutes
      'identity': 180000, // 3 minutes
      'other': 200000 // 3.3 minutes
    };
    
    return durations[documentType] || durations['other'];
  }

  private getRequiredAIModels(documentType: string): string[] {
    const models: Record<string, string[]> = {
      'contract': ['gpt4_vision', 'pydantic_ai_agent'],
      'agreement': ['gpt4_vision', 'pydantic_ai_agent'],
      'invoice': ['gpt4_vision'],
      'identity': ['gpt4_vision', 'ai_agent_manager'],
      'other': ['gpt4_vision']
    };
    
    return models[documentType] || models['other'];
  }

  private getComplianceRequirements(documentType: string): string[] {
    const requirements: Record<string, string[]> = {
      'contract': ['eta_2019', 'cran_accreditation'],
      'agreement': ['eta_2019', 'cran_accreditation'],
      'invoice': ['eta_2019'],
      'identity': ['kyc_requirements', 'data_protection'],
      'other': ['eta_2019']
    };
    
    return requirements[documentType] || requirements['other'];
  }

  private initializeDefaultNodes(): void {
    // Initialize default workflow nodes
    const nodes: WorkflowNode[] = [
      {
        id: 'start',
        name: 'Workflow Start',
        type: WorkflowStepType.DOCUMENT_ANALYSIS,
        config: {
          parameters: {},
          validationRules: [],
          outputSchema: {}
        },
        dependencies: [],
        conditions: [],
        retryPolicy: { maxRetries: 3, backoffStrategy: BackoffStrategy.EXPONENTIAL, retryableErrors: [] },
        timeout: 30000
      },
      {
        id: 'ai_extraction',
        name: 'AI Field Extraction',
        type: WorkflowStepType.AI_EXTRACTION,
        config: {
          aiModel: 'gpt4_vision',
          parameters: { confidence_threshold: 0.8 },
          validationRules: [],
          outputSchema: {}
        },
        dependencies: ['start'],
        conditions: [],
        retryPolicy: { maxRetries: 2, backoffStrategy: BackoffStrategy.EXPONENTIAL, retryableErrors: [] },
        timeout: 60000
      },
      {
        id: 'compliance_check',
        name: 'Compliance Verification',
        type: WorkflowStepType.COMPLIANCE_CHECK,
        config: {
          parameters: { strict_mode: true },
          validationRules: [],
          outputSchema: {}
        },
        dependencies: ['ai_extraction'],
        conditions: [],
        retryPolicy: { maxRetries: 1, backoffStrategy: BackoffStrategy.FIXED, retryableErrors: [] },
        timeout: 45000
      },
      {
        id: 'signature_placement',
        name: 'Signature Field Placement',
        type: WorkflowStepType.SIGNATURE_PLACEMENT,
        config: {
          parameters: { auto_placement: true },
          validationRules: [],
          outputSchema: {}
        },
        dependencies: ['compliance_check'],
        conditions: [],
        retryPolicy: { maxRetries: 2, backoffStrategy: BackoffStrategy.LINEAR, retryableErrors: [] },
        timeout: 30000
      },
      {
        id: 'notification',
        name: 'Send Notifications',
        type: WorkflowStepType.NOTIFICATION,
        config: {
          parameters: { channels: ['email', 'sms'] },
          validationRules: [],
          outputSchema: {}
        },
        dependencies: ['signature_placement'],
        conditions: [],
        retryPolicy: { maxRetries: 3, backoffStrategy: BackoffStrategy.EXPONENTIAL, retryableErrors: [] },
        timeout: 15000
      }
    ];

    nodes.forEach(node => {
      this.nodes.set(node.id, node);
    });
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  private emitEvent(eventType: string, data: unknown): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    });
  }

  addEventListener(eventType: string, listener: WorkflowEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }

  removeEventListener(eventType: string, listener: WorkflowEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const _index = listeners.indexOf(listener);
    if (_index > -1) {
      listeners.splice(_index, 1);
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================


  private generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getWorkflow(workflowId: string): WorkflowState | undefined {
    return this.workflows.get(workflowId);
  }

  getAllWorkflows(): WorkflowState[] {
    return Array.from(this.workflows.values());
  }

  getActiveWorkflows(): WorkflowState[] {
    return Array.from(this.workflows.values()).filter(
      workflow => workflow.status === WorkflowStatus.RUNNING
    );
  }

  getWorkflowHistory(workflowId: string): WorkflowStep[] {
    const workflow = this.workflows.get(workflowId);
    return workflow ? workflow.history : [];
  }

  getWorkflowErrors(workflowId: string): WorkflowError[] {
    const workflow = this.workflows.get(workflowId);
    return workflow ? workflow.errors : [];
  }

  validateWorkflowStep(step: {
    id: string;
    type: WorkflowStepType;
    name: string;
    config: Record<string, unknown>;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate step ID
    if (!step.id || step.id.trim() === '') {
      errors.push('Step ID is required');
    }

    // Validate step name
    if (!step.name || step.name.trim() === '') {
      errors.push('Step name is required');
    }

    // Validate step type
    if (!Object.values(WorkflowStepType).includes(step.type)) {
      errors.push('Invalid step type');
    }

    // Validate config
    if (!step.config || typeof step.config !== 'object') {
      errors.push('Step config must be an object');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// ============================================================================
// TYPES
// ============================================================================

export type WorkflowEventListener = (data: unknown) => void;

// ============================================================================
// EXPORTS
// ============================================================================

export const workflowOrchestrator = new WorkflowOrchestrator();
export default workflowOrchestrator;
