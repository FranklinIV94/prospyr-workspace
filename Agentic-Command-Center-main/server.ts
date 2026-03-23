import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import db from "./src/database/db.ts";
import { routerEngine } from "./src/services/routerEngine.ts";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  app.use(express.json());

  // --- WebSocket Logic ---
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC LIMIT 50").all();
    const agents = db.prepare("SELECT * FROM agents").all();
    ws.send(JSON.stringify({ type: "INIT", payload: { tasks, agents } }));

    ws.on("close", () => clients.delete(ws));
  });

  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(message);
    });
  };

  // --- Background Health Checker ---
  setInterval(async () => {
    const agents = db.prepare("SELECT * FROM agents").all() as any[];
    for (const agent of agents) {
      try {
        // Mocking health check ping
        const status = Math.random() > 0.1 ? 'healthy' : 'degraded';
        db.prepare("UPDATE agents SET status = ?, last_health_check = ? WHERE id = ?")
          .run(status, Date.now(), agent.id);
      } catch (err) {
        db.prepare("UPDATE agents SET status = ?, last_health_check = ? WHERE id = ?")
          .run('offline', Date.now(), agent.id);
      }
    }
    const updatedAgents = db.prepare("SELECT * FROM agents").all();
    broadcast({ type: "AGENTS_UPDATED", payload: updatedAgents });
  }, 15000);

  // --- API v1 Routes ---

  app.get("/api/v1/agents", (req, res) => {
    const agents = db.prepare("SELECT * FROM agents").all();
    res.json(agents);
  });

  app.get("/api/v1/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
    res.json(tasks);
  });

  app.post("/api/v1/tasks", (req, res) => {
    const { title, description, task_type, priority } = req.body;
    const id = uuidv4();
    const now = Date.now();
    
    // Intelligent Routing
    const scoredAgents = routerEngine.scoreAgents(task_type || 'general', priority || 3);
    const bestMatch = scoredAgents[0];

    db.prepare(`
      INSERT INTO tasks (id, title, description, task_type, status, assigned_agent_id, routing_score, routing_reason, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description || "", task_type || "general", "pending", bestMatch?.agentId || null, bestMatch?.score || 0, bestMatch?.reason || "", now, now);
    
    const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    broadcast({ type: "TASK_CREATED", payload: newTask });
    res.status(201).json(newTask);
  });

  app.get("/api/v1/stats/usage", (req, res) => {
    const stats = db.prepare(`
      SELECT agent_id, model_name, SUM(cost_usd) as total_cost, SUM(input_tokens + output_tokens) as total_tokens 
      FROM usage_records GROUP BY agent_id, model_name
    `).all();
    res.json(stats);
  });

  app.get("/api/v1/dashboard/summary", (req, res) => {
    const activeAgents = db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'healthy'").get() as any;
    const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").get() as any;
    const totalCost = db.prepare("SELECT SUM(cost_usd) as total FROM usage_records").get() as any;
    
    res.json({
      activeAgents: activeAgents.count,
      pendingTasks: pendingTasks.count,
      totalCost: totalCost.total || 0
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => res.sendFile(path.resolve("dist/index.html")));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Command Center v1 running on http://localhost:${PORT}`);
  });
}

startServer();
