from __future__ import annotations

import uuid
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.db.models import Scan, ScanStatus, Violation
from app.repositories.scans import ScanRepository
from app.schemas.requests import ScanRequest
from app.schemas.responses import FixResponse, ScanResponse, ViolationResponse
from app.services.accessibility import metadata_for
from app.services.reporter import ReporterService
from app.services.workflow import ScanWorkflow


class ScanService:
    def __init__(
        self,
        settings: Settings,
        repository: ScanRepository,
        workflow: ScanWorkflow,
        reporter: ReporterService,
    ) -> None:
        self.settings = settings
        self.repository = repository
        self.workflow = workflow
        self.reporter = reporter

    async def create_scan(self, session: AsyncSession, payload: ScanRequest) -> ScanResponse:
        scan_id = str(uuid.uuid4())
        max_pages = payload.max_pages or self.settings.max_pages
        try:
            workflow_state = await self.workflow.run(str(payload.url), max_pages)
            findings = workflow_state.get("findings", [])
            report_path = self.reporter.build_report(scan_id, str(payload.url), findings)
            scan = Scan(
                id=scan_id,
                url=str(payload.url),
                status=ScanStatus.completed.value,
                pages_scanned=len(workflow_state.get("pages", [])),
                total_violations=len(findings),
                report_path=str(report_path),
                violations=[
                    Violation(
                        scan_id=scan_id,
                        rule_id=finding["rule_id"],
                        impact=finding["impact"],
                        description=finding["description"],
                        help_text=finding["help_text"],
                        help_url=finding["help_url"],
                        html=finding["html"],
                        target=finding["target"],
                        page_url=finding["page_url"],
                    )
                    for finding in findings
                ],
            )
        except Exception as exc:
            scan = Scan(
                id=scan_id,
                url=str(payload.url),
                status=ScanStatus.failed.value,
                pages_scanned=0,
                total_violations=0,
                error_message=str(exc),
            )
        saved_scan = await self.repository.save_scan(session, scan)
        return self._serialize_scan(saved_scan)

    async def get_scan(self, session: AsyncSession, scan_id: str) -> ScanResponse | None:
        scan = await self.repository.get_scan(session, scan_id)
        if scan is None:
            return None
        return self._serialize_scan(scan)

    async def get_report_path(self, session: AsyncSession, scan_id: str) -> str | None:
        scan = await self.repository.get_scan(session, scan_id)
        if scan is None or not scan.report_path:
            return None
        report_file = Path(scan.report_path)
        if not report_file.exists():
            return None
        return str(report_file)

    def _serialize_scan(self, scan: Scan) -> ScanResponse:
        report_url = f"{self.settings.api_prefix}/scans/{scan.id}/report" if scan.report_path else None
        violations = [
            ViolationResponse(
                id=violation.id,
                rule_id=violation.rule_id,
                impact=violation.impact,
                severity=metadata_for(violation.rule_id).severity,
                severity_score=metadata_for(violation.rule_id).severity_score,
                description=violation.description,
                help_text=violation.help_text,
                help_url=violation.help_url,
                html=violation.html,
                target=violation.target,
                page_url=violation.page_url,
                fixes=[
                    FixResponse(
                        id=fix.id,
                        provider=fix.provider,
                        original_html=fix.original_html,
                        fixed_html=fix.fixed_html,
                        explanation=fix.explanation,
                        confidence=fix.confidence,
                        created_at=fix.created_at,
                    )
                    for fix in violation.fixes
                ],
            )
            for violation in scan.violations
        ]
        return ScanResponse(
            id=scan.id,
            url=scan.url,
            status=scan.status,
            pages_scanned=scan.pages_scanned,
            total_violations=scan.total_violations,
            error_message=scan.error_message,
            report_url=report_url,
            created_at=scan.created_at,
            updated_at=scan.updated_at,
            violations=violations,
        )
