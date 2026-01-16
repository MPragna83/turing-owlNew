from typing import List, Dict
from collections import Counter
import hashlib


def stable_finding_id(rule_id, file, line, function):
    raw = f"{rule_id}:{file}:{line}:{function}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


class ReportingAgent:
    """
    SARIF generator with rule index caching (Semgrep-style, SaaS-grade).
    """

    def generate_sarif(self, findings: List[Dict]) -> Dict:
        rules_index = {}
        sarif_results = []

        # deterministic ordering (important for CI)
        findings = sorted(
            findings,
            key=lambda f: (f["file"], f["line"], f["rule_id"])
        )

        for f in findings:
            rid = f["rule_id"]

            if rid not in rules_index:
                rules_index[rid] = {
                    "id": rid,
                    "name": f["title"],
                    "shortDescription": {"text": f["title"]},
                    "fullDescription": {"text": f["description"]},
                    "help": {"text": f.get("remediation", "")},
                    "properties": {
                        "severity": f["severity"],
                        "cwe": f.get("cwe"),
                        "category": f.get("category"),
                    },
                }

            sarif_results.append({
                "ruleId": rid,
                "level": self._level(f["severity"]),
                "message": {"text": f["description"]},
                "locations": [{
                    "physicalLocation": {
                        "artifactLocation": {
                            "uri": f["file"]
                        },
                        "region": {
                            "startLine": f["line"]
                        }
                    }
                }],
                "properties": {
                    "confidence": f.get("confidence"),
                    "category": f.get("category"),
                    "stableId": stable_finding_id(
                        rid,
                        f["file"],
                        f["line"],
                        f.get("function"),
                    ),
                }
            })

        return {
            "version": "2.1.0",
            "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
            "runs": [{
                "tool": {
                    "driver": {
                        "name": "Turing-Owl",
                        "version": "2.4.0",
                        "rules": list(rules_index.values())
                    }
                },
                "results": sarif_results
            }]
        }

    def generate_dashboard_summary(self, findings: List[Dict]) -> Dict:
        return {
            "totalVulnerabilities": len(findings),
            "bySeverity": dict(Counter(f["severity"] for f in findings))
        }

    def _level(self, sev: str) -> str:
        return {
            "critical": "error",
            "high": "error",
            "medium": "warning",
            "low": "note",
        }.get(sev, "warning")
