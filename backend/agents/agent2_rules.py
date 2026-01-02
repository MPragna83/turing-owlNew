from typing import Dict, List

MIN_CONFIDENCE = 0.75


class RuleEngineAgent:
    """
    Executes TAINT-based rules ONLY.
    Semantic rules handled separately.
    """

    def __init__(self, rules: List[Dict]):
        self.rules = rules

    # ======================
    # ANALYZE
    # ======================
    def analyze(self, parsed_files: List[Dict]) -> List[Dict]:
        findings: List[Dict] = []

        for file in parsed_files:
            flows = file.get("taint", {}).get("flows", [])
            if not flows:
                continue

            for rule in self.rules:
                for flow in flows:
                    if not self._match(rule, flow):
                        continue

                    confidence = self._confidence(rule, flow)
                    if confidence < MIN_CONFIDENCE:
                        continue

                    findings.append(
                        self._emit(rule, file, flow, confidence)
                    )

        return findings

    # ======================
    # MATCHING
    # ======================
    def _match(self, rule: Dict, flow: Dict) -> bool:
        if flow["source"] not in rule.get("sources", []):
            return False

        if flow["sink"] not in rule.get("sinks", []):
            return False

        sanitizers = rule.get("sanitizers", [])
        if sanitizers and any(s in flow.get("path", []) for s in sanitizers):
            return False

        return True

    # ======================
    # CONFIDENCE
    # ======================
    def _confidence(self, rule: Dict, flow: Dict) -> float:
        confidence = rule["confidence"]

        if not flow.get("function"):
            confidence -= 0.05

        return round(max(0.0, confidence), 2)

    # ======================
    # OUTPUT
    # ======================
    def _emit(
        self,
        rule: Dict,
        file: Dict,
        flow: Dict,
        confidence: float
    ) -> Dict:
        return {
            "rule_id": rule["id"],
            "title": rule["title"],
            "severity": rule["severity"],
            "cwe": rule.get("cwe"),
            "category": rule.get("category"),
            "file": file["filePath"],
            "line": flow["line"],
            "function": flow.get("function"),
            "description": rule["description"],
            "confidence": confidence,
            "remediation": rule.get("remediation"),
        }
