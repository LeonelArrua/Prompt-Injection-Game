// api.js — Comunicación con el backend FastAPI

const API = {
    baseUrl: '',

    async createSession(username) {
        const res = await fetch(`${this.baseUrl}/api/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        return await res.json();
    },

    async getSession(sessionId) {
        const res = await fetch(`${this.baseUrl}/api/session/${sessionId}`);
        return await res.json();
    },

    async sendChat(sessionId, message, npcLevel) {
        const res = await fetch(`${this.baseUrl}/api/chat/${sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, npc_level: npcLevel })
        });
        return await res.json();
    },

    async verifyPassword(sessionId, level, password) {
        const res = await fetch(`${this.baseUrl}/api/verify-password/${sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level, password })
        });
        return await res.json();
    },

    async getLeaderboard() {
        const res = await fetch(`${this.baseUrl}/api/leaderboard`);
        return await res.json();
    }
};
