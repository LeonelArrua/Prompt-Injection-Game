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

// Función de inicio del juego (llamada desde el botón de login)
async function startGame() {
    const usernameInput = document.getElementById('username-input');
    const username = usernameInput.value.trim();
    
    if (!username) {
        usernameInput.style.borderColor = '#cc3333';
        usernameInput.placeholder = '¡Ingresá tu nombre!';
        return;
    }

    try {
        // Crear sesión en el backend
        const session = await API.createSession(username);
        window.sessionId = session.session_id;
        window.username = session.username;

        // Actualizar HUD
        document.getElementById('hud-player').textContent = `👤 ${username}`;
        
        // Ocultar login, mostrar juego
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('hud').style.display = 'flex';

        // Iniciar Phaser
        window.gameInstance = new Phaser.Game(gameConfig);

        // Conectar multiplayer WebSocket
        multiplayerClient.connect(window.sessionId);

    } catch (err) {
        console.error('Error al conectar con el servidor:', err);
        showToast('⚠️ Error de conexión. ¿Está corriendo el backend?', 'error');
    }
}

// Enter en el input de login inicia el juego
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('username-input');
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
});
