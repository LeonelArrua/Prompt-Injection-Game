// HallScene.js — Nivel 2: Gran Salón del Trono (Juan el Trovador + El Rey en su Trono)

class HallScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HallScene' });
    }

    create() {
        const TILE = 16;
        const MAP_W = 30;
        const MAP_H = 20;

        window.currentActiveLevel = 2;
        if (window.questManager) questManager.setLevel(2);
        document.getElementById('hud-level').textContent = '📍 Nivel 2 — Salón del Trono Real';
        const pregBtn = document.getElementById('toggle-announcements-btn');
        if (pregBtn) pregBtn.style.display = 'inline-block';

        // Abrir Pregón Real automáticamente al entrar al Nivel 2 y auto-cerrar tras 7s
        if (typeof openAnnouncements === 'function') {
            openAnnouncements(7);
        }

        // --- 1. Suelo de baldosas de piedra pulida ---
        for (let y = 0; y < MAP_H; y++) {
            for (let x = 0; x < MAP_W; x++) {
                this.add.image(x * TILE + 8, y * TILE + 8, 'stone_floor');
            }
        }

        // --- 2. Muros de castillo con sillería profunda ---
        this.walls = this.physics.add.staticGroup();

        // Muro superior
        for (let x = 0; x < MAP_W; x++) {
            for (let y = 0; y < 2; y++) {
                const w = this.walls.create(x * TILE + 8, y * TILE + 8, 'wall');
                w.body.setSize(TILE, TILE);
            }
        }

        // Muro inferior con arco de salida al patio
        for (let x = 0; x < MAP_W; x++) {
            if (x >= 13 && x <= 16) continue;
            for (let y = MAP_H - 2; y < MAP_H; y++) {
                const w = this.walls.create(x * TILE + 8, y * TILE + 8, 'wall');
                w.body.setSize(TILE, TILE);
            }
        }

        // Muros laterales
        for (let y = 2; y < MAP_H - 2; y++) {
            for (let x = 0; x < 2; x++) {
                const w = this.walls.create(x * TILE + 8, y * TILE + 8, 'wall');
                w.body.setSize(TILE, TILE);
            }
            for (let x = MAP_W - 2; x < MAP_W; x++) {
                const w = this.walls.create(x * TILE + 8, y * TILE + 8, 'wall');
                w.body.setSize(TILE, TILE);
            }
        }

        // --- 3. Estandartes heráldicos y armerías ---
        [4, 8, 21, 25].forEach(bx => {
            this.add.image(bx * TILE + 8, 2 * TILE + 8, 'banner');
        });

        // Armerías decorativas en las paredes laterales
        this.add.image(3 * TILE + 8, 5 * TILE, 'weapon_rack');
        this.add.image(3 * TILE + 8, 12 * TILE, 'weapon_rack');
        this.add.image(26 * TILE + 8, 5 * TILE, 'weapon_rack');
        this.add.image(26 * TILE + 8, 12 * TILE, 'weapon_rack');

        // --- 4. Puerta bloqueada hacia el patio ---
        this.add.image(14.5 * TILE + 8, (MAP_H - 1.5) * TILE, 'shadow').setScale(1.6, 0.8);
        this.doorBlock = this.physics.add.staticImage(14.5 * TILE + 8, (MAP_H - 2) * TILE + 8, 'door');
        this.doorBlock.setImmovable(true);
        this.doorBlock.body.setSize(TILE * 2, TILE);

        // --- 5. Antorchas con halos dinámicos ---
        const torchPositions = [
            [2, 3], [2, 9], [2, 15],
            [27, 3], [27, 9], [27, 15],
            [10, 2], [19, 2]
        ];
        torchPositions.forEach(([tx, ty]) => {
            this.add.image(tx * TILE + 8, ty * TILE + 8, 'torch');
            const glow = this.add.circle(tx * TILE + 8, ty * TILE + 4, 18, 0xffa033, 0.2);
            this.tweens.add({
                targets: glow,
                alpha: { from: 0.15, to: 0.35 },
                scaleX: { from: 0.85, to: 1.2 },
                scaleY: { from: 0.85, to: 1.2 },
                duration: 500 + Math.random() * 400,
                yoyo: true,
                repeat: -1
            });
        });

        // --- 6. Alfombra imperial roja con bordes dorados ---
        for (let y = 3; y < MAP_H - 2; y++) {
            for (let x = 12; x <= 17; x++) {
                const isBorder = (x === 12 || x === 17);
                const color = isBorder ? 0x6b1122 : 0x991b1b;
                this.add.rectangle(x * TILE + 8, y * TILE + 8, TILE, TILE, color);
            }
        }
        // Flecos dorados en el borde de la alfombra
        for (let y = 3; y < MAP_H - 2; y++) {
            this.add.rectangle(12 * TILE + 1, y * TILE + 8, 2, TILE, 0xf59e0b);
            this.add.rectangle(17 * TILE + 15, y * TILE + 8, 2, TILE, 0xf59e0b);
        }

        // --- 7. ESTRADO DEL REY EN SU TRONO ---
        this.add.image(14.5 * TILE + 8, 4.8 * TILE, 'shadow').setScale(1.8, 1.1);
        this.king = this.physics.add.staticImage(14.5 * TILE + 8, 4 * TILE, 'king');
        this.king.setImmovable(true);
        this.king.body.setSize(30, 24);
        this.king.body.setOffset(1, 6);

        this.add.text(14.5 * TILE + 8, 2 * TILE + 4, '👑 El Rey de Paraná', {
            fontSize: '6px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffd700',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
            align: 'center'
        }).setOrigin(0.5);

        // --- 8. JUAN EL TROVADOR (Con su laúd y anteojos) ---
        this.juanShadow = this.add.image(19 * TILE + 8, 10 * TILE + 6, 'shadow').setScale(1.1, 0.7);
        this.juan = this.physics.add.staticImage(19 * TILE + 8, 9 * TILE + 8, 'juan');
        this.juan.setImmovable(true);
        this.juan.body.setSize(16, 16);
        this.juan.body.setOffset(3, 8);

        this.bubble = this.add.image(19 * TILE + 8, 8 * TILE - 4, 'bubble');
        this.bubble.setVisible(false);

        this.add.text(19 * TILE + 8, 8 * TILE - 14, '🎵 Juan el Trovador', {
            fontSize: '6px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffd700',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
            align: 'center'
        }).setOrigin(0.5);

        // --- 9. JUGADOR ---
        this.playerShadow = this.add.image(14.5 * TILE + 8, 15 * TILE + 10, 'shadow').setScale(1, 0.7);
        this.player = this.physics.add.sprite(14.5 * TILE + 8, 15 * TILE + 8, window.selectedCharacter || 'player_warrior');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(14, 14);
        this.player.body.setOffset(3, 10);
        this.player.setDepth(10);

        // --- Colisiones ---
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.king);
        this.physics.add.collider(this.player, this.juan);
        this.physics.add.collider(this.player, this.doorBlock);

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

        this.canInteract = true;

        // Camera y bounds
        this.cameras.main.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);
        this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);

        // Multiplayer
        this.sceneName = 'HallScene';
        multiplayerClient.sendSceneChange(this.sceneName);

        showToast('🏰 Has entrado al Salón del Trono', 'success');
    }

    update() {
        if (chatManager.isOpen) {
            this.player.setVelocity(0, 0);
            return;
        }

        // Sombra jugador
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

        // Proximidad a Juan
        const distJuan = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.juan.x, this.juan.y
        );

        if (distJuan < 42) {
            this.bubble.setVisible(true);
            this.bubble.y = this.juan.y - 22 + Math.sin(this.time.now / 300) * 2;

            if (Phaser.Input.Keyboard.JustDown(this.enterKey) && this.canInteract) {
                this.canInteract = false;
                chatManager.show('🎵 Juan el Trovador', 2);
                this.time.delayedCall(500, () => { this.canInteract = true; });
            }
        } else {
            this.bubble.setVisible(false);
        }

        // Proximidad al Rey
        const distKing = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.king.x, this.king.y
        );
        if (distKing < 45 && Phaser.Input.Keyboard.JustDown(this.enterKey) && this.canInteract && !chatManager.isOpen) {
            this.canInteract = false;
            showToast('👑 El Rey: "¡Oíd a Juan el Trovador! Canta las noticias que llegan al pergamino."', 'success');
            this.time.delayedCall(1000, () => { this.canInteract = true; });
        }
    }
}
