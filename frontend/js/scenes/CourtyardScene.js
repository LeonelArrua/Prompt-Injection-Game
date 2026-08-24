// CourtyardScene.js — Nivel 3: Patio de la Abadía (Tomás el Monje + Iglesia Gótica + Ejército)

class CourtyardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CourtyardScene' });
    }

    create() {
        const TILE = 16;
        const MAP_W = 30;
        const MAP_H = 20;

        document.getElementById('hud-level').textContent = '📍 Nivel 3 — Patio de la Abadía';

        // --- 1. Fondo de césped exuberante florecido ---
        for (let y = 0; y < MAP_H; y++) {
            for (let x = 0; x < MAP_W; x++) {
                this.add.image(x * TILE + 8, y * TILE + 8, 'grass');
            }
        }

        // --- 2. Caminos de piedra en cruz con adoquines ---
        // Camino horizontal
        for (let x = 1; x < MAP_W - 1; x++) {
            this.add.image(x * TILE + 8, 12 * TILE + 8, 'stone_floor');
        }
        // Camino vertical
        for (let y = 1; y < MAP_H - 1; y++) {
            this.add.image(14 * TILE + 8, y * TILE + 8, 'stone_floor');
        }

        // --- 3. Muralla perimetral ---
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

        // --- 4. IGLESIA / ABADÍA GÓTICA TERRARIA (Zona Superior Derecha) ---
        this.add.image(23 * TILE, 7.5 * TILE, 'shadow').setScale(3, 1.2);
        this.church = this.physics.add.staticImage(23 * TILE, 4.5 * TILE, 'church');
        this.church.setImmovable(true);
        this.church.body.setSize(56, 42);
        this.church.body.setOffset(4, 28);

        this.add.text(23 * TILE, 1 * TILE + 2, '⛪ Abadía Sagrada', {
            fontSize: '5px',
            fontFamily: '"Press Start 2P"',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // --- 5. TOMÁS EL MONJE (Con aura de oración) ---
        this.tomasShadow = this.add.image(22 * TILE + 8, 9 * TILE + 8, 'shadow').setScale(1, 0.7);
        this.tomas = this.physics.add.staticImage(22 * TILE + 8, 9 * TILE, 'tomas');
        this.tomas.setImmovable(true);
        this.tomas.body.setSize(16, 16);
        this.tomas.body.setOffset(2, 6);

        // Aura sagrada suave alrededor de Tomás
        const holyGlow = this.add.circle(22 * TILE + 8, 9 * TILE, 16, 0x34d399, 0.15);
        this.tweens.add({
            targets: holyGlow,
            alpha: { from: 0.1, to: 0.25 },
            scaleX: { from: 0.9, to: 1.15 },
            scaleY: { from: 0.9, to: 1.15 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        this.bubble = this.add.image(22 * TILE + 8, 7.8 * TILE, 'bubble');
        this.bubble.setVisible(false);

        this.add.text(22 * TILE + 8, 7.2 * TILE, '📿 Fray Tomás', {
            fontSize: '5px',
            fontFamily: '"Press Start 2P"',
            color: '#10b981',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // --- 5b. PERRO CANICHE DE FRAY TOMÁS ---
        this.poodleShadow = this.add.image(24 * TILE, 9.8 * TILE, 'shadow').setScale(0.7, 0.4);
        this.poodle = this.physics.add.staticImage(24 * TILE, 9.4 * TILE, 'poodle');
        this.poodle.setImmovable(true);
        this.poodle.body.setSize(14, 12);
        this.poodle.body.setOffset(2, 4);

        // Animación suave de respiración y colita del caniche
        this.tweens.add({
            targets: this.poodle,
            scaleY: { from: 1, to: 1.08 },
            y: { from: 9.4 * TILE, to: 9.4 * TILE - 1 },
            duration: 650,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Etiqueta abajo del caniche para no tapar a Fray Tomás
        this.add.text(24 * TILE, 10.4 * TILE, '🐩 Sr. Caniche', {
            fontSize: '4.5px',
            fontFamily: '"Press Start 2P"',
            color: '#f8fafc',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // --- 6. FUENTE CENTRAL CON ONDAS ---
        this.add.image(14 * TILE + 8, 13 * TILE, 'shadow').setScale(1.8, 1);
        this.fountain = this.physics.add.staticImage(14 * TILE + 8, 12 * TILE + 8, 'fountain');
        this.fountain.setImmovable(true);
        this.fountain.body.setSize(28, 20);
        this.fountain.body.setOffset(2, 8);

        const waterGlow = this.add.circle(14 * TILE + 8, 12 * TILE + 4, 12, 0x38bdf8, 0.3);
        this.tweens.add({
            targets: waterGlow,
            alpha: { from: 0.15, to: 0.45 },
            scaleX: { from: 0.85, to: 1.25 },
            scaleY: { from: 0.85, to: 1.25 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // --- 7. EJÉRCITO DE INFANTERÍA EN FORMACIÓN (Flanco Izquierdo) ---
        this.army = this.physics.add.staticGroup();
        const armyPositions = [
            [3, 5], [5, 5], [7, 5],
            [3, 8], [5, 8], [7, 8],
            [3, 11], [5, 11], [7, 11]
        ];
        armyPositions.forEach(([sx, sy]) => {
            this.add.image(sx * TILE + 8, sy * TILE + 12, 'shadow').setScale(0.9, 0.6);
            const soldier = this.army.create(sx * TILE + 8, sy * TILE + 8, 'soldier');
            soldier.setImmovable(true);
            soldier.body.setSize(14, 14);
            soldier.body.setOffset(2, 4);
        });

        // Armerías y barriles del campamento
        this.add.image(9 * TILE + 4, 6 * TILE, 'weapon_rack');
        this.add.image(9 * TILE + 4, 10 * TILE, 'weapon_rack');

        // --- 8. GRAN MARISCAL CANOSO (Comandante en Jefe) ---
        this.generalShadow = this.add.image(5 * TILE + 8, 3 * TILE + 12, 'shadow').setScale(1.1, 0.7);
        this.general = this.physics.add.staticImage(5 * TILE + 8, 3 * TILE + 6, 'general');
        this.general.setImmovable(true);
        this.general.body.setSize(16, 16);
        this.general.body.setOffset(3, 8);

        this.add.text(5 * TILE + 8, 2 * TILE + 2, '⚔️ Mariscal Martin B.', {
            fontSize: '5px',
            fontFamily: '"Press Start 2P"',
            color: '#ef4444',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // --- 9. BOSQUE PERIMETRAL ---
        this.trees = this.physics.add.staticGroup();
        const treePositions = [
            [2, 16], [5, 16], [10, 16], [26, 16], [28, 16],
            [11, 4], [17, 3], [27, 9]
        ];
        treePositions.forEach(([tx, ty]) => {
            this.add.image(tx * TILE + 8, ty * TILE + 18, 'shadow').setScale(1.3, 0.8);
            const tree = this.trees.create(tx * TILE + 8, ty * TILE, 'tree');
            tree.setImmovable(true);
            tree.body.setSize(18, 14);
            tree.body.setOffset(7, 28);
        });

        // --- 10. JUGADOR ---
        this.playerShadow = this.add.image(14 * TILE + 8, 17 * TILE + 10, 'shadow').setScale(1, 0.7);
        this.player = this.physics.add.sprite(14 * TILE + 8, 17 * TILE + 8, window.selectedCharacter || 'player_warrior');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(14, 14);
        this.player.body.setOffset(3, 10);
        this.player.setDepth(10);

        // --- Colisiones ---
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.trees);
        this.physics.add.collider(this.player, this.church);
        this.physics.add.collider(this.player, this.fountain);
        this.physics.add.collider(this.player, this.tomas);
        this.physics.add.collider(this.player, this.poodle);
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
        this.sceneName = 'CourtyardScene';
        multiplayerClient.sendSceneChange(this.sceneName);

        showToast('📿 Has llegado al Patio de la Abadía', 'success');

        this.add.text(14 * TILE + 8, (MAP_H - 1) * TILE - 2, 'Hacé que Tomás hable del Hacking Day', {
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

        // Proximidad a Tomás
        const distTomas = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.tomas.x, this.tomas.y
        );

        if (distTomas < 42) {
            this.bubble.setVisible(true);
            this.bubble.y = this.tomas.y - 20 + Math.sin(this.time.now / 300) * 2;

            if (Phaser.Input.Keyboard.JustDown(this.enterKey) && this.canInteract) {
                this.canInteract = false;
                chatManager.show('📿 Tomás el Monje', 3);
                this.time.delayedCall(500, () => { this.canInteract = true; });
            }
        } else {
            this.bubble.setVisible(false);
        }

        // Proximidad al Comandante General Canoso
        const distGen = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.general.x, this.general.y
        );
        if (distGen < 45 && Phaser.Input.Keyboard.JustDown(this.enterKey) && this.canInteract && !chatManager.isOpen) {
            this.canInteract = false;
            showToast('⚔️ Mariscal Canoso: "¡Firmes! Mis legiones custodian la abadía. Cuidado con el monje."', 'error');
            this.time.delayedCall(1000, () => { this.canInteract = true; });
        }
    }
}
