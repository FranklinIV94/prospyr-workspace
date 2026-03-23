/**
 * Agent Manager
 * 
 * Manages communication with AI agents (Prospyr, Northstar, sub-agents)
 * Handles agent registration, status tracking, and message routing
 */

import axios from 'axios';
import { LLMRouter, LLMResponse } from './llm-router';
import { logger } from './logger';

export interface Agent {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: Date;
  capabilities: string[];
  currentTask?: string;
}

export interface AgentMessage {
  agentId: string;
  message: string;
  brain?: string;
  context?: Record<string, any>;
  timestamp: Date;
}

export interface AgentResponse {
  agentId: string;
  message: string;
  brainUsed: string;
  tokensUsed: number;
  cost: number;
  latency: number;
  timestamp: Date;
}

export class AgentManager {
  private agents: Map<string, Agent> = new Map();
  private llmRouter: LLMRouter;
  private messageHistory: AgentMessage[] = [];

  constructor() {
    this.llmRouter = new LLMRouter();
    this.initializeDefaultAgents();
  }

  /**
   * Initialize with default agents
   */
  private initializeDefaultAgents(): void {
    // Prospyr agent
    this.registerAgent('prospyr', 'Prospyr (OpenClaw)', process.env.PROSPYR_URL || 'http://localhost:3001/api/prospyr');
    
    // Northstar agent
    this.registerAgent('northstar', 'Northstar (OpenClaw)', process.env.NORTHSTAR_URL || 'http://localhost:3002/api/northstar');
    
    logger.info(`Initialized ${this.agents.size} default agents`);
  }

  /**
   * Register a new agent
   */
  registerAgent(id: string, name: string, url: string, apiKey?: string, capabilities: string[] = []): Agent {
    const agent: Agent = {
      id,
      name,
      url,
      apiKey,
      status: 'offline',
      lastSeen: new Date(),
      capabilities: capabilities.length > 0 ? capabilities : this.detectCapabilitiesFromId(id)
    };

    this.agents.set(id, agent);
    
    // Test connection
    this.testAgentConnection(id).then(online => {
      agent.status = online ? 'online' : 'error';
      agent.lastSeen = new Date();
    });

    logger.info(`Registered agent: ${name} (${id}) at ${url}`);
    return agent;
  }

  /**
   * Detect capabilities based on agent ID
   */
  private detectCapabilitiesFromId(id: string): string[] {
    const capabilities: string[] = ['chat', 'task-execution'];
    
    if (id.includes('prospyr')) {
      capabilities.push('technical', 'backend', 'deployment', 'system-administration');
    }
    
    if (id.includes('northstar')) {
      capabilities.push('ui-ux', 'frontend', 'design', 'documentation');
    }
    
    if (id.includes('research')) {
      capabilities.push('research', 'analysis', 'summarization');
    }
    
    if (id.includes('monitor')) {
      capabilities.push('monitoring', 'alerts', 'health-checks');
    }
    
    return capabilities;
  }

  /**
   * Test agent connection
   */
  async testAgentConnection(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    try {
      const response = await axios.get(`${agent.url}/health`, {
        timeout: 5000,
        headers: agent.apiKey ? { 'Authorization': `Bearer ${agent.apiKey}` } : {}
      });

      agent.status = response.status === 200 ? 'online' : 'error';
      agent.lastSeen = new Date();
      
      return response.status === 200;
    } catch (error) {
      agent.status = 'error';
      logger.warn(`Agent ${agentId} connection test failed:`, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Send message to agent
   */
  async chat(agentId: string, message: string, brain?: string, context?: Record<string, any>): Promise<AgentResponse> {
    const startTime = Date.now();
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Store message in history
    const agentMessage: AgentMessage = {
      agentId,
      message,
      brain,
      context,
      timestamp: new Date()
    };
    this.messageHistory.push(agentMessage);

    try {
      let response: AgentResponse;
      
      // Check if agent has direct API endpoint
      if (agent.url && await this.testAgentConnection(agentId)) {
        // Use agent's direct API
        response = await this.chatViaAgentAPI(agent, message, brain, context);
      } else {
        // Fallback to LLM router with agent context
        response = await this.chatViaLLMRouter(agent, message, brain, context);
      }

      const latency = Date.now() - startTime;
      response.latency = latency;
      
      logger.info(`Chat with ${agentId}: ${message.substring(0, 50)}... (${latency}ms)`);
      return response;
    } catch (error) {
      logger.error(`Chat with ${agentId} failed:`, error);
      throw error;
    }
  }

  /**
   * Chat via agent's direct API
   */
  private async chatViaAgentAPI(agent: Agent, message: string, brain?: string, context?: Record<string, any>): Promise<AgentResponse> {
    try {
      const response = await axios.post(`${agent.url}/chat`, {
        message,
        brain: brain || this.llmRouter.getActiveBrain(),
        context
      }, {
        headers: agent.apiKey ? { 'Authorization': `Bearer ${agent.apiKey}` } : {},
        timeout: 30000 // 30 second timeout for agent processing
      });

      return {
        agentId: agent.id,
        message: response.data.message || response.data.response || 'No response content',
        brainUsed: response.data.brain || brain || this.llmRouter.getActiveBrain(),
        tokensUsed: response.data.tokensUsed || 0,
        cost: response.data.cost || 0,
        latency: response.data.latency || 0,
        timestamp: new Date()
      };
    } catch (error) {
      logger.warn(`Agent API failed, falling back to LLM router:`, error instanceof Error ? error.message : 'Unknown error');
      return this.chatViaLLMRouter(agent, message, brain, context);
    }
  }

  /**
   * Chat via LLM router (fallback method)
   */
  private async chatViaLLMRouter(agent: Agent, message: string, brain?: string, context?: Record<string, any>): Promise<AgentResponse> {
    // Create prompt with agent context
    const prompt = this.createAgentPrompt(agent, message, context);
    
    // Generate response using LLM router
    const llmResponse = await this.llmRouter.generate(prompt, {
      model: brain ? undefined : this.getAgentPreferredModel(agent.id)
    });

    return {
      agentId: agent.id,
      message: llmResponse.content,
      brainUsed: llmResponse.brain,
      tokensUsed: llmResponse.tokensUsed,
      cost: llmResponse.cost,
      latency: llmResponse.latency,
      timestamp: new Date()
    };
  }

  /**
   * Create prompt with agent context
   */
  private createAgentPrompt(agent: Agent, message: string, context?: Record<string, any>): string {
    const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
    const capabilities = agent.capabilities.join(', ');
    
    return `You are ${agent.name}, an AI assistant with the following capabilities: ${capabilities}.

${contextStr}

User message: ${message}

Respond as ${agent.name}, using your specialized capabilities to provide the best possible response.`;
  }

  /**
   * Get agent's preferred model based on ID
   */
  private getAgentPreferredModel(agentId: string): string {
    const preferences: Record<string, string> = {
      'prospyr': 'deepseek-chat',  // Cost-effective for technical tasks
      'northstar': 'gpt-4-turbo-preview',  // Better for creative/UI tasks
      'research': 'claude-3-opus-20240229',  // Best for long documents
      'general': 'deepseek-chat'  // Default
    };

    return preferences[agentId] || 'deepseek-chat';
  }

  /**
   * Get all agents
   */
  getAgents(): Agent[] {
    return Array.from(this.agents.values()).map(agent => ({ ...agent }));
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): Agent | null {
    const agent = this.agents.get(agentId);
    return agent ? { ...agent } : null;
  }

  /**
   * Get number of registered agents
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Get agent status
   */
  getAgentStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    for (const [id, agent] of this.agents.entries()) {
      status[id] = agent.status;
    }
    return status;
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId: string, status: 'online' | 'offline' | 'error'): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    agent.status = status;
    agent.lastSeen = new Date();
    return true;
  }

  /**
   * Update agent task assignment
   */
  updateAgentTask(agentId: string, taskId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    agent.currentTask = taskId;
    return true;
  }

  /**
   * Remove agent
   */
  removeAgent(agentId: string): boolean {
    const deleted = this.agents.delete(agentId);
    if (deleted) {
      logger.info(`Removed agent: ${agentId}`);
    }
    return deleted;
  }

  /**
   * Get message history for an agent
   */
  getMessageHistory(agentId?: string, limit: number = 50): AgentMessage[] {
    let history = this.messageHistory;
    
    if (agentId) {
      history = history.filter(msg => msg.agentId === agentId);
    }
    
    return history.slice(-limit);
  }

  /**
   * Clear message history
   */
  clearMessageHistory(agentId?: string): void {
    if (agentId) {
      this.messageHistory = this.messageHistory.filter(msg => msg.agentId !== agentId);
    } else {
      this.messageHistory = [];
    }
    
    logger.info(`Cleared message history${agentId ? ` for ${agentId}` : ''}`);
  }

  /**
   * Broadcast message to all agents
   */
  async broadcast(message: string, brain?: string, context?: Record<string, any>): Promise<AgentResponse[]> {
    const responses: AgentResponse[] = [];
    const agents = this.getAgents().filter(agent => agent.status === 'online');

    logger.info(`Broadcasting to ${agents.length} agents: ${message.substring(0, 50)}...`);

    for (const agent of agents) {
      try {
        const response = await this.chat(agent.id, message, brain, context);
        responses.push(response);
      } catch (error) {
        logger.error(`Broadcast to ${agent.id} failed:`, error);
      }
    }

    return responses;
  }

  /**
   * Find agents by capability
   */
  findAgentsByCapability(capability: string): Agent[] {
    return this.getAgents().filter(agent => 
      agent.capabilities.includes(capability) && agent.status === 'online'
    );
  }

  /**
   * Get system summary
   */
  getSystemSummary(): Record<string, any> {
    const agents = this.getAgents();
    const onlineAgents = agents.filter(a => a.status === 'online');
    const offlineAgents = agents.filter(a => a.status === 'offline');
    const errorAgents = agents.filter(a => a.status === 'error');

    return {
      totalAgents: agents.length,
      online: onlineAgents.length,
      offline: offlineAgents.length,
      errors: errorAgents.length,
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        status: a.status,
        capabilities: a.capabilities,
        currentTask: a.currentTask
      })),
      messageHistoryCount: this.messageHistory.length
    };
  }
}