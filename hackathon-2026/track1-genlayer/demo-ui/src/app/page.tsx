"use client";

import { useState } from "react";
import { Shield, Zap, Bot, ChevronRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  action?: {
    status: "pending" | "executed" | "rejected";
    protocol?: string;
    yield_?: string;
    confidence?: number;
    source?: string;
    provenance?: boolean;
    actionId?: string;
    reason?: string;
  };
}

interface AuditEntry {
  id: string;
  protocol: string;
  yield: string;
  source: string;
  confidence: number;
  executed: boolean;
  timestamp: Date;
}

// Mock yield data for demo
const MOCK_YIELDS = [
  { protocol: "Aave V3", yield: "4.2%", source: "coingecko", confidence: 95 },
  { protocol: "Compound", yield: "3.8%", source: "coingecko", confidence: 92 },
  { protocol: "Curve stETH", yield: "5.1%", source: "defillama", confidence: 88 },
  { protocol: "Lido stETH", yield: "4.7%", source: "defillama", confidence: 91 },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Welcome to Trustless DeFi Commander. I understand natural language commands and execute them securely on Base via GenLayer.\n\nTry: *\"Move my USDC to the highest yielding stablecoin pool\"*",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [wallet] = useState("0x742d...8f2a");
  const [balance] = useState("10,000 USDC");
  const [auditLog] = useState<AuditEntry[]>([
    { id: "1", protocol: "Curve 3pool", yield: "4.5%", source: "coingecko", confidence: 94, executed: true, timestamp: new Date(Date.now() - 3600000) },
    { id: "2", protocol: "Aave V3", yield: "4.2%", source: "coingecko", confidence: 95, executed: true, timestamp: new Date(Date.now() - 7200000) },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    // Determine best yield for demo
    const bestYield = MOCK_YIELDS.reduce((a, b) =>
      parseFloat(a.yield) > parseFloat(b.yield) ? a : b
    );

    // Simulate agent response based on command
    const agentMessage: Message = {
      id: `agent-${Date.now()}`,
      role: "agent",
      content: input.toLowerCase().includes("highest")
        ? `I've analyzed the yield data. The best opportunity is **${bestYield.protocol}** at **${bestYield.yield}% APY**.\n\nProvenance verified: Source ${bestYield.source} (${bestYield.confidence}% confidence)\n\nAction ready for confirmation.`
        : `I can help with that. Supported actions: swap, move, transfer, deposit, withdraw.\n\nExample: *"Move my USDC to the highest yielding stablecoin pool"*`,
      timestamp: new Date(),
      action: input.toLowerCase().includes("highest")
        ? {
            status: "pending",
            protocol: bestYield.protocol,
            yield_: bestYield.yield,
            confidence: bestYield.confidence,
            source: bestYield.source,
            provenance: true,
            actionId: `TX-${Date.now().toString(36).toUpperCase()}`,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage, agentMessage]);
    setInput("");
  };

  const handleConfirm = (actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.action?.actionId === actionId
          ? {
              ...msg,
              action: {
                ...msg.action!,
                status: "executed",
              },
              content: msg.content + "\n\n✅ **Transaction executed.** Settlement recorded on Base with full provenance audit trail.",
            }
          : msg
      )
    );
  };

  const handleReject = (actionId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.action?.actionId === actionId
          ? {
              ...msg,
              action: {
                ...msg.action!,
                status: "rejected",
                reason: "Rejected by user",
              },
              content: msg.content + "\n\n❌ **Action rejected.**",
            }
          : msg
      )
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/10 bg-black/20 p-4 flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">DeFi Commander</h2>
            <p className="text-xs text-gray-400">GenLayer + Base</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
          <p className="font-mono text-sm text-white">{wallet}</p>
          <p className="text-sm text-emerald-400 mt-1">{balance}</p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-gray-400">Provenance Verified</span>
        </div>

        <div className="flex-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Audit Trail</h3>
          <div className="space-y-2">
            {auditLog.map((entry) => (
              <div key={entry.id} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white">{entry.protocol}</span>
                  {entry.executed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400">{entry.yield}</span>
                  <span className="text-xs text-gray-500">·</span>
                  <span className="text-xs text-gray-400">{entry.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-purple-400" />
            <div>
              <h1 className="font-semibold text-white">Trustless DeFi Agent</h1>
              <p className="text-xs text-gray-400">NLP → GenLayer → Base Settlement</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Testnet Mode
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xl ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-agent"} rounded-2xl px-4 py-3`}
              >
                <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>

                {msg.action && (
                  <div className="mt-4 bg-black/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-300">Action Details</span>
                      {msg.action.status === "pending" && (
                        <span className="flex items-center gap-1 text-xs text-yellow-400">
                          <AlertCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {msg.action.status === "executed" && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Executed
                        </span>
                      )}
                      {msg.action.status === "rejected" && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </div>

                    {msg.action.protocol && (
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <span className="text-gray-400">Protocol</span>
                          <p className="text-white font-medium">{msg.action.protocol}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Yield</span>
                          <p className="text-emerald-400 font-medium">{msg.action.yield_}</p>
                        </div>
                      </div>
                    )}

                    {msg.action.confidence && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">Intent Confidence</span>
                          <span className="text-white">{msg.action.confidence}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="confidence-bar"
                            style={{ width: `${msg.action.confidence}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {msg.action.source && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-400">Source:</span>
                        <span className="provenance-badge">{msg.action.source}</span>
                        {msg.action.provenance && (
                          <span className="provenance-badge">✓ Provenance</span>
                        )}
                      </div>
                    )}

                    {msg.action.actionId && (
                      <p className="text-xs text-gray-500 font-mono mb-3">
                        {msg.action.actionId}
                      </p>
                    )}

                    {msg.action.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleConfirm(msg.action!.actionId!)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Confirm
                        </button>
                        <button
                          onClick={() => handleReject(msg.action!.actionId!)}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-white/40 mt-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Try: Move my USDC to the highest yielding pool"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
