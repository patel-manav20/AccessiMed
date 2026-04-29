from __future__ import annotations

import re
from dataclasses import dataclass
from html import escape
from typing import Any

from bs4 import BeautifulSoup


@dataclass(frozen=True)
class RuleMetadata:
    impact: str
    severity: str
    severity_score: float
    description: str
    help_text: str
    help_url: str


RULES: dict[str, RuleMetadata] = {
    "image-alt": RuleMetadata(
        impact="critical",
        severity="Critical",
        severity_score=9.4,
        description="Images must have alternative text.",
        help_text="Add a meaningful alt attribute to every informative image.",
        help_url="https://dequeuniversity.com/rules/axe/4.7/image-alt",
    ),
    "label": RuleMetadata(
        impact="serious",
        severity="High",
        severity_score=8.1,
        description="Form controls must have associated labels.",
        help_text="Associate each form control with a visible label or accessible name.",
        help_url="https://dequeuniversity.com/rules/axe/4.7/label",
    ),
    "button-name": RuleMetadata(
        impact="serious",
        severity="High",
        severity_score=7.8,
        description="Buttons must have an accessible name.",
        help_text="Add button text or an aria-label so screen readers can identify the action.",
        help_url="https://dequeuniversity.com/rules/axe/4.7/button-name",
    ),
    "link-name": RuleMetadata(
        impact="serious",
        severity="High",
        severity_score=7.7,
        description="Links must have discernible text.",
        help_text="Add visible or programmatic link text describing the destination.",
        help_url="https://dequeuniversity.com/rules/axe/4.7/link-name",
    ),
    "html-has-lang": RuleMetadata(
        impact="moderate",
        severity="Medium",
        severity_score=4.8,
        description="The html element must have a lang attribute.",
        help_text="Set the primary page language on the html element.",
        help_url="https://dequeuniversity.com/rules/axe/4.7/html-has-lang",
    ),
    "color-contrast": RuleMetadata(
        impact="serious",
        severity="High",
        severity_score=7.5,
        description="Text must have enough color contrast.",
        help_text="Increase contrast to at least 4.5:1 for normal text.",
        help_url="https://dequeuniversity.com/rules/axe/4.7/color-contrast",
    ),
}


def metadata_for(rule_id: str) -> RuleMetadata:
    return RULES.get(
        rule_id,
        RuleMetadata(
            impact="moderate",
            severity="Medium",
            severity_score=5.0,
            description="Accessibility violation detected.",
            help_text="Review the element and update it to meet WCAG 2.1 AA.",
            help_url="https://www.w3.org/TR/WCAG21/",
        ),
    )


def parse_inline_style(style: str) -> dict[str, str]:
    output: dict[str, str] = {}
    for part in style.split(";"):
        if ":" not in part:
            continue
        key, value = part.split(":", 1)
        output[key.strip().lower()] = value.strip().lower()
    return output


def hex_to_rgb(value: str) -> tuple[int, int, int] | None:
    value = value.strip().lstrip("#")
    if len(value) == 3:
        value = "".join(character * 2 for character in value)
    if len(value) != 6 or not re.fullmatch(r"[0-9a-fA-F]{6}", value):
        return None
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def relative_luminance(rgb: tuple[int, int, int]) -> float:
    def convert(channel: int) -> float:
        scaled = channel / 255
        if scaled <= 0.03928:
            return scaled / 12.92
        return ((scaled + 0.055) / 1.055) ** 2.4

    red, green, blue = (convert(channel) for channel in rgb)
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue


def contrast_ratio(foreground: str, background: str) -> float | None:
    fg_rgb = hex_to_rgb(foreground)
    bg_rgb = hex_to_rgb(background)
    if fg_rgb is None or bg_rgb is None:
        return None
    fg_luminance = relative_luminance(fg_rgb)
    bg_luminance = relative_luminance(bg_rgb)
    lighter = max(fg_luminance, bg_luminance)
    darker = min(fg_luminance, bg_luminance)
    return (lighter + 0.05) / (darker + 0.05)


def deterministic_fix(rule_id: str, html: str) -> tuple[str, str, float]:
    soup = BeautifulSoup(html, "html.parser")
    element = soup.find()
    provider = "deterministic"
    confidence = 0.88

    if not element:
        safe_html = escape(html)
        explanation = "AccessiMed could not parse the element cleanly, so this violation needs manual review."
        return safe_html, explanation, 0.35

    if rule_id == "image-alt":
        element["alt"] = element.get("alt") or "Descriptive image text"
        explanation = "Added an alt attribute so screen readers can announce the image. Replace the placeholder text with a page-specific description before shipping."
    elif rule_id == "label":
        control_id = element.get("id") or element.get("name") or "generated-field"
        element["id"] = control_id
        label_text = "Describe this field"
        fixed_html = f'<label for="{control_id}">{label_text}</label>\n{str(element)}'
        explanation = "Wrapped the control with an associated label so assistive technology has an explicit name for the field. Update the label text to match the real form meaning."
        return fixed_html, explanation, 0.9
    elif rule_id == "button-name":
        if not element.get_text(strip=True):
            element["aria-label"] = element.get("aria-label") or "Button action"
        explanation = "Added an accessible name to the button so screen readers can announce its purpose. Replace the generic label with the actual action name if needed."
    elif rule_id == "link-name":
        if not element.get_text(strip=True):
            element["aria-label"] = element.get("aria-label") or "Link destination"
        explanation = "Added an accessible name to the link so its destination is announced to assistive technology. Use page-specific text for the strongest result."
    elif rule_id == "html-has-lang":
        element["lang"] = element.get("lang") or "en"
        explanation = "Added a lang attribute to the html element so browsers and screen readers know the primary page language."
    elif rule_id == "color-contrast":
        styles = parse_inline_style(element.get("style", ""))
        styles["color"] = "#1f2937"
        if "background-color" not in styles:
            styles["background-color"] = "#ffffff"
        element["style"] = "; ".join(f"{key}: {value}" for key, value in styles.items())
        explanation = "Strengthened the text color to improve contrast against a light background. Re-check the full page after applying the style because inherited CSS can still affect the final ratio."
    else:
        element["data-accessimed-review"] = "manual-review-required"
        explanation = "Tagged the element for manual review because this rule is outside the deterministic remediation set."
        confidence = 0.5

    return str(element), explanation, confidence


def build_prompt_payload(violation: dict[str, Any]) -> str:
    metadata = metadata_for(violation["rule_id"])
    return (
        "You are an expert accessibility engineer. Return valid JSON with keys fixed_html, explanation, confidence.\n"
        f"Rule: {violation['rule_id']}\n"
        f"Description: {metadata.description}\n"
        f"Help: {metadata.help_text}\n"
        f"Target HTML: {violation['html']}\n"
        "Keep the fix minimal and preserve functionality."
    )
