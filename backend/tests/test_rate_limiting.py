"""Unit tests for the in-memory sliding-window rate limiter."""
import pytest
from fastapi import HTTPException

from app.api.middleware.rate_limiting import RateLimiter


def test_allows_requests_under_limit():
    limiter = RateLimiter(max_requests=3, window_seconds=60)
    for _ in range(3):
        limiter.check("user-1")  # should not raise


def test_blocks_requests_over_limit():
    limiter = RateLimiter(max_requests=3, window_seconds=60)
    for _ in range(3):
        limiter.check("user-1")
    with pytest.raises(HTTPException) as exc_info:
        limiter.check("user-1")
    assert exc_info.value.status_code == 429


def test_limits_are_per_key():
    limiter = RateLimiter(max_requests=1, window_seconds=60)
    limiter.check("user-1")
    limiter.check("user-2")  # different key, should not raise


def test_reset_clears_all_hits():
    limiter = RateLimiter(max_requests=1, window_seconds=60)
    limiter.check("user-1")
    limiter.reset()
    limiter.check("user-1")  # should not raise after reset
