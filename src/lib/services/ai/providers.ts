/**
 * AI Provider Configurations
 * Model configurations and provider setup for Vercel AI SDK
 */

import type { ModelConfig, AIModel } from './types';

/**
 * Available AI models with their configurations
 */
export const AI_MODELS: Record<AIModel, ModelConfig> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Best for multilingual content including Marathi. Highest accuracy.',
    costPer1kTokens: 0.005, // Approximate cost
    maxTokens: 128000,
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Cost-effective option with good Marathi support.',
    costPer1kTokens: 0.00015,
    maxTokens: 128000,
  },
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Excellent reasoning and multilingual understanding.',
    costPer1kTokens: 0.003,
    maxTokens: 200000,
  },
  'llama-3.1-70b-versatile': {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B (Groq)',
    provider: 'groq',
    description: 'Fast inference, good for structured extraction.',
    costPer1kTokens: 0.0007,
    maxTokens: 8192,
  },
};

/**
 * Get model configuration
 */
export function getModelConfig(model: AIModel): ModelConfig {
  return AI_MODELS[model];
}

/**
 * Get default model (GPT-4o for best Marathi support)
 */
export function getDefaultModel(): AIModel {
  return 'gpt-4o';
}

/**
 * Get all available models
 */
export function getAllModels(): ModelConfig[] {
  return Object.values(AI_MODELS);
}

/**
 * Check if model is available (based on API keys)
 */
export function isModelAvailable(model: AIModel): boolean {
  const config = AI_MODELS[model];
  
  switch (config.provider) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY;
    case 'groq':
      return !!process.env.GROQ_API_KEY;
    default:
      return false;
  }
}

/**
 * Get available models (filtered by API key availability)
 */
export function getAvailableModels(): ModelConfig[] {
  return getAllModels().filter(model => isModelAvailable(model.id));
}

