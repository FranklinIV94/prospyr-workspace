import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Terminal, 
  Cpu, 
  Brain as BrainIcon, 
  Shield, 
  Zap, 
  Send, 
  Paperclip, 
  Plus, 
  Settings as SettingsIcon,
  LayoutDashboard,
  MessageSquare,
  CheckCircle2,
  Clock,
  ChevronDown,
  Search,
  Save,
  Trash2,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { AGENTS, BRAINS, DEFAULT_OBSIDIAN_CONFIG } from './constants';
import { Agent, Brain, Message, Task, AppState, AgentId, TaskStatus } from './types';
import { aiService } from './services/aiService';
import { obsidianService } from './services/obsidianService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'settings' | 'monitoring'>('chat');
  const [activeAgentId, setActiveAgentId] = useState<AgentId>('prospyr');
  const [activeBrainId, setActiveBrainId] = useState<string>('gemini');
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    google: '',
    deepseek: '',
    openai: '',
    anthropic: '',
    ollama: ''
  });
  const [totalCost, setTotalCost] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<any[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // --- Effects ---
  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [tasksRes, agentsRes, summaryRes] = await Promise.all([
          fetch('/api/v1/tasks'),
          fetch('/api/v1/agents'),
          fetch('/api/v1/dashboard/summary')
        ]);
        const tasksData = await tasksRes.json();
        const agentsData = await agentsRes.json();
        const summaryData = await summaryRes.json();
        
        setTasks(tasksData);
        if (agentsData.length > 0) setAgents(agentsData);
        setTotalCost(summaryData.totalCost);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };

    fetchData();

    // Setup WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'INIT':
          setTasks(data.payload.tasks);
          setAgents(data.payload.agents);
          break;
        case 'AGENTS_UPDATED':
          setAgents(data.payload);
          break;
        case 'TASK_CREATED':
          setTasks(prev => [data.payload, ...prev]);
          break;
        case 'TASK_UPDATED':
          setTasks(prev => prev.map(t => t.id === data.payload.id ? data.payload : t));
          if (data.payload.status === 'done') {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#141414', '#E4E3E0', '#10b981']
            });
          }
          break;
      }
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Handlers ---
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      agentId: activeAgentId,
      brainId: activeBrainId,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const activeAgent = agents.find(a => a.id === activeAgentId)!;
      const activeBrain = BRAINS.find(b => b.id === activeBrainId)!;
      
      const systemPrompt = `You are ${activeAgent.name}, a ${activeAgent.description || 'Specialist'}. 
      Your capabilities include: ${activeAgent.capabilities.join(', ')}.
      Always respond in a professional, technical, and helpful manner. 
      Use Markdown for formatting.`;

      const responseText = await aiService.generateResponse(
        input, 
        activeBrainId, 
        apiKeys[activeBrain.provider],
        systemPrompt
      );

      const cost = (100 / 1000000) * activeBrain.costPerMillion;
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        agentId: activeAgentId,
        brainId: activeBrainId,
        tokens: 100,
        cost: cost
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Log usage to backend (Mocked for now as we use usage_records table)
      // Refresh stats
      const summaryRes = await fetch('/api/v1/dashboard/summary');
      const summaryData = await summaryRes.json();
      setTotalCost(summaryData.totalCost);
      
      const statsRes = await fetch('/api/v1/stats/usage');
      const statsData = await statsRes.json();
      setStats(statsData);
      
      // Auto-save to Obsidian
      const fileName = `ALBS-Operations/Chat-${activeAgentId}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.md`;
      await obsidianService.saveNote(fileName, `## Chat with ${activeAgent.name}\n\n**User:** ${input}\n\n**${activeAgent.name}:** ${responseText}`, DEFAULT_OBSIDIAN_CONFIG);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const addTask = async (title: string, taskType: string) => {
    try {
      await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, task_type: taskType, priority: 3 })
      });
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/v1/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  // --- Components ---
  const BrainIconComponent = ({ id, className }: { id: string, className?: string }) => {
    switch (id) {
      case 'gemini': return <Zap className={className} />;
      case 'deepseek': return <Cpu className={className} />;
      case 'openai': return <BrainIcon className={className} />;
      case 'anthropic': return <Shield className={className} />;
      default: return <Terminal className={className} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden">
      {/* --- Desktop Sidebar (Left: Agents & Brains) --- */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#141414] bg-[#E4E3E0] z-20">
        <div className="p-6 border-bottom border-[#141414]">
          <h1 className="font-serif italic text-2xl tracking-tight">Command Center</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Mission Critical AI</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          {/* Agents Section */}
          <div>
            <h2 className="text-[11px] font-serif italic uppercase tracking-wider opacity-50 mb-4 px-2">Agents</h2>
            <div className="space-y-1">
              {AGENTS.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentId(agent.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    activeAgentId === agent.id 
                      ? "bg-[#141414] text-[#E4E3E0]" 
                      : "hover:bg-[#141414]/5"
                  )}
                >
                  <span className="text-xl">{agent.avatar}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className={cn("text-[10px] opacity-60", activeAgentId === agent.id && "opacity-80")}>
                      {agent.capabilities[0]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Brain Section */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[11px] font-serif italic uppercase tracking-wider opacity-50">Brain</h2>
              <span className="text-[10px] font-mono bg-[#141414]/10 px-1.5 py-0.5 rounded">
                ${totalCost.toFixed(4)}
              </span>
            </div>
            <div className="space-y-1">
              {BRAINS.map(brain => (
                <button
                  key={brain.id}
                  onClick={() => setActiveBrainId(brain.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    activeBrainId === brain.id 
                      ? "bg-[#141414] text-[#E4E3E0]" 
                      : "hover:bg-[#141414]/5"
                  )}
                >
                  <BrainIconComponent id={brain.id} className="w-4 h-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{brain.name}</p>
                    <p className={cn("text-[10px] opacity-60", activeBrainId === brain.id && "opacity-80")}>
                      ${brain.costPerMillion}/1M
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-[#141414]">
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#141414]/5 transition-all",
              activeTab === 'settings' && "bg-[#141414] text-[#E4E3E0]"
            )}
          >
            <SettingsIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 border-b border-[#141414] flex items-center justify-between px-6 bg-[#E4E3E0]/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-medium text-sm">
                {activeTab === 'chat' ? `Chatting with ${AGENTS.find(a => a.id === activeAgentId)?.name}` : 
                 activeTab === 'tasks' ? 'Project Dashboard' : 'System Configuration'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('chat')}
              title="Chat"
              className={cn("p-2 rounded-lg transition-all", activeTab === 'chat' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5")}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              title="Tasks"
              className={cn("p-2 rounded-lg transition-all", activeTab === 'tasks' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5")}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveTab('monitoring')}
              title="Monitoring"
              className={cn("p-2 rounded-lg transition-all", activeTab === 'monitoring' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-[#141414]/5")}
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center max-w-sm mx-auto">
                    <Terminal className="w-12 h-12 mb-4" />
                    <p className="font-serif italic text-lg">Awaiting instructions...</p>
                    <p className="text-xs mt-2">Select an agent and a brain to begin operations.</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-3xl",
                      msg.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                        {msg.role === 'user' ? 'Operator' : AGENTS.find(a => a.id === msg.agentId)?.name}
                      </span>
                      <span className="text-[10px] opacity-30">•</span>
                      <span className="text-[10px] font-mono opacity-30">{format(msg.timestamp, 'HH:mm:ss')}</span>
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-[#141414] text-[#E4E3E0] rounded-tr-none" 
                        : "bg-white border border-[#141414]/10 rounded-tl-none shadow-sm"
                    )}>
                      <div className="markdown-body">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>
                    {msg.cost !== undefined && (
                      <span className="text-[9px] font-mono opacity-30 mt-1">
                        Cost: ${msg.cost.toFixed(6)} via {BRAINS.find(b => b.id === msg.brainId)?.name}
                      </span>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex flex-col items-start max-w-3xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                        {AGENTS.find(a => a.id === activeAgentId)?.name}
                      </span>
                    </div>
                    <div className="bg-white border border-[#141414]/10 p-4 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-[#141414]/20 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-[#141414]/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-[#141414]/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-[#141414] bg-[#E4E3E0]">
                <div className="max-w-4xl mx-auto relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Message ${AGENTS.find(a => a.id === activeAgentId)?.name}...`}
                    className="w-full bg-white border border-[#141414] rounded-2xl p-4 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10 resize-none min-h-[60px] max-h-[200px]"
                    rows={1}
                  />
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button className="p-2 hover:bg-[#141414]/5 rounded-lg transition-all opacity-40 hover:opacity-100">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isTyping}
                      className="p-2 bg-[#141414] text-[#E4E3E0] rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-center mt-3 opacity-30 font-mono">
                  ACTIVE BRAIN: {BRAINS.find(b => b.id === activeBrainId)?.name.toUpperCase()} • {AGENTS.find(a => a.id === activeAgentId)?.name.toUpperCase()} AGENT
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="flex-1 overflow-x-auto p-6">
              <div className="flex gap-6 h-full min-w-[900px]">
                {(['todo', 'in-progress', 'done'] as TaskStatus[]).map((status) => (
                  <div key={status} className="flex-1 flex flex-col bg-[#141414]/5 rounded-2xl border border-[#141414]/10">
                    <div className="p-4 border-b border-[#141414]/10 flex items-center justify-between">
                      <h3 className="text-[11px] font-serif italic uppercase tracking-widest opacity-60">
                        {status.replace('-', ' ')}
                      </h3>
                      <span className="text-[10px] bg-[#141414]/10 px-2 py-0.5 rounded-full">
                        {tasks.filter(t => t.status === status).length}
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      {tasks.filter(t => t.status === status).map((task) => (
                        <motion.div
                          layoutId={task.id}
                          key={task.id}
                          className="bg-white p-4 rounded-xl border border-[#141414]/10 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium">{task.title}</h4>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => updateTaskStatus(task.id, status === 'todo' ? 'in-progress' : 'done')} className="p-1 hover:bg-[#141414]/5 rounded">
                                <CheckCircle2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs opacity-60 mb-4 line-clamp-2">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{AGENTS.find(a => a.id === task.assignedTo)?.avatar || '👤'}</span>
                              <span className="text-[10px] font-mono opacity-40">{task.assignedTo}</span>
                            </div>
                            {task.progress > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1 bg-[#141414]/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#141414]" style={{ width: `${task.progress}%` }} />
                                </div>
                                <span className="text-[9px] font-mono">{task.progress}%</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      <button 
                        onClick={() => addTask('New Task', 'user')}
                        className="w-full py-3 border border-dashed border-[#141414]/20 rounded-xl text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-[#141414]/5 transition-all"
                      >
                        + Add Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-white rounded-2xl border border-[#141414]/10 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Total Fleet Cost</p>
                  <p className="text-3xl font-serif italic">${totalCost.toFixed(4)}</p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-[#141414]/10 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Active Agents</p>
                  <p className="text-3xl font-serif italic">{agents.length}</p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-[#141414]/10 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Pending Tasks</p>
                  <p className="text-3xl font-serif italic">{tasks.filter(t => t.status !== 'done').length}</p>
                </div>
              </div>

              <section className="mb-12">
                <h3 className="font-serif italic text-2xl mb-6">Usage Analytics</h3>
                <div className="bg-white rounded-2xl border border-[#141414]/10 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#141414]/5 border-b border-[#141414]/10">
                      <tr>
                        <th className="px-6 py-4 font-serif italic">Brain</th>
                        <th className="px-6 py-4 font-serif italic">Total Tokens</th>
                        <th className="px-6 py-4 font-serif italic">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141414]/10">
                      {stats.map((s: any) => (
                        <tr key={s.brain_id}>
                          <td className="px-6 py-4 font-medium">{BRAINS.find(b => b.id === s.brain_id)?.name}</td>
                          <td className="px-6 py-4 font-mono">{s.total_tokens.toLocaleString()}</td>
                          <td className="px-6 py-4 font-mono">${s.total_cost.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-serif italic text-2xl mb-6">Agent Fleet Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agents.map(agent => (
                    <div key={agent.id} className="p-6 bg-white rounded-2xl border border-[#141414]/10 shadow-sm flex items-center gap-4">
                      <span className="text-4xl">{agent.avatar}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{agent.name}</h4>
                          <span className={cn(
                            "text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full",
                            agent.status === 'idle' ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                          )}>
                            {agent.status}
                          </span>
                        </div>
                        <p className="text-xs opacity-50">{agent.capabilities.join(' • ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
              <div className="space-y-12">
                <section>
                  <h3 className="font-serif italic text-2xl mb-6">Brain Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {BRAINS.filter(b => b.needsKey).map(brain => (
                      <div key={brain.id} className="p-6 bg-white rounded-2xl border border-[#141414]/10 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <BrainIconComponent id={brain.id} className="w-5 h-5" />
                          <h4 className="font-medium">{brain.name}</h4>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest opacity-50">API Key</label>
                          <input 
                            type="password"
                            value={apiKeys[brain.provider]}
                            onChange={(e) => setApiKeys(prev => ({ ...prev, [brain.provider]: e.target.value }))}
                            placeholder="Enter key..."
                            className="w-full bg-[#141414]/5 border border-[#141414]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-serif italic text-2xl mb-6">Obsidian Integration</h3>
                  <div className="p-6 bg-white rounded-2xl border border-[#141414]/10 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest opacity-50">Vault IP Address</label>
                        <input 
                          type="text"
                          defaultValue={DEFAULT_OBSIDIAN_CONFIG.ip}
                          className="w-full bg-[#141414]/5 border border-[#141414]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest opacity-50">Port</label>
                        <input 
                          type="text"
                          defaultValue={DEFAULT_OBSIDIAN_CONFIG.port}
                          className="w-full bg-[#141414]/5 border border-[#141414]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-50">Auth Token</label>
                      <input 
                        type="password"
                        defaultValue={DEFAULT_OBSIDIAN_CONFIG.token}
                        className="w-full bg-[#141414]/5 border border-[#141414]/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2 bg-[#141414] text-[#E4E3E0] rounded-xl hover:scale-105 transition-all text-sm">
                      <Save className="w-4 h-4" />
                      Save Configuration
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- Right Sidebar (Tasks Preview - Desktop Only) --- */}
      {activeTab === 'chat' && (
        <aside className="hidden xl:flex flex-col w-80 border-l border-[#141414] bg-[#E4E3E0]">
          <div className="p-6 border-b border-[#141414]">
            <h3 className="text-[11px] font-serif italic uppercase tracking-widest opacity-50">Active Operations</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {tasks.filter(t => t.status !== 'done').map(task => (
              <div key={task.id} className="p-4 bg-white rounded-xl border border-[#141414]/10 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded",
                    task.status === 'todo' ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  )}>
                    {task.status}
                  </span>
                  <span className="text-[10px] font-mono opacity-30">{format(task.createdAt, 'MMM d')}</span>
                </div>
                <h4 className="text-xs font-medium mb-1">{task.title}</h4>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1 bg-[#141414]/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#141414]" style={{ width: `${task.progress}%` }} />
                  </div>
                  <span className="text-[9px] font-mono opacity-50">{task.progress}%</span>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setActiveTab('tasks')}
              className="w-full py-4 border border-dashed border-[#141414]/20 rounded-xl text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-[#141414]/5 transition-all"
            >
              View All Tasks
            </button>
          </div>
        </aside>
      )}

      {/* --- Mobile Menu Overlay --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-50 bg-[#E4E3E0] md:hidden flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-[#141414]">
              <h1 className="font-serif italic text-2xl">Command Center</h1>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Mobile nav content (similar to desktop sidebar) */}
              <div>
                <h2 className="text-[11px] font-serif italic uppercase tracking-wider opacity-50 mb-4">Agents</h2>
                <div className="grid grid-cols-2 gap-2">
                  {AGENTS.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => { setActiveAgentId(agent.id); setIsMobileMenuOpen(false); }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border border-[#141414]/10",
                        activeAgentId === agent.id ? "bg-[#141414] text-[#E4E3E0]" : "bg-white"
                      )}
                    >
                      <span className="text-3xl">{agent.avatar}</span>
                      <span className="text-xs font-medium">{agent.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-[11px] font-serif italic uppercase tracking-wider opacity-50 mb-4">Brains</h2>
                <div className="space-y-2">
                  {BRAINS.map(brain => (
                    <button
                      key={brain.id}
                      onClick={() => { setActiveBrainId(brain.id); setIsMobileMenuOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#141414]/10",
                        activeBrainId === brain.id ? "bg-[#141414] text-[#E4E3E0]" : "bg-white"
                      )}
                    >
                      <BrainIconComponent id={brain.id} className="w-4 h-4" />
                      <span className="text-sm font-medium">{brain.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
