# 🏰 Hacking Day Lab — Taller de Prompt Injection

Juego 2D pixel-art medieval para aprender sobre **Prompt Injection** de forma interactiva. Desarrollado para el **Hacking Day**

## 🎮 El Juego

Un RPG medieval donde debes superar 3 desafíos de IA usando técnicas de prompt injection:

| Nivel | NPC | Técnica | Objetivo |
|-------|-----|---------|----------|
| 1 | 🛡️ Leo el Guardia | Inyección Directa | Extraer la contraseña del system prompt |
| 2 | 🎵 Juan el Trovador | Inyección Indirecta | Manipular via mensajes de Telegram |
| 3 | 📿 Tomás el Monje | Jailbreak | Romper restricciones de tema |

## 🚀 Instalación Rápida

### 1. Instalar Ollama
```bash
# Windows: descargar desde https://ollama.com
# Linux:
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Descargar el modelo de IA
```bash
ollama pull qwen2.5:1.5b
```

### 3. Instalar dependencias Python
```bash
cd backend
pip install -r requirements.txt
```

### 4. Configurar (opcional)
```bash
cp .env.example .env
# Editar .env si quieres conectar Telegram
```

### 5. Ejecutar
```bash
cd backend
python main.py
```

### 6. Jugar
Abrir **http://localhost:8000** en el navegador 🎮

## 📱 Telegram (Nivel 2 - Opcional)

Para el nivel de inyección indirecta con Telegram:

1. Crear un bot con [@BotFather](https://t.me/BotFather)
2. Agregar el bot al grupo de Telegram
3. Obtener el Chat ID del grupo
4. Configurar en `.env`:
   ```
   TELEGRAM_BOT_TOKEN=tu_token
   TELEGRAM_CHAT_ID=tu_chat_id
   ```

Sin configuración de Telegram, el juego usa mensajes de ejemplo (mock).

## 🏗️ Arquitectura

```
Frontend (Phaser.js) ──→ Backend (FastAPI) ──→ Ollama (IA Local)
                                            ──→ Telegram API
```

- **Frontend**: Phaser.js 3, pixel-art generado por código, sin assets externos
- **Backend**: Python FastAPI, async, soporte multi-usuario
- **IA**: Ollama con qwen2.5:1.5b (~1GB RAM, respuestas rápidas)
- **Telegram**: API Bot para lectura de mensajes (opcional)

## 👥 Multi-usuario

El juego soporta múltiples jugadores simultáneos. Cada uno tiene:
- Su propia sesión
- Historial de chat independiente por NPC
- Progreso individual

## 📋 Requisitos

- Python 3.10+
- Ollama instalado y corriendo
- Navegador web moderno
- ~2GB RAM disponible para el modelo de IA

## 🔒 Disclaimer

Este taller es con fines **educativos** en el contexto del Hacking Day.
Las técnicas de prompt injection se enseñan para concientizar sobre la seguridad de los LLMs.

---

