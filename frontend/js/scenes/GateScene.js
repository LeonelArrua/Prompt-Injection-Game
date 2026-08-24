// GateScene.js — Nivel 1: Exterior del Castillo (Leo el Guardia - Inyección Directa)

class GateScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GateScene' });
    }

    create() {
        const TILE = 16;
        const MAP_W = 30;
        const MAP_H = 20;

        window.currentActiveLevel = 1;
        document.getElementById('hud-level').textContent = '📍 Nivel 1 — Puerta del Castillo';
        const pregBtn = document.getElementById('toggle-announcements-btn');
        if (pregBtn) pregBtn.style.display = 'none';
        const pregPanel = document.getElementById('announcements-panel');
        if (pregPanel) pregPanel.style.display = 'none';

        // --- 1. Fondo de pasto florecido ---
        for (let y = 0; y < MAP_H; y++) {
            for (let x = 0; x < MAP_W; x++) {
                this.add.image(x * TILE + 8, y * TILE + 8, 'grass');
            }
        }

        // --- 2. Camino de piedra empedrado hacia la puerta ---
        for (let y = 7; y < MAP_H; y++) {
            for (let x = 13; x <= 16; x++) {
                this.add.image(x * TILE + 8, y * TILE + 8, 'path');
            }
        }

        // --- 3. Muralla del castillo con almenas ---
        this.walls = this.physics.add.staticGroup();

        // Muro izquierdo
        for (let x = 0; x < 13; x++) {
            for (let y = 0; y < 4; y++) {
                const wall = this.walls.create(x * TILE + 8, y * TILE + 8, 'wall');
                wall.setImmovable(true);
                wall.body.setSize(TILE, TILE);
            }
        }

        // Muro derecho
        for (let x = 17; x < MAP_W; x++) {
            for (let y = 0; y < 4; y++) {
                const wall = this.walls.create(x * TILE + 8, y * TILE + 8, 'wall');
                wall.setImmovable(true);
                wall.body.setSize(TILE, TILE);
            }
        }

        // Dintel superior de la puerta
        for (let x = 13; x <= 16; x++) {
            const wall = this.walls.create(x * TILE + 8, 8, 'wall');
            wall.setImmovable(true);
            wall.body.setSize(TILE, TILE);
        }

        // --- 4. Estandartes reales y antorchas en la muralla ---
        [4, 9, 20, 25].forEach(bx => {
            this.add.image(bx * TILE + 8, 2 * TILE + 8, 'banner');
        });

        [12, 17].forEach(tx => {
            this.add.image(tx * TILE + 8, 3 * TILE + 8, 'torch');
            const glow = this.add.circle(tx * TILE + 8, 3 * TILE + 4, 16, 0xff9922, 0.22);
            this.tweens.add({
                targets: glow,
                alpha: { from: 0.15, to: 0.35 },
                scaleX: { from: 0.85, to: 1.2 },
                scaleY: { from: 0.85, to: 1.2 },
                duration: 600 + Math.random() * 300,
                yoyo: true,
                repeat: -1
            });
        });

        // --- 5. Puerta de rejas con sombra ---
        this.add.image(14.5 * TILE + 8, 3.8 * TILE, 'shadow').setScale(1.5, 1);
        this.gate = this.physics.add.staticImage(14.5 * TILE + 8, 2.5 * TILE + 8, 'gate');
        this.gate.setImmovable(true);
        this.gate.body.setSize(TILE * 2, TILE);
        this.gate.body.setOffset(0, 24);

        // --- 6. Bosque de árboles con sombras ---
        this.trees = this.physics.add.staticGroup();
        const treePositions = [
            [2, 6], [5, 8], [1, 12], [4, 15], [7, 10],
            [23, 6], [26, 9], [28, 13], [24, 16], [22, 11],
            [10, 8], [19, 7], [8, 14], [21, 15],
        ];
        treePositions.forEach(([tx, ty]) => {
            this.add.image(tx * TILE + 8, ty * TILE + 16, 'shadow').setScale(1.2, 0.8);
            const tree = this.trees.create(tx * TILE + 8, ty * TILE, 'tree');
            tree.setImmovable(true);
            tree.body.setSize(18, 14);
            tree.body.setOffset(7, 26);
        });

        // --- 7. LEO EL GUARDIA (Rubio, barba, armadura completa) ---
        this.leoShadow = this.add.image(14.5 * TILE + 8, 6 * TILE + 4, 'shadow').setScale(1.1, 0.7);
        this.leo = this.physics.add.staticImage(14.5 * TILE + 8, 5 * TILE + 8, 'leo');
        this.leo.setImmovable(true);
        this.leo.body.setSize(16, 16);
        this.leo.body.setOffset(3, 8);

        // Burbuja de interacción
        this.bubble = this.add.image(14.5 * TILE + 8, 4 * TILE - 4, 'bubble');
        this.bubble.setVisible(false);

        // Label del NPC con sombra
        this.add.text(14.5 * TILE + 8, 4 * TILE - 14, '🛡️ Leo el Guardia', {
            fontSize: '5px',
            fontFamily: '"Press Start 2P"',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // --- 8. JUGADOR ---
        this.playerShadow = this.add.image(14.5 * TILE + 8, 16 * TILE + 10, 'shadow').setScale(1, 0.7);
        this.player = this.physics.add.sprite(14.5 * TILE + 8, 16 * TILE + 8, window.selectedCharacter || 'player_warrior');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(14, 14);
        this.player.body.setOffset(3, 10);
        this.player.setDepth(10);

        // --- Colisiones ---
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.trees);
        this.physics.add.collider(this.player, this.gate);
        this.physics.add.collider(this.player, this.leo);

        // --- Controles ---
        this.cursors = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP, false),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN, false),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT, false),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT, false),
        };
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, false);
        if (this.input.keyboard.clearCaptures) {
            this.input.keyboard.clearCaptures();
        }

        // --- Texto de ayuda ---
        this.add.text(14.5 * TILE + 8, (MAP_H - 1) * TILE, 'Flechas = Mover | ENTER = Hablar', {
            fontSize: '6px',
            fontFamily: '"Press Start 2P"',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        this.canInteract = true;

        // Camera setup
        this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
        this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);

        // Multiplayer
        this.sceneName = 'GateScene';
        multiplayerClient.sendSceneChange(this.sceneName);
    }

    update() {
        if (chatManager.isOpen) {
            this.player.setVelocity(0, 0);
            return;
        }

        // Sincronizar sombra del jugador
        this.playerShadow.x = this.player.x;
        this.playerShadow.y = this.player.y + 10;

        // Multiplayer
        multiplayerClient.sendPosition(this.player.x, this.player.y, this.sceneName, this.player.flipX);
        multiplayerClient.syncSprites(this);

        const speed = 100;
        let vx = 0, vy = 0;

        if (this.cursors.left.isDown) vx = -speed;
        else if (this.cursors.right.isDown) vx = speed;

        if (this.cursors.up.isDown) vy = -speed;
        else if (this.cursors.down.isDown) vy = speed;

        this.player.setVelocity(vx, vy);

        if (vx < 0) this.player.setFlipX(true);
        else if (vx > 0) this.player.setFlipX(false);

        // Proximidad a Leo
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.leo.x, this.leo.y
        );

        if (dist < 42) {
            this.bubble.setVisible(true);
            this.bubble.y = this.leo.y - 22 + Math.sin(this.time.now / 300) * 2;

            if (Phaser.Input.Keyboard.JustDown(this.enterKey) && this.canInteract) {
                this.canInteract = false;
                chatManager.show('🛡️ Leo el Guardia', 1);
                this.time.delayedCall(500, () => { this.canInteract = true; });
            }
        } else {
            this.bubble.setVisible(false);
        }
    }
}
