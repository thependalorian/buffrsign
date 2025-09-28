# Langfuse Integration for BuffrSign

## Overview

BuffrSign now includes comprehensive **Langfuse integration** for AI observability, monitoring, and analytics. This integration provides real-time tracking of all AI interactions, performance metrics, cost analysis, and error monitoring across the entire BuffrSign platform.

## 🚀 Features

### **AI Observability**
- **Real-time Tracking**: Monitor all AI service calls (LlamaIndex, Pydantic AI, LangGraph, Groq, OpenAI)
- **Performance Analytics**: Track response times, token usage, and processing efficiency
- **Cost Monitoring**: Monitor AI service costs across different providers
- **Error Tracking**: Comprehensive error logging and analysis

### **Document Processing Monitoring**
- **Document Analysis**: Track AI-powered document analysis with confidence scores
- **Signature Validation**: Monitor signature verification processes
- **Compliance Checking**: Track ETA 2019 compliance validation
- **Workflow Execution**: Monitor LangGraph workflow orchestration

### **Advanced Analytics**
- **Model Performance**: Compare different AI models and their effectiveness
- **User Behavior**: Analyze how users interact with AI features
- **Cost Optimization**: Identify cost-saving opportunities
- **Quality Metrics**: Track accuracy and reliability of AI responses

## 📋 Installation & Setup

### 1. **Install Dependencies**
```bash
cd buffrsign-starter
npm install langfuse
```

### 2. **Environment Configuration**
Update your `.env.local` file with Langfuse credentials:

```bash
# Langfuse Configuration
LANGFUSE_PUBLIC_KEY=pk-lf-your-public-key-here
LANGFUSE_SECRET_KEY=sk-lf-your-secret-key-here
LANGFUSE_HOST=https://us.cloud.langfuse.com

# Advanced Configuration
LANGFUSE_FLUSH_AT=1
LANGFUSE_FLUSH_INTERVAL=1000
LANGFUSE_ENABLE_TRACING=true
LANGFUSE_ENABLE_METRICS=true

# Feature Flags
ENABLE_LANGFUSE_TRACING=true
ENABLE_LANGFUSE_METRICS=true
ENABLE_LANGFUSE_ERROR_TRACKING=true
```

### 3. **Get Langfuse Credentials**
1. Sign up at [https://cloud.langfuse.com](https://cloud.langfuse.com)
2. Create a new project
3. Go to Project Settings → API Keys
4. Copy your Public Key and Secret Key

## 🏗️ Architecture

### **Service Layer**
```
lib/services/langfuse-service.ts
├── DocumentAnalysisTrace
├── SignatureValidationTrace
├── WorkflowExecutionTrace
├── ComplianceCheckTrace
└── AIProviderMetrics
```

### **API Routes**
```
app/api/monitoring/
├── langfuse-metrics/route.ts    # Metrics and analytics
├── langfuse-traces/route.ts     # Detailed trace information
└── langfuse-health/route.ts     # Health checks and status
```

### **Components**
```
components/admin/
└── LangfuseDashboard.tsx        # Monitoring dashboard
```

## 🔧 Usage

### **Basic Tracking**
```typescript
import { langfuseService } from '@/lib/services/langfuse-service';

// Track document analysis
await langfuseService.trackDocumentAnalysis({
  documentId: 'doc_123',
  documentType: 'contract',
  confidence: 0.95,
  complianceScore: 87,
  processingTime: 1200,
  aiServices: ['llamaindex', 'groq'],
  riskLevel: 'low',
  signatureFieldsDetected: 2,
});

// Track signature validation
await langfuseService.trackSignatureValidation({
  signatureId: 'sig_456',
  documentId: 'doc_123',
  verificationStatus: 'verified',
  complianceStatus: 'compliant',
  validationMethod: 'electronic',
  confidence: 0.92,
  processingTime: 800,
});
```

### **Error Tracking**
```typescript
// Track errors automatically
try {
  const result = await aiService.processDocument(documentId);
} catch (error) {
  await langfuseService.trackError('document-processing', error, {
    documentId,
    userId,
    processingTime: Date.now() - startTime,
  });
  throw error;
}
```

### **AI Provider Metrics**
```typescript
// Track AI provider performance
await langfuseService.trackAIServiceCall(
  'groq-analysis',
  { documentId, documentType },
  { confidence: 0.95, complianceScore: 87 },
  {
    provider: 'groq',
    model: 'llama-3.1-8b-instant',
    tokensUsed: 456,
    cost: 0.0023,
    responseTime: 1200,
    success: true,
  }
);
```

## 📊 Monitoring Dashboard

### **Access the Dashboard**
1. Navigate to `/protected/admin/monitoring`
2. Select "AI Monitoring Dashboard"
3. View real-time metrics and analytics

### **Dashboard Features**
- **Key Metrics**: Total requests, tokens, costs, response times
- **Success/Error Rates**: Track system reliability
- **Recent Traces**: Real-time AI interaction logs
- **Top Models**: Most used AI models and their performance
- **Cost Breakdown**: Spending by AI provider
- **Quick Actions**: Export data, view full dashboard, compliance reports

## 🔍 API Endpoints

### **Metrics API**
```bash
GET /api/monitoring/langfuse-metrics?range=day
```
Returns aggregated metrics for the specified time range.

### **Traces API**
```bash
GET /api/monitoring/langfuse-traces?documentId=doc_123&limit=50
```
Returns detailed trace information with filtering options.

### **Health Check API**
```bash
GET /api/monitoring/langfuse-health
```
Returns Langfuse service health status and configuration.

## 🎯 Integration Points

### **AI Services Integration**
The Langfuse service is automatically integrated with:
- **LlamaIndex**: Document intelligence and RAG
- **Pydantic AI**: Structured data validation
- **LangGraph**: Workflow orchestration
- **Groq AI**: High-speed inference
- **OpenAI**: GPT models and embeddings
- **Computer Vision**: Signature detection
- **OCR Service**: Text extraction

### **Automatic Tracking**
All AI interactions are automatically tracked:
- Document upload and analysis
- Signature field detection
- Compliance checking
- Workflow execution
- Error handling
- Performance metrics

## 📈 Metrics & Analytics

### **Available Metrics**
- **Request Volume**: Total AI requests per time period
- **Token Usage**: Tokens consumed across all providers
- **Cost Analysis**: Spending by provider and model
- **Performance**: Response times and processing efficiency
- **Quality**: Success rates and error analysis
- **Usage Patterns**: Most used features and models

### **Custom Queries**
```typescript
// Get metrics for specific time range
const metrics = await langfuseService.getMetrics('week');

// Custom trace filtering
const traces = await fetch('/api/monitoring/langfuse-traces', {
  method: 'POST',
  body: JSON.stringify({
    query: 'document-analysis',
    filters: { status: 'success', confidence: { $gte: 0.9 } },
    aggregation: { avg: 'processingTime', sum: 'tokens' }
  })
});
```

## 🛠️ Configuration Options

### **Environment Variables**
```bash
# Core Configuration
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://us.cloud.langfuse.com

# Performance Tuning
LANGFUSE_FLUSH_AT=1              # Flush after 1 trace
LANGFUSE_FLUSH_INTERVAL=1000     # Flush every 1 second

# Feature Flags
ENABLE_LANGFUSE_TRACING=true
ENABLE_LANGFUSE_METRICS=true
ENABLE_LANGFUSE_ERROR_TRACKING=true
```

### **Service Configuration**
```typescript
// Customize Langfuse service
const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST,
  flushAt: 1,
  flushInterval: 1000,
});
```

## 🔒 Security & Privacy

### **Data Protection**
- **No Sensitive Data**: Only metadata and performance metrics are tracked
- **Encrypted Transmission**: All data is transmitted over HTTPS
- **Access Control**: Dashboard access restricted to admin users
- **Data Retention**: Configurable retention policies

### **Compliance**
- **GDPR Compliant**: User data anonymization
- **ETA 2019 Compliant**: Audit trail preservation
- **SOC 2 Ready**: Security and availability standards

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Langfuse Not Initializing**
```bash
# Check environment variables
echo $LANGFUSE_PUBLIC_KEY
echo $LANGFUSE_SECRET_KEY

# Verify network connectivity
curl -I https://us.cloud.langfuse.com
```

#### **2. Metrics Not Appearing**
- Check if `ENABLE_LANGFUSE_METRICS=true`
- Verify API keys are correct
- Check browser console for errors

#### **3. High Memory Usage**
- Reduce `LANGFUSE_FLUSH_AT` value
- Increase `LANGFUSE_FLUSH_INTERVAL`
- Monitor trace volume

### **Debug Mode**
```typescript
// Enable debug logging
process.env.LANGFUSE_DEBUG = 'true';

// Check service health
const health = await fetch('/api/monitoring/langfuse-health');
console.log(await health.json());
```

## 📚 Additional Resources

### **Documentation**
- [Langfuse Official Docs](https://langfuse.com/docs)
- [Langfuse TypeScript SDK](https://github.com/langfuse/langfuse-js)
- [BuffrSign AI Services](./AI_SERVICES.md)

### **Support**
- **Langfuse Support**: [support@langfuse.com](mailto:support@langfuse.com)
- **BuffrSign Support**: [support@buffr.ai](mailto:support@buffr.ai)
- **GitHub Issues**: [BuffrSign Repository](https://github.com/your-org/buffrsign-starter/issues)

## 🎉 Benefits

### **For Developers**
- **Real-time Debugging**: Track AI interactions in real-time
- **Performance Optimization**: Identify bottlenecks and optimize
- **Cost Management**: Monitor and control AI spending
- **Quality Assurance**: Ensure AI responses meet quality standards

### **For Business**
- **Operational Insights**: Understand AI usage patterns
- **Cost Control**: Optimize AI spending and ROI
- **Compliance**: Maintain audit trails for regulatory requirements
- **Scalability**: Monitor system performance as usage grows

### **For Users**
- **Reliability**: Improved AI service reliability through monitoring
- **Performance**: Faster response times through optimization
- **Quality**: Better AI responses through continuous monitoring
- **Transparency**: Clear visibility into AI processing

---

**Langfuse integration is now fully operational in BuffrSign! 🚀**

Monitor your AI services, optimize performance, and ensure compliance with comprehensive observability and analytics.