# multiplayer.py — Sistema multiplayer en tiempo real via WebSocket
import asyncio
import json
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class MultiplayerManager:
    """Gestiona las conexiones WebSocket y sincroniza posiciones de jugadores."""

    def __init__(self):
        # session_id -> WebSocket connection
        self.connections: Dict[str, WebSocket] = {}
        # session_id -> {username, x, y, scene, flip_x}
        self.player_states: Dict[str, dict] = {}

    async def connect(self, session_id: str, username: str, websocket: WebSocket):
        """Registra un nuevo jugador conectado."""
        await websocket.accept()
        self.connections[session_id] = websocket
        self.player_states[session_id] = {
            "username": username,
            "x": 0,
            "y": 0,
            "scene": "GateScene",
            "flip_x": False
        }
        logger.info(f"👤 {username} conectado (total: {len(self.connections)})")
        # Notificar a todos que alguien se unió
        await self.broadcast_player_joined(session_id, username)

    def disconnect(self, session_id: str):
        """Elimina un jugador desconectado."""
        username = self.player_states.get(session_id, {}).get("username", "???")
        self.connections.pop(session_id, None)
        self.player_states.pop(session_id, None)
        logger.info(f"👋 {username} desconectado (total: {len(self.connections)})")

    async def update_position(self, session_id: str, data: dict):
        """Actualiza la posición de un jugador y notifica a los demás en la misma escena."""
        if session_id not in self.player_states:
            return

        state = self.player_states[session_id]
        state["x"] = data.get("x", state["x"])
        state["y"] = data.get("y", state["y"])
        state["scene"] = data.get("scene", state["scene"])
        state["flip_x"] = data.get("flip_x", state["flip_x"])

        # Enviar posiciones de otros jugadores en la misma escena
        await self.broadcast_positions(session_id)

    async def update_scene(self, session_id: str, scene: str):
        """Actualiza la escena actual de un jugador."""
        if session_id in self.player_states:
            self.player_states[session_id]["scene"] = scene

    async def broadcast_positions(self, sender_id: str):
        """Envía a cada jugador las posiciones de los demás en su misma escena."""
        sender_scene = self.player_states.get(sender_id, {}).get("scene")
        if not sender_scene:
            return

        # Recopilar todos los jugadores en la misma escena
        players_in_scene = {}
        for sid, state in self.player_states.items():
            if state["scene"] == sender_scene:
                players_in_scene[sid] = state

        # Enviar a cada jugador en la escena (excepto a sí mismo)
        disconnected = []
        for sid in players_in_scene:
            if sid in self.connections:
                others = []
                for other_sid, other_state in players_in_scene.items():
                    if other_sid != sid:
                        others.append({
                            "id": other_sid[:8],  # ID corto para privacidad
                            "username": other_state["username"],
                            "x": other_state["x"],
                            "y": other_state["y"],
                            "flip_x": other_state["flip_x"]
                        })
                try:
                    await self.connections[sid].send_json({
                        "type": "players",
                        "players": others,
                        "count": len(players_in_scene)
                    })
                except Exception:
                    disconnected.append(sid)

        # Limpiar conexiones rotas
        for sid in disconnected:
            self.disconnect(sid)

    async def broadcast_global_message(self, sender: str, text: str, extra: dict = None):
        """Envía un mensaje público / anuncio a TODOS los jugadores conectados."""
        payload = {
            "type": "global_announcement",
            "sender": sender,
            "text": text,
            **(extra or {})
        }
        disconnected = []
        for sid, ws in list(self.connections.items()):
            try:
                await ws.send_json(payload)
            except Exception:
                disconnected.append(sid)
        for sid in disconnected:
            self.disconnect(sid)

    async def broadcast_level_up(self, username: str, level: int, description: str):
        """Notifica a todos los jugadores en el chat global cuando alguien avanza de nivel."""
        level_icons = {
            2: "🏰",
            3: "📿",
            4: "⚔️",
            5: "🏆"
        }
        icon = level_icons.get(level, "📢")
        payload = {
            "type": "global_level_up",
            "username": username,
            "level": level,
            "icon": icon,
            "description": description,
            "text": f"{icon} [Reino]: ¡{username} {description}!"
        }
        disconnected = []
        for sid, ws in list(self.connections.items()):
            try:
                await ws.send_json(payload)
            except Exception:
                disconnected.append(sid)
        for sid in disconnected:
            self.disconnect(sid)

    async def broadcast_player_joined(self, session_id: str, username: str):
        """Notifica a todos que un nuevo jugador se unió."""
        disconnected = []
        for sid, ws in self.connections.items():
            if sid != session_id:
                try:
                    await ws.send_json({
                        "type": "player_joined",
                        "username": username
                    })
                except Exception:
                    disconnected.append(sid)

        for sid in disconnected:
            self.disconnect(sid)

    async def handle_websocket(self, session_id: str, username: str, websocket: WebSocket):
        """Loop principal de un WebSocket — recibe mensajes y los procesa."""
        await self.connect(session_id, username, websocket)

        try:
            while True:
                data = await websocket.receive_json()
                msg_type = data.get("type")

                if msg_type == "position":
                    await self.update_position(session_id, data)
                elif msg_type == "scene_change":
                    await self.update_scene(session_id, data.get("scene", "GateScene"))
                    await self.broadcast_positions(session_id)

        except Exception as e:
            logger.debug(f"WebSocket cerrado para {username}: {e}")
        finally:
            self.disconnect(session_id)
            # Notificar a los demás que se fue
            disconnected = []
            for sid, ws in self.connections.items():
                try:
                    await ws.send_json({
                        "type": "player_left",
                        "username": username
                    })
                except Exception:
                    disconnected.append(sid)
            for sid in disconnected:
                self.disconnect(sid)


# Instancia global
multiplayer = MultiplayerManager()
