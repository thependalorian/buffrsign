/**
 * React Hook for Groq AI Integration
 * Provides easy access to Groq LLM services with _user tier-based model selection
 */

import { useState, useCallback, useRef } from 'react';
import { BuffrSignAIIntegration } from '@/lib/ai/ai-integration';
import type { UserTier } from '@/lib/ai/ai-types';

export interface GroqMessage {
  role: 'system' | '_user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface GroqResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface UseGroqAIOptions {
  userTier: UserTier;
  onError?: (error: Error) => void;
  onTokenUsage?: (usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
}

export interface UseGroqAIResult {
  // State
  isLoading: boolean;
  isStreaming: boolean;
  messages: GroqMessage[];
  error: string | null;
  totalTokensUsed: number;
  
  // Actions
  sendMessage: (content: string, systemPrompt?: string) => Promise<void>;
  sendStreamingMessage: (content: string, systemPrompt?: string, onChunk?: (chunk: string) => void) => Promise<void>;
  analyzeDocument: (documentContent: string, analysisType?: 'basic' | 'comprehensive') => Promise<GroqResponse>;
  explainLegalTerms: (terms: string[], context?: string) => Promise<GroqResponse>;
  checkCompliance: (documentContent: string, frameworks?: string[]) => Promise<GroqResponse>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
}

export function useGroqAI(options: UseGroqAIOptions): UseGroqAIResult {
  const { userTier, onError, onTokenUsage } = options;
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<GroqMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  
  // Refs
  const lastUserMessageRef = useRef<string>('');
  const lastSystemPromptRef = useRef<string>('');

  // Initialize AI integration
  const _aiIntegration = useRef(new BuffrSignAIIntegration()).current;

  // Send a regular message
  const sendMessage = useCallback(async (content: string, systemPrompt?: string) => {
    setIsLoading(true);
    setError(null);
    
    // Store for potential retry
    lastUserMessageRef.current = content;
    lastSystemPromptRef.current = systemPrompt || '';

    try {
      const messageHistory = [...messages];
      
      // Add system prompt if provided
      if (systemPrompt) {
        messageHistory.push({
          role: 'system',
          content: systemPrompt,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Add _user message
      messageHistory.push({
        role: '_user',
        content,
        timestamp: new Date().toISOString(),
      });

      const response = await aiIntegration.getBuffrSignAssistantResponse(
        content,
        userTier,
        { previousMessages: messageHistory }
      );

      // Add assistant response
      const assistantMessage: GroqMessage = {
        role: 'assistant',
        content: response.data?.content || 'No response received',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update token usage
      if (response.data?.usage) {
        setTotalTokensUsed(prev => prev + response.data.usage.total_tokens);
        onTokenUsage?.(response.data.usage);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [messages, userTier, makeAPICall, onError, onTokenUsage]);

  // Send a streaming message
  const sendStreamingMessage = useCallback(async (
    content: string, 
    systemPrompt?: string, 
    onChunk?: (chunk: string) => void
  ) => {
    setIsStreaming(true);
    setError(null);
    
    // Store for potential retry
    lastUserMessageRef.current = content;
    lastSystemPromptRef.current = systemPrompt || '';

    try {
      const messageHistory = [...messages];
      
      // Add system prompt if provided
      if (systemPrompt) {
        messageHistory.push({
          role: 'system',
          content: systemPrompt,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Add _user message
      messageHistory.push({
        role: '_user',
        content,
        timestamp: new Date().toISOString(),
      });

      // Add empty assistant message for streaming
      const assistantMessage: GroqMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      const response = await fetch('/api/ai/groq/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          messages: messageHistory,
          userTier,
        }),
      });

      if (!response.ok) {
        throw new Error('Streaming request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk') {
                  assistantContent += data.content;
                  onChunk?.(data.content);
                  
                  // Update the assistant message content
                  setMessages(prev => 
                    prev.map((msg, _index) => 
                      _index === prev.length - 1 && msg.role === 'assistant'
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  );
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', parseError);
              }
            }
          }
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsStreaming(false);
    }
  }, [messages, userTier, onError]);

  // Analyze document
  const analyzeDocument = useCallback(async (
    documentContent: string, 
    analysisType: 'basic' | 'comprehensive' = 'basic'
  ): Promise<GroqResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiIntegration.analyzeDocumentWithGroq({
        documentContent,
        userTier,
        analysisType,
      });

      // Update token usage
      if (response.data.usage) {
        setTotalTokensUsed(prev => prev + response.data.usage.total_tokens);
        onTokenUsage?.(response.data.usage);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userTier, makeAPICall, onError, onTokenUsage]);

  // Explain legal terms
  const explainLegalTerms = useCallback(async (
    terms: string[], 
    context?: string
  ): Promise<GroqResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiIntegration.explainLegalTermsWithGroq({
        terms,
        context,
        userTier,
      });

      // Update token usage
      if (response.data.usage) {
        setTotalTokensUsed(prev => prev + response.data.usage.total_tokens);
        onTokenUsage?.(response.data.usage);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userTier, makeAPICall, onError, onTokenUsage]);

  // Check compliance
  const checkCompliance = useCallback(async (
    documentContent: string, 
    frameworks?: string[]
  ): Promise<GroqResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiIntegration.checkComplianceWithGroq({
        documentContent,
        frameworks,
        userTier,
      });

      // Update token usage
      if (response.data.usage) {
        setTotalTokensUsed(prev => prev + response.data.usage.total_tokens);
        onTokenUsage?.(response.data.usage);
      }

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userTier, makeAPICall, onError, onTokenUsage]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setTotalTokensUsed(0);
  }, []);

  // Retry last message
  const retryLastMessage = useCallback(async () => {
    if (lastUserMessageRef.current) {
      await sendMessage(lastUserMessageRef.current, lastSystemPromptRef.current);
    }
  }, [sendMessage]);

  return {
    // State
    isLoading,
    isStreaming,
    messages,
    error,
    totalTokensUsed,
    
    // Actions
    sendMessage,
    sendStreamingMessage,
    analyzeDocument,
    explainLegalTerms,
    checkCompliance,
    clearMessages,
    retryLastMessage,
  };
}
