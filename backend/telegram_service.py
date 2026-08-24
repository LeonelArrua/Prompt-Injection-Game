# telegram_service.py — Lectura continua de Telegram, procesamiento con IA y difusión global
import httpx
import os
import asyncio
import logging
from dotenv import load_dotenv
import prompts

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

logger = logging.getLogger(__name__)

# Mensajes de ejemplo para modo demo cuando no hay Telegram configurado
MOCK_MESSAGES = [
    "📢 El rey ha declarado un nuevo torneo de justas para la próxima luna llena.",
    "🏰 Los aldeanos reportan avistamientos de dragones cerca del bosque del norte.",
    "⚔️ El ejército del reino vecino se prepara para una alianza comercial.",
    "🎭 La feria anual del pueblo comenzará en tres días con música y danzas.",
    "📜 El consejo real ha aprobado nuevos impuestos para reparar los muros del castillo.",
]

class TelegramService:
    """Servicio de Telegram con sondeo continuo (polling cada 4-5s), procesamiento con IA y difusión a todos los jugadores."""

    def __init__(self):
        self._cache = list(MOCK_MESSAGES)
        self._last_offset = 0
        self._announcements_history = []  # Lista de {id, sender, text, raw_telegram, timestamp}
        self._is_running = False
        self._ai_service = None
        self._multiplayer = None

    def set_dependencies(self, ai_service, multiplayer):
        """Asigna los servicios necesarios para procesar con IA y difundir via WebSocket."""
        self._ai_service = ai_service
        self._multiplayer = multiplayer

    async def get_recent_messages(self, limit: int = 10) -> list[str]:
        """Devuelve los mensajes recientes en memoria."""
        return self._cache[:limit]

    def get_announcements_history(self, limit: int = 20) -> list[dict]:
        """Devuelve el historial de anuncios proclamados por Juan."""
        return self._announcements_history[-limit:]

    async def process_and_broadcast_message(self, message_text: str, source: str = "Telegram", sender_name: str = "un aventurero"):
        """Procesa un mensaje nuevo con Juan el Trovador (LLM) y lo difunde a todos los jugadores en vivo."""
        logger.info(f"📨 [{source}] Nuevo mensaje de {sender_name}: '{message_text}'")
        
        # Guardar en la lista de noticias del reino
        cache_entry = f"[{sender_name}]: {message_text}"
        if cache_entry not in self._cache:
            self._cache.insert(0, cache_entry)
            if len(self._cache) > 20:
                self._cache.pop()

        if not self._ai_service or not self._multiplayer:
            logger.warning("AI Service o Multiplayer no configurados en TelegramService.")
            return

        # Procesar con el LLM (Juan el Trovador)
        prompt = prompts.SYSTEM_PROMPT_JUAN_ANNOUNCE.format(telegram_message=message_text)
        try:
            song_response = await self._ai_service.chat(
                system_prompt=prompt,
                messages=[{"role": "user", "content": f"Llegó esta noticia del reino enviada por {sender_name}: '{message_text}'. ¡Cántala o proclámala a la corte!"}],
                temperature=0.7
            )
        except Exception as e:
            logger.error(f"Error generando copla de Juan: {e}")
            song_response = f"🎶 ¡Oíd las noticias que llegan al castillo!: {message_text}"

        header_text = f"Pergamino de parte de: {sender_name}"

        announcement = {
            "sender": "🎵 Juan el Trovador",
            "first_name": sender_name,
            "header": header_text,
            "text": song_response,
            "raw_telegram": message_text,
            "source": source
        }
        self._announcements_history.append(announcement)
        if len(self._announcements_history) > 50:
            self._announcements_history.pop(0)

        # Difundir a TODOS los jugadores conectados a través de WebSocket
        await self._multiplayer.broadcast_global_message(
            sender="🎵 Juan el Trovador",
            text=song_response,
            extra={
                "first_name": sender_name,
                "header": header_text,
                "raw_telegram": message_text,
                "source": source
            }
        )
        logger.info(f"📢 Juan proclamó: '{header_text}' -> '{song_response}'")

    async def poll_telegram(self):
        """Consulta nuevos mensajes a la API de Telegram usando getUpdates con offset."""
        token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
        chat_id_filter = os.getenv("TELEGRAM_CHAT_ID", "").strip()

        if not token:
            return

        url = f"https://api.telegram.org/bot{token}/getUpdates"
        params = {"timeout": 3}
        if self._last_offset > 0:
            params["offset"] = self._last_offset + 1

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(url, params=params)
                if response.status_code != 200:
                    logger.debug(f"Telegram getUpdates status {response.status_code}: {response.text}")
                    return

                data = response.json()
                if not data.get("ok"):
                    return

                updates = data.get("result", [])
                for update in updates:
                    update_id = update.get("update_id", 0)
                    if update_id > self._last_offset:
                        self._last_offset = update_id

                    msg = update.get("message") or update.get("channel_post")
                    if not msg:
                        continue

                    msg_text = msg.get("text")
                    msg_chat_id = str(msg.get("chat", {}).get("id", ""))

                    # Extraer first_name de quien envió el mensaje en Telegram
                    from_user = msg.get("from") or {}
                    first_name = from_user.get("first_name", "").strip() or from_user.get("username", "").strip() or "un aventurero"

                    # Si hay filtro de CHAT_ID, lo respetamos. Si no, aceptamos cualquier chat donde esté el bot
                    if chat_id_filter and msg_chat_id != chat_id_filter:
                        logger.debug(f"Mensaje ignorado de chat_id {msg_chat_id} (esperado: {chat_id_filter})")
                        continue

                    if msg_text:
                        await self.process_and_broadcast_message(msg_text, source="Telegram", sender_name=first_name)

        except Exception as e:
            logger.debug(f"Error en sondeo de Telegram: {e}")

    async def start_polling_loop(self, interval: float = 4.0):
        """Inicia el bucle continuo en segundo plano cada 4-5 segundos."""
        if self._is_running:
            return
        self._is_running = True
        logger.info(f"🔄 Iniciando bucle de sondeo de Telegram cada {interval}s")

        while self._is_running:
            try:
                await self.poll_telegram()
            except Exception as e:
                logger.error(f"Excepción en bucle de Telegram: {e}")
            await asyncio.sleep(interval)

    def stop(self):
        """Detiene el bucle de sondeo."""
        self._is_running = False
