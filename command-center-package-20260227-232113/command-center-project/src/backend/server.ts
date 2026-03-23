#!/usr/bin/env node

/**
 * Command Center Backend Server
 * Multi-Agent Collaboration Platform with LLM Brain Switching
 * 
 * Launch Date: 2026-02-25
 * Author: Prospyr (OpenClaw Assistant)
 */

import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { LLMRouter } from './llm-router';
import { AgentManager } from './agent-manager';
import { TaskManager } from './task-manager';
import { ObsidianIntegration } from './obsidian-integration';
import { KeyVault } from './key-vault';
import { logger } from './logger';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://localhost:3001']
      : process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize managers
const llmRouter = new LLMRouter();
const agentManager = new AgentManager();
const taskManager = new TaskManager();
const obsidian = new ObsidianIntegration();
const keyVault = new KeyVault();

// ====================
// API ENDPOINTS
// ====================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    agents: agentManager.getAgentStatus(),
    activeBrain: llmRouter.getActiveBrain(),
    features: {
      obsidian: obsidian.isConnected(),
      multiAgent: agentManager.getAgentCount() > 0,
      taskTracking: taskManager.getTaskCount()
    }
  });
});

/**
 * Switch LLM Brain
 * POST /api/brain/switch
 * Body: { brain: 'deepseek' | 'openai' | 'anthropic' | 'gemini' | 'ollama', apiKey?: string }
 */
app.post('/api/brain/switch', async (req, res) => {
  try {
    const { brain, apiKey } = req.body;
    
    if (!brain) {
      return res.status(400).json({ error: 'Brain type is required' });
    }

    // Validate brain type
    const validBrains = ['deepseek', 'openai', 'anthropic', 'gemini', 'ollama', 'custom'];
    if (!validBrains.includes(brain)) {
      return res.status(400).json({ 
        error: 'Invalid brain type', 
        validBrains 
      });
    }

    // If API key provided, save it securely
    if (apiKey) {
      await keyVault.saveKey(brain, apiKey);
    }

    // Switch the brain
    const success = await llmRouter.switchBrain(brain);
    
    if (success) {
      // Notify all connected clients
      io.emit('brain-switched', { 
        brain, 
        timestamp: new Date().toISOString() 
      });
      
      logger.info(`Brain switched to: ${brain}`);
      
      res.json({ 
        success: true, 
        activeBrain: brain,
        message: `Successfully switched to ${brain} brain`
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to switch brain. Check API key or connection.' 
      });
    }
  } catch (error) {
    logger.error('Brain switch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during brain switch' 
    });
  }
});

/**
 * Get available brains
 * GET /api/brain/list
 */
app.get('/api/brain/list', (req, res) => {
  const brains = [
    { id: 'deepseek', name: 'DeepSeek Chat', needsKey: true, cost: 'Very Low', context: '200K' },
    { id: 'openai', name: 'OpenAI GPT-4', needsKey: true, cost: 'High', context: '128K' },
    { id: 'anthropic', name: 'Anthropic Claude 3', needsKey: true, cost: 'Medium', context: '200K' },
    { id: 'gemini', name: 'Google Gemini Pro', needsKey: true, cost: 'Medium', context: '32K' },
    { id: 'ollama', name: 'Ollama (Local)', needsKey: false, cost: 'Free', context: '4K-32K' },
    { id: 'custom', name: 'Custom Endpoint', needsKey: true, cost: 'Variable', context: 'Variable' }
  ];
  
  res.json({ 
    brains,
    activeBrain: llmRouter.getActiveBrain()
  });
});

/**
 * Chat with an agent
 * POST /api/chat/:agentId
 * Body: { message: string, brain?: string, context?: any }
 */
app.post('/api/chat/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message, brain, context } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Use specified brain or active brain
    const chatBrain = brain || llmRouter.getActiveBrain();
    
    // Send message to agent
    const response = await agentManager.chat(agentId, message, chatBrain, context);
    
    // Broadcast to all connected clients
    io.emit('message', {
      agentId,
      message: response.message,
      brain: chatBrain,
      timestamp: new Date().toISOString()
    });
    
    // Auto-save to Obsidian if enabled
    if (process.env.ENABLE_OBSIDIAN === 'true') {
      try {
        await obsidian.saveConversation(agentId, message, response.message);
      } catch (obsidianError) {
        logger.warn('Failed to save to Obsidian:', obsidianError);
      }
    }
    
    res.json(response);
  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get available agents
 * GET /api/agents
 */
app.get('/api/agents', (req, res) => {
  const agents = agentManager.getAgents();
  res.json({ agents });
});

/**
 * Task management endpoints
 */
app.get('/api/tasks', (req, res) => {
  const tasks = taskManager.getTasks();
  res.json({ tasks });
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = await taskManager.createTask(req.body);
    io.emit('task-created', task);
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:taskId', async (req, res) => {
  try {
    const task = await taskManager.updateTask(req.params.taskId, req.body);
    io.emit('task-updated', task);
    res.json({ success: true, task });
  } catch (error) {
    res.status(404).json({ error: 'Task not found' });
  }
});

/**
 * Obsidian integration endpoints
 */
app.get('/api/obsidian/status', async (req, res) => {
  try {
    const status = await obsidian.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Obsidian connection failed' });
  }
});

app.post('/api/obsidian/save', async (req, res) => {
  try {
    const { title, content } = req.body;
    const result = await obsidian.saveNote(title, content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save to Obsidian' });
  }
});

// ====================
// SOCKET.IO HANDLERS
// ====================

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Send current state to new client
  socket.emit('init', {
    agents: agentManager.getAgents(),
    activeBrain: llmRouter.getActiveBrain(),
    tasks: taskManager.getTasks(),
    obsidianConnected: obsidian.isConnected()
  });
  
  // Handle brain switching via socket
  socket.on('switch-brain', async (data) => {
    try {
      const { brain, apiKey } = data;
      const success = await llmRouter.switchBrain(brain, apiKey);
      
      if (success) {
        io.emit('brain-switched', { brain });
        socket.emit('brain-switch-success', { brain });
      } else {
        socket.emit('brain-switch-error', { error: 'Failed to switch brain' });
      }
    } catch (error) {
      socket.emit('brain-switch-error', { error: error.message });
    }
  });
  
  // Handle chat messages via socket
  socket.on('chat-message', async (data) => {
    try {
      const { agentId, message, brain } = data;
      const response = await agentManager.chat(agentId, message, brain);
      
      socket.emit('chat-response', {
        agentId,
        message: response.message,
        brain: response.brainUsed
      });
      
      // Broadcast to other clients
      socket.broadcast.emit('agent-message', {
        agentId,
        message: response.message,
        from: socket.id
      });
    } catch (error) {
      socket.emit('chat-error', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// ====================
// START SERVER
// ====================

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Command Center Backend running on port ${PORT}`);
  logger.info(`📡 Socket.IO server ready for real-time updates`);
  logger.info(`🤖 Active brain: ${llmRouter.getActiveBrain()}`);
  logger.info(`🔗 Obsidian integration: ${obsidian.isConnected() ? 'Connected' : 'Disabled'}`);
  
  // Initialize with default agents
  agentManager.registerAgent('prospyr', 'Prospyr (OpenClaw)', process.env.PROSPYR_URL);
  agentManager.registerAgent('northstar', 'Northstar (OpenClaw)', process.env.NORTHSTAR_URL);
  
  logger.info(`👥 Registered agents: ${agentManager.getAgentCount()}`);
  
  // Create initial task for tonight's deployment
  if (taskManager.getTaskCount() === 0) {
    taskManager.createTask({
      title: 'Deploy Command Center Tonight',
      description: 'Launch the multi-agent collaboration platform with LLM brain switching',
      status: 'in-progress',
      assignedTo: ['prospyr'],
      tags: ['deployment', 'command-center', 'launch'],
      checklist: [
        { task: 'Set up backend server', completed: true },
        { task: 'Configure LLM router', completed: true },
        { task: 'Connect to Prospyr agent', completed: false },
        { task: 'Connect to Northstar agent', completed: false },
        { task: 'Test brain switching', completed: false },
        { task: 'Launch desktop application', completed: false }
      ]
    });
    
    logger.info('📋 Created initial deployment task');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app, io };