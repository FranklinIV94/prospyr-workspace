/**
 * LLM Router - Brain Switching Engine
 * 
 * Handles switching between different LLM providers (brains)
 * Manages API keys, cost tracking, and provider-specific configurations
 */

import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { KeyVault } from './key-vault';
import { logger } from './logger';

export interface LLMConfig {
  provider: string;
  apiKey?: string;
  baseURL?: string;
  model: string;
  contextWindow: number;
  costPerInputToken: number;
  costPerOutputToken: number;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  brain: string;
  tokensUsed: number;
  cost: number;
  latency: number;
}

export class LLMRouter {
  private activeBrain: string = 'deepseek';
  private brains: Map<string, LLMConfig> = new Map();
  private keyVault: KeyVault;
  private lastSwitchTime: Date = new Date();
  private usageStats: Map<string, { tokens: number, cost: number }> = new Map();

  constructor() {
    this.keyVault = new KeyVault();
    this.initializeDefaultBrains();
  }

  /**
   * Initialize with default brain configurations
   */
  private initializeDefaultBrains(): void {
    // DeepSeek (Default - Cost Effective)
    this.brains.set('deepseek', {
      provider: 'deepseek',
      model: 'deepseek-chat',
      baseURL: 'https://api.deepseek.com',
      contextWindow: 200000,
      costPerInputToken: 0.0000001,  // $0.10 per 1M tokens
      costPerOutputToken: 0.0000002, // $0.20 per 1M tokens
      maxTokens: 4096,
      temperature: 0.7
    });

    // OpenAI GPT-4
    this.brains.set('openai', {
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      baseURL: 'https://api.openai.com/v1',
      contextWindow: 128000,
      costPerInputToken: 0.00001,    // $10 per 1M tokens
      costPerOutputToken: 0.00003,   // $30 per 1M tokens
      maxTokens: 4096,
      temperature: 0.7
    });

    // Anthropic Claude
    this.brains.set('anthropic', {
      provider: 'anthropic',
      model: 'claude-3-opus-20240229',
      contextWindow: 200000,
      costPerInputToken: 0.000015,   // $15 per 1M tokens
      costPerOutputToken: 0.000075,  // $75 per 1M tokens
      maxTokens: 4096,
      temperature: 0.7
    });

    // Google Gemini
    this.brains.set('gemini', {
      provider: 'gemini',
      model: 'gemini-pro',
      contextWindow: 32768,
      costPerInputToken: 0.0000005,  // $0.50 per 1M tokens
      costPerOutputToken: 0.0000015, // $1.50 per 1M tokens
      maxTokens: 2048,
      temperature: 0.7
    });

    // Ollama (Local)
    this.brains.set('ollama', {
      provider: 'ollama',
      model: 'llama2',
      baseURL: 'http://localhost:11434',
      contextWindow: 4096,
      costPerInputToken: 0,
      costPerOutputToken: 0,
      maxTokens: 2048,
      temperature: 0.7
    });

    // Custom endpoint
    this.brains.set('custom', {
      provider: 'custom',
      model: 'custom-model',
      contextWindow: 4096,
      costPerInputToken: 0,
      costPerOutputToken: 0,
      maxTokens: 2048,
      temperature: 0.7
    });

    // Initialize usage stats
    for (const brain of this.brains.keys()) {
      this.usageStats.set(brain, { tokens: 0, cost: 0 });
    }
  }

  /**
   * Switch to a different brain (LLM provider)
   */
  async switchBrain(brain: string, apiKey?: string): Promise<boolean> {
    try {
      if (!this.brains.has(brain)) {
        throw new Error(`Unknown brain: ${brain}. Available: ${Array.from(this.brains.keys()).join(', ')}`);
      }

      const config = this.brains.get(brain)!;
      
      // If API key provided, update configuration
      if (apiKey) {
        config.apiKey = apiKey;
        await this.keyVault.saveKey(brain, apiKey);
      } else {
        // Try to load saved key
        const savedKey = await this.keyVault.getKey(brain);
        if (savedKey) {
          config.apiKey = savedKey;
        } else if (brain !== 'ollama') {
          // Ollama doesn't need API key, others do
          logger.warn(`No API key found for brain: ${brain}. Some features may not work.`);
        }
      }

      // Test connection if API key is available
      if (config.apiKey || brain === 'ollama') {
        const testResult = await this.testConnection(brain);
        if (!testResult.success) {
          logger.error(`Failed to connect to ${brain}: ${testResult.error}`);
          return false;
        }
      }

      // Switch active brain
      this.activeBrain = brain;
      this.lastSwitchTime = new Date();
      
      logger.info(`Switched to brain: ${brain}`);
      logger.info(`Brain configuration:`, {
        model: config.model,
        contextWindow: config.contextWindow,
        costPerInputToken: config.costPerInputToken,
        costPerOutputToken: config.costPerOutputToken
      });

      return true;
    } catch (error) {
      logger.error(`Failed to switch to brain ${brain}:`, error);
      return false;
    }
  }

  /**
   * Test connection to a brain
   */
  async testConnection(brain: string): Promise<{ success: boolean; error?: string }> {
    try {
      const config = this.brains.get(brain);
      if (!config) {
        return { success: false, error: `Unknown brain: ${brain}` };
      }

      switch (brain) {
        case 'deepseek':
        case 'openai':
          return await this.testOpenAICompatible(config);
        case 'anthropic':
          return await this.testAnthropic(config);
        case 'gemini':
          return await this.testGemini(config);
        case 'ollama':
          return await this.testOllama(config);
        case 'custom':
          return { success: true }; // Custom endpoints assumed working
        default:
          return { success: false, error: `Unsupported brain type: ${brain}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Test OpenAI-compatible API (DeepSeek, OpenAI, custom)
   */
  private async testOpenAICompatible(config: LLMConfig): Promise<{ success: boolean; error?: string }> {
    try {
      if (!config.apiKey) {
        return { success: false, error: 'API key required' };
      }

      const openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL
      });

      // Simple completion test
      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'OpenAI API error' 
      };
    }
  }

  /**
   * Test Anthropic API
   */
  private async testAnthropic(config: LLMConfig): Promise<{ success: boolean; error?: string }> {
    try {
      if (!config.apiKey) {
        return { success: false, error: 'API key required' };
      }

      const anthropic = new Anthropic({
        apiKey: config.apiKey
      });

      const response = await anthropic.messages.create({
        model: config.model,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Hello' }]
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Anthropic API error' 
      };
    }
  }

  /**
   * Test Google Gemini API
   */
  private async testGemini(config: LLMConfig): Promise<{ success: boolean; error?: string }> {
    try {
      if (!config.apiKey) {
        return { success: false, error: 'API key required' };
      }

      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: config.model });

      const result = await model.generateContent('Hello');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Gemini API error' 
      };
    }
  }

  /**
   * Test Ollama local API
   */
  private async testOllama(config: LLMConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.get(`${config.baseURL}/api/tags`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Ollama not running. Start with: ollama serve' 
      };
    }
  }

  /**
   * Generate completion using active brain
   */
  async generate(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse> {
    const startTime = Date.now();
    const brainConfig = this.brains.get(this.activeBrain)!;
    
    // Merge with provided options
    const config = { ...brainConfig, ...options };
    
    try {
      let content: string;
      let tokensUsed: number = 0;

      switch (this.activeBrain) {
        case 'deepseek':
        case 'openai':
        case 'custom':
          content = await this.generateOpenAI(prompt, config);
          tokensUsed = this.estimateTokens(content);
          break;
        case 'anthropic':
          content = await this.generateAnthropic(prompt, config);
          tokensUsed = this.estimateTokens(content);
          break;
        case 'gemini':
          content = await this.generateGemini(prompt, config);
          tokensUsed = this.estimateTokens(content);
          break;
        case 'ollama':
          content = await this.generateOllama(prompt, config);
          tokensUsed = this.estimateTokens(content);
          break;
        default:
          throw new Error(`Unsupported brain: ${this.activeBrain}`);
      }

      const latency = Date.now() - startTime;
      const cost = this.calculateCost(tokensUsed, config);

      // Update usage stats
      const stats = this.usageStats.get(this.activeBrain)!;
      stats.tokens += tokensUsed;
      stats.cost += cost;
      this.usageStats.set(this.activeBrain, stats);

      return {
        content,
        brain: this.activeBrain,
        tokensUsed,
        cost,
        latency
      };
    } catch (error) {
      logger.error(`Generation failed with brain ${this.activeBrain}:`, error);
      throw error;
    }
  }

  /**
   * Generate using OpenAI-compatible API
   */
  private async generateOpenAI(prompt: string, config: LLMConfig): Promise<string> {
    if (!config.apiKey) {
      throw new Error('API key required for OpenAI-compatible brain');
    }

    const openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });

    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: config.maxTokens,
      temperature: config.temperature
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generate using Anthropic API
   */
  private async generateAnthropic(prompt: string, config: LLMConfig): Promise<string> {
    if (!config.apiKey) {
      throw new Error('API key required for Anthropic brain');
    }

    const anthropic = new Anthropic({
      apiKey: config.apiKey
    });

    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens || 1024,
      temperature: config.temperature,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].text;
  }

  /**
   * Generate using Google Gemini API
   */
  private async generateGemini(prompt: string, config: LLMConfig): Promise<string> {
    if (!config.apiKey) {
      throw new Error('API key required for Gemini brain');
    }

    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ 
      model: config.model,
      generationConfig: {
        maxOutputTokens: config.maxTokens,
        temperature: config.temperature
      }
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  /**
   * Generate using Ollama local API
   */
  private async generateOllama(prompt: string, config: LLMConfig): Promise<string> {
    const response = await axios.post(`${config.baseURL}/api/generate`, {
      model: config.model,
      prompt,
      options: {
        temperature: config.temperature
      }
    });

    return response.data.response;
  }

  /**
   * Estimate token count (simple approximation)
   */
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost based on token count
   */
  private calculateCost(tokens: number, config: LLMConfig): number {
    // Simple calculation: assume all tokens are output tokens for simplicity
    return tokens * config.costPerOutputToken;
  }

  /**
   * Get active brain
   */
  getActiveBrain(): string {
    return this.activeBrain;
  }

  /**
   * Get brain configuration
   */
  getBrainConfig(brain?: string): LLMConfig | null {
    const targetBrain = brain || this.activeBrain;
    return this.brains.get(targetBrain) || null;
  }

  /**
   * Get available brains
   */
  getAvailableBrains(): string[] {
    return Array.from(this.brains.keys());
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): Record<string, { tokens: number; cost: number }> {
    const stats: Record<string, { tokens: number; cost: number }> = {};
    for (const [brain, data] of this.usageStats.entries()) {
      stats[brain] = { ...data };
    }
    return stats;
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(brain?: string): void {
    if (brain) {
      this.usageStats.set(brain, { tokens: 0, cost: 0 });
    } else {
      for (const brain of this.usageStats.keys()) {
        this.usageStats.set(brain, { tokens: 0, cost: 0 });
      }
    }
  }

  /**
   * Add custom brain configuration
   */
  addCustomBrain(name: string, config: LLMConfig): void {
    this.brains.set(name, config);
    this.usageStats.set(name, { tokens: 0, cost: 0 });
    logger.info(`Added custom brain: ${name}`);
  }

  /**
   * Remove brain configuration
   */
  removeBrain(name: string): boolean {
    if (name === 'deepseek') {
      logger.warn('Cannot remove default deepseek brain');
      return false;
    }
    
    const deleted = this.brains.delete(name);
    this.usageStats.delete(name);
    
    if (deleted && this.activeBrain === name) {
      this.activeBrain = 'deepseek'; // Fallback to default
    }
    
    return deleted;
  }
}