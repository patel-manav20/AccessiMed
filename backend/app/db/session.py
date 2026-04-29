from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.models import Base

_engine = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def configure_session_factory(database_url: str) -> None:
    global _engine, _session_factory
    _engine = create_async_engine(database_url, future=True)
    _session_factory = async_sessionmaker(_engine, expire_on_commit=False, class_=AsyncSession)


async def create_all_tables() -> None:
    if _engine is None:
        raise RuntimeError("Database engine has not been configured.")
    async with _engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    if _session_factory is None:
        raise RuntimeError("Session factory has not been configured.")
    async with _session_factory() as session:
        yield session
