"""Simple in-memory sliding-window rate limiter.

Used to throttle the AI-powered endpoints (chat + NLP quick-add parse) to
20 requests/minute/user as specified in the design doc (section 12.5 / 13.5).

This is intentionally in-process (a dict guarded by a lock) rather than
Redis-backed, good enough for a single-instance deployment. If the app is
scaled horizontally, swap the store for Redis (INCR + EXPIRE) without
changing the public API of RateLimiter.check.
"""
import time
import threading
from collections import defaultdict, deque
from fastapi import HTTPException, status


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> None:
        """Raise HTTP 429 if key has exceeded max_requests in the window."""
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            cutoff = now - self.window_seconds
            while hits and hits[0] < cutoff:
                hits.popleft()

            if len(hits) >= self.max_requests:
                retry_after = int(self.window_seconds - (now - hits[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Ban da gui qua nhieu yeu cau. Vui long thu lai sau it phut.",
                    headers={"Retry-After": str(retry_after)},
                )

            hits.append(now)

    def reset(self) -> None:
        """Clear all tracked hits, used by tests."""
        with self._lock:
            self._hits.clear()


# Shared limiter for the AI endpoints (chat + transaction parsing):
# 20 requests/minute/user, per design doc sections 12.5 and 13.5.
ai_rate_limiter = RateLimiter(max_requests=20, window_seconds=60)
