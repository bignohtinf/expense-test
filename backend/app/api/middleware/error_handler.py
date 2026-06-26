from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except SQLAlchemyError as e:
            logger.error(f"Database error: {str(e)}")
            return JSONResponse(status_code=500, content={"detail": "Lỗi cơ sở dữ liệu"})
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return JSONResponse(status_code=500, content={"detail": "Lỗi hệ thống"})
