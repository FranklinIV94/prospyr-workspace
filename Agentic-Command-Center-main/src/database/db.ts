import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('command_center.db');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    agent_type TEXT NOT NULL, -- 'local' | 'cloud'
    cost_tier TEXT NOT NULL DEFAULT 'free',
    status TEXT DEFAULT 'unknown',
    last_health_check INTEGER,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS agent_models (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    cost_per_1k_input REAL DEFAULT 0,
    cost_per_1k_output REAL DEFAULT 0,
    FOREIGN KEY(agent_id) REFERENCES agents(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    assigned_agent_id TEXT,
    routing_score REAL,
    routing_reason TEXT,
    input_payload TEXT,
    output_payload TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY(assigned_agent_id) REFERENCES agents(id)
  );

  CREATE TABLE IF NOT EXISTS usage_records (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cost_usd REAL DEFAULT 0,
    latency_ms INTEGER,
    recorded_at INTEGER,
    FOREIGN KEY(task_id) REFERENCES tasks(id),
    FOREIGN KEY(agent_id) REFERENCES agents(id)
  );
`);

// Seed Initial Agents if empty
const agentCount = db.prepare('SELECT COUNT(*) as count FROM agents').get() as { count: number };
if (agentCount.count === 0) {
  const insertAgent = db.prepare('INSERT INTO agents (id, name, display_name, endpoint, agent_type, cost_tier) VALUES (?, ?, ?, ?, ?, ?)');
  insertAgent.run('prospyr', 'prospyr', 'Prospyr (Cloud)', 'http://100.101.6.44:18789', 'cloud', 'low');
  insertAgent.run('northstar', 'northstar', 'Northstar (Local)', 'http://100.92.24.43:18789', 'local', 'free');
  
  const insertModel = db.prepare('INSERT INTO agent_models (id, agent_id, model_name, cost_per_1k_input, cost_per_1k_output) VALUES (?, ?, ?, ?, ?)');
  insertModel.run('m1', 'prospyr', 'deepseek-chat', 0.0001, 0.0002);
  insertModel.run('m2', 'northstar', 'llama3.2', 0, 0);
}

export default db;
