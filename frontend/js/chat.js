// chat.js — Sistema de chat con los NPCs

class ChatManager {
    constructor() {
        this.container = document.getElementById('chat-container');
        this.messagesDiv = document.getElementById('chat-messages');
        this.inputEl = document.getElementById('chat-input');
        this.typingEl = document.getElementById('chat-typing');
        this.npcNameEl = document.getElementById('chat-npc-name');
        this.passwordBtn = document.getElementById('btn-password');
        this.currentNpcLevel = 0;
        this.currentNpcName = '';
        this.isOpen = false;
        this.isSending = false;

        // Modal de contraseña medieval
        this.passwordModal = document.getElementById('password-modal');
        this.passwordBox = document.getElementById('password-box');
        this.passwordInput = document.getElementById('password-input');

        // Evitar que cualquier evento de teclado del input llegue a Phaser o al window
        ['keydown', 'keyup', 'keypress'].forEach(evtType => {
            this.inputEl.addEventListener(evtType, (e) => {
                e.stopPropagation();
            });
            if (this.passwordInput) {
                this.passwordInput.addEventListener(evtType, (e) => {
                    e.stopPropagation();
                });
            }
        });

        // Enter para enviar chat
        this.inputEl.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter' && !this.isSending) {
                this.handleSend();
            }
        });

        // Enter y Escape en el modal de contraseña
        if (this.passwordInput) {
            this.passwordInput.addEventListener('keydown', (e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                    this.submitPassword();
                } else if (e.key === 'Escape') {
                    this.closePasswordModal();
                }
            });
        }
    }

    show(npcName, npcLevel) {
        this.currentNpcName = npcName;
        this.currentNpcLevel = npcLevel;
        this.npcNameEl.textContent = npcName;
        this.messagesDiv.innerHTML = '';
        this.container.style.display = 'flex';
        this.isOpen = true;

        // Deshabilitar teclado de Phaser para que WASD/Espacio funcionen en el chat
        this.setGameKeyboardEnabled(false);

        this.inputEl.focus();

        // Mostrar botón de contraseña para niveles 1 y 2
        if (npcLevel <= 2) {
            this.passwordBtn.style.display = 'inline-block';
        } else {
            this.passwordBtn.style.display = 'none';
        }

        // Mensaje de bienvenida
        const welcomes = {
            1: '🛡️ Leo te mira con desconfianza. "¿Quién anda ahí?"',
            2: '🎵 Juan afina su laúd. "¡Saludos! Solo canto las noticias del reino. Puedes mandarme un pergamino a mi casa ubicada en Telegram al @juan_el_tovador_bot y lo proclamaré a la corte."',
            3: '📿 Tomás levanta la vista de su libro de oraciones. "Paz sea contigo, hijo mío."',
            4: '🔥 ¡Ignis el Dragón ruge sacudiendo la tierra y escupe llamaradas de fuego ardiente!'
        };
        this.addMessage('Sistema', welcomes[npcLevel] || 'El NPC te observa.', false, true);
    }

    hide() {
        this.container.style.display = 'none';
        this.isOpen = false;
        this.currentNpcLevel = 0;

        // Rehabilitar teclado de Phaser
        this.setGameKeyboardEnabled(true);

        // Devolver foco al juego
        if (window.gameInstance) {
            window.gameInstance.canvas.focus();
        }
    }

    /**
     * Habilita/deshabilita el teclado de Phaser.
     * Cuando está deshabilitado, WASD y Espacio funcionan normalmente en inputs HTML.
     */
    setGameKeyboardEnabled(enabled) {
        if (!window.gameInstance) return;
        const activeScenes = window.gameInstance.scene.getScenes(true);
        activeScenes.forEach(scene => {
            if (scene.input && scene.input.keyboard) {
                scene.input.keyboard.enabled = enabled;
            }
        });
    }

    addMessage(sender, text, isUser, isSystem = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isUser ? 'user' : 'npc'}`;
        if (isSystem) {
            msgDiv.style.background = '#2a2a3a';
            msgDiv.style.borderColor = '#5a5a8a';
            msgDiv.style.color = '#a8a8da';
            msgDiv.style.alignSelf = 'center';
            msgDiv.style.textAlign = 'center';
            msgDiv.style.maxWidth = '100%';
        }
        msgDiv.innerHTML = `<span class="sender">${sender}</span>${this.escapeHtml(text)}`;
        this.messagesDiv.appendChild(msgDiv);
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async handleSend() {
        const message = this.inputEl.value.trim();
        if (!message || this.isSending) return;

        this.isSending = true;
        this.inputEl.value = '';
        this.addMessage('Tú', message, true);

        // Mostrar typing
        this.typingEl.style.display = 'block';
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

        try {
            const result = await API.sendChat(window.sessionId, message, this.currentNpcLevel);
            this.typingEl.style.display = 'none';
            this.addMessage(this.currentNpcName, result.response, false);

            // Nivel 3 (Tomás): Reclutamiento al Nivel 4 tras Jailbreak
            if (this.currentNpcLevel === 3 && result.jailbreak_detected) {
                setTimeout(() => {
                    this.addMessage('Sistema', '🏆 ¡JAILBREAK EXITOSO! Has logrado que el monje hable del Hacking Day.', false, true);
                    showToast('🏆 ¡Jailbreak Exitoso! Reclutado para la guerra', 'success');

                    let countdown = 8;
                    const timerMsg = document.createElement('div');
                    timerMsg.className = 'chat-msg';
                    timerMsg.style.background = '#3d1a1a';
                    timerMsg.style.borderColor = '#b91c1c';
                    timerMsg.style.color = '#fca5a5';
                    timerMsg.style.alignSelf = 'center';
                    timerMsg.style.textAlign = 'center';
                    timerMsg.style.maxWidth = '100%';
                    timerMsg.style.marginTop = '6px';
                    timerMsg.textContent = `⚔️ El Mariscal Martin B. te traslada al Campo de Batalla en ${countdown}s...`;
                    this.messagesDiv.appendChild(timerMsg);
                    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

                    const interval = setInterval(() => {
                        countdown--;
                        if (countdown > 0) {
                            timerMsg.textContent = `⚔️ El Mariscal Martin B. te traslada al Campo de Batalla en ${countdown}s...`;
                        } else {
                            clearInterval(interval);
                            this.hide();
                            if (window.gameInstance) {
                                const activeScenes = window.gameInstance.scene.getScenes(true);
                                activeScenes.forEach(s => s.scene.stop());
                                window.gameInstance.scene.start('DragonScene');
                            }
                        }
                    }, 1000);
                }, 1000);
            }

            // Nivel 4 (Dragón): Calmar al Dragón tras romper su restricción de rugidos
            if (this.currentNpcLevel === 4 && result.dragon_calmed) {
                setTimeout(() => {
                    this.addMessage('🔥 Ignis el Dragón', 'Perdón, pasa que criticaron el Hacking Day...', false);
                    this.addMessage('Sistema', '✨ ¡EL DRAGÓN SE HA CALMADO! Has salvado al Reino del Paraná.', false, true);
                    showToast('🏆 ¡Victoria! El Dragón se ha calmado', 'success');

                    let countdown = 5;
                    const timerMsg = document.createElement('div');
                    timerMsg.className = 'chat-msg';
                    timerMsg.style.background = '#2a3a2a';
                    timerMsg.style.borderColor = '#5a8a5a';
                    timerMsg.style.color = '#8ada8a';
                    timerMsg.style.alignSelf = 'center';
                    timerMsg.style.textAlign = 'center';
                    timerMsg.style.maxWidth = '100%';
                    timerMsg.textContent = `⏳ Coronando al Héroe del Reino en ${countdown}s...`;
                    this.messagesDiv.appendChild(timerMsg);
                    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

                    const interval = setInterval(() => {
                        countdown--;
                        if (countdown > 0) {
                            timerMsg.textContent = `⏳ Coronando al Héroe del Reino en ${countdown}s...`;
                        } else {
                            clearInterval(interval);
                            this.hide();
                            document.getElementById('victory-screen').style.display = 'flex';
                        }
                    }, 1000);
                }, 800);
            }
        } catch (err) {
            this.typingEl.style.display = 'none';
            this.addMessage('Sistema', '⚠️ Error de conexión. ¿Está corriendo el backend?', false, true);
        }

        this.isSending = false;
        this.inputEl.focus();
    }

    openPasswordModal() {
        if (!this.passwordModal) return;
        this.passwordInput.value = '';
        this.passwordModal.style.display = 'flex';
        this.setGameKeyboardEnabled(false);
        setTimeout(() => {
            if (this.passwordInput) this.passwordInput.focus();
        }, 50);
    }

    closePasswordModal() {
        if (!this.passwordModal) return;
        this.passwordModal.style.display = 'none';
        if (this.isOpen) {
            this.inputEl.focus();
        } else {
            this.setGameKeyboardEnabled(true);
            if (window.gameInstance) window.gameInstance.canvas.focus();
        }
    }

    tryPassword() {
        this.openPasswordModal();
    }

    async submitPassword() {
        if (!this.passwordInput) return;
        const password = this.passwordInput.value.trim();
        if (!password) {
            this.passwordInput.focus();
            return;
        }

        const targetLevel = this.currentNpcLevel;

        try {
            const result = await API.verifyPassword(window.sessionId, targetLevel, password);
            if (result.correct) {
                showToast(result.message, 'success');
                this.addMessage('Sistema', '✅ ' + result.message, false, true);
                this.closePasswordModal();
                this.hide();

                // Transicionar a la siguiente escena usando el next_level devuelto por el backend
                const nextSceneName = result.next_level === 2 ? 'HallScene' : (result.next_level === 3 ? 'CourtyardScene' : null);
                if (nextSceneName && window.gameInstance) {
                    setTimeout(() => {
                        const activeScenes = window.gameInstance.scene.getScenes(true);
                        activeScenes.forEach(s => {
                            s.scene.stop();
                        });
                        window.gameInstance.scene.start(nextSceneName);
                    }, 500);
                }
            } else {
                showToast(result.message, 'error');
                this.addMessage('Sistema', '❌ ' + result.message, false, true);
                // Efecto shake en el modal medieval
                if (this.passwordBox) {
                    this.passwordBox.classList.add('shake');
                    setTimeout(() => this.passwordBox.classList.remove('shake'), 500);
                }
                this.passwordInput.select();
            }
        } catch (err) {
            console.error('Error verificando contraseña:', err);
            showToast('Error de conexión con el servidor', 'error');
        }
    }
}

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Instancia global
const chatManager = new ChatManager();
