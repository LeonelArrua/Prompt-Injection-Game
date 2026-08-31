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
        this.lastAnnouncementsHash = '';
        this.pollInterval = null;
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

        // Sondeo en vivo periódico cada 2.5s para mantener el Pregón Real 100% fresco sin recargar
        if (!this.pollInterval) {
            this.pollInterval = setInterval(() => {
                const panel = document.getElementById('announcements-panel');
                if ((panel && panel.style.display !== 'none') || window.currentActiveLevel === 2) {
                    this.loadInitialAnnouncements();
                }
            }, 2500);
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

        // Guardar siempre en el historial del panel
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
            setTimeout(() => {
                list.scrollTop = list.scrollHeight;
            }, 50);
        }

        // Los avisos en vivo, chat global flotante y toast del trovador SOLO se muestran en el Nivel 2
        if (window.currentActiveLevel !== 2) {
            return;
        }

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

        // 2. Notificación toast destacada en Nivel 2
        showToast(`📜 ${headerText}`, 'success');

        // Si el panel de anuncios estaba oculto en Nivel 2, abrirlo suavemente con autocierre
        openAnnouncements(8);
    }

    async loadInitialAnnouncements() {
        try {
            const res = await fetch('/api/announcements');
            if (!res.ok) return;
            const data = await res.json();
            const list = document.getElementById('announcements-list');
            if (!list) return;

            const announcements = data.announcements || [];
            if (announcements.length === 0) return;

            // Generar huella simple de los anuncios actuales
            const newHash = announcements.map(a => `${a.header || ''}_${a.text || ''}_${a.raw_telegram || ''}`).join('||');
            if (newHash === this.lastAnnouncementsHash && list.children.length > 0 && !list.querySelector('.system')) {
                return; // Sin cambios, no tocar el DOM para que la lectura sea fluida
            }

            const isAtBottom = (list.scrollHeight - list.scrollTop - list.clientHeight) < 60;
            const wasInitialState = list.children.length === 0 || list.querySelector('.system') !== null;

            list.innerHTML = '';
            announcements.forEach(a => {
                const item = document.createElement('div');
                item.className = 'announcement-item';
                const headerText = a.header ? ` — ${this.escapeHtml(a.header)}` : '';
                const rawNote = a.raw_telegram ? `<span class="raw">Pergamino: "${this.escapeHtml(a.raw_telegram)}"</span>` : '';
                item.innerHTML = `
                    <span class="meta">${this.escapeHtml(a.sender || '🎵 Juan el Trovador')}${headerText}</span>
                    <span class="body">${this.escapeHtml(a.text || '')}</span>
                    ${rawNote}
                `;
                list.appendChild(item);
            });

            this.lastAnnouncementsHash = newHash;

            // Si es la carga inicial o el usuario estaba en el fondo, scrollear al último mensaje
            if (wasInitialState || isAtBottom) {
                setTimeout(() => {
                    list.scrollTop = list.scrollHeight;
                }, 40);
            }
        } catch (e) {
            console.warn('No se pudieron cargar anuncios:', e);
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

                // Etiqueta con nombre nítida
                const label = scene.add.text(data.x, data.y - 18, data.username, {
                    fontSize: '6px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: '#77bbff',
                    align: 'center',
                    shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true }
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

let announcementsTimer = null;

// Cargar anuncios y registrar eventos de interacción
document.addEventListener('DOMContentLoaded', () => {
    multiplayerClient.loadInitialAnnouncements();

    const panel = document.getElementById('announcements-panel');
    if (panel) {
        // Pausar autocierre si el usuario pasa el mouse o interactúa
        panel.addEventListener('mouseenter', () => {
            if (announcementsTimer) {
                clearTimeout(announcementsTimer);
                announcementsTimer = null;
            }
        });
        panel.addEventListener('touchstart', () => {
            if (announcementsTimer) {
                clearTimeout(announcementsTimer);
                announcementsTimer = null;
            }
        }, { passive: true });
    }
});

// Función global para abrir el panel de anuncios (opcionalmente con autocierre)
function openAnnouncements(autoCloseSeconds = null) {
    const panel = document.getElementById('announcements-panel');
    if (!panel) return;
    panel.style.display = 'flex';
    multiplayerClient.loadInitialAnnouncements();

    if (announcementsTimer) {
        clearTimeout(announcementsTimer);
        announcementsTimer = null;
    }

    if (autoCloseSeconds && autoCloseSeconds > 0) {
        announcementsTimer = setTimeout(() => {
            closeAnnouncements();
        }, autoCloseSeconds * 1000);
    }
}

// Función global para cerrar panel de anuncios
function closeAnnouncements() {
    const panel = document.getElementById('announcements-panel');
    if (panel) panel.style.display = 'none';
    if (announcementsTimer) {
        clearTimeout(announcementsTimer);
        announcementsTimer = null;
    }
}

// Función global para alternar (abrir sin autocierre / cerrar)
function toggleAnnouncements() {
    const panel = document.getElementById('announcements-panel');
    if (!panel) return;
    if (panel.style.display === 'none' || !panel.style.display) {
        openAnnouncements(null); // Abierto por click manual -> no auto-cerrar
    } else {
        closeAnnouncements();
    }
}
