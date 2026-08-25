// api.js — Comunicación con el backend FastAPI

const API = {
    baseUrl: '',

    async createSession(username, character = 'player_warrior') {
        const res = await fetch(`${this.baseUrl}/api/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, character })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Error al iniciar sesión');
        }
        return data;
    },

    async getSession(sessionId) {
        try {
            const res = await fetch(`${this.baseUrl}/api/session/${sessionId}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
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
    },

    async getDashboard() {
        const res = await fetch(`${this.baseUrl}/api/dashboard`);
        return await res.json();
    }
};
