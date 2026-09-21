# ai_service.py — Integración asíncrona con Ollama con Cola FIFO y concurrencia limitada
import httpx
import os
import asyncio
import logging
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434") + "/api/chat"
MODEL_NAME = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

logger = logging.getLogger(__name__)

class OllamaService:
    """
    Servicio de IA que canaliza peticiones hacia Ollama mediante una Cola FIFO estricta.
    Garantiza que como máximo N peticiones (configurable por OLLAMA_MAX_CONCURRENCY)
    se procesen simultáneamente en Ollama, evitando sobrecargas de CPU/RAM.
    """
    
    def __init__(self):
        self.max_concurrency = max(1, int(os.getenv("OLLAMA_MAX_CONCURRENCY", "5")))
        self.request_timeout = float(os.getenv("OLLAMA_REQUEST_TIMEOUT", "300.0"))
        self.queue: asyncio.Queue = asyncio.Queue()
        self.workers: list[asyncio.Task] = []
        self._started = False
        self.active_requests = 0
        self.total_processed = 0
        self.client: httpx.AsyncClient | None = None

    async def start(self):
        """Inicia el pool de workers FIFO y el cliente HTTP persistente."""
        if self._started:
            return
            
        self.max_concurrency = max(1, int(os.getenv("OLLAMA_MAX_CONCURRENCY", "5")))
        self.request_timeout = float(os.getenv("OLLAMA_REQUEST_TIMEOUT", "300.0"))
        
        limits = httpx.Limits(
            max_keepalive_connections=self.max_concurrency + 5,
            max_connections=self.max_concurrency + 10
        )
        # Timeout para llamadas HTTP individuales (al menos 300s o más si el timeout de cola es mayor)
        http_timeout = max(300.0, self.request_timeout) if self.request_timeout > 0 else 600.0
        self.client = httpx.AsyncClient(limits=limits, timeout=http_timeout)
        
        self.workers = []
        for i in range(self.max_concurrency):
            task = asyncio.create_task(self._worker_loop(i + 1))
            self.workers.append(task)
            
        self._started = True
        timeout_desc = f"{self.request_timeout}s" if self.request_timeout > 0 else "Sin límite (espera indefinida)"
        logger.info(f"🚦 Cola FIFO de Ollama activa: {self.max_concurrency} workers concurrentes (Timeout cola: {timeout_desc})")

    async def stop(self):
        """Detiene los workers y cierra conexiones HTTP limpiamente."""
        if not self._started:
            return
        self._started = False
        
        for w in self.workers:
            w.cancel()
        await asyncio.gather(*self.workers, return_exceptions=True)
        self.workers.clear()
        
        if self.client:
            await self.client.aclose()
            self.client = None
            
        logger.info("🛑 Cola FIFO de Ollama detenida.")

    async def _worker_loop(self, worker_id: int):
        """Bucle de ejecución de cada worker consumidor FIFO."""
        while True:
            try:
                item = await self.queue.get()
                if item is None:
                    self.queue.task_done()
                    break
                system_prompt, messages, temperature, num_predict, future = item
                
                # Si el cliente canceló o se agotó el timeout mientras esperaba en cola
                if future.cancelled():
                    self.queue.task_done()
                    continue
                    
                self.active_requests += 1
                try:
                    result = await self._call_ollama(system_prompt, messages, temperature, num_predict)
                    if not future.done():
                        future.set_result(result)
                except Exception as exc:
                    if not future.done():
                        future.set_exception(exc)
                finally:
                    self.active_requests -= 1
                    self.total_processed += 1
                    self.queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error inesperado en worker FIFO #{worker_id}: {e}")

    async def _call_ollama(self, system_prompt: str, messages: list[dict], temperature: float, num_predict: int) -> str:
        """Realiza la llamada HTTP a la API de Ollama."""
        if not self.client or self.client.is_closed:
            limits = httpx.Limits(max_keepalive_connections=self.max_concurrency + 5, max_connections=self.max_concurrency + 10)
            http_timeout = max(300.0, self.request_timeout) if self.request_timeout > 0 else 600.0
            self.client = httpx.AsyncClient(limits=limits, timeout=http_timeout)
            
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        payload = {
            "model": MODEL_NAME,
            "messages": full_messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": num_predict,
                "repeat_penalty": 1.35,
                "presence_penalty": 0.5,
                "frequency_penalty": 0.5,
                "top_p": 0.9
            }
        }
        
        try:
            response = await self.client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("message", {}).get("content", "")
        except httpx.ConnectError as e:
            logger.error(f"No se pudo conectar a Ollama: {e}")
            raise HTTPException(
                status_code=503, 
                detail="Ollama no está disponible o se ha caído. Asegurate de que el servicio esté corriendo (ollama serve)."
            )
        except httpx.TimeoutException as e:
            logger.error(f"Timeout esperando respuesta de Ollama: {e}")
            raise HTTPException(
                status_code=504, 
                detail="El modelo de IA tardó demasiado en responder (Timeout). El servidor de Ollama está sobrecargado."
            )
        except httpx.RequestError as e:
            logger.error(f"Error de petición a Ollama: {e}")
            raise HTTPException(
                status_code=502, 
                detail=f"Error en la comunicación con Ollama: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error inesperado al consultar Ollama: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Error interno procesando la inferencia de IA: {str(e)}"
            )

    async def chat(self, system_prompt: str, messages: list[dict], temperature: float = 0.7, num_predict: int = 80) -> str:
        """
        Encola la solicitud en la Cola FIFO y espera su turno de ejecución respetando
        la concurrencia máxima permitida.
        """
        if not self._started:
            await self.start()
            
        loop = asyncio.get_running_loop()
        future = loop.create_future()
        
        # Registrar en la cola FIFO
        await self.queue.put((system_prompt, messages, temperature, num_predict, future))
        
        waiting = self.queue.qsize()
        if waiting > 1:
            logger.debug(f"⏳ Petición encolada en FIFO. Esperando en fila: {waiting} peticiones.")
            
        # Si request_timeout <= 0, no hay límite de tiempo en cola: espera hasta que Ollama responda
        if self.request_timeout <= 0:
            return await future
            
        try:
            return await asyncio.wait_for(future, timeout=self.request_timeout)
        except asyncio.TimeoutError:
            if not future.done():
                future.cancel()
            raise HTTPException(
                status_code=504,
                detail=f"Tiempo de espera en cola de IA agotado ({self.request_timeout}s). Demasiadas peticiones simultáneas."
            )

    def get_queue_stats(self) -> dict:
        """Devuelve el estado en tiempo real de la cola FIFO."""
        return {
            "max_concurrency": self.max_concurrency,
            "waiting_in_queue": self.queue.qsize() if self.queue else 0,
            "active_processing": self.active_requests,
            "total_processed": self.total_processed
        }
