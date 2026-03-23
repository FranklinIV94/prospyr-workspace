import db from '../database/db';

export interface ScoredAgent {
  agentId: string;
  score: number;
  reason: string;
}

export class RouterEngine {
  private static instance: RouterEngine;

  private constructor() {}

  static getInstance() {
    if (!RouterEngine.instance) {
      RouterEngine.instance = new RouterEngine();
    }
    return RouterEngine.instance;
  }

  scoreAgents(taskType: string, priority: number): ScoredAgent[] {
    const agents = db.prepare("SELECT * FROM agents WHERE is_active = 1").all() as any[];
    const scored: ScoredAgent[] = [];

    for (const agent of agents) {
      let score = 0;
      let reasons: string[] = [];

      // 1. Capability Score (Mocked for now based on agent name)
      if (taskType === 'design' && agent.name === 'northstar') {
        score += 4;
        reasons.push("High design proficiency");
      } else if (taskType === 'backend' && agent.name === 'prospyr') {
        score += 4;
        reasons.push("High backend proficiency");
      } else {
        score += 2;
        reasons.push("General proficiency");
      }

      // 2. Cost Score
      const costScores: Record<string, number> = { 'free': 5, 'low': 3, 'medium': 1, 'high': 0 };
      const costScore = costScores[agent.cost_tier] || 0;
      score += costScore;
      reasons.push(`Cost tier: ${agent.cost_tier} (+${costScore})`);

      // 3. Availability Score
      const availScore = agent.status === 'healthy' ? 3 : (agent.status === 'degraded' ? 1 : 0);
      score += availScore;
      reasons.push(`Health: ${agent.status} (+${availScore})`);

      scored.push({
        agentId: agent.id,
        score,
        reason: reasons.join(", ")
      });
    }

    return scored.sort((a, b) => b.score - a.score);
  }
}

export const routerEngine = RouterEngine.getInstance();
