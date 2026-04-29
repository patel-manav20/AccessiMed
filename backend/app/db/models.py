from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class ScanStatus(str, Enum):
    completed = "completed"
    failed = "failed"


class Scan(Base):
    __tablename__ = "scans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default=ScanStatus.completed.value)
    pages_scanned: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_violations: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    report_path: Mapped[str | None] = mapped_column(String(2048))
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    violations: Mapped[list["Violation"]] = relationship(
        back_populates="scan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Violation(Base):
    __tablename__ = "violations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scan_id: Mapped[str] = mapped_column(ForeignKey("scans.id", ondelete="CASCADE"), index=True)
    rule_id: Mapped[str] = mapped_column(String(128), index=True)
    impact: Mapped[str] = mapped_column(String(32), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    help_text: Mapped[str] = mapped_column(Text, nullable=False)
    help_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    html: Mapped[str] = mapped_column(Text, nullable=False)
    target: Mapped[str] = mapped_column(Text, nullable=False)
    page_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    scan: Mapped["Scan"] = relationship(back_populates="violations")
    fixes: Mapped[list["Fix"]] = relationship(back_populates="violation", cascade="all, delete-orphan", lazy="selectin")


class Fix(Base):
    __tablename__ = "fixes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    violation_id: Mapped[int] = mapped_column(ForeignKey("violations.id", ondelete="CASCADE"), index=True)
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    original_html: Mapped[str] = mapped_column(Text, nullable=False)
    fixed_html: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.8)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    violation: Mapped["Violation"] = relationship(back_populates="fixes")
