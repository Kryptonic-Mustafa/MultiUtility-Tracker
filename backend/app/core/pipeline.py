import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Any

class LatestFrameQueue:
    """Async 1-frame queue that automatically drops older unprocessed frames."""
    def __init__(self):
        self._frame: Optional[Any] = None
        self._lock = asyncio.Lock()

    async def put(self, frame: Any):
        async with self._lock:
            self._frame = frame

    async def get(self) -> Optional[Any]:
        async with self._lock:
            frame = self._frame
            self._frame = None
            return frame

# Thread pool for CPU-bound face recognition operations
executor = ThreadPoolExecutor(max_workers=4)
