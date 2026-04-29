from __future__ import annotations

import tomllib
from dataclasses import dataclass
from pathlib import Path
from typing import Any


DEFAULT_CONFIG_NAME = ".accessimed.toml"


@dataclass(frozen=True)
class CliConfig:
    root: Path | None = None
    remediation_provider: str = "local"
    max_pages: int = 5
    enable_playwright: bool = True
    openai_model: str | None = None
    anthropic_model: str | None = None


def default_config_path(cwd: Path | None = None) -> Path:
    base = cwd or Path.cwd()
    return base / DEFAULT_CONFIG_NAME


def load_cli_config(path: Path | None = None) -> tuple[CliConfig, Path]:
    config_path = path or default_config_path()
    if not config_path.exists():
        return CliConfig(), config_path

    data = tomllib.loads(config_path.read_text(encoding="utf-8"))
    accessimed = data.get("accessimed", {})
    scanning = data.get("scanning", {})
    providers = data.get("providers", {})

    root_value = accessimed.get("root")
    root = Path(root_value).expanduser().resolve() if isinstance(root_value, str) and root_value.strip() else None

    remediation_provider = str(accessimed.get("remediation_provider", "local")).strip().lower()
    max_pages = _coerce_int(scanning.get("max_pages"), 5)
    enable_playwright = bool(scanning.get("enable_playwright", True))
    openai_model = _coerce_optional_str(providers.get("openai_model"))
    anthropic_model = _coerce_optional_str(providers.get("anthropic_model"))

    return (
        CliConfig(
            root=root,
            remediation_provider=remediation_provider,
            max_pages=max_pages,
            enable_playwright=enable_playwright,
            openai_model=openai_model,
            anthropic_model=anthropic_model,
        ),
        config_path,
    )


def render_default_config(
    root: Path | None = None,
    remediation_provider: str = "local",
    max_pages: int = 5,
    enable_playwright: bool = True,
    openai_model: str | None = None,
    anthropic_model: str | None = None,
) -> str:
    root_line = str(root) if root is not None else ""
    openai_line = f'openai_model = "{openai_model}"' if openai_model else '# openai_model = "gpt-5"'
    anthropic_line = (
        f'anthropic_model = "{anthropic_model}"'
        if anthropic_model
        else '# anthropic_model = "claude-sonnet-4-20250514"'
    )
    return (
        "# AccessiMed CLI configuration\n"
        "# Save this file in your project root as .accessimed.toml\n\n"
        "[accessimed]\n"
        f'root = "{root_line}"\n'
        f'remediation_provider = "{remediation_provider}"\n\n'
        "[scanning]\n"
        f"max_pages = {max_pages}\n"
        f"enable_playwright = {'true' if enable_playwright else 'false'}\n\n"
        "[providers]\n"
        f"{openai_line}\n"
        f"{anthropic_line}\n"
    )


def _coerce_int(value: Any, default: int) -> int:
    if isinstance(value, int) and value > 0:
        return value
    return default


def _coerce_optional_str(value: Any) -> str | None:
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None
