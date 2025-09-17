import { WorkflowEngine } from '../../../lib/services/workflow-engine'
import { WorkflowNode, WorkflowNodeType, WorkflowActionType, WorkflowStatus } from '../../../lib/ai-types'

describe('WorkflowEngine', () => {
  let workflowEngine: WorkflowEngine

  beforeEach(() => {
    workflowEngine = new WorkflowEngine()
    jest.clearAllMocks()
  })

  describe('createWorkflow', () => {
    it('should create a new workflow with valid nodes', () => {
      const nodes: WorkflowNode[] = [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Start Node',
          description: 'Starting point',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'started' },
            async: false
          },
          conditions: [],
          next_nodes: ['end']
        },
        {
          id: 'end',
          type: WorkflowNodeType.COMPLETION,
          name: 'End Node',
          description: 'Completion point',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: { status: 'completed' },
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ]

      const workflowId = workflowEngine.createWorkflowFromNodes(nodes, 'start')
      expect(workflowId).toBeDefined()
      expect(typeof workflowId).toBe('string')
    })

    it('should throw error for invalid starting node', () => {
      const nodes: WorkflowNode[] = [
        {
          id: 'node1',
          type: WorkflowNodeType.DOCUMENT_ANALYSIS,
          name: 'Test Node',
          description: 'Test',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: {},
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ]

      expect(() => {
        workflowEngine.createWorkflowFromNodes(nodes, 'nonexistent')
      }).toThrow('Starting node not found')
    })
  })

  describe('getWorkflowStatus', () => {
    it('should return workflow status', () => {
      const nodes: WorkflowNode[] = [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Start',
          description: 'Start',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: {},
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ]

      const workflowId = workflowEngine.createWorkflowFromNodes(nodes, 'start')
      const status = workflowEngine.getWorkflowStatus(workflowId)
      
      expect(status).toBeDefined()
      expect(status?.workflow_id).toBe(workflowId)
      expect(status?.status).toBe(WorkflowStatus.DRAFT)
    })

    it('should return null for non-existent workflow', () => {
      const status = workflowEngine.getWorkflowStatus('nonexistent')
      expect(status).toBeNull()
    })
  })

  describe('validateWorkflow', () => {
    it('should validate correct workflow structure', () => {
      const nodes: WorkflowNode[] = [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Start',
          description: 'Start',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: {},
            async: false
          },
          conditions: [],
          next_nodes: ['end']
        },
        {
          id: 'end',
          type: WorkflowNodeType.COMPLETION,
          name: 'End',
          description: 'End',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: {},
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ]

      const result = workflowEngine.validateWorkflow(nodes)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect duplicate node IDs', () => {
      const nodes: WorkflowNode[] = [
        {
          id: 'duplicate',
          type: WorkflowNodeType.START,
          name: 'Start',
          description: 'Start',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: {},
            async: false
          },
          conditions: [],
          next_nodes: []
        },
        {
          id: 'duplicate',
          type: WorkflowNodeType.COMPLETION,
          name: 'End',
          description: 'End',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: {},
            async: false
          },
          conditions: [],
          next_nodes: []
        }
      ]

      const result = workflowEngine.validateWorkflow(nodes)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Duplicate node ID: duplicate')
    })

    it('should detect invalid node references', () => {
      const nodes: WorkflowNode[] = [
        {
          id: 'start',
          type: WorkflowNodeType.START,
          name: 'Start',
          description: 'Start',
          action: {
            type: WorkflowActionType.UPDATE_STATUS,
            parameters: {},
            async: false
          },
          conditions: [],
          next_nodes: ['nonexistent']
        }
      ]

      const result = workflowEngine.validateWorkflow(nodes)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Node start references non-existent node: nonexistent')
    })
  })
})