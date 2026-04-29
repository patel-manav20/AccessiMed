from pathlib import Path

from app.core.user_config import CliConfig, load_cli_config, render_default_config


def test_load_cli_config_defaults_when_missing(tmp_path: Path):
    config, config_path = load_cli_config(tmp_path / ".accessimed.toml")

    assert config == CliConfig()
    assert config_path == tmp_path / ".accessimed.toml"


def test_load_cli_config_reads_values(tmp_path: Path):
    root = tmp_path / "site"
    config_path = tmp_path / ".accessimed.toml"
    config_path.write_text(
        (
            "[accessimed]\n"
            f'root = "{root}"\n'
            'remediation_provider = "anthropic"\n\n'
            "[scanning]\n"
            "max_pages = 7\n"
            "enable_playwright = false\n\n"
            "[providers]\n"
            'openai_model = "gpt-5"\n'
        ),
        encoding="utf-8",
    )

    config, resolved = load_cli_config(config_path)

    assert resolved == config_path
    assert config.root == root.resolve()
    assert config.remediation_provider == "anthropic"
    assert config.max_pages == 7
    assert config.enable_playwright is False
    assert config.openai_model == "gpt-5"


def test_render_default_config_mentions_local_mode(tmp_path: Path):
    rendered = render_default_config(tmp_path)

    assert 'remediation_provider = "local"' in rendered
    assert str(tmp_path) in rendered
