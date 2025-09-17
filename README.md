# BuffrSign - Digital Signature Platform

**Advanced AI-Powered Digital Signature Platform with LlamaIndex + LangGraph + Pydantic AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![LlamaIndex](https://img.shields.io/badge/LlamaIndex-Enabled-green.svg)](https://docs.llamaindex.ai/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Enabled-blue.svg)](https://langchain-ai.github.io/langgraph/)
[![Pydantic AI](https://img.shields.io/badge/Pydantic%20AI-Enabled-orange.svg)](https://docs.pydantic.dev/)

## 🚀 **Overview**

BuffrSign is a cutting-edge digital signature platform that leverages advanced AI technologies to provide intelligent, secure, and compliant digital signature workflows for individuals and SMEs. Built with **LlamaIndex + LangGraph + Pydantic AI + OCR + Computer Vision**, it offers professional-grade document processing and signature management designed specifically for individual-to-individual transactions and small-to-medium business needs.

## 🤖 **AI Technology Stack**

### **Core AI Technologies** ✅ **IMPLEMENTED**
- **LlamaIndex**: Document intelligence, RAG, structured extraction for digital signatures
- **LangGraph**: Workflow orchestration, state management, human review gates for signature workflows
- **Pydantic AI**: Structured data validation, type safety, AI model outputs for compliance
- **Data Science Engine**: ML models for classification, risk prediction, and analytics
- **OCR Service**: Optical Character Recognition for text extraction and field detection
- **Computer Vision**: Signature detection, document security, and image analysis
- **Unified AI Integration**: Complete orchestration of all AI services

### **AI Integration Benefits** ✅ **LIVE**
- **Intelligent Document Analysis**: AI-powered document understanding and field detection
- **Workflow Orchestration**: Automated signature workflows with human review gates
- **Compliance Validation**: Automated ETA 2019 and regulatory compliance checking
- **Risk Assessment**: AI-powered fraud detection and security analysis
- **Structured Data Extraction**: Type-safe data extraction with Pydantic validation
- **Real-time Processing**: Live AI analysis with progress tracking
- **Multi-modal Analysis**: Document classification, entity extraction, sentiment analysis

## ✨ **Key Features**

### **Document Management**
- **AI-Powered Upload**: Intelligent document analysis with LlamaIndex
- **Field Detection**: Automated signature field identification using Computer Vision
- **Template System**: AI-generated templates with Pydantic AI validation
- **Version Control**: Complete document history and audit trails

### **Signature Workflow**
- **Multi-Party Signing**: LangGraph orchestrated signature workflows
- **Progress Tracking**: Real-time signature status monitoring
- **Notifications**: Automated email and SMS notifications
- **Approval Workflows**: Configurable approval chains with AI insights

### **Compliance & Security**
- **ETA 2019 Compliance**: Automated compliance validation with Pydantic AI
- **Digital Certificates**: PKI-based digital signature certificates
- **Audit Trails**: Complete audit logging for regulatory compliance
- **Encryption**: End-to-end encryption for document security

### **AI Analytics**
- **Usage Insights**: LlamaIndex-powered analytics and reporting
- **Performance Metrics**: AI-driven performance optimization
- **Compliance Monitoring**: Automated compliance trend analysis
- **Risk Assessment**: ML-based risk scoring and fraud detection

## 🏗️ **Architecture**

### **Frontend (Next.js 14)**
```
┌─────────────────────────────────────────────────────────────┐
│                    BuffrSign Frontend                       │
├─────────────────────────────────────────────────────────────┤
│     Next.js 14 + TypeScript + Tailwind + DaisyUI           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Pages    │ │ Components  │ │    Hooks    │           │
│  │             │ │             │ │             │           │
│  │ • Dashboard │ │ • Auth      │ │ • useAuth   │           │
│  │ • Documents │ │ • Documents │ │ • useDocs   │           │
│  │ • Templates │ │ • Templates │ │ • useTemplates│          │
│  │ • Workflows │ │ • Workflows │ │ • useWorkflows│          │
│  │ • Analytics │ │ • Analytics │ │ • useAnalytics│         │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### **Backend (AI-Powered)**
```
┌─────────────────────────────────────────────────────────────┐
│                    BuffrSign Backend                        │
├─────────────────────────────────────────────────────────────┤
│         FastAPI + Python 3.11+ + AI/ML Services            │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ API Routes  │ │ AI Services │ │ Database    │           │
│  │             │ │             │ │             │           │
│  │ • Auth      │ │ • LlamaIndex│ │ • Supabase  │           │
│  │ • Documents │ │ • LangGraph │ │ • PostgreSQL│           │
│  │ • Workflows │ │ • Pydantic  │ │ • Redis     │           │
│  │ • Templates │ │   AI        │ │ • Vector DB │           │
│  │ • Analytics │ │ • OCR       │ │ • Storage   │           │
│  │ • Compliance│ │ • Computer  │ │ • Audit     │           │
│  └─────────────┘ │   Vision    │ └─────────────┘           │
│                  └─────────────┘                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 AI/ML Pipeline                          │ │
│  │ • LlamaIndex: Document intelligence and RAG            │ │
│  │ • LangGraph: Workflow orchestration and state management│ │
│  │ • Pydantic AI: Structured data validation and extraction│ │
│  │ • OCR: Text extraction and field detection             │ │
│  │ • Computer Vision: Signature field and security detection│ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.11+
- Supabase account
- OpenAI API key (for LlamaIndex)

### **Installation**

1. **Clone the repository**
   ```bash
git clone https://github.com/your-org/buffrsign-starter.git
cd buffrsign-starter
   ```

2. **Install frontend dependencies**
   ```bash
npm install
   ```

3. **Install backend dependencies**
   ```bash
cd backend
pip install -r requirements.txt
pip install -r requirements_llamaindex.txt
```

4. **Environment Configuration**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
LLAMAINDEX_ENABLED=true
```

5. **Start the development servers**
   ```bash
# Frontend
   npm run dev

# Backend
cd backend
uvicorn main:app --reload
```

## 🔐 **Authentication System**

### **Centralized Auth Context**
BuffrSign uses a centralized authentication system with the following features:

- **Single Supabase Client**: Prevents multiple client instances and authentication conflicts
- **Role-Based Access Control**: Individual, SME, Admin, and Super Admin roles
- **Secure Session Management**: JWT-based authentication with proper token handling
- **Email Confirmation**: Automatic email verification for new accounts
- **Password Reset**: Secure password reset with email links
- **Profile Management**: Complete user profile management with real-time updates

### **Auth Context Features**
```typescript
// Available in all components via useAuth() hook
const {
  user,                    // Current user profile
  loading,                 // Loading state
  signUp,                  // User registration
  signIn,                  // User login
  signOut,                 // User logout
  resetPassword,           // Password reset
  updatePassword,          // Password update
  updateProfile,           // Profile update
  getSupabaseClient        // Direct Supabase client access
} = useAuth();
```

### **Database Schema**
- **Table**: `profiles` (aligned with Supabase auth.users)
- **RLS Policies**: Row-level security for data protection
- **Triggers**: Automatic profile creation on user signup
- **Audit Logging**: Complete audit trail for all user actions

## 🚀 **Implemented AI Services**

### **1. LlamaIndex Integration** (`lib/ai/llamaindex-integration.ts`)
- ✅ **Document Intelligence Pipeline**: Complete document indexing and semantic querying
- ✅ **AI-Powered Analysis**: Document analysis, key clause extraction, signature field detection
- ✅ **Compliance Automation**: ETA 2019 compliance checking with AI
- ✅ **Template Generation**: Smart legal template generation
- ✅ **Knowledge Base Queries**: Legal knowledge base integration
- ✅ **React Hooks**: `useLlamaIndexAnalysis`, `useLlamaIndexQuery`

### **2. Pydantic AI Agents** (`lib/ai/pydantic-ai-agents.ts`)
- ✅ **Structured AI Agents**: Document analysis, entity extraction, sentiment analysis
- ✅ **Compliance Agents**: Automated compliance checking with structured responses
- ✅ **Workflow Agents**: AI-driven workflow orchestration
- ✅ **Custom Agent Queries**: Natural language queries to specialized agents
- ✅ **React Hooks**: `usePydanticAIAgent`, `useDocumentAnalysis`, `useComplianceCheck`

### **3. LangGraph Workflows** (`lib/ai/langgraph-workflows.ts`)
- ✅ **Workflow Orchestration**: State machine-based workflow management
- ✅ **Document Processing Workflows**: Automated document processing pipelines
- ✅ **KYC Workflows**: Complete KYC verification workflows
- ✅ **Real-time Monitoring**: Workflow state tracking and updates
- ✅ **React Hooks**: `useWorkflowExecution`, `useWorkflowDefinition`, `useWorkflowHistory`

### **4. Data Science Engine** (`lib/ai/data-science-engine.ts`)
- ✅ **ML Model Integration**: Document classification, risk prediction, compliance scoring
- ✅ **Pattern Recognition**: Anomaly detection and analytics insights
- ✅ **Similarity Analysis**: Document similarity and clustering
- ✅ **Predictive Analytics**: Processing time prediction, user behavior analysis
- ✅ **React Hooks**: `useDocumentClassification`, `useRiskPrediction`

### **5. OCR Service** (`lib/ai/ocr-service.ts`)
- ✅ **Text Extraction**: Advanced OCR for document text extraction
- ✅ **Field Detection**: Automated form field detection and validation
- ✅ **Table Extraction**: Intelligent table structure recognition
- ✅ **Document Analysis**: Document structure and type detection
- ✅ **React Hooks**: `useOCRTextExtraction`, `useFieldDetection`

### **6. Computer Vision Service** (`lib/ai/computer-vision-service.ts`)
- ✅ **Signature Detection**: Advanced signature field and validation detection
- ✅ **Security Analysis**: Document tampering and forgery detection
- ✅ **Image Quality**: Quality analysis and enhancement recommendations
- ✅ **Anomaly Detection**: Unusual patterns and inconsistencies detection
- ✅ **React Hooks**: `useSignatureDetection`, `useDocumentSecurity`, `useImageQuality`

### **7. Unified AI Integration** (`lib/ai/ai-integration.ts`)
- ✅ **Complete Document Pipeline**: Orchestrates all AI services together
- ✅ **KYC Workflow Integration**: End-to-end KYC processing with AI
- ✅ **Intelligent Analysis**: Multi-modal document analysis
- ✅ **Complete Analysis**: Full OCR + Computer Vision + AI analysis
- ✅ **React Hooks**: `useDocumentProcessing`, `useIntelligentAnalysis`, `useKYCWorkflow`, `useCompleteDocumentAnalysis`
- ✅ **Utility Functions**: Processing options, status tracking

## 🤖 **AI Integration Examples**

### **Document Analysis with LlamaIndex (TypeScript)**
```typescript
import { useLlamaIndexAnalysis } from '@/lib/ai/llamaindex-integration';

function DocumentAnalysisComponent({ documentId }: { documentId: string }) {
  const { analysis, loading, error } = useLlamaIndexAnalysis(documentId);

  if (loading) return <div>Analyzing document...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Document Analysis Results</h3>
      <p>Summary: {analysis?.summary}</p>
      <p>Compliance Score: {analysis?.compliance_score}</p>
      <p>Risk Level: {analysis?.risk_assessment?.level}</p>
    </div>
  );
}
```

### **Workflow Orchestration with LangGraph (TypeScript)**
```typescript
import { useWorkflowExecution } from '@/lib/ai/langgraph-workflows';

function WorkflowMonitor({ executionId }: { executionId: string }) {
  const { state, loading, error } = useWorkflowExecution(executionId);

  if (loading) return <div>Loading workflow...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Workflow Status: {state?.status}</h3>
      <p>Current Step: {state?.current_node}</p>
      <p>Progress: {state?.history?.length} steps completed</p>
    </div>
  );
}
```

### **Compliance Validation with Pydantic AI (TypeScript)**
```typescript
import { useComplianceCheck } from '@/lib/ai/pydantic-ai-agents';

function ComplianceChecker({ documentId }: { documentId: string }) {
  const { compliance, loading, error } = useComplianceCheck(documentId, 'ETA2019');

  if (loading) return <div>Checking compliance...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Compliance Results</h3>
      {compliance?.map((issue, index) => (
        <div key={index} className={`alert ${issue.severity === 'high' ? 'alert-error' : 'alert-warning'}`}>
          <p>{issue.description}</p>
          <p>Recommendation: {issue.recommendation}</p>
        </div>
      ))}
    </div>
  );
}
```

### **Unified AI Processing (TypeScript)**
```typescript
import { useDocumentProcessing, createDocumentProcessingOptions } from '@/lib/ai/ai-integration';

function DocumentProcessor({ documentId }: { documentId: string }) {
  const options = createDocumentProcessingOptions(true, true, true, false);
  const { results, loading, error } = useDocumentProcessing(documentId, options);

  if (loading) return <div>Processing document with AI...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>AI Processing Results</h3>
      {results?.analysis && <div>✅ Document Analysis Complete</div>}
      {results?.compliance && <div>✅ Compliance Check Complete</div>}
      {results?.riskScore && <div>✅ Risk Assessment Complete</div>}
    </div>
  );
}
```

## 📊 **Features by User Type**

### **Individual Users**
- Document upload and AI analysis
- Template-based signature workflows
- Personal document management
- Compliance validation and audit trails
- Simple, intuitive interface
- Free tier with 10 documents/month

### **SME Businesses**
- Team collaboration and role management
- Bulk document operations
- Workflow automation with LangGraph
- Business analytics and reporting
- Cost-effective pricing for small teams
- Advanced security policies
- Custom branding and white-labeling
- API integration capabilities
- Advanced compliance monitoring
- Scalable team management

## 🔒 **Security & Compliance**

### **Security Features**
- End-to-end encryption
- Multi-factor authentication
- Role-based access control
- Secure document storage
- Audit trail logging

### **Compliance Standards**
- ETA 2019 compliance
- CRAN accreditation
- GDPR compliance
- Local privacy law adherence
- Regulatory reporting

## 📈 **Performance & Scalability**

### **Performance Metrics**
- Document upload: < 30 seconds with AI analysis
- Signature process: < 5 minutes for simple documents
- API response time: < 200ms
- System uptime: > 99.9%

### **Scalability Features**
- Horizontal scaling support
- Load balancing
- Database optimization
- Caching strategies
- Auto-scaling capabilities

## 🛠️ **Development**

### **Tech Stack**
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, DaisyUI
- **Backend**: FastAPI, Python 3.11+, LlamaIndex, LangGraph, Pydantic AI
- **Database**: Supabase (PostgreSQL), Redis
- **AI/ML**: OpenAI GPT-4, Computer Vision, OCR
- **Deployment**: Vercel, Railway, Docker

### **Development Commands**
```bash
# Frontend development
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check

# Backend development
cd backend
uvicorn main:app --reload    # Start development server
pytest                        # Run tests
black .                       # Format code
mypy .                        # Type checking
```

## 📚 **Documentation**

- [Project Planning](./PLANNING.md) - Comprehensive project planning and architecture
- [Task Breakdown](./TASK.md) - Detailed implementation tasks and requirements
- [AI Services Documentation](./AI_SERVICES.md) - Complete AI services implementation guide
- [API Documentation](./API_DOCUMENTATION.md) - Comprehensive API reference and integration guide
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment and configuration guide
- [Database Schema](./docs/database-schema.md) - Complete database structure and relationships

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [docs.buffrsign.ai](https://docs.buffrsign.ai)
- **Community**: [community.buffrsign.ai](https://community.buffrsign.ai)
- **Support**: [support@buffrsign.ai](mailto:support@buffrsign.ai)
- **Issues**: [GitHub Issues](https://github.com/your-org/buffrsign-starter/issues)

## 🔮 **Roadmap**

- **Q1 2025**: Production launch with AI enhancement for individuals and SMEs
- **Q2 2025**: Mobile app and advanced AI features for personal use
- **Q3 2025**: Advanced SME integrations and team collaboration features
- **Q4 2025**: Regional expansion within SADC for individuals and SMEs

---

**Built with ❤️ by the BuffrSign Team**

**AI Stack**: **LlamaIndex + LangGraph + Pydantic AI + OCR + Computer Vision**
