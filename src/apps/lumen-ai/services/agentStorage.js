// Agent Configuration & Limits Service for Lumen AI
const STORAGE_KEY_AGENTS = 'lumen_trust_agents_v2';

export const DEFAULT_AGENTS = [];

class AgentStorageService {
  constructor() {
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(event, data) {
    this.subscribers.forEach((cb) => {
      try {
        cb(event, data);
      } catch (err) {
        console.error('AgentStorage subscriber error:', err);
      }
    });
  }

  getAgents() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AGENTS);
      if (!data) {
        this.saveAgents(DEFAULT_AGENTS, false);
        return DEFAULT_AGENTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_AGENTS;
    }
  }

  saveAgents(agents, notify = true) {
    try {
      localStorage.setItem(STORAGE_KEY_AGENTS, JSON.stringify(agents));
      if (notify) {
        this.notify('agents_updated', agents);
      }
    } catch (err) {
      console.error('Error saving agents:', err);
    }
  }

  addAgent({ name, limit, period = 'monthly' }) {
    const agents = this.getAgents();
    const newAgent = {
      id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      limit: Number(limit) || 5000,
      period: period.toLowerCase(),
      spent: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [...agents, newAgent];
    this.saveAgents(updated);
    return newAgent;
  }

  updateAgent(id, { name, limit, period }) {
    const agents = this.getAgents();
    const updated = agents.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          ...(name ? { name: name.trim() } : {}),
          ...(limit !== undefined ? { limit: Number(limit) } : {}),
          ...(period ? { period: period.toLowerCase() } : {})
        };
      }
      return a;
    });
    this.saveAgents(updated);
    return updated.find((a) => a.id === id);
  }

  removeAgent(id) {
    const agents = this.getAgents();
    const updated = agents.filter((a) => a.id !== id);
    this.saveAgents(updated);
  }

  recordAgentSpend(idOrName, amount) {
    const agents = this.getAgents();
    const updated = agents.map((a) => {
      if (a.id === idOrName || a.name.toLowerCase() === String(idOrName).toLowerCase()) {
        return {
          ...a,
          spent: Math.max(0, (a.spent || 0) + Number(amount))
        };
      }
      return a;
    });
    this.saveAgents(updated);
  }

  resetAgentSpends() {
    const agents = this.getAgents();
    const updated = agents.map((a) => ({ ...a, spent: 0 }));
    this.saveAgents(updated);
  }

  resetAll() {
    try {
      localStorage.removeItem(STORAGE_KEY_AGENTS);
      this.saveAgents(DEFAULT_AGENTS);
    } catch {
      // ignore
    }
  }
}

export const agentStorage = new AgentStorageService();
