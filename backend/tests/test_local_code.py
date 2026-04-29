from pathlib import Path
from shutil import copytree

from app.core.config import Settings
from app.services.auditor import AuditorService
from app.services.llm import RemediationLlmService
from app.services.local_code import LocalCodeService


def test_local_code_scan_finds_demo_issues(demo_site_root: Path):
    settings = Settings(enable_playwright=False, openai_api_key=None, anthropic_api_key=None)
    service = LocalCodeService(AuditorService(settings), RemediationLlmService(settings))
    findings = service.scan_path(demo_site_root)

    assert findings
    assert any(finding["rule_id"] == "image-alt" for finding in findings)
    assert any(finding["severity"] == "Critical" for finding in findings)
    assert all("source_file" in finding for finding in findings)


async def test_local_code_fix_apply_updates_files(tmp_path: Path, demo_site_root: Path):
    target = tmp_path / "demo-site"
    copytree(demo_site_root, target)

    settings = Settings(enable_playwright=False, openai_api_key=None, anthropic_api_key=None)
    service = LocalCodeService(AuditorService(settings), RemediationLlmService(settings))
    findings = service.scan_path(target)
    result = await service.apply_fixes(target, findings)

    assert result["patched_count"] >= 1
    updated_index = (target / "index.html").read_text(encoding="utf-8")
    assert 'aria-label="Button action"' in updated_index or 'alt="Descriptive image text"' in updated_index


async def test_local_code_apply_single_finding_updates_one_file(tmp_path: Path, demo_site_root: Path):
    target = tmp_path / "demo-site"
    copytree(demo_site_root, target)

    settings = Settings(enable_playwright=False, openai_api_key=None, anthropic_api_key=None)
    service = LocalCodeService(AuditorService(settings), RemediationLlmService(settings))
    findings = service.scan_path(target)
    original_index = (target / "index.html").read_text(encoding="utf-8")
    original_portal = (target / "portal.html").read_text(encoding="utf-8")
    original_appointments = (target / "appointments.html").read_text(encoding="utf-8")
    finding = next(
        item for item in findings if item["rule_id"] in {"button-name", "image-alt", "link-name", "html-has-lang"}
    )

    result = await service.apply_single_finding(target, int(finding["finding_index"]))

    assert result["changed"] is True
    changed_file = Path(str(result["source_file"]))
    updated_content = changed_file.read_text(encoding="utf-8")
    if changed_file.name == "index.html":
        assert updated_content != original_index
    elif changed_file.name == "portal.html":
        assert updated_content != original_portal
    else:
        assert updated_content != original_appointments
