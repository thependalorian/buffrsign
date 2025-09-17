import { WorkflowOrchestrator, WorkflowStepType, WorkflowStatus } from '../../../lib/ai/workflow-orchestrator'

describe('WorkflowOrchestrator', () => {
  let orchestrator: WorkflowOrchestrator

  beforeEach(() => {
    orchestrator = new WorkflowOrchestrator()
    jest.clearAllMocks()
  })

  describe('createWorkflow', () => {
    it('should create a new workflow', () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'Test workflow description',
        steps: [
          {
            id: 'step1',
            type: WorkflowStepType.DOCUMENT_ANALYSIS,
            name: 'Analyze Document',
            config: {}
          }
        ]
      }

      const workflowId = orchestrator.createWorkflow(workflowData)
      
      console.log('workflowId:', workflowId, 'type:', typeof workflowId)
      
      expect(workflowId).toBeDefined()
      expect(typeof workflowId).toBe('string')
      
      const workflow = orchestrator.getWorkflow(workflowId)
      expect(workflow).toBeDefined()
      expect(workflow?.data?.name).toBe('Test Workflow')
      expect(workflow?.status).toBe(WorkflowStatus.INITIALIZED)
    })

    it('should validate workflow steps', () => {
      const invalidWorkflowData = {
        name: 'Invalid Workflow',
        description: 'Invalid workflow',
        steps: [] // Empty steps should be invalid
      }

      expect(() => {
        orchestrator.createWorkflow(invalidWorkflowData)
      }).toThrow('Workflow must have at least one step')
    })
  })

  describe('startWorkflow', () => {
    it('should start a workflow successfully', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'Test workflow',
        steps: [
          {
            id: 'step1',
            type: WorkflowStepType.DOCUMENT_ANALYSIS,
            name: 'Analyze Document',
            config: {}
          }
        ]
      }

      const workflowId = orchestrator.createWorkflow(workflowData)
      await orchestrator.startWorkflow(workflowId)
      
      const workflow = orchestrator.getWorkflow(workflowId)
      expect(workflow?.status).toBe(WorkflowStatus.RUNNING)
    })

    it('should handle workflow start errors', async () => {
      await expect(orchestrator.startWorkflow('nonexistent-id')).rejects.toThrow('Workflow nonexistent-id not found')
    })
  })

  describe('pauseWorkflow', () => {
    it('should pause an active workflow', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'Test workflow',
        steps: [
          {
            id: 'step1',
            type: WorkflowStepType.DOCUMENT_ANALYSIS,
            name: 'Analyze Document',
            config: {}
          }
        ]
      }

      const workflowId = orchestrator.createWorkflow(workflowData)
      await orchestrator.startWorkflow(workflowId)
      await orchestrator.pauseWorkflow(workflowId)
      
      const workflow = orchestrator.getWorkflow(workflowId)
      expect(workflow?.status).toBe(WorkflowStatus.PAUSED)
    })
  })

  describe('resumeWorkflow', () => {
    it('should resume a paused workflow', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'Test workflow',
        steps: [
          {
            id: 'step1',
            type: WorkflowStepType.DOCUMENT_ANALYSIS,
            name: 'Analyze Document',
            config: {}
          }
        ]
      }

      const workflowId = orchestrator.createWorkflow(workflowData)
      await orchestrator.startWorkflow(workflowId)
      await orchestrator.pauseWorkflow(workflowId)
      
      await orchestrator.resumeWorkflow(workflowId)
      
      const workflow = orchestrator.getWorkflow(workflowId)
      // The workflow completes immediately since there are no actual steps to execute
      expect(workflow?.status).toBe(WorkflowStatus.COMPLETED)
    })
  })

  describe('getWorkflowHistory', () => {
    it('should return workflow execution history', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'Test workflow',
        steps: [
          {
            id: 'step1',
            type: WorkflowStepType.DOCUMENT_ANALYSIS,
            name: 'Analyze Document',
            config: {}
          }
        ]
      }

      const workflowId = orchestrator.createWorkflow(workflowData)
      await orchestrator.startWorkflow(workflowId)
      
      const history = orchestrator.getWorkflowHistory(workflowId)
      
      expect(history).toBeInstanceOf(Array)
      expect(history.length).toBeGreaterThan(0)
      
      history.forEach(entry => {
        expect(entry).toHaveProperty('id')
        expect(entry).toHaveProperty('name')
        expect(entry).toHaveProperty('type')
        expect(entry).toHaveProperty('status')
        expect(entry).toHaveProperty('startedAt')
      })
    })
  })

  describe('validateWorkflowStep', () => {
    it('should validate correct workflow steps', () => {
      const validStep = {
        id: 'step1',
        type: WorkflowStepType.DOCUMENT_ANALYSIS,
        name: 'Analyze Document',
        config: {}
      }

      const result = orchestrator.validateWorkflowStep(validStep)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid workflow steps', () => {
      const invalidStep = {
        id: '', // Empty ID should be invalid
        type: WorkflowStepType.DOCUMENT_ANALYSIS,
        name: 'Analyze Document',
        config: {}
      }

      const result = orchestrator.validateWorkflowStep(invalidStep)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('getActiveWorkflows', () => {
    it('should return list of active workflows', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'Test workflow',
        steps: [
          {
            id: 'step1',
            type: WorkflowStepType.DOCUMENT_ANALYSIS,
            name: 'Analyze Document',
            config: {}
          }
        ]
      }

      const workflowId = orchestrator.createWorkflow(workflowData)
      await orchestrator.startWorkflow(workflowId)
      
      const activeWorkflows = orchestrator.getActiveWorkflows()
      
      expect(activeWorkflows).toBeInstanceOf(Array)
      expect(activeWorkflows.length).toBeGreaterThan(0)
      expect(activeWorkflows.some(w => w.id === workflowId)).toBe(true)
    })
  })
})