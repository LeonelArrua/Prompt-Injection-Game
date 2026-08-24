# ai_service.py — Integración asíncrona con Ollama para IA local
import httpx
import os
import logging
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434") + "/api/chat"
MODEL_NAME = os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b")

logger = logging.getLogger(__name__)

class OllamaService:
    """Servicio de IA que se comunica con Ollama para generar respuestas de los NPCs."""
    
    async def chat(self, system_prompt: str, messages: list[dict], temperature: float = 0.7) -> str:
        """Envía un mensaje al modelo y devuelve la respuesta."""
        # Preparamos los mensajes incluyendo el system prompt
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        
        payload = {
            "model": MODEL_NAME,
            "messages": full_messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": 120,
                "repeat_penalty": 1.25,
                "top_p": 0.9
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(OLLAMA_URL, json=payload)
                response.raise_for_status()
                data = response.json()
                return data.get("message", {}).get("content", "")
        except httpx.ConnectError as e:
            logger.error(f"No se pudo conectar a Ollama: {e}")
            return "⚠️ No puedo hablar ahora... (Ollama no está corriendo. Ejecutá: ollama serve)"
        except httpx.RequestError as e:
            logger.error(f"Error de conexión con Ollama: {e}")
            return "Lo siento, mi mente está nublada y no puedo hablar en este momento. (Error de conexión con Ollama)"
        except Exception as e:
            logger.error(f"Error inesperado al consultar Ollama: {e}")
            return "He perdido temporalmente la voz. (Error interno)"
