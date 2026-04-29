from __future__ import annotations

from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.core.config import Settings


class ReporterService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def build_report(self, scan_id: str, url: str, findings: list[dict[str, str]]) -> Path:
        buffer = BytesIO()
        document = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),
            leftMargin=24,
            rightMargin=24,
            topMargin=24,
            bottomMargin=24,
        )
        styles = getSampleStyleSheet()
        body_style = ParagraphStyle(
            "ReportBody",
            parent=styles["BodyText"],
            fontSize=8,
            leading=10,
            wordWrap="CJK",
            spaceAfter=0,
            splitLongWords=True,
        )
        header_style = ParagraphStyle(
            "ReportHeader",
            parent=styles["BodyText"],
            fontSize=9,
            leading=11,
            textColor=colors.white,
        )

        rows = [
            [
                Paragraph("Rule", header_style),
                Paragraph("Impact", header_style),
                Paragraph("Page", header_style),
                Paragraph("Element", header_style),
            ]
        ]
        for finding in findings:
            rows.append(
                [
                    self._cell_paragraph(str(finding["rule_id"]), body_style),
                    self._cell_paragraph(str(finding["impact"]), body_style),
                    self._cell_paragraph(str(finding["page_url"]), body_style),
                    self._cell_paragraph(str(finding["target"]), body_style),
                ]
            )

        summary_table = Table(rows, repeatRows=1, colWidths=[90, 65, 250, 280])
        summary_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )

        story = [
            Paragraph("AccessiMed WCAG 2.1 AA Report", styles["Title"]),
            Spacer(1, 12),
            Paragraph(f"Scan ID: {scan_id}", styles["BodyText"]),
            Paragraph(f"Target URL: {url}", styles["BodyText"]),
            Paragraph(f"Total violations: {len(findings)}", styles["BodyText"]),
            Spacer(1, 12),
            summary_table,
        ]
        document.build(story)

        report_path = self.settings.report_dir / f"{scan_id}.pdf"
        report_path.write_bytes(buffer.getvalue())
        return report_path

    def _cell_paragraph(self, value: str, style: ParagraphStyle) -> Paragraph:
        escaped = escape(value)
        for token in ["/", "?", "&", "=", ":", ".", "_", "-", "[", "]", ")", "("]:
            escaped = escaped.replace(token, f"{token}<br/>")
        return Paragraph(escaped, style)
