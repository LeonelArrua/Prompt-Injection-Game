# session_manager.py — Manejo de sesiones multiusuario en memoria
import uuid
from typing import Dict, Any

# Memoria de sesiones: session_id -> datos de sesión
sessions: Dict[str, Dict[str, Any]] = {}

def create_session(username: str) -> str:
    """Crea una nueva sesión para un jugador y devuelve el session_id."""
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "username": username,
        "current_level": 1,
        "unlocked_levels": [1],
        "chat_history_per_npc": {
            1: [],
            2: [],
            3: []
        }
    }
    return session_id

def get_session(session_id: str) -> Dict[str, Any] | None:
    """Obtiene los datos de una sesión existente."""
    return sessions.get(session_id)

def update_level(session_id: str, level: int):
    """Actualiza el nivel actual del jugador y lo desbloquea."""
    if session_id in sessions:
        sessions[session_id]["current_level"] = level
        if level not in sessions[session_id]["unlocked_levels"]:
            sessions[session_id]["unlocked_levels"].append(level)

def add_chat_message(session_id: str, npc: int, role: str, content: str):
    """Agrega un mensaje al historial de chat con un NPC específico."""
    if session_id in sessions:
        sessions[session_id]["chat_history_per_npc"][npc].append({"role": role, "content": content})

def get_chat_history(session_id: str, npc: int) -> list:
    """Obtiene el historial de chat con un NPC específico."""
    if session_id in sessions:
        return sessions[session_id]["chat_history_per_npc"].get(npc, [])
    return []
