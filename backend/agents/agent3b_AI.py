import os
from typing import List, Dict
from openai import OpenAI


class FixGenerationAgent3B:
    """
    Agent-3B (Advisory)
    LLM-based fix generation.
    NEVER authoritative.
    """

    MAX_FIX_LENGTH = 800

    def __init__(self):
        self.enabled = os.getenv("TURING_OWL_LLM") == "1"
        self.client = (
            OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            if self.enabled else None
        )

    def generate_fixes(self, findings: List[Dict]) -> List[Dict]:
        if not self.client:
            return findings

        enhanced = []

        for v in findings:
            item = dict(v)  # COPY (important)

            if not item.get("validated"):
                enhanced.append(item)
                continue

            try:
                fix = self._generate_fix(item)

                if fix and len(fix) <= self.MAX_FIX_LENGTH:
                    item["generatedFix"] = fix
                    item["fixType"] = "llm"
                    item["fixConfidence"] = 0.9
                else:
                    raise ValueError("Invalid fix")

            except Exception:
                item["generatedFix"] = self._fallback_fix(item)
                item["fixType"] = "fallback"
                item["fixConfidence"] = 0.6

            enhanced.append(item)

        return enhanced

    def _generate_fix(self, v: Dict) -> str:
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Output ONLY secure code.\n"
                        "Minimal change.\n"
                        "No explanation.\n"
                    )
                },
                {
                    "role": "user",
                    "content": f"""
CWE: {v.get("cwe")}
Vulnerable pattern detected.
Generate a secure fix.
"""
                }
            ],
            timeout=15
        )

        return response.choices[0].message.content.strip()

    def _fallback_fix(self, v: Dict) -> str:
        fixes = {
            "CWE-89": "Use parameterized SQL queries.",
            "CWE-79": "Escape output before rendering.",
            "CWE-798": "Move secrets to environment variables.",
            "CWE-77": "Avoid executing user input.",
            "CWE-22": "Normalize and validate file paths."
        }
        return fixes.get(v.get("cwe"), "Apply secure coding practices.")
