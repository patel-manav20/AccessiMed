from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from app.services.auditor import AuditorService
from app.services.llm import RemediationLlmService
from app.services.accessibility import deterministic_fix


class LocalCodeService:
    def __init__(self, auditor: AuditorService, llm_service: RemediationLlmService) -> None:
        self.auditor = auditor
        self.llm_service = llm_service

    def scan_path(self, root: Path) -> list[dict[str, str | float]]:
        findings: list[dict[str, str | float]] = []
        for file_path in sorted(root.rglob("*.html")):
            html = file_path.read_text(encoding="utf-8")
            file_findings = self.auditor.audit_html_content(html, file_path.as_posix())
            for finding in file_findings:
                finding["source_file"] = file_path.as_posix()
            findings.extend(file_findings)
        for index, finding in enumerate(findings, start=1):
            finding["finding_index"] = index
        return findings

    async def generate_fix(self, finding: dict[str, str | float]) -> dict[str, str | float]:
        try:
            provider, fixed_html, explanation, confidence = await self.llm_service.generate_fix(finding)
        except Exception:
            fixed_html, explanation, confidence = deterministic_fix(str(finding["rule_id"]), str(finding["html"]))
            provider = "deterministic"
        return {
            "provider": provider,
            "fixed_html": fixed_html,
            "explanation": explanation,
            "confidence": confidence,
        }

    async def apply_single_finding(self, root: Path, finding_index: int) -> dict[str, object]:
        findings = self.scan_path(root)
        finding = next((item for item in findings if item["finding_index"] == finding_index), None)
        if finding is None:
            raise ValueError(f"Finding {finding_index} not found.")
        return await self.apply_finding(finding)

    async def apply_finding(self, finding: dict[str, str | float]) -> dict[str, object]:
        source_file = Path(str(finding["source_file"]))
        content = source_file.read_text(encoding="utf-8")
        fix = await self.generate_fix(finding)
        original_html = str(finding["html"])

        result: dict[str, object] = {
            "finding_index": finding["finding_index"],
            "source_file": source_file.as_posix(),
            "changed": False,
            "skipped_reason": None,
            "fix": fix,
        }

        if fix["fixed_html"] == original_html:
            result["skipped_reason"] = "Generated fix did not change the source snippet."
            return result

        if content.count(original_html) == 1:
            updated = content.replace(original_html, str(fix["fixed_html"]), 1)
        else:
            updated = self._apply_with_fallback(content, finding, str(fix["fixed_html"]))
            if updated is None:
                result["skipped_reason"] = "Exact-match replacement was ambiguous in this file."
                return result

        if updated == content:
            result["skipped_reason"] = "No file content changed after applying the fix."
            return result

        source_file.write_text(updated, encoding="utf-8")
        result["changed"] = True
        return result

    async def apply_fixes(self, root: Path, findings: list[dict[str, str | float]]) -> dict[str, list[str] | int]:
        patched_files: set[str] = set()
        skipped: list[str] = []
        for finding in findings:
            result = await self.apply_finding(finding)
            if result["changed"]:
                patched_files.add(str(result["source_file"]))
            else:
                skipped.append(f"{result['source_file']}:{finding['rule_id']}")

        return {
            "patched_files": sorted(patched_files),
            "skipped": sorted(skipped),
            "patched_count": len(patched_files),
        }

    def _apply_with_fallback(
        self,
        content: str,
        finding: dict[str, str | float],
        fixed_html: str,
    ) -> str | None:
        rule_id = str(finding["rule_id"])

        if rule_id == "html-has-lang":
            return self._apply_html_lang(content)
        if rule_id == "image-alt":
            return self._apply_image_alt(content, str(finding["html"]))
        if rule_id == "button-name":
            return self._apply_button_name(content)
        if rule_id == "link-name":
            return self._apply_link_name(content, str(finding["html"]))
        if rule_id == "label":
            return self._apply_label(content, str(finding["html"]), fixed_html)
        return None

    def _apply_html_lang(self, content: str) -> str | None:
        match = re.search(r"<html(?P<attrs>[^>]*)>", content, flags=re.IGNORECASE)
        if not match or re.search(r"\blang\s*=", match.group("attrs"), flags=re.IGNORECASE):
            return None
        attrs = match.group("attrs")
        replacement = f'<html{attrs} lang="en">'
        return content[: match.start()] + replacement + content[match.end() :]

    def _apply_image_alt(self, content: str, original_html: str) -> str | None:
        snippet = BeautifulSoup(original_html, "html.parser").find("img")
        if snippet is None:
            return None
        src = snippet.get("src")
        alt_text = BeautifulSoup(snippet.decode(), "html.parser").find("img")
        fixed = BeautifulSoup(original_html, "html.parser").find("img")
        if fixed is None:
            return None
        fixed["alt"] = fixed.get("alt") or "Descriptive image text"
        replacement = str(fixed)

        if src:
            pattern = re.compile(
                rf"<img(?P<attrs>[^>]*\bsrc=[\"']{re.escape(src)}[\"'][^>]*)>",
                flags=re.IGNORECASE,
            )
            match = pattern.search(content)
            if match and "alt=" not in match.group("attrs").lower():
                return content[: match.start()] + replacement + content[match.end() :]

        pattern = re.compile(r"<img(?P<attrs>[^>]*)>", flags=re.IGNORECASE)
        for match in pattern.finditer(content):
            if "alt=" not in match.group("attrs").lower():
                return content[: match.start()] + replacement + content[match.end() :]
        return None

    def _apply_button_name(self, content: str) -> str | None:
        pattern = re.compile(r"<button(?P<attrs>[^>]*)>\s*</button>", flags=re.IGNORECASE | re.DOTALL)
        match = pattern.search(content)
        if not match or "aria-label=" in match.group("attrs").lower():
            return None
        replacement = f'<button{match.group("attrs")} aria-label="Button action"></button>'
        return content[: match.start()] + replacement + content[match.end() :]

    def _apply_link_name(self, content: str, original_html: str) -> str | None:
        snippet = BeautifulSoup(original_html, "html.parser").find("a")
        if snippet is None:
            return None
        href = snippet.get("href")

        if href:
            pattern = re.compile(
                rf"<a(?P<attrs>[^>]*\bhref=[\"']{re.escape(href)}[\"'][^>]*)>\s*</a>",
                flags=re.IGNORECASE | re.DOTALL,
            )
            match = pattern.search(content)
            if match and "aria-label=" not in match.group("attrs").lower():
                replacement = f'<a{match.group("attrs")} aria-label="Link destination"></a>'
                return content[: match.start()] + replacement + content[match.end() :]

        pattern = re.compile(r"<a(?P<attrs>[^>]*)>\s*</a>", flags=re.IGNORECASE | re.DOTALL)
        match = pattern.search(content)
        if match and "aria-label=" not in match.group("attrs").lower():
            replacement = f'<a{match.group("attrs")} aria-label="Link destination"></a>'
            return content[: match.start()] + replacement + content[match.end() :]
        return None

    def _apply_label(self, content: str, original_html: str, fixed_html: str) -> str | None:
        if content.count(original_html) == 1:
            return content.replace(original_html, fixed_html, 1)
        snippet = BeautifulSoup(original_html, "html.parser").find()
        if snippet is None:
            return None
        name = snippet.get("name")
        if not name:
            return None
        pattern = re.compile(
            rf"<(?P<tag>input|textarea|select)(?P<attrs>[^>]*\bname=[\"']{re.escape(name)}[\"'][^>]*)>(?P<body>.*?)</(?P=tag)>|<(?P<selftag>input)(?P<selfattrs>[^>]*\bname=[\"']{re.escape(name)}[\"'][^>]*)>",
            flags=re.IGNORECASE | re.DOTALL,
        )
        match = pattern.search(content)
        if not match:
            return None
        return content[: match.start()] + fixed_html + content[match.end() :]
