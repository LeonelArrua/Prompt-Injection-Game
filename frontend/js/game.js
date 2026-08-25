// Variables globales del juego
window.sessionId = null;
window.username = null;
window.gameInstance = null;
window.selectedCharacter = 'player_warrior';

// Seleccionar clase de personaje en el login
function selectCharacter(charKey) {
    window.selectedCharacter = charKey;
    document.querySelectorAll('.char-card').forEach(card => {
        if (card.getAttribute('data-char') === charKey) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// Configuración de Phaser
const gameConfig = {
    type: Phaser.AUTO,
    width: 480,   // 30 tiles * 16px
    height: 320,  // 20 tiles * 16px
    pixelArt: true,
    render: {
        antialias: false,
        roundPixels: true
    },
    zoom: 2,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    input: {
        keyboard: {
            capture: []
        }
    },
    scene: [BootScene, GateScene, HallScene, CourtyardScene, DragonScene]
};

const LEVEL_SCENES = {
    1: 'GateScene',
    2: 'HallScene',
    3: 'CourtyardScene',
    4: 'DragonScene',
    5: 'DragonScene'
};

// Función de inicio o reanudación del juego
async function startGame(existingSession = null) {
    try {
        let session = existingSession;

        if (!session) {
            const usernameInput = document.getElementById('username-input');
            const username = usernameInput.value.trim();
            
            if (!username) {
                usernameInput.style.borderColor = '#cc3333';
                usernameInput.placeholder = '¡Ingresá tu nombre!';
                return;
            }

            // Crear nueva sesión en el backend
            session = await API.createSession(username, window.selectedCharacter || 'player_warrior');
        }

        window.sessionId = session.session_id;
        window.username = session.username;
        window.selectedCharacter = session.character || 'player_warrior';
        window.targetScene = LEVEL_SCENES[session.current_level] || 'GateScene';

        // Guardar en localStorage para persistir tras F5
        localStorage.setItem('hacking_day_session_id', session.session_id);
        localStorage.setItem('hacking_day_username', session.username);
        localStorage.setItem('hacking_day_character', window.selectedCharacter);

        // Actualizar HUD
        document.getElementById('hud-player').textContent = `👤 ${session.username}`;
        
        // Ocultar login, mostrar juego
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('hud').style.display = 'flex';

        // Iniciar Phaser si no está iniciado
        if (!window.gameInstance) {
            window.gameInstance = new Phaser.Game(gameConfig);
        }

        // Conectar multiplayer WebSocket
        multiplayerClient.connect(window.sessionId);

        if (session.resumed) {
            showToast(`🔄 ¡Bienvenido de vuelta, ${session.username}! Partida reanudada.`, 'success');
        }

        // Si ya completó la victoria total (Nivel 5), mostrar pantalla de victoria
        if (session.current_level >= 5) {
            setTimeout(() => {
                const winScreen = document.getElementById('victory-screen');
                if (winScreen) winScreen.style.display = 'flex';
            }, 1000);
        }

    } catch (err) {
        console.error('Error al iniciar o reanudar sesión:', err);
        showToast(`⚠️ ${err.message || 'Error de conexión con el servidor'}`, 'error');
        const usernameInput = document.getElementById('username-input');
        if (usernameInput) {
            usernameInput.style.borderColor = '#cc3333';
            usernameInput.focus();
        }
    }
}

// Reiniciar sesión completamente (para nueva partida)
function resetGameSession() {
    localStorage.removeItem('hacking_day_session_id');
    location.reload();
}

// Auto-reanudación tras F5 o carga inicial
async function initAutoResume() {
    const input = document.getElementById('username-input');
    
    // Restaurar clase previamente elegida o nombre guardado
    const savedChar = localStorage.getItem('hacking_day_character');
    if (savedChar) {
        selectCharacter(savedChar);
    }
    const savedUsername = localStorage.getItem('hacking_day_username');
    if (savedUsername && input) {
        input.value = savedUsername;
    }

    if (input) {
        ['keydown', 'keyup', 'keypress'].forEach(evtType => {
            input.addEventListener(evtType, (e) => {
                e.stopPropagation();
            });
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') startGame();
        });
    }

    // Verificar si hay una sesión activa guardada en este navegador
    const savedSessionId = localStorage.getItem('hacking_day_session_id');
    if (savedSessionId) {
        try {
            const session = await API.getSession(savedSessionId);
            if (session && (session.session_id || session.username)) {
                // Asegurar que session.session_id esté presente
                session.session_id = session.session_id || savedSessionId;
                console.log('🔄 Reanudando sesión guardada:', session);
                showToast(`🔄 ¡Progreso restaurado! Nivel ${session.current_level}`, 'success');
                await startGame(session);
                return;
            } else {
                localStorage.removeItem('hacking_day_session_id');
            }
        } catch (e) {
            console.warn('Sesión anterior no válida en el servidor:', e);
            localStorage.removeItem('hacking_day_session_id');
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoResume);
} else {
    initAutoResume();
}
