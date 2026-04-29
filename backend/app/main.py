from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging
from app.db.session import configure_session_factory, create_all_tables
from app.services.container import ServiceContainer


def create_app(settings: Settings | None = None) -> FastAPI:
    app_settings = settings or get_settings()
    configure_logging(app_settings.environment)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app_settings.ensure_runtime_dirs()
        configure_session_factory(app_settings.database_url)
        await create_all_tables()
        app.state.settings = app_settings
        app.state.services = ServiceContainer(app_settings)
        yield

    app = FastAPI(
        title="AccessiMed Backend",
        version="0.1.0",
        lifespan=lifespan,
        openapi_url=f"{app_settings.api_prefix}/openapi.json",
        docs_url=f"{app_settings.api_prefix}/docs",
        redoc_url=f"{app_settings.api_prefix}/redoc",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(router, prefix=app_settings.api_prefix)
    return app


app = create_app()
