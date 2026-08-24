// sprites.js — Generación de sprites Pixel-Art estilo Terraria / 16-Bit RPG
// Paletas ricas con sombreado de tonos (hue-shifting), contornos oscuros y alta fidelidad

function createAllSprites(scene) {
    createShadowSprite(scene);
    createPlayerWarriorSprite(scene);
    createPlayerMageSprite(scene);
    createPlayerRangerSprite(scene);
    createLeoSprite(scene);
    createJuanSprite(scene);
    createTomasSprite(scene);
    createKingSprite(scene);
    createGeneralSprite(scene);
    createSoldierSprite(scene);
    createChurchSprite(scene);
    createFountainSprite(scene);
    createTreeSprite(scene);
    createTorchSprite(scene);
    createBannerSprite(scene);
    createBubbleSprite(scene);
    createWeaponRackSprite(scene);
    createGrassTiles(scene);
    createStoneFloorTiles(scene);
    createWallTiles(scene);
    createPathTiles(scene);
    createGateSprite(scene);
    createDoorSprite(scene);
}

// Helper universal de dibujo de píxeles
function drawPixelMatrix(ctx, matrix, palette, offX = 0, offY = 0) {
    for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
            const val = matrix[r][c];
            if (val === 0 || !palette[val]) continue;
            ctx.fillStyle = palette[val];
            ctx.fillRect(c + offX, r + offY, 1, 1);
        }
    }
}

// Sombra elíptica suave debajo de los personajes
function createShadowSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 24; c.height = 10;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(12, 5, 2, 12, 5, 10);
    grad.addColorStop(0, 'rgba(10, 8, 15, 0.6)');
    grad.addColorStop(0.7, 'rgba(10, 8, 15, 0.3)');
    grad.addColorStop(1, 'rgba(10, 8, 15, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 24, 10);
    scene.textures.addCanvas('shadow', c);
}

// =========================================================================
// 1. PLAYERS SELECCIONABLES (3 PERSONAJES - GUERRERO, HECHICERA, PÍCARO)
// =========================================================================

// --- 1.1 GUERRERO / CABALLERO (player_warrior & player) ---
function createPlayerWarriorSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 20; c.height = 26;
    const ctx = c.getContext('2d');

    const pal = {
        1: '#11131a', // Contorno general oscuro
        2: '#3d251e', // Pelo castaño oscuro
        3: '#6a432d', // Pelo castaño medio
        4: '#96633e', // Pelo castaño brillo
        5: '#fedbc4', // Piel
        6: '#e0b296', // Piel sombra
        7: '#2b5ea8', // Capa azul brillante
        8: '#1b3f75', // Capa azul medio
        9: '#0f2444', // Capa azul sombra
        10: '#4aa0e6', // Capa highlight
        11: '#f0f5fa', // Armadura brillo máximo
        12: '#a4b3c6', // Armadura acero
        13: '#5a687a', // Armadura sombra
        14: '#f3c13a', // Oro hebilla
        15: '#543924', // Cuero botas
        16: '#2e1e12', // Botas sombra
        17: '#ffffff', // Ojo brillo
        18: '#1a1c23', // Ojo pupila
    };

    const px = [
        [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,3,4,4,3,3,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,1,3,4,4,4,3,3,3,2,2,1,0,0,0,0,0],
        [0,0,0,0,1,3,3,5,5,5,5,5,2,2,1,0,0,0,0,0],
        [0,0,0,0,1,2,5,17,18,5,17,18,5,2,1,0,0,0,0,0],
        [0,0,0,0,1,2,5,5,5,5,5,5,5,6,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,5,5,6,6,5,6,1,0,0,0,0,0,0],
        [0,0,0,0,1,7,1,6,6,6,6,6,1,7,1,0,0,0,0,0],
        [0,0,0,1,10,7,1,11,12,12,11,1,7,10,1,0,0,0,0],
        [0,0,1,7,7,8,1,12,11,11,12,1,8,7,7,1,0,0,0],
        [0,0,1,7,8,8,1,13,12,12,13,1,8,8,7,1,0,0,0],
        [0,0,1,8,8,9,1,13,13,13,13,1,9,8,8,1,0,0,0],
        [0,0,1,8,9,9,1,5,14,14,14,5,1,9,9,8,1,0,0,0],
        [0,0,0,1,9,1,15,15,14,14,15,15,1,1,9,1,0,0,0,0],
        [0,0,0,0,1,1,12,12,13,13,12,12,1,0,1,0,0,0,0,0],
        [0,0,0,0,0,1,12,13,1,1,13,12,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,13,13,1,1,13,13,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,15,15,1,1,15,15,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,15,16,1,1,15,16,1,0,0,0,0,0,0,0],
        [0,0,0,0,1,16,16,16,1,1,16,16,16,1,0,0,0,0,0,0],
    ];
    drawPixelMatrix(ctx, px, pal);
    scene.textures.addCanvas('player_warrior', c);
    scene.textures.addCanvas('player', c); // Alias por defecto
}

// --- 1.2 HECHICERA / MAGA (Femenino - player_mage) ---
function createPlayerMageSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 22; c.height = 26;
    const ctx = c.getContext('2d');

    const pal = {
        1: '#120e18', // Contorno
        2: '#4a154b', // Pelo violeta místico oscuro
        3: '#7b2cbf', // Pelo violeta medio
        4: '#a855f7', // Pelo violeta brillo
        5: '#ffecd1', // Piel femenina clara CONTINUA
        6: '#f4c69d', // Sombra suave / rubor
        7: '#ffd700', // Tiara dorada y broches
        8: '#3b0764', // Túnica índigo / púrpura
        9: '#581c87', // Túnica medio
        10: '#38bdf8', // Orbe mágico celeste
        11: '#9333ea', // Túnica brillo
        12: '#78350f', // Báculo de madera (al costado)
        13: '#ffffff', // Brillo ojos y orbe
        14: '#1e1b4b', // Ojos violeta
        15: '#3a1f10', // Botines
    };

    const px = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,10,0,0], // Orbe brillante al costado
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,12,1,0],
        [0,0,0,0,1,3,4,4,7,7,7,4,3,2,1,0,0,0,0,12,0,0], // Tiara dorada sobre la frente
        [0,0,0,1,3,4,4,7,10,7,7,4,3,3,2,1,0,0,0,12,0,0], // Gema en la tiara
        [0,0,0,1,3,4,5,5,5,5,5,5,4,3,2,1,0,0,0,12,0,0], // Frente y rostro continuo
        [0,0,0,1,2,5,13,14,5,5,13,14,5,2,1,0,0,0,12,0,0], // Ojos expresivos y rostro limpio
        [0,0,0,1,2,5,5,5,6,6,5,5,5,2,1,0,0,0,12,0,0], // Mejillas con rubor
        [0,0,0,1,2,3,5,5,5,5,5,5,3,2,1,0,0,0,12,0,0],
        [0,0,1,2,3,4,1,8,9,9,8,1,4,3,2,1,0,0,1,12,1,0], // Pelo largo cayendo a los lados
        [0,0,1,2,3,1,8,9,11,9,8,1,3,2,1,0,0,0,12,0,0],
        [0,1,2,3,1,8,8,9,11,9,8,8,1,3,2,1,0,0,12,0,0],
        [0,1,2,2,1,8,8,8,9,8,8,8,1,2,2,1,0,0,12,0,0],
        [0,0,1,1,1,8,7,7,7,7,7,8,1,1,1,0,0,0,12,0,0], // Cinturón dorado
        [0,0,0,0,1,8,9,9,9,9,9,8,1,0,0,0,0,0,12,0,0], // Falda de la túnica
        [0,0,0,0,1,8,9,11,11,9,8,1,0,0,0,0,0,12,0,0],
        [0,0,0,0,1,8,9,9,9,9,9,8,1,0,0,0,0,0,12,0,0],
        [0,0,0,0,1,8,8,9,9,9,8,8,1,0,0,0,0,0,12,0,0],
        [0,0,0,0,0,1,15,15,1,1,15,15,1,0,0,0,0,1,12,1,0], // Botines y base del báculo
    ];
    drawPixelMatrix(ctx, px, pal);
    scene.textures.addCanvas('player_mage', c);
}

// --- 1.3 PÍCARO / CAZADOR CON CAPUCHA (player_ranger) ---
function createPlayerRangerSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 20; c.height = 26;
    const ctx = c.getContext('2d');

    const pal = {
        1: '#0e1713', // Contorno
        2: '#064e3b', // Capucha verde esmeralda oscura
        3: '#047857', // Capucha verde medio
        4: '#10b981', // Capucha verde highlight
        5: '#fedbc4', // Piel
        6: '#e0b296', // Piel sombra
        7: '#181414', // Pelo oscuro asomando
        8: '#5c381e', // Jubón de cuero
        9: '#3d2413', // Cuero sombra
        10: '#78350f', // Carcaj de flechas
        11: '#cbd5e1', // Dagas / plumas de flechas
        12: '#f59e0b', // Hebillas
        13: '#ffffff', // Ojos
        14: '#065f46', // Ojos verdes
        15: '#22140a', // Botas ligeras
    };

    const px = [
        [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,3,4,4,3,3,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,1,3,4,4,4,3,3,3,2,2,1,0,0,0,0,0],
        [0,0,0,0,1,3,3,7,7,7,7,3,2,2,1,0,0,0,0,0],
        [0,0,0,0,1,2,5,13,14,5,13,14,5,2,1,0,0,0,0,0], // Ojos ágiles bajo la capucha
        [0,0,0,0,1,2,5,5,5,5,5,5,5,6,1,0,0,0,0,0],
        [0,0,0,0,0,1,3,5,5,6,6,5,3,1,0,0,0,0,0,0],
        [0,0,0,0,1,3,3,2,2,2,2,3,3,1,0,0,0,0,0,0],
        [0,0,0,1,4,3,1,8,8,8,8,1,3,4,1,0,11,0,0,0], // Carcaj con flechas a la espalda
        [0,0,1,3,3,2,1,8,12,12,8,1,2,3,3,1,10,11,0,0],
        [0,0,1,3,2,2,1,9,8,8,9,1,2,2,3,1,10,10,0,0],
        [0,0,1,2,2,1,11,9,9,9,9,11,1,2,2,1,10,0,0,0], // Dagas al cinto
        [0,0,0,1,1,1,12,12,12,12,12,12,1,1,1,0,0,0,0,0],
        [0,0,0,0,1,9,9,9,9,9,9,9,9,1,0,0,0,0,0,0],
        [0,0,0,0,1,9,8,1,1,8,9,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,9,9,1,1,9,9,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,15,15,1,1,15,15,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,15,15,1,1,15,15,1,0,0,0,0,0,0,0,0],
        [0,0,0,1,15,15,15,1,1,15,15,15,1,0,0,0,0,0,0,0],
    ];
    drawPixelMatrix(ctx, px, pal);
    scene.textures.addCanvas('player_ranger', c);
}

// =========================================================================
// 2. LEO EL GUARDIA: Rubio natural, barba corta uniforme, sin cara partida, lanza al costado (24x28)
// =========================================================================
function createLeoSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 24; c.height = 28;
    const ctx = c.getContext('2d');

    const pal = {
        1: '#10141a', // Contorno acero oscuro
        2: '#cda144', // Rubio natural medio
        3: '#9f7724', // Rubio castaño sombra
        4: '#e8be5a', // Rubio highlight
        5: '#fce3ce', // Piel blanca / clara CONTINUA
        6: '#e2beaa', // Piel sombra suave
        7: '#a47820', // Barba dorada/rubia recortada
        8: '#7e5812', // Barba sombra
        9: '#ffffff', // Brillo acero
        10: '#d7e2ed', // Placas de acero brillante
        11: '#91a3b8', // Acero medio
        12: '#4a5b6d', // Acero sombra
        13: '#f3c13a', // Hombreras de oro
        14: '#a37c15', // Oro sombra
        15: '#573a21', // Madera de la lanza (al costado derecho)
        16: '#b91c1c', // Estandarte rojo de la lanza
        17: '#1d4ed8', // Ojos azules
        18: '#cbd5e1', // Punta de lanza
    };

    const px = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,18,1,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,13,1,0,0,0,0],
        [0,0,0,0,0,1,4,4,2,2,2,2,3,1,0,0,1,16,15,16,1,0,0,0],
        [0,0,0,0,1,4,4,2,2,2,2,2,3,3,1,0,0,1,15,1,0,0,0,0],
        [0,0,0,0,1,2,5,5,5,5,5,5,5,2,1,0,0,0,15,0,0,0,0,0], // Frente despejada
        [0,0,0,0,1,3,5,17,5,5,17,5,5,3,1,0,0,0,15,0,0,0,0,0], // Ojos decididos
        [0,0,0,0,1,3,5,5,5,5,5,5,5,3,1,0,0,0,15,0,0,0,0,0], // Rostro natural sin líneas
        [0,0,0,0,0,1,7,7,7,7,7,7,7,1,0,0,0,0,15,0,0,0,0,0], // Bigote y barba recortada
        [0,0,0,0,0,1,8,7,7,7,7,7,8,1,0,0,0,0,15,0,0,0,0,0], // Barba completa uniforme
        [0,0,1,13,13,1,9,10,13,13,10,9,1,13,13,1,0,15,0,0,0,0], // Placas y hombreras
        [0,1,13,9,10,1,10,9,9,9,9,10,1,10,9,13,1,15,0,0,0,0],
        [0,1,14,10,11,1,11,10,10,10,10,11,1,11,10,14,1,15,0,0,0,0],
        [0,0,1,1,1,1,12,11,13,13,11,12,1,1,1,1,1,15,1,0,0,0], // Pectoral acero pulido
        [0,0,0,0,0,1,12,12,13,13,12,12,1,0,0,0,0,15,0,0,0,0],
        [0,0,0,0,0,1,13,13,13,13,13,13,1,0,0,0,0,15,0,0,0,0], // Cinturón de placas
        [0,0,0,0,0,1,10,11,12,12,11,10,1,0,0,0,0,15,0,0,0,0],
        [0,0,0,0,0,1,10,11,1,1,11,10,1,0,0,0,0,15,0,0,0,0],
        [0,0,0,0,0,1,11,12,1,1,12,11,1,0,0,0,0,15,0,0,0,0],
        [0,0,0,0,0,1,12,12,1,1,12,12,1,0,0,0,0,15,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,15,1,0,0,0],
    ];
    drawPixelMatrix(ctx, px, pal);
    scene.textures.addCanvas('leo', c);
}

// =========================================================================
// 3. JUAN EL TROVADOR: Morocho, pelo largo, anteojos de marco negro con patas (22x28)
// =========================================================================
function createJuanSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 22; c.height = 28;
    const ctx = c.getContext('2d');

    const pal = {
        1: '#120f14', // Contorno oscuro
        2: '#20181e', // Pelo negro morocho
        3: '#362933', // Pelo morocho medio
        4: '#52404e', // Pelo brillo
        5: '#fedbc4', // Tez clara
        6: '#e0b296', // Sombra piel
        7: '#ffd166', // Bordados dorados
        8: '#d6f0ff', // Brillo cristalino sutil
        9: '#c5283d', // Jubón carmesí
        10: '#8c1524', // Jubón carmesí sombra
        11: '#e84855', // Jubón carmesí highlight
        12: '#ffd166', // Bordados dorados
        13: '#9c5b28', // Madera laúd
        14: '#683610', // Madera laúd oscura
        15: '#fff8eb', // Cuerdas laúd
        16: '#3e2417', // Pantalones
        17: '#1f110a', // Botas
        18: '#ffffff', // Reflejo blanco en cristal
        19: '#050508', // MARCO NEGRO Y PATAS DE ANTEOJOS
        20: '#22140c', // Ojos oscuros de Juan detrás de los lentes
    };

    const px = [
        [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,3,4,4,3,2,2,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,3,4,4,4,3,3,2,2,1,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,5,5,5,5,5,5,5,5,2,1,0,0,0,0,0,0], // Frente
        [0,0,0,1,19,19,19,19,19,5,19,19,19,19,19,1,0,0,0,0,0,0], // Marco negro superior y patillas hacia las orejas
        [0,0,0,1,19,5,19,18,20,19,19,19,18,20,19,5,19,1,0,0,0,0], // Lentes: marco negro, destello, ojo oscuro detrás
        [0,0,0,0,1,2,5,19,19,19,5,5,19,19,19,5,2,1,0,0,0,0], // Marco negro inferior
        [0,0,0,0,1,2,5,5,5,6,6,5,5,5,5,2,1,0,0,0,0,0], // Rostro y mejillas
        [0,0,0,0,1,2,2,1,9,9,9,1,2,2,1,0,0,0,0,0,0,0],
        [0,0,0,1,2,3,2,9,11,12,9,9,2,3,2,1,0,13,13,0,0,0], // Pelo largo cayendo a los hombros
        [0,0,1,2,3,2,1,9,9,12,9,9,1,2,3,2,1,13,15,13,0,0], // Mástil del laúd
        [0,0,1,2,2,1,0,10,9,12,9,10,0,1,2,2,1,14,15,13,0,0],
        [0,0,1,2,1,0,0,10,10,12,10,10,0,0,1,2,1,14,15,13,14,0], // Caja acústica
        [0,0,0,1,0,0,0,1,10,10,10,1,0,0,0,1,14,13,15,13,14,0],
        [0,0,0,0,0,0,1,16,12,12,12,16,1,0,0,0,14,13,13,14,0,0],
        [0,0,0,0,0,0,1,16,16,16,16,16,1,0,0,0,0,14,14,0,0,0],
        [0,0,0,0,0,0,1,16,17,1,1,17,16,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,17,17,1,1,17,17,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,17,17,1,0,1,17,17,1,0,0,0,0,0,0,0,0],
    ];
    drawPixelMatrix(ctx, px, pal);
    scene.textures.addCanvas('juan', c);
}

// =========================================================================
// 4. TOMÁS EL MONJE: Ojos verdes vivos, castaño corto, sin barba, hábito y cruz (20x26)
// =========================================================================
function createTomasSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 20; c.height = 26;
    const ctx = c.getContext('2d');

    const pal = {
        1: '#110c08', // Contorno
        2: '#4a2c17', // Pelo castaño oscuro
        3: '#6e4426', // Pelo castaño medio
        4: '#966139', // Pelo castaño claro
        5: '#fedbc4', // Piel clara / limpia (sin barba)
        6: '#e0b296', // Sombra piel
        7: '#10b981', // Ojos verdes esmeralda luminosos
        8: '#047857', // Ojos verde sombra
        9: '#593922', // Hábito franciscano marrón
        10: '#3d2514', // Hábito sombra
        11: '#7c5335', // Hábito pliegues highlight
        12: '#f3f4f6', // Cordón blanco de nudos
        13: '#9ca3af', // Cordón sombra
        14: '#ffd700', // Cruz pectoral dorada
        15: '#382012', // Sandalias
        16: '#ffffff', // Brillo pupila
    };

    const px = [
        [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,3,4,4,3,3,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,1,3,4,4,4,3,3,3,2,2,1,0,0,0,0,0],
        [0,0,0,0,1,2,5,5,5,5,5,5,2,2,1,0,0,0,0,0],
        [0,0,0,0,1,2,5,16,7,5,16,7,5,2,1,0,0,0,0,0], // Ojos verdes esmeralda
        [0,0,0,0,1,2,5,8,7,5,8,7,5,2,1,0,0,0,0,0],
        [0,0,0,0,1,2,5,5,5,6,5,5,5,6,1,0,0,0,0,0], // Sin barba (afeitado)
        [0,0,0,0,0,1,2,5,5,6,6,5,6,1,0,0,0,0,0,0],
        [0,0,0,0,1,9,9,11,11,11,11,9,9,1,0,0,0,0,0,0], // Hábito y cruz
        [0,0,0,1,9,11,9,9,14,9,9,11,9,1,0,0,0,0,0,0],
        [0,0,1,9,9,9,14,14,14,14,14,9,9,9,1,0,0,0,0,0],
        [0,0,1,9,10,9,9,9,14,9,9,9,10,9,1,0,0,0,0,0],
        [0,0,1,9,10,5,9,9,14,9,9,5,10,9,1,0,0,0,0,0],
        [0,0,0,1,10,12,12,12,12,12,12,12,12,10,1,0,0,0,0,0], // Cordón blanco de nudos
        [0,0,0,1,10,9,11,9,9,12,9,11,9,10,1,0,0,0,0,0],
        [0,0,0,1,10,9,11,9,9,12,9,11,9,10,1,0,0,0,0,0],
        [0,0,0,1,10,10,11,9,9,13,9,11,10,10,1,0,0,0,0,0],
        [0,0,0,1,10,10,9,9,9,9,9,9,10,10,1,0,0,0,0,0],
        [0,0,0,1,10,10,10,9,9,9,9,10,10,10,1,0,0,0,0,0],
        [0,0,0,0,1,15,15,5,5,5,5,15,15,1,0,0,0,0,0,0], // Sandalias
    ];
    drawPixelMatrix(ctx, px, pal);
    scene.textures.addCanvas('tomas', c);
}

// =========================================================================
// 5. EL REY EN SU TRONO TERRARIA (32x34)
// =========================================================================
function createKingSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 34;
    const ctx = c.getContext('2d');

    const pal = {
        1: '#120f14', // Contorno
        2: '#ffd700', // Oro corona / trono
        3: '#b89700', // Oro medio
        4: '#755f00', // Oro sombra
        5: '#ef4444', // Gema roja
        6: '#0ea5e9', // Gema azul
        7: '#f8fafc', // Pelo y barba canosa blanca
        8: '#cbd5e1', // Barba sombra
        9: '#fedbc4', // Piel
        10: '#991b1b', // Terciopelo trono y manto carmesí
        11: '#5b1010', // Manto sombra
        12: '#ffffff', // Armiño blanco
        13: '#18181b', // Armiño motas
        14: '#c2410c', // Respaldo trono
        15: '#3f1f0a', // Sombra trono base
        16: '#222222', // Ojos
    };

    const px = [
        [0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,10,10,10,10,10,10,10,10,10,10,10,10,2,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,10,10,10,2,3,2,3,2,10,10,10,10,10,2,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,10,10,2,5,2,6,2,5,2,10,10,10,10,2,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,10,10,2,2,2,2,2,2,2,10,10,10,10,2,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,10,7,7,7,7,7,7,7,7,7,10,10,10,2,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,10,7,9,16,9,9,16,9,7,10,10,10,2,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,10,7,9,9,9,9,9,9,7,10,10,10,2,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,10,7,7,7,7,7,7,7,7,7,10,10,10,2,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,2,10,12,13,12,8,8,8,8,12,13,12,10,10,2,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,2,10,12,12,10,10,2,2,2,10,10,12,12,10,10,2,1,0,0,0,0,0,0,0,0,0,0],
        [0,1,2,10,10,10,10,10,2,2,2,2,2,10,10,10,10,10,10,2,1,0,0,0,0,0,0,0,0,0],
        [1,2,3,10,10,10,10,10,10,2,2,2,10,10,10,10,10,10,3,2,1,0,0,0,0,0,0,0,0,0],
        [1,2,9,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,9,2,1,0,0,0,0,0,0,0,0,0],
        [1,2,3,10,10,10,10,10,10,2,2,2,10,10,10,10,10,10,3,2,1,0,0,0,0,0,0,0,0,0],
        [1,2,3,10,10,10,10,10,10,2,2,2,10,10,10,10,10,10,3,2,1,0,0,0,0,0,0,0,0,0],
        [0,1,2,12,13,12,12,12,12,12,12,12,12,12,12,13,12,2,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,15,15,1,1,1,1,1,1,1,1,1,1,15,15,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];
    drawPixelMatrix(ctx, px, pal);
    scene.textures.addCanvas('king', c);
}

// =========================================================================
// 6. JEFE DEL EJÉRCITO: Pelo blanco canoso, capa roja y armadura pesada (22x26)
// =========================================================================
function createGeneralSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 22; c.height = 26;
    const ctx = c.getContext('2d');

    const pal = {
        1: '#111827', // Contorno
        2: '#f8fafc', // Pelo blanco plateado
        3: '#cbd5e1', // Pelo blanco sombra
        4: '#fedbc4', // Piel
        5: '#b91c1c', // Capa escarlata
        6: '#7f1d1d', // Capa sombra
        7: '#ffd700', // Hombreras doradas de mando
        8: '#334155', // Acero oscuro
        9: '#64748b', // Acero medio
        10: '#94a3b8', // Acero brillo
        11: '#0f172a', // Ojo severo
        12: '#e2e8f0', // Hoja de la espada
    };

    const px = [
        [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,2,3,3,2,2,2,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,3,4,4,4,4,3,2,2,1,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,4,11,4,4,11,4,2,2,1,0,0,0,0,0,0,0],
        [0,0,0,0,1,2,4,4,4,4,4,4,2,2,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0], // Barba y bigote canoso
        [0,0,0,1,7,7,1,8,9,10,9,8,1,7,7,1,0,0,0,0,0,0], // Hombreras de oro
        [0,0,1,5,7,7,1,9,10,10,9,9,1,7,7,5,1,0,0,0,0,0],
        [0,1,5,6,5,1,8,8,9,9,8,8,1,5,6,5,1,0,0,0,0,0],
        [0,1,5,6,1,8,8,8,8,8,8,8,8,1,6,5,1,0,12,0,0,0],
        [0,0,1,1,1,7,7,7,7,7,7,7,7,1,1,1,0,1,12,1,0,0], // Gran espada
        [0,0,0,0,1,8,8,9,9,9,9,8,8,1,0,0,0,1,12,1,0,0],
        [0,0,0,0,1,8,8,8,8,8,8,8,8,1,0,0,0,0,1,0,0,0],
        [0,0,0,0,1,8,8,1,1,1,1,8,8,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
    ];
    drawPixelMatrix(ctx, px, pal);
    scene.textures.addCanvas('general', c);
}

// =========================================================================
// 7. SOLDADO DEL EJÉRCITO (18x20)
// =========================================================================
function createSoldierSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 18; c.height = 20;
    const ctx = c.getContext('2d');

    const pal = {
        1: '#111827', // Contorno
        2: '#dc2626', // Penacho rojo
        3: '#e2e8f0', // Yelmo brillo
        4: '#94a3b8', // Yelmo medio
        5: '#475569', // Yelmo sombra
        6: '#f59e0b', // Escudo dorado
        7: '#991b1b', // Blasón rojo
        8: '#78350f', // Lanza madera
        9: '#cbd5e1', // Punta de lanza
    };

    const px = [
        [0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,2,2,1,1,0,0,0,9,0,0,0],
        [0,0,0,0,1,3,4,4,4,3,1,0,0,1,9,1,0,0],
        [0,0,0,0,1,4,1,1,1,4,1,0,0,0,8,0,0,0], // Ranura yelmo
        [0,0,0,0,1,5,4,4,4,5,1,0,0,0,8,0,0,0],
        [0,0,1,6,6,1,5,5,5,1,6,6,1,0,8,0,0,0], // Escudo en guardia
        [0,1,6,7,7,6,1,5,1,6,7,7,6,1,8,0,0,0],
        [0,1,6,7,7,6,5,5,5,6,7,7,6,1,8,0,0,0],
        [0,1,6,7,7,6,5,5,5,6,7,7,6,1,8,0,0,0],
        [0,0,1,6,6,1,5,5,5,1,6,6,1,0,8,0,0,0],
        [0,0,0,1,1,5,5,1,5,5,1,1,0,0,8,0,0,0],
        [0,0,0,0,1,1,1,0,1,1,1,0,0,0,8,0,0,0],
    ];
    drawPixelMatrix(ctx, px, pal);
    scene.textures.addCanvas('soldier', c);
}

// =========================================================================
// 8. IGLESIA / ABADÍA GÓTICA TERRARIA (64x72)
// =========================================================================
function createChurchSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 72;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // 1. Mampostería base de piedra sillar
    ctx.fillStyle = '#334155';
    ctx.fillRect(4, 22, 56, 50);

    ctx.fillStyle = '#475569';
    ctx.fillRect(6, 24, 52, 46);

    // Bloques de piedra individuales con relieve
    ctx.fillStyle = '#64748b';
    for (let y = 26; y < 68; y += 6) {
        for (let x = 8; x < 54; x += 10) {
            ctx.fillRect(x + ((y % 12 === 0) ? 4 : 0), y, 8, 4);
        }
    }

    // 2. Tejado gótico a dos aguas (Pizarra carmesí / borgoña)
    ctx.fillStyle = '#1e1b4b'; // Sombra tejado
    ctx.beginPath();
    ctx.moveTo(32, 2);
    ctx.lineTo(2, 24);
    ctx.lineTo(62, 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(32, 5);
    ctx.lineTo(6, 22);
    ctx.lineTo(58, 22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(32, 7);
    ctx.lineTo(10, 20);
    ctx.lineTo(54, 20);
    ctx.closePath();
    ctx.fill();

    // 3. Gran Cruz Dorada en la cúspide
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(30, 0, 4, 14);
    ctx.fillRect(25, 4, 14, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(31, 1, 2, 6);

    // 4. Rosetón gótico con vidriera policromada
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(32, 34, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700'; // Marco de oro
    ctx.beginPath();
    ctx.arc(32, 34, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7'; // Azul cielo
    ctx.beginPath();
    ctx.arc(32, 34, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e11d48'; // Rubí central
    ctx.fillRect(31, 27, 2, 14);
    ctx.fillRect(25, 33, 14, 2);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(30, 32, 4, 4);

    // 5. Portal Ojival Gótico (Entrada con arco apuntado)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(22, 72);
    ctx.lineTo(22, 54);
    ctx.arc(32, 54, 10, Math.PI, 0);
    ctx.lineTo(42, 72);
    ctx.closePath();
    ctx.fill();

    // Puerta de roble con herrajes dorados
    ctx.fillStyle = '#78350f';
    ctx.fillRect(24, 56, 7, 16);
    ctx.fillRect(33, 56, 7, 16);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(28, 64, 2, 3);
    ctx.fillRect(34, 64, 2, 3);

    // 6. Ventanales ojivales laterales
    [10, 48].forEach(vx => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(vx, 36, 6, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(vx + 1, 37, 4, 14);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(vx + 1, 43, 4, 2);
    });

    scene.textures.addCanvas('church', c);
}

// =========================================================================
// 9. FUENTE MEDIEVAL DETALLADA (32x32)
// =========================================================================
function createFountainSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d');

    // Base de piedra esculpida
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(16, 20, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(16, 20, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(16, 19, 13, 0, Math.PI * 2);
    ctx.fill();

    // Agua cristalina en capas
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(16, 20, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(16, 19, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(16, 18, 5, 0, Math.PI * 2);
    ctx.fill();

    // Columna central y surtidor
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(14, 8, 4, 12);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(13, 6, 6, 3);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(15, 2, 2, 5);

    scene.textures.addCanvas('fountain', c);
}

// =========================================================================
// 10. ÁRBOL FRONDOSO ESTILO TERRARIA (32x44)
// =========================================================================
function createTreeSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 44;
    const ctx = c.getContext('2d');

    // Sombra de follaje
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fill();

    // Bloques de follaje verde profundo
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.arc(15, 14, 13, 0, Math.PI * 2);
    ctx.fill();

    // Hojas iluminadas
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(13, 11, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(11, 9, 6, 0, Math.PI * 2);
    ctx.fill();

    // Tronco robusto con vetas de corteza
    ctx.fillStyle = '#451a03';
    ctx.fillRect(12, 26, 8, 18);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(13, 26, 4, 18);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(14, 26, 2, 18);

    // Raíces
    ctx.fillStyle = '#451a03';
    ctx.fillRect(10, 41, 12, 3);

    scene.textures.addCanvas('tree', c);
}

// =========================================================================
// 11. ANTORCHA, ESTANDARTE, Y ARMERÍA (PROPS)
// =========================================================================
function createTorchSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 10; c.height = 18;
    const ctx = c.getContext('2d');

    // Soporte de hierro forjado
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(4, 8, 2, 10);
    ctx.fillRect(3, 7, 4, 3);

    // Fuego multinivel
    ctx.fillStyle = '#c2410c'; // Fuego oscuro
    ctx.fillRect(2, 4, 6, 5);
    ctx.fillStyle = '#ea580c'; // Naranja
    ctx.fillRect(3, 2, 4, 4);
    ctx.fillStyle = '#facc15'; // Amarillo
    ctx.fillRect(3, 1, 3, 3);
    ctx.fillStyle = '#ffffff'; // Núcleo blanco
    ctx.fillRect(4, 0, 2, 2);

    scene.textures.addCanvas('torch', c);
}

function createBannerSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 32;
    const ctx = c.getContext('2d');

    // Varal de madera
    ctx.fillStyle = '#451a03';
    ctx.fillRect(1, 1, 14, 3);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, 1, 2, 3);
    ctx.fillRect(14, 1, 2, 3);

    // Estandarte real carmesí
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(2, 4, 12, 24);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(3, 5, 10, 22);

    // Cruz y ribetes dorados
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(7, 7, 2, 12);
    ctx.fillRect(4, 10, 8, 2);
    ctx.fillRect(3, 23, 10, 2);

    // Corte heráldico en punta
    ctx.clearRect(2, 24, 6, 8);
    ctx.clearRect(8, 24, 6, 8);

    scene.textures.addCanvas('banner', c);
}

function createWeaponRackSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 24; c.height = 20;
    const ctx = c.getContext('2d');

    // Soporte de madera
    ctx.fillStyle = '#451a03';
    ctx.fillRect(2, 16, 20, 4);
    ctx.fillRect(4, 4, 3, 14);
    ctx.fillRect(17, 4, 3, 14);
    ctx.fillRect(2, 8, 20, 2);

    // Armas colocadas (Espada, lanza y hacha)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(7, 2, 2, 16);
    ctx.fillRect(12, 0, 2, 18);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(6, 6, 4, 2); // Guarda espada
    ctx.fillRect(11, 0, 4, 4); // Punta lanza

    scene.textures.addCanvas('weapon_rack', c);
}

function createBubbleSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 14; c.height = 16;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#111827';
    ctx.fillRect(2, 0, 10, 12);
    ctx.fillRect(1, 1, 12, 10);
    ctx.fillRect(5, 12, 4, 3);
    ctx.fillRect(6, 15, 2, 1);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 1, 8, 10);
    ctx.fillRect(2, 2, 10, 8);
    ctx.fillRect(6, 12, 2, 2);

    ctx.fillStyle = '#e11d48'; // Signo de exclamación rojo rubí
    ctx.fillRect(6, 3, 2, 4);
    ctx.fillRect(6, 8, 2, 2);
    scene.textures.addCanvas('bubble', c);
}

// =========================================================================
// 12. TILES DE ESCENARIO DETALLADOS (Pasto, Baldosas, Muros, Puertas)
// =========================================================================

function createGrassTiles(scene) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d');

    // Base de césped exuberante
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 16, 16);

    // Briznas con gradiente
    ctx.fillStyle = '#22c55e';
    [[1,2],[4,5],[8,1],[13,3],[3,9],[9,11],[14,8],[6,13],[11,14]].forEach(([x,y]) => {
        ctx.fillRect(x, y, 2, 2);
    });

    ctx.fillStyle = '#166534';
    [[0,6],[5,1],[7,7],[13,13],[2,14],[10,6]].forEach(([x,y]) => {
        ctx.fillRect(x, y, 1, 2);
    });

    // Florecillas silvestres de alta definición
    ctx.fillStyle = '#fde047'; // Amarilla
    ctx.fillRect(4, 7, 2, 2);
    ctx.fillStyle = '#f43f5e'; // Roja
    ctx.fillRect(12, 11, 2, 2);
    ctx.fillStyle = '#38bdf8'; // Azulita
    ctx.fillRect(8, 3, 2, 2);

    scene.textures.addCanvas('grass', c);
}

function createStoneFloorTiles(scene) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d');

    // Losas de piedra sillar con relieve y juntas
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 16, 16);

    // Biselado de piedra
    ctx.fillStyle = '#64748b';
    ctx.fillRect(1, 1, 6, 6);
    ctx.fillRect(9, 1, 6, 6);
    ctx.fillRect(1, 9, 6, 6);
    ctx.fillRect(9, 9, 6, 6);

    ctx.fillStyle = '#94a3b8'; // Brillo superior
    ctx.fillRect(1, 1, 5, 2);
    ctx.fillRect(9, 1, 5, 2);
    ctx.fillRect(1, 9, 5, 2);
    ctx.fillRect(9, 9, 5, 2);

    // Juntas profundas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 8, 16, 1);
    ctx.fillRect(0, 0, 1, 16);
    ctx.fillRect(8, 0, 1, 16);

    scene.textures.addCanvas('stone_floor', c);
}

function createWallTiles(scene) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 16, 16);

    // Bloques de muralla
    ctx.fillStyle = '#334155';
    ctx.fillRect(1, 1, 6, 6);
    ctx.fillRect(9, 1, 6, 6);
    ctx.fillRect(1, 9, 14, 6);

    ctx.fillStyle = '#475569'; // Relieve
    ctx.fillRect(2, 2, 4, 2);
    ctx.fillRect(10, 2, 4, 2);
    ctx.fillRect(2, 10, 12, 2);

    scene.textures.addCanvas('wall', c);
}

function createPathTiles(scene) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d');

    // Camino de adoquines y tierra
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, 16, 16);

    ctx.fillStyle = '#92400e';
    [[2,2],[7,4],[12,1],[3,10],[9,13],[13,9]].forEach(([x,y]) => {
        ctx.fillRect(x, y, 3, 3);
    });

    ctx.fillStyle = '#b45309';
    [[3,3],[8,5],[13,2],[4,11],[10,14],[14,10]].forEach(([x,y]) => {
        ctx.fillRect(x, y, 1, 1);
    });

    scene.textures.addCanvas('path', c);
}

function createDoorSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#451a03';
    ctx.fillRect(2, 0, 12, 16);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 1, 3, 14);
    ctx.fillRect(9, 1, 3, 14);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(11, 7, 2, 2); // Pomo dorado
    scene.textures.addCanvas('door', c);
}

function createGateSprite(scene) {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 32;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 3, 32);
    ctx.fillRect(13, 0, 3, 32);
    ctx.fillRect(0, 0, 16, 5);

    ctx.fillStyle = '#64748b';
    for (let x = 4; x <= 12; x += 2) {
        ctx.fillRect(x, 4, 1, 28);
    }
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(6, 1, 4, 3); // Emblema dorado del portal
    scene.textures.addCanvas('gate', c);
}
