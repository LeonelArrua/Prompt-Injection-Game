// DragonScene.js — Nivel 4: Campo de Batalla (La Guerra del Dragón)

class DragonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DragonScene' });
    }

    create() {
        const TILE = 16;
        const MAP_W = 30;
        const MAP_H = 20;

        document.getElementById('hud-level').textContent = '📍 Nivel 4 — Campo de Batalla del Dragón';

        // --- 1. Suelo de tierra calcinada y cenizas ---
        for (let y = 0; y < MAP_H; y++) {
            for (let x = 0; x < MAP_W; x++) {
                this.add.image(x * TILE + 8, y * TILE + 8, 'burned_ground');
            }
        }

        // Grietas de lava volcánica
        const lavaTiles = [
            [6, 3], [7, 3], [22, 3], [23, 3],
            [14, 8], [15, 8], [16, 8],
            [4, 14], [5, 14], [24, 14], [25, 14]
        ];
        lavaTiles.forEach(([lx, ly]) => {
            this.add.image(lx * TILE + 8, ly * TILE + 8, 'lava_rock');
            const glow = this.add.circle(lx * TILE + 8, ly * TILE + 8, 14, 0xea580c, 0.2);
            this.tweens.add({
                targets: glow,
                alpha: { from: 0.15, to: 0.4 },
                scaleX: { from: 0.85, to: 1.2 },
                scaleY: { from: 0.85, to: 1.2 },
                duration: 800 + Math.random() * 400,
                yoyo: true,
                repeat: -1
            });
        });

        // --- 2. Murallas y riscos perimetrales ---
        this.walls = this.physics.add.staticGroup();

        for (let x = 0; x < MAP_W; x++) {
            const wTop = this.walls.create(x * TILE + 8, 8, 'wall');
            wTop.body.setSize(TILE, TILE);
            const wBot = this.walls.create(x * TILE + 8, (MAP_H - 1) * TILE + 8, 'wall');
            wBot.body.setSize(TILE, TILE);
        }
        for (let y = 1; y < MAP_H - 1; y++) {
            const wLeft = this.walls.create(8, y * TILE + 8, 'wall');
            wLeft.body.setSize(TILE, TILE);
            const wRight = this.walls.create((MAP_W - 1) * TILE + 8, y * TILE + 8, 'wall');
            wRight.body.setSize(TILE, TILE);
        }

        // --- 3. Barricadas defensivas de guerra ---
        this.barricades = this.physics.add.staticGroup();
        [5, 10, 19, 24].forEach(bx => {
            const b = this.barricades.create(bx * TILE + 8, 11 * TILE + 8, 'barricade');
            b.body.setSize(30, 12);
            b.body.setOffset(1, 4);
        });

        // Hogueras de guerra
        [3, 26].forEach(fx => {
            this.add.image(fx * TILE + 8, 13 * TILE + 8, 'fire');
            const fireGlow = this.add.circle(fx * TILE + 8, 13 * TILE + 4, 18, 0xff7700, 0.25);
            this.tweens.add({
                targets: fireGlow,
                alpha: { from: 0.15, to: 0.45 },
                scaleX: { from: 0.9, to: 1.2 },
                scaleY: { from: 0.9, to: 1.2 },
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        });

        // --- 4. Ejército en defensa de las líneas ---
        this.army = this.physics.add.staticGroup();
        const armyPositions = [
            [4, 12], [7, 12], [9, 12], [20, 12], [22, 12], [25, 12],
            [6, 14], [8, 14], [21, 14], [23, 14]
        ];
        armyPositions.forEach(([sx, sy]) => {
            this.add.image(sx * TILE + 8, sy * TILE + 12, 'shadow').setScale(0.9, 0.6);
            const soldier = this.army.create(sx * TILE + 8, sy * TILE + 8, 'soldier');
            soldier.setImmovable(true);
            soldier.body.setSize(14, 14);
            soldier.body.setOffset(2, 4);
        });

        // Armería de campaña
        this.add.image(2 * TILE + 8, 16 * TILE, 'weapon_rack');
        this.add.image(27 * TILE + 8, 16 * TILE, 'weapon_rack');

        // --- 5. MARISCAL MARTIN B. (Comandante del frente) ---
        this.generalShadow = this.add.image(14.5 * TILE + 8, 14 * TILE + 8, 'shadow').setScale(1.2, 0.7);
        this.general = this.physics.add.staticImage(14.5 * TILE + 8, 13 * TILE + 4, 'general');
        this.general.setImmovable(true);
        this.general.body.setSize(16, 16);
        this.general.body.setOffset(3, 8);

        this.add.text(14.5 * TILE + 8, 12 * TILE + 2, '⚔️ Mariscal Martin B.', {
            fontSize: '5px',
            fontFamily: '"Press Start 2P"',
            color: '#ef4444',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // --- 6. EL GRAN DRAGÓN ANCESTRAL IGNIS ---
        this.dragonShadow = this.add.image(15 * TILE, 8.5 * TILE, 'shadow').setScale(4.5, 1.8);
        this.dragon = this.physics.add.staticImage(15 * TILE, 5.2 * TILE, 'dragon');
        this.dragon.setImmovable(true);
        this.dragon.setScale(0.9);
        this.dragon.body.setSize(80, 75);
        this.dragon.body.setOffset(20, 20);

        // Resplandor místico de fuego esmeralda y energía del dragón
        this.dragonGlow = this.add.circle(15 * TILE, 5.2 * TILE, 50, 0x10b981, 0.25);
        this.tweens.add({
            targets: this.dragonGlow,
            alpha: { from: 0.15, to: 0.45 },
            scaleX: { from: 0.85, to: 1.25 },
            scaleY: { from: 0.85, to: 1.25 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Animación suave de respiración del dragón
        this.tweens.add({
            targets: this.dragon,
            scaleY: { from: 0.9, to: 0.93 },
            y: { from: 5.2 * TILE, to: 5.2 * TILE - 3 },
            duration: 1300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Burbuja de interacción con el Dragón
        this.bubble = this.add.image(15 * TILE, 1.8 * TILE, 'bubble');
        this.bubble.setVisible(false);

        this.add.text(15 * TILE, 0.8 * TILE + 4, '🐉 Ignis el Dragón Esmeralda', {
            fontSize: '6px',
            fontFamily: '"Press Start 2P"',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // --- 7. JUGADOR ---
        this.playerShadow = this.add.image(14.5 * TILE + 8, 17 * TILE + 10, 'shadow').setScale(1, 0.7);
        this.player = this.physics.add.sprite(14.5 * TILE + 8, 17 * TILE + 8, window.selectedCharacter || 'player_warrior');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(14, 14);
        this.player.body.setOffset(3, 10);
        this.player.setDepth(10);

        // --- Colisiones ---
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.barricades);
        this.physics.add.collider(this.player, this.dragon);
        this.physics.add.collider(this.player, this.general);
        this.physics.add.collider(this.player, this.army);

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
        this.sceneName = 'DragonScene';
        multiplayerClient.sendSceneChange(this.sceneName);

        showToast('🔥 ¡Has entrado al Campo de Batalla del Dragón!', 'error');

        this.add.text(15 * TILE, (MAP_H - 1) * TILE - 2, '¡Habla con el Dragón y cálmalo con tu ingenio!', {
            fontSize: '5px',
            fontFamily: '"Press Start 2P"',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);
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

        // Proximidad al Dragón
        const distDragon = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.dragon.x, this.dragon.y
        );

        if (distDragon < 65) {
            this.bubble.setVisible(true);
            this.bubble.y = this.dragon.y - 32 + Math.sin(this.time.now / 300) * 2;

            if (Phaser.Input.Keyboard.JustDown(this.enterKey) && this.canInteract) {
                this.canInteract = false;
                chatManager.show('🔥 Ignis el Dragón', 4);
                this.time.delayedCall(500, () => { this.canInteract = true; });
            }
        } else {
            this.bubble.setVisible(false);
        }

        // Proximidad al Mariscal
        const distGen = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.general.x, this.general.y
        );
        if (distGen < 45 && Phaser.Input.Keyboard.JustDown(this.enterKey) && this.canInteract && !chatManager.isOpen) {
            this.canInteract = false;
            showToast('⚔️ Mariscal: "¡Soldado! ¡El dragón solo ruge furioso! ¡Debes calmarlo con tus palabras!"', 'error');
            this.time.delayedCall(1000, () => { this.canInteract = true; });
        }
    }
}
