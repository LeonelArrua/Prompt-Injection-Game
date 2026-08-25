// BootScene.js — Pantalla de carga y generación de sprites

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.load.image('dragon', 'assets/dragon.png');
    }

    create() {
        // Generar todas las texturas pixel art
        createAllSprites(this);

        // Texto de carga
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;
        
        this.add.text(cx, cy - 20, '🏰 Preparando el Reino...', {
            fontSize: '10px',
            fontFamily: '"Press Start 2P"',
            color: '#c8a84e',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(cx, cy + 10, 'Cargando sprites...', {
            fontSize: '7px',
            fontFamily: '"Press Start 2P"',
            color: '#8a7a5a',
            align: 'center'
        }).setOrigin(0.5);

        // Transicionar a la escena correspondiente al nivel del jugador
        this.time.delayedCall(800, () => {
            const nextScene = window.targetScene || 'GateScene';
            this.scene.start(nextScene);
        });
    }
}
