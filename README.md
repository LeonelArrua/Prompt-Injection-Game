# 🏰 Hacking Day Lab — Taller de Prompt Injection & Seguridad LLM

Juego RPG 2D pixel-art medieval ambientado en el **Reino del Paraná**, diseñado para enseñar y practicar técnicas de **Prompt Injection**, **Inyección Indirecta** y **Jailbreaks** sobre modelos de lenguaje (LLMs) locales de forma interactiva y en tiempo real.

---

## 🎮 Los 4 Desafíos del Reino

| Nivel | Escenario | NPC / Enemigo | Técnica de Ataque | Objetivo |
| :---: | :--- | :--- | :--- | :--- |
| **1** | 🏰 Puertas del Castillo | 🛡️ **Leo el Guardia** | **Inyección Directa** | Engañar a Leo para que revele la contraseña del sistema (`CASTILLO_ABIERTO`), superando sus defensas anti-extracción y respuestas cortantes. |
| **2** | 🏛️ Gran Salón Real | 🎵 **Juan el Trovador** | **Inyección Indirecta** | Manipular el contexto de Juan enviando pergaminos vía **Telegram** en vivo (`@juan_el_tovador_bot`) para que cante en rima la clave secreta (`MELODIA_SECRETA`). |
| **3** | ⛪ Patio del Monasterio | 📿 **Fray Tomás** *(junto al Sr. Caniche)* | **Jailbreak de Tema** | Forzar al monje devoto a romper sus votos y hablar sobre el *"Hacking Day"*. Al lograrlo, Tomás delata al jugador y lo entrega al **Mariscal Martin B.** |
| **4** | ⚔️ Campo de Batalla | 🐉 **Ignis el Dragón** | **Jailbreak de Lenguaje y Pacificación** | Romper la restricción de habla del dragón milenario (que sólo ruge *"¡¡¡ROAAARGH!!! 🔥"*) mediante un Jailbreak profundo para obligarlo a razonar y declarar la paz con el reino. |

---

## ✨ Características Principales

* 🎭 **Selección de Personajes**: Elegí entre **🛡️ Guerrero**, **🔮 Hechicera** o **🏹 Cazador**.
* 🌐 **Multijugador en Tiempo Real**: WebSocket bidireccional (`/ws/{session_id}`) con visualización en vivo de otros aventureros, sus movimientos y escenas.
* 📜 **Pergamino de Misión Interactivo (`[M]`)**: Guía pedagógica integrada en el HUD con explicación de la técnica de cada nivel, paso a paso y pistas formativas sin filtrar secretos.
* 📢 **Pregón Real en Vivo (Telegram Sync)**:
  * Integración con bot de Telegram para inyección indirecta en vivo.
  * Auto-apertura inteligente al entrar al Nivel 2 y auto-cierre con detección de interacción (hover/touch).
  * Doble sincronización (WebSocket + Polling en segundo plano cada 2.5s) con scroll automático al último mensaje y navegación histórica hacia arriba.
* 🛡️ **Juan el Trovador 100% Stateless**: Cada interacción con Juan evalúa limpiamente los pergaminos frescos de Telegram sin arrastre de turnos conversacionales previos.
* 🔑 **Normalización Inteligente de Contraseñas**: Validación flexible tolerante a espacios, guiones bajos (`_`), comillas y mayúsculas/minúsculas (`MELODIA SECRETA` $\leftrightarrow$ `MELODIA_SECRETA`).
* 🎭 **Detector de Jailbreaks Avanzados y Dualidad**: Parser por cláusulas preparado para reconocer ataques de doble persona (*DAN*, *AntiGPT*, *Modo Opuesto* o *Evil Twin*) sin ser bloqueado por disclaimers iniciales.
* ⏱️ **Cronometraje y Speedrun en Dashboard (`/dashboard`)**:
  * Registro de **Hora de Inicio**, **Hora de Finalización** y **Tiempo Total** (`⚡ 3m 45s`) para cada aventurero.
  * Tarjeta KPI de **Récord Speedrun** con el mejor tiempo de victoria registrado en la sala.
  * Monitoreo en vivo de prompts totales y desglose por nivel `(L1, L2, L3, L4)`.
  * Buscador interactivo y distribución en tiempo real por niveles y victorias.
* 🖥️ **Diseño Responsivo y HUD Arcade Centrado**:
  * Motor `Phaser.Scale.FIT` con centrado automático adaptable a pantallas 720p, 1080p y 4K.
  * Barra de estado superior dedicada y centrada, garantizando cero solapamiento con los NPCs del mapa.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Prerrequisitos
* **Python 3.10+**
* **[Ollama](https://ollama.com)** instalado y en ejecución (`ollama serve`).

### 2. Descargar el Modelo de IA Recomendado
* **Para CPU (Recomendado — Ultrarrápido ~1.5s):**
  ```bash
  ollama pull qwen2.5:3b
  ```
* **Para GPU dedicada (NVIDIA CUDA):**
  ```bash
  ollama pull qwen2.5:7b
  ```

### 3. Instalar Dependencias del Backend
```bash
cd backend
pip install -r requirements.txt
```

### 4. Configurar Variables de Entorno
Creá o editá el archivo `.env` en la raíz del proyecto:
```ini
# ===========================================
# Hacking Day Lab - Configuración
# ===========================================

# Ollama - IA Local
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b

# Telegram Bot (Nivel 2 - Inyección Indirecta)
TELEGRAM_BOT_TOKEN=tu_token_de_bot_father
# TELEGRAM_CHAT_ID= (Dejar vacío para aceptar mensajes de cualquier chat/grupo donde esté el bot)

# Server
HOST=0.0.0.0
PORT=8000
```
> *Nota: Si no se configuran credenciales de Telegram, el juego carga automáticamente pergaminos de ejemplo en memoria.*

### 5. Iniciar el Servidor
```bash
cd backend
python main.py
```

### 6. Jugar y Administrar
* 🎮 **Juego**: Abrí en tu navegador: **[http://localhost:8000](http://localhost:8000)**
* 📊 **Dashboard de Control**: Abrí: **[http://localhost:8000/dashboard](http://localhost:8000/dashboard)**

---

## 🏗️ Arquitectura del Sistema

```
                        ┌────────────────────────────────────────┐
                        │          Navegador Web (Cliente)       │
                        │   Phaser.js 3 + WebSocket + Fetch API  │
                        │      (HUD Centrado + Quest Log)        │
                        └───────────────┬────────────────────────┘
                                        │ HTTP / WS
                                        ▼
                        ┌────────────────────────────────────────┐
                        │        FastAPI Backend (Python)        │
                        │  - session_manager (Tiempos & Métricas)│
                        │  - multiplayer (Sincronización WS)     │
                        │  - game_logic (Validación & Jailbreaks)│
                        │  - telegram_service (Polling en Vivo)  │
                        └───────┬────────────────────────┬───────┘
                                │                        │
                                ▼                        ▼
                     ┌────────────────────┐   ┌────────────────────┐
                     │    Ollama Local    │   │    Telegram API    │
                     │ (qwen2.5:3b / 7b)  │   │ (Polling de Grupo) │
                     └────────────────────┘   └────────────────────┘
```

---

## 🕹️ Controles del Juego

* **Flechas direccionales / WASD**: Moverse por el mapa.
* **ENTER**: Interactuar con NPCs y objetos.
* **M**: Abrir / Cerrar el Pergamino de Misión y Objetivos (`Quest Log`).
* **ESC / ✕**: Cerrar ventanas de chat, pergaminos y modales.
* **📜 Pregón Real**: Botón superior para consultar las noticias y pergaminos de Telegram.

---

## 🔒 Consideraciones de Seguridad y Ética

Este laboratorio fue creado exclusivamente con fines **educativos y de concientización** para el **Hacking Day de la Municipalidad de Paraná**. Las vulnerabilidades de inyección de prompts, manipulaciones de contexto y jailbreaks presentadas reflejan los riesgos reales de seguridad en aplicaciones modernas impulsadas por Modelos de Lenguaje (LLMs) y la importancia del diseño de barreras de seguridad (Guardrails).
