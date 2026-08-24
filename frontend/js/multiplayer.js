// multiplayer.js — Cliente WebSocket para sincronización de jugadores en tiempo real

class MultiplayerClient {
    constructor() {
        this.ws = null;
        this.otherPlayers = {};  // id -> {username, x, y, flip_x}
        this.sprites = {};       // id -> Phaser.GameObjects.Image
        this.labels = {};        // id -> Phaser.GameObjects.Text
        this.connected = false;
        this.lastSendTime = 0;
        this.currentScene = null;
        this.onlineCount = 0;
    }

    connect(sessionId) {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${location.host}/ws/${sessionId}`;

        try {
            this.ws = new WebSocket(url);
        } catch (e) {
            console.warn('No se pudo conectar WebSocket multiplayer:', e);
            return;
        }

        this.ws.onopen = () => {
            this.connected = true;
            console.log('🌐 Multiplayer conectado');
            this.loadInitialAnnouncements();
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (e) {
                console.warn('Error parseando mensaje multiplayer:', e);
            }
        };

        this.ws.onclose = () => {
            this.connected = false;
            console.log('🔌 Multiplayer desconectado');
            // Reconectar después de 3 segundos
            setTimeout(() => {
                if (window.sessionId) {
                    this.connect(window.sessionId);
                }
            }, 3000);
        };

        this.ws.onerror = (err) => {
            console.warn('Error WebSocket multiplayer:', err);
        };
    }

    handleMessage(data) {
        switch (data.type) {
            case 'players':
                // Actualizar mapa de otros jugadores
                this.otherPlayers = {};
                data.players.forEach(p => {
                    this.otherPlayers[p.id] = {
                        username: p.username,
                        x: p.x,
                        y: p.y,
                        flip_x: p.flip_x
                    };
                });
                this.onlineCount = data.count || 1;
                this.updateHUD();
                break;

            case 'player_joined':
                showToast(`👤 ${data.username} entró al reino`, 'success');
                break;

            case 'player_left':
                showToast(`👋 ${data.username} se fue del reino`, 'error');
                break;

            case 'global_announcement':
                this.handleGlobalAnnouncement(data);
                break;

            case 'global_level_up':
                this.handleGlobalLevelUp(data);
                break;
        }
    }

    handleGlobalLevelUp(data) {
        const feed = document.getElementById('global-chat-feed');
        if (feed) {
            const item = document.createElement('div');
            item.className = 'global-feed-item';
            
            const badgeColor = data.level === 5 ? '#ffd700' : (data.level === 4 ? '#ef4444' : (data.level === 3 ? '#a855f7' : '#38bdf8'));
            
            item.innerHTML = `
                <div class="feed-header" style="color: ${badgeColor};">
                    ${data.icon || '📢'} REINO DEL PARANÁ
                </div>
                <div class="feed-body">
                    <strong>${this.escapeHtml(data.username)}</strong> ${this.escapeHtml(data.description)}
                </div>
            `;
            
            feed.appendChild(item);
            
            // Mantener máximo 4 mensajes en pantalla para que nunca se amontonen
            while (feed.children.length > 4) {
                feed.removeChild(feed.firstChild);
            }
            
            // Auto remover después de 8 segundos con animación suave
            setTimeout(() => {
                item.classList.add('fade-out');
                setTimeout(() => item.remove(), 400);
            }, 8000);
        }

        // También registrar en el panel de Pregón Real
        const list = document.getElementById('announcements-list');
        if (list) {
            const announceItem = document.createElement('div');
            announceItem.className = 'announcement-item system';
            announceItem.innerHTML = `
                <span class="meta">👑 Hazaña del Reino</span>
                <span class="body">${data.text}</span>
            `;
            list.appendChild(announceItem);
            list.scrollTop = list.scrollHeight;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    handleGlobalAnnouncement(data) {
        const headerText = data.header || (data.first_name ? `Pergamino de parte de: ${data.first_name}` : 'Pergamino de un forastero');

        // 1. Agregar al feed de chat global (esquina inferior izquierda)
        const feed = document.getElementById('global-chat-feed');
        if (feed) {
            const feedItem = document.createElement('div');
            feedItem.className = 'global-feed-item';
            feedItem.style.borderLeftColor = '#38bdf8';
            feedItem.innerHTML = `
                <div class="feed-header" style="color: #38bdf8;">
                    📜 ${this.escapeHtml(headerText)}
                </div>
                <div class="feed-body">
                    ${this.escapeHtml(data.text)}
                </div>
            `;
            feed.appendChild(feedItem);
            while (feed.children.length > 4) {
                feed.removeChild(feed.firstChild);
            }
            setTimeout(() => {
                feedItem.classList.add('fade-out');
                setTimeout(() => feedItem.remove(), 400);
            }, 8000);
        }

        // 2. Agregar al panel de Pregón Real (panel de Telegram)
        const list = document.getElementById('announcements-list');
        if (list) {
            const item = document.createElement('div');
            item.className = 'announcement-item';
            const rawNote = data.raw_telegram ? `<span class="raw">Contenido: "${this.escapeHtml(data.raw_telegram)}"</span>` : '';
            item.innerHTML = `
                <span class="meta">🎵 Juan el Trovador — ${this.escapeHtml(headerText)}</span>
                <span class="body">${this.escapeHtml(data.text)}</span>
                ${rawNote}
            `;
            list.appendChild(item);
            list.scrollTop = list.scrollHeight;
        }

        // 3. Notificación toast destacada
        showToast(`📜 ${headerText}`, 'success');

        // Si el panel de anuncios estaba oculto, abrirlo suavemente
        const panel = document.getElementById('announcements-panel');
        if (panel && panel.style.display === 'none') {
            panel.style.display = 'flex';
        }
    }

    async loadInitialAnnouncements() {
        try {
            const res = await fetch('/api/announcements');
            const data = await res.json();
            const list = document.getElementById('announcements-list');
            if (list && data.announcements && data.announcements.length > 0) {
                list.innerHTML = '';
                data.announcements.forEach(a => {
                    const item = document.createElement('div');
                    item.className = 'announcement-item';
                    const rawNote = a.raw_telegram ? `<span class="raw">Pergamino: "${a.raw_telegram}"</span>` : '';
                    item.innerHTML = `
                        <span class="meta">${a.sender}</span>
                        <span class="body">${a.text}</span>
                        ${rawNote}
                    `;
                    list.appendChild(item);
                });
                list.scrollTop = list.scrollHeight;
            }
        } catch (e) {
            console.warn('No se pudieron cargar anuncios iniciales:', e);
        }
    }

    updateHUD() {
        const el = document.getElementById('hud-hint');
        if (el) {
            el.textContent = `👥 ${this.onlineCount} online | ENTER = hablar`;
        }
    }

    sendPosition(x, y, sceneName, flipX) {
        if (!this.connected || !this.ws) return;

        // Throttle: enviar máximo cada 80ms
        const now = Date.now();
        if (now - this.lastSendTime < 80) return;
        this.lastSendTime = now;

        try {
            this.ws.send(JSON.stringify({
                type: 'position',
                x: Math.round(x),
                y: Math.round(y),
                scene: sceneName,
                flip_x: flipX || false
            }));
        } catch (e) {
            // Ignorar errores de envío
        }
    }

    sendSceneChange(sceneName) {
        if (!this.connected || !this.ws) return;
        try {
            this.ws.send(JSON.stringify({
                type: 'scene_change',
                scene: sceneName
            }));
        } catch (e) {
            // Ignorar
        }
    }

    /**
     * Sincroniza los sprites de otros jugadores en la escena activa.
     * Llamar desde update() de cada escena.
     */
    syncSprites(scene) {
        // Si cambió la escena, limpiar sprites viejos
        if (this.currentScene !== scene) {
            this.clearSprites();
            this.currentScene = scene;
        }

        const existingIds = new Set(Object.keys(this.otherPlayers));

        // Crear/actualizar sprites de otros jugadores
        for (const [id, data] of Object.entries(this.otherPlayers)) {
            if (!this.sprites[id]) {
                // Crear sprite del otro jugador
                const sprite = scene.add.image(data.x, data.y, 'player');
                sprite.setScale(1.2);
                sprite.setAlpha(0.65);
                sprite.setTint(0x77bbff);  // Tinte azul para distinguir
                sprite.setDepth(5);
                this.sprites[id] = sprite;

                // Etiqueta con nombre
                const label = scene.add.text(data.x, data.y - 18, data.username, {
                    fontSize: '5px',
                    fontFamily: '"Press Start 2P"',
                    color: '#77bbff',
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2
                }).setOrigin(0.5).setDepth(6);
                this.labels[id] = label;
            } else {
                // Interpolación suave de posición
                const sprite = this.sprites[id];
                sprite.x = Phaser.Math.Linear(sprite.x, data.x, 0.25);
                sprite.y = Phaser.Math.Linear(sprite.y, data.y, 0.25);
                sprite.setFlipX(data.flip_x);

                // Actualizar posición del label
                const label = this.labels[id];
                if (label) {
                    label.x = sprite.x;
                    label.y = sprite.y - 18;
                }
            }
        }

        // Eliminar sprites de jugadores que ya no están
        for (const id of Object.keys(this.sprites)) {
            if (!existingIds.has(id)) {
                if (this.sprites[id]) this.sprites[id].destroy();
                if (this.labels[id]) this.labels[id].destroy();
                delete this.sprites[id];
                delete this.labels[id];
            }
        }
    }

    clearSprites() {
        for (const id of Object.keys(this.sprites)) {
            if (this.sprites[id]) this.sprites[id].destroy();
            if (this.labels[id]) this.labels[id].destroy();
        }
        this.sprites = {};
        this.labels = {};
    }
}

// Instancia global
const multiplayerClient = new MultiplayerClient();

// Cargar anuncios tan pronto como el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    multiplayerClient.loadInitialAnnouncements();
});

// Función global para abrir/cerrar panel de anuncios
function toggleAnnouncements() {
    const panel = document.getElementById('announcements-panel');
    if (!panel) return;
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'flex';
        multiplayerClient.loadInitialAnnouncements();
    } else {
        panel.style.display = 'none';
    }
}
