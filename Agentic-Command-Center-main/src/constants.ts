import { Agent, Brain } from './types';

export const AGENTS: Agent[] = [
  {
    id: 'prospyr',
    name: 'Prospyr',
    capabilities: ['technical', 'backend', 'deployment'],
    avatar: '👨‍💻',
    description: 'Technical & Backend Specialist'
  },
  {
    id: 'northstar',
    name: 'Northstar',
    capabilities: ['ui-ux', 'frontend', 'design'],
    avatar: '🎨',
    description: 'UI/UX & Frontend Architect'
  },
];

export const BRAINS: Brain[] = [
  {
    id: 'gemini',
    name: 'Google Gemini Pro',
    provider: 'google',
    needsKey: true,
    costPerMillion: 0.50,
    contextWindow: 32768,
    icon: 'Zap'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    needsKey: true,
    costPerMillion: 0.10,
    contextWindow: 200000,
    icon: 'Cpu'
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    provider: 'openai',
    needsKey: true,
    costPerMillion: 10.00,
    contextWindow: 128000,
    icon: 'Brain'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude 3',
    provider: 'anthropic',
    needsKey: true,
    costPerMillion: 15.00,
    contextWindow: 200000,
    icon: 'Shield'
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    provider: 'ollama',
    needsKey: false,
    costPerMillion: 0.00,
    contextWindow: 4096,
    icon: 'Terminal'
  },
];

export const DEFAULT_OBSIDIAN_CONFIG = {
  ip: '100.118.133.60',
  port: '27123',
  token: '311a609e8ebbc0762dfb17240b0e5229986eccb9141dbcff773c16fd009a1269',
  folder: 'ALBS-Operations/'
};
