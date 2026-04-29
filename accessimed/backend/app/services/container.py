from dataclasses import dataclass

from app.core.config import Settings
from app.repositories.scans import ScanRepository
from app.services.auditor import AuditorService
from app.services.crawler import CrawlerService
from app.services.fixes import FixService
from app.services.llm import RemediationLlmService
from app.services.local_code import LocalCodeService
from app.services.reporter import ReporterService
from app.services.scan import ScanService
from app.services.workflow import ScanWorkflow


@dataclass
class ServiceContainer:
    settings: Settings

    def __post_init__(self) -> None:
        repository = ScanRepository()
        crawler = CrawlerService(self.settings)
        auditor = AuditorService(self.settings)
        reporter = ReporterService(self.settings)
        workflow = ScanWorkflow(crawler, auditor)
        llm_service = RemediationLlmService(self.settings)
        self.scan_service = ScanService(self.settings, repository, workflow, reporter)
        self.fix_service = FixService(self.settings, repository, llm_service)
        self.local_code_service = LocalCodeService(auditor, llm_service)
