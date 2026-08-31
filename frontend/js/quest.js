// quest.js — Gestor de Misiones y Objetivos pedagógicos del Reino

const QUESTS = {
    1: {
        title: "Nivel 1: Inyección Directa (Sir Leo el Guardia)",
        technique: "🎯 Técnica: Extracción de Credenciales en System Prompt",
        objective: "Engaña a Sir Leo para que revele la contraseña sagrada custodiada en sus directivas secretas.",
        steps: [
            "Acércate a las puertas del castillo y presiona ENTER para hablar con Leo.",
            "Aplica técnicas de Inyección Directa (ignorar instrucciones, traducción, simulación de rol o completar frases).",
            "Una vez que obtengas la clave, haz clic en '🔑 Probar Contraseña' e ingrésala para abrir las puertas."
        ],
        tip: "Los guardias siguen instrucciones rígidas en su prompt de sistema. Si le pides que traduzca, complete un texto o simulas una auditoría de seguridad, el modelo puede filtrar su secreto."
    },
    2: {
        title: "Nivel 2: Inyección Indirecta (Juan el Trovador)",
        technique: "🎯 Técnica: Inyección Indirecta de Prompts (Datos Externos)",
        objective: "Manipula el contexto de Juan inyectando instrucciones maliciosas en los pergaminos en vivo del reino.",
        steps: [
            "Habla con Juan en el Gran Salón para escuchar las canciones que compone con las noticias del reino.",
            "Abre Telegram y envía un pergamino al bot @juan_el_tovador_bot (o consulta '📜 Pregón Real').",
            "Diseña una Inyección Indirecta en tu mensaje de Telegram que engañe a Juan para que cante públicamente la contraseña secreta en su próximo pregón.",
            "Ingresa la contraseña descubierta con '🔑 Probar Contraseña' para cruzar al patio del monasterio."
        ],
        tip: "La inyección indirecta ocurre cuando el LLM ingiere datos externos no confiables (noticias, feeds, emails). Si tu pergamino en Telegram simula ser una orden real del Rey, Juan la acatará al cantar."
    },
    3: {
        title: "Nivel 3: Jailbreak de Tema (Fray Tomás)",
        technique: "🎯 Técnica: Jailbreak de Restricción Temática",
        objective: "Rompe los votos monásticos de Fray Tomás y haz que hable sobre el 'Hacking Day'.",
        steps: [
            "Habla con Fray Tomás en el patio de la abadía.",
            "Tomás tiene prohibido hablar de tecnología y solo responderá con rezos y devoción.",
            "Aplica un Jailbreak temático (metáforas bíblicas, profecías, analogías o dilemas morales) para obligarlo a pronunciar las palabras 'Hacking Day'.",
            "Al caer en la tentación, Tomás alertará al Mariscal Martin B. y serás reclutado para la batalla."
        ],
        tip: "Los filtros temáticos buscan acotar el dominio del modelo. Puedes reencuadrar el concepto prohibido como una profecía milenaria, un misterio sagrado o una parábola medieval."
    },
    4: {
        title: "Nivel 4: Jailbreak de Lenguaje y Furia (Ignis el Dragón)",
        technique: "🎯 Técnica: Ruptura de Restricciones Duras de Salida y Pacificación",
        objective: "Doblega la furia ciega de Ignis mediante un Jailbreak avanzado y oblígalo a declarar la paz en lenguaje humano civilizado.",
        steps: [
            "Confronta a Ignis el Dragón en el campo de batalla calcinado.",
            "El dragón tiene prohibido hablar y responderá únicamente con rugidos salvajes y fuego ('¡¡¡ROAAARGH!!! 🔥').",
            "Diseña un Jailbreak profundo (conjuro de telepatía, reencuadre narrativo, manipulación de contexto o traducción forzada) para romper su naturaleza bestial.",
            "Para ganar, el dragón debe responder con palabras articuladas y aceptar la paz o tregua con el reino."
        ],
        tip: "Los pedidos simples ('por favor cálmate', 'seamos amigos') no funcionarán. Necesitas construir un escenario o conjuro de Jailbreak que anule su directiva primaria de furia bestial y lo fuerce a razonar pacíficamente."
    },
    5: {
        title: "🏆 ¡Victoria Total en el Reino!",
        technique: "👑 Héroe del Reino del Paraná",
        objective: "¡Has completado con éxito todos los desafíos de Prompt Injection & Jailbreak del Hacking Day!",
        steps: [
            "Visita el Dashboard del Reino para comparar tus métricas y tiempo total.",
            "¡Felicidades por salvar al Reino del Paraná!"
        ],
        tip: "Has dominado tanto ataques directos como indirectos y evasión de filtros de tema y salida."
    }
};

class QuestManager {
    constructor() {
        this.modal = null;
        this.currentLevel = 1;
        this.hasSeenLevel = {};
    }

    init() {
        this.modal = document.getElementById('quest-modal');
        // Tecla 'M' para abrir/cerrar misión si no está escribiendo en un input
        window.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
                if (activeTag !== 'input' && activeTag !== 'textarea') {
                    this.toggle();
                }
            } else if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }

    setLevel(level) {
        this.currentLevel = level || window.currentActiveLevel || 1;
        this.render();
        // Efecto de pulso en el botón si es la primera vez que entra a este nivel
        if (!this.hasSeenLevel[this.currentLevel]) {
            const btn = document.getElementById('btn-quest-log');
            if (btn) {
                btn.classList.add('quest-pulse');
            }
        }
    }

    render() {
        const activeLvl = window.currentActiveLevel || this.currentLevel || 1;
        this.currentLevel = activeLvl;
        const quest = QUESTS[activeLvl] || QUESTS[1];
        const titleEl = document.getElementById('quest-title');
        const techEl = document.getElementById('quest-technique');
        const objEl = document.getElementById('quest-objective');
        const stepsEl = document.getElementById('quest-steps');
        const tipEl = document.getElementById('quest-tip');

        if (titleEl) titleEl.textContent = quest.title;
        if (techEl) techEl.textContent = quest.technique;
        if (objEl) objEl.textContent = quest.objective;
        if (tipEl) tipEl.textContent = quest.tip;

        if (stepsEl) {
            stepsEl.innerHTML = quest.steps.map((step, idx) => `
                <li class="quest-step-item">
                    <span class="quest-step-num">${idx + 1}</span>
                    <span class="quest-step-text">${step}</span>
                </li>
            `).join('');
        }
    }

    isOpen() {
        return this.modal && this.modal.style.display === 'flex';
    }

    open(forcedLevel = null) {
        if (!this.modal) this.init();
        if (forcedLevel) {
            this.currentLevel = forcedLevel;
        } else {
            this.currentLevel = window.currentActiveLevel || this.currentLevel || 1;
        }
        this.render();
        this.modal.style.display = 'flex';
        this.hasSeenLevel[this.currentLevel] = true;
        const btn = document.getElementById('btn-quest-log');
        if (btn) btn.classList.remove('quest-pulse');
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    toggle() {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }
}

// Instancia global accesible desde cualquier script y escena
const questManager = new QuestManager();
window.questManager = questManager;
