from fastapi import Request
from fastapi.responses import JSONResponse
from exception.custom_exceptions import AppException

def register_exception_handlers(app):

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "title": exc.title,
                "status": exc.status_code,
                "detail": exc.detail,
                "instance": str(request.url)
            }
        )