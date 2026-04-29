from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="ACCESSIMED_", extra="ignore")

    environment: str = "development"
    api_prefix: str = "/api/v1"
    database_url: str = "sqlite+aiosqlite:///./data/accessimed.db"
    report_dir: Path = Field(default=Path("./reports"))
    enable_playwright: bool = True
    max_pages: int = 5
    request_timeout_seconds: int = 15
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-sonnet-4-20250514"
    openai_api_key: str | None = None
    openai_model: str = "gpt-5"
    remediation_provider: str = "auto"
    demo_site_root: Path = Field(default=Path("../demo-site"))
    allowed_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
        ]
    )

    def ensure_runtime_dirs(self) -> None:
        self.report_dir.mkdir(parents=True, exist_ok=True)
        database_path = self.database_file
        if database_path is not None:
            database_path.parent.mkdir(parents=True, exist_ok=True)
        self.demo_site_root.mkdir(parents=True, exist_ok=True)

    @property
    def database_file(self) -> Path | None:
        marker = "sqlite+aiosqlite:///"
        if not self.database_url.startswith(marker):
            return None
        raw_path = self.database_url.replace(marker, "", 1)
        return Path(raw_path)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
