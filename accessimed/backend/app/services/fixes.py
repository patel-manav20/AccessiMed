from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.db.models import Fix
from app.repositories.scans import ScanRepository
from app.schemas.requests import BulkFixRequest
from app.schemas.responses import BulkFixResponse, FixResponse, SingleFixResponse
from app.services.accessibility import deterministic_fix
from app.services.llm import RemediationLlmService


class FixService:
    def __init__(
        self,
        settings: Settings,
        repository: ScanRepository,
        llm_service: RemediationLlmService,
    ) -> None:
        self.settings = settings
        self.repository = repository
        self.llm_service = llm_service

    async def create_single_fix(self, session: AsyncSession, violation_id: int) -> SingleFixResponse | None:
        violation = await self.repository.get_violation(session, violation_id)
        if violation is None:
            return None
        if violation.fixes:
            latest_fix = sorted(
                violation.fixes,
                key=lambda existing_fix: (existing_fix.created_at is not None, existing_fix.id),
            )[-1]
            return SingleFixResponse(
                violation_id=violation.id,
                fix=self._serialize_fix(latest_fix),
            )

        provider, fixed_html, explanation, confidence = await self._generate_fix(
            {
                "rule_id": violation.rule_id,
                "html": violation.html,
                "target": violation.target,
            }
        )
        fix = Fix(
            violation_id=violation.id,
            provider=provider,
            original_html=violation.html,
            fixed_html=fixed_html,
            explanation=explanation,
            confidence=confidence,
        )
        saved_fix = await self.repository.save_fix(session, fix)
        return SingleFixResponse(
            violation_id=violation.id,
            fix=self._serialize_fix(saved_fix),
        )

    async def create_bulk_fixes(self, session: AsyncSession, payload: BulkFixRequest) -> BulkFixResponse:
        violations = await self.repository.list_scan_violations(session, payload.scan_id)
        fixes: list[SingleFixResponse] = []
        for violation in violations:
            response = await self.create_single_fix(session, violation.id)
            if response is not None:
                fixes.append(response)

        return BulkFixResponse(
            scan_id=payload.scan_id,
            fixes=fixes,
        )

    async def _generate_fix(self, violation: dict[str, str]) -> tuple[str, str, str, float]:
        try:
            return await self.llm_service.generate_fix(violation)
        except Exception:
            pass

        fixed_html, explanation, confidence = deterministic_fix(violation["rule_id"], violation["html"])
        return "deterministic", fixed_html, explanation, confidence

    def _serialize_fix(self, fix: Fix) -> FixResponse:
        created_at = fix.created_at or datetime.now(UTC)
        return FixResponse(
            id=fix.id,
            provider=fix.provider,
            original_html=fix.original_html,
            fixed_html=fix.fixed_html,
            explanation=fix.explanation,
            confidence=fix.confidence,
            created_at=created_at,
        )
