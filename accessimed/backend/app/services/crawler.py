from __future__ import annotations

import logging
import re
from urllib.parse import urljoin, urlparse

import httpx
from playwright.async_api import Error as PlaywrightError
from playwright.async_api import async_playwright

from app.core.config import Settings

logger = logging.getLogger(__name__)


class CrawlerService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def crawl(self, url: str, max_pages: int) -> list[str]:
        if self.settings.enable_playwright:
            try:
                pages = await self._crawl_with_playwright(url, max_pages)
                if pages:
                    return pages
            except Exception as exc:  # pragma: no cover - exercised in integration environments
                logger.warning("Playwright crawl failed, falling back to HTTP crawl: %s", exc)
        return await self._crawl_with_http(url, max_pages)

    async def _crawl_with_playwright(self, url: str, max_pages: int) -> list[str]:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            try:
                page = await browser.new_page()
                await page.goto(url, wait_until="domcontentloaded", timeout=self.settings.request_timeout_seconds * 1000)
                hrefs = await page.eval_on_selector_all(
                    "a[href]",
                    "elements => elements.map(element => element.getAttribute('href'))",
                )
                return self._normalize_links(url, hrefs, max_pages)
            finally:
                await browser.close()

    async def _crawl_with_http(self, url: str, max_pages: int) -> list[str]:
        async with httpx.AsyncClient(timeout=self.settings.request_timeout_seconds, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
            hrefs = re.findall(r'href=["\\\']([^"\\\']+)["\\\']', response.text, flags=re.IGNORECASE)
        return self._normalize_links(url, hrefs, max_pages)

    def _normalize_links(self, root_url: str, hrefs: list[str], max_pages: int) -> list[str]:
        parsed_root = urlparse(root_url)
        allowed_netloc = parsed_root.netloc
        pages: list[str] = [root_url]
        for href in hrefs:
            normalized = urljoin(root_url, href)
            parsed = urlparse(normalized)
            if parsed.scheme not in {"http", "https"}:
                continue
            if parsed.netloc != allowed_netloc:
                continue
            clean_url = normalized.split("#", maxsplit=1)[0]
            if clean_url not in pages:
                pages.append(clean_url)
            if len(pages) >= max_pages:
                break
        return pages[:max_pages]
