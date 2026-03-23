'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Sidebar from '@/components/Sidebar'
import { Bot, MessageSquare, Activity, Send, Plus, Circle } from 'lucide-react'

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())

const API = process.env.NEXT_PUBLIC_PAPERCLIP_API || 'http://localhost:3100'
const K = process.env.NEXT_PUBLIC_PAPERCLIP_KEY || ''

type Tab = 'agents' | 'chat' | 'runs'

interface Agent {
  id: string
  name: string
  status?: string
  role?: string
  lastSeen?: string
  currentTask?: string
}

interface Message {
  id: string
  agentId: string
  agentName: string
  text: string
  timestamp: string
  isAssignment?: boolean
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('agents')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [message, setMessage] = useState('')
  const [agentMessages, setAgentMessages] = useState<Record<string, Message[]>>({})

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const { data: agentsData } = useSWR(
    status === 'authenticated' ? [`${API}/api/agents`, K] : null,
    fetcher, { refreshInterval: 5000 }
  )
  const { data: runsData } = useSWR(
    status === 'authenticated' ? [`${API}/api/runs?limit=20`, K] : null,
    fetcher, { refreshInterval: 10000 }
  )

  const agents: Agent[] = agentsData?.data || agentsData || []
  const runs = runsData?.data || runsData || []

  const sendMessage = () => {
    if (!message.trim() || !selectedAgent) return
    const msg: Message = {
      id: Date.now().toString(),
      agentId: selectedAgent.id,
      agentName: 'You',
      text: message,
      timestamp: new Date().toISOString()
    }
    setAgentMessages(prev => ({
      ...prev,
      [selectedAgent.id]: [...(prev[selectedAgent.id] || []), msg]
    }))
    setMessage('')
  }

  const assignTask = (agent: Agent) => {
    const task = (window as any).__prompt?.('Enter task description:')
    if (!task?.trim()) return
    const msg: Message = {
      id: Date.now().toString(),
      agentId: agent.id,
      agentName: 'You',
      text: `[TASK ASSIGNED] ${task}`,
      timestamp: new Date().toISOString(),
      isAssignment: true
    }
    setAgentMessages(prev => ({
      ...prev,
      [agent.id]: [...(prev[agent.id] || []), msg]
    }))
    setSelectedAgent(agent)
    setActiveTab('chat')
  }

  const getStatusClass = (s?: string) => {
    switch (s?.toLowerCase()) {
      case 'online': case 'idle': case 'ready': return 'status-online'
      case 'busy': case 'working': case 'running': return 'status-busy'
      default: return 'status-offline'
    }
  }

  const getStatusDot = (s?: string) => {
    switch (s?.toLowerCase()) {
      case 'online': case 'idle': case 'ready': return 'bg-emerald-400'
      case 'busy': case 'working': case 'running': return 'bg-yellow-400'
      default: return 'bg-gray-500'
    }
  }

  const formatTime = (ts?: string) => {
    if (!ts) return 'Unknown'
    const d = new Date(ts)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString()
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      <Sidebar />

      <main id="main-content" className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                Agent Control
              </h1>
              <p className="text-[var(--text-muted)] mt-1">Manage and delegate to your AI agents</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass-card px-4 py-2 flex items-center gap-2 rounded-lg">
                <Circle size={8} className="text-emerald-400 fill-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-400">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="glass-card p-1 inline-flex gap-1">
            {([
              { id: 'agents' as Tab, icon: Bot, label: 'Agents' },
              { id: 'chat' as Tab, icon: MessageSquare, label: 'Command Center' },
              { id: 'runs' as Tab, icon: Activity, label: 'Activity Log' },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-selected={activeTab === tab.id}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'accent-gradient text-white shadow-lg'
                    : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="max-w-7xl mx-auto">
            {agents.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center mx-auto mb-6">
                  <Bot size={36} className="text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Agents Connected</h3>
                <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
                  Complete Paperclip onboarding to see your agents here. They&apos;ll appear with status, role, and current task.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {agents.map(agent => (
                  <div key={agent.id} className="glass-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(agent.status)}`} />
                          <h3 className="font-semibold text-lg text-white">{agent.name}</h3>
                        </div>
                        {agent.role && <p className="text-xs text-violet-400 ml-4">{agent.role}</p>}
                        <p className="text-xs text-[var(--text-muted)] font-mono mt-1 ml-4">{agent.id.slice(0, 12)}...</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(agent.status)}`}>
                        {agent.status || 'offline'}
                      </span>
                    </div>

                    {agent.currentTask && (
                      <div className="mb-3 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <p className="text-xs text-violet-300 mb-0.5">Working on:</p>
                        <p className="text-sm text-white">{agent.currentTask}</p>
                      </div>
                    )}

                    {agent.lastSeen && (
                      <p className="text-xs text-[var(--text-muted)] mb-3">Last active: {formatTime(agent.lastSeen)}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedAgent(agent); setActiveTab('chat') }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white"
                      >
                        <MessageSquare size={14} />
                        Chat
                      </button>
                      <button
                        onClick={() => assignTask(agent)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-all"
                      >
                        <Plus size={14} />
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agent List */}
              <div className="glass-card p-4">
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">Select Agent</h3>
                <div className="space-y-2">
                  {agents.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedAgent?.id === agent.id
                          ? 'bg-violet-600/20 border border-violet-500/30'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusDot(agent.status)}`} />
                          <span className="font-medium text-sm text-white">{agent.name}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 ml-4">{agent.role || agent.status || 'offline'}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2 glass-card p-5">
                {selectedAgent ? (
                  <>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                      <div>
                        <h3 className="font-semibold text-white">{selectedAgent.name}</h3>
                        <p className="text-xs text-[var(--text-muted)]">{selectedAgent.role || selectedAgent.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(selectedAgent.status)}`} />
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(selectedAgent.status)}`}>
                          {selectedAgent.status || 'offline'}
                        </span>
                      </div>
                    </div>

                    <div className="h-80 overflow-y-auto scrollbar-thin mb-4 space-y-3">
                      {(agentMessages[selectedAgent.id] || []).length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                          <div className="text-center">
                            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Send a message or assign a task</p>
                          </div>
                        </div>
                      ) : (
                        (agentMessages[selectedAgent.id] || []).map(msg => (
                          <div key={msg.id} className={`p-3 rounded-lg ${msg.isAssignment ? 'bg-violet-600/20 border border-violet-500/30' : 'bg-white/5'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-violet-400">{msg.agentName}</span>
                              <span className="text-xs text-[var(--text-muted)]">{formatTime(msg.timestamp)}</span>
                            </div>
                            <p className="text-sm text-white">{msg.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder={`Message ${selectedAgent.name}...`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-violet-500/50 transition-all"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium accent-gradient disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        <Send size={14} />
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center text-[var(--text-muted)]">
                    <div className="text-center">
                      <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
                      <p>Select an agent to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACTIVITY LOG TAB */}
        {activeTab === 'runs' && (
          <div className="max-w-7xl mx-auto">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Recent Agent Runs</h3>
              {runs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={32} className="mx-auto mb-2 text-[var(--text-muted)] opacity-50" />
                  <p className="text-sm text-[var(--text-muted)]">No runs recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {runs.map((run: any) => (
                    <div key={run.id} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm text-white">{run.id.slice(0, 16)}...</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {run.agentName || 'Unknown Agent'} &bull; {formatTime(run.createdAt)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          run.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          run.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {run.status || 'running'}
                        </span>
                      </div>
                      {run.input && (
                        <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2">
                          {typeof run.input === 'string' ? run.input : JSON.stringify(run.input).slice(0, 150)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
