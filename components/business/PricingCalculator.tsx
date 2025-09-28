/**
 * BuffrSign Pricing Calculator Component
 * 
 * Purpose: Real-time pricing calculation based on business model
 * Location: /components/business/PricingCalculator.tsx
 * Features: TypeScript-based, Groq AI cost integration, law firm partnership costs
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { businessModel } from '@/lib/design-system';

interface PricingCalculatorProps {
  userType: 'standard' | 'pro';
  onCostChange?: (cost: number) => void;
}

type StandardPricing = {
  documentSigning: number;
  aiTokens: number;
  freeStarterPack: {
    signatures: number;
    tokens: number;
  };
  minTopUp: number;
};

type ProPricing = {
  monthlyFee: number;
  included: {
    signatures: string;
    tokens: number;
  };
  additionalTokens: number;
};


const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  userType,
  onCostChange
}) => {
  const [documents, setDocuments] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [additionalTokens, setAdditionalTokens] = useState(0);

  // Calculate costs based on business model
  const costs = useMemo(() => {
    const pricing = businessModel.pricing[userType];
    const aiConfig = businessModel.ai.groq[userType === 'pro' ? 'llama70B' : 'llama8B'];
    
    // Document signing costs - FREE for standard until October 2025
    const documentCost = userType === 'pro' ? 0 : 0; // FREE for standard plan
    
    // AI token costs - FREE for standard until October 2025
    const includedTokens = userType === 'pro' ? (pricing as ProPricing).included.tokens : (pricing as StandardPricing).freeStarterPack.tokens;
    const usedTokens = Math.max(0, tokens - includedTokens);
    const tokenCost = userType === 'pro' ? usedTokens * ((pricing as ProPricing).additionalTokens / 100) : 0; // FREE for standard plan
    
    // Additional token costs - FREE for standard until October 2025
    const additionalTokenCost = userType === 'pro' ? additionalTokens * ((pricing as ProPricing).additionalTokens / 100) : 0; // FREE for standard plan
    
    // Total costs
    const totalCost = documentCost + tokenCost + additionalTokenCost;
    
    // AI processing costs (for internal calculation)
    const aiProcessingCost = tokens * aiConfig.cost;
    const profitMargin = totalCost - aiProcessingCost;
    
    return {
      documentCost,
      tokenCost,
      additionalTokenCost,
      totalCost,
      aiProcessingCost,
      profitMargin,
      profitMarginPercentage: totalCost > 0 ? (profitMargin / totalCost) * 100 : 0
    };
  }, [userType, documents, tokens, additionalTokens]);

  // Update parent component when costs change
  React.useEffect(() => {
    onCostChange?.(costs.totalCost);
  }, [costs.totalCost, onCostChange]);

  return (
    <div className="bg-card p-6 rounded-lg border border-border space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Pricing Calculator</h3>
        <div className={cn(
          'px-3 py-1 text-sm rounded-full',
          userType === 'pro' 
            ? 'bg-chart-1/10 text-chart-1' 
            : 'bg-chart-4/10 text-chart-4'
        )}>
          {userType === 'pro' ? 'Pro Plan' : 'Standard Plan'}
        </div>
      </div>

      {/* Usage Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Documents to Sign
          </label>
          <input
            type="number"
            value={documents}
            onChange={(e) => setDocuments(Number(e.target.value))}
            className="form-input w-full"
            placeholder="0"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            AI Tokens Used
          </label>
          <input
            type="number"
            value={tokens}
            onChange={(e) => setTokens(Number(e.target.value))}
            className="form-input w-full"
            placeholder="0"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Additional Tokens
          </label>
          <input
            type="number"
            value={additionalTokens}
            onChange={(e) => setAdditionalTokens(Number(e.target.value))}
            className="form-input w-full"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Cost Breakdown</h4>
        
        <div className="space-y-2">
          {costs.documentCost > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Document Signing</span>
              <span className="font-medium">N${costs.documentCost.toFixed(2)}</span>
            </div>
          )}
          
          {costs.tokenCost > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">AI Tokens</span>
              <span className="font-medium">N${costs.tokenCost.toFixed(2)}</span>
            </div>
          )}
          
          {costs.additionalTokenCost > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Additional Tokens</span>
              <span className="font-medium">N${costs.additionalTokenCost.toFixed(2)}</span>
            </div>
          )}
          
          {userType === 'pro' && (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Monthly Subscription</span>
              <span className="font-medium">N${businessModel.pricing.pro.monthlyFee}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center py-3 border-t border-border">
          <span className="font-semibold text-foreground">Total Cost</span>
          <span className="text-xl font-bold text-chart-1">
            N${(costs.totalCost + (userType === 'pro' ? businessModel.pricing.pro.monthlyFee : 0)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* AI Cost Analysis */}
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <h4 className="font-medium text-foreground">AI Cost Analysis</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">AI Processing Cost:</span>
            <span className="ml-2 font-medium">N${costs.aiProcessingCost.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Profit Margin:</span>
            <span className="ml-2 font-medium text-chart-2">
              {costs.profitMarginPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Using {userType === 'pro' ? 'Groq Llama 3.1 70B' : 'Groq Llama 3.1 8B'} 
          (99.5% cost savings vs OpenAI, DeepSeek fallback available)
        </div>
      </div>

      {/* Free Period Notice for Standard Plan */}
      {userType === 'standard' && (
        <div className="bg-chart-2/10 p-4 rounded-lg border border-chart-2/20">
          <div className="flex items-start space-x-2">
            <svg className="h-5 w-5 text-chart-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-chart-2">FREE Until October 2025</p>
              <p className="text-sm text-chart-2/80">
                Standard plan is completely FREE until October 31, 2025. No charges for document signing or AI tokens.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Law Firm Partnership Notice */}
      <div className="bg-chart-1/10 p-4 rounded-lg border border-chart-1/20">
        <div className="flex items-start space-x-2">
          <svg className="h-5 w-5 text-chart-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-chart-1">Law Firm Partnership</p>
            <p className="text-sm text-chart-1/80">
              All signatures include ETA 2019 compliance validation and law firm quality assurance.
            </p>
          </div>
        </div>
      </div>

      {/* AI Capabilities Notice */}
      <div className="bg-chart-2/10 p-4 rounded-lg border border-chart-2/20">
        <div className="flex items-start space-x-2">
          <svg className="h-5 w-5 text-chart-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-chart-2">AI Capabilities</p>
            <p className="text-sm text-chart-2/80">
              Document analysis, field detection, compliance checking, and risk assessment included.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
