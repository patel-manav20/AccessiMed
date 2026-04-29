from __future__ import annotations

import asyncio
import json
from typing import Any

from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

from app.core.config import Settings
from app.services.accessibility import build_prompt_payload


class RemediationLlmService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None
        self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    async def generate_fix(self, violation: dict[str, Any]) -> tuple[str, str, str, float]:
        provider_mode = (self.settings.remediation_provider or "auto").lower()

        if provider_mode == "local":
            raise RuntimeError("Local remediation mode selected; skip LLM provider calls.")

        if provider_mode == "openai":
            if not self.openai_client:
                raise RuntimeError("OpenAI remediation requested but no OpenAI API key is configured.")
            for _ in range(2):
                try:
                    return await self._generate_with_openai(violation)
                except Exception:
                    await asyncio.sleep(0.4)
            raise RuntimeError("OpenAI remediation failed.")

        if provider_mode == "anthropic":
            if not self.anthropic_client:
                raise RuntimeError("Anthropic remediation requested but no Anthropic API key is configured.")
            for _ in range(2):
                try:
                    return await self._generate_with_anthropic(violation)
                except Exception:
                    await asyncio.sleep(0.4)
            raise RuntimeError("Anthropic remediation failed.")

        if self.openai_client:
            for _ in range(2):
                try:
                    return await self._generate_with_openai(violation)
                except Exception:
                    await asyncio.sleep(0.4)

        if self.anthropic_client:
            for _ in range(2):
                try:
                    return await self._generate_with_anthropic(violation)
                except Exception:
                    await asyncio.sleep(0.4)

        raise RuntimeError("No configured LLM provider succeeded.")

    async def _generate_with_anthropic(self, violation: dict[str, Any]) -> tuple[str, str, str, float]:
        message = await self.anthropic_client.messages.create(
            model=self.settings.anthropic_model,
            max_tokens=600,
            temperature=0,
            messages=[{"role": "user", "content": build_prompt_payload(violation)}],
        )
        content = "".join(block.text for block in message.content if hasattr(block, "text"))
        payload = self._parse_json_payload(content)
        return (
            "anthropic",
            payload["fixed_html"],
            payload["explanation"],
            float(payload.get("confidence", 0.9)),
        )

    async def _generate_with_openai(self, violation: dict[str, Any]) -> tuple[str, str, str, float]:
        response = await self.openai_client.responses.create(
            model=self.settings.openai_model,
            instructions="Return only valid JSON with keys fixed_html, explanation, confidence.",
            input=[
                {
                    "role": "user",
                    "content": build_prompt_payload(violation),
                }
            ],
            max_output_tokens=400,
        )
        if not response.output_text.strip():
            raise ValueError("OpenAI returned empty output_text.")
        payload = self._parse_json_payload(response.output_text)
        return (
            "openai",
            payload["fixed_html"],
            payload["explanation"],
            float(payload.get("confidence", 0.9)),
        )

    def _parse_json_payload(self, content: str) -> dict[str, Any]:
        stripped = content.strip()
        if stripped.startswith("```"):
            lines = stripped.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            stripped = "\n".join(lines).strip()

        if not stripped.startswith("{"):
            start = stripped.find("{")
            end = stripped.rfind("}")
            if start != -1 and end != -1 and end > start:
                stripped = stripped[start:end + 1]

        return json.loads(stripped)
