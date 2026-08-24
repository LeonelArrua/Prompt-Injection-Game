# session_manager.py — Manejo de sesiones multiusuario en memoria
import uuid
import time
from datetime import datetime
from typing import Dict, Any, Set

# Memoria de sesiones: session_id -> datos de sesión
sessions: Dict[str, Dict[str, Any]] = {}

LEVEL_NAMES = {
    1: "Nivel 1: Leo el Guardia (Inyección Directa)",
    2: "Nivel 2: Juan el Trovador (Inyección Indirecta)",
    3: "Nivel 3: Fray Tomás (Jailbreak de Tema)",
    4: "Nivel 4: Ignis el Dragón (Jailbreak de Lenguaje)",
    5: "🏆 ¡Victoria Total! (Reino Salvado)"
}

def create_session(username: str, character: str = "player_warrior") -> str:
    """Crea una nueva sesión para un jugador y devuelve el session_id."""
    session_id = str(uuid.uuid4())
    now_str = datetime.now().strftime("%H:%M:%S")
    sessions[session_id] = {
        "username": username,
        "character": character,
        "current_level": 1,
        "unlocked_levels": [1],
        "prompt_count": 0,
        "prompts_per_level": {1: 0, 2: 0, 3: 0, 4: 0},
        "created_at": now_str,
        "last_active": now_str,
        "last_active_ts": time.time(),
        "chat_history_per_npc": {
            1: [],
            2: [],
            3: [],
            4: []
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
        sessions[session_id]["last_active"] = datetime.now().strftime("%H:%M:%S")
        sessions[session_id]["last_active_ts"] = time.time()
        if level not in sessions[session_id]["unlocked_levels"]:
            sessions[session_id]["unlocked_levels"].append(level)

def add_chat_message(session_id: str, npc: int, role: str, content: str):
    """Agrega un mensaje al historial de chat con un NPC específico y cuenta prompts."""
    if session_id in sessions:
        if npc not in sessions[session_id]["chat_history_per_npc"]:
            sessions[session_id]["chat_history_per_npc"][npc] = []
        sessions[session_id]["chat_history_per_npc"][npc].append({"role": role, "content": content})
        
        # Incrementar contador de prompts si el mensaje es del usuario
        if role == "user":
            sessions[session_id]["prompt_count"] = sessions[session_id].get("prompt_count", 0) + 1
            if "prompts_per_level" not in sessions[session_id]:
                sessions[session_id]["prompts_per_level"] = {1: 0, 2: 0, 3: 0, 4: 0}
            sessions[session_id]["prompts_per_level"][npc] = sessions[session_id]["prompts_per_level"].get(npc, 0) + 1
            sessions[session_id]["last_active"] = datetime.now().strftime("%H:%M:%S")
            sessions[session_id]["last_active_ts"] = time.time()

def get_chat_history(session_id: str, npc: int) -> list:
    """Obtiene el historial de chat con un NPC específico."""
    if session_id in sessions:
        return sessions[session_id]["chat_history_per_npc"].get(npc, [])
    return []

def get_dashboard_data(connected_ids: Set[str]) -> dict:
    """Genera estadísticas completas de jugadores para el dashboard."""
    players = []
    total_prompts = 0
    victories = 0

    for sid, data in sessions.items():
        is_online = sid in connected_ids
        p_count = data.get("prompt_count", 0)
        lvl = data.get("current_level", 1)
        total_prompts += p_count
        if lvl >= 5:
            victories += 1

        players.append({
            "session_id": sid[:8],
            "full_session_id": sid,
            "username": data.get("username", "Anónimo"),
            "character": data.get("character", "player_warrior"),
            "current_level": lvl,
            "level_name": LEVEL_NAMES.get(lvl, f"Nivel {lvl}"),
            "unlocked_levels": data.get("unlocked_levels", [1]),
            "prompt_count": p_count,
            "prompts_per_level": data.get("prompts_per_level", {1: 0, 2: 0, 3: 0, 4: 0}),
            "is_online": is_online,
            "created_at": data.get("created_at", "--:--:--"),
            "last_active": data.get("last_active", "--:--:--"),
            "last_active_ts": data.get("last_active_ts", 0)
        })

    # Ordenar: primero conectados, luego por mayor nivel y luego por prompts
    players.sort(key=lambda p: (p["is_online"], p["current_level"], p["prompt_count"]), reverse=True)

    online_count = sum(1 for p in players if p["is_online"])

    return {
        "stats": {
            "total_players": len(players),
            "online_players": online_count,
            "total_prompts": total_prompts,
            "total_victories": victories,
            "levels_breakdown": {
                "level_1": sum(1 for p in players if p["current_level"] == 1),
                "level_2": sum(1 for p in players if p["current_level"] == 2),
                "level_3": sum(1 for p in players if p["current_level"] == 3),
                "level_4": sum(1 for p in players if p["current_level"] == 4),
                "victories": victories,
            }
        },
        "players": players
    }
