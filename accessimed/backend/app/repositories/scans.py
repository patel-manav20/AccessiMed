from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import Fix, Scan, Violation


class ScanRepository:
    async def save_scan(self, session: AsyncSession, scan: Scan) -> Scan:
        session.add(scan)
        await session.commit()
        await session.refresh(scan)
        return scan

    async def get_scan(self, session: AsyncSession, scan_id: str) -> Scan | None:
        query = (
            select(Scan)
            .where(Scan.id == scan_id)
            .options(selectinload(Scan.violations).selectinload(Violation.fixes))
        )
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def get_violation(self, session: AsyncSession, violation_id: int) -> Violation | None:
        query = select(Violation).where(Violation.id == violation_id).options(selectinload(Violation.fixes))
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def list_scan_violations(self, session: AsyncSession, scan_id: str) -> list[Violation]:
        query = select(Violation).where(Violation.scan_id == scan_id).options(selectinload(Violation.fixes))
        result = await session.execute(query)
        return list(result.scalars().all())

    async def save_fix(self, session: AsyncSession, fix: Fix) -> Fix:
        session.add(fix)
        await session.commit()
        await session.refresh(fix)
        return fix
