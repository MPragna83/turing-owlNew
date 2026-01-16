from typing import Dict, List
from backend.core.ast_matcher import match_call

class SemanticASTEngine:
    """
    Semgrep-style semantic AST engine with deduplication.
    """

    def __init__(self, rules: List[Dict]):
        self.rules = rules

    def analyze(self, parsed_files: List[Dict]) -> List[Dict]:
        findings = []
        seen = set()

        for file in parsed_files:
            calls = file.get("calls", [])
            for rule in self.rules:
                for call in calls:
                    if not match_call(call, rule.get("match", {})):
                        continue

                    key = (
                        rule["id"],
                        file["filePath"],
                        call["line"],
                        call.get("function"),
                    )
                    if key in seen:
                        continue

                    seen.add(key)
                    findings.append({
                        "rule_id": rule["id"],
                        "title": rule["title"],
                        "severity": rule["severity"],
                        "cwe": rule.get("cwe"),
                        "category": rule.get("category"),
                        "file": file["filePath"],
                        "line": call["line"],
                        "function": call.get("function"),
                        "description": rule["description"],
                        "confidence": round(rule["confidence"] - 0.05, 2),
                        "remediation": rule.get("remediation"),
                    })

        return findings
