from datetime import datetime

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


class FixResponse(BaseModel):
    id: int
    provider: str
    original_html: str
    fixed_html: str
    explanation: str
    confidence: float
    created_at: datetime | None = None


class ViolationResponse(BaseModel):
    id: int
    rule_id: str
    impact: str
    severity: str
    severity_score: float
    description: str
    help_text: str
    help_url: str
    html: str
    target: str
    page_url: str
    source_file: str | None = None
    fixes: list[FixResponse] = []


class ScanResponse(BaseModel):
    id: str
    url: str
    status: str
    pages_scanned: int
    total_violations: int
    error_message: str | None = None
    report_url: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    violations: list[ViolationResponse] = []


class SingleFixResponse(BaseModel):
    violation_id: int
    fix: FixResponse


class BulkFixResponse(BaseModel):
    scan_id: str
    fixes: list[SingleFixResponse]


class LocalCodeFindingResponse(BaseModel):
    finding_index: int
    rule_id: str
    impact: str
    severity: str
    severity_score: float
    description: str
    help_text: str
    help_url: str
    html: str
    target: str
    page_url: str
    source_file: str


class LocalCodeScanResponse(BaseModel):
    path: str
    findings_count: int
    findings: list[LocalCodeFindingResponse]


class LocalCodeFixResponse(BaseModel):
    provider: str
    fixed_html: str
    explanation: str
    confidence: float


class LocalCodeApplyResponse(BaseModel):
    path: str
    finding_index: int
    changed: bool
    source_file: str
    skipped_reason: str | None = None
    fix: LocalCodeFixResponse
