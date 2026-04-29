from __future__ import annotations

import contextlib
import socket
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import Settings
from app.main import create_app


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return


@contextlib.contextmanager
def serve_directory(directory: Path):
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    host, port = sock.getsockname()
    sock.close()

    handler = partial(QuietHandler, directory=str(directory))
    server = ThreadingHTTPServer((host, port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://{host}:{port}"
    finally:
        server.shutdown()
        thread.join()


@pytest.fixture
def site_root() -> Path:
    return Path(__file__).parent / "fixtures" / "site"


@pytest.fixture
def demo_site_root() -> Path:
    return Path(__file__).parents[2] / "demo-site"


@pytest.fixture
def app(tmp_path: Path):
    settings = Settings(
        database_url=f"sqlite+aiosqlite:///{tmp_path / 'test.db'}",
        report_dir=tmp_path / "reports",
        enable_playwright=False,
        openai_api_key=None,
        anthropic_api_key=None,
    )
    return create_app(settings)


@pytest.fixture
async def client(app):
    async with app.router.lifespan_context(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as test_client:
            yield test_client


@pytest.fixture
def site_server(site_root: Path):
    with serve_directory(site_root) as base_url:
        yield base_url
