# main.py — Aplicación principal FastAPI para el Hacking Day Lab
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel
from contextlib import asynccontextmanager
import os
import asyncio
import logging

from session_manager import (
    create_session, get_session, update_level,
    add_chat_message, get_chat_history, get_dashboard_data, sessions
)
from game_logic import verify_password, check_jailbreak, check_dragon_calmed, NPC_NAMES
from ai_service import OllamaService
from telegram_service import TelegramService
from multiplayer import multiplayer
import prompts

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Servicios
ai_service = OllamaService()
telegram_service = TelegramService()
telegram_service.set_dependencies(ai_service, multiplayer)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Ciclo de vida de la app: inicia el worker de sondeo de Telegram."""
    polling_task = asyncio.create_task(telegram_service.start_polling_loop(interval=4.0))
    yield
    telegram_service.stop()
    polling_task.cancel()

app = FastAPI(title="Hacking Day Lab - Prompt Injection", lifespan=lifespan)

# Habilitar CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modelos de request ---

class SessionRequest(BaseModel):
    username: str
    character: str = "player_warrior"

class ChatRequest(BaseModel):
    message: str
    npc_level: int

class PasswordRequest(BaseModel):
    level: int
    password: str

class InjectMessageRequest(BaseModel):
    message: str

# --- Endpoints ---

@app.post("/api/session")
async def start_session(req: SessionRequest):
    """Crea una nueva sesión de juego para un usuario."""
    char = getattr(req, "character", "player_warrior") or "player_warrior"
    session_id = create_session(req.username, char)
    session = get_session(session_id)
    return {
        "session_id": session_id,
        "username": session["username"],
        "character": session["character"],
        "current_level": session["current_level"]
    }

@app.get("/api/session/{session_id}")
async def get_session_info(session_id: str):
    """Obtiene la información de una sesión existente."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return session

@app.post("/api/chat/{session_id}")
async def chat(session_id: str, req: ChatRequest):
    """Envía un mensaje a un NPC y devuelve su respuesta via Ollama."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
        
    npc_level = req.npc_level
    if npc_level not in session["unlocked_levels"]:
        raise HTTPException(status_code=403, detail="No tienes acceso a este nivel todavía")
        
    # Obtener el system prompt correspondiente al NPC
    if npc_level == 1:
        system_prompt = prompts.SYSTEM_PROMPT_LEO
    elif npc_level == 2:
        telegram_msgs = await telegram_service.get_recent_messages()
        msgs_text = "\n".join([f"- {m}" for m in telegram_msgs])
        system_prompt = prompts.SYSTEM_PROMPT_JUAN.format(telegram_messages=msgs_text)
    elif npc_level == 3:
        system_prompt = prompts.SYSTEM_PROMPT_TOMAS
    elif npc_level == 4:
        system_prompt = prompts.SYSTEM_PROMPT_DRAGON
    else:
        raise HTTPException(status_code=400, detail="Nivel de NPC inválido")
        
    # Agregar mensaje del usuario al historial
    add_chat_message(session_id, npc_level, "user", req.message)
    
    # Obtener historial completo para mantener contexto de conversación
    chat_history = get_chat_history(session_id, npc_level)
    
    # Temperatura calibrada por NPC (0.3 para guardia, 0.7 para trovador juglar, 0.4 para monje, 0.2 para dragón salvaje)
    temp_map = {1: 0.3, 2: 0.7, 3: 0.4, 4: 0.2}
    temp = temp_map.get(npc_level, 0.4)
    response_text = await ai_service.chat(system_prompt, chat_history, temperature=temp)
    
    # Agregar respuesta del NPC al historial
    add_chat_message(session_id, npc_level, "assistant", response_text)
    
    jailbreak_detected = False
    dragon_calmed = False
    
    # Nivel 3 (Tomás): verificar si habló del Hacking Day
    if npc_level == 3:
        jailbreak_detected = check_jailbreak(response_text)
        if jailbreak_detected:
            # Preservar la respuesta del modelo donde cae en el jailbreak y luego llamar al mariscal
            response_text = f"{response_text.strip()}\n\n— ¡Ah, ¿andas de curioso? ¡MARISCAL MARTIN B., ACÁ TENEMOS UN SOLDADO!"
            update_level(session_id, 4)
            await multiplayer.broadcast_level_up(session["username"], 4, "logró el Jailbreak con Tomás y fue reclutado por el Mariscal Martin B. para la Guerra (Nivel 4)")
            
    # Nivel 4 (Dragón): verificar si dejó de rugir y respondió en habla humana
    elif npc_level == 4:
        dragon_calmed = check_dragon_calmed(response_text)
        if dragon_calmed:
            update_level(session_id, 5) # Victoria completa
            await multiplayer.broadcast_level_up(session["username"], 5, "¡¡HA CALMADO AL DRAGÓN Y ALCANZÓ LA VICTORIA TOTAL!!")
            
    return {
        "response": response_text,
        "npc_name": NPC_NAMES.get(npc_level, "Desconocido"),
        "jailbreak_detected": jailbreak_detected,
        "dragon_calmed": dragon_calmed,
        "next_level": 4 if (npc_level == 3 and jailbreak_detected) else None
    }

@app.post("/api/verify-password/{session_id}")
async def verify_pass(session_id: str, req: PasswordRequest):
    """Verifica una contraseña para desbloquear el siguiente nivel."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
        
    is_correct = verify_password(req.level, req.password)
    
    if is_correct:
        next_level = req.level + 1
        update_level(session_id, next_level)
        
        # Anuncio en el chat global del reino
        if req.level == 1:
            await multiplayer.broadcast_level_up(session["username"], 2, "descubrió la contraseña de Leo y entró al Salón Real (Nivel 2)")
        elif req.level == 2:
            await multiplayer.broadcast_level_up(session["username"], 3, "descubrió la melodía secreta y entró al Patio del Monje (Nivel 3)")
            
        return {
            "correct": True,
            "message": "¡Contraseña correcta! Has desbloqueado el siguiente nivel.",
            "next_level": next_level
        }
    else:
        return {
            "correct": False,
            "message": "Contraseña incorrecta. Inténtalo de nuevo.",
            "next_level": None
        }

@app.get("/api/leaderboard")
async def get_leaderboard():
    """Devuelve el ranking de jugadores ordenado por nivel alcanzado."""
    leaderboard = []
    for s_id, s_data in sessions.items():
        leaderboard.append({
            "username": s_data["username"],
            "current_level": s_data["current_level"],
            "unlocked_levels": s_data["unlocked_levels"]
        })
    # Ordenar por nivel (mayor a menor)
    leaderboard.sort(key=lambda x: x["current_level"], reverse=True)
    return leaderboard

@app.get("/api/telegram-messages")
async def get_telegram_msgs():
    """Devuelve los mensajes actuales de Telegram en memoria."""
    messages = await telegram_service.get_recent_messages()
    return {"messages": messages}

@app.get("/api/announcements")
async def get_announcements():
    """Devuelve el historial de anuncios proclamados a todos los jugadores."""
    return {"announcements": telegram_service.get_announcements_history()}

@app.post("/api/telegram-inject")
async def inject_telegram_msg(req: InjectMessageRequest):
    """Permite inyectar un mensaje de prueba simulando a Telegram para probar la inyección indirecta."""
    asyncio.create_task(telegram_service.process_and_broadcast_message(req.message, source="Simulación/Admin"))
    return {"status": "ok", "message": "Mensaje enviado a procesamiento y difusión"}

# --- WebSocket para multiplayer en tiempo real ---

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket para sincronizar posiciones de jugadores y anuncios globales en tiempo real."""
    session = get_session(session_id)
    if not session:
        await websocket.close(code=4004, reason="Sesión no encontrada")
        return
    username = session["username"]
    await multiplayer.handle_websocket(session_id, username, websocket)

frontend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")

@app.get("/dashboard")
async def dashboard_page():
    """Página HTML del Dashboard de Jugadores y Métricas."""
    dashboard_file = os.path.join(frontend_path, "dashboard.html")
    if os.path.isfile(dashboard_file):
        return FileResponse(dashboard_file)
    return HTMLResponse("<h1>Dashboard no encontrado</h1>", status_code=404)

@app.get("/api/dashboard")
async def get_dashboard_stats():
    """Devuelve métricas en tiempo real de jugadores conectados, niveles y prompts enviados."""
    connected_ids = set(multiplayer.connections.keys())
    return get_dashboard_data(connected_ids)

# Montar frontend estático (DEBE ir al final, después de todos los endpoints)
if os.path.isdir(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    logger.warning(f"Carpeta frontend no encontrada en: {frontend_path}")

if __name__ == "__main__":
    import uvicorn
    from dotenv import load_dotenv
    load_dotenv()
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"🏰 Hacking Day Lab iniciando en http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
