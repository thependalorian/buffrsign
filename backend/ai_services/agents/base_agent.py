from typing import Any, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class BaseBuffrSignAgent:
    def __init__(self, agent_id: str, config: Optional[Dict[str, Any]] = None):
        self.agent_id = agent_id
        self.config = config or {}
        self.state: Dict[str, Any] = {"status": "idle", "last_update": None}
        self._llama_index_available = False # Placeholder for LlamaIndex availability
        try:
            import llama_index.core # noqa: F401
            self._llama_index_available = True
        except ImportError:
            logger.warning("LlamaIndex not available. Some AI features may be limited.")

    def update_state(self, status: str, sub_status: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        self.state["status"] = status
        self.state["sub_status"] = sub_status
        self.state["last_update"] = datetime.now().isoformat()
        if details:
            self.state["details"] = details
        logger.info(f"Agent {self.agent_id} state updated: {status} ({sub_status})")

    def emit_event(self, event_name: str, payload: Dict[str, Any]):
        logger.info(f"Agent {self.agent_id} emitted event: {event_name} with payload {payload}")
        # In a real system, this would send events to a message queue or WebSocket

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement the process method")

    def get_capabilities(self) -> List[str]:
        raise NotImplementedError("Subclasses must implement the get_capabilities method")