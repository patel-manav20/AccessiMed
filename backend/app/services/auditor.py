from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

from app.core.config import Settings
from app.services.accessibility import contrast_ratio, metadata_for, parse_inline_style

logger = logging.getLogger(__name__)

AXE_SCRIPT_URL = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js"


class AuditorService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def audit_pages(self, pages: list[str]) -> list[dict[str, Any]]:
        findings_by_page = await asyncio.gather(*(self.audit_page(page_url) for page_url in pages))
        return [finding for page_findings in findings_by_page for finding in page_findings]

    async def audit_page(self, page_url: str) -> list[dict[str, Any]]:
        if self.settings.enable_playwright:
            try:
                findings = await self._audit_with_playwright(page_url)
                if findings:
                    return findings
            except Exception as exc:  # pragma: no cover - exercised in integration environments
                logger.warning("axe-core audit failed, falling back to heuristic audit: %s", exc)
        return await self._audit_with_heuristics(page_url)

    async def _audit_with_playwright(self, page_url: str) -> list[dict[str, Any]]:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            try:
                page = await browser.new_page()
                await page.goto(page_url, wait_until="networkidle", timeout=self.settings.request_timeout_seconds * 1000)
                await page.add_script_tag(url=AXE_SCRIPT_URL)
                result = await page.evaluate(
                    """
                    async () => {
                      return await axe.run(document, {
                        runOnly: {
                          type: 'tag',
                          values: ['wcag2a', 'wcag2aa']
                        }
                      });
                    }
                    """
                )
                findings: list[dict[str, Any]] = []
                for violation in result["violations"]:
                    metadata = metadata_for(violation["id"])
                    for node in violation["nodes"]:
                        findings.append(
                            {
                                "rule_id": violation["id"],
                                "impact": violation.get("impact") or metadata.impact,
                                "severity": metadata.severity,
                                "severity_score": metadata.severity_score,
                                "description": violation.get("description") or metadata.description,
                                "help_text": violation.get("help") or metadata.help_text,
                                "help_url": violation.get("helpUrl") or metadata.help_url,
                                "html": node.get("html", ""),
                                "target": ", ".join(node.get("target", [])) or "document",
                                "page_url": page_url,
                            }
                        )
                return findings
            finally:
                await browser.close()

    async def _audit_with_heuristics(self, page_url: str) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(timeout=self.settings.request_timeout_seconds, follow_redirects=True) as client:
            response = await client.get(page_url)
            response.raise_for_status()
            html = response.text
        return self.audit_html_content(html, page_url)

    def audit_html_content(self, html: str, page_url: str) -> list[dict[str, Any]]:
        soup = BeautifulSoup(html, "html.parser")
        findings: list[dict[str, Any]] = []

        html_tag = soup.find("html")
        if html_tag and not html_tag.get("lang"):
            findings.append(self._make_finding("html-has-lang", str(html_tag), "html", page_url))

        for image in soup.find_all("img"):
            if image.get("alt") is None:
                findings.append(self._make_finding("image-alt", str(image), self._target_for(image), page_url))

        for control in soup.find_all(["input", "select", "textarea"]):
            if control.get("type") == "hidden":
                continue
            if not self._has_label(soup, control):
                findings.append(self._make_finding("label", str(control), self._target_for(control), page_url))

        for button in soup.find_all("button"):
            if not button.get_text(strip=True) and not button.get("aria-label"):
                findings.append(self._make_finding("button-name", str(button), self._target_for(button), page_url))

        for link in soup.find_all("a"):
            if link.get_text(strip=True):
                continue
            has_named_image = any(image.get("alt") for image in link.find_all("img"))
            if not has_named_image and not link.get("aria-label"):
                findings.append(self._make_finding("link-name", str(link), self._target_for(link), page_url))

        for element in soup.find_all(["p", "span", "div", "a", "button", "label"]):
            style = parse_inline_style(element.get("style", ""))
            if "color" not in style:
                continue
            background = style.get("background-color", "#ffffff")
            ratio = contrast_ratio(style["color"], background)
            if ratio is not None and ratio < 4.5 and element.get_text(strip=True):
                findings.append(self._make_finding("color-contrast", str(element), self._target_for(element), page_url))

        return findings

    def _make_finding(self, rule_id: str, html: str, target: str, page_url: str) -> dict[str, Any]:
        metadata = metadata_for(rule_id)
        return {
            "rule_id": rule_id,
            "impact": metadata.impact,
            "severity": metadata.severity,
            "severity_score": metadata.severity_score,
            "description": metadata.description,
            "help_text": metadata.help_text,
            "help_url": metadata.help_url,
            "html": html,
            "target": target,
            "page_url": page_url,
        }

    def _target_for(self, element: Any) -> str:
        if element.get("id"):
            return f"#{element['id']}"
        return element.name

    def _has_label(self, soup: BeautifulSoup, control: Any) -> bool:
        if control.get("aria-label") or control.get("aria-labelledby") or control.get("title"):
            return True
        if control.find_parent("label") is not None:
            return True
        control_id = control.get("id")
        if control_id and soup.find("label", attrs={"for": control_id}) is not None:
            return True
        return False
