import { LucideIcon } from 'lucide-react';

export type AgentId = 'prospyr' | 'northstar';

export interface Agent {
  id: AgentId;
  name: string;
  capabilities: string[];
  avatar: string;
  description: string;
  status?: 'idle' | 'busy' | 'offline';
  lastActive?: number;
}

export type Provider = 'google' | 'deepseek' | 'openai' | 'anthropic' | 'ollama';

export interface Brain {
  id: string;
  name: string;
  provider: Provider;
  needsKey: boolean;
  costPerMillion: number;
  contextWindow: number;
  icon: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  agentId: AgentId;
  brainId: string;
  tokens?: number;
  cost?: number;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: AgentId | 'user';
  dueDate?: string;
  progress: number;
  createdAt: number;
}

export interface AppState {
  activeAgentId: AgentId;
  activeBrainId: string;
  apiKeys: Record<Provider, string>;
  totalCost: number;
  obsidianConfig: {
    ip: string;
    port: string;
    token: string;
    folder: string;
  };
}
