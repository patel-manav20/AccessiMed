from __future__ import annotations

from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from app.services.auditor import AuditorService
from app.services.crawler import CrawlerService


class ScanState(TypedDict, total=False):
    url: str
    max_pages: int
    pages: list[str]
    findings: list[dict]


class ScanWorkflow:
    def __init__(self, crawler: CrawlerService, auditor: AuditorService) -> None:
        self.crawler = crawler
        self.auditor = auditor
        graph = StateGraph(ScanState)
        graph.add_node("crawl", self._crawl)
        graph.add_node("audit", self._audit)
        graph.add_edge(START, "crawl")
        graph.add_edge("crawl", "audit")
        graph.add_edge("audit", END)
        self._compiled = graph.compile()

    async def run(self, url: str, max_pages: int) -> ScanState:
        return await self._compiled.ainvoke({"url": url, "max_pages": max_pages})

    async def _crawl(self, state: ScanState) -> ScanState:
        pages = await self.crawler.crawl(state["url"], state["max_pages"])
        return {"pages": pages}

    async def _audit(self, state: ScanState) -> ScanState:
        findings = await self.auditor.audit_pages(state["pages"])
        return {"findings": findings}
